import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RunCustomDto } from './dto/run-custom.dto.js';
import { RunTestsDto } from './dto/run-tests.dto.js';
import { SubmitCodeDto } from './dto/submit-code.dto.js';
import { CreateTestCaseDto } from './dto/create-testcase.dto.js';
import { AiJudgeDto } from './dto/ai-judge.dto.js';
import { SubmissionStatus } from '@prisma/client';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export type JudgeStatus =
  | 'SUCCESS'
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED';

interface RemoteExecutionResult {
  status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED';
  stdout: string;
  stderr: string;
  compileError: string | null;
  executionTime: string | null;
  engine: 'judge0' | 'wandbox';
}

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);

  // Judge0 CE language IDs
  private readonly judge0Languages: Record<string, number> = {
    cpp: 54,
    'c++': 54,
    c: 50,
    python: 71,
    py: 71,
    python3: 71,
    javascript: 63,
    js: 63,
    node: 63,
  };

  // Wandbox compiler names
  private readonly wandboxCompilers: Record<string, string> = {
    cpp: 'gcc-head',
    'c++': 'gcc-head',
    c: 'gcc-head',
    python: 'cpython-head',
    py: 'cpython-head',
    python3: 'cpython-head',
    javascript: 'nodejs-head',
    js: 'nodejs-head',
    node: 'nodejs-head',
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Normalize language key
   */
  private normalizeLanguage(lang: string = 'cpp'): string {
    const key = lang.trim().toLowerCase();
    if (key.includes('cpp') || key.includes('c++')) return 'cpp';
    if (key.includes('py')) return 'python';
    if (key.includes('js') || key.includes('script') || key.includes('node')) return 'javascript';
    return key;
  }

  /**
   * Execute code on Judge0 CE with Wandbox fallback
   */
  async executeCode(
    code: string,
    language: string = 'cpp',
    stdin: string = '',
    timeLimit: number = 2.0,
    memoryLimit: number = 128,
  ): Promise<RemoteExecutionResult> {
    const normalizedLang = this.normalizeLanguage(language);

    // Try Judge0 first
    try {
      const judge0Result = await this.executeJudge0(
        code,
        normalizedLang,
        stdin,
        timeLimit,
        memoryLimit,
      );
      return judge0Result;
    } catch (err: any) {
      this.logger.warn(
        `[Judge0] Execution failed or unavailable (${err?.message}). Falling back to Wandbox...`,
      );
    }

    // Fallback to Wandbox
    try {
      const wandboxResult = await this.executeWandbox(code, normalizedLang, stdin);
      return wandboxResult;
    } catch (fallbackErr: any) {
      this.logger.error(`[Wandbox Fallback] Also failed: ${fallbackErr?.message}`);
      throw new InternalServerErrorException(
        'Code execution services are currently unreachable. Please try again shortly.',
      );
    }
  }

  /**
   * Primary: Judge0 CE API
   */
  private async executeJudge0(
    code: string,
    language: string,
    stdin: string,
    timeLimit: number,
    memoryLimit: number,
  ): Promise<RemoteExecutionResult> {
    const languageId = this.judge0Languages[language] || 54;
    const url = 'https://ce.judge0.com/submissions/?base64_encoded=false&wait=true';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: stdin || '',
          cpu_time_limit: timeLimit || 2.0,
          memory_limit: (memoryLimit || 128) * 1024,
        }),
      });

      if (!res.ok) {
        throw new Error(`Judge0 responded with status ${res.status}`);
      }

      const data: any = await res.json();
      const statusId = data.status?.id;

      let status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' =
        'SUCCESS';
      let compileError: string | null = null;
      let stderr = data.stderr || '';

      if (statusId === 6) {
        status = 'COMPILATION_ERROR';
        compileError = data.compile_output || data.stderr || 'Compilation error';
      } else if (statusId === 5) {
        status = 'TIME_LIMIT_EXCEEDED';
        stderr = 'Time limit exceeded';
      } else if (statusId >= 7 && statusId <= 14) {
        status = 'RUNTIME_ERROR';
        stderr = data.stderr || data.message || `Runtime error (${data.status?.description || ''})`;
      } else if (statusId === 3 || statusId === 4) {
        // Status 3 is Accepted, Status 4 is Wrong Answer in judge context;
        // for custom run both mean execution finished normally
        status = 'SUCCESS';
      } else if (data.compile_output) {
        status = 'COMPILATION_ERROR';
        compileError = data.compile_output;
      }

      return {
        status,
        stdout: data.stdout || '',
        stderr: stderr || '',
        compileError,
        executionTime: data.time ? `${data.time}s` : null,
        engine: 'judge0',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback: Wandbox API
   */
  private async executeWandbox(
    code: string,
    language: string,
    stdin: string,
  ): Promise<RemoteExecutionResult> {
    const compiler = this.wandboxCompilers[language] || 'gcc-head';
    const url = 'https://wandbox.org/api/compile.json';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const startTime = Date.now();

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          compiler,
          code,
          stdin: stdin || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`Wandbox responded with status ${res.status}`);
      }

      const data: any = await res.json();
      const durationMs = Date.now() - startTime;
      const durationSec = (durationMs / 1000).toFixed(3);

      let status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' =
        'SUCCESS';
      let compileError: string | null = null;
      let stderr = data.program_error || '';

      if (data.compiler_error && data.compiler_error.trim().length > 0) {
        status = 'COMPILATION_ERROR';
        compileError = data.compiler_error;
      } else if (data.signal === 'SIGXCPU' || data.signal === 'SIGKILL') {
        status = 'TIME_LIMIT_EXCEEDED';
        stderr = 'Time limit exceeded';
      } else if (data.status !== '0' && data.status !== 0) {
        status = 'RUNTIME_ERROR';
        stderr = data.program_error || data.signal || 'Runtime Error';
      }

      return {
        status,
        stdout: data.program_output || '',
        stderr: stderr || '',
        compileError,
        executionTime: `${durationSec}s`,
        engine: 'wandbox',
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Normalize stdout / expectedOutput for safe string comparison
   */
  private normalizeOutput(str: string = ''): string {
    if (!str) return '';
    return str
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim();
  }

  /**
   * 1. POST /judge/run-custom (Free Console Run)
   */
  async runCustom(dto: RunCustomDto) {
    const result = await this.executeCode(
      dto.code,
      dto.language || 'cpp',
      dto.customInput || '',
    );

    return {
      mode: 'CUSTOM',
      status: result.status,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compileError: result.compileError,
      executionTime: result.executionTime,
    };
  }

  /**
   * 2. POST /judge/run-tests/:challengeId (Run Sample Tests)
   */
  async runTests(challengeId: string, dto: RunTestsDto) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID "${challengeId}" not found`);
    }

    const language = dto.language || challenge.language || 'cpp';
    // Run sample test cases (isHidden: false). If none exist, use all available test cases.
    let testCases = challenge.testCases.filter((tc) => !tc.isHidden);
    if (testCases.length === 0) {
      testCases = challenge.testCases;
    }

    if (testCases.length === 0) {
      // Fallback: run code with empty stdin
      const singleRun = await this.executeCode(
        dto.code,
        language,
        '',
        challenge.timeLimit,
        challenge.memoryLimit,
      );
      return {
        mode: 'TESTS',
        challengeId,
        status: singleRun.status === 'SUCCESS' ? 'ACCEPTED' : singleRun.status,
        passedTests: singleRun.status === 'SUCCESS' ? 1 : 0,
        totalTests: 1,
        testResults: [
          {
            testCaseId: 'default',
            order: 1,
            input: '',
            expectedOutput: '',
            actualOutput: singleRun.stdout,
            passed: singleRun.status === 'SUCCESS',
            executionTime: singleRun.executionTime,
          },
        ],
        compileError: singleRun.compileError,
      };
    }

    let passedTests = 0;
    let overallStatus: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' =
      'ACCEPTED';
    let firstCompileError: string | null = null;
    const testResults: any[] = [];

    for (const tc of testCases) {
      const res = await this.executeCode(
        dto.code,
        language,
        tc.input || '',
        challenge.timeLimit,
        challenge.memoryLimit,
      );

      if (res.status === 'COMPILATION_ERROR') {
        overallStatus = 'COMPILATION_ERROR';
        firstCompileError = res.compileError;
        testResults.push({
          testCaseId: tc.id,
          order: tc.order,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: res.stdout,
          passed: false,
          executionTime: res.executionTime,
          error: res.compileError,
        });
        break; // Stop running remaining test cases on compile error
      }

      if (res.status === 'TIME_LIMIT_EXCEEDED') {
        if (overallStatus === 'ACCEPTED') overallStatus = 'TIME_LIMIT_EXCEEDED';
        testResults.push({
          testCaseId: tc.id,
          order: tc.order,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          passed: false,
          executionTime: res.executionTime,
          error: 'Time Limit Exceeded',
        });
        continue;
      }

      if (res.status === 'RUNTIME_ERROR') {
        if (overallStatus === 'ACCEPTED') overallStatus = 'RUNTIME_ERROR';
        testResults.push({
          testCaseId: tc.id,
          order: tc.order,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: res.stdout,
          passed: false,
          executionTime: res.executionTime,
          error: res.stderr || 'Runtime Error',
        });
        continue;
      }

      // Check output match
      const actualClean = this.normalizeOutput(res.stdout);
      const expectedClean = this.normalizeOutput(tc.expectedOutput);
      const isPassed = actualClean === expectedClean;

      if (isPassed) {
        passedTests++;
      } else {
        if (overallStatus === 'ACCEPTED') overallStatus = 'WRONG_ANSWER';
      }

      testResults.push({
        testCaseId: tc.id,
        order: tc.order,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: res.stdout,
        passed: isPassed,
        executionTime: res.executionTime,
      });
    }

    return {
      mode: 'TESTS',
      challengeId,
      status: overallStatus,
      passedTests,
      totalTests: testCases.length,
      testResults,
      compileError: firstCompileError,
    };
  }

  /**
   * 3. POST /judge/submit/:challengeId (Submit & Record in DB)
   */
  async submitChallenge(
    userId: string | null,
    challengeId: string,
    dto: SubmitCodeDto,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID "${challengeId}" not found`);
    }

    const language = dto.language || challenge.language || 'cpp';
    const testCases = challenge.testCases;

    let passedTests = 0;
    const totalTests = Math.max(testCases.length, 1);
    let status: SubmissionStatus = SubmissionStatus.ACCEPTED;
    let errorMessage: string | null = null;
    let maxExecutionTime: number | null = null;

    if (testCases.length === 0) {
      // If challenge has no test cases configured yet, run custom check
      const res = await this.executeCode(
        dto.code,
        language,
        '',
        challenge.timeLimit,
        challenge.memoryLimit,
      );

      if (res.status === 'COMPILATION_ERROR') {
        status = SubmissionStatus.COMPILATION_ERROR;
        errorMessage = res.compileError;
      } else if (res.status === 'RUNTIME_ERROR') {
        status = SubmissionStatus.RUNTIME_ERROR;
        errorMessage = res.stderr;
      } else if (res.status === 'TIME_LIMIT_EXCEEDED') {
        status = SubmissionStatus.TIME_LIMIT_EXCEEDED;
        errorMessage = 'Time Limit Exceeded';
      } else {
        status = SubmissionStatus.ACCEPTED;
        passedTests = 1;
      }
      if (res.executionTime) {
        maxExecutionTime = parseFloat(res.executionTime);
      }
    } else {
      // Execute all test cases (both public and hidden)
      for (const tc of testCases) {
        const res = await this.executeCode(
          dto.code,
          language,
          tc.input || '',
          challenge.timeLimit,
          challenge.memoryLimit,
        );

        if (res.executionTime) {
          const t = parseFloat(res.executionTime);
          if (!isNaN(t)) {
            maxExecutionTime = Math.max(maxExecutionTime || 0, t);
          }
        }

        if (res.status === 'COMPILATION_ERROR') {
          status = SubmissionStatus.COMPILATION_ERROR;
          errorMessage = res.compileError;
          break;
        }

        if (res.status === 'TIME_LIMIT_EXCEEDED') {
          if (status === SubmissionStatus.ACCEPTED) {
            status = SubmissionStatus.TIME_LIMIT_EXCEEDED;
            errorMessage = 'Time Limit Exceeded';
          }
          continue;
        }

        if (res.status === 'RUNTIME_ERROR') {
          if (status === SubmissionStatus.ACCEPTED) {
            status = SubmissionStatus.RUNTIME_ERROR;
            errorMessage = res.stderr || 'Runtime Error';
          }
          continue;
        }

        const actualClean = this.normalizeOutput(res.stdout);
        const expectedClean = this.normalizeOutput(tc.expectedOutput);

        if (actualClean === expectedClean) {
          passedTests++;
        } else {
          if (status === SubmissionStatus.ACCEPTED) {
            status = SubmissionStatus.WRONG_ANSWER;
            errorMessage = `Failed on test case ${tc.order + 1}`;
          }
        }
      }
    }

    // Resolve userId if not provided (fallback to first student user if available)
    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const defaultUser = await this.prisma.user.findFirst({
        where: { role: 'CHILD' },
        select: { id: true },
      });
      effectiveUserId = defaultUser?.id || null;
    }

    let submission: any = null;
    if (effectiveUserId) {
      submission = await this.prisma.codeSubmission.create({
        data: {
          userId: effectiveUserId,
          challengeId,
          code: dto.code,
          language,
          status,
          passedTests,
          totalTests,
          executionTime: maxExecutionTime,
          errorMessage,
        },
      });

      // Award XP and record challenge progress if Accepted
      if (status === SubmissionStatus.ACCEPTED) {
        const xpEarned = challenge.xp || 100;
        await this.prisma.user.update({
          where: { id: effectiveUserId },
          data: {
            totalXp: { increment: xpEarned },
            lastActiveAt: new Date(),
          },
        });

        // Also record in LearningProgress if challenge belongs to a Level
        if (challenge.levelId) {
          const progress = await this.prisma.learningProgress.findUnique({
            where: {
              userId_levelId: {
                userId: effectiveUserId,
                levelId: challenge.levelId,
              },
            },
          });

          const completedChallenges: string[] = Array.isArray(progress?.completedChallengeIds)
            ? (progress.completedChallengeIds as string[])
            : [];

          if (!completedChallenges.includes(challenge.id)) {
            const nextChallenges = [...completedChallenges, challenge.id];
            await this.prisma.learningProgress.upsert({
              where: {
                userId_levelId: {
                  userId: effectiveUserId,
                  levelId: challenge.levelId,
                },
              },
              create: {
                userId: effectiveUserId,
                levelId: challenge.levelId,
                trackId: 'cpp',
                completedChallengeIds: nextChallenges,
                xp: xpEarned,
                status: 'IN_PROGRESS',
                updatedAt: new Date(),
              },
              update: {
                completedChallengeIds: nextChallenges,
                xp: { increment: xpEarned },
                lastAccessedAt: new Date(),
                updatedAt: new Date(),
              },
            });
          }
        }
      }
    }

    return {
      submissionId: submission?.id || `sim_${Date.now()}`,
      status,
      passedTests,
      totalTests,
      executionTime: maxExecutionTime,
      errorMessage,
      xpEarned: status === SubmissionStatus.ACCEPTED ? challenge.xp || 100 : 0,
      createdAt: submission?.createdAt || new Date().toISOString(),
    };
  }

  /**
   * GET /judge/challenge/:challengeId
   */
  async getChallenge(challengeId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: {
          where: { isHidden: false },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            order: true,
            input: true,
            expectedOutput: true,
            isHidden: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException(`Challenge with ID "${challengeId}" not found`);
    }

    return challenge;
  }

  /**
   * GET /judge/submissions/:challengeId
   */
  async getSubmissions(userId: string, challengeId: string) {
    return this.prisma.codeSubmission.findMany({
      where: {
        userId,
        challengeId,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * POST /judge/testcases/:challengeId (Add testcase)
   */
  async createTestCase(challengeId: string, dto: CreateTestCaseDto) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });
    if (!challenge) {
      throw new NotFoundException(`Challenge with ID "${challengeId}" not found`);
    }

    const order =
      typeof dto.order === 'number'
        ? dto.order
        : await this.prisma.testCase.count({ where: { challengeId } });

    return this.prisma.testCase.create({
      data: {
        challengeId,
        input: dto.input,
        expectedOutput: dto.expectedOutput,
        isHidden: Boolean(dto.isHidden),
        order,
      },
    });
  }

  /**
   * Run AI Judge evaluation using ai/check_submit.py
   */
  async evaluateAiSubmission(dto: AiJudgeDto): Promise<{
    verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Run Time Error' | 'Compilation Error';
    failed_scenario: string;
    feedback_ar: string;
  }> {
    let runnerPath = path.resolve(process.cwd(), 'src', 'judge', 'ai_runner.py');
    if (!fs.existsSync(runnerPath)) {
      runnerPath = path.resolve(process.cwd(), 'dist', 'judge', 'ai_runner.py');
    }
    if (!fs.existsSync(runnerPath)) {
      runnerPath = path.resolve(process.cwd(), '..', 'backend', 'src', 'judge', 'ai_runner.py');
    }

    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [runnerPath], {
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      });

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString('utf-8');
      });

      pythonProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString('utf-8');
      });

      const timer = setTimeout(() => {
        try {
          pythonProcess.kill();
        } catch {}
        resolve({
          verdict: 'Time Limit Exceeded',
          failed_scenario: 'AI Evaluation timed out after 45 seconds',
          feedback_ar: 'استغرق التحقق وقتاً أطول من المتوقع، يرجى إعادة المحاولة.',
        });
      }, 45000);

      pythonProcess.on('close', () => {
        clearTimeout(timer);
        try {
          const prefix = '__AI_JUDGE_RESULT__';
          const idx = stdoutData.indexOf(prefix);
          if (idx !== -1) {
            const jsonStr = stdoutData.slice(idx + prefix.length).trim();
            const parsed = JSON.parse(jsonStr);
            return resolve(parsed);
          }
          const firstBrace = stdoutData.indexOf('{');
          const lastBrace = stdoutData.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonStr = stdoutData.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(jsonStr);
            return resolve(parsed);
          }
          this.logger.error(`[AI Judge] Failed to parse stdout: ${stdoutData} | stderr: ${stderrData}`);
          resolve({
            verdict: 'Run Time Error',
            failed_scenario: stderrData || 'Unknown Python process error',
            feedback_ar: 'تعذر على المصحح الذكي تحليل الكود حالياً. يرجى إعادة المحاولة.',
          });
        } catch (e: any) {
          this.logger.error(`[AI Judge] Exception: ${e?.message}`);
          resolve({
            verdict: 'Run Time Error',
            failed_scenario: e?.message,
            feedback_ar: 'حدث خطأ غير متوقع أثناء معالجة النتيجة.',
          });
        }
      });

      pythonProcess.on('error', (err) => {
        clearTimeout(timer);
        this.logger.error(`[AI Judge] Spawn error: ${err?.message}`);
        resolve({
          verdict: 'Run Time Error',
          failed_scenario: err?.message,
          feedback_ar: 'تعذر تشغيل بيئة بايثون للتحقق الذكي.',
        });
      });

      const payload = JSON.stringify({
        problem_text: dto.problemText,
        student_code: dto.studentCode,
      });

      pythonProcess.stdin.write(payload, 'utf-8');
      pythonProcess.stdin.end();
    });
  }
}
