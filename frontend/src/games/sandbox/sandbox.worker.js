import { describeError, evaluateStudentCode, toPlainResult } from "./evaluate.js";

// The student's code runs in this Worker: it has no DOM, no localStorage (so no login token),
// and the network APIs are removed below. The page terminates the Worker on timeout.
const reply = self.postMessage.bind(self);

for (const name of [
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "importScripts",
  "indexedDB",
  "caches",
  "BroadcastChannel",
  "Worker",
  "SharedWorker",
  "postMessage",
]) {
  try {
    Object.defineProperty(self, name, { value: undefined, configurable: false, writable: false });
  } catch {
    // Some properties cannot be redefined in every browser; the Worker still has no token.
  }
}

self.onmessage = (event) => {
  // The nonce lives only in this closure, so student code cannot forge a reply the page accepts.
  const { nonce, setup, code, finish, guard } = event.data || {};
  try {
    const result = toPlainResult(evaluateStudentCode({ setup, code, finish, guard }));
    reply({ nonce, ok: true, result });
  } catch (error) {
    reply({ nonce, ok: false, error: describeError(error) });
  }
};
