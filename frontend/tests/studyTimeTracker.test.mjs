import test from "node:test";
import assert from "node:assert/strict";

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const { createActiveTimeCounter, isTrackedPath, isStudentUser, IDLE_LIMIT_MS } = await import(
  "../src/services/studyTimeTracker.js"
);

test("only lesson and challenge pages are tracked", () => {
  for (const path of [
    "/student/level/html-foundations",
    "/student/level/cpp-syntax-core",
    "/student/algorithm-lab",
    "/student/algorithm-lab/algo-arrays",
    "/challenges",
    "/challenges/3",
    "/student/contest",
  ]) {
    assert.equal(isTrackedPath(path), true, path);
  }
  for (const path of ["/student/dashboard", "/settings", "/parent/dashboard", "/challengesX", "/", "/courses"]) {
    assert.equal(isTrackedPath(path), false, path);
  }
});

test("only real student accounts are tracked", () => {
  assert.equal(isStudentUser({ role: "CHILD" }), true);
  assert.equal(isStudentUser({ role: "student" }), true);
  assert.equal(isStudentUser({ role: "PARENT" }), false);
  assert.equal(isStudentUser({ role: "ADMIN" }), false);
  assert.equal(isStudentUser({ role: "student", isDemo: true }), false);
  assert.equal(isStudentUser(null), false);
});

test("counts seconds only while the page is visible, focused and in use", () => {
  let now = 0;
  const counter = createActiveTimeCounter({ now: () => now });

  for (let i = 0; i < 10; i++) { now += 1000; counter.tick(true); }
  assert.equal(counter.take(), 10);

  // hidden or unfocused tab: nothing counts
  for (let i = 0; i < 10; i++) { now += 1000; counter.tick(false); }
  assert.equal(counter.take(), 0);
});

test("stops counting after the idle limit and resumes on input", () => {
  let now = 0;
  const counter = createActiveTimeCounter({ now: () => now });

  now = IDLE_LIMIT_MS - 1000;
  counter.tick(true);
  assert.equal(counter.take(), 1);

  now = IDLE_LIMIT_MS + 5000; // stepped away
  counter.tick(true);
  assert.equal(counter.take(), 0);

  counter.interact(); // came back
  now += 1000;
  counter.tick(true);
  assert.equal(counter.take(), 1);
});
