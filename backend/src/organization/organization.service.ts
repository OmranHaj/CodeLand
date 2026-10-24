import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationJoinRequest, OrganizationJoinStatus, Role, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

type RequestWithOrganization = OrganizationJoinRequest & { organization: { name: string | null } };

/**
 * Organizations are users with role PARENT (schools, universities, teachers); their parentCode is the
 * organization code. A student joins by sending a request that the organization accepts or rejects;
 * accepting sets the student's parentId, which is what the organization dashboard already reads.
 */
@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  /** "cl-ab12cd34 " → "AB12CD34" (codes are shown with an optional CL- prefix). */
  private normalizeCode(code: string): string {
    return code.trim().toUpperCase().replace(/^CL-/, '');
  }

  private toStudentView(request: RequestWithOrganization) {
    return {
      id: request.id,
      status: request.status,
      organizationId: request.organizationId,
      organizationName: request.organization.name,
      createdAt: request.createdAt,
      decidedAt: request.decidedAt,
    };
  }

  /** The student's current organization (if any) and their latest join request. */
  async getMembership(studentId: string) {
    const [student, latest] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: { parent: { select: { id: true, name: true } } },
      }),
      this.prisma.organizationJoinRequest.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        include: { organization: { select: { name: true } } },
      }),
    ]);

    return {
      organization: student?.parent ? { id: student.parent.id, name: student.parent.name } : null,
      request: latest ? this.toStudentView(latest) : null,
    };
  }

  /** A student asks to join the organization that owns `code`. */
  async requestToJoin(studentId: string, code: string) {
    const organization = await this.prisma.user.findFirst({
      where: { parentCode: this.normalizeCode(code), role: Role.PARENT, status: UserStatus.ACTIVE },
      select: { id: true, name: true },
    });

    if (!organization) {
      throw new NotFoundException('No organization was found with this code. Please check it and try again.');
    }

    const request = await this.prisma.$transaction(async (tx) => {
      // One request decision per student at a time, even with double clicks.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`org-join:${studentId}`}))`;

      const student = await tx.user.findUnique({ where: { id: studentId }, select: { parentId: true } });
      if (student?.parentId === organization.id) {
        throw new ConflictException('You are already a member of this organization.');
      }
      if (student?.parentId) {
        throw new ConflictException('You already belong to an organization.');
      }

      const pending = await tx.organizationJoinRequest.findFirst({
        where: { studentId, status: OrganizationJoinStatus.PENDING },
      });
      if (pending?.organizationId === organization.id) {
        throw new ConflictException('Your request to this organization is already waiting for approval.');
      }
      if (pending) {
        // A new code replaces an earlier request that is still waiting.
        await tx.organizationJoinRequest.delete({ where: { id: pending.id } });
      }

      return tx.organizationJoinRequest.create({
        data: { studentId, organizationId: organization.id },
        include: { organization: { select: { name: true } } },
      });
    });

    return {
      success: true,
      message: `Your request was sent to ${organization.name || 'the organization'}.`,
      request: this.toStudentView(request),
    };
  }

  /** Pending requests waiting for this organization's decision. */
  async listPendingRequests(organizationId: string) {
    const requests = await this.prisma.organizationJoinRequest.findMany({
      where: { organizationId, status: OrganizationJoinStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      include: { student: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    return {
      count: requests.length,
      requests: requests.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        student: r.student,
      })),
    };
  }

  /** Accepts or rejects one of this organization's pending requests. */
  async decide(organizationId: string, requestId: string, accept: boolean) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.organizationJoinRequest.findUnique({ where: { id: requestId } });
      if (!request || request.organizationId !== organizationId) {
        throw new NotFoundException('Join request not found.');
      }

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`org-join:${request.studentId}`}))`;

      if (accept) {
        const student = await tx.user.findUnique({ where: { id: request.studentId }, select: { parentId: true } });
        if (student?.parentId && student.parentId !== organizationId) {
          throw new ConflictException('This student already joined another organization.');
        }
      }

      const status = accept ? OrganizationJoinStatus.ACCEPTED : OrganizationJoinStatus.REJECTED;
      const updated = await tx.organizationJoinRequest.updateMany({
        where: { id: requestId, status: OrganizationJoinStatus.PENDING },
        data: { status, decidedAt: new Date() },
      });
      if (updated.count === 0) {
        throw new ConflictException('This request was already handled.');
      }

      if (accept) {
        await tx.user.update({ where: { id: request.studentId }, data: { parentId: organizationId } });
      }

      return { success: true, id: requestId, status };
    });
  }
}
