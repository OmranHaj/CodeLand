import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { creditStudySeconds, MAX_SECONDS_PER_REPORT } from './study-time.util.js';
import { LearningService } from './learning.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('creditStudySeconds', () => {
  const t0 = 1_000_000_000;

  it('credits a normal 30-second report', () => {
    expect(creditStudySeconds(30, t0, t0 + 30_000)).toBe(30);
  });

  it('never credits more than the time that really passed', () => {
    expect(creditStudySeconds(60, t0, t0 + 10_000)).toBe(12); // 10s elapsed + 2s tolerance
  });

  it('caps a single report', () => {
    expect(creditStudySeconds(300, undefined, t0)).toBe(MAX_SECONDS_PER_REPORT);
    expect(creditStudySeconds(300, t0, t0 + 3_600_000)).toBe(MAX_SECONDS_PER_REPORT);
  });

  it('two tabs reporting at the same moment are not counted twice', () => {
    const first = creditStudySeconds(30, t0, t0 + 30_000);
    const second = creditStudySeconds(30, t0 + 30_000, t0 + 30_100);
    expect(first + second).toBeLessThanOrEqual(32);
  });

  it('ignores negative or fractional junk', () => {
    expect(creditStudySeconds(-5, t0, t0 + 30_000)).toBe(0);
    expect(creditStudySeconds(29.9, t0, t0 + 30_000)).toBe(29);
  });
});

describe('LearningService.recordStudyTime', () => {
  let service: LearningService;
  let prisma: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 24, 17, 0, 0));
    prisma = {
      dailyActivity: {
        upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ activeSeconds: create.activeSeconds })),
      },
    };
    service = new LearningService(prisma as PrismaService);
  });

  afterEach(() => vi.useRealTimers());

  it("adds credited seconds to today's activity without touching the streak", async () => {
    const res = await service.recordStudyTime('stu-1', 30);

    expect(res.creditedSeconds).toBe(30);
    const call = prisma.dailyActivity.upsert.mock.calls[0][0];
    expect(call.update).toEqual({ activeSeconds: { increment: 30 } });
    expect(call.create).toMatchObject({ userId: 'stu-1', activeSeconds: 30 });
    expect(call.where.userId_date.date.getHours()).toBe(0);
    expect(Object.keys(call.update)).toEqual(['activeSeconds']);
  });

  it('a burst of reports cannot add more time than really passed', async () => {
    await service.recordStudyTime('stu-1', 30);
    vi.advanceTimersByTime(1_000);
    const second = await service.recordStudyTime('stu-1', 30);
    expect(second.creditedSeconds).toBe(3);
  });

  it('writes nothing when there is nothing to credit', async () => {
    await service.recordStudyTime('stu-1', 30);
    prisma.dailyActivity.upsert.mockClear();
    const res = await service.recordStudyTime('stu-1', 0 as number);
    expect(res.creditedSeconds).toBe(0);
    expect(prisma.dailyActivity.upsert).not.toHaveBeenCalled();
  });
});
