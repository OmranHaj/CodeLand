import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LearningService } from './learning.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PRACTICE_CHALLENGE_XP } from './practice-challenges.js';

describe('LearningService XP is decided by the server', () => {
  let service: LearningService;
  let mockPrisma: any;
  let recordActivity: ReturnType<typeof vi.spyOn>;

  const level = {
    slug: 'html-foundations',
    track: { slug: 'web-creator' },
    lessons: [
      { slug: 'html-intro', xp: 60 },
      { slug: 'shared-unit', xp: 70 },
    ],
    challenges: [
      { slug: 'html-quiz', xp: 40 },
      { slug: 'shared-unit', xp: 90 },
    ],
  };

  beforeEach(() => {
    mockPrisma = {
      $executeRaw: vi.fn().mockResolvedValue(0),
      level: { findUnique: vi.fn().mockResolvedValue(level) },
      learningProgress: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockImplementation(async ({ create }: any) => create),
      },
      challengeSubmission: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async ({ data }: any) => data),
      },
      projectSubmission: { findFirst: vi.fn(), create: vi.fn() },
    };
    mockPrisma.$transaction = vi.fn(async (work: (tx: any) => Promise<unknown>) => work(mockPrisma));

    service = new LearningService(mockPrisma as unknown as PrismaService);
    recordActivity = vi
      .spyOn(service, 'recordActivityAndStreak')
      .mockResolvedValue({ streakDays: 1 } as any);
  });

  describe('completeLesson', () => {
    it("awards the lesson's XP from the database", async () => {
      const res = await service.completeLesson('u1', 'html-foundations', 'html-intro');

      expect(res.xpEarned).toBe(60);
      expect(recordActivity).toHaveBeenCalledWith('u1', expect.objectContaining({ xpEarned: 60, isLesson: true }));
      // The read-check-write runs under the per-student lock.
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });

    it('rejects a unit that does not exist in the level', async () => {
      await expect(service.completeLesson('u1', 'html-foundations', 'fake-lesson-999')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockPrisma.learningProgress.upsert).not.toHaveBeenCalled();
      expect(recordActivity).not.toHaveBeenCalled();
    });

    it('no longer treats any slug containing "challenge" as a real challenge', async () => {
      await expect(
        service.completeLesson('u1', 'html-foundations', 'my-challenge-hack'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('gives no XP when the unit was already completed', async () => {
      mockPrisma.learningProgress.findUnique.mockResolvedValue({
        completedLessonIds: ['html-intro'],
        completedChallengeIds: [],
      });
      mockPrisma.learningProgress.upsert.mockImplementation(async ({ update }: any) => update);

      const res = await service.completeLesson('u1', 'html-foundations', 'html-intro');
      expect(res.isNewCompletion).toBe(false);
      expect(res.xpEarned).toBe(0);
    });

    it('uses unitType only to choose between real units with the same slug', async () => {
      const asChallenge = await service.completeLesson('u1', 'html-foundations', 'shared-unit', 'challenge');
      expect(asChallenge.isChallenge).toBe(true);
      expect(asChallenge.xpEarned).toBe(90);

      const asLesson = await service.completeLesson('u1', 'html-foundations', 'shared-unit', 'lesson');
      expect(asLesson.isChallenge).toBe(false);
      expect(asLesson.xpEarned).toBe(70);
    });
  });

  describe('grantAchievement', () => {
    it('treats an achievement granted by a parallel request as already granted', async () => {
      mockPrisma.achievement = { findUnique: vi.fn().mockResolvedValue({ id: 'first-step' }) };
      mockPrisma.userAchievement = {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: 'test' }),
        ),
      };

      await expect(service.grantAchievement('u1', 'first-step')).resolves.toBe(false);
    });
  });

  describe('submitChallenge', () => {
    it('grades the answer on the server and awards the fixed XP once', async () => {
      const res = await service.submitChallenge('u1', '3', '30');

      expect(res.passed).toBe(true);
      expect(res.xpEarned).toBe(PRACTICE_CHALLENGE_XP);
      expect(mockPrisma.challengeSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ passed: true, xpEarned: PRACTICE_CHALLENGE_XP }),
      });
    });

    it('marks a wrong answer as failed with no XP or streak', async () => {
      const res = await service.submitChallenge('u1', '3', '25');

      expect(res.passed).toBe(false);
      expect(res.xpEarned).toBe(0);
      expect(recordActivity).not.toHaveBeenCalled();
    });

    it('gives no XP for a challenge the student already passed', async () => {
      mockPrisma.challengeSubmission.findFirst.mockResolvedValue({ id: 'earlier', passed: true });

      const res = await service.submitChallenge('u1', '3', '30');
      expect(res.passed).toBe(true);
      expect(res.xpEarned).toBe(0);
    });

    it('rejects an unknown challenge id', async () => {
      await expect(service.submitChallenge('u1', '999', 'anything')).rejects.toBeInstanceOf(NotFoundException);
      expect(mockPrisma.challengeSubmission.create).not.toHaveBeenCalled();
    });
  });
});
