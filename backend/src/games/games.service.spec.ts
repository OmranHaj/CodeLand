import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { GamesService } from './games.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { GameVerifierService } from './game-verifier.service.js';
import { LearningService } from '../learning/learning.service.js';
import { GAMES } from './games.config.js';

describe('GamesService', () => {
  let service: GamesService;
  let prisma: any;
  let verifier: { verify: ReturnType<typeof vi.fn> };
  let learning: { grantAchievement: ReturnType<typeof vi.fn>; recordActivityAndStreak: ReturnType<typeof vi.fn> };

  const student = { id: 'stu-1', role: 'CHILD' };
  const admin = { id: 'adm-1', role: 'ADMIN' };

  beforeEach(() => {
    prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ totalXp: 2500 }), update: vi.fn() },
      gameCompletion: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ completedAt: new Date('2026-10-24T12:00:00Z') }),
      },
      gameRecord: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn(({ create }: any) => Promise.resolve({ ...create })),
      },
      $executeRaw: vi.fn(),
    };
    // The XP lock runs the work in a transaction; here the "transaction" is the same mock.
    prisma.$transaction = vi.fn((work: (tx: any) => unknown) => work(prisma));
    verifier = { verify: vi.fn().mockResolvedValue({ ok: true, message: 'All three stages verified.' }) };
    learning = { grantAchievement: vi.fn().mockResolvedValue(true), recordActivityAndStreak: vi.fn() };
    service = new GamesService(
      prisma as PrismaService,
      verifier as unknown as GameVerifierService,
      learning as unknown as LearningService,
    );
  });

  it('uses the thresholds 2000 / 3000 / 4000 XP', () => {
    expect(GAMES.map((g) => [g.id, g.unlockXp, g.rewardXp])).toEqual([
      ['robot-maze', 2000, 300],
      ['sky-traps', 3000, 400],
      ['bomb-defuser', 4000, 500],
    ]);
  });

  it("unlocks games from the student's real XP", async () => {
    const res = await service.listGames(student);

    expect(res.xp).toBe(2500);
    expect(res.games.map((g) => [g.id, g.unlocked, g.xpToUnlock])).toEqual([
      ['robot-maze', true, 0],
      ['sky-traps', false, 500],
      ['bomb-defuser', false, 1500],
    ]);
  });

  it('ignores previewXp for students', async () => {
    const res = await service.listGames(student, 999999);
    expect(res.preview).toBe(false);
    expect(res.games[2].unlocked).toBe(false);
  });

  it('lets admins preview the hub with a chosen XP without reading their own XP', async () => {
    const res = await service.listGames(admin, 3000);
    expect(res.preview).toBe(true);
    expect(res.games.map((g) => g.unlocked)).toEqual([true, true, false]);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('marks completed games', async () => {
    const when = new Date('2026-10-24T10:00:00Z');
    prisma.gameCompletion.findMany.mockResolvedValue([{ gameId: 'robot-maze', completedAt: when }]);
    const res = await service.listGames(student);
    expect(res.games[0]).toMatchObject({ completed: true, completedAt: when });
    expect(res.games[1].completed).toBe(false);
  });

  it('refuses to open a locked game for a student (no URL bypass)', async () => {
    await expect(service.getGame(student, 'bomb-defuser')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getGame(student, 'bomb-defuser')).rejects.toThrow('1500 more XP');
  });

  it('opens an unlocked game', async () => {
    const res = await service.getGame(student, 'robot-maze');
    expect(res).toMatchObject({ id: 'robot-maze', unlocked: true });
  });

  it('admins can open any game for testing', async () => {
    const res = await service.getGame(admin, 'bomb-defuser', 0);
    expect(res).toMatchObject({ id: 'bomb-defuser', unlocked: false, preview: true });
  });

  it('unknown game → 404', async () => {
    await expect(service.getGame(student, 'nope')).rejects.toBeInstanceOf(NotFoundException);
  });

  describe('completeGame', () => {
    const proof = { stages: [] };

    it('verifies the proof, then awards the XP and the badge once', async () => {
      const res = await service.completeGame(student, 'robot-maze', proof);

      expect(verifier.verify).toHaveBeenCalledWith('robot-maze', proof);
      expect(res).toMatchObject({ verified: true, xpAwarded: 300, achievementId: 'maze-runner' });
      expect(prisma.gameCompletion.create).toHaveBeenCalledWith({
        data: { userId: 'stu-1', gameId: 'robot-maze', xpAwarded: 300 },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'stu-1' },
        data: { totalXp: { increment: 300 } },
      });
      expect(learning.grantAchievement).toHaveBeenCalledWith('stu-1', 'maze-runner');
      // totalXp is credited in the transaction, so the activity log must not add it again.
      expect(learning.recordActivityAndStreak).toHaveBeenCalledWith('stu-1', { xpEarned: 300, creditTotalXp: false });
    });

    it('awards nothing when the code does not pass', async () => {
      verifier.verify.mockResolvedValue({ ok: false, message: 'Stage 2, maze 3: The robot hit a wall.' });
      const res = await service.completeGame(student, 'robot-maze', proof);

      expect(res).toEqual({ verified: false, xpAwarded: 0, message: 'Stage 2, maze 3: The robot hit a wall.' });
      expect(prisma.gameCompletion.create).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('does not re-check or re-award a game already completed', async () => {
      prisma.gameCompletion.findUnique.mockResolvedValue({ completedAt: new Date() });
      const res = await service.completeGame(student, 'robot-maze', proof);

      expect(res).toMatchObject({ verified: true, alreadyCompleted: true, xpAwarded: 0 });
      expect(verifier.verify).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('a parallel claim that loses the race gets no XP', async () => {
      // Not completed when checked, but completed by the time the XP lock is held.
      prisma.gameCompletion.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'c1' });
      const res = await service.completeGame(student, 'robot-maze', proof);

      expect(res).toMatchObject({ alreadyCompleted: true, xpAwarded: 0 });
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(learning.grantAchievement).not.toHaveBeenCalled();
    });

    it('refuses a game that is still locked, without running the check', async () => {
      await expect(service.completeGame(student, 'bomb-defuser', proof)).rejects.toBeInstanceOf(ForbiddenException);
      expect(verifier.verify).not.toHaveBeenCalled();
    });

    it('admins can check a proof but earn nothing', async () => {
      const res = await service.completeGame(admin, 'bomb-defuser', proof);
      expect(res).toMatchObject({ verified: true, xpAwarded: 0, preview: true });
      expect(prisma.gameCompletion.create).not.toHaveBeenCalled();
    });

    it('slows down a student after 10 failed checks', async () => {
      verifier.verify.mockResolvedValue({ ok: false, message: 'no' });
      for (let i = 0; i < 10; i++) await service.completeGame(student, 'robot-maze', proof);

      await expect(service.completeGame(student, 'robot-maze', proof)).rejects.toBeInstanceOf(HttpException);
      expect(verifier.verify).toHaveBeenCalledTimes(10);
    });

    it('runs one check at a time per student', async () => {
      let release!: (v: unknown) => void;
      verifier.verify.mockReturnValue(new Promise((resolve) => (release = resolve)));
      const first = service.completeGame(student, 'robot-maze', proof);
      await new Promise((r) => setTimeout(r, 0));

      await expect(service.completeGame(student, 'robot-maze', proof)).rejects.toThrow('already being checked');
      release({ ok: true, message: 'ok' });
      await expect(first).resolves.toMatchObject({ verified: true });
    });

    it('unknown game → 404', async () => {
      await expect(service.completeGame(student, 'chess', proof)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('submitEndlessRun', () => {
    const run = (levels: number) => ({ codes: ['code'], levels: Array.from({ length: levels }, (_, i) => ({ seed: i + 1, code: 0 })) });

    beforeEach(() => {
      // Endless mode opens after the three stages.
      prisma.gameCompletion.findUnique.mockResolvedValue({ id: 'done' });
      verifier.verify.mockResolvedValue({ ok: true, message: 'Levels verified.' });
    });

    it('verifies a run and saves it as the first record', async () => {
      const res = await service.submitEndlessRun(student, run(5));

      expect(verifier.verify).toHaveBeenCalledWith('robot-maze-endless', run(5));
      expect(res).toMatchObject({ verified: true, saved: true, bestLevel: 5 });
      expect(prisma.gameRecord.upsert).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled(); // records earn no XP
    });

    it('does not run a check for a run that is not better than the record', async () => {
      prisma.gameRecord.findUnique.mockResolvedValue({ bestLevel: 8 });
      const res = await service.submitEndlessRun(student, run(8));

      expect(res).toMatchObject({ saved: false, bestLevel: 8 });
      expect(verifier.verify).not.toHaveBeenCalled();
    });

    it('keeps the record when the run fails the check', async () => {
      prisma.gameRecord.findUnique.mockResolvedValue({ bestLevel: 3 });
      verifier.verify.mockResolvedValue({ ok: false, message: 'Level 4: The robot hit a wall.' });
      const res = await service.submitEndlessRun(student, run(9));

      expect(res).toMatchObject({ verified: false, saved: false, bestLevel: 3, message: 'Level 4: The robot hit a wall.' });
      expect(prisma.gameRecord.upsert).not.toHaveBeenCalled();
    });

    it('a better record saved meanwhile is not overwritten by a lower one', async () => {
      prisma.gameRecord.findUnique.mockResolvedValueOnce({ bestLevel: 2 }).mockResolvedValueOnce({ bestLevel: 12 });
      const res = await service.submitEndlessRun(student, run(6));

      expect(res).toMatchObject({ saved: false, bestLevel: 12 });
      expect(prisma.gameRecord.upsert).not.toHaveBeenCalled();
    });

    it('stays locked until the three stages are finished', async () => {
      prisma.gameCompletion.findUnique.mockResolvedValue(null);
      await expect(service.submitEndlessRun(student, run(3))).rejects.toBeInstanceOf(ForbiddenException);
      expect(verifier.verify).not.toHaveBeenCalled();
    });

    it('needs at least one cleared level', async () => {
      await expect(service.submitEndlessRun(student, { codes: ['x'], levels: [] })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('admins can check a run but it is not saved', async () => {
      const res = await service.submitEndlessRun(admin, run(4));
      expect(res).toMatchObject({ verified: true, saved: false, preview: true });
      expect(prisma.gameRecord.upsert).not.toHaveBeenCalled();
    });

    it('shows the record on the Robot Maze page', async () => {
      prisma.gameRecord.findUnique.mockResolvedValue({ bestLevel: 7 });
      expect((await service.getGame(student, 'robot-maze')).bestLevel).toBe(7);
    });
  });
});
