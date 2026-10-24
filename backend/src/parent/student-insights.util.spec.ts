import { describe, it, expect } from 'vitest';
import {
  buildStudentInsights,
  buildSubjectMastery,
  buildChallengeMetrics,
  dayKey,
  type CatalogLevel,
  type StudentInsightInput,
} from './student-insights.util.js';

const NOW = new Date(2026, 9, 23, 18, 0, 0); // Oct 23 2026, local time

/** A DailyActivity row the way LearningService writes it: local midnight of the given day offset. */
const activity = (daysAgo: number, minutes: number, lessons = 1, challenges = 0) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return { date, durationMinutes: minutes, lessonsCompleted: lessons, challengesCompleted: challenges, xpEarned: 25 };
};

const catalog: CatalogLevel[] = [
  {
    slug: 'html-foundations',
    title: 'HTML Foundations',
    order: 1,
    track: { slug: 'web', title: 'Web Creator', themeColor: '#10b981', order: 1 },
    unitIds: new Set(['h1', 'h2', 'h3', 'h4', 'hq']),
    totalUnits: 5,
  },
  {
    slug: 'css-styling',
    title: 'CSS Styling',
    order: 2,
    track: { slug: 'web', title: 'Web Creator', themeColor: '#10b981', order: 1 },
    unitIds: new Set(['c1', 'c2', 'c3', 'c4', 'c5']),
    totalUnits: 5,
  },
  {
    slug: 'cpp-syntax-core',
    title: 'C++ Syntax Core',
    order: 1,
    track: { slug: 'cpp', title: 'C++ Developer', themeColor: null, order: 2 },
    unitIds: new Set(['p1', 'p2', 'p3', 'p4', 'challenge-uuid-1']),
    totalUnits: 5,
  },
];

const base = (overrides: Partial<StudentInsightInput> = {}): StudentInsightInput => ({
  now: NOW,
  firstName: 'Lina',
  streakDays: 0,
  lastActiveAt: null,
  activities: [],
  progress: [],
  catalog,
  challengeSubmissions: [],
  codeSubmissionCount: 0,
  recentAchievements: [],
  ...overrides,
});

describe('buildStudentInsights', () => {
  it('builds a full 30-day timeline ending today, filling quiet days with zero', () => {
    const r = buildStudentInsights(base({ activities: [activity(0, 30), activity(5, 20)] }));

    expect(r.dailyActivities).toHaveLength(30);
    expect(r.dailyActivities[29].date).toBe(dayKey(NOW));
    expect(r.dailyActivities[29]).toMatchObject({ minutes: 30, active: true });
    expect(r.dailyActivities[24]).toMatchObject({ minutes: 20, active: true });
    expect(r.dailyActivities[0]).toMatchObject({ minutes: 0, active: false });
    expect(r.activeDays).toBe(2);
    expect(r.activeToday).toBe(true);
  });

  it('computes totals, averages and the best day from real activity', () => {
    const r = buildStudentInsights(base({ activities: [activity(1, 60, 3, 2), activity(3, 30), activity(10, 30)] }));

    expect(r.monthlyMinutes).toBe(120);
    expect(r.monthlyHours).toBe(2);
    expect(r.avgMinutesPerActiveDay).toBe(40);
    expect(r.bestDay).toMatchObject({ minutes: 60, units: 5 });
    expect(r.activeToday).toBe(false);
  });

  it('compares with the previous 30 days, and reports no trend when there is nothing to compare', () => {
    const withHistory = buildStudentInsights(base({ activities: [activity(2, 90), activity(40, 60)] }));
    expect(withHistory.previousMonthlyMinutes).toBe(60);
    expect(withHistory.monthTrendPercent).toBe(50);

    const firstMonth = buildStudentInsights(base({ activities: [activity(2, 90)] }));
    expect(firstMonth.monthTrendPercent).toBeNull();
  });

  it('splits the last 28 days into 4 weeks, oldest first', () => {
    const r = buildStudentInsights(base({ activities: [activity(0, 60), activity(8, 120), activity(27, 30)] }));

    expect(r.weeklyBreakdown.map((w) => w.week)).toEqual(['3 weeks ago', '2 weeks ago', '1 week ago', 'This week']);
    expect(r.weeklyBreakdown.map((w) => w.hours)).toEqual([0.5, 0, 2, 1]);
  });

  it('a student with no activity gets honest empty figures', () => {
    const r = buildStudentInsights(base());

    expect(r.monthlyHours).toBe(0);
    expect(r.activeDays).toBe(0);
    expect(r.bestDay).toBeNull();
    expect(r.standing.tone).toBe('none');
    expect(r.loadZone).toBe('NO ACTIVITY YET');
    expect(r.quizMetrics.persistenceRating).toBe('New Learner');
    expect(r.insights.conversationStarter).toContain("hasn't completed a lesson yet");
  });

  it('maps recent achievements to badges with their real image and date', () => {
    const unlockedAt = new Date(2026, 9, 20, 12);
    const r = buildStudentInsights(
      base({
        recentAchievements: [
          { id: 'streak-3', title: 'Streak Novice', description: '3 days', badgeUrl: '/badges/badge-streak-3.svg', unlockedAt },
        ],
      }),
    );
    expect(r.recentBadges).toEqual([
      { id: 'streak-3', title: 'Streak Novice', desc: '3 days', icon: '/badges/badge-streak-3.svg', date: '2026-10-20' },
    ]);
  });
});

describe('buildSubjectMastery', () => {
  it('counts completed units per track, ignoring ids that are not real units', () => {
    const { subjectMastery, activePath } = buildSubjectMastery(
      [
        {
          levelId: 'html-foundations',
          completedLessonIds: ['h1', 'h2', 'h3', 'h4'],
          completedChallengeIds: ['hq', 'deleted-unit'],
          lastAccessedAt: new Date(2026, 9, 1),
        },
        { levelId: 'css-styling', completedLessonIds: ['c1'], completedChallengeIds: [], lastAccessedAt: new Date(2026, 9, 5) },
        {
          levelId: 'cpp-syntax-core',
          completedLessonIds: [],
          completedChallengeIds: ['challenge-uuid-1'],
          lastAccessedAt: new Date(2026, 9, 22),
        },
      ],
      catalog,
    );

    const web = subjectMastery.find((s) => s.id === 'web')!;
    expect(web).toMatchObject({ completedSectors: '6/10 units', percent: 60 });
    expect(web.keySkills).toEqual(['HTML Foundations', 'CSS Styling']);

    // Judge completions are stored by challenge id and still count.
    const cpp = subjectMastery.find((s) => s.id === 'cpp')!;
    expect(cpp).toMatchObject({ completedSectors: '1/5 units', percent: 20 });
    expect(cpp.color).toBeTruthy();

    expect(activePath).toBe('C++ Developer');
  });

  it('lists every track at 0% when nothing is started', () => {
    const { subjectMastery, activePath } = buildSubjectMastery([], catalog);
    expect(subjectMastery.map((s) => [s.id, s.percent])).toEqual([
      ['web', 0],
      ['cpp', 0],
    ]);
    expect(activePath).toBeNull();
  });
});

describe('buildChallengeMetrics', () => {
  it('uses real attempts for accuracy and distinct challenges for counts', () => {
    const m = buildChallengeMetrics(
      [
        { challengeId: '1', passed: false },
        { challengeId: '1', passed: true },
        { challengeId: '2', passed: true },
        { challengeId: '3', passed: false },
      ],
      7,
      9,
    );
    expect(m).toEqual({
      accuracy: 50,
      totalQuizzesTaken: 3,
      challengesSolved: 2,
      codeSubmissions: 7,
      persistenceRating: 'High',
    });
  });
});
