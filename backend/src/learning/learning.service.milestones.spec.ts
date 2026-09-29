import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LearningService } from './learning.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('LearningService - Achievements and Milestones', () => {
  let service: LearningService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      achievement: {
        findUnique: vi.fn(),
      },
      userAchievement: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      projectSubmission: {
        create: vi.fn(),
      },
      learningProgress: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      challengeSubmission: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      dailyActivity: {
        upsert: vi.fn(),
      },
    } as unknown as PrismaService;

    service = new LearningService(prisma);
  });

  it('should grant an achievement if not already granted', async () => {
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue({
      id: 'xp-1000',
      title: 'XP Grandmaster',
      description: 'Reached 1,000 XP',
      badgeUrl: '/badges/badge-xp.svg',
      criteria: 'Reach 1,000 total XP',
      xpReward: 200,
      createdAt: new Date(),
    });
    vi.mocked(prisma.userAchievement.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userAchievement.create).mockResolvedValue({
      id: 'ua-1',
      userId: 'user-1',
      achievementId: 'xp-1000',
      unlockedAt: new Date(),
    });

    const granted = await service.grantAchievement('user-1', 'xp-1000');
    expect(granted).toBe(true);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        achievementId: 'xp-1000',
      }),
    });
  });

  it('should not duplicate an achievement if already unlocked', async () => {
    vi.mocked(prisma.achievement.findUnique).mockResolvedValue({
      id: 'xp-1000',
      title: 'XP Grandmaster',
      description: 'Reached 1,000 XP',
      badgeUrl: '/badges/badge-xp.svg',
      criteria: 'Reach 1,000 total XP',
      xpReward: 200,
      createdAt: new Date(),
    });
    vi.mocked(prisma.userAchievement.findUnique).mockResolvedValue({
      id: 'ua-1',
      userId: 'user-1',
      achievementId: 'xp-1000',
      unlockedAt: new Date(),
    });

    const granted = await service.grantAchievement('user-1', 'xp-1000');
    expect(granted).toBe(false);
    expect(prisma.userAchievement.create).not.toHaveBeenCalled();
  });

  it('checkAndAwardMilestones awards first-project and xp-1000 when milestones met', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      totalXp: 1250,
      streakDays: 3,
      submissions: [
        {
          id: 'sub-1',
          userId: 'user-1',
          levelId: 'project-showcase',
          sourceCode: 'console.log("hello")',
          reviewChecks: {},
          score: 100,
          passed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      ChallengeSubmission: [],
      LearningProgress: [
        {
          id: 'prog-1',
          userId: 'user-1',
          trackId: 'web-creator',
          levelId: 'html-foundations',
          completedLessonIds: ['lesson-1'],
          completedChallengeIds: [],
          xp: 200,
          progressPercent: 100,
          status: 'COMPLETED',
          lastAccessedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    } as any);

    vi.mocked(prisma.achievement.findUnique).mockResolvedValue({
      id: 'any',
      title: 'Badge',
    } as any);
    vi.mocked(prisma.userAchievement.findUnique).mockResolvedValue(null);

    const newlyAwarded = await service.checkAndAwardMilestones('user-1');

    expect(newlyAwarded).toContain('first-step');
    expect(newlyAwarded).toContain('first-project');
    expect(newlyAwarded).toContain('xp-1000');
    expect(newlyAwarded).toContain('streak-3');
  });
});
