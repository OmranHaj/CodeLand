/**
 * Runs a student's code in an environment prepared by the game:
 *   setup  – game code that defines what the student may use (e.g. `bot`, `destroy`, `traps`)
 *   code   – the student's code, in the same scope so it can use those names
 *   finish – an expression evaluated afterwards that returns what the game needs to judge the run
 * Strict mode; meant to run inside the sandbox Worker (see sandbox.worker.js), never on the page.
 */
export function evaluateStudentCode({ setup = "", code = "", finish = "undefined", guard = false }) {
  // guard: the game may end the student's program early by throwing an object with __gameStop
  // (e.g. the robot crashed or reached the exit). Off by default because it puts the code in a
  // block, which would hide function declarations from `finish` in strict mode.
  const body = guard
    ? `try {\n${code}\n;\n} catch (__err) { if (!(__err && __err.__gameStop)) throw __err; }`
    : `${code}\n;`;
  // eslint-disable-next-line no-new-func
  const run = new Function(`"use strict";\n${setup}\n;\n${body}\nreturn (${finish});`);
  return run();
}

/** Errors as a short message a student can read ("TypeError: bot.fly is not a function"). */
export function describeError(error) {
  if (error && typeof error === "object" && "message" in error) {
    return `${error.name || "Error"}: ${error.message}`;
  }
  return String(error);
}

/** Results cross the Worker boundary as plain JSON (functions and cycles are dropped). */
export function toPlainResult(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}
