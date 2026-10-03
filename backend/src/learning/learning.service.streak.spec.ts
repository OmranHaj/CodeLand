import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LearningService } from './learning.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('LearningService Streak Tracking', () => {
  let learningService: LearningService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      dailyActivity: {
        upsert: vi.fn(),
      },
      achievement: {
        findUnique: vi.fn(),
      },
      userAchievement: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      learningProgress: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
      challengeSubmission: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany: vi.fn(),
      },
      projectSubmission: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    learningService = new LearningService(mockPrisma as unknown as PrismaService);
    // Mock checkAndAwardMilestones to avoid deep dependency calls
    vi.spyOn(learningService, 'checkAndAwardMilestones').mockResolvedValue([]);
  });

  it('starts streak at 1 on first activity ever', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      streakDays: 0,
      lastStreakAt: null,
      lastActiveAt: new Date('2026-10-01T00:00:00Z'),
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.dailyActivity.upsert.mockResolvedValue({});

    const res = await learningService.recordActivityAndStreak('student-1', {
      isLesson: true,
      xpEarned: 25,
    });

    expect(res.streakDays).toBe(1);
    expect(res.incremented).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'student-1' },
        data: expect.objectContaining({
          streakDays: 1,
        }),
      }),
    );
  });

  it('keeps streak at 1 without double-incrementing when solving another activity on the same day', async () => {
    const today = new Date();
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      streakDays: 1,
      lastStreakAt: today,
      lastActiveAt: today,
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.dailyActivity.upsert.mockResolvedValue({});

    const res = await learningService.recordActivityAndStreak('student-1', {
      isChallenge: true,
      xpEarned: 50,
    });

    expect(res.streakDays).toBe(1);
    expect(res.incremented).toBe(false);
  });

  it('increments streak to 2 when activity is solved on consecutive day (yesterday)', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      streakDays: 1,
      lastStreakAt: yesterday,
      lastActiveAt: yesterday,
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.dailyActivity.upsert.mockResolvedValue({});

    const res = await learningService.recordActivityAndStreak('student-1', {
      isLesson: true,
      xpEarned: 25,
    });

    expect(res.streakDays).toBe(2);
    expect(res.incremented).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'student-1' },
        data: expect.objectContaining({
          streakDays: 2,
        }),
      }),
    );
  });

  it('restarts streak at 1 if a full day was skipped (2 or more days ago)', async () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      streakDays: 5,
      lastStreakAt: threeDaysAgo,
      lastActiveAt: threeDaysAgo,
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.dailyActivity.upsert.mockResolvedValue({});

    const res = await learningService.recordActivityAndStreak('student-1', {
      isLesson: true,
      xpEarned: 25,
    });

    expect(res.streakDays).toBe(1);
    expect(res.isRestart).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'student-1' },
        data: expect.objectContaining({
          streakDays: 1,
        }),
      }),
    );
  });

  it('getStudentProgress resets streak to 0 if a day was skipped without activity', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    mockPrisma.learningProgress.findMany.mockResolvedValue([]);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      name: 'Adam',
      email: 'adam@test.com',
      totalXp: 500,
      streakDays: 7,
      lastStreakAt: twoDaysAgo,
      lastActiveAt: twoDaysAgo,
      UserProfile: { dailyGoal: 3, avatarTheme: 'violet' },
    });
    mockPrisma.user.update.mockResolvedValue({});

    const res = await learningService.getStudentProgress('student-1');

    expect(res.user?.streakDays).toBe(0);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { streakDays: 0 },
    });
  });

  it('getStudentProgress preserves streak if last activity was yesterday', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.learningProgress.findMany.mockResolvedValue([]);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'student-1',
      name: 'Adam',
      email: 'adam@test.com',
      totalXp: 500,
      streakDays: 4,
      lastStreakAt: yesterday,
      lastActiveAt: yesterday,
      UserProfile: { dailyGoal: 3, avatarTheme: 'violet' },
    });

    const res = await learningService.getStudentProgress('student-1');

    expect(res.user?.streakDays).toBe(4);
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});
