import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
global.localStorage = {
  getItem: (k) => store.get(k) || null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
};

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({ url, options });
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ ok: true }),
  };
};

const {
  ARENA_XP_TIERS,
  formatXp,
  xpAfterHint,
  generateArenaContest,
  regenerateArenaContest,
  submitArenaSolution,
  revealArenaHint,
} = await import("../src/services/arenaProblemService.js");

test("XP tiers are exactly the six allowed values", () => {
  assert.deepEqual(ARENA_XP_TIERS, [25, 50, 75, 100, 125, 150]);
});

test("formatXp keeps meaningful fractions and drops trailing zeros", () => {
  assert.equal(formatXp(100), "100");
  assert.equal(formatXp(75), "75");
  assert.equal(formatXp(18.75), "18.75");
  assert.equal(formatXp(112.5), "112.5");
  assert.equal(formatXp(1234.5), "1,234.5");
  assert.equal(formatXp(undefined), "0");
});

test("xpAfterHint mirrors the backend 25% penalty", () => {
  assert.equal(xpAfterHint(100), 75);
  assert.equal(xpAfterHint(25), 18.75);
  assert.equal(xpAfterHint(150), 112.5);
});

test("generation always requests a full 6-problem contest", async () => {
  calls.length = 0;
  await generateArenaContest({ description: "A long enough story" });
  assert.match(calls[0].url, /\/admin\/arena\/contests\/generate$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), { description: "A long enough story" });

  await regenerateArenaContest("b-1");
  assert.match(calls[1].url, /\/admin\/arena\/contests\/b-1\/regenerate$/);
  assert.deepEqual(JSON.parse(calls[1].options.body), {});
});

test("student requests never carry XP values", async () => {
  calls.length = 0;
  await submitArenaSolution("p-1", { code: "print(1)", language: "python" });
  await revealArenaHint("p-1");
  assert.deepEqual(Object.keys(JSON.parse(calls[0].options.body)).sort(), ["code", "language"]);
  assert.match(calls[1].url, /\/arena\/problems\/p-1\/hint$/);
  assert.equal(calls[1].options.body, undefined);
});
