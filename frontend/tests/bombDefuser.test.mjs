import test from "node:test";
import assert from "node:assert/strict";

const { generateBombs, checkBomb, BOMB_SECONDS } = await import("../src/games/bombDefuser/bombEngine.js");
const { evaluateStudentCode, describeError } = await import("../src/games/sandbox/evaluate.js");

/** The game's own check, with the sandbox replaced by a direct call. */
const check = (bomb, code) =>
  checkBomb(bomb, code, async (job) => {
    try {
      return { ok: true, result: JSON.parse(JSON.stringify(evaluateStudentCode(job))) };
    } catch (error) {
      return { ok: false, error: describeError(error) };
    }
  });

const [evens, reverse, repair] = generateBombs(4242);

const SUM_OF_EVENS = `function defuse(nums) {
  let total = 0;
  for (const n of nums) {
    if (n % 2 === 0) total += n;
  }
  return total;
}`;

const UNSCRAMBLE = `function defuse(code) {
  return code.replace(/[#!*]/g, "").split("").reverse().join("");
}`;

const FIXED = {
  largest: `function defuse(nums) {
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
  vowels: `function defuse(word) {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    if ("aeiou".includes(word[i])) count++;
  }
  return count;
}`,
  bigger: `function defuse(nums) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > 10) count++;
  }
  return count;
}`,
};

test("a game has 3 bombs with the agreed times", () => {
  assert.deepEqual(generateBombs(1).map((b) => b.kind), ["evens", "reverse", "repair"]);
  assert.deepEqual(BOMB_SECONDS, [60, 50, 45]);
  assert.deepEqual(generateBombs(1).map((b) => b.seconds), BOMB_SECONDS);
});

test("the same seed rebuilds the same bombs; another seed changes them", () => {
  assert.deepEqual(generateBombs(4242), generateBombs(4242));
  assert.notDeepEqual(generateBombs(99).map((b) => b.example), generateBombs(4242).map((b) => b.example));
});

test("every bomb has hidden tests besides the example", () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const bomb of generateBombs(seed)) assert.ok(bomb.hidden.length >= 4, `seed ${seed} bomb ${bomb.n}`);
  }
});

test("bomb 2 always hides at least 3 junk symbols in a reversed password", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const { example } = generateBombs(seed)[1];
    const text = example.args[0];
    assert.ok(text.replace(/[^#!*]/g, "").length >= 3, `seed ${seed}: ${text}`);
    assert.equal([...text.replace(/[#!*]/g, "")].reverse().join(""), example.expected);
  }
});

test("bomb 1: a correct sum of evens passes, in any style", async () => {
  assert.equal((await check(evens, SUM_OF_EVENS)).ok, true);
  assert.equal((await check(evens, "const defuse = (nums) => nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0);")).ok, true);
});

test("bomb 1: hard-coding the example fails a hidden test", async () => {
  const verdict = await check(evens, `function defuse(nums) { return ${evens.example.expected}; }`);
  assert.equal(verdict.ok, false);
  assert.match(verdict.message, /hidden test failed/);
});

test("bomb 1: forgetting to return is explained", async () => {
  const verdict = await check(evens, "function defuse(nums) { let total = 0; for (const n of nums) if (n % 2 === 0) total += n; }");
  assert.match(verdict.message, /The example failed.*returned undefined.*forget to return/);
});

test("bomb 2: the password is cleaned and reversed", async () => {
  assert.equal((await check(reverse, UNSCRAMBLE)).ok, true);
  const onlyReversed = await check(reverse, 'function defuse(code) { return code.split("").reverse().join(""); }');
  assert.equal(onlyReversed.ok, false);
  assert.match(onlyReversed.message, /should return "/);
});

test("bomb 3: every broken function fails as given and passes once fixed", async () => {
  const seen = new Set();
  for (let seed = 1; seed <= 60; seed++) {
    const bomb = generateBombs(seed)[2];
    seen.add(bomb.variant);
    assert.equal((await check(bomb, bomb.starter)).ok, false, `${bomb.variant} starter should fail`);
    assert.equal((await check(bomb, bomb.starter)).passed, 0, `${bomb.variant}: the example should show the bug`);
    assert.equal((await check(bomb, FIXED[bomb.variant])).ok, true, `${bomb.variant} fix should pass`);
  }
  assert.deepEqual([...seen].sort(), ["bigger", "largest", "vowels"]);
});

test("mistakes come back as messages a student can read", async () => {
  assert.match((await check(evens, "")).message, /Write your defuse function/);
  assert.match((await check(evens, "function solve(nums) { return 0; }")).message, /no function called defuse/);
  assert.match((await check(evens, "function defuse(nums) {")).message, /SyntaxError/);
  assert.match((await check(evens, "function defuse(nums) { return nums.boom(); }")).message, /threw TypeError/);
  assert.match((await check(repair, "function defuse() { return NaN; }")).message, /returned NaN/);
});

test("the student's code cannot see the hidden tests", async () => {
  // The cases live only in the expression that runs after the student's code.
  const verdict = await check(evens, "const leak = typeof __cases; function defuse() { return leak; }");
  assert.match(verdict.message, /returned "undefined"/);
});
