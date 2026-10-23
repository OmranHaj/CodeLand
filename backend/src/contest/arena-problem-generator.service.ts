import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ARENA_XP_TIERS, isArenaXpTier, xpTierIndex } from './arena-xp.util.js';

export interface ArenaExample {
  input: string;
  output: string;
  explanation: string;
}

/** One generator problem mapped onto the ArenaProblem columns. */
export interface GeneratedArenaProblem {
  xp: number;
  title: string;
  arabicTitle: string | null;
  difficulty: string;
  difficultyIndex: number;
  difficultyColor: string | null;
  statement: string;
  taskDescription: string | null;
  inputSpec: string;
  outputSpec: string;
  constraints: string[];
  examples: ArenaExample[];
  note: string | null;
  hint: string;
  timeLimit: string | null;
  memoryLimit: string | null;
  starterCode: Record<string, string>;
  formattedProblem: string;
  imageData: Uint8Array<ArrayBuffer> | null;
  imageMimeType: string | null;
  imagePrompt: string | null;
  canBeExplainedByDiagrams: boolean;
  storyPart: string | null;
  coreIdea: string | null;
  rawOutput: Record<string, unknown>;
}

const RESULT_PREFIX = '__CONTEST_RESULT__';
const CONTEST_SIZE = ARENA_XP_TIERS.length;
// Generous by default: when Gemini is overloaded (503) the client retries with
// backoff, so a ~20s call can take minutes but still succeed.
const CONTEST_TIMEOUT_MS = Number(process.env.CONTEST_GENERATOR_TIMEOUT_MS) || 600_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

@Injectable()
export class ArenaProblemGeneratorService {
  private readonly logger = new Logger(ArenaProblemGeneratorService.name);

  /**
   * Runs the full story pipeline. The result must be exactly 6 problems, one
   * per difficulty index 0-5, so each XP tier (25 ... 150) appears once.
   */
  async generateContest(description: string): Promise<GeneratedArenaProblem[]> {
    const result = await this.runGenerator({ description }, CONTEST_TIMEOUT_MS);
    const problems = this.extractProblems(result);
    const indexes = new Set(problems.map((p) => p?.index));
    if (problems.length !== CONTEST_SIZE || ARENA_XP_TIERS.some((_, i) => !indexes.has(i))) {
      throw new BadGatewayException(
        `Generator returned ${problems.length} problems instead of one per tier (${CONTEST_SIZE}). Nothing was saved.`,
      );
    }
    return problems.map((p) => this.mapProblem(p));
  }

  private resolveScriptPath(): string {
    const candidates = [
      process.env.CONTEST_GENERATOR_PATH,
      path.resolve(process.cwd(), '..', 'ai', 'generate_contest.py'),
      path.resolve(process.cwd(), 'ai', 'generate_contest.py'),
    ].filter((p): p is string => Boolean(p));

    const found = candidates.find((p) => fs.existsSync(p));
    if (!found) {
      throw new BadGatewayException('Problem generator script (ai/generate_contest.py) was not found.');
    }
    return found;
  }

  private runGenerator(payload: Record<string, unknown>, timeoutMs: number): Promise<any> {
    const scriptPath = this.resolveScriptPath();

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(process.env.PYTHON_BIN || 'python', [scriptPath], {
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
          // Images come back as data URLs and are stored in the DB with the
          // problem, so the script must not write shared files to disk.
          CONTEST_WRITE_IMAGE_FILES: '0',
          CONTEST_GENERATED_AT: new Date().toISOString(),
        },
      });

      let stdoutData = '';
      let stderrData = '';
      let settled = false;
      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        fn();
      };

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
        finish(() =>
          reject(
            new BadGatewayException(
              `Problem generation timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`,
            ),
          ),
        );
      }, timeoutMs);

      pythonProcess.on('error', (err) => {
        this.logger.error(`[Generator] Spawn error: ${err?.message}`);
        finish(() =>
          reject(new BadGatewayException(`Could not start the Python problem generator: ${err?.message}`)),
        );
      });

      pythonProcess.on('close', (code) => {
        finish(() => {
          const parsed = this.parseTagged(stdoutData) ?? this.parseTagged(stderrData);
          if (code === 0 && parsed && !parsed.error) {
            return resolve(parsed);
          }
          const reason =
            parsed?.error ||
            stderrData.trim().split('\n').slice(-3).join(' ') ||
            `exit code ${code}`;
          this.logger.error(`[Generator] Failed (code ${code}): ${reason}`);
          reject(new BadGatewayException(`Problem generation failed: ${String(reason).slice(0, 500)}`));
        });
      });

      pythonProcess.stdin.write(JSON.stringify(payload), 'utf-8');
      pythonProcess.stdin.end();
    });
  }

  private parseTagged(output: string): any | null {
    const idx = output.lastIndexOf(RESULT_PREFIX);
    if (idx === -1) return null;
    const line = output.slice(idx + RESULT_PREFIX.length).split('\n')[0].trim();
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }

  private extractProblems(result: any): any[] {
    const problems = Array.isArray(result?.problems) ? result.problems : result?.chapters;
    if (!Array.isArray(problems)) {
      throw new BadGatewayException('Generator output has no "problems" list.');
    }
    return [...problems].sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0));
  }

  /**
   * Maps one generator problem onto ArenaProblem columns. Throws instead of
   * saving anything when a required part of the problem is missing.
   */
  mapProblem(problem: any): GeneratedArenaProblem {
    const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
    const optional = (value: unknown) => text(value) || null;

    const index = Number.isInteger(problem?.index) ? problem.index : 0;
    const generatedXp = Number(problem?.baseXp ?? problem?.xp);
    const xp = isArenaXpTier(generatedXp)
      ? generatedXp
      : ARENA_XP_TIERS[Math.min(Math.max(index, 0), ARENA_XP_TIERS.length - 1)];

    const examples = this.mapExamples(problem);
    const constraints = Array.isArray(problem?.constraints)
      ? problem.constraints.map(text).filter(Boolean)
      : [];

    const mapped = {
      title: text(problem?.title),
      statement: text(problem?.problemStory) || text(problem?.lore),
      inputSpec: text(problem?.inputSpec),
      outputSpec: text(problem?.outputSpec),
      hint: text(problem?.hint),
    };
    const missing = Object.entries(mapped)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (examples.length === 0) missing.push('examples');
    if (missing.length > 0) {
      throw new BadGatewayException(
        `Generator returned an incomplete problem (missing: ${missing.join(', ')}). Nothing was saved.`,
      );
    }

    const image = this.decodeImage(problem?.imageUrl);
    const starterCode =
      problem?.starterCode && typeof problem.starterCode === 'object' ? problem.starterCode : {};

    // Keep the full generator payload, replacing only the (large) inline image.
    const rawOutput: Record<string, unknown> = { ...problem };
    if (image) rawOutput.imageUrl = '[stored in ArenaProblem.imageData]';

    return {
      ...mapped,
      xp,
      arabicTitle: optional(problem?.arabicTitle),
      difficulty: text(problem?.difficulty) || text(problem?.level) || 'Unrated',
      difficultyIndex: xpTierIndex(xp),
      difficultyColor: optional(problem?.difficultyColor),
      taskDescription: optional(problem?.taskDescription),
      constraints,
      examples,
      note: optional(problem?.note),
      timeLimit: optional(problem?.timeLimit),
      memoryLimit: optional(problem?.memoryLimit),
      starterCode,
      formattedProblem: text(problem?.formattedProblem),
      imageData: image?.data ?? null,
      imageMimeType: image?.mimeType ?? null,
      imagePrompt: optional(problem?.imagePrompt),
      canBeExplainedByDiagrams: Boolean(problem?.canBeExplainedByDiagrams),
      storyPart: optional(problem?.storyPart),
      coreIdea: optional(problem?.coreIdea),
      rawOutput,
    };
  }

  private mapExamples(problem: any): ArenaExample[] {
    const fromList = (list: unknown, outKey: 'output' | 'expected'): ArenaExample[] =>
      Array.isArray(list)
        ? list
            .map((ex: any) => ({
              input: typeof ex?.input === 'string' ? ex.input : '',
              output: typeof ex?.[outKey] === 'string' ? ex[outKey] : '',
              explanation: typeof ex?.explanation === 'string' ? ex.explanation : '',
            }))
            .filter((ex) => ex.input.trim() || ex.output.trim())
        : [];

    const examples = fromList(problem?.examples, 'output');
    if (examples.length > 0) return examples;

    const samples = fromList(problem?.sampleTests, 'expected');
    if (samples.length > 0) return samples;

    if (typeof problem?.exampleInput === 'string' || typeof problem?.exampleOutput === 'string') {
      return [
        {
          input: problem.exampleInput || '',
          output: problem.exampleOutput || '',
          explanation: '',
        },
      ];
    }
    return [];
  }

  private decodeImage(
    imageUrl: unknown,
  ): { data: Uint8Array<ArrayBuffer>; mimeType: string } | null {
    if (typeof imageUrl !== 'string') return null;
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/s.exec(imageUrl.trim());
    if (!match) return null;
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) return null;
    return { data: new Uint8Array(buffer), mimeType: match[1] };
  }
}
