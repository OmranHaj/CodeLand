import { apiRequest } from "./api.js";

/** Lesson and challenge pages where a student's study time is counted. */
const TRACKED_PATHS = [
  /^\/student\/level\//,
  /^\/student\/algorithm-lab(\/|$)/,
  /^\/challenges(\/|$)/,
  /^\/student\/contest(\/|$)/,
];

/** No mouse, keyboard, scroll or touch for this long means the student stepped away. */
export const IDLE_LIMIT_MS = 3 * 60 * 1000;

/** Send the counted seconds to the server about this often. */
export const REPORT_EVERY_SECONDS = 30;

export function isTrackedPath(pathname = "") {
  return TRACKED_PATHS.some((pattern) => pattern.test(pathname));
}

export function isStudentUser(user) {
  const role = String(user?.role || "").toLowerCase();
  return Boolean(user) && !user.isDemo && (role === "student" || role === "child");
}

/**
 * Counts seconds while the page is in use: call tick(pageVisibleAndFocused) once a second and
 * interact() on any student input. Seconds after IDLE_LIMIT_MS without input are not counted.
 */
export function createActiveTimeCounter({ now = () => Date.now(), idleLimitMs = IDLE_LIMIT_MS } = {}) {
  let lastInteraction = now();
  let pending = 0;

  return {
    interact() {
      lastInteraction = now();
    },
    tick(pageInUse) {
      if (pageInUse && now() - lastInteraction < idleLimitMs) pending += 1;
      return pending;
    },
    take() {
      const seconds = pending;
      pending = 0;
      return seconds;
    },
  };
}

/** keepalive lets the last report finish while the page is closing. */
export function reportStudyTime(seconds, { keepalive = false } = {}) {
  return apiRequest("/learning/study-time", {
    method: "POST",
    body: JSON.stringify({ seconds }),
    keepalive,
  }).catch(() => {
    // Losing one report only loses a few seconds of time; never interrupt the lesson.
  });
}
