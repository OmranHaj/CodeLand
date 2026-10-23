import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ArenaProblem, ArenaProblemAttempt, ArenaProblemStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { JudgeService } from '../judge/judge.service.js';
import { LearningService } from '../learning/learning.service.js';
import { ArenaContestsService } from './arena-contests.service.js';
import { canCompete, canViewProblems, nextContestWindow } from './arena-contest.util.js';
import {
  ArenaExample,
  ArenaProblemGeneratorService,
  GeneratedArenaProblem,
} from './arena-problem-generator.service.js';
import { calculateEarnedXp, HINT_PENALTY_RATE } from './arena-xp.util.js';
import {
  GenerateArenaContestDto,
  RegenerateArenaContestDto,
} from './dto/generate-arena-problem.dto.js';
import { UpdateArenaProblemDto } from './dto/update-arena-problem.dto.js';
import { ArenaSolutionDto } from './dto/arena-solution.dto.js';

/** Every column except the image bytes, for list queries. */
const PROBLEM_SUMMARY_SELECT = {
  id: true,
  status: true,
  xp: true,
  title: true,
  arabicTitle: true,
  difficulty: true,
  difficultyIndex: true,
  difficultyColor: true,
  imageMimeType: true,
  generationMode: true,
  batchId: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArenaProblemSelect;

type ArenaVerdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Run Time Error'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded';

@Injectable()
export class ArenaProblemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: ArenaProblemGeneratorService,
    private readonly judge: JudgeService,
    private readonly contests: ArenaContestsService,
    private readonly learning: LearningService,
  ) {}

  // ===========================================================================
  // ADMIN
  // ===========================================================================

  async listForAdmin(status?: string) {
    const where: Prisma.ArenaProblemWhereInput = {};
    if (status === 'DRAFT' || status === 'PUBLISHED') {
      where.status = status;
    }

    const problems = await this.prisma.arenaProblem.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { difficultyIndex: 'asc' }],
      select: {
        ...PROBLEM_SUMMARY_SELECT,
        sourceDescription: true,
        _count: { select: { attempts: true } },
      },
    });

    const solvedCounts = await this.prisma.arenaProblemAttempt.groupBy({
      by: ['problemId'],
      where: { solved: true, problemId: { in: problems.map((p) => p.id) } },
      _count: { _all: true },
    });
    const solvedByProblem = new Map(solvedCounts.map((s) => [s.problemId, s._count._all]));

    return problems.map(({ _count, imageMimeType, ...problem }) => ({
      ...problem,
      hasImage: Boolean(imageMimeType),
      attemptCount: _count.attempts,
      solvedCount: solvedByProblem.get(problem.id) ?? 0,
    }));
  }

  async getForAdmin(id: string) {
    const problem = await this.findProblemOrThrow(id);
    const [attemptCount, solvedCount, hintCount, tests] = await Promise.all([
      this.prisma.arenaProblemAttempt.count({ where: { problemId: id } }),
      this.prisma.arenaProblemAttempt.count({ where: { problemId: id, solved: true } }),
      this.prisma.arenaProblemAttempt.count({ where: { problemId: id, hintUsed: true } }),
      this.prisma.arenaTestCase.findMany({
        where: { problemId: id },
        orderBy: { order: 'asc' },
        select: { order: true, kind: true, input: true, expectedOutput: true },
      }),
    ]);
    const preview = (text: string) => (text.length > 160 ? `${text.slice(0, 160)}… (${text.length} chars)` : text);
    return {
      ...this.toAdminView(problem, { attemptCount, solvedCount, hintCount }),
      // Admin only: hidden tests are never part of any student response.
      hiddenTests: tests.map((t) => ({
        number: t.order + 1,
        kind: t.kind,
        input: preview(t.input),
        expectedOutput: preview(t.expectedOutput),
      })),
    };
  }

  /**
   * Runs the generator (always 6 connected problems, one per XP tier) and
   * stores them as a new contest, as DRAFTs for preview.
   *
   * The previous contest leaves the arena: if students could have seen it, it
   * is ARCHIVED with its standings and medals (history); a never-published
   * draft set is simply deleted. Generation happens before any DB write and
   * everything else runs in one transaction: if generation fails nothing
   * changes, and a half-written set can never exist.
   */
  async generate(adminId: string, dto: GenerateArenaContestDto) {
    // Generating archives the current contest, so never do it mid-contest.
    const current = await this.contests.findCurrentContest();
    if (current && this.contests.stageOf(current) === 'live') {
      throw new ConflictException(
        'A contest is live right now. Generate the next one after it closes, so the live contest is not archived mid-way.',
      );
    }

    const description = dto.description.trim();
    const generated = await this.generator.generateContest(description);

    const batchId = randomUUID();
    const { created, archived } = await this.prisma.$transaction(async (tx) => {
      const archived = await this.contests.retireCurrentContests(tx);
      // Scheduled straight away for the next weekly slot (Sunday 17:00-20:00);
      // registration opens one week before it.
      await tx.arenaContest.create({
        data: {
          id: batchId,
          title: 'Sunday Arena',
          story: description,
          createdById: adminId,
          ...nextContestWindow(),
        },
      });
      const rows: ArenaProblem[] = [];
      for (const problem of generated) {
        rows.push(
          await tx.arenaProblem.create({
            data: {
              ...this.toProblemData(problem),
              status: ArenaProblemStatus.DRAFT,
              sourceDescription: description,
              generationMode: 'contest',
              batchId,
              createdById: adminId,
            },
          }),
        );
      }
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: 'ARENA_CONTEST_GENERATED',
          metadata: { batchId, problemIds: rows.map((r) => r.id), archivedContests: archived },
        },
      });
      return { created: rows, archived };
    });

    // Archived contests get their medals now.
    if (archived.length > 0) await this.contests.finalizeDueContests();

    return { batchId, problems: created.map((p) => this.toAdminView(p)) };
  }

  /**
   * Regenerates a whole 6-problem set in place: each tier's row keeps its id
   * and receives the new content, so no stale copy or image is left behind.
   * Refused once any student attempted a problem of the set, because their
   * hint/XP records refer to the current content.
   */
  async regenerateBatch(adminId: string, batchId: string, dto: RegenerateArenaContestDto) {
    const existing = await this.findBatchOrThrow(batchId);
    const contest = await this.contests.findContestOrThrow(batchId);
    if (contest.status !== 'CURRENT') {
      throw new ConflictException('Archived contests cannot be regenerated.');
    }
    await this.assertBatchHasNoAttempts(batchId);

    const description = dto.description?.trim() || contest.story || existing[0].sourceDescription;
    const generated = await this.generator.generateContest(description);

    const updated = await this.prisma.$transaction(async (tx) => {
      // Re-check inside the transaction in case a student started meanwhile.
      const attempts = await tx.arenaProblemAttempt.count({ where: { problem: { batchId } } });
      if (attempts > 0) {
        throw new ConflictException(
          'Students started this set while it was regenerating. Generate a new set instead.',
        );
      }
      const rowByTier = new Map(existing.map((p) => [p.difficultyIndex, p]));
      const rows: ArenaProblem[] = [];
      for (const problem of generated) {
        const data = {
          ...this.toProblemData(problem),
          status: ArenaProblemStatus.DRAFT,
          publishedAt: null,
          sourceDescription: description,
          generationMode: 'contest',
          batchId,
        };
        const current = rowByTier.get(problem.difficultyIndex);
        rows.push(
          current
            ? await tx.arenaProblem.update({ where: { id: current.id }, data })
            : await tx.arenaProblem.create({ data: { ...data, createdById: adminId } }),
        );
      }
      // Rows of the old set that no longer match a tier (e.g. duplicates) are removed.
      const keep = new Set(rows.map((r) => r.id));
      await tx.arenaProblem.deleteMany({
        where: { batchId, id: { notIn: [...keep] } },
      });
      await tx.arenaContest.update({ where: { id: batchId }, data: { story: description } });
      await tx.adminAuditLog.create({
        data: { adminId, action: 'ARENA_CONTEST_REGENERATED', metadata: { batchId } },
      });
      return rows;
    });

    return { batchId, problems: updated.map((p) => this.toAdminView(p)) };
  }

  async update(id: string, dto: UpdateArenaProblemDto) {
    const problem = await this.findProblemOrThrow(id);
    const data: Prisma.ArenaProblemUpdateInput = {};

    const textFields = [
      'title',
      'arabicTitle',
      'difficulty',
      'statement',
      'inputSpec',
      'outputSpec',
      'note',
      'hint',
      'timeLimit',
      'memoryLimit',
    ] as const;
    for (const field of textFields) {
      if (dto[field] !== undefined) {
        const value = dto[field]!.trim();
        (data as Record<string, unknown>)[field] = value || null;
      }
    }
    for (const required of ['title', 'difficulty', 'statement', 'inputSpec', 'outputSpec', 'hint'] as const) {
      if (dto[required] !== undefined && !dto[required]!.trim()) {
        throw new BadRequestException(`${required} cannot be empty.`);
      }
    }
    if (dto.constraints !== undefined) {
      data.constraints = dto.constraints.map((c) => c.trim()).filter(Boolean);
    }
    if (dto.examples !== undefined) {
      data.examples = dto.examples.map((ex) => ({
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation?.trim() || '',
      })) as unknown as Prisma.InputJsonValue;
    }
    if (dto.xp !== undefined) {
      data.xp = dto.xp;
    }

    // Keep the plain-text rendering in sync with the edited fields.
    const merged = { ...problem, ...data } as ArenaProblem;
    data.formattedProblem = this.buildProblemText(merged, true);

    const updated = await this.prisma.arenaProblem.update({ where: { id }, data });
    return this.toAdminView(updated);
  }

  async setXp(id: string, xp: number) {
    await this.findProblemOrThrow(id);
    const updated = await this.prisma.arenaProblem.update({ where: { id }, data: { xp } });
    return this.toAdminView(updated);
  }

  async setStatus(adminId: string, id: string, status: ArenaProblemStatus) {
    await this.findProblemOrThrow(id);
    const updated = await this.prisma.$transaction(async (tx) => {
      const row = await tx.arenaProblem.update({
        where: { id },
        data: {
          status,
          publishedAt: status === ArenaProblemStatus.PUBLISHED ? new Date() : null,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action:
            status === ArenaProblemStatus.PUBLISHED
              ? 'ARENA_PROBLEM_PUBLISHED'
              : 'ARENA_PROBLEM_UNPUBLISHED',
          metadata: { problemId: id },
        },
      });
      return row;
    });
    return this.toAdminView(updated);
  }

  /**
   * Deletes the problem and (via cascade) its attempt rows. XP students
   * already earned stays on their account.
   */
  async remove(adminId: string, id: string) {
    const problem = await this.findProblemOrThrow(id);
    await this.prisma.$transaction([
      this.prisma.arenaProblem.delete({ where: { id } }),
      this.prisma.adminAuditLog.create({
        data: {
          adminId,
          action: 'ARENA_PROBLEM_DELETED',
          metadata: { problemId: id, title: problem.title },
        },
      }),
    ]);
    return { success: true, id };
  }

  // ===========================================================================
  // STUDENT
  // ===========================================================================

  /**
   * Published problems of a contest (the current one by default). Empty until
   * the contest's live window opens, so nobody can read the problems early.
   */
  async listPublished(userId: string, contestId?: string) {
    const contest = contestId
      ? await this.contests.findContestOrThrow(contestId)
      : await this.contests.findCurrentContest();
    if (!contest || !canViewProblems(this.contests.stageOf(contest))) return [];

    const problems = await this.prisma.arenaProblem.findMany({
      where: { batchId: contest.id, status: ArenaProblemStatus.PUBLISHED },
      orderBy: [{ difficultyIndex: 'asc' }, { publishedAt: 'desc' }],
      select: PROBLEM_SUMMARY_SELECT,
    });
    const attempts = await this.prisma.arenaProblemAttempt.findMany({
      where: { userId, problemId: { in: problems.map((p) => p.id) } },
    });
    const attemptByProblem = new Map(attempts.map((a) => [a.problemId, a]));

    return problems.map(({ imageMimeType, status, ...problem }) => ({
      ...problem,
      contestId: contest.id,
      story: contest.story,
      hasImage: Boolean(imageMimeType),
      progress: this.toProgress(problem.xp, attemptByProblem.get(problem.id) ?? null),
    }));
  }

  async getPublished(userId: string, id: string) {
    const { problem, contest, stage } = await this.findVisibleOrThrow(id);
    const [attempt, registered] = await Promise.all([
      this.prisma.arenaProblemAttempt.findUnique({
        where: { userId_problemId: { userId, problemId: id } },
      }),
      this.isRegistered(contest.id, userId),
    ]);
    return {
      ...this.toStudentView(problem, attempt),
      competition: {
        contestId: contest.id,
        stage,
        registered,
        canSubmit: canCompete(stage) && registered,
      },
    };
  }

  /**
   * Reveals the hint. The 25% penalty is recorded at most once per student
   * per problem: the conditional update only matches while hintUsed=false and
   * solved=false, so repeated or concurrent calls cannot apply it twice, and a
   * student who already solved the problem sees the hint without penalty.
   */
  async useHint(userId: string, id: string) {
    const { problem, contest, stage } = await this.findVisibleOrThrow(id);

    // Outside the live window no XP can be earned, so the hint is free practice
    // material and nothing is recorded.
    if (!canCompete(stage)) {
      const existing = await this.prisma.arenaProblemAttempt.findUnique({
        where: { userId_problemId: { userId, problemId: id } },
      });
      return {
        hint: problem.hint,
        penaltyApplied: false,
        practice: true,
        progress: this.toProgress(problem.xp, existing),
      };
    }
    await this.assertRegistered(contest.id, userId);
    const attempt = await this.ensureAttempt(userId, id);

    const { count } = await this.prisma.arenaProblemAttempt.updateMany({
      where: { id: attempt.id, hintUsed: false, solved: false },
      data: { hintUsed: true, hintUsedAt: new Date() },
    });
    const current = await this.prisma.arenaProblemAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
    });

    return {
      hint: problem.hint,
      penaltyApplied: count === 1,
      practice: false,
      progress: this.toProgress(problem.xp, current),
    };
  }

  /** Runs the code against the problem's visible examples only. Never awards XP. */
  async runExamples(id: string, dto: ArenaSolutionDto) {
    const { problem } = await this.findVisibleOrThrow(id);
    const { hiddenTests, ...run } = await this.executeSuite(problem, dto, []);
    return run;
  }

  /**
   * Judges a submission by running it on the real executor against the
   * visible examples AND every hidden test; the verdict comes from comparing
   * outputs only. Hidden test inputs/outputs are never returned. XP is
   * computed here from the stored hint flag; nothing XP-related is read from
   * the request.
   *
   * Problems without hidden tests (older generated ones) fall back to the
   * previous behaviour: examples + AI review.
   */
  async submit(userId: string, id: string, dto: ArenaSolutionDto) {
    const { problem, contest, stage } = await this.findVisibleOrThrow(id);
    if (!canCompete(stage)) {
      throw new ForbiddenException(
        'Submissions are closed: this contest is not live right now. You can still run your code on the examples.',
      );
    }
    await this.assertRegistered(contest.id, userId);
    const attempt = await this.ensureAttempt(userId, id);
    const language = dto.language || 'cpp';

    const hiddenTests = await this.prisma.arenaTestCase.findMany({
      where: { problemId: problem.id },
      orderBy: { order: 'asc' },
      select: { input: true, expectedOutput: true },
    });
    const run = await this.executeSuite(problem, dto, hiddenTests);
    let verdict: ArenaVerdict = run.verdict;
    let feedback = run.feedback;
    let failedScenario: string | null = run.failedScenario;

    // With hidden tests the executor's verdict is final (no AI call, so the
    // submission is faster and never depends on Gemini). Without them, the AI
    // judge reviews accepted code for edge cases; if it is down the real
    // execution verdict stands, unless ARENA_REQUIRE_AI_JUDGE=true (-> 503).
    let aiReviewed = false;
    if (verdict === 'Accepted' && hiddenTests.length === 0) {
      const ai = await this.judge.evaluateAiSubmission({
        problemText: this.buildProblemText(problem, false),
        studentCode: dto.code,
      });
      if (ai.judge_error) {
        if (process.env.ARENA_REQUIRE_AI_JUDGE === 'true') {
          throw new ServiceUnavailableException(
            'Your code passed all examples, but the AI judge is unavailable right now. The submission was not counted — please try again shortly.',
          );
        }
        feedback = 'All examples passed on the real judge. (AI edge-case review is unavailable right now.)';
      } else {
        aiReviewed = true;
        verdict = ai.verdict === 'Accepted' ? 'Accepted' : this.normalizeVerdict(ai.verdict);
        feedback = ai.feedback_ar || feedback;
        failedScenario = ai.verdict === 'Accepted' ? null : ai.failed_scenario || null;
      }
    }

    const accepted = verdict === 'Accepted';
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.arenaProblemAttempt.update({
        where: { id: attempt.id },
        data: {
          submissionCount: { increment: 1 },
          lastVerdict: verdict,
          lastLanguage: language,
        },
      });
      if (!accepted) {
        // Rejections only count against the leaderboard until the problem is solved.
        await tx.arenaProblemAttempt.updateMany({
          where: { id: attempt.id, solved: false },
          data: { failedCount: { increment: 1 } },
        });
      }

      let xpAwarded = 0;
      if (accepted) {
        // Only the first accepted submission flips solved=false -> true.
        const { count } = await tx.arenaProblemAttempt.updateMany({
          where: { id: attempt.id, solved: false },
          data: { solved: true, solvedAt: new Date() },
        });
        if (count === 1) {
          // hintUsed can no longer change: useHint requires solved=false and
          // waits on this row lock until we commit.
          const locked = await tx.arenaProblemAttempt.findUniqueOrThrow({
            where: { id: attempt.id },
          });
          xpAwarded = calculateEarnedXp(problem.xp, locked.hintUsed);
          await tx.arenaProblemAttempt.update({
            where: { id: attempt.id },
            data: { earnedXp: xpAwarded },
          });
          await tx.user.update({
            where: { id: userId },
            data: { totalXp: { increment: xpAwarded }, lastActiveAt: new Date() },
          });
        }
      }

      const current = await tx.arenaProblemAttempt.findUniqueOrThrow({
        where: { id: attempt.id },
      });
      return { xpAwarded, current };
    });

    if (result.xpAwarded > 0) {
      // Same bookkeeping as lessons/challenges: streak, DailyActivity and
      // achievements (xp-1000 ...). XP itself was already credited above.
      await this.learning
        .recordActivityAndStreak(userId, {
          isChallenge: true,
          xpEarned: result.xpAwarded,
          creditTotalXp: false,
        })
        .catch(() => undefined);
    }

    return {
      verdict,
      feedback,
      failedScenario,
      aiReviewed,
      exampleResults: run.exampleResults,
      hiddenTests: run.hiddenTests,
      xpAwarded: result.xpAwarded,
      alreadySolved: accepted && result.xpAwarded === 0,
      hint: result.current.solved ? problem.hint : null,
      progress: this.toProgress(problem.xp, result.current),
    };
  }

  async getMyXp(userId: string) {
    const attempts = await this.prisma.arenaProblemAttempt.findMany({
      where: { userId },
      include: { problem: { select: { id: true, title: true, xp: true, status: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true },
    });

    const solved = attempts.filter((a) => a.solved);
    return {
      arenaEarnedXp: solved.reduce((sum, a) => sum + a.earnedXp, 0),
      totalXp: user?.totalXp ?? 0,
      solvedCount: solved.length,
      hintsUsed: attempts.filter((a) => a.hintUsed).length,
      problems: attempts.map((a) => ({
        problemId: a.problemId,
        title: a.problem.title,
        problemXp: a.problem.xp,
        ...this.toProgress(a.problem.xp, a),
      })),
    };
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private async findProblemOrThrow(id: string) {
    const problem = await this.prisma.arenaProblem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException('Arena problem not found.');
    }
    return problem;
  }

  /** Students only ever see published problems; drafts look nonexistent. */
  /**
   * A published problem whose contest window has opened. Drafts look
   * nonexistent; problems of a contest that has not started are forbidden.
   */
  private async findVisibleOrThrow(id: string) {
    const problem = await this.prisma.arenaProblem.findFirst({
      where: { id, status: ArenaProblemStatus.PUBLISHED },
      include: { contest: true },
    });
    if (!problem || !problem.contest) {
      throw new NotFoundException('Arena problem not found.');
    }
    const { contest, ...rest } = problem;
    const stage = this.contests.stageOf(contest);
    if (!canViewProblems(stage)) {
      throw new ForbiddenException("This contest hasn't started yet.");
    }
    return { problem: rest as ArenaProblem, contest, stage };
  }

  private async isRegistered(contestId: string, userId: string) {
    const registration = await this.prisma.arenaRegistration.findUnique({
      where: { contestId_userId: { contestId, userId } },
    });
    return Boolean(registration);
  }

  private async assertRegistered(contestId: string, userId: string) {
    if (!(await this.isRegistered(contestId, userId))) {
      throw new ForbiddenException('Register for this contest first.');
    }
  }

  private async findBatchOrThrow(batchId: string) {
    const problems = await this.prisma.arenaProblem.findMany({
      where: { batchId },
      orderBy: { difficultyIndex: 'asc' },
    });
    if (problems.length === 0) {
      throw new NotFoundException('Arena problem set not found.');
    }
    return problems;
  }

  private async assertBatchHasNoAttempts(batchId: string) {
    const attempts = await this.prisma.arenaProblemAttempt.count({
      where: { problem: { batchId } },
    });
    if (attempts > 0) {
      throw new ConflictException(
        `This set cannot be regenerated: students already made ${attempts} attempt(s) on it. Generate a new set instead.`,
      );
    }
  }

  private async ensureAttempt(userId: string, problemId: string): Promise<ArenaProblemAttempt> {
    const existing = await this.prisma.arenaProblemAttempt.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    if (existing) return existing;
    try {
      return await this.prisma.arenaProblemAttempt.create({ data: { userId, problemId } });
    } catch (err) {
      // A concurrent request created it first.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return this.prisma.arenaProblemAttempt.findUniqueOrThrow({
          where: { userId_problemId: { userId, problemId } },
        });
      }
      throw err;
    }
  }

  private toProblemData(problem: GeneratedArenaProblem) {
    return {
      ...problem,
      constraints: problem.constraints as Prisma.InputJsonValue,
      examples: problem.examples as unknown as Prisma.InputJsonValue,
      starterCode: problem.starterCode as Prisma.InputJsonValue,
      rawOutput: problem.rawOutput as Prisma.InputJsonValue,
    };
  }

  private examplesOf(problem: ArenaProblem): ArenaExample[] {
    return Array.isArray(problem.examples) ? (problem.examples as unknown as ArenaExample[]) : [];
  }

  private constraintsOf(problem: ArenaProblem): string[] {
    return Array.isArray(problem.constraints) ? (problem.constraints as string[]) : [];
  }

  private imageUrlOf(problem: ArenaProblem): string | null {
    if (!problem.imageData || !problem.imageMimeType) return null;
    return `data:${problem.imageMimeType};base64,${Buffer.from(problem.imageData).toString('base64')}`;
  }

  /** Plain-text problem used for the AI judge (without the hint) and as formattedProblem. */
  private buildProblemText(problem: ArenaProblem, includeHint: boolean): string {
    const constraints = this.constraintsOf(problem);
    const examples = this.examplesOf(problem)
      .map((ex, i) => `Example ${i + 1}\nInput:\n${ex.input}\n\nOutput:\n${ex.output}`)
      .join('\n\n');
    const sections = [
      problem.title,
      `time limit per test: ${problem.timeLimit || 'N/A'}`,
      `memory limit per test: ${problem.memoryLimit || 'N/A'}`,
      '',
      problem.statement,
      '',
      `Input\n${problem.inputSpec}`,
      '',
      `Output\n${problem.outputSpec}`,
      '',
      `Constraints\n${constraints.map((c) => `- ${c}`).join('\n') || 'N/A'}`,
      '',
      `Examples\n${examples}`,
      '',
      `Note:\n${problem.note || 'N/A'}`,
    ];
    if (includeHint) {
      sections.push('', `Hint (50% Solution):\n${problem.hint}`);
    }
    return sections.join('\n').trim();
  }

  /**
   * Executes the code on the real judge against the visible examples and the
   * hidden tests in ONE batch (JudgeService.executeBatch — Judge0 batch API,
   * with a per-input fallback). The reported failure is the earliest failing
   * case in order (examples first). Example results are returned in full;
   * hidden tests only as counts + the failing test number.
   */
  private async executeSuite(
    problem: ArenaProblem,
    dto: ArenaSolutionDto,
    hiddenTests: Array<{ input: string; expectedOutput: string }>,
  ) {
    const language = dto.language || 'cpp';
    const timeLimit = Math.min(Math.max(parseFloat(problem.timeLimit || '') || 2, 1), 5);
    const memoryLimit = Math.min(Math.max(parseInt(problem.memoryLimit || '', 10) || 128, 64), 256);

    const examples = this.examplesOf(problem);
    const cases = [
      ...examples.map((ex, index) => ({ hidden: false, index, input: ex.input, expected: ex.output })),
      ...hiddenTests.map((t, index) => ({ hidden: true, index, input: t.input, expected: t.expectedOutput })),
    ];

    const executions = await this.judge.executeBatch(
      dto.code,
      language,
      cases.map((c) => c.input),
      timeLimit,
      memoryLimit,
    );
    const results = executions.map((res, i) => ({
      passed:
        res.status === 'SUCCESS' &&
        this.judge.normalizeOutput(res.stdout) === this.judge.normalizeOutput(cases[i].expected),
      status: res.status,
      stdout: res.stdout,
      executionTime: res.executionTime,
      error:
        res.status === 'COMPILATION_ERROR'
          ? res.compileError
          : res.status === 'SUCCESS'
            ? null
            : res.stderr || res.status,
    }));

    const exampleResults = examples.flatMap((ex, index) => {
      const r = results[index];
      return r
        ? [{
            index,
            input: ex.input,
            expectedOutput: ex.output,
            actualOutput: r.stdout,
            passed: r.passed,
            executionTime: r.executionTime,
            error: r.error,
          }]
        : [];
    });

    const failIdx = results.findIndex((r) => r && !r.passed);
    const hiddenPassed = results.filter((r, i) => r?.passed && cases[i].hidden).length;
    let verdict: ArenaVerdict = 'Accepted';
    let failedScenario: string | null = null;
    let feedback = hiddenTests.length
      ? `Passed all ${examples.length} examples and ${hiddenTests.length} hidden tests.`
      : 'All examples passed.';

    if (failIdx !== -1) {
      const c = cases[failIdx];
      const r = results[failIdx]!;
      verdict =
        r.status === 'COMPILATION_ERROR'
          ? 'Compilation Error'
          : r.status === 'RUNTIME_ERROR'
            ? 'Run Time Error'
            : r.status === 'TIME_LIMIT_EXCEEDED'
              ? 'Time Limit Exceeded'
              : 'Wrong Answer';
      const where = c.hidden ? `hidden test ${c.index + 1}` : `example ${c.index + 1}`;
      failedScenario = c.hidden ? `Hidden test ${c.index + 1}` : `Example ${c.index + 1}`;
      feedback =
        verdict === 'Compilation Error'
          ? 'Your code does not compile.'
          : c.hidden
            ? `Your code passed the examples but got ${verdict} on ${where}. Think about edge cases and the input limits.`
            : verdict === 'Wrong Answer'
              ? `Your output differs from the expected output on ${where}.`
              : `${verdict} on ${where}.`;
    }

    return {
      verdict,
      feedback,
      failedScenario,
      exampleResults,
      // Counts only: hidden inputs/outputs never leave the server.
      hiddenTests: {
        total: hiddenTests.length,
        passed: hiddenPassed,
        failedTest: failIdx !== -1 && cases[failIdx].hidden ? cases[failIdx].index + 1 : null,
      },
    };
  }

  private normalizeVerdict(verdict: string): ArenaVerdict {
    const known: ArenaVerdict[] = [
      'Accepted',
      'Wrong Answer',
      'Compilation Error',
      'Run Time Error',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
    ];
    return known.includes(verdict as ArenaVerdict) ? (verdict as ArenaVerdict) : 'Wrong Answer';
  }

  private toProgress(problemXp: number, attempt: ArenaProblemAttempt | null) {
    const hintUsed = attempt?.hintUsed ?? false;
    return {
      hintUsed,
      hintUsedAt: attempt?.hintUsedAt ?? null,
      solved: attempt?.solved ?? false,
      solvedAt: attempt?.solvedAt ?? null,
      earnedXp: attempt?.earnedXp ?? 0,
      maxEarnableXp: calculateEarnedXp(problemXp, hintUsed),
      submissionCount: attempt?.submissionCount ?? 0,
      lastVerdict: attempt?.lastVerdict ?? null,
      hintPenaltyRate: HINT_PENALTY_RATE,
    };
  }

  private toStudentView(problem: ArenaProblem, attempt: ArenaProblemAttempt | null) {
    const progress = this.toProgress(problem.xp, attempt);
    const hintRevealed = progress.hintUsed || progress.solved;
    return {
      id: problem.id,
      title: problem.title,
      arabicTitle: problem.arabicTitle,
      difficulty: problem.difficulty,
      difficultyIndex: problem.difficultyIndex,
      difficultyColor: problem.difficultyColor,
      xp: problem.xp,
      statement: problem.statement,
      inputSpec: problem.inputSpec,
      outputSpec: problem.outputSpec,
      constraints: this.constraintsOf(problem),
      examples: this.examplesOf(problem),
      note: problem.note,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      starterCode: problem.starterCode,
      imageUrl: this.imageUrlOf(problem),
      imageAlt: problem.imagePrompt,
      canBeExplainedByDiagrams: problem.canBeExplainedByDiagrams,
      // The hint text never leaves the server until it has been paid for (or the problem is solved).
      hint: hintRevealed ? problem.hint : null,
      hintRevealed,
      publishedAt: problem.publishedAt,
      progress,
    };
  }

  private toAdminView(
    problem: ArenaProblem,
    stats?: { attemptCount: number; solvedCount: number; hintCount: number },
  ) {
    const { imageData, ...rest } = problem;
    return {
      ...rest,
      constraints: this.constraintsOf(problem),
      examples: this.examplesOf(problem),
      imageUrl: imageData ? this.imageUrlOf(problem) : null,
      hasImage: Boolean(imageData),
      ...(stats ?? {}),
    };
  }
}
