import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ArenaContest, ArenaContestStatus, ArenaProblemStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { LearningService } from '../learning/learning.service.js';
import {
  ArenaStage,
  getContestStage,
  isRegistrationOpen,
  nextContestWindow,
  pickMedalists,
  registrationOpensAt,
  publicName,
  rankStandings,
} from './arena-contest.util.js';

type Db = PrismaService | Prisma.TransactionClient;

const MEDAL_CODES: Record<string, string> = { gold: 'GLD', silver: 'SLV', bronze: 'BRZ' };

@Injectable()
export class ArenaContestsService {
  private readonly logger = new Logger(ArenaContestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly learning: LearningService,
  ) {}

  stageOf(contest: Pick<ArenaContest, 'status' | 'startsAt' | 'endsAt'>, now = new Date()): ArenaStage {
    return getContestStage(contest, now);
  }

  // ===========================================================================
  // STUDENT
  // ===========================================================================

  /** The contest students see: newest CURRENT contest with published problems. */
  async findCurrentContest(db: Db = this.prisma) {
    return db.arenaContest.findFirst({
      where: {
        status: ArenaContestStatus.CURRENT,
        problems: { some: { status: ArenaProblemStatus.PUBLISHED } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCurrentForStudent(userId: string) {
    await this.finalizeDueContests();
    const now = new Date();
    const contest = await this.findCurrentContest();
    if (!contest) {
      return { serverTime: now, contest: null, registration: null, myStanding: null };
    }

    const [problems, participants, registration] = await Promise.all([
      this.prisma.arenaProblem.findMany({
        where: { batchId: contest.id, status: ArenaProblemStatus.PUBLISHED },
        select: { xp: true },
      }),
      this.prisma.arenaRegistration.count({ where: { contestId: contest.id } }),
      this.prisma.arenaRegistration.findUnique({
        where: { contestId_userId: { contestId: contest.id, userId } },
      }),
    ]);
    const standings = registration ? await this.computeStandings(contest.id, userId) : null;

    return {
      serverTime: now,
      contest: {
        ...this.toContestSummary(contest, now),
        problemCount: problems.length,
        maxScore: problems.reduce((sum, p) => sum + p.xp, 0),
        participants,
      },
      registration: registration
        ? { registered: true, registeredAt: registration.registeredAt }
        : { registered: false, registeredAt: null },
      myStanding: standings?.me ?? null,
    };
  }

  async register(userId: string, contestId: string) {
    const contest = await this.findContestOrThrow(contestId);
    this.assertRegistrationOpen(contest);
    await this.prisma.arenaRegistration.upsert({
      where: { contestId_userId: { contestId, userId } },
      create: { contestId, userId },
      update: {},
    });
    return { registered: true };
  }

  async unregister(userId: string, contestId: string) {
    const contest = await this.findContestOrThrow(contestId);
    this.assertRegistrationOpen(contest);
    await this.prisma.arenaRegistration.deleteMany({ where: { contestId, userId } });
    return { registered: false };
  }

  async getStandings(contestId: string, viewerId: string) {
    await this.finalizeDueContests();
    const contest = await this.findContestOrThrow(contestId);
    const standings = await this.computeStandings(contestId, viewerId);
    return {
      contest: this.toContestSummary(contest),
      maxScore: standings.maxScore,
      participants: standings.entries.length,
      entries: standings.entries,
      me: standings.me,
    };
  }

  /** Past contests (ended or archived) with their podium and the viewer's result. */
  async getHistory(userId: string) {
    await this.finalizeDueContests();
    const now = new Date();
    const contests = await this.prisma.arenaContest.findMany({
      where: {
        OR: [{ status: ArenaContestStatus.ARCHIVED }, { endsAt: { lt: now } }],
        problems: { some: {} },
      },
      orderBy: { edition: 'desc' },
      take: 20,
      include: {
        medals: {
          orderBy: { rank: 'asc' },
          include: { user: { select: { name: true } } },
        },
      },
    });

    const history = [];
    for (const contest of contests) {
      const standings = await this.computeStandings(contest.id, userId);
      history.push({
        ...this.toContestSummary(contest, now),
        maxScore: standings.maxScore,
        participants: standings.entries.length,
        podium: contest.medals.map((m) => ({
          rank: m.rank,
          medalType: m.medalType,
          name: publicName(m.user.name),
          score: m.score,
          isMe: m.userId === userId,
        })),
        me: standings.me,
      });
    }
    return history;
  }

  async getMyMedals(userId: string) {
    await this.finalizeDueContests();
    const medals = await this.prisma.arenaMedal.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
      include: {
        contest: { select: { edition: true, title: true, endsAt: true } },
        user: { select: { name: true } },
      },
    });
    return medals.map((m) => ({
      id: m.id,
      contestId: m.contestId,
      edition: m.contest.edition,
      contestTitle: m.contest.title,
      rank: m.rank,
      medalType: m.medalType,
      score: m.score,
      maxScore: m.maxScore,
      solvedCount: m.solvedCount,
      participants: m.participants,
      bonusXp: m.bonusXp,
      certificateCode: m.certificateCode,
      awardedAt: m.awardedAt,
      studentName: m.user.name || 'CodeLand Contender',
    }));
  }

  // ===========================================================================
  // ADMIN
  // ===========================================================================

  async listForAdmin() {
    await this.finalizeDueContests();
    const now = new Date();
    const contests = await this.prisma.arenaContest.findMany({
      orderBy: { edition: 'desc' },
      include: {
        _count: { select: { registrations: true, problems: true, medals: true } },
      },
    });
    return contests.map(({ _count, ...c }) => ({
      ...this.toContestSummary(c, now),
      finalizedAt: c.finalizedAt,
      archivedAt: c.archivedAt,
      participants: _count.registrations,
      problemCount: _count.problems,
      medalCount: _count.medals,
    }));
  }

  /**
   * Moves the live window (admin override). With no times it resets to the
   * standard weekly slot (next Sunday 17:00-20:00). Locked once medals were awarded.
   */
  async schedule(adminId: string, contestId: string, startsAt?: string, endsAt?: string) {
    const contest = await this.findContestOrThrow(contestId);
    this.assertEditableSchedule(contest);
    const window = this.resolveWindow(contest, startsAt, endsAt);
    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.arenaContest.update({ where: { id: contestId }, data: window });
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: 'ARENA_CONTEST_SCHEDULED',
          metadata: { contestId, ...this.isoWindow(window) },
        },
      });
      return row;
    });
    return this.toContestSummary(updated);
  }

  /**
   * Publishes every problem of the contest and makes sure it has a live
   * window (the given one, the existing one, or the next Sunday).
   */
  async publish(adminId: string, contestId: string, startsAt?: string, endsAt?: string) {
    const contest = await this.findContestOrThrow(contestId);
    if (contest.status !== ArenaContestStatus.CURRENT) {
      throw new ConflictException('Archived contests cannot be published again.');
    }
    const now = new Date();
    let window: { startsAt: Date; endsAt: Date };
    if (startsAt || endsAt) {
      this.assertEditableSchedule(contest);
      window = this.resolveWindow(contest, startsAt, endsAt);
    } else if (contest.startsAt && contest.endsAt && contest.startsAt > now) {
      window = { startsAt: contest.startsAt, endsAt: contest.endsAt };
    } else {
      // The planned Sunday already started or passed: move to the next weekly slot.
      this.assertEditableSchedule(contest);
      window = nextContestWindow(now);
    }

    await this.prisma.$transaction([
      this.prisma.arenaProblem.updateMany({
        where: { batchId: contestId },
        data: { status: ArenaProblemStatus.PUBLISHED, publishedAt: now },
      }),
      this.prisma.arenaContest.update({ where: { id: contestId }, data: window }),
      this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'ARENA_CONTEST_PUBLISHED',
          metadata: { contestId, ...this.isoWindow(window) },
        },
      }),
    ]);
    return this.findContestOrThrow(contestId).then((c) => this.toContestSummary(c));
  }

  async unpublish(adminId: string, contestId: string) {
    await this.findContestOrThrow(contestId);
    await this.prisma.$transaction([
      this.prisma.arenaProblem.updateMany({
        where: { batchId: contestId },
        data: { status: ArenaProblemStatus.DRAFT, publishedAt: null },
      }),
      this.prisma.adminAuditLog.create({
        data: { adminId, action: 'ARENA_CONTEST_UNPUBLISHED', metadata: { contestId } },
      }),
    ]);
    return { success: true };
  }

  /** Deletes the contest with its problems, registrations, attempts and medals. */
  async remove(adminId: string, contestId: string) {
    const contest = await this.findContestOrThrow(contestId);
    const problems = await this.prisma.arenaProblem.count({ where: { batchId: contestId } });
    await this.prisma.$transaction([
      this.prisma.arenaContest.delete({ where: { id: contestId } }),
      this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'ARENA_CONTEST_DELETED',
          metadata: { contestId, edition: contest.edition, problems },
        },
      }),
    ]);
    return { success: true, batchId: contestId, deleted: problems };
  }

  /**
   * Called inside the generate transaction: every CURRENT contest makes room
   * for the new one. Contests students could have seen (scheduled, or with
   * registrations/attempts) are ARCHIVED with their results; never-published
   * drafts are deleted. Returns the ids that were archived.
   */
  async retireCurrentContests(tx: Prisma.TransactionClient): Promise<string[]> {
    const current = await tx.arenaContest.findMany({
      where: { status: ArenaContestStatus.CURRENT },
      include: { _count: { select: { registrations: true } } },
    });
    const archived: string[] = [];
    for (const contest of current) {
      const [attempts, published] = await Promise.all([
        tx.arenaProblemAttempt.count({ where: { problem: { batchId: contest.id } } }),
        tx.arenaProblem.count({
          where: { batchId: contest.id, status: ArenaProblemStatus.PUBLISHED },
        }),
      ]);
      const everVisible = published > 0 || contest._count.registrations > 0 || attempts > 0;
      if (everVisible) {
        await tx.arenaContest.update({
          where: { id: contest.id },
          data: { status: ArenaContestStatus.ARCHIVED, archivedAt: new Date() },
        });
        archived.push(contest.id);
      } else {
        await tx.arenaContest.delete({ where: { id: contest.id } });
      }
    }
    return archived;
  }

  // ===========================================================================
  // STANDINGS & MEDALS
  // ===========================================================================

  async computeStandings(contestId: string, viewerId: string | null, db: Db = this.prisma) {
    const [registrations, attempts, problems] = await Promise.all([
      db.arenaRegistration.findMany({
        where: { contestId },
        include: {
          user: { select: { id: true, name: true, avatar: true, totalXp: true, streakDays: true } },
        },
      }),
      db.arenaProblemAttempt.findMany({ where: { problem: { batchId: contestId } } }),
      db.arenaProblem.findMany({
        where: { batchId: contestId, status: ArenaProblemStatus.PUBLISHED },
        select: { xp: true },
      }),
    ]);

    const byUser = new Map<string, typeof attempts>();
    for (const a of attempts) {
      byUser.set(a.userId, [...(byUser.get(a.userId) ?? []), a]);
    }

    const ranked = rankStandings(
      registrations.map((r) => {
        const mine = byUser.get(r.userId) ?? [];
        const solved = mine.filter((a) => a.solved);
        const lastSolved = solved.reduce<Date | null>(
          (max, a) => (a.solvedAt && (!max || a.solvedAt > max) ? a.solvedAt : max),
          null,
        );
        return {
          userId: r.userId,
          registeredAt: r.registeredAt,
          score: Math.round(solved.reduce((sum, a) => sum + a.earnedXp, 0) * 100) / 100,
          solvedCount: solved.length,
          lastSolvedAt: lastSolved,
          failedCount: mine.reduce((sum, a) => sum + a.failedCount, 0),
          hintsUsed: mine.filter((a) => a.hintUsed).length,
          user: r.user,
        };
      }),
    );

    const entries = ranked.map((e) => ({
      rank: e.rank,
      name: publicName(e.user.name),
      avatar: e.user.avatar,
      score: e.score,
      solvedCount: e.solvedCount,
      lastSolvedAt: e.lastSolvedAt,
      failedCount: e.failedCount,
      hintsUsed: e.hintsUsed,
      totalXp: e.user.totalXp,
      streakDays: e.user.streakDays,
      isMe: e.userId === viewerId,
    }));

    return {
      ranked,
      entries,
      me: entries.find((e) => e.isMe) ?? null,
      maxScore: problems.reduce((sum, p) => sum + p.xp, 0),
    };
  }

  /** Awards medals for every contest that ended or was archived and is not finalized yet. */
  async finalizeDueContests() {
    const due = await this.prisma.arenaContest.findMany({
      where: {
        finalizedAt: null,
        OR: [{ status: ArenaContestStatus.ARCHIVED }, { endsAt: { lt: new Date() } }],
      },
      select: { id: true },
    });
    for (const { id } of due) {
      await this.finalizeContest(id);
    }
  }

  /**
   * Gives gold/silver/bronze (+500/+300/+150 XP) to the top 3 scorers. The
   * conditional finalizedAt update makes it run exactly once per contest even
   * with concurrent requests.
   */
  async finalizeContest(contestId: string) {
    const medalists = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.arenaContest.updateMany({
        where: { id: contestId, finalizedAt: null },
        data: { finalizedAt: new Date() },
      });
      if (count === 0) return [];

      const contest = await tx.arenaContest.findUniqueOrThrow({ where: { id: contestId } });
      const standings = await this.computeStandings(contestId, null, tx);
      const winners = pickMedalists(standings.ranked);
      for (const { entry, medal } of winners) {
        await tx.arenaMedal.create({
          data: {
            contestId,
            userId: entry.userId,
            rank: entry.rank,
            medalType: medal.type,
            score: entry.score,
            maxScore: standings.maxScore,
            solvedCount: entry.solvedCount,
            participants: standings.entries.length,
            bonusXp: medal.bonusXp,
            certificateCode: `CL-SUN-${contest.edition}-${MEDAL_CODES[medal.type]}-${randomBytes(3).toString('hex').toUpperCase()}`,
          },
        });
        await tx.user.update({
          where: { id: entry.userId },
          data: { totalXp: { increment: medal.bonusXp } },
        });
      }
      return winners.map((w) => w.entry.userId);
    });

    for (const userId of medalists) {
      // Medal XP can unlock XP milestones (xp-1000 …).
      await this.learning.checkAndAwardMilestones(userId).catch((err) =>
        this.logger.warn(`Milestone check failed for ${userId}: ${err?.message}`),
      );
    }
    return medalists;
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  async findContestOrThrow(contestId: string, db: Db = this.prisma) {
    const contest = await db.arenaContest.findUnique({ where: { id: contestId } });
    if (!contest) throw new NotFoundException('Arena contest not found.');
    return contest;
  }

  toContestSummary(contest: ArenaContest, now = new Date()) {
    return {
      id: contest.id,
      edition: contest.edition,
      title: contest.title,
      story: contest.story,
      status: contest.status,
      stage: this.stageOf(contest, now),
      startsAt: contest.startsAt,
      endsAt: contest.endsAt,
      registrationOpensAt: contest.startsAt ? registrationOpensAt(contest.startsAt) : null,
      registrationOpen: isRegistrationOpen(contest, now),
    };
  }

  /** Throws a clear message when registering/leaving is outside the allowed week. */
  private assertRegistrationOpen(contest: ArenaContest, now = new Date()) {
    if (isRegistrationOpen(contest, now)) return;
    if (contest.status !== ArenaContestStatus.CURRENT || !contest.startsAt) {
      throw new ForbiddenException('Registration for this contest is closed.');
    }
    if (now >= contest.startsAt) {
      throw new ForbiddenException('Registration is closed: the contest has already started.');
    }
    throw new ForbiddenException(
      `Registration opens on ${registrationOpensAt(contest.startsAt).toISOString()}, one week before the contest.`,
    );
  }

  private assertEditableSchedule(contest: ArenaContest) {
    if (contest.finalizedAt || contest.status === ArenaContestStatus.ARCHIVED) {
      throw new ConflictException('This contest has finished and its medals were awarded; its schedule is locked.');
    }
  }

  private resolveWindow(contest: ArenaContest, startsAt?: string, endsAt?: string) {
    const fallback = nextContestWindow();
    if (!startsAt && !endsAt) return fallback;
    const start = startsAt ? new Date(startsAt) : (contest.startsAt ?? fallback.startsAt);
    const end = endsAt ? new Date(endsAt) : (contest.endsAt && contest.endsAt > start ? contest.endsAt : null);
    const finalEnd = end ?? new Date(start.getTime() + (fallback.endsAt.getTime() - fallback.startsAt.getTime()));
    if (Number.isNaN(start.getTime()) || Number.isNaN(finalEnd.getTime())) {
      throw new BadRequestException('Invalid contest start or end time.');
    }
    if (finalEnd <= start) {
      throw new BadRequestException('The contest must end after it starts.');
    }
    return { startsAt: start, endsAt: finalEnd };
  }

  private isoWindow(window: { startsAt: Date; endsAt: Date }) {
    return { startsAt: window.startsAt.toISOString(), endsAt: window.endsAt.toISOString() };
  }
}
