/**
 * Defuse the Bomb engine: three bombs built from a seed, each a small function the student writes
 * (or repairs), and the judge that runs it on the shown example and on hidden test cases.
 * Pure JavaScript so it runs in tests and (later) on the server; the same seed rebuilds the same bombs.
 */

import { createRandom } from "../random.js";

/** Seconds on each bomb's timer on a computer; phones get MOBILE_TIME_MULTIPLIER × this. */
export const BOMB_SECONDS = [60, 50, 45];

const WORDS = ["password", "firewall", "network", "keyboard", "compiler", "variable", "function", "terminal", "database", "security"];
const JUNK = "#!*";

const sumOfEvens = (nums) => nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0);
const reverse = (text) => [...text].reverse().join("");

/** Bomb 3 is a function with bugs; one of these is picked by the seed. */
const BROKEN = [
  {
    id: "largest",
    prompt: "This function should return the largest number in nums, but it has bugs. Find them and fix them.",
    hint: "Where does the loop start? And what if every number is negative: is 0 a good first guess for max?",
    code: `function defuse(nums) {
  let max = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) {
      max = nums[i];
    }
  }
  return max;
}
`,
    solve: (nums) => Math.max(...nums),
    cases(int) {
      // The example starts with the largest number, so the bug shows straight away.
      const rest = [int(2, 40), int(2, 40), int(2, 40), int(2, 40)];
      const example = [Math.max(...rest) + int(3, 20), ...rest];
      return {
        example: [example],
        hidden: [[[-7, -3, -12]], [[int(5, 50)]], [[int(1, 9), int(60, 90), int(10, 30)]], [[-5, 0, -2, -9]]],
      };
    },
  },
  {
    id: "vowels",
    prompt: "This function should count the vowels (a, e, i, o, u) in a lowercase word, but it has bugs. Find them and fix them.",
    hint: "Look at where the loop starts, and at what happens to count each time a vowel is found.",
    code: `function defuse(word) {
  let count = 0;
  for (let i = 1; i < word.length; i++) {
    if ("aeiou".includes(word[i])) {
      count = 1;
    }
  }
  return count;
}
`,
    solve: (word) => [...word].filter((c) => "aeiou".includes(c)).length,
    cases(int) {
      const starts = ["elephant", "orange", "umbrella", "avocado", "igloo", "octopus"];
      const others = ["banana", "rhythm", "queue", "computer", "a", "strength"];
      const pick = (list) => list[int(0, list.length - 1)];
      return { example: [pick(starts)], hidden: [["rhythm"], ["queue"], [pick(others.filter((w) => w !== "rhythm" && w !== "queue"))], ["idea"]] };
    },
  },
  {
    id: "bigger",
    prompt: "This function should count how many numbers in nums are bigger than 10, but it has bugs. Find them and fix them.",
    hint: "Is 10 bigger than 10? And does the function really need to return inside the loop?",
    code: `function defuse(nums) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] >= 10) {
      return count + 1;
    }
  }
  return count;
}
`,
    solve: (nums) => nums.filter((n) => n > 10).length,
    cases(int) {
      const example = [int(11, 30), 10, int(1, 9), int(31, 60), int(11, 99)];
      return { example: [example], hidden: [[[]], [[10, 10, 10]], [[int(1, 9), int(11, 20), int(21, 30)]], [[int(11, 50), int(51, 99), int(100, 200), 5]]] };
    },
  },
];

/** Reverses a word and scatters junk symbols through it: "password" → "!d#ro*w!ss#ap". */
function scramble(word, int) {
  const out = [];
  for (const ch of reverse(word)) {
    if (int(0, 9) < 4) out.push(JUNK[int(0, JUNK.length - 1)]);
    out.push(ch);
  }
  if (int(0, 1)) out.push(JUNK[int(0, JUNK.length - 1)]);
  // At least three junk symbols, so the clean-up step cannot be skipped.
  while (out.filter((c) => JUNK.includes(c)).length < 3) out.splice(int(0, out.length), 0, JUNK[int(0, JUNK.length - 1)]);
  return out.join("");
}

/** The three bombs of a game. Every value changes with the seed so answers cannot be memorised. */
export function generateBombs(seed) {
  const rand = createRandom(seed);
  const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

  // Bomb 1: a mix of even and odd numbers.
  const evensExample = [int(1, 9) * 2 + 1, int(1, 9) * 2, int(1, 9) * 2, int(1, 9) * 2 + 1, int(1, 9) * 2];
  const evensHidden = [[], [3, 5, 7], [-4, 7, 10], Array.from({ length: 8 }, () => int(1, 50)), [int(1, 20) * 2]];

  // Bomb 2: the example word and four different hidden words.
  const words = [...WORDS];
  const takeWord = () => words.splice(int(0, words.length - 1), 1)[0];
  const exampleWord = takeWord();
  const hiddenWords = [takeWord(), takeWord(), takeWord()];

  const broken = BROKEN[int(0, BROKEN.length - 1)];
  const brokenCases = broken.cases(int);

  const withExpected = (solve) => (args) => ({ args, expected: solve(...args) });

  return [
    {
      n: 1,
      kind: "evens",
      title: "Even Wires",
      prompt: "Write defuse(nums): it must return the sum of the even numbers in nums.",
      hint: "A number is even when n % 2 === 0. Start a total at 0 and add only the even numbers to it.",
      starter: `function defuse(nums) {
  // Return the sum of the even numbers in nums.

}
`,
      example: withExpected(sumOfEvens)([evensExample]),
      hidden: evensHidden.map((nums) => withExpected(sumOfEvens)([nums])),
    },
    {
      n: 2,
      kind: "reverse",
      title: "Scrambled Code",
      prompt: `Write defuse(code): the password is written backwards with junk symbols (${[...JUNK].join(" ")}) mixed in. Remove the junk and turn it the right way round.`,
      hint: 'Remove the symbols first (for example with .replace(/[#!*]/g, "")), then reverse: .split("").reverse().join("").',
      starter: `function defuse(code) {
  // Remove # ! * and return the text the right way round.

}
`,
      example: { args: [scramble(exampleWord, int)], expected: exampleWord },
      hidden: [...hiddenWords.map((w) => ({ args: [scramble(w, int)], expected: w })), { args: [reverse("cyber")], expected: "cyber" }],
    },
    {
      n: 3,
      kind: "repair",
      variant: broken.id,
      title: "Broken Circuit",
      prompt: broken.prompt,
      hint: broken.hint,
      starter: broken.code,
      example: withExpected(broken.solve)(brokenCases.example),
      hidden: brokenCases.hidden.map(withExpected(broken.solve)),
    },
  ].map((bomb, i) => ({ ...bomb, seconds: BOMB_SECONDS[i] }));
}

/** How a value is shown to the student: "password" in quotes, [1, 2], undefined. */
export function formatValue(value) {
  if (value === undefined) return "undefined";
  if (typeof value === "number" && Number.isNaN(value)) return "NaN";
  if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
  return JSON.stringify(value);
}

/** "defuse([3, 8, 12])" for one test case. */
export const formatCall = (args) => `defuse(${args.map(formatValue).join(", ")})`;

/**
 * One sandbox job that defines the student's code, then calls defuse() on every case. The cases
 * are written into `finish`, after the student's code has run, so the code cannot read them.
 * guard is off: a top-level `function defuse` must stay visible to `finish`.
 */
export function buildDefuseJob(code, cases) {
  const args = JSON.stringify(cases.map((c) => c.args));
  const finish = `typeof defuse !== "function" ? { missing: true } : { results: ${args}.map((args) => {
    try {
      const value = defuse(...args);
      if (value === undefined) return { kind: "undefined" };
      if (typeof value === "number" && Number.isNaN(value)) return { kind: "nan" };
      return { kind: "value", json: JSON.stringify(value) };
    } catch (error) {
      return { kind: "error", error: (error && error.name ? error.name + ": " : "") + (error && error.message !== undefined ? error.message : String(error)) };
    }
  }) }`;
  return { setup: "", code, finish, guard: false };
}

const shownResult = (r) => (r.kind === "undefined" ? "undefined" : r.kind === "nan" ? "NaN" : r.json);

/**
 * Runs the student's code on the example and the hidden cases and judges it. `run(job)` executes
 * a sandbox job and resolves with { ok, result } | { ok: false, error } (the Worker in the game,
 * a direct call in tests). Resolves with { ok, message, passed, total }.
 */
export async function checkBomb(bomb, code, run) {
  const cases = [bomb.example, ...bomb.hidden];
  const total = cases.length;
  if (!code.trim()) return { ok: false, message: "Write your defuse function first.", passed: 0, total };

  const res = await run(buildDefuseJob(code, cases));
  if (!res.ok) return { ok: false, message: res.error || "Your code could not run.", passed: 0, total };
  if (res.result?.missing) {
    return { ok: false, message: "There is no function called defuse. Keep the line function defuse(...) { ... }.", passed: 0, total };
  }

  const results = res.result?.results || [];
  let passed = 0;
  for (let i = 0; i < total; i++) {
    const r = results[i] || { kind: "undefined" };
    const wanted = JSON.stringify(cases[i].expected);
    if (r.kind === "value" && r.json === wanted) {
      passed++;
      continue;
    }
    const call = formatCall(cases[i].args);
    const got = r.kind === "error" ? `threw ${r.error}` : `returned ${shownResult(r)}`;
    const where = i === 0 ? "The example failed" : `The example passed, but a hidden test failed (${passed} of ${total} passed)`;
    let message = `${where}: ${call} ${got}, but it should return ${formatValue(cases[i].expected)}.`;
    if (r.kind === "undefined") message += " Did you forget to return the answer?";
    return { ok: false, message, passed, total };
  }
  return { ok: true, message: `All ${total} tests passed. Bomb defused!`, passed, total };
}
