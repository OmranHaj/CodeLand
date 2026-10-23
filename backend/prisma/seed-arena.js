/**
 * Seeds a test Sunday Arena contest: 6 connected problems (25 -> 150 XP) with
 * exactly the same shape ai/generate_contest.py produces, so the student arena
 * can be tried without calling Gemini.
 *
 * Like an admin generation, the new contest becomes the current one: the
 * previous contest is ARCHIVED (with its standings and medals) if students
 * could have seen it, otherwise deleted.
 *
 *   npm run seed:arena             -> PUBLISHED for the next weekly slot (Sunday 17:00-20:00,
 *                                     ARENA_TIMEZONE); registration is open the week before
 *   npm run seed:arena -- --now    -> PUBLISHED and live right now for 3 hours (quick testing;
 *                                     note that registration is already closed while live)
 *   npm run seed:arena -- --draft  -> DRAFT, scheduled for the next slot (review in the admin page first)
 *   npm run seed:arena -- --tests-only
 *                                  -> only (re)builds the hidden tests of the CURRENT contest's seeded
 *                                     problems in place; the contest, registrations and attempts stay
 *
 * Every problem gets a reference solution, a brute-force cross-check and
 * hidden tests (see seed-arena-tests.js and ai/arena_tests.py). If any
 * validation fails, nothing is written.
 */
import 'dotenv/config';
import { randomUUID } from 'crypto';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { ARENA_TEST_SPECS } from './seed-arena-tests.js';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const STORY =
  'A young engineer named Lina repairs the six lighthouses along the Stormcoast, one beacon at a time, before the great winter storm arrives.';

const XP_PROGRESSION = [25, 50, 75, 100, 125, 150];
const LEVELS = ['Very Easy', 'Easy', 'Easy-Medium', 'Medium', 'Medium-Hard', 'Hard'];
const COLORS = ['#34d399', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fbbf24'];

const PROBLEMS = [
  {
    title: 'A. Beacon Fuel',
    coreIdea: 'Basic math, arithmetic operations, or simple comparisons.',
    storyPart: 'Lina reaches the first lighthouse and checks how long its fuel tank will last.',
    problemStory:
      'The first lighthouse on the Stormcoast still has some oil in its tank. Every night, the lamp burns exactly b liters of oil, and a night only counts if the lamp burns for the whole night.\n\nThe tank currently holds t liters. Lina wants to know how many full nights the lighthouse can stay lit before she must refill it.',
    inputSpec: 'A single line contains two integers t and b — the liters of oil in the tank and the liters burned per night.',
    outputSpec: 'Print one integer — the number of full nights the lamp can burn.',
    constraints: ['1 <= t <= 10^9', '1 <= b <= 10^9'],
    examples: [
      { input: '20 3', output: '6', explanation: '6 nights use 18 liters. The remaining 2 liters are not enough for a 7th night.' },
      { input: '7 7', output: '1', explanation: 'The tank holds exactly one night of oil.' },
      { input: '5 9', output: '0', explanation: 'Not even one full night is possible.' },
    ],
    note: 'Only full nights count, so any leftover oil smaller than b is ignored.',
    hint: 'You are asking how many whole times b fits into t. Which arithmetic operator drops the remainder for you?',
    diagrams: false,
    imagePrompt: 'A lighthouse at dusk with an oil tank gauge showing 20 liters and three nights marked on a calendar.',
    caption: '20 L ÷ 3 L per night → 6 nights',
  },
  {
    title: 'B. Lens Inventory',
    coreIdea: 'Basic STL usage (simple arrays, vectors, or sorting).',
    storyPart: 'At the second lighthouse Lina finds a box of loose lenses that must be catalogued.',
    problemStory:
      'The second lighthouse keeps a box of spare lenses. Each lens has a size, but they were thrown into the box in random order.\n\nLina wants the catalogue to list every lens from the smallest to the largest, and she also wants to know how many different sizes the box contains.',
    inputSpec: 'The first line contains an integer n — the number of lenses. The second line contains n integers — the lens sizes.',
    outputSpec: 'On the first line print the n sizes in non-decreasing order, separated by spaces. On the second line print the number of distinct sizes.',
    constraints: ['1 <= n <= 2 * 10^5', '1 <= size <= 10^9'],
    examples: [
      { input: '5\n4 1 3 1 2', output: '1 1 2 3 4\n4', explanation: 'The distinct sizes are 1, 2, 3 and 4.' },
      { input: '3\n7 7 7', output: '7 7 7\n1', explanation: 'All three lenses have the same size.' },
    ],
    note: 'Equal sizes stay in the sorted list; they only count once for the second line.',
    hint: 'Sort the sizes first. After sorting, equal sizes sit next to each other, so a new distinct size starts exactly where a value differs from the one before it.',
    diagrams: true,
    imagePrompt: 'A 2x2 grid: a messy box of lenses, the lenses lined up by size, equal lenses grouped, and the final count of distinct sizes.',
    caption: '4 1 3 1 2 → sort → 1 1 2 3 4 · 4 distinct',
  },
  {
    title: 'C. Supply Boat',
    coreIdea: 'Easy Greedy or simple Implementation logic.',
    storyPart: 'Spare parts for the third lighthouse must be ferried across the bay by a tiny boat.',
    problemStory:
      'The third lighthouse sits on a rock in the middle of the bay. Lina must ferry n crates there with a small boat.\n\nOn each trip the boat can carry at most two crates, and the total weight on board must not exceed C. Every crate weighs at most C. Help Lina find the minimum number of trips needed to move all the crates.',
    inputSpec: 'The first line contains two integers n and C. The second line contains n integers — the crate weights.',
    outputSpec: 'Print one integer — the minimum number of trips.',
    constraints: ['1 <= n <= 2 * 10^5', '1 <= C <= 10^9', '1 <= weight <= C'],
    examples: [
      { input: '4 10\n9 1 5 5', output: '2', explanation: 'Trip 1 carries 9 and 1, trip 2 carries 5 and 5.' },
      { input: '3 5\n3 3 3', output: '3', explanation: 'Any two crates weigh 6 > 5, so every crate travels alone.' },
    ],
    note: 'A trip may carry a single crate.',
    hint: 'Sort the crates. The heaviest crate must travel on some trip — the best partner it can possibly get is the lightest crate left. If even that one does not fit, the heaviest crate goes alone.',
    diagrams: true,
    imagePrompt: 'A 2x2 grid showing sorted crates, pairing the heaviest with the lightest, a boat carrying a pair, and the final trip count.',
    caption: '1 5 5 9 · pair (1,9) and (5,5) → 2 trips',
  },
  {
    title: 'D. Signal Range',
    coreIdea: 'Binary Search or Two Pointers.',
    storyPart: 'With three lighthouses repaired, Lina must tune all beacons so every ship can see a light.',
    problemStory:
      'n repaired lighthouses stand on a straight coastline, and m ships are anchored along the same line. Every lighthouse will be set to the same beam radius R: a ship is safe if at least one lighthouse is at distance at most R from it.\n\nPower is precious before the storm, so Lina wants the smallest R that keeps every ship safe.',
    inputSpec: 'The first line contains n and m. The second line contains n integers — the lighthouse positions. The third line contains m integers — the ship positions. Positions are not necessarily sorted.',
    outputSpec: 'Print one integer — the minimum radius R.',
    constraints: ['1 <= n, m <= 10^5', '-10^9 <= position <= 10^9'],
    examples: [
      { input: '3 3\n1 5 10\n2 4 8', output: '2', explanation: 'Ship 8 is 2 away from lighthouse 10; the other ships are 1 away from their nearest lighthouse.' },
      { input: '1 3\n0\n-3 0 4', output: '4', explanation: 'The ship at 4 is the farthest from the only lighthouse.' },
    ],
    note: 'Several lighthouses or ships may share the same position.',
    hint: 'The answer is the largest "distance to the nearest lighthouse" over all ships. Sort the lighthouses, then binary search each ship\'s position to find its nearest lighthouse on the left and on the right.',
    diagrams: true,
    imagePrompt: 'A 2x2 grid: lighthouses and ships on a number line, the nearest lighthouse for each ship, the distances, and the maximum distance highlighted as R.',
    caption: 'R = max over ships of distance to nearest lighthouse',
  },
  {
    title: 'E. Beacon Sync',
    coreIdea: 'Easy Number Theory or constructive logic.',
    storyPart: 'The fifth lighthouse controls the blinking rhythm of all the beacons on the coast.',
    problemStory:
      'Each beacon on the Stormcoast blinks with its own period: beacon i flashes at seconds a_i, 2·a_i, 3·a_i and so on. All beacons were switched on together at second 0.\n\nThe harbor master will raise the storm alarm at the first moment after second 0 when every beacon flashes at the same time. Lina must tell him exactly when that happens.',
    inputSpec: 'The first line contains an integer n — the number of beacons. The second line contains n integers a_1 … a_n — the blinking periods.',
    outputSpec: 'Print one integer — the first second t > 0 at which all beacons flash together.',
    constraints: ['1 <= n <= 10', '1 <= a_i <= 20', 'The answer fits in a 64-bit signed integer.'],
    examples: [
      { input: '3\n2 3 4', output: '12', explanation: '12 is the smallest positive number divisible by 2, 3 and 4.' },
      { input: '2\n5 5', output: '5', explanation: 'Both beacons always flash together.' },
    ],
    note: 'The answer for all periods from 1 to 20 is 232792560.',
    hint: 'All beacons flash together at a time divisible by every period — that is the least common multiple. Build it step by step using lcm(x, y) = x / gcd(x, y) * y.',
    diagrams: false,
    imagePrompt: 'A vibrant night scene of the coast where several lighthouses flash in perfect unison under a storm sky.',
    caption: 'lcm(2, 3, 4) = 12 seconds',
  },
  {
    title: 'F. Storm Path',
    coreIdea: 'Standard DP, Graphs, Bitmask, or Segment Tree.',
    storyPart: 'The storm hits, and Lina must cross the rocky island to reach the last lighthouse.',
    problemStory:
      'The storm has arrived. The last lighthouse stands at the far corner of a rocky island, drawn as an n × m grid: "." is open ground and "#" is a rock. Lina starts at the top-left cell and must reach the bottom-right cell, moving one cell up, down, left or right per step.\n\nFind the minimum number of steps she needs, or report that the lighthouse cannot be reached.',
    inputSpec: 'The first line contains n and m. Each of the next n lines contains a string of m characters, each "." or "#".',
    outputSpec: 'Print the minimum number of steps, or -1 if the bottom-right cell is unreachable.',
    constraints: ['1 <= n, m <= 1000', 'The grid contains only "." and "#"', 'The top-left cell is always "."'],
    examples: [
      { input: '3 3\n...\n.#.\n...', output: '4', explanation: 'Go around the rock: right, right, down, down.' },
      { input: '2 2\n.#\n#.', output: '-1', explanation: 'Both neighbours of the start are rocks.' },
    ],
    note: 'If the bottom-right cell is a rock, it is unreachable.',
    hint: 'Treat every open cell as a graph node connected to its open neighbours. Breadth-first search from the start visits cells in order of distance, so the first time it reaches the target is the shortest path.',
    diagrams: true,
    imagePrompt: 'A 2x2 grid: the rocky island grid, BFS layers spreading from the start, the frontier reaching the lighthouse, and the final shortest path.',
    caption: 'BFS layers from the start → shortest path = 4',
  },
];

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A small themed illustration (lighthouse + beam + caption) in the tier color. */
function illustration(index, title, caption, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1026"/><stop offset="1" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${color}" stop-opacity="0.75"/><stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#sky)"/>
  ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 97) % 800}" cy="${(i * 53) % 220}" r="${i % 3 === 0 ? 1.6 : 1}" fill="#e2e8f0" opacity="0.6"/>`).join('')}
  <polygon points="250,150 800,60 800,260" fill="url(#beam)"/>
  <rect x="215" y="150" width="70" height="200" fill="#e2e8f0"/>
  <rect x="215" y="200" width="70" height="25" fill="${color}"/>
  <rect x="215" y="270" width="70" height="25" fill="${color}"/>
  <rect x="205" y="120" width="90" height="34" rx="6" fill="#334155"/>
  <circle cx="250" cy="137" r="12" fill="${color}"/>
  <path d="M0 350 Q100 330 200 350 T400 350 T600 350 T800 350 V450 H0 Z" fill="#0e7490" opacity="0.85"/>
  <path d="M0 380 Q100 360 200 380 T400 380 T600 380 T800 380 V450 H0 Z" fill="#155e75"/>
  <text x="400" y="62" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700">Sector ${index + 1}: ${escapeXml(title)}</text>
  <rect x="380" y="300" width="400" height="44" rx="10" fill="#0f172a" opacity="0.85" stroke="${color}"/>
  <text x="580" y="328" fill="${color}" font-family="Consolas, monospace" font-size="17" text-anchor="middle">${escapeXml(caption)}</text>
</svg>`;
  return Buffer.from(svg, 'utf-8');
}

function starterCode(index, title) {
  return {
    javascript: `// Sector ${index + 1}: ${title}\n// Read from stdin and print the answer with console.log\nconst data = require("fs").readFileSync(0, "utf8").trim().split(/\\s+/);\n\n// Your algorithm here\n`,
    python: `# Sector ${index + 1}: ${title}\nimport sys\n\ndef main():\n    data = sys.stdin.read().split()\n    # Your algorithm here\n\nif __name__ == "__main__":\n    main()\n`,
    cpp: `// Sector ${index + 1}: ${title}\n#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    // Your algorithm here\n    return 0;\n}`,
  };
}

/** Same plain-text layout as generate_contest.py's formatted_problem. */
function formattedProblem(p) {
  const examples = p.examples.map((ex) => `Input:\n${ex.input}\n\nOutput:\n${ex.output}`).join('\n\n');
  return [
    p.title,
    'time limit per test: 1.0 second',
    'memory limit per test: 256 megabytes',
    '',
    p.problemStory,
    '',
    `Input\n${p.inputSpec}`,
    '',
    `Output\n${p.outputSpec}`,
    '',
    `Constraints\n${p.constraints.map((c) => `- ${c}`).join('\n')}`,
    '',
    `Examples\n${examples}`,
    '',
    `Note:\n${p.note}`,
    '',
    `Hint (50% Solution):\n${p.hint}`,
  ].join('\n');
}

// Same weekly slot as ArenaContestsService (src/contest/arena-contest.util.ts).
const TIME_ZONE = process.env.ARENA_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone;
const clock = (v, fallback) => (/^(\d{1,2}):(\d{2})$/.exec((v || fallback).trim()) || /^(\d{1,2}):(\d{2})$/.exec(fallback)).slice(1).map(Number);
const [START_H, START_M] = clock(process.env.ARENA_START_TIME, '17:00');
const [END_H, END_M] = clock(process.env.ARENA_END_TIME, '20:00');

function zonedParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') };
}

function zonedTimeToUtc(y, m, d, h, min) {
  const offset = (date) => {
    const p = zonedParts(date);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
  };
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - offset(new Date(guess));
  return new Date(guess - offset(new Date(first)));
}

/** Next Sunday slot that has not started yet. */
function nextContestWindow(now) {
  const today = zonedParts(now);
  for (let add = 0; add <= 14; add++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + add));
    if (day.getUTCDay() !== 0) continue;
    const [y, m, d] = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()];
    const startsAt = zonedTimeToUtc(y, m, d, START_H, START_M);
    if (startsAt > now) return { startsAt, endsAt: zonedTimeToUtc(y, m, d, END_H, END_M) };
  }
  throw new Error('Could not compute the next contest window.');
}

const ARENA_TESTS_SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../ai/arena_tests.py');

/** Runs ai/arena_tests.py: validates the reference solution and computes the hidden tests. */
function buildHiddenTests(problem, index) {
  const spec = ARENA_TEST_SPECS[index];
  const proc = spawnSync(process.env.PYTHON_BIN || 'python', [ARENA_TESTS_SCRIPT], {
    input: JSON.stringify({
      reference: spec.reference,
      brute: spec.brute,
      examples: problem.examples,
      inputs: spec.inputs(),
    }),
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  });
  const marker = (proc.stdout || '').lastIndexOf('__ARENA_TESTS__');
  if (marker === -1) {
    throw new Error(`arena_tests.py failed for "${problem.title}": ${proc.stderr || proc.error?.message}`);
  }
  const result = JSON.parse(proc.stdout.slice(marker + '__ARENA_TESTS__'.length));
  if (result.status !== 'validated') {
    throw new Error(`Validation failed for "${problem.title}": ${result.error}`);
  }
  return {
    referenceSolution: spec.reference,
    bruteForceSolution: spec.brute,
    validationStatus: 'validated',
    validationError: null,
    tests: result.tests,
  };
}

async function attachTestsToCurrentContest(built) {
  const contest = await prisma.arenaContest.findFirst({
    where: { status: 'CURRENT' },
    orderBy: { createdAt: 'desc' },
    include: { problems: true },
  });
  if (!contest) throw new Error('No current contest to attach tests to.');
  let updated = 0;
  for (const [index, p] of PROBLEMS.entries()) {
    const target = contest.problems.find((row) => row.title === p.title);
    if (!target) {
      console.log(`  skipped "${p.title}" (not in contest #${contest.edition})`);
      continue;
    }
    const { tests, ...meta } = built[index];
    await prisma.$transaction([
      prisma.arenaTestCase.deleteMany({ where: { problemId: target.id } }),
      prisma.arenaTestCase.createMany({
        data: tests.map((t, order) => ({ problemId: target.id, order, kind: t.kind, input: t.input, expectedOutput: t.expectedOutput })),
      }),
      prisma.arenaProblem.update({ where: { id: target.id }, data: meta }),
    ]);
    updated++;
  }
  console.log(`Attached hidden tests to ${updated} problem(s) of contest #${contest.edition}; contest, registrations and attempts untouched.`);
}

async function main() {
  const draft = process.argv.includes('--draft');

  // Validate everything first: if any problem fails, nothing is written.
  const built = PROBLEMS.map((p, index) => {
    const result = buildHiddenTests(p, index);
    const kinds = result.tests.reduce((acc, t) => ({ ...acc, [t.kind]: (acc[t.kind] || 0) + 1 }), {});
    console.log(`  ✓ ${p.title}: ${result.tests.length} hidden tests (${Object.entries(kinds).map(([k, n]) => `${n} ${k}`).join(', ')})`);
    return result;
  });

  if (process.argv.includes('--tests-only')) {
    await attachTestsToCurrentContest(built);
    return;
  }
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  const batchId = randomUUID();
  const now = new Date();

  const rows = PROBLEMS.map((p, index) => {
    const xp = XP_PROGRESSION[index];
    const level = LEVELS[index];
    const finalImagePrompt = p.diagrams
      ? `Create a single image arranged as a 2x2 grid collage (exactly 4 panels: 2 panels on the top row and 2 panels on the bottom row). Style: Clean educational illustration and visual diagram. Content to illustrate across the 4 panels: ${p.imagePrompt}`
      : `Create a single vibrant, unified digital illustration (1 panel only, no grid) capturing this scene: ${p.imagePrompt}`;
    const starter = starterCode(index, p.title);
    const formatted = formattedProblem(p);
    const taskDescription = `${p.problemStory}\n\n**Input Specification:**\n${p.inputSpec}\n\n**Output Specification:**\n${p.outputSpec}`;

    // Mirrors one entry of generate_contest.py's "problems" list.
    const rawOutput = {
      id: `chapter-${index + 1}`,
      index,
      chapterNumber: index + 1,
      title: p.title,
      arabicTitle: `القطاع ${index + 1}: ${p.title}`,
      level,
      difficulty: level,
      difficultyColor: COLORS[index],
      baseXp: xp,
      basePoints: xp,
      xp,
      timeLimit: '1.0 second',
      memoryLimit: '256 megabytes',
      problemStory: p.problemStory,
      lore: p.problemStory,
      taskDescription,
      inputSpec: p.inputSpec,
      outputSpec: p.outputSpec,
      examples: p.examples,
      exampleInput: p.examples[0].input,
      exampleOutput: p.examples[0].output,
      note: p.note,
      hint: p.hint,
      constraints: p.constraints,
      storyPart: p.storyPart,
      coreIdea: p.coreIdea,
      canBeExplainedByDiagrams: p.diagrams,
      imagePrompt: finalImagePrompt,
      imagePath: '',
      imageUrl: '[stored in ArenaProblem.imageData]',
      imageError: '',
      formattedProblem: formatted,
      starterCode: starter,
      sampleTests: p.examples.map((ex) => ({ input: ex.input, expected: ex.output, explanation: ex.explanation })),
      seeded: true,
    };

    return {
      status: draft ? 'DRAFT' : 'PUBLISHED',
      publishedAt: draft ? null : now,
      xp,
      title: p.title,
      arabicTitle: rawOutput.arabicTitle,
      difficulty: level,
      difficultyIndex: index,
      difficultyColor: COLORS[index],
      statement: p.problemStory,
      taskDescription,
      inputSpec: p.inputSpec,
      outputSpec: p.outputSpec,
      constraints: p.constraints,
      examples: p.examples,
      note: p.note,
      hint: p.hint,
      timeLimit: '1.0 second',
      memoryLimit: '256 megabytes',
      starterCode: starter,
      formattedProblem: formatted,
      imageData: new Uint8Array(illustration(index, p.title, p.caption, COLORS[index])),
      imageMimeType: 'image/svg+xml',
      imagePrompt: finalImagePrompt,
      canBeExplainedByDiagrams: p.diagrams,
      storyPart: p.storyPart,
      coreIdea: p.coreIdea,
      sourceDescription: STORY,
      generationMode: 'contest',
      batchId,
      rawOutput,
      createdById: admin?.id ?? null,
      referenceSolution: built[index].referenceSolution,
      bruteForceSolution: built[index].bruteForceSolution,
      validationStatus: built[index].validationStatus,
      validationError: built[index].validationError,
      testCases: {
        create: built[index].tests.map((t, order) => ({ order, kind: t.kind, input: t.input, expectedOutput: t.expectedOutput })),
      },
    };
  });

  const window = process.argv.includes('--now')
    ? { startsAt: now, endsAt: new Date(now.getTime() + 3 * 60 * 60 * 1000) }
    : nextContestWindow(now);

  const { archived, deleted, edition } = await prisma.$transaction(async (tx) => {
    // Same rule as ArenaContestsService.retireCurrentContests: archive what students could see.
    const current = await tx.arenaContest.findMany({
      where: { status: 'CURRENT' },
      include: { _count: { select: { registrations: true } } },
    });
    let archived = 0;
    let deleted = 0;
    for (const contest of current) {
      const attempts = await tx.arenaProblemAttempt.count({ where: { problem: { batchId: contest.id } } });
      const published = await tx.arenaProblem.count({ where: { batchId: contest.id, status: 'PUBLISHED' } });
      if (published > 0 || contest._count.registrations > 0 || attempts > 0) {
        await tx.arenaContest.update({
          where: { id: contest.id },
          data: { status: 'ARCHIVED', archivedAt: now },
        });
        archived++;
      } else {
        await tx.arenaContest.delete({ where: { id: contest.id } });
        deleted++;
      }
    }

    const contest = await tx.arenaContest.create({
      data: { id: batchId, title: 'Sunday Arena', story: STORY, createdById: admin?.id ?? null, ...window },
    });
    for (const data of rows) {
      await tx.arenaProblem.create({ data });
    }
    return { archived, deleted, edition: contest.edition };
  });

  const fmt = (d) => d.toLocaleString('en-GB', { timeZone: TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const when = `live ${fmt(window.startsAt)} -> ${fmt(window.endsAt)} (${TIME_ZONE}), registration opens ${fmt(new Date(window.startsAt.getTime() - 7 * 24 * 3600 * 1000))}`;
  console.log(
    `Seeded contest #${edition} with ${rows.length} problems (${draft ? 'DRAFT' : 'PUBLISHED'}, ${when}). ` +
      `Archived ${archived} and deleted ${deleted} previous contest(s). contestId=${batchId}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
