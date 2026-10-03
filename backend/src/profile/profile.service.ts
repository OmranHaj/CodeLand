import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { computeEffectiveStreak } from '../learning/streak.util.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the full profile and settings for the authenticated user.
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        parentCode: true,
        parentId: true,
        streakDays: true,
        lastStreakAt: true,
        totalXp: true,
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
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const { effectiveStreak, isBroken } = computeEffectiveStreak(
      user.streakDays,
      user.lastStreakAt || user.lastActiveAt,
    );
    if (isBroken && user.streakDays > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { streakDays: 0 },
      });
      user.streakDays = 0;
    } else {
      user.streakDays = effectiveStreak;
    }

    const profile = user.UserProfile;

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
      parentCode: user.parentCode,
      parentId: user.parentId,
      streakDays: user.streakDays,
      totalXp: user.totalXp,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      avatarTheme: profile?.avatarTheme || 'violet',
      dailyGoal: profile?.dailyGoal ?? 3,
      weeklyGoalHours: profile?.weeklyGoalHours ?? 6.0,
      soundEffects: profile?.soundEffects ?? true,
      reducedMotion: profile?.reducedMotion ?? false,
      fontSize: profile?.fontSize || 'md',
    };
  }

  /**
   * Updates user name and upserts UserProfile settings.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // 1. Update user name if provided
    if (typeof dto.name === 'string') {
      const trimmedName = dto.name.trim();
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: trimmedName },
      });
    }

    // 2. Upsert UserProfile record
    await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(dto.avatarTheme !== undefined && { avatarTheme: dto.avatarTheme }),
        ...(dto.dailyGoal !== undefined && { dailyGoal: dto.dailyGoal }),
        ...(dto.weeklyGoalHours !== undefined && {
          weeklyGoalHours: dto.weeklyGoalHours,
        }),
        ...(dto.soundEffects !== undefined && {
          soundEffects: dto.soundEffects,
        }),
        ...(dto.reducedMotion !== undefined && {
          reducedMotion: dto.reducedMotion,
        }),
        ...(dto.fontSize !== undefined && { fontSize: dto.fontSize }),
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        userId,
        avatarTheme: dto.avatarTheme || 'violet',
        dailyGoal: dto.dailyGoal ?? 3,
        weeklyGoalHours: dto.weeklyGoalHours ?? 6.0,
        soundEffects: dto.soundEffects ?? true,
        reducedMotion: dto.reducedMotion ?? false,
        fontSize: dto.fontSize || 'md',
        updatedAt: new Date(),
      },
    });

    return this.getProfile(userId);
  }
}
