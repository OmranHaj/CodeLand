/** Longest a single run may take before the Worker is terminated (stops `while (true) {}`). */
export const DEFAULT_TIMEOUT_MS = 2000;

/**
 * Runs student code in a fresh, isolated Worker and resolves with
 *   { ok: true, result } | { ok: false, error } | { ok: false, timedOut: true, error }.
 * A new Worker per run means nothing a previous run left behind can affect the next one.
 */
export function runInSandbox({ setup = "", code = "", finish = "undefined", guard = false }, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./sandbox.worker.js", import.meta.url), { type: "module" });
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let settled = false;

    const finishWith = (outcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(outcome);
    };

    const timer = setTimeout(
      () =>
        finishWith({
          ok: false,
          timedOut: true,
          error: `Your code ran for more than ${Math.round(timeoutMs / 1000)} seconds. Check for a loop that never ends.`,
        }),
      timeoutMs,
    );

    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.nonce !== nonce) return; // not our reply (e.g. student code calling postMessage)
      finishWith(data.ok ? { ok: true, result: data.result } : { ok: false, error: data.error });
    };

    worker.onerror = (event) => {
      event.preventDefault?.();
      finishWith({ ok: false, error: event.message || "Your code could not run." });
    };

    worker.postMessage({ nonce, setup, code, finish, guard });
  });
}
