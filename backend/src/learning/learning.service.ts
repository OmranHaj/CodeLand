import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

      // 7. If this unit was a project showcase, record ProjectSubmission
      if (
        normalizedLevelSlug === 'project-showcase' ||
        normalizedUnitSlug.includes('project') ||
        normalizedUnitSlug.includes('showcase')
      ) {
        const priorProject = await this.prisma.projectSubmission.findFirst({
          where: { userId, levelId: normalizedLevelSlug },
        });

        if (!priorProject) {
          await this.prisma.projectSubmission.create({
            data: {
              userId,
              levelId: normalizedLevelSlug,
              sourceCode: `Project completed: ${normalizedUnitSlug}`,
              reviewChecks: { unitSlug: normalizedUnitSlug, status: 'passed' },
              score: 100,
              passed: true,
            },
          });
        }
      }

      // 8. Trigger achievement milestone checks hook
      await this.checkAndAwardMilestones(userId);
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
        name: true,
        email: true,
        totalXp: true,
        streakDays: true,
        lastActiveAt: true,
        UserProfile: {
          select: {
            dailyGoal: true,
            avatarTheme: true,
          },
        },
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

      // Trigger achievement milestone checks hook
      await this.checkAndAwardMilestones(userId);
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

  /**
   * Records a project submission, saves checks and score,
   * and triggers the milestone evaluation hook.
   */
  async submitProject(
    userId: string,
    levelId: string,
    sourceCode: string = '',
    reviewChecks: any = {},
    score: number = 100,
    passed: boolean = true,
  ) {
    const normalizedLevelId = String(levelId || 'project-showcase').trim().toLowerCase();

    const submission = await this.prisma.projectSubmission.create({
      data: {
        userId,
        levelId: normalizedLevelId,
        sourceCode: sourceCode || '',
        reviewChecks: reviewChecks || {},
        score: score ?? 100,
        passed: passed ?? true,
      },
    });

    // Milestone checks hook
    await this.checkAndAwardMilestones(userId);

    return {
      success: true,
      submission,
    };
  }

  /**
   * Automatically grants an achievement by inserting into UserAchievement.
   * Safe against duplicates due to unique [userId, achievementId] constraint.
   */
  async grantAchievement(userId: string, achievementId: string): Promise<boolean> {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return false;
    }

    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) {
      return false;
    }

    await this.prisma.userAchievement.create({
      data: {
        userId,
        achievementId,
        unlockedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Utility / Hook that evaluates user achievements and automatically awards
   * badges when a student reaches specific milestones:
   * - Completing first lesson ('first-step')
   * - Completing 5 lessons ('curious-mind')
   * - Passing arena challenge ('challenge-gladiator')
   * - Reaching 250 XP ('xp-explorer')
   * - Reaching 1,000 XP ('xp-1000')
   * - Submitting first project ('first-project')
   * - Streak milestones ('streak-3', 'streak-7')
   * - Track completions ('web-creator-apprentice', etc.)
   */
  async checkAndAwardMilestones(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: true,
        ChallengeSubmission: true,
        LearningProgress: true,
      },
    });

    if (!user) {
      return [];
    }

    const newlyAwarded: string[] = [];

    const awardIfEligible = async (achievementId: string, condition: boolean) => {
      if (condition) {
        const granted = await this.grantAchievement(userId, achievementId);
        if (granted) {
          newlyAwarded.push(achievementId);
        }
      }
    };

    // 1. Lesson count across all progress tracks
    const completedLessonSet = new Set<string>();
    for (const prog of user.LearningProgress) {
      if (Array.isArray(prog.completedLessonIds)) {
        for (const lId of prog.completedLessonIds as string[]) {
          completedLessonSet.add(String(lId));
        }
      }
    }
    const totalLessons = completedLessonSet.size;

    await awardIfEligible('first-step', totalLessons >= 1);
    await awardIfEligible('curious-mind', totalLessons >= 5);

    // 2. Practice arena challenges passed
    const passedChallenges = user.ChallengeSubmission.filter((c) => c.passed);
    await awardIfEligible('challenge-gladiator', passedChallenges.length >= 1);

    // 3. Project milestone: Submitting first project
    const hasProjectSubmission =
      user.submissions.length > 0 ||
      user.LearningProgress.some(
        (p) =>
          p.levelId === 'project-showcase' &&
          (p.status === 'COMPLETED' ||
            (Array.isArray(p.completedLessonIds) &&
              (p.completedLessonIds as string[]).length > 0)),
      );
    await awardIfEligible('first-project', hasProjectSubmission);

    // 4. XP Milestones (e.g. reaching 1,000 XP)
    await awardIfEligible('xp-explorer', user.totalXp >= 250);
    await awardIfEligible('xp-1000', user.totalXp >= 1000);

    // 5. Streak Milestones
    await awardIfEligible('streak-3', user.streakDays >= 3);
    await awardIfEligible('streak-7', user.streakDays >= 7);

    // 6. Track level completions
    const completedLevels = new Set(
      user.LearningProgress.filter(
        (p) => p.status === 'COMPLETED' || p.progressPercent >= 100,
      ).map((p) => p.levelId),
    );

    const completedWebCore =
      completedLevels.has('html-foundations') &&
      completedLevels.has('css-styling');
    await awardIfEligible('web-creator-apprentice', completedWebCore);

    return newlyAwarded;
  }

  /**
   * Admin: Get all curriculum tracks and levels with all lessons from DB
   */
  async getAdminCurriculum() {
    const tracks = await this.prisma.track.findMany({
      include: {
        levels: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
            challenges: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return tracks;
  }

  /**
   * Admin: Update lesson in DB
   */
  async updateLesson(lessonId: string, updates: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);
    let lesson = isUuid
      ? await this.prisma.lesson.findUnique({ where: { id: lessonId } })
      : await this.prisma.lesson.findFirst({ where: { slug: lessonId } });

    if (!lesson && !isUuid) {
      lesson = await this.prisma.lesson.findFirst({ where: { slug: lessonId } });
    }

    if (!lesson) {
      throw new NotFoundException(`Lesson "${lessonId}" not found in database.`);
    }

    const dataToUpdate: any = {};
    if (typeof updates.title === 'string') dataToUpdate.title = updates.title.trim();
    if (typeof updates.subtitle === 'string') dataToUpdate.subtitle = updates.subtitle.trim();
    if (typeof updates.description === 'string') dataToUpdate.description = updates.description.trim();
    if (typeof updates.slug === 'string') dataToUpdate.slug = updates.slug.trim();
    if (typeof updates.difficulty === 'string') dataToUpdate.difficulty = updates.difficulty.trim().toLowerCase();
    if (typeof updates.status === 'string') dataToUpdate.status = updates.status.trim().toLowerCase();
    if (Number.isFinite(Number(updates.order))) dataToUpdate.order = Number(updates.order);
    if (Number.isFinite(Number(updates.xp))) dataToUpdate.xp = Math.max(0, Number(updates.xp));
    if (Number.isFinite(Number(updates.estimatedMinutes)))
      dataToUpdate.estimatedMinutes = Math.max(1, Number(updates.estimatedMinutes));
    if (updates.blocks) dataToUpdate.blocks = updates.blocks;

    if (typeof updates.code === 'string') {
      const currentBlocks = Array.isArray(lesson.blocks) ? [...(lesson.blocks as any[])] : [];
      const codeBlockIdx = currentBlocks.findIndex((b: any) => b && (b.type === 'code' || b.code !== undefined));
      if (codeBlockIdx >= 0) {
        currentBlocks[codeBlockIdx] = { ...currentBlocks[codeBlockIdx], code: updates.code };
      } else {
        currentBlocks.push({ id: `block-code-${Date.now()}`, type: 'code', code: updates.code });
      }
      dataToUpdate.blocks = currentBlocks;
    }

    const updated = await this.prisma.lesson.update({
      where: { id: lesson.id },
      data: dataToUpdate,
    });

    return updated;
  }

  /**
   * Admin: Create a new lesson in DB
   */
  async createLesson(levelSlugOrId: string, lessonData: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(levelSlugOrId);
    let level = isUuid
      ? await this.prisma.level.findUnique({ where: { id: levelSlugOrId } })
      : await this.prisma.level.findFirst({ where: { slug: levelSlugOrId } });

    if (!level) {
      throw new NotFoundException(`Level "${levelSlugOrId}" not found in database.`);
    }

    const title = (lessonData.title || '').trim();
    if (!title) throw new BadRequestException('Lesson title is required.');

    const slug = (
      lessonData.slug ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
      `lesson-${Date.now()}`
    ).trim();

    const currentCount = await this.prisma.lesson.count({
      where: { levelId: level.id },
    });

    const order =
      Number.isFinite(Number(lessonData.order)) && Number(lessonData.order) > 0
        ? Number(lessonData.order)
        : currentCount + 1;

    const blocks =
      Array.isArray(lessonData.blocks) && lessonData.blocks.length > 0
        ? lessonData.blocks
        : [
            {
              id: `text-${Date.now()}`,
              type: 'text',
              title,
              content: lessonData.description || 'Welcome to this lesson.',
            },
            ...(lessonData.code
              ? [{ id: `code-${Date.now()}`, type: 'code', code: lessonData.code }]
              : []),
          ];

    const created = await this.prisma.lesson.create({
      data: {
        levelId: level.id,
        title,
        subtitle: lessonData.subtitle || '',
        description: lessonData.description || '',
        slug,
        order,
        xp: Number.isFinite(Number(lessonData.xp)) ? Math.max(0, Number(lessonData.xp)) : 50,
        estimatedMinutes: Number.isFinite(Number(lessonData.estimatedMinutes))
          ? Math.max(1, Number(lessonData.estimatedMinutes))
          : 8,
        difficulty: (lessonData.difficulty || 'beginner').toLowerCase(),
        status: (lessonData.status || 'published').toLowerCase(),
        blocks,
      },
    });

    return created;
  }

  /**
   * Admin: Delete a lesson from DB
   */
  async deleteLesson(lessonId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonId);
    let lesson = isUuid
      ? await this.prisma.lesson.findUnique({ where: { id: lessonId } })
      : await this.prisma.lesson.findFirst({ where: { slug: lessonId } });

    if (!lesson) {
      throw new NotFoundException(`Lesson "${lessonId}" not found in database.`);
    }

    await this.prisma.lesson.delete({
      where: { id: lesson.id },
    });

    return { success: true, deletedLesson: lesson };
  }
}
