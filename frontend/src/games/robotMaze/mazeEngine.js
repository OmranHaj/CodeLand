/**
 * Robot Maze engine: maze generation from a seed, and the robot the student programs.
 * Pure JavaScript (no DOM, no 3D) so it can run in the sandbox Worker, in tests, and later on the
 * server to verify solutions: the same seed always produces the same maze.
 */

import { createRandom } from "../random.js";

export { createRandom, newSeed } from "../random.js";

export const WALL = 1;
export const OPEN = 0;
export const LASER = 2;

/** Directions by index: 0 = north (up), 1 = east, 2 = south, 3 = west. */
export const DX = [0, 1, 0, -1];
export const DY = [-1, 0, 1, 0];

export const MAZE_STAGES = [
  {
    stage: 1,
    title: "Short Path",
    goal: "Move the robot to the green exit, one command at a time.",
    teaches: "Commands in order",
    hiddenMazes: 0,
  },
  {
    stage: 2,
    title: "Zigzag",
    goal: "A 7×7 maze that changes every time. Write a loop that can solve ANY maze.",
    teaches: "while loops and if / else",
    hiddenMazes: 2,
    cells: 7,
    lasers: 0,
  },
  {
    stage: 3,
    title: "Laser Corridor",
    goal: "A 9×9 maze with lasers on the way. Jump over them and reach the exit.",
    teaches: "Combining conditions",
    hiddenMazes: 2,
    cells: 9,
    lasers: 4,
  },
];

/**
 * Endless mode (after the three stages): level after level of new mazes. Every level is bigger or
 * has more lasers, and from ENDLESS_LOOPS_FROM the maze has loops and the exit moves inside, so
 * following one wall can go round in circles: the robot has to remember where it has been.
 */
export const ENDLESS_LOOPS_FROM = 4;

/** Mistakes allowed in one endless run; each one brings a new maze of the same level. */
export const ENDLESS_LIVES = 3;

export function endlessLevelConfig(level) {
  return {
    cells: Math.min(6 + level, 15),
    lasers: Math.min(1 + level, 14),
    loops: level >= ENDLESS_LOOPS_FROM ? Math.min(2 + (level - ENDLESS_LOOPS_FROM) * 2, 24) : 0,
  };
}

function shuffle(list, rand) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** Stage 1: a corridor of 2–3 straight segments (1–2 turns) that never touches itself. */
function generatePath(rand) {
  for (;;) {
    const segments = rand() < 0.5 ? 2 : 3;
    let dir = Math.floor(rand() * 4);
    const firstDir = dir;
    let x = 0;
    let y = 0;
    const path = [[0, 0]];
    for (let s = 0; s < segments; s++) {
      const length = 2 + Math.floor(rand() * 3);
      for (let i = 0; i < length; i++) {
        x += DX[dir];
        y += DY[dir];
        path.push([x, y]);
      }
      if (s < segments - 1) dir = (dir + (rand() < 0.5 ? 1 : 3)) % 4;
    }

    // Reject paths that cross or run alongside themselves (that would open shortcuts).
    const index = new Map(path.map(([px, py], i) => [`${px},${py}`, i]));
    const touches =
      index.size !== path.length ||
      path.some(([px, py], i) =>
        [0, 1, 2, 3].some((d) => {
          const j = index.get(`${px + DX[d]},${py + DY[d]}`);
          return j !== undefined && Math.abs(j - i) > 1;
        }),
      );
    if (touches) continue;

    const minX = Math.min(...path.map((p) => p[0]));
    const minY = Math.min(...path.map((p) => p[1]));
    const width = Math.max(...path.map((p) => p[0])) - minX + 3;
    const height = Math.max(...path.map((p) => p[1])) - minY + 3;
    const tiles = new Array(width * height).fill(WALL);
    for (const [px, py] of path) tiles[(py - minY + 1) * width + (px - minX + 1)] = OPEN;
    const [sx, sy] = path[0];
    const [ex, ey] = path[path.length - 1];
    return {
      width,
      height,
      tiles,
      start: { x: sx - minX + 1, y: sy - minY + 1, dir: firstDir },
      exit: { x: ex - minX + 1, y: ey - minY + 1 },
    };
  }
}

/** Shortest tile path from start to exit (in a perfect maze it is the only one). */
function solutionPath(maze) {
  const { width, height, tiles, start, exit } = maze;
  const prev = new Map([[`${start.x},${start.y}`, null]]);
  const queue = [[start.x, start.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    if (x === exit.x && y === exit.y) break;
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d];
      const ny = y + DY[d];
      const key = `${nx},${ny}`;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || tiles[ny * width + nx] === WALL || prev.has(key)) continue;
      prev.set(key, [x, y]);
      queue.push([nx, ny]);
    }
  }
  const path = [];
  for (let node = [exit.x, exit.y]; node; node = prev.get(`${node[0]},${node[1]}`)) path.unshift(node);
  return path;
}

/**
 * Stages 2–3: a "perfect" maze (exactly one route between any two places, no closed-off areas),
 * carved with a randomized depth-first search on a grid of cells. Lasers go only on corridor tiles
 * of the route between two cells, so a jump from one cell always lands on the next.
 */
function generatePerfectMaze(rand, cells, laserCount, loops = 0) {
  const size = cells * 2 + 1;
  const tiles = new Array(size * size).fill(WALL);
  const visited = new Set(["0,0"]);
  const stack = [[0, 0]];
  tiles[1 * size + 1] = OPEN;

  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const next = shuffle([0, 1, 2, 3], rand)
      .map((d) => [cx + DX[d], cy + DY[d], d])
      .find(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cells && ny < cells && !visited.has(`${nx},${ny}`));
    if (!next) {
      stack.pop();
      continue;
    }
    const [nx, ny, d] = next;
    visited.add(`${nx},${ny}`);
    tiles[(cy * 2 + 1 + DY[d]) * size + (cx * 2 + 1 + DX[d])] = OPEN; // corridor between the cells
    tiles[(ny * 2 + 1) * size + (nx * 2 + 1)] = OPEN;
    stack.push([nx, ny]);
  }

  const start = { x: 1, y: 1, dir: tiles[1 * size + 2] === OPEN ? 1 : 2 }; // face the open way (east or south)
  const maze = { width: size, height: size, tiles, start, exit: { x: size - 2, y: size - 2 } };

  // Endless levels only (stages 2–3 make no extra random calls, so their seeds keep their mazes).
  if (loops > 0) {
    // Knocking down walls between neighbouring cells adds loops around islands of wall.
    const closed = [];
    for (let cy = 0; cy < cells; cy++) {
      for (let cx = 0; cx < cells; cx++) {
        if (cx + 1 < cells && tiles[(cy * 2 + 1) * size + cx * 2 + 2] === WALL) closed.push([cx * 2 + 2, cy * 2 + 1]);
        if (cy + 1 < cells && tiles[(cy * 2 + 2) * size + cx * 2 + 1] === WALL) closed.push([cx * 2 + 1, cy * 2 + 2]);
      }
    }
    for (const [x, y] of shuffle(closed, rand).slice(0, loops)) tiles[y * size + x] = OPEN;
    // The exit moves to a cell in the middle part, away from the outer wall.
    const low = Math.floor(cells / 4);
    const span = cells - 2 * low;
    maze.exit = { x: (low + Math.floor(rand() * span)) * 2 + 1, y: (low + Math.floor(rand() * span)) * 2 + 1 };
  }

  if (laserCount > 0) {
    const route = solutionPath(maze);
    // Corridor tiles have exactly one odd coordinate; skip the first and last so lasers are never
    // right next to the start or the exit.
    const corridors = route.filter(([x, y]) => (x % 2) + (y % 2) === 1).slice(1, -1);
    for (const [x, y] of shuffle(corridors, rand).slice(0, laserCount)) tiles[y * size + x] = LASER;
  }
  return maze;
}

/** An endless-mode level, fully determined by the level and the seed. */
export function generateEndlessMaze(level, seed) {
  if (!Number.isInteger(level) || level < 1) throw new Error(`Unknown endless level ${level}`);
  const { cells, lasers, loops } = endlessLevelConfig(level);
  const maze = generatePerfectMaze(createRandom(seed), cells, lasers, loops);
  return { stage: "endless", level, seed, ...maze };
}

/** The maze for a stage, fully determined by the seed. */
export function generateMaze(stage, seed) {
  const config = MAZE_STAGES.find((s) => s.stage === stage);
  if (!config) throw new Error(`Unknown maze stage ${stage}`);
  const rand = createRandom(seed);
  const maze = config.cells ? generatePerfectMaze(rand, config.cells, config.lasers) : generatePath(rand);
  return { stage, seed, ...maze };
}

/**
 * The robot the student programs. Self-contained on purpose (no references outside this function):
 * its source is injected into the sandbox Worker with createMazeBot.toString().
 * Crashing, getting zapped or reaching the exit ends the program by throwing { __gameStop: true }.
 */
export function createMazeBot(maze) {
  const STEP_X = [0, 1, 0, -1];
  const STEP_Y = [-1, 0, 1, 0];
  const { width, height, tiles, exit } = maze;
  const openTiles = tiles.filter((t) => t !== 1).length;
  const maxActions = Math.max(60, openTiles * 6);
  const maxChecks = Math.max(2000, openTiles * 60);
  const state = {
    x: maze.start.x,
    y: maze.start.y,
    dir: maze.start.dir,
    status: "running",
    message: "",
    actions: [],
    checks: 0,
  };

  const tileAt = (x, y) => (x < 0 || y < 0 || x >= width || y >= height ? 1 : tiles[y * width + x]);
  const atExit = () => state.x === exit.x && state.y === exit.y;
  const halt = () => {
    throw { __gameStop: true };
  };
  const stop = (status, message) => {
    if (state.status === "running") {
      state.status = status;
      state.message = message;
    }
    halt();
  };
  const ensureRunning = () => {
    if (state.status !== "running") halt();
  };
  const beforeAction = () => {
    ensureRunning();
    if (state.actions.length >= maxActions) {
      stop("limit", `The robot made ${maxActions} moves without reaching the exit. Is your loop going in circles?`);
    }
  };
  const beforeCheck = () => {
    ensureRunning();
    state.checks += 1;
    if (state.checks > maxChecks) {
      stop("limit", `Your code checked the sensors ${maxChecks} times without reaching the exit. Does your loop ever move the robot?`);
    }
  };
  const arrive = () => {
    if (atExit()) stop("exit", "The robot reached the exit!");
  };
  const directionOf = (side) => {
    if (side === "front") return state.dir;
    if (side === "right") return (state.dir + 1) % 4;
    if (side === "left") return (state.dir + 3) % 4;
    throw new Error(`isPathClear() expects 'front', 'left' or 'right', not ${JSON.stringify(side)}`);
  };

  const api = Object.freeze({
    moveForward() {
      beforeAction();
      const nx = state.x + STEP_X[state.dir];
      const ny = state.y + STEP_Y[state.dir];
      const next = tileAt(nx, ny);
      if (next === 1) {
        state.actions.push({ t: "crash", x: nx, y: ny });
        stop("crash", "The robot hit a wall.");
      }
      state.x = nx;
      state.y = ny;
      if (next === 2) {
        state.actions.push({ t: "zap", x: nx, y: ny });
        stop("zapped", "The robot walked into a laser. Use bot.jump() to get over it.");
      }
      state.actions.push({ t: "move", x: nx, y: ny });
      arrive();
    },
    turnLeft() {
      beforeAction();
      state.dir = (state.dir + 3) % 4;
      state.actions.push({ t: "turn", dir: state.dir });
    },
    turnRight() {
      beforeAction();
      state.dir = (state.dir + 1) % 4;
      state.actions.push({ t: "turn", dir: state.dir });
    },
    jump() {
      beforeAction();
      const fx = state.x + STEP_X[state.dir];
      const fy = state.y + STEP_Y[state.dir];
      const lx = state.x + STEP_X[state.dir] * 2;
      const ly = state.y + STEP_Y[state.dir] * 2;
      if (tileAt(fx, fy) === 1) {
        state.actions.push({ t: "crash", x: fx, y: fy });
        stop("crash", "The robot can't jump over a wall.");
      }
      const landing = tileAt(lx, ly);
      if (landing === 1) {
        state.actions.push({ t: "crash", x: lx, y: ly, jump: true });
        stop("crash", "The robot jumped into a wall. Only jump when there is room after the laser.");
      }
      state.x = lx;
      state.y = ly;
      if (landing === 2) {
        state.actions.push({ t: "zap", x: lx, y: ly, jump: true });
        stop("zapped", "The robot landed on a laser.");
      }
      state.actions.push({ t: "jump", x: lx, y: ly });
      arrive();
    },
    isPathClear(side = "front") {
      beforeCheck();
      const d = directionOf(side);
      return tileAt(state.x + STEP_X[d], state.y + STEP_Y[d]) !== 1; // lasers are not walls
    },
    isLaserAhead() {
      beforeCheck();
      return tileAt(state.x + STEP_X[state.dir], state.y + STEP_Y[state.dir]) === 2;
    },
    reachedExit() {
      beforeCheck();
      return atExit();
    },
    /** Where the robot is: { x, y, dir } with dir 0 = up, 1 = right, 2 = down, 3 = left. */
    position() {
      beforeCheck();
      return { x: state.x, y: state.y, dir: state.dir };
    },
  });

  const result = () => {
    const finished = state.status !== "running";
    return {
      status: finished ? state.status : atExit() ? "exit" : "stopped",
      message: finished
        ? state.message
        : atExit()
          ? "The robot reached the exit!"
          : "Your code finished, but the robot is not at the exit yet.",
      actions: state.actions,
      position: { x: state.x, y: state.y, dir: state.dir },
    };
  };

  // Frozen so student code cannot swap result() for one that reports a fake exit.
  return Object.freeze({ api, result });
}

/** The sandbox job that runs the student's code on one maze and returns the robot's run. */
export function buildMazeJob(maze, code) {
  return {
    setup: `const __maze = (${createMazeBot.toString()})(${JSON.stringify(maze)});\nconst bot = __maze.api;`,
    code,
    finish: "__maze.result()",
    guard: true,
  };
}

export const STARTER_CODE = {
  1: `// Guide the robot to the green exit.
// Commands: bot.moveForward()  bot.turnLeft()  bot.turnRight()

bot.moveForward();
`,
  2: `// This maze is different every time, and your code is also tested
// on 2 hidden mazes, so write a loop that works for ANY maze.
//
// Commands: bot.moveForward()  bot.turnLeft()  bot.turnRight()
// Sensors:  bot.isPathClear('front' | 'left' | 'right')  bot.reachedExit()

while (!bot.reachedExit()) {
  // your logic here
}
`,
  3: `// Lasers are on the way! A laser is not a wall (the path is clear),
// but walking into it zaps the robot. Jump over it instead.
//
// Commands: bot.moveForward()  bot.turnLeft()  bot.turnRight()  bot.jump()
// Sensors:  bot.isPathClear('front' | 'left' | 'right')  bot.isLaserAhead()  bot.reachedExit()

while (!bot.reachedExit()) {
  // your logic here
}
`,
};

export const STAGE_HINTS = {
  1: "Count the tiles to each turn. Then use bot.moveForward() that many times and turn toward the exit.",
  2: "Try the \"right-hand rule\": if the path on your right is clear, turn right and step forward; otherwise, if the path ahead is clear, step forward; otherwise turn left.",
  3: "Use the same idea as stage 2, but before every step check bot.isLaserAhead(). If there is a laser, bot.jump() instead of bot.moveForward().",
};

export const ENDLESS_INTRO = `// Endless mode: every level is a new, bigger maze with more lasers.
// From level ${ENDLESS_LOOPS_FROM} the mazes have loops and the exit is somewhere inside,
// so following one wall can go round in circles forever.
//
// New sensor: bot.position() gives { x, y, dir } (dir 0 = up, 1 = right, 2 = down, 3 = left).
// Use it to remember the tiles you have already visited.
`;

export const ENDLESS_STARTER = `${ENDLESS_INTRO}
while (!bot.reachedExit()) {
  // your logic here
}
`;

export const ENDLESS_HINT =
  "Keep a Set of visited tiles (key: x + ',' + y from bot.position()). At each step, go to a neighbour you have not visited yet and remember the direction in a list. When there is nowhere new to go, turn around and step back the way you came (pop the last direction).";
