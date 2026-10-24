/**
 * Re-checks a finished game from its proof: the seeds the student played and the code they wrote.
 * The server runs this (bundled with a Node sandbox, see judgeEntry.js) before it awards XP, so a
 * reward needs code that really solves the puzzles, not just a "completed" flag from the browser.
 * `run(job)` executes one sandbox job and resolves with { ok, result } | { ok: false, error }.
 */

import { buildMazeJob, generateEndlessMaze, generateMaze, MAZE_STAGES } from "../robotMaze/mazeEngine.js";
import { checkTrapAnswer, generateWave } from "../skyTraps/trapsEngine.js";
import { checkBomb, generateBombs } from "../bombDefuser/bombEngine.js";

/** Largest code (characters) accepted for one stage or bomb, and for one trap answer. */
export const MAX_CODE_CHARS = 20000;
export const MAX_ANSWER_CHARS = 2000;

/** An endless run: at most this many levels, written with at most this many different programs. */
export const MAX_ENDLESS_LEVELS = 500;
export const MAX_ENDLESS_CODES = 10;

const isSeed = (seed) => Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff;
const isText = (value, max) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const fail = (message) => ({ ok: false, message });

/** proof: { stages: [{ stage, seeds: [shown, ...hidden], code }] } for stages 1–3. */
async function verifyRobotMaze(proof, run) {
  const stages = proof?.stages;
  if (!Array.isArray(stages) || stages.length !== MAZE_STAGES.length) {
    return fail("The code for all three stages is needed.");
  }
  for (const config of MAZE_STAGES) {
    const entry = stages.find((s) => s?.stage === config.stage);
    const seeds = entry?.seeds;
    if (
      !entry ||
      !isText(entry.code, MAX_CODE_CHARS) ||
      !Array.isArray(seeds) ||
      seeds.length !== 1 + config.hiddenMazes ||
      !seeds.every(isSeed) ||
      new Set(seeds).size !== seeds.length
    ) {
      return fail(`Stage ${config.stage} could not be checked. Finish it again.`);
    }
    for (const [i, seed] of seeds.entries()) {
      const res = await run(buildMazeJob(generateMaze(config.stage, seed), entry.code));
      if (!res.ok) return fail(`Stage ${config.stage}: ${res.error}`);
      if (res.result?.status !== "exit") {
        return fail(`Stage ${config.stage}, maze ${i + 1}: ${res.result?.message || "the robot did not reach the exit."}`);
      }
    }
  }
  return { ok: true, message: "All three stages verified." };
}

/**
 * proof: { codes: [program], levels: [{ seed, code: index into codes }] } for levels 1, 2, 3, …
 * Every cleared level is replayed; the record is the number of levels.
 */
async function verifyRobotMazeEndless(proof, run) {
  const codes = proof?.codes;
  const levels = proof?.levels;
  if (!Array.isArray(codes) || codes.length < 1 || codes.length > MAX_ENDLESS_CODES || !codes.every((c) => isText(c, MAX_CODE_CHARS))) {
    return fail("The code of the run could not be checked.");
  }
  if (!Array.isArray(levels) || levels.length < 1 || levels.length > MAX_ENDLESS_LEVELS) {
    return fail("The levels of the run could not be checked.");
  }
  for (const [i, entry] of levels.entries()) {
    const level = i + 1;
    if (!isSeed(entry?.seed) || !Number.isInteger(entry.code) || codes[entry.code] === undefined) {
      return fail(`Level ${level} could not be checked.`);
    }
    const res = await run(buildMazeJob(generateEndlessMaze(level, entry.seed), codes[entry.code]));
    if (!res.ok) return fail(`Level ${level}: ${res.error}`);
    if (res.result?.status !== "exit") {
      return fail(`Level ${level}: ${res.result?.message || "the robot did not reach the exit."}`);
    }
  }
  return { ok: true, message: `Levels 1–${levels.length} verified.` };
}

/** proof: { seed, answers: [one line per trap] }. */
async function verifySkyTraps(proof, run) {
  if (!isSeed(proof?.seed) || !Array.isArray(proof.answers)) return fail("The wave could not be checked.");
  const wave = generateWave(proof.seed);
  if (proof.answers.length !== wave.length) return fail(`Answers for all ${wave.length} traps are needed.`);
  for (const [i, trap] of wave.entries()) {
    const answer = proof.answers[i];
    if (!isText(answer, MAX_ANSWER_CHARS)) return fail(`Trap ${trap.n} has no answer.`);
    const verdict = await checkTrapAnswer(trap, answer, run);
    if (!verdict.ok) return fail(`Trap ${trap.n}: ${verdict.message}`);
  }
  return { ok: true, message: "Every trap verified." };
}

/** proof: { bombs: [{ seed, code }] }; each bomb has its own seed because Retry brings new values. */
async function verifyBombDefuser(proof, run) {
  const bombs = proof?.bombs;
  if (!Array.isArray(bombs) || bombs.length !== 3) return fail("The code for all three bombs is needed.");
  for (const [i, entry] of bombs.entries()) {
    if (!isSeed(entry?.seed) || !isText(entry.code, MAX_CODE_CHARS)) return fail(`Bomb ${i + 1} could not be checked.`);
    const verdict = await checkBomb(generateBombs(entry.seed)[i], entry.code, run);
    if (!verdict.ok) return fail(`Bomb ${i + 1}: ${verdict.message}`);
  }
  return { ok: true, message: "All three bombs verified." };
}

const VERIFIERS = {
  "robot-maze": verifyRobotMaze,
  "robot-maze-endless": verifyRobotMazeEndless,
  "sky-traps": verifySkyTraps,
  "bomb-defuser": verifyBombDefuser,
};

/** Resolves with { ok, message } written for the student. */
export async function verifyGame(gameId, proof, run) {
  const verify = VERIFIERS[gameId];
  if (!verify) return fail("Unknown game.");
  try {
    return await verify(proof, run);
  } catch {
    return fail("The proof could not be read.");
  }
}
