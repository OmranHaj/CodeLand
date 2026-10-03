import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, UserStatus } from '@prisma/client';
import crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { computeEffectiveStreak } from '../learning/streak.util.js';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregates real-time statistics for the Admin Users dashboard.
   */
  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      students,
      parents,
      superAdmins,
      activeUsers,
      suspendedUsers,
      newUsersThisMonth,
      activeThisWeek,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.CHILD } }),
      this.prisma.user.count({ where: { role: Role.PARENT } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.user.count({ where: { lastActiveAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      totalUsers,
      students,
      parents,
      superAdmins,
      activeUsers,
      suspendedUsers,
      newUsersThisMonth,
      activeThisWeek,
    };
  }

  /**
   * Retrieves paginated, searchable, filterable user list.
   */
  async getUsers(query: ListAdminUsersQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    // Search filter: Name or Email
    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { parentCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter
    if (query.role && query.role.toUpperCase() !== 'ALL') {
      const roleStr = query.role.toUpperCase();
      if (roleStr === 'STUDENT' || roleStr === 'CHILD') {
        where.role = Role.CHILD;
      } else if (roleStr === 'PARENT') {
        where.role = Role.PARENT;
      } else if (roleStr === 'ADMIN' || roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN') {
        where.role = Role.ADMIN;
      }
    }

    // Status filter
    if (query.status && query.status.toUpperCase() !== 'ALL') {
      const statusStr = query.status.toUpperCase();
      if (statusStr === 'ACTIVE' || statusStr === 'SUSPENDED') {
        where.status = statusStr as UserStatus;
      }
    }

    // Sorting
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          totalXp: true,
          streakDays: true,
          lastStreakAt: true,
          parentCode: true,
          parentId: true,
          lastActiveAt: true,
          createdAt: true,
          suspendedAt: true,
          suspendReason: true,
          password: true,
          googleId: true,
          githubId: true,
          discordId: true,
        },
      }),
    ]);

    const items = users.map((u) => {
      const providers: string[] = [];
      if (u.password) providers.push('LOCAL');
      if (u.googleId) providers.push('GOOGLE');
      if (u.githubId) providers.push('GITHUB');
      if (u.discordId) providers.push('DISCORD');

      const { effectiveStreak, isBroken } = computeEffectiveStreak(
        u.streakDays,
        u.lastStreakAt || u.lastActiveAt,
      );
      if (isBroken && u.streakDays > 0) {
        this.prisma.user.update({
          where: { id: u.id },
          data: { streakDays: 0 },
        }).catch(() => {});
      }
      const actualStreak = isBroken ? 0 : effectiveStreak;

      return {
        id: u.id,
        name: u.name || 'Unnamed User',
        email: u.email,
        role: u.role === Role.CHILD ? 'STUDENT' : u.role === Role.ADMIN ? 'SUPER_ADMIN' : 'PARENT',
        dbRole: u.role,
        status: u.status,
        avatar: u.avatar,
        totalXp: u.totalXp,
        streakDays: actualStreak,
        parentCode: u.parentCode,
        parentId: u.parentId,
        lastActiveAt: u.lastActiveAt,
        createdAt: u.createdAt,
        suspendedAt: u.suspendedAt,
        suspendReason: u.suspendReason,
        providerSummary: providers,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves comprehensive user details for the drawer panel.
   */
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        totalXp: true,
        streakDays: true,
        lastStreakAt: true,
        parentCode: true,
        parentId: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        suspendedAt: true,
        suspendReason: true,
        password: true,
        googleId: true,
        githubId: true,
        discordId: true,
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
            parentCode: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            email: true,
            totalXp: true,
            streakDays: true,
            lastStreakAt: true,
            lastActiveAt: true,
            status: true,
          },
        },
        dailyActivities: {
          take: 10,
          orderBy: { date: 'desc' },
          select: {
            id: true,
            date: true,
            durationMinutes: true,
            lessonsCompleted: true,
            challengesCompleted: true,
            xpEarned: true,
          },
        },
        LearningProgress: {
          take: 10,
          orderBy: { lastAccessedAt: 'desc' },
          select: {
            id: true,
            trackId: true,
            levelId: true,
            xp: true,
            progressPercent: true,
            status: true,
            completedLessonIds: true,
            completedChallengeIds: true,
            lastAccessedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const providers: string[] = [];
    if (user.password) providers.push('LOCAL');
    if (user.googleId) providers.push('GOOGLE');
    if (user.githubId) providers.push('GITHUB');
    if (user.discordId) providers.push('DISCORD');

    const { effectiveStreak: userEffectiveStreak, isBroken: userStreakBroken } = computeEffectiveStreak(
      user.streakDays,
      user.lastStreakAt || user.lastActiveAt,
    );
    if (userStreakBroken && user.streakDays > 0) {
      this.prisma.user.update({
        where: { id: user.id },
        data: { streakDays: 0 },
      }).catch(() => {});
    }
    const userActualStreak = userStreakBroken ? 0 : userEffectiveStreak;

    const mappedChildren = (user.children || []).map((c) => {
      const { effectiveStreak, isBroken } = computeEffectiveStreak(
        c.streakDays,
        c.lastStreakAt || c.lastActiveAt,
      );
      if (isBroken && c.streakDays > 0) {
        this.prisma.user.update({
          where: { id: c.id },
          data: { streakDays: 0 },
        }).catch(() => {});
      }
      return {
        ...c,
        streakDays: isBroken ? 0 : effectiveStreak,
      };
    });

    return {
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email,
      role: user.role === Role.CHILD ? 'STUDENT' : user.role === Role.ADMIN ? 'SUPER_ADMIN' : 'PARENT',
      dbRole: user.role,
      status: user.status,
      avatar: user.avatar,
      totalXp: user.totalXp,
      streakDays: userActualStreak,
      parentCode: user.parentCode,
      parentId: user.parentId,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      suspendedAt: user.suspendedAt,
      suspendReason: user.suspendReason,
      providerSummary: providers,
      parent: user.parent,
      children: mappedChildren,
      dailyActivities: user.dailyActivities,
      learningProgress: user.LearningProgress,
    };
  }

  /**
   * Suspends or reactivates a user account.
   * Enforces self-protection, last-admin protection, and immediate JWT revocation.
   */
  async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserStatusDto,
  ) {
    if (adminUserId === targetUserId) {
      throw new ForbiddenException('You cannot suspend your own administrator account.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    // Last admin protection: cannot suspend the final active admin
    if (targetUser.role === Role.ADMIN && dto.status === UserStatus.SUSPENDED) {
      const activeAdminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
      });

      if (activeAdminCount <= 1) {
        throw new BadRequestException('At least one active SUPER_ADMIN must remain.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Concurrency re-check inside transaction if target is admin
      if (targetUser.role === Role.ADMIN && dto.status === UserStatus.SUSPENDED) {
        const countInTx = await tx.user.count({
          where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
        });
        if (countInTx <= 1) {
          throw new BadRequestException('At least one active SUPER_ADMIN must remain.');
        }
      }

      const updated = await tx.user.update({
        where: { id: targetUserId },
        data: {
          status: dto.status,
          suspendedAt: dto.status === UserStatus.SUSPENDED ? new Date() : null,
          suspendReason:
            dto.status === UserStatus.SUSPENDED
              ? dto.reason || 'Administrative action'
              : null,
          tokenVersion: { increment: 1 }, // Immediately invalidates existing JWTs
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          tokenVersion: true,
          suspendedAt: true,
          suspendReason: true,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: adminUserId,
          targetUserId,
          action:
            dto.status === UserStatus.SUSPENDED
              ? 'USER_SUSPENDED'
              : 'USER_REACTIVATED',
          metadata: {
            previousStatus: targetUser.status,
            newStatus: dto.status,
            reason: dto.reason || null,
          },
        },
      });

      return {
        success: true,
        message: `Account ${
          dto.status === UserStatus.SUSPENDED ? 'suspended' : 'reactivated'
        } successfully.`,
        user: updated,
      };
    });
  }

  /**
   * Changes a user's role (promote/demote/role switch).
   * Enforces self-demotion prevention, last-admin protection, relationship integrity,
   * and immediate JWT revocation via tokenVersion.
   */
  async updateUserRole(
    adminUserId: string,
    targetUserId: string,
    dto: UpdateUserRoleDto,
  ) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        children: { select: { id: true } },
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    // Normalize requested role
    let newRole: Role;
    const roleStr = dto.role.toUpperCase();
    if (roleStr === 'CHILD' || roleStr === 'STUDENT') {
      newRole = Role.CHILD;
    } else if (roleStr === 'PARENT') {
      newRole = Role.PARENT;
    } else if (
      roleStr === 'ADMIN' ||
      roleStr === 'SUPER_ADMIN' ||
      roleStr === 'SUPERADMIN'
    ) {
      newRole = Role.ADMIN;
    } else {
      throw new BadRequestException('Invalid role specified.');
    }

    if (targetUser.role === newRole) {
      return {
        success: true,
        message: `User is already assigned the role ${roleStr}.`,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          role: targetUser.role,
        },
      };
    }

    // Prevent self-demotion
    if (
      adminUserId === targetUserId &&
      targetUser.role === Role.ADMIN &&
      newRole !== Role.ADMIN
    ) {
      throw new ForbiddenException('You cannot demote your own administrator account.');
    }

    // Protect the last active SUPER_ADMIN from demotion
    if (targetUser.role === Role.ADMIN && newRole !== Role.ADMIN) {
      const activeAdminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
      });

      if (activeAdminCount <= 1) {
        throw new BadRequestException('At least one active SUPER_ADMIN must remain.');
      }
    }

    // Parent/Student relationship integrity
    if (targetUser.role === Role.PARENT && newRole !== Role.PARENT) {
      if (targetUser.children && targetUser.children.length > 0) {
        throw new BadRequestException(
          'Cannot change role: this parent has linked student accounts. Unlink children first.',
        );
      }
    }

    // Generate parentCode if promoting/changing to PARENT and doesn't have one
    let newParentCode = targetUser.parentCode;
    if (newRole === Role.PARENT && !newParentCode) {
      newParentCode = await this.generateUniqueParentCode();
    }

    return this.prisma.$transaction(async (tx) => {
      // Defensive count check inside transaction against race conditions
      if (targetUser.role === Role.ADMIN && newRole !== Role.ADMIN) {
        const countInTx = await tx.user.count({
          where: { role: Role.ADMIN, status: UserStatus.ACTIVE },
        });
        if (countInTx <= 1) {
          throw new BadRequestException('At least one active SUPER_ADMIN must remain.');
        }
      }

      const updated = await tx.user.update({
        where: { id: targetUserId },
        data: {
          role: newRole,
          parentCode: newParentCode,
          parentId: newRole !== Role.CHILD ? null : targetUser.parentId,
          tokenVersion: { increment: 1 }, // Invalidates active JWTs!
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          tokenVersion: true,
          parentCode: true,
          parentId: true,
        },
      });

      // Determine audit action
      let action = 'USER_ROLE_CHANGED';
      if (newRole === Role.ADMIN) {
        action = 'ADMIN_PROMOTED';
      } else if (targetUser.role === Role.ADMIN) {
        action = 'ADMIN_DEMOTED';
      }

      await tx.adminAuditLog.create({
        data: {
          adminId: adminUserId,
          targetUserId,
          action,
          metadata: {
            previousRole: targetUser.role,
            newRole,
          },
        },
      });

      return {
        success: true,
        message: 'User role updated successfully.',
        user: updated,
      };
    });
  }

  /**
   * Retrieves recent admin audit logs for visibility and compliance.
   */
  async getAuditLogs(limit = 30) {
    const safeLimit = Math.min(100, Math.max(1, limit));
    return this.prisma.adminAuditLog.findMany({
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Generates a unique 8-character parent code.
   */
  private async generateUniqueParentCode(maxRetries = 10): Promise<string> {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const codeLength = 8;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let code = '';
      const bytes = crypto.randomBytes(codeLength);
      for (let i = 0; i < codeLength; i++) {
        code += chars[bytes[i] % chars.length];
      }

      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [{ parentCode: code }, { parentCode: `CL-${code}` }],
        },
      });

      if (!existing) {
        return code;
      }
    }

    return `CL${Date.now().toString(36).toUpperCase()}`;
  }
}
