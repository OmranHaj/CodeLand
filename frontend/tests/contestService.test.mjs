import test from "node:test";
import assert from "node:assert/strict";

global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({ url, options });
  return { ok: true, status: 200, headers: { get: () => "application/json" }, json: async () => ({}) };
};

const {
  STAGE_THEME,
  divisionFor,
  formatContestWindow,
  getCountdown,
  registerForContest,
  unregisterFromContest,
  fetchStandings,
  toCertificateMedal,
} = await import("../src/services/contestService.js");

test("countdown uses the server clock offset", () => {
  const now = Date.UTC(2026, 9, 24, 10, 0, 0);
  const target = new Date(Date.UTC(2026, 9, 25, 12, 30, 15)).toISOString();
  assert.deepEqual(getCountdown(target, 0, now), { diffMs: 95415000, days: 1, hours: 2, minutes: 30, seconds: 15 });
  // Device clock 1 hour behind the server → 1 hour less remaining.
  assert.equal(getCountdown(target, 3_600_000, now).hours, 1);
  assert.equal(getCountdown(new Date(now - 1000).toISOString(), 0, now).diffMs, 0);
  assert.equal(getCountdown(null).diffMs, 0);
});

test("every server stage maps to a page theme", () => {
  for (const stage of ["none", "unscheduled", "upcoming", "live", "ended", "archived"]) {
    assert.ok(["registration", "live", "concluded"].includes(STAGE_THEME[stage]), stage);
  }
});

test("divisions follow platform XP", () => {
  assert.equal(divisionFor(0).division, "Rising Star");
  assert.equal(divisionFor(518.75).division, "Challenger");
  assert.equal(divisionFor(2000).division, "Master");
  assert.equal(divisionFor(4000).division, "Grandmaster");
});

test("contest window is formatted or marked pending", () => {
  assert.equal(formatContestWindow({}), "Schedule pending");
  assert.match(
    formatContestWindow({ startsAt: "2026-10-25T07:00:00Z", endsAt: "2026-10-25T20:59:00Z" }),
    /Sunday/
  );
});

test("registration and standings call the contest endpoints", async () => {
  calls.length = 0;
  await registerForContest("c-1");
  await unregisterFromContest("c-1");
  await fetchStandings("c-1");
  assert.deepEqual(
    calls.map((c) => [c.options.method || "GET", c.url.replace(/^.*?\/arena/, "/arena")]),
    [
      ["POST", "/arena/contests/c-1/registration"],
      ["DELETE", "/arena/contests/c-1/registration"],
      ["GET", "/arena/contests/c-1/standings"],
    ]
  );
});

test("server medals become printable certificates", () => {
  const medal = toCertificateMedal({
    id: "m-1",
    edition: 7,
    studentName: "Lina Haddad",
    medalType: "gold",
    rank: 1,
    score: 518.75,
    maxScore: 525,
    participants: 12,
    bonusXp: 500,
    certificateCode: "CL-SUN-7-GLD-A1B2C3",
    awardedAt: "2026-10-26T00:00:00Z",
  });
  assert.equal(medal.edition, "#7");
  assert.equal(medal.score, "518.75 / 525 XP");
  assert.equal(medal.xpWon, 500);
  assert.equal(medal.medalTitle, "1st Place Champion — Gold Medalist");
  assert.equal(medal.signatories.length, 3);
});
