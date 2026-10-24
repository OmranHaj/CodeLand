import test from "node:test";
import assert from "node:assert/strict";

const { toDashboardStudents, monthTrendLabel, lastActiveLabel, shortDate } = await import(
  "../src/services/organizationStudents.js"
);

test("toDashboardStudents keeps the backend figures and fills only empty defaults", () => {
  const [s] = toDashboardStudents([
    {
      id: "u1",
      fullName: "Lina Haddad",
      totalXp: 180,
      weeklyGoalHours: 5,
      activeDays: 4,
      quizMetrics: { accuracy: 75, challengesSolved: 3 },
      weeklyBreakdown: [{ week: "This week", hours: 1.5, lessons: 6 }],
      insights: { strength: "Furthest along in Web Creator (40% complete)." },
      activePath: "Web Creator",
    },
  ]);

  assert.equal(s.totalXp, 180);
  assert.equal(s.activeDays, 4);
  assert.equal(s.quizMetrics.accuracy, 75);
  assert.equal(s.quizMetrics.totalQuizzesTaken, 0);
  assert.deepEqual(s.weeklyBreakdown, [{ week: "This week", hours: 1.5, lessons: 6, target: 5 }]);
  assert.equal(s.aiInsights.strength, "Furthest along in Web Creator (40% complete).");
  assert.equal(s.activePath, "Web Creator");
  assert.equal(s.avatar, "L");
  assert.equal("grade" in s, false);
});

test("a student with no data shows honest empty values, not sample numbers", () => {
  const [s] = toDashboardStudents([{ id: "u2", email: "omar@school.test" }]);
  assert.equal(s.fullName, "omar");
  assert.equal(s.monthlyHours, 0);
  assert.equal(s.activePath, "Not started yet");
  assert.deepEqual(s.recentBadges, []);
  assert.equal(s.standing.label, "No activity yet");
});

test("monthTrendLabel", () => {
  assert.equal(monthTrendLabel(null), "First 30 days");
  assert.equal(monthTrendLabel(25), "+25% vs previous 30 days");
  assert.equal(monthTrendLabel(-10), "-10% vs previous 30 days");
  assert.equal(monthTrendLabel(0), "Same as previous 30 days");
});

test("lastActiveLabel counts calendar days", () => {
  const now = new Date(2026, 9, 23, 22, 30);
  assert.equal(lastActiveLabel("2026-10-23", now), "Active today");
  assert.equal(lastActiveLabel("2026-10-22", now), "Last active yesterday");
  assert.equal(lastActiveLabel("2026-10-18", now), "Last active 5 days ago");
  assert.equal(lastActiveLabel(null, now), "No activity yet");
});

test("shortDate formats a day key without timezone shifts", () => {
  assert.equal(shortDate("2026-10-01"), "Oct 1");
  assert.equal(shortDate(null), "");
});
