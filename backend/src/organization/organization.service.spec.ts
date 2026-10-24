import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrganizationService } from './organization.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('OrganizationService', () => {
  let service: OrganizationService;
  let prisma: any;

  const org = { id: 'org-1', name: 'Al Noor School' };

  beforeEach(() => {
    prisma = {
      $executeRaw: vi.fn().mockResolvedValue(0),
      user: {
        findFirst: vi.fn().mockResolvedValue(org),
        findUnique: vi.fn().mockResolvedValue({ parentId: null }),
        update: vi.fn(),
      },
      organizationJoinRequest: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn(),
        delete: vi.fn(),
        create: vi.fn().mockImplementation(async ({ data }: any) => ({
          id: 'req-new',
          status: 'PENDING',
          createdAt: new Date(),
          decidedAt: null,
          organization: { name: org.name },
          ...data,
        })),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma.$transaction = vi.fn(async (work: (tx: any) => Promise<unknown>) => work(prisma));
    service = new OrganizationService(prisma as PrismaService);
  });

  describe('requestToJoin', () => {
    it('finds the organization by its code (case and CL- prefix ignored) and creates a pending request', async () => {
      const res = await service.requestToJoin('stu-1', '  cl-ab12cd34 ');

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ parentCode: 'AB12CD34', role: 'PARENT' }) }),
      );
      expect(prisma.organizationJoinRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { studentId: 'stu-1', organizationId: 'org-1' } }),
      );
      expect(res.request).toMatchObject({ status: 'PENDING', organizationName: 'Al Noor School' });
      // The student is not linked until the organization accepts.
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejects an unknown code without revealing anything about organizations', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.requestToJoin('stu-1', 'NOPE1234')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.organizationJoinRequest.create).not.toHaveBeenCalled();
    });

    it('refuses when the student is already a member of this or another organization', async () => {
      prisma.user.findUnique.mockResolvedValue({ parentId: 'org-1' });
      await expect(service.requestToJoin('stu-1', 'AB12CD34')).rejects.toThrow('already a member');

      prisma.user.findUnique.mockResolvedValue({ parentId: 'org-2' });
      await expect(service.requestToJoin('stu-1', 'AB12CD34')).rejects.toThrow('already belong');
      expect(prisma.organizationJoinRequest.create).not.toHaveBeenCalled();
    });

    it('refuses a duplicate pending request to the same organization', async () => {
      prisma.organizationJoinRequest.findFirst.mockResolvedValue({ id: 'req-old', organizationId: 'org-1' });
      await expect(service.requestToJoin('stu-1', 'AB12CD34')).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.organizationJoinRequest.create).not.toHaveBeenCalled();
    });

    it('replaces a pending request to a different organization', async () => {
      prisma.organizationJoinRequest.findFirst.mockResolvedValue({ id: 'req-old', organizationId: 'org-2' });
      await service.requestToJoin('stu-1', 'AB12CD34');

      expect(prisma.organizationJoinRequest.delete).toHaveBeenCalledWith({ where: { id: 'req-old' } });
      expect(prisma.organizationJoinRequest.create).toHaveBeenCalled();
    });
  });

  describe('decide', () => {
    const pending = { id: 'req-1', organizationId: 'org-1', studentId: 'stu-1', status: 'PENDING' };

    it('accepting links the student to the organization', async () => {
      prisma.organizationJoinRequest.findUnique.mockResolvedValue(pending);

      const res = await service.decide('org-1', 'req-1', true);

      expect(res.status).toBe('ACCEPTED');
      expect(prisma.organizationJoinRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'req-1', status: 'PENDING' },
        data: { status: 'ACCEPTED', decidedAt: expect.any(Date) },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: 'stu-1' }, data: { parentId: 'org-1' } });
    });

    it('rejecting does not link the student', async () => {
      prisma.organizationJoinRequest.findUnique.mockResolvedValue(pending);

      const res = await service.decide('org-1', 'req-1', false);

      expect(res.status).toBe('REJECTED');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("cannot touch another organization's request", async () => {
      prisma.organizationJoinRequest.findUnique.mockResolvedValue({ ...pending, organizationId: 'org-2' });
      await expect(service.decide('org-1', 'req-1', true)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('a request can only be decided once', async () => {
      prisma.organizationJoinRequest.findUnique.mockResolvedValue(pending);
      prisma.organizationJoinRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.decide('org-1', 'req-1', true)).rejects.toThrow('already handled');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('will not move a student who already joined another organization', async () => {
      prisma.organizationJoinRequest.findUnique.mockResolvedValue(pending);
      prisma.user.findUnique.mockResolvedValue({ parentId: 'org-2' });

      await expect(service.decide('org-1', 'req-1', true)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
