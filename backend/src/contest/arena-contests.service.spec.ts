import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { ArenaContestsService } from './arena-contests.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LearningService } from '../learning/learning.service.js';

const user = (id: string, name: string) => ({ id, name, avatar: null, totalXp: 1000, streakDays: 2 });
const reg = (userId: string, name: string) => ({
  contestId: 'c-1',
  userId,
  registeredAt: new Date('2026-10-20T00:00:00Z'),
  user: user(userId, name),
});
const solved = (userId: string, earnedXp: number, at: string, failedCount = 0) => ({
  userId,
  solved: true,
  solvedAt: new Date(at),
  earnedXp,
  failedCount,
  hintUsed: false,
});

describe('ArenaContestsService', () => {
  let prisma: any;
  let learning: any;
  let service: ArenaContestsService;
  let finalized: boolean;

  beforeEach(() => {
    finalized = false;
    prisma = {
      arenaContest: {
        findUnique: vi.fn(async () => ({
          id: 'c-1',
          status: 'CURRENT',
          startsAt: new Date('2026-10-25T00:00:00Z'),
          endsAt: new Date('2026-10-26T00:00:00Z'),
          finalizedAt: null,
          edition: 7,
        })),
        findUniqueOrThrow: vi.fn(async () => ({ id: 'c-1', edition: 7 })),
        // Only the first caller flips finalizedAt.
        updateMany: vi.fn(async () => {
          if (finalized) return { count: 0 };
          finalized = true;
          return { count: 1 };
        }),
      },
      arenaRegistration: {
        findMany: vi.fn(async () => [
          reg('u-gold', 'Lina Haddad'),
          reg('u-silver', 'Omar Saleh'),
          reg('u-bronze', 'Sara'),
          reg('u-zero', 'Nour'),
          reg('u-4th', 'Adam Ali'),
        ]),
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      arenaProblemAttempt: {
        findMany: vi.fn(async () => [
          solved('u-gold', 150, '2026-10-25T10:00:00Z'),
          solved('u-gold', 100, '2026-10-25T09:00:00Z'),
          solved('u-silver', 150, '2026-10-25T09:30:00Z'),
          solved('u-bronze', 75, '2026-10-25T11:00:00Z', 1),
          solved('u-4th', 75, '2026-10-25T12:00:00Z', 3),
        ]),
      },
      arenaProblem: {
        findMany: vi.fn(async () => [25, 50, 75, 100, 125, 150].map((xp) => ({ xp }))),
      },
      arenaMedal: { create: vi.fn() },
      user: { update: vi.fn() },
      $transaction: vi.fn(async (fn: any) => fn(prisma)),
    };
    learning = { checkAndAwardMilestones: vi.fn().mockResolvedValue([]) };
    service = new ArenaContestsService(prisma as PrismaService, learning as LearningService);
  });

  it('ranks registered students and hides their full names', async () => {
    const { entries, maxScore } = await service.computeStandings('c-1', 'u-silver');
    expect(maxScore).toBe(525);
    expect(entries.map((e) => [e.rank, e.name, e.score])).toEqual([
      [1, 'Lina H.', 250],
      [2, 'Omar S.', 150],
      [3, 'Sara', 75],
      [4, 'Adam A.', 75],
      [null, 'Nour', 0],
    ]);
    expect(entries.find((e) => e.isMe)?.name).toBe('Omar S.');
    expect(entries[0]).not.toHaveProperty('userId');
  });

  it('awards gold/silver/bronze with bonus XP exactly once', async () => {
    const first = await service.finalizeContest('c-1');
    const second = await service.finalizeContest('c-1');

    expect(first).toEqual(['u-gold', 'u-silver', 'u-bronze']);
    expect(second).toEqual([]);
    const medals = prisma.arenaMedal.create.mock.calls.map((c: any) => c[0].data);
    expect(medals.map((m: any) => [m.userId, m.medalType, m.bonusXp])).toEqual([
      ['u-gold', 'gold', 500],
      ['u-silver', 'silver', 300],
      ['u-bronze', 'bronze', 150],
    ]);
    expect(medals[0].certificateCode).toMatch(/^CL-SUN-7-GLD-[0-9A-F]{6}$/);
    expect(prisma.user.update).toHaveBeenCalledTimes(3);
    expect(learning.checkAndAwardMilestones).toHaveBeenCalledTimes(3);
  });

  const contestAt = (startOffsetMs: number) => ({
    id: 'c-1',
    status: 'CURRENT',
    startsAt: new Date(Date.now() + startOffsetMs),
    endsAt: new Date(Date.now() + startOffsetMs + 3 * 3600_000),
  });

  it('accepts registrations during the week before the contest', async () => {
    prisma.arenaContest.findUnique.mockResolvedValue(contestAt(2 * 24 * 3600_000));
    await expect(service.register('u-new', 'c-1')).resolves.toEqual({ registered: true });
    await expect(service.unregister('u-new', 'c-1')).resolves.toEqual({ registered: false });
  });

  it('refuses registration once the contest has started (live or ended)', async () => {
    for (const offset of [-60_000, -5 * 3600_000]) {
      prisma.arenaContest.findUnique.mockResolvedValue(contestAt(offset));
      await expect(service.register('u-late', 'c-1')).rejects.toThrow(/already started/);
      await expect(service.unregister('u-gold', 'c-1')).rejects.toBeInstanceOf(ForbiddenException);
    }
    expect(prisma.arenaRegistration.upsert).not.toHaveBeenCalled();
  });

  it('refuses registration more than a week before the contest', async () => {
    prisma.arenaContest.findUnique.mockResolvedValue(contestAt(9 * 24 * 3600_000));
    await expect(service.register('u-early', 'c-1')).rejects.toThrow(/Registration opens on/);
  });
});
