import { Injectable } from '@nestjs/common';
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
}
