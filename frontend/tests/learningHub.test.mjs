import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getProfile, getSummary, getUser, pathRoute, readStored, startPreview, writeStored } from "../src/services/learningHub.js";

const storage = new Map();
const localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) };
globalThis.localStorage = localStorage;
globalThis.window = { localStorage, dispatchEvent() {} };
beforeEach(() => storage.clear());

test("empty and invalid storage produce a usable new learner profile", () => {
  storage.set("codeland_current_user", "not-json");
  assert.equal(getUser(), null);
  assert.equal(getProfile().name, "Explorer");
  assert.equal(getSummary().xp, 0);
  assert.equal(getSummary().webPercent, 0);
  assert.equal(readStored("missing", 42), 42);
});

test("summaries combine existing lessons with Python and arena progress", () => {
  const user = { id: "learner-1" };
  writeStored("codeland_learning_progress_learner-1_html-foundations", { completedLessonIds: ["intro", "elements"], completedChallengeIds: ["first-page"], xp: 120 });
  writeStored("codeland_python_learner-1", [0, 1]);
  writeStored("codeland_practice_learner-1", [1, 2]);
  const summary = getSummary(user);
  assert.equal(summary.lessons, 4);
  assert.equal(summary.challenges, 3);
  assert.equal(summary.xp, 270);
  assert.equal(summary.pythonPercent, 40);
});

test("duplicate and invalid practice records cannot inflate rewards", () => {
  writeStored("codeland_python_guest", [0, 0, 1, -1, 9, "2"]);
  writeStored("codeland_practice_guest", [1, 1, 2, 0, 7, "3"]);
  const summary = getSummary();
  assert.equal(summary.lessons, 2);
  assert.equal(summary.challenges, 2);
  assert.equal(summary.xp, 150);
});

test("learner progress stays isolated between profiles", () => {
  writeStored("codeland_python_alex", [0, 1, 2, 3, 4]);
  assert.equal(getSummary({ id: "alex" }).completed, 1);
  assert.equal(getSummary({ id: "sam" }).lessons, 0);
});

test("saved world progress appears in the overview", () => {
  writeStored("codeland_web_world_progress_guest", { completedLevelIds: ["html-foundations"], levelProgress: { "html-foundations": 100 } });
  const summary = getSummary();
  assert.equal(summary.completed, 1);
  assert.equal(summary.webPercent, 20);
  assert.equal(summary.web[1].status, "current");
});

test("bad preferences fall back to accessible, valid defaults", () => {
  writeStored("codeland_profile_guest", { name: null, goal: 0, reducedMotion: "yes" });
  assert.equal(getProfile().name, "Explorer");
  assert.equal(getProfile().goal, 3);
  assert.equal(getProfile().reducedMotion, false);
});

test("preview sessions are separate and each learning path has its own route", () => {
  startPreview();
  assert.equal(getUser().id, "preview-student");
  assert.equal(getUser().isDemo, true);
  startPreview("parent");
  assert.equal(getUser().role, "parent");
  assert.equal(pathRoute("cpp-developer"), "/student/cpp-world");
  assert.equal(pathRoute("python-explorer"), "/student/python-world");
  assert.equal(pathRoute("web-creator"), "/student/world");
});
