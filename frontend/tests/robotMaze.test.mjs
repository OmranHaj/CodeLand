import test from "node:test";
import assert from "node:assert/strict";

const { generateMaze, generateEndlessMaze, endlessLevelConfig, ENDLESS_LOOPS_FROM, buildMazeJob, MAZE_STAGES, WALL, LASER, DX, DY } = await import("../src/games/robotMaze/mazeEngine.js");
const { evaluateStudentCode } = await import("../src/games/sandbox/evaluate.js");

const run = (maze, code) => evaluateStudentCode(buildMazeJob(maze, code));

/** A general solution any student could write: the right-hand rule, jumping over lasers. */
const RIGHT_HAND = `
while (!bot.reachedExit()) {
  if (bot.isPathClear('right')) {
    bot.turnRight();
  } else if (!bot.isPathClear('front')) {
    bot.turnLeft();
    continue;
  }
  if (bot.isLaserAhead()) bot.jump();
  else bot.moveForward();
}`;

/** Moves that follow a stage-1 corridor (what a student types by hand). */
function sequenceFor(maze) {
  const lines = [];
  let { x, y, dir } = maze.start;
  const open = (px, py) => maze.tiles[py * maze.width + px] !== WALL;
  while (!(x === maze.exit.x && y === maze.exit.y)) {
    if (open(x + DX[dir], y + DY[dir])) {
      lines.push("bot.moveForward();");
      x += DX[dir];
      y += DY[dir];
    } else if (open(x + DX[(dir + 1) % 4], y + DY[(dir + 1) % 4])) {
      lines.push("bot.turnRight();");
      dir = (dir + 1) % 4;
    } else {
      lines.push("bot.turnLeft();");
      dir = (dir + 3) % 4;
    }
  }
  return lines.join("\n");
}

test("three stages: short path, 7×7 maze, 9×9 maze with lasers", () => {
  assert.deepEqual(
    MAZE_STAGES.map((s) => [s.stage, s.cells ?? null, s.lasers ?? 0, s.hiddenMazes]),
    [
      [1, null, 0, 0],
      [2, 7, 0, 2],
      [3, 9, 4, 2],
    ],
  );
});

test("the same seed always builds the same maze; different seeds build different mazes", () => {
  assert.deepEqual(generateMaze(2, 12345), generateMaze(2, 12345));
  assert.notDeepEqual(generateMaze(2, 12345).tiles, generateMaze(2, 54321).tiles);
});

test("stage 1: a short corridor with 1–2 turns that a sequence of commands solves", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const maze = generateMaze(1, seed);
    const code = sequenceFor(maze);
    const turns = (code.match(/turn/g) || []).length;
    assert.ok(turns >= 1 && turns <= 2, `seed ${seed}: ${turns} turns`);
    assert.equal(run(maze, code).status, "exit", `seed ${seed}`);
  }
});

test("stages 2 and 3: every generated maze is solvable by a general algorithm", () => {
  for (const stage of [2, 3]) {
    for (let seed = 1; seed <= 300; seed++) {
      const maze = generateMaze(stage, seed);
      const outcome = run(maze, RIGHT_HAND);
      assert.equal(outcome.status, "exit", `stage ${stage} seed ${seed}: ${outcome.message}`);
    }
  }
});

test("stages 2 and 3 are perfect mazes: every cell is reachable and there are no loops", () => {
  for (const stage of [2, 3]) {
    const { cells } = MAZE_STAGES[stage - 1];
    const maze = generateMaze(stage, 777);
    const open = maze.tiles.filter((t) => t !== WALL).length;
    assert.equal(open, cells * cells + (cells * cells - 1)); // cells + one corridor per tree edge
  }
});

test("stage 3 has 4 lasers on corridors, never next to the start or the exit", () => {
  for (let seed = 1; seed <= 100; seed++) {
    const maze = generateMaze(3, seed);
    const lasers = [];
    maze.tiles.forEach((t, i) => t === LASER && lasers.push([i % maze.width, Math.floor(i / maze.width)]));
    assert.equal(lasers.length, 4, `seed ${seed}`);
    for (const [x, y] of lasers) {
      assert.equal((x % 2) + (y % 2), 1, "lasers sit on corridors between cells");
      assert.ok(Math.abs(x - maze.start.x) + Math.abs(y - maze.start.y) > 1);
      assert.ok(Math.abs(x - maze.exit.x) + Math.abs(y - maze.exit.y) > 1);
    }
  }
});

test("walking into a wall crashes and stops the program", () => {
  const maze = generateMaze(1, 5);
  const outcome = run(maze, "bot.turnLeft(); bot.turnLeft(); bot.moveForward(); bot.moveForward();");
  assert.equal(outcome.status, "crash");
  assert.equal(outcome.actions.at(-1).t, "crash");
  assert.equal(outcome.actions.filter((a) => a.t === "crash").length, 1, "nothing runs after the crash");
});

test("walking into a laser zaps the robot; jumping over it works", () => {
  const maze = generateMaze(3, 11);
  const noJump = run(maze, RIGHT_HAND.replace("if (bot.isLaserAhead()) bot.jump();\n  else ", ""));
  assert.equal(noJump.status, "zapped");
  assert.match(noJump.message, /jump/);
  assert.equal(run(maze, RIGHT_HAND).status, "exit");
});

test("jumping into a wall crashes", () => {
  const maze = generateMaze(1, 3);
  const outcome = run(maze, "bot.turnLeft(); bot.turnLeft(); bot.jump();");
  assert.equal(outcome.status, "crash");
});

test("reaching the exit ends the program (extra commands are ignored, not crashes)", () => {
  const maze = generateMaze(1, 9);
  const outcome = run(maze, sequenceFor(maze) + "\nbot.moveForward(); bot.moveForward();");
  assert.equal(outcome.status, "exit");
});

test("code that ends early reports that the robot did not arrive", () => {
  const outcome = run(generateMaze(1, 4), "bot.moveForward();");
  assert.equal(outcome.status, "stopped");
  assert.match(outcome.message, /not at the exit/);
});

test("an empty loop is stopped with a helpful message instead of freezing", () => {
  const outcome = run(generateMaze(2, 1), "while (!bot.reachedExit()) {}");
  assert.equal(outcome.status, "limit");
  assert.match(outcome.message, /ever move the robot/);
});

test("spinning in place is stopped by the move limit", () => {
  const outcome = run(generateMaze(2, 1), "while (true) { bot.turnLeft(); }");
  assert.equal(outcome.status, "limit");
  assert.match(outcome.message, /going in circles/);
});

test("a wrong sensor name gives a clear error", () => {
  assert.throws(() => run(generateMaze(2, 1), "bot.isPathClear('up');"), /expects 'front', 'left' or 'right'/);
});

test("a solution hard-coded for one maze fails on the hidden mazes", () => {
  const shown = generateMaze(2, 100);
  // Rebuild the exact command list the right-hand rule produced for this one maze.
  const outcome = run(shown, RIGHT_HAND);
  let dir = shown.start.dir;
  const commands = outcome.actions.map((a) => {
    if (a.t !== "turn") return a.t === "jump" ? "bot.jump();" : "bot.moveForward();";
    const right = a.dir === (dir + 1) % 4;
    dir = a.dir;
    return right ? "bot.turnRight();" : "bot.turnLeft();";
  });
  assert.ok(commands.length > 0);
  const hardCoded = commands.join("\n");
  assert.equal(run(shown, hardCoded).status, "exit");
  const hidden = [200, 300].map((seed) => run(generateMaze(2, seed), hardCoded).status);
  assert.ok(hidden.some((s) => s !== "exit"), `hidden results: ${hidden}`);
});

test("the student cannot replace the robot's commands", () => {
  const maze = generateMaze(1, 2);
  assert.throws(() => run(maze, "bot.reachedExit = () => true;"), TypeError);
});

/** A "memory" solution for endless mode: explore unvisited tiles (bot.position()), backtrack at dead ends. */
const MEMORY = `
const DXS = [0, 1, 0, -1], DYS = [-1, 0, 1, 0];
const seen = new Set();
const trail = [];
const key = (x, y) => x + "," + y;
const turnTo = (d) => {
  const diff = (d - bot.position().dir + 4) % 4;
  if (diff === 1) bot.turnRight();
  else if (diff === 3) bot.turnLeft();
  else if (diff === 2) { bot.turnRight(); bot.turnRight(); }
};
const go = () => {
  const p = bot.position();
  if (bot.isLaserAhead()) { seen.add(key(p.x + DXS[p.dir], p.y + DYS[p.dir])); bot.jump(); }
  else bot.moveForward();
};
let p = bot.position();
seen.add(key(p.x, p.y));
while (!bot.reachedExit()) {
  p = bot.position();
  const options = [["front", 0], ["right", 1], ["left", 3]]
    .map(([side, turn]) => [side, (p.dir + turn) % 4])
    .filter(([side, d]) => bot.isPathClear(side) && !seen.has(key(p.x + DXS[d], p.y + DYS[d])));
  if (options.length) {
    const d = options[0][1];
    turnTo(d);
    go();
    const q = bot.position();
    seen.add(key(q.x, q.y));
    trail.push(d);
  } else {
    turnTo((trail.pop() + 2) % 4);
    go();
  }
}`;

test("endless: the same level and seed rebuild the same maze", () => {
  assert.deepEqual(generateEndlessMaze(7, 123), generateEndlessMaze(7, 123));
  assert.notDeepEqual(generateEndlessMaze(7, 123).tiles, generateEndlessMaze(7, 124).tiles);
  assert.throws(() => generateEndlessMaze(0, 1));
});

test("endless: every level is at least as big and has at least as many lasers as the one before", () => {
  for (let level = 2; level <= 40; level++) {
    const now = endlessLevelConfig(level);
    const before = endlessLevelConfig(level - 1);
    assert.ok(now.cells >= before.cells && now.lasers >= before.lasers && now.loops >= before.loops, `level ${level}`);
  }
  assert.equal(endlessLevelConfig(ENDLESS_LOOPS_FROM - 1).loops, 0);
  assert.ok(endlessLevelConfig(ENDLESS_LOOPS_FROM).loops > 0);
});

test("endless: every maze can be solved by a program that remembers where it has been", () => {
  for (const level of [1, 3, 4, 6, 10, 20]) {
    for (let seed = 1; seed <= 40; seed++) {
      const maze = generateEndlessMaze(level, seed * 977);
      assert.equal(run(maze, MEMORY).status, "exit", `level ${level}, seed ${seed * 977}`);
    }
  }
});

test("endless: following the right wall works at first but not once the mazes have loops", () => {
  const passRate = (level) => {
    let passed = 0;
    for (let seed = 1; seed <= 60; seed++) if (run(generateEndlessMaze(level, seed * 31), RIGHT_HAND).status === "exit") passed++;
    return passed / 60;
  };
  assert.equal(passRate(1), 1);
  assert.equal(passRate(ENDLESS_LOOPS_FROM - 1), 1);
  assert.ok(passRate(12) < 0.7, "loops must stop the right-hand rule on many mazes");
});

test("endless: the exit moves inside once the mazes have loops", () => {
  const maze = generateEndlessMaze(ENDLESS_LOOPS_FROM + 2, 5);
  const edge = (v, size) => v <= 2 || v >= size - 3;
  assert.ok(!(edge(maze.exit.x, maze.width) && edge(maze.exit.y, maze.height)));
  assert.notEqual(maze.tiles[maze.exit.y * maze.width + maze.exit.x], WALL);
});

test("bot.position() reports where the robot is and which way it faces", () => {
  const maze = generateMaze(2, 21);
  const at = (code) => evaluateStudentCode({ ...buildMazeJob(maze, code), finish: "bot.position()" });
  assert.deepEqual(at(""), { x: maze.start.x, y: maze.start.y, dir: maze.start.dir });
  assert.equal(at("bot.turnRight();").dir, (maze.start.dir + 1) % 4);
});

