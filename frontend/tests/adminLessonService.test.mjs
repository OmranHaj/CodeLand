import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_STORAGE_KEY,
  readAdminStore,
  writeAdminStore,
  getCourseLessons,
  getAllCourses,
  addLesson,
  updateLesson,
  deleteLesson,
  undoDeleteLesson,
  resetCourseOverlay,
  resetAllAdminOverlays,
  getAdminSummary,
} from "../src/services/adminLessonService.js";

// Mock localStorage and window in node test environment
const storage = new Map();
const mockLocalStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
globalThis.localStorage = mockLocalStorage;
globalThis.window = {
  localStorage: mockLocalStorage,
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

beforeEach(() => {
  storage.clear();
});

test("handles empty and malformed storage safely", () => {
  storage.set(ADMIN_STORAGE_KEY, "invalid-json{{");
  const store = readAdminStore();
  assert.equal(store.version, 1);
  assert.deepEqual(store.courses, {});

  const lessons = getCourseLessons("html-foundations");
  assert.ok(lessons.length > 0, "Base lessons should be available");
});

test("can add a lesson to a course with stable ID, correct ordering, and count update", () => {
  const baseCount = getCourseLessons("html-foundations").length;
  const newLesson = addLesson("html-foundations", {
    title: "Semantic Audio & Video Elements",
    subtitle: "Media tags in HTML5",
    description: "Learn how to embed native media without plugins.",
    difficulty: "intermediate",
    xp: 80,
    estimatedMinutes: 12,
    code: "<video controls><source src='demo.mp4' type='video/mp4'></video>",
    order: baseCount + 1,
  });

  assert.ok(newLesson.id.startsWith("custom-html-foundations-"));
  assert.equal(newLesson.title, "Semantic Audio & Video Elements");
  assert.equal(newLesson.xp, 80);
  assert.equal(newLesson.difficulty, "intermediate");

  const updatedLessons = getCourseLessons("html-foundations");
  assert.equal(updatedLessons.length, baseCount + 1);
  assert.equal(updatedLessons[updatedLessons.length - 1].id, newLesson.id);

  const summary = getAdminSummary();
  assert.equal(summary.totalAdded, 1);
  assert.equal(summary.hasAnyModifications, true);
});

test("can edit existing lesson fields while preserving untouched properties", () => {
  const initial = getCourseLessons("html-foundations")[0];
  const originalTitle = initial.title;

  const edited = updateLesson("html-foundations", initial.id, {
    title: "Updated Title for Welcome",
    xp: 95,
  });

  assert.equal(edited.title, "Updated Title for Welcome");
  assert.equal(edited.xp, 95);

  const current = getCourseLessons("html-foundations")[0];
  assert.equal(current.title, "Updated Title for Welcome");
  assert.equal(current.xp, 95);
  assert.equal(current.id, initial.id);
  assert.equal(current.subtitle, initial.subtitle); // preserved
});

test("can delete a lesson and undo the deletion safely", () => {
  const initialLessons = getCourseLessons("css-styling");
  const baseCount = initialLessons.length;
  const target = initialLessons[0];

  const deleteResult = deleteLesson("css-styling", target.id);
  assert.equal(deleteResult.success, true);
  assert.equal(deleteResult.deletedLesson.id, target.id);

  const afterDelete = getCourseLessons("css-styling");
  assert.equal(afterDelete.length, baseCount - 1);
  assert.ok(!afterDelete.some((l) => l.id === target.id));

  // Undo deletion
  undoDeleteLesson("css-styling", deleteResult.deletedLesson);
  const afterUndo = getCourseLessons("css-styling");
  assert.equal(afterUndo.length, baseCount);
  assert.ok(afterUndo.some((l) => l.id === target.id));
});

test("can reset course overlay back to pristine baseline", () => {
  addLesson("javascript-core", {
    title: "Temporary Experimental Lesson",
    description: "Testing reset.",
  });
  assert.ok(getCourseLessons("javascript-core").some((l) => l.title === "Temporary Experimental Lesson"));

  resetCourseOverlay("javascript-core");
  assert.ok(!getCourseLessons("javascript-core").some((l) => l.title === "Temporary Experimental Lesson"));
});

test("aggregates course metadata and tracks changes", () => {
  const courses = getAllCourses();
  assert.ok(courses.length >= 15);
  const htmlCourse = courses.find((c) => c.id === "html-foundations");
  assert.ok(htmlCourse);
  assert.equal(htmlCourse.group, "Web");
  assert.equal(htmlCourse.hasChanges, false);
});
