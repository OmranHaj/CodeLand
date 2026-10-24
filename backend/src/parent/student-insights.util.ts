/**
 * Turns a student's raw database records into the numbers shown on the organization dashboard
 * and monthly report. Pure functions (no database access) so every figure is unit-testable.
 *
 * Study time is real time on lesson/challenge pages while visible and in use (activeSeconds).
 * Days recorded before that tracking existed carry an old estimate in durationMinutes, which is
 * added on so their history is not lost; new days only ever have real time.
 */

export const WINDOW_DAYS = 30;

export interface ActivityRecord {
  date: Date;
  durationMinutes: number;
  activeSeconds: number;
  lessonsCompleted: number;
  challengesCompleted: number;
  xpEarned: number;
}

export interface ProgressRecord {
  levelId: string; // level slug
  completedLessonIds: unknown;
  completedChallengeIds: unknown;
  lastAccessedAt: Date | null;
}

export interface CatalogLevel {
  slug: string;
  title: string;
  order: number;
  track: { slug: string; title: string; themeColor: string | null; order: number };
  /** Ids a completion may be stored under: lesson slugs, challenge slugs and challenge ids. */
  unitIds: Set<string>;
  totalUnits: number;
}

export interface SubmissionRecord {
  challengeId: string;
  passed: boolean;
}

export interface AchievementRecord {
  id: string;
  title: string;
  description: string;
  badgeUrl: string | null;
  unlockedAt: Date;
}

export interface StudentInsightInput {
  now: Date;
  firstName: string;
  streakDays: number;
  lastActiveAt: Date | null;
  activities: ActivityRecord[];
  progress: ProgressRecord[];
  catalog: CatalogLevel[];
  challengeSubmissions: SubmissionRecord[];
  codeSubmissionCount: number;
  recentAchievements: AchievementRecord[];
}

const TRACK_COLORS = ['#10b981', '#38bdf8', '#6366f1', '#f59e0b', '#f43f5e'];

/** Calendar day in the server's local time, matching how DailyActivity.date is written. */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Minutes studied on a day: real tracked time plus any legacy estimate from before tracking. */
export function activityMinutes(record: Pick<ActivityRecord, 'activeSeconds' | 'durationMinutes'>): number {
  return Math.round((record.activeSeconds || 0) / 60) + (record.durationMinutes || 0);
}

function asIdList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function buildDailyTimeline(activities: ActivityRecord[], now: Date) {
  const byDay = new Map(activities.map((a) => [dayKey(a.date), a]));
  const today = startOfDay(now);

  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const date = addDays(today, i - (WINDOW_DAYS - 1));
    const record = byDay.get(dayKey(date));
    const minutes = record ? activityMinutes(record) : 0;
    return {
      date: dayKey(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      minutes,
      lessonsCompleted: record?.lessonsCompleted ?? 0,
      challengesCompleted: record?.challengesCompleted ?? 0,
      xpEarned: record?.xpEarned ?? 0,
      active:
        minutes > 0 ||
        (record?.activeSeconds ?? 0) > 0 ||
        (record?.lessonsCompleted ?? 0) > 0 ||
        (record?.challengesCompleted ?? 0) > 0,
    };
  });
}

export function buildSubjectMastery(progress: ProgressRecord[], catalog: CatalogLevel[]) {
  const progressByLevel = new Map(progress.map((p) => [p.levelId, p]));
  const tracks = new Map<
    string,
    { slug: string; title: string; color: string | null; order: number; done: number; total: number; skills: string[]; lastAccessedAt: number }
  >();

  for (const level of [...catalog].sort((a, b) => a.order - b.order)) {
    const entry =
      tracks.get(level.track.slug) ??
      tracks
        .set(level.track.slug, {
          slug: level.track.slug,
          title: level.track.title,
          color: level.track.themeColor,
          order: level.track.order,
          done: 0,
          total: 0,
          skills: [],
          lastAccessedAt: 0,
        })
        .get(level.track.slug)!;

    const p = progressByLevel.get(level.slug);
    const completed = new Set(
      [...asIdList(p?.completedLessonIds), ...asIdList(p?.completedChallengeIds)].filter((id) => level.unitIds.has(id)),
    );
    const done = Math.min(completed.size, level.totalUnits);

    entry.total += level.totalUnits;
    entry.done += done;
    if (done > 0) entry.skills.push(level.title);
    if (p?.lastAccessedAt) entry.lastAccessedAt = Math.max(entry.lastAccessedAt, p.lastAccessedAt.getTime());
  }

  const ordered = [...tracks.values()].sort((a, b) => a.order - b.order);
  const subjectMastery = ordered.map((t, i) => ({
    id: t.slug,
    title: t.title,
    completedSectors: `${t.done}/${t.total} units`,
    percent: t.total > 0 ? Math.round((t.done / t.total) * 100) : 0,
    color: t.color || TRACK_COLORS[i % TRACK_COLORS.length],
    keySkills: t.skills.slice(0, 4),
    unitsDone: t.done,
  }));

  const mostRecent = ordered.filter((t) => t.lastAccessedAt > 0).sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)[0];
  return { subjectMastery, activePath: mostRecent?.title ?? null };
}

export function buildChallengeMetrics(submissions: SubmissionRecord[], codeSubmissionCount: number, activeDays: number) {
  const attempted = new Set(submissions.map((s) => s.challengeId));
  const solved = new Set(submissions.filter((s) => s.passed).map((s) => s.challengeId));
  const passedAttempts = submissions.filter((s) => s.passed).length;

  return {
    accuracy: submissions.length > 0 ? Math.round((passedAttempts / submissions.length) * 100) : 0,
    totalQuizzesTaken: attempted.size,
    challengesSolved: solved.size,
    codeSubmissions: codeSubmissionCount,
    persistenceRating:
      activeDays >= 16 ? 'Exceptional' : activeDays >= 8 ? 'High' : activeDays >= 1 ? 'Building' : 'New Learner',
  };
}

/** How regularly the student studied in the window, for the report "standing". */
export function consistencyStanding(activeDays: number) {
  if (activeDays >= 16) return { label: 'Excellent consistency', tone: 'great' as const };
  if (activeDays >= 8) return { label: 'Good consistency', tone: 'good' as const };
  if (activeDays >= 1) return { label: 'Getting started', tone: 'fair' as const };
  return { label: 'No activity yet', tone: 'none' as const };
}

/** Weekly-load zone used by the report's screen-time meter (average estimated hours per week). */
export function weeklyLoadZone(avgWeeklyHours: number, activeDays: number) {
  if (activeDays === 0) return 'NO ACTIVITY YET';
  if (avgWeeklyHours < 4) return 'LIGHT';
  if (avgWeeklyHours <= 7) return 'BALANCED';
  if (avgWeeklyHours <= 15) return 'INTENSIVE';
  return 'VERY HIGH';
}

export function buildStudentInsights(input: StudentInsightInput) {
  const { now } = input;
  const timeline = buildDailyTimeline(input.activities, now);

  const windowStart = startOfDay(addDays(now, -(WINDOW_DAYS - 1)));
  const previousStart = addDays(windowStart, -WINDOW_DAYS);
  const previousMinutes = input.activities
    .filter((a) => a.date >= previousStart && a.date < windowStart)
    .reduce((sum, a) => sum + activityMinutes(a), 0);

  const monthlyMinutes = timeline.reduce((sum, d) => sum + d.minutes, 0);
  const activeDays = timeline.filter((d) => d.active).length;
  const best = timeline.reduce<(typeof timeline)[number] | null>(
    (top, d) => (d.minutes > 0 && (!top || d.minutes > top.minutes) ? d : top),
    null,
  );

  const weeklyBreakdown = [0, 1, 2, 3].map((w) => {
    const days = timeline.slice(w * 7 + 2, w * 7 + 9); // last 28 days, oldest week first
    return {
      week: w === 3 ? 'This week' : `${3 - w} week${3 - w > 1 ? 's' : ''} ago`,
      hours: round1(days.reduce((s, d) => s + d.minutes, 0) / 60),
      lessons: days.reduce((s, d) => s + d.lessonsCompleted + d.challengesCompleted, 0),
    };
  });

  const { subjectMastery, activePath } = buildSubjectMastery(input.progress, input.catalog);
  const quizMetrics = buildChallengeMetrics(input.challengeSubmissions, input.codeSubmissionCount, activeDays);
  const avgWeeklyHours = round1(monthlyMinutes / 60 / (WINDOW_DAYS / 7));

  const lastActiveDay = [...timeline].reverse().find((d) => d.active);
  const activeToday = timeline[timeline.length - 1].active;

  const strongest = [...subjectMastery].sort((a, b) => b.percent - a.percent)[0];
  const latestSkill = [...subjectMastery]
    .filter((s) => s.title === activePath)
    .flatMap((s) => s.keySkills)
    .pop();
  const name = input.firstName;

  const insights = {
    conversationStarter: latestSkill
      ? `${name} has been working on "${latestSkill}". Ask them to explain one thing they learned there.`
      : `${name} hasn't completed a lesson yet. Ask which track they would like to start with.`,
    strength:
      strongest && strongest.percent > 0
        ? `Furthest along in ${strongest.title} (${strongest.percent}% complete).`
        : 'Ready to start learning.',
    growthTip:
      activeDays === 0
        ? 'A first short session this week is the best next step.'
        : activeDays < 8
          ? `Active on ${activeDays} of the last ${WINDOW_DAYS} days. Short daily sessions build the habit faster.`
          : input.streakDays >= 3
            ? `On a ${input.streakDays}-day streak. Celebrate it to keep the momentum going.`
            : `Active on ${activeDays} of the last ${WINDOW_DAYS} days. A steady routine is forming.`,
  };

  return {
    dailyActivities: timeline,
    monthlyMinutes,
    monthlyHours: round1(monthlyMinutes / 60),
    previousMonthlyMinutes: previousMinutes,
    monthTrendPercent: previousMinutes > 0 ? Math.round(((monthlyMinutes - previousMinutes) / previousMinutes) * 100) : null,
    activeDays,
    avgMinutesPerActiveDay: activeDays > 0 ? Math.round(monthlyMinutes / activeDays) : 0,
    avgWeeklyHours,
    loadZone: weeklyLoadZone(avgWeeklyHours, activeDays),
    bestDay: best ? { date: best.date, minutes: best.minutes, units: best.lessonsCompleted + best.challengesCompleted } : null,
    activeToday,
    lastActiveDate: lastActiveDay?.date ?? null,
    weeklyBreakdown,
    subjectMastery,
    activePath,
    quizMetrics,
    standing: consistencyStanding(activeDays),
    recentBadges: input.recentAchievements.map((a) => ({
      id: a.id,
      title: a.title,
      desc: a.description,
      icon: a.badgeUrl,
      date: dayKey(a.unlockedAt),
    })),
    insights,
  };
}
