import { describe, it, expect, vi, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ServiceUnavailableException } from '@nestjs/common';
import { GameVerifierService } from './game-verifier.service.js';
import { GAME_VERIFIER_SOURCE } from './game-verifier.source.js';
import { JudgeService } from '../judge/judge.service.js';

const RIGHT_HAND = `while (!bot.reachedExit()) {
  if (bot.isPathClear('right')) {
    bot.turnRight();
  } else if (!bot.isPathClear('front')) {
    bot.turnLeft();
    continue;
  }
  if (bot.isLaserAhead()) bot.jump();
  else bot.moveForward();
}`;

const mazeProof = (code: string) => ({
  stages: [
    { stage: 1, seeds: [11], code },
    { stage: 2, seeds: [21, 22, 23], code },
    { stage: 3, seeds: [31, 32, 33], code },
  ],
});

describe('GameVerifierService', () => {
  let program: string;

  beforeAll(() => {
    program = join(mkdtempSync(join(tmpdir(), 'game-verifier-')), 'script.js');
    writeFileSync(program, GAME_VERIFIER_SOURCE);
  });

  /** Stands in for Judge0: runs the program with plain Node, as Judge0's Node 22 does. */
  const localJudge = () => ({
    executeCode: vi.fn(async (code: string, language: string, stdin: string) => {
      expect(code).toBe(GAME_VERIFIER_SOURCE);
      expect(language).toBe('node22');
      const out = spawnSync(process.execPath, [program], { input: stdin, encoding: 'utf8', timeout: 30000 });
      return { status: 'SUCCESS', stdout: out.stdout, stderr: out.stderr, compileError: null, executionTime: null, engine: 'judge0' };
    }),
  });

  const serviceWith = (judge: unknown) => new GameVerifierService(judge as JudgeService);

  it('the generated program verifies working code', async () => {
    const verdict = await serviceWith(localJudge()).verify('robot-maze', mazeProof(RIGHT_HAND));
    expect(verdict).toEqual({ ok: true, message: 'All three stages verified.' });
  });

  it('the generated program refuses wrong or forged code', async () => {
    const service = serviceWith(localJudge());
    expect((await service.verify('robot-maze', mazeProof('bot.moveForward();'))).ok).toBe(false);
    expect((await service.verify('robot-maze', mazeProof('__maze.result = () => ({ status: "exit" });'))).ok).toBe(false);
  });

  it('ignores a verdict line without this request’s nonce', async () => {
    const judge = { executeCode: vi.fn().mockResolvedValue({ status: 'SUCCESS', stdout: 'abc {"ok":true,"message":"x"}\n', stderr: '' , engine: 'judge0' }) };
    await expect(serviceWith(judge).verify('robot-maze', {})).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('a run that takes too long is a failed check, not a server error', async () => {
    const judge = { executeCode: vi.fn().mockResolvedValue({ status: 'TIME_LIMIT_EXCEEDED', stdout: '', stderr: '', engine: 'judge0' }) };
    const verdict = await serviceWith(judge).verify('robot-maze', {});
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toMatch(/took too long/);
  });

  it('reports the code runners being down as a temporary error', async () => {
    const judge = { executeCode: vi.fn().mockRejectedValue(new Error('unreachable')) };
    await expect(serviceWith(judge).verify('robot-maze', {})).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  // The program is generated from the frontend game engines; this fails if an engine changed
  // without `npm run build:game-verifier`.
  const builder = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts/build-game-verifier.mjs');
  const frontendEntry = resolve(dirname(fileURLToPath(import.meta.url)), '../../../frontend/src/games/verify/judgeEntry.js');
  it.skipIf(!existsSync(frontendEntry))('the generated program matches the current game engines', async () => {
    const { rolldown } = await import('rolldown');
    const bundle = await rolldown({ input: frontendEntry, platform: 'node', logLevel: 'silent' });
    const { output } = await bundle.generate({ format: 'cjs' });
    await bundle.close();
    expect(output[0].code === GAME_VERIFIER_SOURCE, `run: node ${builder}`).toBe(true);
  });
});
