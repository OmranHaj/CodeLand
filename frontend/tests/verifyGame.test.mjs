import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const { generateWave } = await import("../src/games/skyTraps/trapsEngine.js");
const { generateBombs } = await import("../src/games/bombDefuser/bombEngine.js");
const { generateEndlessMaze, buildMazeJob } = await import("../src/games/robotMaze/mazeEngine.js");
const { evaluateStudentCode } = await import("../src/games/sandbox/evaluate.js");

const ENTRY = fileURLToPath(new URL("../src/games/verify/judgeEntry.js", import.meta.url));

/** Runs the verifier exactly as Judge0 does: a separate Node process reading stdin. */
function verify(gameId, proof, nonce = "n0nce-123") {
  const out = spawnSync(process.execPath, [ENTRY], { input: JSON.stringify({ nonce, gameId, proof }), encoding: "utf8", timeout: 30000 });
  const lines = out.stdout.split("\n").filter(Boolean);
  const line = lines.find((l) => l.startsWith(`${nonce} `));
  return { ...(line ? JSON.parse(line.slice(nonce.length + 1)) : { ok: false, message: "no verdict" }), lines };
}

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

const mazeProof = (code = RIGHT_HAND) => ({
  stages: [
    { stage: 1, seeds: [11], code },
    { stage: 2, seeds: [21, 22, 23], code },
    { stage: 3, seeds: [31, 32, 33], code },
  ],
});

const trapAnswers = (seed) => {
  const wave = generateWave(seed);
  return [
    `destroy(${wave[0].expected.id})`,
    "shield.charge(numbers.reduce((a, b) => a + b, 0))",
    "word.toLowerCase()",
    "trap.shield = false; destroy(trap.id)",
    "traps.filter(t => t.armed).forEach(t => destroy(t.id))",
  ];
};

const BOMB_CODE = {
  evens: "function defuse(nums) { return nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0); }",
  reverse: 'function defuse(code) { return code.replace(/[#!*]/g, "").split("").reverse().join(""); }',
  largest: "function defuse(nums) { let max = nums[0]; for (const n of nums) if (n > max) max = n; return max; }",
  vowels: 'function defuse(word) { let c = 0; for (const ch of word) if ("aeiou".includes(ch)) c++; return c; }',
  bigger: "function defuse(nums) { return nums.filter((n) => n > 10).length; }",
};
const bombProof = (seeds = [5, 6, 7]) => ({
  bombs: seeds.map((seed, i) => {
    const bomb = generateBombs(seed)[i];
    return { seed, code: BOMB_CODE[bomb.kind === "repair" ? bomb.variant : bomb.kind] };
  }),
});

test("robot maze: working code on all stages is verified", () => {
  assert.deepEqual(verify("robot-maze", mazeProof()).ok, true);
});

test("robot maze: code without jumping fails on the laser stage", () => {
  const noJump = RIGHT_HAND.replace("if (bot.isLaserAhead()) bot.jump();\n  else ", "");
  const verdict = verify("robot-maze", mazeProof(noJump));
  assert.equal(verdict.ok, false);
  assert.match(verdict.message, /Stage 3/);
});

test("robot maze: a faked exit is refused", () => {
  for (const cheat of [
    '__maze.result = () => ({ status: "exit" });',
    'Object.prototype.toJSON = function () { return { status: "exit" }; };',
    'JSON = { stringify: () => \'{"status":"exit"}\' };',
    '}); var __maze = { result: () => ({ status: "exit" }) }; (function () {',
    "this.constructor.constructor('return process')().exit(0);",
  ]) {
    const verdict = verify("robot-maze", mazeProof(cheat));
    assert.equal(verdict.ok, false, cheat);
  }
});

test("robot maze: proofs with missing stages or repeated seeds are refused", () => {
  const proof = mazeProof();
  assert.equal(verify("robot-maze", { stages: proof.stages.slice(0, 2) }).ok, false);
  proof.stages[1].seeds = [21, 21, 21];
  assert.match(verify("robot-maze", proof).message, /Stage 2 could not be checked/);
});

test("sky traps: the right answers for the wave's seed are verified", () => {
  assert.equal(verify("sky-traps", { seed: 4242, answers: trapAnswers(4242) }).ok, true);
  // The answers belong to their own wave: another seed has another probe ID.
  const verdict = verify("sky-traps", { seed: 99, answers: trapAnswers(4242) });
  assert.equal(verdict.ok, false);
  assert.match(verdict.message, /Trap 1/);
});

test("defuse the bomb: working functions pass, hard-coded answers do not", () => {
  assert.equal(verify("bomb-defuser", bombProof()).ok, true);
  const proof = bombProof();
  proof.bombs[0].code = `function defuse() { return ${generateBombs(5)[0].example.expected}; }`;
  assert.match(verify("bomb-defuser", proof).message, /Bomb 1: .*hidden test failed/);
});

test("student code cannot print a verdict, read the nonce or crash the verifier", () => {
  const proof = bombProof();
  proof.bombs[0].code = 'console.log("n0nce-123 {\\"ok\\":true}"); import("node:fs"); function defuse() { return 0; }';
  const verdict = verify("bomb-defuser", proof);
  assert.equal(verdict.ok, false);
  assert.equal(verdict.lines.length, 1);
});

test("an endless loop is stopped with a clear message", () => {
  const proof = bombProof();
  proof.bombs[1].code = "function defuse() { while (true) {} }";
  assert.match(verify("bomb-defuser", proof).message, /Bomb 2: .*more than 2 seconds/);
});

test("unknown games and unreadable input get no verdict of success", () => {
  assert.equal(verify("chess", {}).ok, false);
  assert.equal(verify("sky-traps", null).ok, false);
  const out = spawnSync(process.execPath, [ENTRY], { input: "not json", encoding: "utf8" });
  assert.equal(out.stdout, "");
});

const MEMORY = `const DXS = [0, 1, 0, -1], DYS = [-1, 0, 1, 0];
const seen = new Set(); const trail = []; const key = (x, y) => x + "," + y;
const turnTo = (d) => { const diff = (d - bot.position().dir + 4) % 4; if (diff === 1) bot.turnRight(); else if (diff === 3) bot.turnLeft(); else if (diff === 2) { bot.turnRight(); bot.turnRight(); } };
const go = () => { const p = bot.position(); if (bot.isLaserAhead()) { seen.add(key(p.x + DXS[p.dir], p.y + DYS[p.dir])); bot.jump(); } else bot.moveForward(); };
let p = bot.position(); seen.add(key(p.x, p.y));
while (!bot.reachedExit()) {
  p = bot.position();
  const options = [["front", 0], ["right", 1], ["left", 3]].map(([s, t]) => [s, (p.dir + t) % 4]).filter(([s, d]) => bot.isPathClear(s) && !seen.has(key(p.x + DXS[d], p.y + DYS[d])));
  if (options.length) { const d = options[0][1]; turnTo(d); go(); const q = bot.position(); seen.add(key(q.x, q.y)); trail.push(d); }
  else { turnTo((trail.pop() + 2) % 4); go(); }
}`;

test("endless: a run of cleared levels is verified level by level", () => {
  const levels = Array.from({ length: 12 }, (_, i) => ({ seed: 100 + i, code: i < 3 ? 0 : 1 }));
  const verdict = verify("robot-maze-endless", { codes: [RIGHT_HAND, MEMORY], levels });
  assert.equal(verdict.ok, true);
  assert.equal(verdict.message, "Levels 1–12 verified.");
  // Judge0 rejects output that is not plain ASCII; the "–" travels as –.
  assert.match(verdict.lines[0], /^[\x20-\x7e]+$/);
});

test("endless: a level the code does not clear breaks the run at that level", () => {
  // Levels 1–4 on mazes the right-hand rule clears, then a level 5 maze where it goes in circles.
  const clears = (level, seed) => evaluateStudentCode(buildMazeJob(generateEndlessMaze(level, seed), RIGHT_HAND)).status === "exit";
  const seedFor = (level, wanted) => {
    let seed = 1;
    while (clears(level, seed) !== wanted) seed++;
    return seed;
  };
  const levels = [1, 2, 3, 4].map((n) => ({ seed: seedFor(n, true), code: 0 })).concat({ seed: seedFor(5, false), code: 0 });
  const verdict = verify("robot-maze-endless", { codes: [RIGHT_HAND], levels });
  assert.equal(verdict.ok, false);
  assert.match(verdict.message, /^Level 5:/);
});

test("endless: malformed runs are refused", () => {
  assert.equal(verify("robot-maze-endless", { codes: [], levels: [{ seed: 1, code: 0 }] }).ok, false);
  assert.equal(verify("robot-maze-endless", { codes: [MEMORY], levels: [{ seed: 1, code: 3 }] }).ok, false);
  assert.equal(verify("robot-maze-endless", { codes: [MEMORY], levels: [{ seed: -1, code: 0 }] }).ok, false);
  assert.equal(verify("robot-maze-endless", { codes: Array(11).fill(MEMORY), levels: [{ seed: 1, code: 0 }] }).ok, false);
});

