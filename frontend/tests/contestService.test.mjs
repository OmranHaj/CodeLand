import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for node environment
const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};
global.window = {
  dispatchEvent: () => {},
};
global.Event = class {};

import {
  loadContestState,
  saveContestState,
  isCurrentlySunday,
  getTimeUntilSunday,
  getEffectiveStage,
  registerCurrentStudent,
  unregisterCurrentStudent,
  isUserRegistered,
  awardStudentMedal,
  loadStudentMedals,
} from "../src/services/contestService.js";

test("contestService handles state initialization and persistence", () => {
  store.clear();
  const state = loadContestState();
  assert.ok(state.edition);
  assert.ok(Array.isArray(state.registeredStudents));
  assert.ok(state.registeredStudents.length > 5);

  const countdown = getTimeUntilSunday();
  assert.ok(typeof countdown.days === "number");
  assert.ok(typeof countdown.hours === "number");
  assert.ok(typeof countdown.minutes === "number");
  assert.ok(typeof countdown.seconds === "number");
});

test("contestService registers and unregisters a student correctly", () => {
  store.clear();
  const state = loadContestState();
  const mockUser = {
    id: "student-test-99",
    email: "student99@codeland.edu",
    fullName: "Karim Test",
  };

  assert.equal(isUserRegistered(mockUser, state), false);

  registerCurrentStudent(mockUser, 1500, 5);
  const updatedState = loadContestState();
  assert.equal(isUserRegistered(mockUser, updatedState), true);

  const found = updatedState.registeredStudents.find((s) => s.id === mockUser.id);
  assert.ok(found);
  assert.equal(found.name, "Karim Test");
  assert.equal(found.xp, 1500);

  unregisterCurrentStudent(mockUser);
  const finalState = loadContestState();
  assert.equal(isUserRegistered(mockUser, finalState), false);
});

test("contestService awards medals and stores certificate metadata", () => {
  store.clear();
  const mockUser = {
    id: "student-hero-1",
    email: "hero@codeland.edu",
    fullName: "Hero Champion",
  };

  const awarded = awardStudentMedal({
    user: mockUser,
    medalType: "gold",
    rank: 1,
    edition: "#42",
  });

  assert.equal(awarded.medalType, "gold");
  assert.equal(awarded.rank, 1);
  assert.equal(awarded.studentName, "Hero Champion");
  assert.ok(awarded.certificateCode.startsWith("CL-SUN-2026-GLD-"));
  assert.equal(awarded.signatories.length, 3);
  assert.equal(awarded.signatories[0].name, "Abdullah Al-Buraidi");
  assert.equal(awarded.signatories[1].name, "Omran Haj Hussein");
  assert.equal(awarded.signatories[2].name, "Abdullah Hamed");

  const medals = loadStudentMedals("student-hero-1");
  assert.ok(medals.some((m) => m.certificateCode === awarded.certificateCode));
});
