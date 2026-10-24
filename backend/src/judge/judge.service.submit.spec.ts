import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JudgeService } from './judge.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { LearningService } from '../learning/learning.service.js';

describe('JudgeService.submitChallenge XP', () => {
  let service: JudgeService;
  let prisma: any;
  let learning: { recordActivityAndStreak: ReturnType<typeof vi.fn> };

  const challenge = {
    id: 'ch-1',
    levelId: null,
    xp: 80,
    language: 'cpp',
    timeLimit: 1,
    memoryLimit: 128,
    testCases: [{ order: 0, input: '2 3', expectedOutput: '5' }],
  };

  beforeEach(() => {
    prisma = {
      $executeRaw: vi.fn().mockResolvedValue(0),
      challenge: { findUnique: vi.fn().mockResolvedValue(challenge) },
      codeSubmission: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'sub-1', createdAt: new Date(), ...data })),
      },
      user: { update: vi.fn(), findFirst: vi.fn() },
      learningProgress: { findUnique: vi.fn(), upsert: vi.fn() },
    };
    prisma.$transaction = vi.fn(async (work: (tx: any) => Promise<unknown>) => work(prisma));
    learning = { recordActivityAndStreak: vi.fn().mockResolvedValue({ streakDays: 1 }) };

    service = new JudgeService(prisma as PrismaService, learning as unknown as LearningService);
  });

  const accept = () =>
    vi.spyOn(service, 'executeCode').mockResolvedValue({
      status: 'SUCCESS',
      stdout: '5\n',
      stderr: '',
      compileError: null,
      executionTime: '0.01s',
      engine: 'judge0',
    } as any);

  it('awards the challenge XP to the signed-in student on the first accepted submission', async () => {
    accept();
    const res = await service.submitChallenge('student-1', 'ch-1', { code: 'x', language: 'cpp' } as any);

    expect(res.status).toBe('ACCEPTED');
    expect(res.xpEarned).toBe(80);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'student-1' },
      data: { totalXp: { increment: 80 } },
    });
    expect(learning.recordActivityAndStreak).toHaveBeenCalledWith('student-1', {
      isChallenge: true,
      xpEarned: 80,
      creditTotalXp: false,
    });
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('gives no XP when the student already has an accepted submission', async () => {
    accept();
    prisma.codeSubmission.findFirst.mockResolvedValue({ id: 'earlier' });

    const res = await service.submitChallenge('student-1', 'ch-1', { code: 'x', language: 'cpp' } as any);

    expect(res.status).toBe('ACCEPTED');
    expect(res.xpEarned).toBe(0);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(learning.recordActivityAndStreak).not.toHaveBeenCalled();
    // The submission itself is still saved.
    expect(prisma.codeSubmission.create).toHaveBeenCalled();
  });

  it('gives no XP for a wrong answer', async () => {
    vi.spyOn(service, 'executeCode').mockResolvedValue({
      status: 'SUCCESS',
      stdout: '6\n',
      stderr: '',
      compileError: null,
      executionTime: '0.01s',
      engine: 'judge0',
    } as any);

    const res = await service.submitChallenge('student-1', 'ch-1', { code: 'x', language: 'cpp' } as any);

    expect(res.status).toBe('WRONG_ANSWER');
    expect(res.xpEarned).toBe(0);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('gives no XP for a challenge without test cases (nothing verified the answer)', async () => {
    accept();
    prisma.challenge.findUnique.mockResolvedValue({ ...challenge, testCases: [] });

    const res = await service.submitChallenge('student-1', 'ch-1', { code: 'int main(){}', language: 'cpp' } as any);

    expect(res.status).toBe('ACCEPTED');
    expect(res.xpEarned).toBe(0);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('never looks up a fallback student to credit', async () => {
    accept();
    await service.submitChallenge('student-1', 'ch-1', { code: 'x', language: 'cpp' } as any);
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });
});
