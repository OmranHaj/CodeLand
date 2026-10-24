import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { LearningService } from '../learning/learning.service.js';
import { withStudentXpLock } from '../learning/xp-lock.util.js';
import { FailedAttemptLimiter } from '../auth/failed-attempt-limiter.js';
import { GameVerifierService } from './game-verifier.service.js';
import { findGame, GAMES, GameDefinition } from './games.config.js';

/** The game with an endless mode, and the id its records are stored under. */
const ENDLESS_GAME_ID = 'robot-maze';
const ENDLESS_VERIFIER_ID = 'robot-maze-endless';

/** Failed checks a student may send per window before they have to wait (each one runs on Judge0). */
const MAX_FAILED_CHECKS = 10;
const FAILED_CHECKS_WINDOW_MS = 10 * 60 * 1000;

export interface GameViewer {
  id: string;
  role: string;
}

/**
 * Lock state of the code games. Unlocking is decided here from the student's real total XP, never
 * from anything the browser sends. Admins may preview the hub as a student with a chosen XP.
 */
@Injectable()
export class GamesService {
  private readonly failedChecks = new FailedAttemptLimiter(MAX_FAILED_CHECKS, FAILED_CHECKS_WINDOW_MS);
  /** Students with a check running; a second one waits for the first. */
  private readonly checking = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly verifier: GameVerifierService,
    private readonly learning: LearningService,
  ) {}

  private isAdmin(viewer: GameViewer) {
    return ['ADMIN', 'SUPERADMIN'].includes(viewer.role.toUpperCase());
  }

  private async viewerXp(viewer: GameViewer, previewXp?: number) {
    if (this.isAdmin(viewer) && previewXp !== undefined) {
      return { xp: previewXp, preview: true };
    }
    const user = await this.prisma.user.findUnique({ where: { id: viewer.id }, select: { totalXp: true } });
    return { xp: user?.totalXp ?? 0, preview: false };
  }

  private view(game: GameDefinition, xp: number, completedAt?: Date) {
    return {
      id: game.id,
      title: game.title,
      unlockXp: game.unlockXp,
      rewardXp: game.rewardXp,
      achievementId: game.achievementId,
      unlocked: xp >= game.unlockXp,
      xpToUnlock: Math.max(0, Math.ceil(game.unlockXp - xp)),
      completed: Boolean(completedAt),
      completedAt: completedAt ?? null,
    };
  }

  async listGames(viewer: GameViewer, previewXp?: number) {
    const { xp, preview } = await this.viewerXp(viewer, previewXp);
    const completions = await this.prisma.gameCompletion.findMany({
      where: { userId: viewer.id },
      select: { gameId: true, completedAt: true },
    });
    const completedAt = new Map(completions.map((c) => [c.gameId, c.completedAt]));

    return {
      xp,
      preview,
      games: GAMES.map((game) => this.view(game, xp, completedAt.get(game.id))),
    };
  }

  /** One game's state; refuses a locked game so its page cannot be opened by URL. */
  async getGame(viewer: GameViewer, gameId: string, previewXp?: number) {
    const game = findGame(gameId);
    if (!game) {
      throw new NotFoundException('Game not found.');
    }

    const { xp, preview } = await this.viewerXp(viewer, previewXp);
    const completion = await this.prisma.gameCompletion.findUnique({
      where: { userId_gameId: { userId: viewer.id, gameId } },
      select: { completedAt: true },
    });
    const state = this.view(game, xp, completion?.completedAt);
    const record =
      gameId === ENDLESS_GAME_ID
        ? await this.prisma.gameRecord.findUnique({
            where: { userId_gameId: { userId: viewer.id, gameId } },
            select: { bestLevel: true },
          })
        : null;

    if (!state.unlocked && !this.isAdmin(viewer)) {
      throw new ForbiddenException(
        `${game.title} unlocks at ${game.unlockXp} XP. You need ${state.xpToUnlock} more XP.`,
      );
    }

    return { ...state, xp, preview, bestLevel: record?.bestLevel ?? 0 };
  }

  /**
   * A finished game. The server re-runs the student's code on the seeds they played (Judge0) and,
   * the first time it passes, awards the game's XP and badge. Admins can check a proof but earn nothing.
   */
  async completeGame(viewer: GameViewer, gameId: string, proof: unknown) {
    const game = findGame(gameId);
    if (!game) {
      throw new NotFoundException('Game not found.');
    }
    const admin = this.isAdmin(viewer);

    if (!admin) {
      const { xp } = await this.viewerXp(viewer);
      if (xp < game.unlockXp) {
        throw new ForbiddenException(`${game.title} unlocks at ${game.unlockXp} XP.`);
      }
      const done = await this.prisma.gameCompletion.findUnique({
        where: { userId_gameId: { userId: viewer.id, gameId } },
        select: { completedAt: true },
      });
      if (done) {
        return {
          verified: true,
          alreadyCompleted: true,
          xpAwarded: 0,
          completedAt: done.completedAt,
          message: 'You already earned the reward for this game.',
        };
      }
    }

    const verdict = await this.check(viewer, gameId, proof);
    if (!verdict.ok) {
      return { verified: false, xpAwarded: 0, message: verdict.message || 'Your code did not pass the check.' };
    }
    if (admin) {
      return { verified: true, xpAwarded: 0, preview: true, message: 'Verified. Admin accounts do not earn XP.' };
    }

    // The lock makes two parallel claims see each other: only the first creates the completion.
    const completion = await withStudentXpLock(this.prisma, viewer.id, async (tx) => {
      const existing = await tx.gameCompletion.findUnique({
        where: { userId_gameId: { userId: viewer.id, gameId } },
      });
      if (existing) return null;
      const created = await tx.gameCompletion.create({
        data: { userId: viewer.id, gameId, xpAwarded: game.rewardXp },
      });
      await tx.user.update({
        where: { id: viewer.id },
        data: { totalXp: { increment: game.rewardXp } },
      });
      return created;
    });

    if (!completion) {
      return { verified: true, alreadyCompleted: true, xpAwarded: 0, message: 'You already earned the reward for this game.' };
    }

    const badge = await this.learning.grantAchievement(viewer.id, game.achievementId);
    // totalXp was credited above; this logs today's activity, the streak and other milestones.
    await this.learning.recordActivityAndStreak(viewer.id, { xpEarned: game.rewardXp, creditTotalXp: false });

    return {
      verified: true,
      xpAwarded: game.rewardXp,
      achievementId: badge ? game.achievementId : null,
      completedAt: completion.completedAt,
      message: `Verified! +${game.rewardXp} XP`,
    };
  }

  /**
   * An endless Robot Maze run: the server replays every level the student cleared and keeps the
   * best result. Records earn no XP (so they cannot be farmed); only finishing the game does.
   */
  async submitEndlessRun(viewer: GameViewer, proof: Record<string, unknown>) {
    const levels = Array.isArray(proof?.levels) ? proof.levels.length : 0;
    if (levels < 1) {
      throw new BadRequestException('Clear at least one level first.');
    }
    const admin = this.isAdmin(viewer);
    const where = { userId_gameId: { userId: viewer.id, gameId: ENDLESS_GAME_ID } };

    let best = 0;
    if (!admin) {
      const done = await this.prisma.gameCompletion.findUnique({ where, select: { id: true } });
      if (!done) {
        throw new ForbiddenException('Finish the three Robot Maze stages to unlock endless mode.');
      }
      best = (await this.prisma.gameRecord.findUnique({ where, select: { bestLevel: true } }))?.bestLevel ?? 0;
      // Only a better run is worth checking.
      if (levels <= best) {
        return { verified: false, saved: false, bestLevel: best, message: `Your record is level ${best}.` };
      }
    }

    const verdict = await this.check(viewer, ENDLESS_VERIFIER_ID, proof);
    if (!verdict.ok) {
      return { verified: false, saved: false, bestLevel: best, message: verdict.message || 'The run did not pass the check.' };
    }
    if (admin) {
      return { verified: true, saved: false, bestLevel: levels, preview: true, message: 'Verified. Admin records are not saved.' };
    }

    // Upsert under the student's lock so two runs sent together keep the higher one.
    const saved = await withStudentXpLock(this.prisma, viewer.id, async (tx) => {
      const current = await tx.gameRecord.findUnique({ where });
      if (current && current.bestLevel >= levels) return current;
      return tx.gameRecord.upsert({
        where,
        create: { userId: viewer.id, gameId: ENDLESS_GAME_ID, bestLevel: levels },
        update: { bestLevel: levels, achievedAt: new Date() },
      });
    });

    const isRecord = saved.bestLevel === levels;
    return {
      verified: true,
      saved: isRecord,
      bestLevel: saved.bestLevel,
      message: isRecord ? `New record: level ${levels}!` : `Your record is level ${saved.bestLevel}.`,
    };
  }

  /** Runs one proof on Judge0, at most one at a time per student and with a limit on failed checks. */
  private async check(viewer: GameViewer, verifierId: string, proof: unknown) {
    if (this.failedChecks.isBlocked(viewer.id)) {
      throw new HttpException('Too many checks failed. Please wait a few minutes and try again.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (this.checking.has(viewer.id)) {
      throw new HttpException('Your code is already being checked.', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.checking.add(viewer.id);
    try {
      const verdict = await this.verifier.verify(verifierId, proof);
      if (!verdict.ok) this.failedChecks.recordFailure(viewer.id);
      return verdict;
    } finally {
      this.checking.delete(viewer.id);
    }
  }
}
