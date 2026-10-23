import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ArenaProblemsService } from './arena-problems.service.js';
import { ArenaProblemGeneratorService } from './arena-problem-generator.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JudgeService } from '../judge/judge.service.js';
import { LearningService } from '../learning/learning.service.js';
import { ArenaContestsService } from './arena-contests.service.js';

const problem = (overrides: Record<string, unknown> = {}) => ({
  id: 'p-1',
  status: 'PUBLISHED',
  xp: 100,
  title: 'A. Apples',
  arabicTitle: null,
  difficulty: 'Medium',
  difficultyIndex: 3,
  difficultyColor: '#c084fc',
  statement: 'Story',
  taskDescription: null,
  inputSpec: 'n',
  outputSpec: 'n*2',
  constraints: ['1 <= n <= 10'],
  examples: [{ input: '2', output: '4', explanation: '' }],
  note: null,
  hint: 'Double it.',
  timeLimit: '1 second',
  memoryLimit: '64 megabytes',
  starterCode: {},
  formattedProblem: 'text',
  imageData: null,
  imageMimeType: null,
  imagePrompt: null,
  canBeExplainedByDiagrams: false,
  storyPart: null,
  coreIdea: null,
  sourceDescription: 'A story about apples',
  generationMode: 'contest',
  batchId: 'b-1',
  rawOutput: {},
  createdById: 'admin-1',
  publishedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const attempt = (overrides: Record<string, unknown> = {}) => ({
  id: 'a-1',
  userId: 'student-1',
  problemId: 'p-1',
  hintUsed: false,
  hintUsedAt: null,
  solved: false,
  solvedAt: null,
  earnedXp: 0,
  submissionCount: 0,
  failedCount: 0,
  lastVerdict: null,
  lastLanguage: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ArenaProblemsService', () => {
  let prisma: any;
  let judge: any;
  let generator: any;
  let service: ArenaProblemsService;
  let attemptRow: ReturnType<typeof attempt>;
  let contests: any;
  let learning: any;
  let stage: string;
  let registered: boolean;
  // Hidden tests of the problem (none by default = legacy examples-only judging).
  let hiddenTests: Array<{ input: string; expectedOutput: string }>;

  beforeEach(() => {
    attemptRow = attempt();
    stage = 'live';
    registered = true;
    hiddenTests = [];
    prisma = {
      arenaProblem: {
        findUnique: vi.fn().mockResolvedValue(problem()),
        // findVisibleOrThrow loads the problem together with its contest.
        findFirst: vi.fn(async () => ({ ...problem(), contest: { id: 'b-1', status: 'CURRENT' } })),
        create: vi.fn(async ({ data }) => problem({ ...data, id: `new-${Math.random()}` })),
        update: vi.fn(async ({ data }) => problem(data)),
        delete: vi.fn(),
        deleteMany: vi.fn().mockResolvedValue({ count: 6 }),
      },
      arenaProblemAttempt: {
        findUnique: vi.fn(async () => attemptRow),
        findUniqueOrThrow: vi.fn(async () => attemptRow),
        create: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        // Simulates the conditional UPDATE ... WHERE used for hint/solve.
        updateMany: vi.fn(async ({ where, data }) => {
          const matches = Object.entries(where).every(
            ([k, v]) => k === 'id' || (attemptRow as any)[k] === v,
          );
          if (!matches) return { count: 0 };
          const next = { ...attemptRow } as any;
          for (const [k, v] of Object.entries(data)) {
            next[k] = v && typeof v === 'object' && 'increment' in (v as any)
              ? next[k] + (v as any).increment
              : v;
          }
          attemptRow = next;
          return { count: 1 };
        }),
        update: vi.fn(async ({ data }) => {
          const next = { ...attemptRow } as any;
          for (const [k, v] of Object.entries(data)) {
            next[k] = v && typeof v === 'object' && 'increment' in (v as any)
              ? next[k] + (v as any).increment
              : v;
          }
          attemptRow = next;
          return attemptRow;
        }),
      },
      user: { update: vi.fn() },
      adminAuditLog: { create: vi.fn() },
      arenaRegistration: {
        findUnique: vi.fn(async () => (registered ? { id: 'r-1' } : null)),
      },
      arenaContest: { create: vi.fn(), update: vi.fn() },
      arenaTestCase: { findMany: vi.fn(async () => hiddenTests) },
      $transaction: vi.fn(async (arg: any) => (typeof arg === 'function' ? arg(prisma) : Promise.all(arg))),
    };
    judge = {
      executeCode: vi.fn().mockResolvedValue({
        status: 'SUCCESS',
        stdout: '4\n',
        stderr: '',
        compileError: null,
        executionTime: '0.01s',
      }),
      normalizeOutput: (s: string) => (s || '').trim(),
      // The real executeBatch sends one Judge0 batch; here each input goes
      // through the executeCode mock so tests can simulate per-input output.
      executeBatch: vi.fn((code: string, lang: string, stdins: string[], tl?: number, ml?: number) =>
        Promise.all(stdins.map((stdin) => judge.executeCode(code, lang, stdin, tl, ml))),
      ),
      evaluateAiSubmission: vi.fn().mockResolvedValue({
        verdict: 'Accepted',
        failed_scenario: 'None',
        feedback_ar: 'ممتاز',
      }),
    };
    generator = {
      generateContest: vi.fn(),
    };
    contests = {
      stageOf: vi.fn(() => stage),
      findContestOrThrow: vi.fn(async () => ({ id: 'b-1', status: 'CURRENT', story: 'A story' })),
      findCurrentContest: vi.fn(async () => ({ id: 'b-1', status: 'CURRENT', story: 'A story' })),
      retireCurrentContests: vi.fn().mockResolvedValue([]),
      finalizeDueContests: vi.fn(),
    };
    learning = { recordActivityAndStreak: vi.fn().mockResolvedValue({}) };
    service = new ArenaProblemsService(
      prisma as PrismaService,
      generator as ArenaProblemGeneratorService,
      judge as JudgeService,
      contests as ArenaContestsService,
      learning as LearningService,
    );
  });

  describe('hint', () => {
    it('hides the hint until it is revealed', async () => {
      const view = await service.getPublished('student-1', 'p-1');
      expect(view.hint).toBeNull();
      expect(view.hintRevealed).toBe(false);
      expect(view.progress.maxEarnableXp).toBe(100);
    });

    it('applies the 25% penalty exactly once', async () => {
      const first = await service.useHint('student-1', 'p-1');
      expect(first.hint).toBe('Double it.');
      expect(first.penaltyApplied).toBe(true);
      expect(first.progress.maxEarnableXp).toBe(75);

      const second = await service.useHint('student-1', 'p-1');
      expect(second.penaltyApplied).toBe(false);
      expect(second.progress.maxEarnableXp).toBe(75);
    });

    it('does not penalise a student who already solved the problem', async () => {
      attemptRow = attempt({ solved: true, earnedXp: 100 });
      const res = await service.useHint('student-1', 'p-1');
      expect(res.penaltyApplied).toBe(false);
      expect(res.progress.hintUsed).toBe(false);
      expect(res.hint).toBe('Double it.');
    });

    it('refuses hints on unpublished problems', async () => {
      prisma.arenaProblem.findFirst.mockResolvedValue(null);
      await expect(service.useHint('student-1', 'p-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('submit', () => {
    it('awards full problem XP without a hint', async () => {
      const res = await service.submit('student-1', 'p-1', { code: 'x', language: 'cpp' });
      expect(res.verdict).toBe('Accepted');
      expect(res.xpAwarded).toBe(100);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ totalXp: { increment: 100 } }) }),
      );
    });

    it('awards 75% after a hint, and fractional XP for 25-XP problems', async () => {
      prisma.arenaProblem.findFirst.mockResolvedValue({ ...problem({ xp: 25 }), contest: { id: 'b-1', status: 'CURRENT' } });
      await service.useHint('student-1', 'p-1');
      const res = await service.submit('student-1', 'p-1', { code: 'x', language: 'cpp' });
      expect(res.xpAwarded).toBe(18.75);
      expect(res.progress.earnedXp).toBe(18.75);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ totalXp: { increment: 18.75 } }) }),
      );
    });

    it('never awards XP twice for the same problem', async () => {
      await service.submit('student-1', 'p-1', { code: 'x' });
      const again = await service.submit('student-1', 'p-1', { code: 'x' });
      expect(again.xpAwarded).toBe(0);
      expect(again.alreadySolved).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });

    it('ignores client-supplied XP fields entirely', async () => {
      const res = await service.submit('student-1', 'p-1', {
        code: 'x',
        earnedXp: 150,
        xp: 150,
      } as any);
      expect(res.xpAwarded).toBe(100);
    });

    it('awards nothing on a wrong answer and skips the AI judge', async () => {
      judge.executeCode.mockResolvedValue({
        status: 'SUCCESS',
        stdout: '5',
        stderr: '',
        compileError: null,
        executionTime: null,
      });
      const res = await service.submit('student-1', 'p-1', { code: 'x' });
      expect(res.verdict).toBe('Wrong Answer');
      expect(res.xpAwarded).toBe(0);
      expect(res.hint).toBeNull();
      expect(judge.evaluateAiSubmission).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    describe('when the AI judge is down', () => {
      beforeEach(() => {
        judge.evaluateAiSubmission.mockResolvedValue({
          verdict: 'Run Time Error',
          failed_scenario: '403 PERMISSION_DENIED',
          feedback_ar: 'error',
          judge_error: true,
        });
      });
      afterEach(() => {
        delete process.env.ARENA_REQUIRE_AI_JUDGE;
      });

      it('keeps the real-execution verdict instead of blaming the student', async () => {
        const res = await service.submit('student-1', 'p-1', { code: 'x' });
        expect(res.verdict).toBe('Accepted');
        expect(res.aiReviewed).toBe(false);
        expect(res.xpAwarded).toBe(100);
      });

      it('refuses without counting when ARENA_REQUIRE_AI_JUDGE=true', async () => {
        process.env.ARENA_REQUIRE_AI_JUDGE = 'true';
        await expect(service.submit('student-1', 'p-1', { code: 'x' })).rejects.toBeInstanceOf(
          ServiceUnavailableException,
        );
        expect(attemptRow.submissionCount).toBe(0);
        expect(prisma.user.update).not.toHaveBeenCalled();
      });
    });

    it('does not leak the hint into the AI judge prompt', async () => {
      await service.submit('student-1', 'p-1', { code: 'x' });
      const { problemText } = judge.evaluateAiSubmission.mock.calls[0][0];
      expect(problemText).not.toContain('Double it.');
    });
  });

  describe('admin generation (6-problem sets only)', () => {
    // Generation is only allowed when no contest is live.
    beforeEach(() => {
      stage = 'ended';
    });

    const generatedSet = () =>
      [25, 50, 75, 100, 125, 150].map((xp, i) => ({
        ...problem({ id: undefined, status: undefined, batchId: undefined }),
        xp,
        difficultyIndex: i,
        title: `Problem ${i + 1}`,
      }));

    it('saves nothing when the generator fails', async () => {
      generator.generateContest.mockRejectedValue(new BadGatewayException('Problem generation failed'));
      await expect(
        service.generate('admin-1', { description: 'A story about apples' }),
      ).rejects.toBeInstanceOf(BadGatewayException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.arenaProblem.create).not.toHaveBeenCalled();
    });

    it('stores the 6 problems as one draft set with XP 25..150', async () => {
      generator.generateContest.mockResolvedValue(generatedSet());
      const res = await service.generate('admin-1', { description: 'A story about apples' });
      expect(res.problems).toHaveLength(6);
      const created = prisma.arenaProblem.create.mock.calls.map((c: any) => c[0].data);
      expect(created.map((d: any) => d.xp)).toEqual([25, 50, 75, 100, 125, 150]);
      expect(new Set(created.map((d: any) => d.batchId)).size).toBe(1);
      expect(created.every((d: any) => d.status === 'DRAFT' && d.generationMode === 'contest')).toBe(true);
    });

    it('retires the current contest and creates the new one in the same transaction', async () => {
      const order: string[] = [];
      contests.retireCurrentContests.mockImplementation(async () => {
        order.push('retire');
        return ['old-contest'];
      });
      prisma.arenaContest.create.mockImplementation(async () => {
        order.push('contest');
      });
      prisma.arenaProblem.create.mockImplementation(async ({ data }: any) => {
        order.push('problem');
        return problem(data);
      });
      generator.generateContest.mockResolvedValue(generatedSet());

      const res = await service.generate('admin-1', { description: 'A story about apples' });
      expect(order).toEqual(['retire', 'contest', ...Array(6).fill('problem')]);
      expect(prisma.arenaContest.create.mock.calls[0][0].data.id).toBe(res.batchId);
      expect(prisma.arenaProblem.deleteMany).not.toHaveBeenCalled();
      // The archived contest gets its medals right away.
      expect(contests.finalizeDueContests).toHaveBeenCalled();
    });

    it('schedules the new contest for the next Sunday slot', async () => {
      generator.generateContest.mockResolvedValue(generatedSet());
      await service.generate('admin-1', { description: 'A story about apples' });
      const { startsAt, endsAt } = prisma.arenaContest.create.mock.calls[0][0].data;
      expect(startsAt).toBeInstanceOf(Date);
      expect(endsAt.getTime() - startsAt.getTime()).toBe(3 * 3600_000);
      expect(startsAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('refuses to generate while a contest is live', async () => {
      stage = 'live';
      await expect(service.generate('admin-1', { description: 'A story about apples' })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(generator.generateContest).not.toHaveBeenCalled();
    });

    it('keeps the old contest untouched when generation fails', async () => {
      generator.generateContest.mockRejectedValue(new BadGatewayException('quota'));
      await expect(service.generate('admin-1', { description: 'A story about apples' })).rejects.toThrow();
      expect(contests.retireCurrentContests).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('refuses to regenerate a set once students attempted it', async () => {
      prisma.arenaProblem.findMany = vi.fn().mockResolvedValue([problem()]);
      prisma.arenaProblemAttempt.count.mockResolvedValue(2);
      await expect(service.regenerateBatch('admin-1', 'b-1', {})).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(generator.generateContest).not.toHaveBeenCalled();
    });

    it('regenerates the set in place: existing tier rows are updated, not duplicated', async () => {
      const existing = [25, 50, 75, 100, 125, 150].map((xp, i) =>
        problem({ id: `p-${i}`, xp, difficultyIndex: i, status: 'PUBLISHED' }),
      );
      prisma.arenaProblem.findMany = vi.fn().mockResolvedValue(existing);
      prisma.arenaProblem.update = vi.fn(async ({ where, data }) => problem({ ...data, id: where.id }));
      prisma.arenaProblem.deleteMany = vi.fn();
      generator.generateContest.mockResolvedValue(generatedSet());

      const res = await service.regenerateBatch('admin-1', 'b-1', {});
      expect(prisma.arenaProblem.create).not.toHaveBeenCalled();
      expect(res.problems.map((p: any) => p.id)).toEqual(existing.map((p) => p.id));
      expect(res.problems.every((p: any) => p.status === 'DRAFT')).toBe(true);
      expect(prisma.arenaProblem.deleteMany).toHaveBeenCalledWith({
        where: { batchId: 'b-1', id: { notIn: existing.map((p) => p.id) } },
      });
    });
  });
  describe('contest window and registration (server-enforced)', () => {
    it('refuses submissions when the contest is not live', async () => {
      for (const closed of ['ended', 'archived']) {
        stage = closed;
        await expect(service.submit('student-1', 'p-1', { code: 'x' })).rejects.toBeInstanceOf(
          ForbiddenException,
        );
      }
      expect(judge.executeCode).not.toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('hides problems before the contest starts', async () => {
      stage = 'upcoming';
      await expect(service.getPublished('student-1', 'p-1')).rejects.toBeInstanceOf(ForbiddenException);
      await expect(service.runExamples('p-1', { code: 'x' })).rejects.toBeInstanceOf(ForbiddenException);
      expect(await service.listPublished('student-1')).toEqual([]);
    });

    it('requires registration to submit or pay for a hint', async () => {
      registered = false;
      await expect(service.submit('student-1', 'p-1', { code: 'x' })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(service.useHint('student-1', 'p-1')).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('gives the hint for free after the contest, without recording anything', async () => {
      stage = 'ended';
      const res = await service.useHint('student-1', 'p-1');
      expect(res.hint).toBe('Double it.');
      expect(res.penaltyApplied).toBe(false);
      expect(res.practice).toBe(true);
      expect(prisma.arenaProblemAttempt.updateMany).not.toHaveBeenCalled();
    });

    it('still allows running examples after the contest ended', async () => {
      stage = 'archived';
      const res = await service.runExamples('p-1', { code: 'x' });
      expect(res.verdict).toBe('Accepted');
    });

    it('tells the client whether it can submit', async () => {
      const live = await service.getPublished('student-1', 'p-1');
      expect(live.competition).toEqual({ contestId: 'b-1', stage: 'live', registered: true, canSubmit: true });
      stage = 'ended';
      const ended = await service.getPublished('student-1', 'p-1');
      expect(ended.competition.canSubmit).toBe(false);
    });
  });

  describe('leaderboard bookkeeping and platform XP integration', () => {
    it('counts rejected submissions only until the problem is solved', async () => {
      judge.executeCode.mockResolvedValueOnce({
        status: 'SUCCESS', stdout: '5', stderr: '', compileError: null, executionTime: null,
      });
      await service.submit('student-1', 'p-1', { code: 'wrong' });
      expect(attemptRow.failedCount).toBe(1);

      await service.submit('student-1', 'p-1', { code: 'right' });
      expect(attemptRow.solved).toBe(true);

      judge.executeCode.mockResolvedValueOnce({
        status: 'SUCCESS', stdout: '5', stderr: '', compileError: null, executionTime: null,
      });
      await service.submit('student-1', 'p-1', { code: 'wrong again' });
      expect(attemptRow.failedCount).toBe(1);
    });

    it('records the solve in the streak / DailyActivity / achievements without double-crediting XP', async () => {
      await service.submit('student-1', 'p-1', { code: 'x' });
      expect(learning.recordActivityAndStreak).toHaveBeenCalledWith('student-1', {
        isChallenge: true,
        xpEarned: 100,
        creditTotalXp: false,
      });
      // XP was credited exactly once, inside the submit transaction.
      expect(prisma.user.update).toHaveBeenCalledTimes(1);

      learning.recordActivityAndStreak.mockClear();
      await service.submit('student-1', 'p-1', { code: 'x' });
      expect(learning.recordActivityAndStreak).not.toHaveBeenCalled();
    });
  });
  describe('hidden tests (the anti-cheat judging)', () => {
    // The example of the fixture problem is "2" -> "4" (double it).
    // A "program" here is simulated by mapping stdin -> stdout.
    const runs = (program: (stdin: string) => string) =>
      judge.executeCode.mockImplementation(async (_code: string, _lang: string, stdin: string) => ({
        status: 'SUCCESS',
        stdout: program(stdin),
        stderr: '',
        compileError: null,
        executionTime: '0.01s',
      }));
    const correct = (stdin: string) => String(Number(stdin) * 2);
    const hardcoded = (stdin: string) => (stdin === '2' ? '4' : '0');

    beforeEach(() => {
      hiddenTests = [
        { input: '7', expectedOutput: '14' },
        { input: '0', expectedOutput: '0' },
        { input: '1000000000', expectedOutput: '2000000000' },
      ];
    });

    it('rejects a solution that only hardcodes the visible examples', async () => {
      runs(hardcoded);
      const res = await service.submit('student-1', 'p-1', { code: 'if x == 2: print(4)' });
      expect(res.verdict).toBe('Wrong Answer');
      expect(res.failedScenario).toBe('Hidden test 1');
      expect(res.exampleResults.every((r: any) => r.passed)).toBe(true);
      expect(res.xpAwarded).toBe(0);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('accepts a correct solution only after every hidden test passes', async () => {
      runs(correct);
      const res = await service.submit('student-1', 'p-1', { code: 'print(int(input()) * 2)' });
      expect(res.verdict).toBe('Accepted');
      expect(res.hiddenTests).toEqual({ total: 3, passed: 3, failedTest: null });
      expect(res.xpAwarded).toBe(100);
      // 1 example + 3 hidden tests were executed.
      expect(judge.executeCode).toHaveBeenCalledTimes(4);
    });

    it('never puts hidden inputs or outputs in the response', async () => {
      runs((stdin) => (stdin === '1000000000' ? '-1' : correct(stdin)));
      const res = await service.submit('student-1', 'p-1', { code: 'x' });
      expect(res.failedScenario).toBe('Hidden test 3');
      expect(res.hiddenTests).toEqual({ total: 3, passed: 2, failedTest: 3 });
      const body = JSON.stringify(res);
      expect(body).not.toContain('1000000000');
      expect(body).not.toContain('2000000000');
    });

    it('decides from the tests alone — the AI judge is not consulted', async () => {
      runs(correct);
      await service.submit('student-1', 'p-1', { code: 'x' });
      expect(judge.evaluateAiSubmission).not.toHaveBeenCalled();
    });

    it('sends the examples and every hidden test in ONE batch, in order', async () => {
      hiddenTests = Array.from({ length: 10 }, (_, i) => ({ input: String(i + 1), expectedOutput: String((i + 1) * 2) }));
      runs(hardcoded);
      const res = await service.submit('student-1', 'p-1', { code: 'x' });
      expect(judge.executeBatch).toHaveBeenCalledTimes(1);
      const stdins = judge.executeBatch.mock.calls[0][2];
      expect(stdins).toEqual(['2', ...hiddenTests.map((t) => t.input)]);
      // The earliest failing case is reported, even though all ran.
      expect(res.failedScenario).toBe('Hidden test 1');
      // Hidden test 2 has input "2" (same as the example), so the hardcoded answer passes that one.
      expect(res.hiddenTests).toEqual({ total: 10, passed: 1, failedTest: 1 });
    });

    it('reports a slow solution as Time Limit Exceeded on the hidden test', async () => {
      judge.executeCode.mockImplementation(async (_c: string, _l: string, stdin: string) =>
        stdin === '1000000000'
          ? { status: 'TIME_LIMIT_EXCEEDED', stdout: '', stderr: 'Time limit exceeded', compileError: null, executionTime: null }
          : { status: 'SUCCESS', stdout: correct(stdin), stderr: '', compileError: null, executionTime: '0.01s' },
      );
      const res = await service.submit('student-1', 'p-1', { code: 'x' });
      expect(res.verdict).toBe('Time Limit Exceeded');
      expect(res.failedScenario).toBe('Hidden test 3');
    });

    it('Run uses the visible examples only', async () => {
      runs(hardcoded);
      const res = await service.runExamples('p-1', { code: 'x' });
      expect(res.verdict).toBe('Accepted');
      expect(judge.executeCode).toHaveBeenCalledTimes(1);
      expect(res).not.toHaveProperty('hiddenTests');
    });

    it('does not expose the reference solution or tests to students', async () => {
      prisma.arenaProblem.findFirst.mockResolvedValue({
        ...problem({ referenceSolution: 'SECRET_REF', bruteForceSolution: 'SECRET_BRUTE' }),
        contest: { id: 'b-1', status: 'CURRENT' },
      });
      const view = JSON.stringify(await service.getPublished('student-1', 'p-1'));
      expect(view).not.toContain('SECRET_REF');
      expect(view).not.toContain('SECRET_BRUTE');
      expect(prisma.arenaTestCase.findMany).not.toHaveBeenCalled();
    });
  });
});
