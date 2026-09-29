import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ParentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all children linked to a parent account,
   * along with their profiles, progress, and recent activity.
   */
  async getChildren(parentId: string) {
    const children = await this.prisma.user.findMany({
      where: {
        parentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        parentCode: true,
        parentId: true,
        totalXp: true,
        streakDays: true,
        lastActiveAt: true,
        createdAt: true,
        UserProfile: {
          select: {
            avatarTheme: true,
            dailyGoal: true,
            weeklyGoalHours: true,
            soundEffects: true,
            reducedMotion: true,
            fontSize: true,
          },
        },
        dailyActivities: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        LearningProgress: {
          select: {
            trackId: true,
            levelId: true,
            status: true,
            progressPercent: true,
            xp: true,
            completedLessonIds: true,
            completedChallengeIds: true,
            lastAccessedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Map each child to a clean, frontend-compatible structure using pure database values
    return children.map((child) => {
      const totalMinutes = child.dailyActivities.reduce(
        (sum, a) => sum + (a.durationMinutes || 0),
        0,
      );
      const monthlyHours = Math.round((totalMinutes / 60) * 10) / 10;

      const formattedDailyActivities = child.dailyActivities.map((act) => {
        const d = new Date(act.date);
        return {
          date: d.toISOString().split('T')[0],
          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: d.getDate(),
          minutes: act.durationMinutes,
          lessonsCompleted: act.lessonsCompleted,
          active: act.durationMinutes > 0,
        };
      });

      return {
        id: child.id,
        parentId: child.parentId,
        fullName: child.name || 'Student Explorer',
        email: child.email,
        role: 'student',
        parentCode: child.parentCode,
        inviteCode: child.parentCode,
        totalXp: child.totalXp,
        streakDays: child.streakDays,
        monthlyHours,
        level: Math.max(1, Math.floor(child.totalXp / 100) + 1),
        rankTitle: this.calculateRankTitle(child.totalXp),
        lastActiveAt: child.lastActiveAt,
        createdAt: child.createdAt,
        avatar: (child.name || 'S').charAt(0).toUpperCase(),
        themeColor: this.mapAvatarColor(child.UserProfile?.avatarTheme),
        weeklyGoalHours: child.UserProfile?.weeklyGoalHours ?? 6,
        dailyActivities: formattedDailyActivities,
        learningProgress: child.LearningProgress,
      };
    });
  }

  private calculateRankTitle(xp: number): string {
    if (xp >= 1500) return 'Grandmaster Engineer';
    if (xp >= 800) return 'Master Algorithmist';
    if (xp >= 400) return 'Senior Builder';
    if (xp >= 150) return 'Code Pioneer';
    return 'Novice Explorer';
  }

  private mapAvatarColor(theme?: string): string {
    switch (theme) {
      case 'emerald':
      case 'green':
        return '#10b981';
      case 'cyan':
      case 'blue':
        return '#06b6d4';
      case 'amber':
      case 'yellow':
        return '#f59e0b';
      case 'rose':
      case 'pink':
        return '#f43f5e';
      case 'violet':
      case 'purple':
      default:
        return '#8b5cf6';
    }
  }

  /**
   * Sends an encouraging cheer message from parent to linked child.
   */
  async sendCheer(parentId: string, childId: string, message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new BadRequestException('Cheer message cannot be empty.');
    }

    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        parentId,
      },
    });

    if (!child) {
      throw new NotFoundException(
        'Child not found or not linked to your parent account.',
      );
    }

    const cheer = await this.prisma.parentCheer.create({
      data: {
        parentId,
        childId,
        message: trimmedMessage,
      },
    });

    return {
      success: true,
      cheer,
    };
  }

  /**
   * Retrieves all unread cheer messages for a student.
   */
  async getStudentCheers(studentId: string) {
    const cheers = await this.prisma.parentCheer.findMany({
      where: {
        childId: studentId,
        readAt: null,
      },
      include: {
        User_ParentCheer_parentIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return cheers.map((c) => ({
      id: c.id,
      parentId: c.parentId,
      parentName: c.User_ParentCheer_parentIdToUser?.name || 'Your Parent',
      message: c.message,
      createdAt: c.createdAt,
      readAt: c.readAt,
    }));
  }

  /**
   * Marks a cheer message as read by the student.
   */
  async markCheerAsRead(studentId: string, cheerId: string) {
    const cheer = await this.prisma.parentCheer.findFirst({
      where: {
        id: cheerId,
        childId: studentId,
      },
    });

    if (!cheer) {
      throw new NotFoundException('Cheer message not found.');
    }

    const updated = await this.prisma.parentCheer.update({
      where: { id: cheerId },
      data: {
        readAt: new Date(),
      },
    });

    return {
      success: true,
      cheer: updated,
    };
  }

  /**
   * Links an existing child account to the authenticated parent account.
   */
  async linkChild(parentId: string, studentIdentifier: string) {
    const raw = studentIdentifier.trim();
    if (!raw) {
      throw new BadRequestException('Student code or email is required.');
    }

    const child = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: raw.toLowerCase() },
          { id: raw },
          { parentCode: raw.toUpperCase() },
        ],
        role: 'CHILD',
      },
    });

    if (!child) {
      throw new NotFoundException(
        'Student account not found with the provided code or email.',
      );
    }

    if (child.parentId === parentId) {
      throw new BadRequestException(
        'This student is already linked to your account.',
      );
    }

    await this.prisma.user.update({
      where: { id: child.id },
      data: { parentId },
    });

    return {
      success: true,
      message: `Successfully linked ${child.name || child.email} to your family observatory.`,
      childId: child.id,
    };
  }

  /**
   * Updates weekly study goal hours for a linked child.
   */
  async updateChildGoal(
    parentId: string,
    childId: string,
    weeklyGoalHours: number,
  ) {
    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        parentId,
      },
    });

    if (!child) {
      throw new NotFoundException(
        'Child not found or not linked to your parent account.',
      );
    }

    const profile = await this.prisma.userProfile.upsert({
      where: { userId: childId },
      update: {
        weeklyGoalHours: Number(weeklyGoalHours),
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        userId: childId,
        weeklyGoalHours: Number(weeklyGoalHours),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      childId,
      weeklyGoalHours: profile.weeklyGoalHours,
    };
  }
}
