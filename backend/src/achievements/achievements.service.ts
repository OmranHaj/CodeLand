import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LearningService } from '../learning/learning.service.js';

export const DEFAULT_ACHIEVEMENTS = [
  {
    id: 'first-step',
    title: 'First Step into CodeLand',
    description: 'Completed your very first interactive programming lesson.',
    badgeUrl: '/badges/badge-first-step.svg',
    criteria: 'Complete 1 lesson in any track',
    xpReward: 50,
  },
  {
    id: 'curious-mind',
    title: 'Curious Mind',
    description: 'Discovered and completed 5 lessons on CodeLand.',
    badgeUrl: '/badges/badge-curious.svg',
    criteria: 'Complete 5 lessons in any track',
    xpReward: 75,
  },
  {
    id: 'challenge-gladiator',
    title: 'Arena Gladiator',
    description: 'Successfully submitted and passed arena practice challenges.',
    badgeUrl: '/badges/badge-arena.svg',
    criteria: 'Pass coding arena challenges',
    xpReward: 100,
  },
  {
    id: 'first-project',
    title: 'Project Architect',
    description: 'Successfully submitted your very first coding project showcase.',
    badgeUrl: '/badges/badge-project.svg',
    criteria: 'Submit your first project build',
    xpReward: 150,
  },
  {
    id: 'xp-explorer',
    title: 'XP Explorer',
    description: 'Earned your first 250 experience points.',
    badgeUrl: '/badges/badge-xp-explorer.svg',
    criteria: 'Earn 250 total XP',
    xpReward: 50,
  },
  {
    id: 'xp-1000',
    title: 'XP Grandmaster',
    description: 'Reached a massive milestone of 1,000 total experience points.',
    badgeUrl: '/badges/badge-xp.svg',
    criteria: 'Reach 1,000 total XP',
    xpReward: 200,
  },
  {
    id: 'streak-3',
    title: 'Streak Novice',
    description: 'Maintained a consecutive 3-day coding streak.',
    badgeUrl: '/badges/badge-streak-3.svg',
    criteria: 'Log active study sessions on 3 consecutive days',
    xpReward: 100,
  },
  {
    id: 'streak-7',
    title: 'Streak Champion',
    description: 'Maintained a consecutive 7-day coding streak.',
    badgeUrl: '/badges/badge-streak-7.svg',
    criteria: 'Log active study sessions on 7 consecutive days',
    xpReward: 250,
  },
  {
    id: 'web-creator-apprentice',
    title: 'Web Creator Apprentice',
    description: 'Completed HTML Foundations and CSS Styling modules.',
    badgeUrl: '/badges/badge-web.svg',
    criteria: 'Complete HTML and CSS levels',
    xpReward: 150,
  },
  {
    id: 'cpp-system-pioneer',
    title: 'C++ Systems Pioneer',
    description: 'Mastered C++ Syntax, Logic Gates, and Memory Vault.',
    badgeUrl: '/badges/badge-cpp.svg',
    criteria: 'Complete the first 4 C++ World levels',
    xpReward: 200,
  },
  {
    id: 'algorithm-mastermind',
    title: 'Algorithm Mastermind',
    description: 'Solved sorting and graph challenges in the Algorithm Lab.',
    badgeUrl: '/badges/badge-algo.svg',
    criteria: 'Complete all 5 Python & Algorithm Lab sectors',
    xpReward: 300,
  },
];

@Injectable()
export class AchievementsService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learningService: LearningService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultAchievements();
  }

  /**
   * Ensures all standard milestone and track badges are seeded in the database.
   */
  async ensureDefaultAchievements() {
    for (const ach of DEFAULT_ACHIEVEMENTS) {
      await this.prisma.achievement.upsert({
        where: { id: ach.id },
        update: {
          title: ach.title,
          description: ach.description,
          badgeUrl: ach.badgeUrl,
          criteria: ach.criteria,
          xpReward: ach.xpReward,
        },
        create: {
          id: ach.id,
          title: ach.title,
          description: ach.description,
          badgeUrl: ach.badgeUrl,
          criteria: ach.criteria,
          xpReward: ach.xpReward,
        },
      });
    }
  }

  /**
   * Returns all available badges in the system.
   */
  async getAllAchievements() {
    return this.prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Evaluates user milestone progress and returns all earned badges for current user.
   */
  async getMyAchievements(userId: string) {
    // Automatically trigger milestone evaluation hook so any eligible badge is awarded
    await this.learningService.checkAndAwardMilestones(userId);

    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: {
        Achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      id: ua.id,
      userId: ua.userId,
      achievementId: ua.achievementId,
      unlockedAt: ua.unlockedAt,
      achievement: ua.Achievement,
      title: ua.Achievement.title,
      description: ua.Achievement.description,
      badgeUrl: ua.Achievement.badgeUrl,
      criteria: ua.Achievement.criteria,
      xpReward: ua.Achievement.xpReward,
    }));
  }
}
