/**
 * The program the server sends to Judge0 (bundled into backend/src/games/game-verifier.source.ts
 * by backend/scripts/build-game-verifier.mjs). It reads { nonce, gameId, proof } from stdin, runs
 * every job of the student's code in its own node:vm context and prints one line:
 *   <nonce> {"ok":...,"message":...}
 * Student code never sees the nonce, the console or `process`, so it cannot print a fake verdict.
 */

import fs from "node:fs";
import vm from "node:vm";
import { verifyGame } from "./verifyGame.js";

const JOB_TIMEOUT_MS = 2000;

// Runs inside each context before the student's code: freezes what the result passes through
// (no fake toJSON, no replaced JSON) and keeps private copies of the serializer.
const PROLOGUE = `"use strict";
for (const o of [Object.prototype, Array.prototype, Function.prototype, String.prototype, Number.prototype, Boolean.prototype, Error.prototype, JSON]) Object.freeze(o);
const __json = JSON;
Object.defineProperty(globalThis, "JSON", { value: __json, writable: false, configurable: false });
Object.defineProperty(globalThis, "__serialize", { value: __json.stringify.bind(__json) });
Object.defineProperty(globalThis, "__describe", {
  value: (e) => (e && typeof e === "object" && "message" in e ? String(e.name || "Error") + ": " + String(e.message) : String(e)),
});`;

/** Same contract as the browser sandbox (runInSandbox): { setup, code, finish, guard } → { ok, result | error }. */
function runInVm({ setup = "", code = "", finish = "undefined", guard = false }) {
  // A null-prototype global and no string code generation close the usual vm escapes
  // (this.constructor.constructor, eval, Function); the whole run also sits inside Judge0.
  const context = vm.createContext(Object.create(null), {
    codeGeneration: { strings: false, wasm: false },
    microtaskMode: "afterEvaluate",
  });
  vm.runInContext(PROLOGUE, context);

  const body = guard ? `try {\n${code}\n;\n} catch (__err) { if (!(__err && __err.__gameStop)) throw __err; }` : `${code}\n;`;
  let run;
  try {
    // Compiled as a function body, so code cannot close the function early with "})".
    run = vm.compileFunction(`"use strict";\n${setup}\n;\n${body}\nreturn (${finish});`, [], {
      parsingContext: context,
      importModuleDynamically: () => {
        throw new Error("import() is not allowed.");
      },
    });
  } catch (error) {
    return { ok: false, error: `${error.name}: ${error.message}` };
  }
  Object.defineProperty(context, "__run", { value: run });

  try {
    const json = vm.runInContext(
      "(() => { try { const v = __run(); return __serialize({ ok: true, value: v === undefined ? null : v, undef: v === undefined }); } catch (e) { return __serialize({ ok: false, error: __describe(e) }); } })()",
      context,
      { timeout: JOB_TIMEOUT_MS },
    );
    const outcome = JSON.parse(json);
    if (!outcome.ok) return { ok: false, error: outcome.error };
    return { ok: true, result: outcome.undef ? undefined : outcome.value };
  } catch (error) {
    if (/timed out/i.test(String(error?.message))) {
      return { ok: false, timedOut: true, error: "Your code ran for more than 2 seconds. Check for a loop that never ends." };
    }
    return { ok: false, error: "Your code could not run." };
  }
}

/**
 * JSON with every non-ASCII character written as \uXXXX: Judge0 (base64 off) rejects output that is
 * not plain ASCII, and messages can contain "–" or the student's own text.
 */
const asciiJson = (value) =>
  JSON.stringify(value).replace(/[^\x20-\x7e]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);

// A stray rejection from student code (e.g. import()) must not stop the verdict from printing.
process.on("unhandledRejection", () => {});
process.on("uncaughtException", () => {});

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  input = null;
}
const nonce = input?.nonce;

if (typeof nonce === "string" && nonce) {
  verifyGame(input.gameId, input.proof, async (job) => runInVm(job))
    .catch(() => ({ ok: false, message: "The verifier failed." }))
    .then((verdict) => process.stdout.write(`${nonce} ${asciiJson({ ok: verdict.ok === true, message: String(verdict.message || "") })}\n`));
}
