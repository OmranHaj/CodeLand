import { randomBytes } from 'node:crypto';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { JudgeService } from '../judge/judge.service.js';
import { GAME_VERIFIER_SOURCE } from './game-verifier.source.js';

export interface GameVerdict {
  ok: boolean;
  message: string;
}

/**
 * Re-runs a finished game on Judge0: the verifier program (the game engines plus a node:vm sandbox,
 * see frontend/src/games/verify) replays the student's code on the seeds they played. The verdict
 * line must start with a nonce that only this request knows, so student code cannot print its own.
 */
@Injectable()
export class GameVerifierService {
  private readonly logger = new Logger(GameVerifierService.name);

  constructor(private readonly judge: JudgeService) {}

  async verify(gameId: string, proof: unknown): Promise<GameVerdict> {
    const nonce = randomBytes(16).toString('hex');
    const stdin = JSON.stringify({ nonce, gameId, proof });

    let run: Awaited<ReturnType<JudgeService['executeCode']>>;
    try {
      run = await this.judge.executeCode(GAME_VERIFIER_SOURCE, 'node22', stdin, 10, 256);
    } catch {
      throw new ServiceUnavailableException('We could not check your code right now. Please try again in a minute.');
    }

    const line = run.stdout.split('\n').find((l) => l.startsWith(`${nonce} `));
    if (!line) {
      this.logger.warn(`Game verifier gave no verdict (${run.engine}, ${run.status}): ${run.stderr.slice(0, 300)}`);
      if (run.status === 'TIME_LIMIT_EXCEEDED') {
        return { ok: false, message: 'Checking your code took too long. Make sure every loop ends.' };
      }
      throw new ServiceUnavailableException('We could not check your code right now. Please try again in a minute.');
    }

    try {
      const verdict = JSON.parse(line.slice(nonce.length + 1));
      return { ok: verdict?.ok === true, message: String(verdict?.message ?? '') };
    } catch {
      throw new ServiceUnavailableException('We could not check your code right now. Please try again in a minute.');
    }
  }
}
