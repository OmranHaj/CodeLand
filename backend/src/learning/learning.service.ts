import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves content (lessons and challenges) for a specific level by its slug.
   * Matches the exact structure consumed by the frontend learning views.
   */
  async getLevelContent(levelSlug: string) {
    const normalizedSlug = levelSlug.trim().toLowerCase();

    const level = await this.prisma.level.findUnique({
      where: { slug: normalizedSlug },
      include: {
        lessons: {
          where: { status: 'published' },
          orderBy: { order: 'asc' },
        },
        challenges: {
          where: { status: 'published' },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!level) {
      throw new NotFoundException(`Learning level "${normalizedSlug}" not found.`);
    }

    return {
      id: level.slug,
      slug: level.slug,
      title: level.title,
      subtitle: level.subtitle,
      description: level.description,
      version: level.version,
      status: level.status,
      accent: level.accent,
      estimatedMinutes: level.estimatedMinutes,
      lessons: level.lessons.map((les) => ({
        id: les.slug,
        slug: les.slug,
        order: les.order,
        title: les.title,
        subtitle: les.subtitle,
        description: les.description,
        difficulty: les.difficulty,
        xp: les.xp,
        estimatedMinutes: les.estimatedMinutes,
        status: les.status,
        blocks: les.blocks,
      })),
      challenges: level.challenges.map((ch) => ({
        id: ch.slug || ch.id,
        slug: ch.slug || ch.id,
        order: ch.order,
        title: ch.title,
        subtitle: ch.subtitle,
        description: ch.description,
        difficulty: ch.difficulty,
        xp: ch.xp,
        estimatedMinutes: ch.estimatedMinutes,
        status: ch.status,
        tasks: ch.tasks,
        starterCode: ch.starterCode,
        solutionCode: ch.solutionCode,
        hints: ch.hints,
      })),
    };
  }

  /**
   * Retrieves all published levels with their lesson and challenge counts.
   */
  async getAllLevels() {
    const levels = await this.prisma.level.findMany({
      where: { status: 'published' },
      include: {
        track: true,
        _count: {
          select: {
            lessons: { where: { status: 'published' } },
            challenges: { where: { status: 'published' } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return levels.map((lvl) => ({
      id: lvl.slug,
      slug: lvl.slug,
      title: lvl.title,
      subtitle: lvl.subtitle,
      description: lvl.description,
      accent: lvl.accent,
      order: lvl.order,
      track: {
        id: lvl.track.slug,
        title: lvl.track.title,
      },
      totalLessons: lvl._count.lessons,
      totalChallenges: lvl._count.challenges,
    }));
  }

  /**
   * Records a completed lesson for the authenticated student.
   * Updates LearningProgress, increments User.totalXp, and logs DailyActivity.
   */
  async completeLesson(
    userId: string,
    levelSlug: string,
    unitSlug: string,
    xpEarned: number = 25,
    unitType?: 'lesson' | 'challenge',
  ) {
    const normalizedLevelSlug = levelSlug.trim().toLowerCase();
    const normalizedUnitSlug = unitSlug.trim().toLowerCase();

    // 1. Verify level exists and load lessons + challenges
    const level = await this.prisma.level.findUnique({
      where: { slug: normalizedLevelSlug },
      include: {
        track: true,
        lessons: { where: { status: 'published' } },
        challenges: { where: { status: 'published' } },
      },
    });

    if (!level) {
      throw new NotFoundException(`Level "${normalizedLevelSlug}" not found.`);
    }

    const isChallenge =
      unitType === 'challenge' ||
      level.challenges.some((c) => c.slug === normalizedUnitSlug) ||
      normalizedUnitSlug.includes('challenge');

    const totalLessons = level.lessons.length;
    const totalChallenges = level.challenges.length;
    const totalUnits = Math.max(1, totalLessons + totalChallenges);
    const trackSlug = level.track?.slug || 'web-creator';

    // 2. Find or create user's progress for this level
    const existingProgress = await this.prisma.learningProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId: normalizedLevelSlug,
        },
      },
    });

    let completedLessonIds: string[] = [];
    let completedChallengeIds: string[] = [];

    if (existingProgress) {
      if (Array.isArray(existingProgress.completedLessonIds)) {
        completedLessonIds = [...(existingProgress.completedLessonIds as string[])];
      }
      if (Array.isArray(existingProgress.completedChallengeIds)) {
        completedChallengeIds = [...(existingProgress.completedChallengeIds as string[])];
      }
    }

    let isNewCompletion = false;

    if (isChallenge) {
      if (!completedChallengeIds.includes(normalizedUnitSlug)) {
        completedChallengeIds.push(normalizedUnitSlug);
        isNewCompletion = true;
      }
    } else {
      if (!completedLessonIds.includes(normalizedUnitSlug)) {
        completedLessonIds.push(normalizedUnitSlug);
        isNewCompletion = true;
      }
    }

    const totalCompleted = completedLessonIds.length + completedChallengeIds.length;
    const progressPercent = Math.min(100, Math.round((totalCompleted / totalUnits) * 100));
    const status = progressPercent >= 100 ? 'COMPLETED' : 'IN_PROGRESS';

    const actualXpToAdd = isNewCompletion ? xpEarned : 0;

    // 3. Update LearningProgress record
    const updatedProgress = await this.prisma.learningProgress.upsert({
      where: {
        userId_levelId: {
          userId,
          levelId: normalizedLevelSlug,
        },
      },
      update: {
        completedLessonIds,
        completedChallengeIds,
        progressPercent,
        status,
        xp: { increment: actualXpToAdd },
        lastAccessedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        userId,
        trackId: trackSlug,
        levelId: normalizedLevelSlug,
        completedLessonIds,
        completedChallengeIds,
        progressPercent,
        status,
        xp: actualXpToAdd,
        lastAccessedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 4. Update user total XP and last active timestamp if new completion
    if (actualXpToAdd > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: actualXpToAdd },
          lastActiveAt: new Date(),
        },
      });

      // 5. Update or create DailyActivity for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.dailyActivity.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          lessonsCompleted: isChallenge ? undefined : { increment: 1 },
          challengesCompleted: isChallenge ? { increment: 1 } : undefined,
          xpEarned: { increment: actualXpToAdd },
          durationMinutes: { increment: 10 },
        },
        create: {
          userId,
          date: today,
          lessonsCompleted: isChallenge ? 0 : 1,
          challengesCompleted: isChallenge ? 1 : 0,
          xpEarned: actualXpToAdd,
          durationMinutes: 10,
        },
      });

      // 6. If this unit was a challenge, record it in ChallengeSubmission table
      if (isChallenge) {
        await this.prisma.challengeSubmission.create({
          data: {
            userId,
            challengeId: normalizedUnitSlug,
            submittedCode: 'Completed in curriculum track',
            passed: true,
            xpEarned: actualXpToAdd,
          },
        });
      }
    }

    return {
      success: true,
      isNewCompletion,
      isChallenge,
      xpEarned: actualXpToAdd,
      progress: updatedProgress,
    };
  }

  /**
   * Returns all learning progress records for the authenticated student.
   */
  async getStudentProgress(userId: string) {
    const progressRecords = await this.prisma.learningProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        totalXp: true,
        streakDays: true,
        lastActiveAt: true,
      },
    });

    return {
      user,
      progress: progressRecords,
    };
  }

  /**
   * Records a challenge submission, saves code and test result,
   * and awards XP if this is the first successful completion.
   */
  async submitChallenge(
    userId: string,
    challengeId: string,
    submittedCode: string = '',
    passed: boolean = false,
    xpEarned: number = 50,
  ) {
    const normalizedChallengeId = String(challengeId).trim();

    // Check if user has already passed this challenge
    const priorPass = await this.prisma.challengeSubmission.findFirst({
      where: {
        userId,
        challengeId: normalizedChallengeId,
        passed: true,
      },
    });

    const isNewPass = passed && !priorPass;
    const actualXpToAdd = isNewPass ? xpEarned || 50 : 0;

    // Create submission record
    const submission = await this.prisma.challengeSubmission.create({
      data: {
        userId,
        challengeId: normalizedChallengeId,
        submittedCode: submittedCode || '',
        passed,
        xpEarned: actualXpToAdd,
      },
    });

    // If passed for the first time, increment user total XP and log daily activity
    if (actualXpToAdd > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: actualXpToAdd },
          lastActiveAt: new Date(),
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.dailyActivity.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          challengesCompleted: { increment: 1 },
          xpEarned: { increment: actualXpToAdd },
          durationMinutes: { increment: 10 },
        },
        create: {
          userId,
          date: today,
          lessonsCompleted: 0,
          challengesCompleted: 1,
          xpEarned: actualXpToAdd,
          durationMinutes: 10,
        },
      });
    }

    return {
      success: true,
      submission,
      isNewPass,
      xpEarned: actualXpToAdd,
    };
  }

  /**
   * Retrieves all challenge submissions and list of passed challenge IDs for student.
   */
  async getMyChallengeSubmissions(userId: string) {
    const submissions = await this.prisma.challengeSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: 100,
    });

    const passedSubmissions = submissions.filter((s) => s.passed);
    const passedChallengeIds = Array.from(
      new Set(passedSubmissions.map((s) => s.challengeId)),
    );

    return {
      totalSubmissions: submissions.length,
      totalPassed: passedChallengeIds.length,
      passedChallengeIds,
      submissions,
    };
  }
}
