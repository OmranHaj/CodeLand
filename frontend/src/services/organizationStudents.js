/**
 * Shapes the students returned by GET /parent/children for the organization dashboard and
 * monthly report. Every figure comes from the backend; this only fills safe empty defaults.
 */

const EMPTY_QUIZ_METRICS = {
  accuracy: 0,
  totalQuizzesTaken: 0,
  challengesSolved: 0,
  codeSubmissions: 0,
  persistenceRating: "New Learner",
};

export function toDashboardStudents(students = []) {
  return (Array.isArray(students) ? students : []).map((s) => {
    const weeklyGoalHours = s.weeklyGoalHours ?? 6;
    const fullName = s.fullName || s.name || s.email?.split("@")[0] || "Student";
    return {
      ...s,
      fullName,
      avatar: s.avatar || fullName[0].toUpperCase(),
      themeColor: s.themeColor || "#6366f1",
      totalXp: s.totalXp ?? 0,
      streakDays: s.streakDays ?? 0,
      level: s.level || 1,
      rankTitle: s.rankTitle || "Novice Explorer",
      weeklyGoalHours,
      monthlyHours: s.monthlyHours ?? 0,
      activeDays: s.activeDays ?? 0,
      avgMinutesPerActiveDay: s.avgMinutesPerActiveDay ?? 0,
      avgWeeklyHours: s.avgWeeklyHours ?? 0,
      dailyActivities: Array.isArray(s.dailyActivities) ? s.dailyActivities : [],
      weeklyBreakdown: (s.weeklyBreakdown || []).map((w) => ({ ...w, target: weeklyGoalHours })),
      subjectMastery: Array.isArray(s.subjectMastery) ? s.subjectMastery : [],
      quizMetrics: { ...EMPTY_QUIZ_METRICS, ...(s.quizMetrics || {}) },
      recentBadges: Array.isArray(s.recentBadges) ? s.recentBadges : [],
      aiInsights: s.insights || {},
      activePath: s.activePath || "Not started yet",
      standing: s.standing || { label: "No activity yet", tone: "none" },
    };
  });
}

/** "+25% vs previous 30 days", or a neutral label when there is no earlier month to compare. */
export function monthTrendLabel(percent) {
  if (percent === null || percent === undefined) return "First 30 days";
  if (percent === 0) return "Same as previous 30 days";
  return `${percent > 0 ? "+" : ""}${percent}% vs previous 30 days`;
}

/** "Active today" / "Last active yesterday" / "Last active 5 days ago" / "No activity yet". */
export function lastActiveLabel(lastActiveDate, now = new Date()) {
  if (!lastActiveDate) return "No activity yet";
  const [y, m, d] = String(lastActiveDate).split("-").map(Number);
  const then = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today - then) / 86400000);
  if (days <= 0) return "Active today";
  if (days === 1) return "Last active yesterday";
  return `Last active ${days} days ago`;
}

/** "Oct 20" from a YYYY-MM-DD day key, without timezone shifting. */
export function shortDate(dayKey) {
  if (!dayKey) return "";
  const [y, m, d] = String(dayKey).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const STANDING_COLORS = {
  great: "#34d399",
  good: "#38bdf8",
  fair: "#fbbf24",
  none: "#94a3b8",
};
