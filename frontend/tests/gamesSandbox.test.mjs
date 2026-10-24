import test from "node:test";
import assert from "node:assert/strict";

const { evaluateStudentCode, describeError, toPlainResult } = await import("../src/games/sandbox/evaluate.js");

test("student code runs with what the game set up and the game reads the outcome", () => {
  const result = evaluateStudentCode({
    setup: "const moves = []; const bot = { moveForward: () => moves.push('F'), turnRight: () => moves.push('R') };",
    code: "bot.moveForward(); bot.turnRight(); bot.moveForward();",
    finish: "moves",
  });
  assert.deepEqual(result, ["F", "R", "F"]);
});

test("a function the student defines is available to the game's check", () => {
  const result = evaluateStudentCode({
    code: "function defuse(nums) { return nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0); }",
    finish: "defuse([3, 8, 12, 5, 6])",
  });
  assert.equal(result, 26);
});

test("runs in strict mode (undeclared variables are errors)", () => {
  assert.throws(() => evaluateStudentCode({ code: "oops = 1" }), ReferenceError);
});

test("syntax errors are reported, not crashed on", () => {
  let message = "";
  try {
    evaluateStudentCode({ code: "bot.moveForward(" });
  } catch (error) {
    message = describeError(error);
  }
  assert.match(message, /^SyntaxError: /);
});

test("results are reduced to plain JSON for the trip back from the Worker", () => {
  assert.deepEqual(toPlainResult({ a: 1, f: () => 1 }), { a: 1 });
  assert.equal(toPlainResult(undefined), undefined);
});
