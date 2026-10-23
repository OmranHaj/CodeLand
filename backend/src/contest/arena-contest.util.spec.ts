import { describe, it, expect } from 'vitest';
import {
  ARENA_SCHEDULE,
  canCompete,
  canViewProblems,
  getContestStage,
  isRegistrationOpen,
  nextContestWindow,
  pickMedalists,
  publicName,
  rankStandings,
  registrationOpensAt,
  zonedTimeToUtc,
} from './arena-contest.util.js';

const at = (iso: string) => new Date(iso);

describe('contest stage', () => {
  const window = { status: 'CURRENT' as const, startsAt: at('2026-10-25T00:00:00Z'), endsAt: at('2026-10-26T00:00:00Z') };

  it('follows the live window', () => {
    expect(getContestStage(window, at('2026-10-24T12:00:00Z'))).toBe('upcoming');
    expect(getContestStage(window, at('2026-10-25T00:00:00Z'))).toBe('live');
    expect(getContestStage(window, at('2026-10-25T23:59:59Z'))).toBe('live');
    expect(getContestStage(window, at('2026-10-26T00:00:00Z'))).toBe('ended');
  });

  it('handles unscheduled and archived contests', () => {
    expect(getContestStage({ status: 'CURRENT', startsAt: null, endsAt: null })).toBe('unscheduled');
    expect(getContestStage({ ...window, status: 'ARCHIVED' }, at('2026-10-25T10:00:00Z'))).toBe('archived');
  });

  it('only allows competing while live and hides problems before the start', () => {
    expect(canCompete('live')).toBe(true);
    for (const s of ['unscheduled', 'upcoming', 'ended', 'archived'] as const) expect(canCompete(s)).toBe(false);
    expect(canViewProblems('upcoming')).toBe(false);
    expect(canViewProblems('unscheduled')).toBe(false);
    expect(canViewProblems('ended')).toBe(true);
  });
});

describe('standings', () => {
  const base = { registeredAt: at('2026-10-20T00:00:00Z'), failedCount: 0, lastSolvedAt: null };

  it('orders by XP, then solved count, then time, then failures', () => {
    const ranked = rankStandings([
      { ...base, userId: 'slow', score: 100, solvedCount: 2, lastSolvedAt: at('2026-10-25T12:00:00Z') },
      { ...base, userId: 'fast', score: 100, solvedCount: 2, lastSolvedAt: at('2026-10-25T10:00:00Z') },
      { ...base, userId: 'top', score: 150, solvedCount: 1, lastSolvedAt: at('2026-10-25T13:00:00Z') },
      { ...base, userId: 'zero', score: 0, solvedCount: 0 },
    ]);
    expect(ranked.map((r) => r.userId)).toEqual(['top', 'fast', 'slow', 'zero']);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3, null]);
  });

  it('does not rank anyone before they solve something (no "everyone is #1")', () => {
    const fresh = ['a', 'b', 'c'].map((userId, i) => ({
      ...base,
      userId,
      score: 0,
      solvedCount: 0,
      registeredAt: at(`2026-10-2${i}T00:00:00Z`),
    }));
    const ranked = rankStandings(fresh);
    expect(ranked.map((r) => r.rank)).toEqual([null, null, null]);
    // Unranked contenders keep registration order.
    expect(ranked.map((r) => r.userId)).toEqual(['a', 'b', 'c']);

    // A failed attempt alone does not earn a rank either.
    const withFailure = rankStandings([...fresh, { ...base, userId: 'd', score: 0, solvedCount: 0, failedCount: 2 }]);
    expect(withFailure.every((r) => r.rank === null)).toBe(true);

    // The first solve gets #1; the rest stay unranked.
    const oneSolved = rankStandings([
      ...fresh,
      { ...base, userId: 'd', score: 25, solvedCount: 1, lastSolvedAt: at('2026-10-25T14:10:00Z') },
    ]);
    expect(oneSolved.map((r) => [r.userId, r.rank])).toEqual([['d', 1], ['a', null], ['b', null], ['c', null]]);
  });

  it('gives equal results the same rank', () => {
    const t = at('2026-10-25T10:00:00Z');
    const ranked = rankStandings([
      { ...base, userId: 'a', score: 50, solvedCount: 1, lastSolvedAt: t },
      { ...base, userId: 'b', score: 50, solvedCount: 1, lastSolvedAt: t, registeredAt: at('2026-10-21T00:00:00Z') },
      { ...base, userId: 'c', score: 25, solvedCount: 1, lastSolvedAt: t },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 1, 3]);
  });

  it('awards medals only to scoring contenders in the top 3', () => {
    const ranked = rankStandings([
      { ...base, userId: 'a', score: 300, solvedCount: 3 },
      { ...base, userId: 'b', score: 18.75, solvedCount: 1 },
      { ...base, userId: 'c', score: 0, solvedCount: 0 },
    ]);
    const medals = pickMedalists(ranked);
    expect(medals.map((m) => [m.entry.userId, m.medal.type])).toEqual([
      ['a', 'gold'],
      ['b', 'silver'],
    ]);
  });
});

describe('weekly schedule: every Sunday 17:00-20:00, registration the week before', () => {
  const damascus = { ...ARENA_SCHEDULE, timeZone: 'Asia/Damascus' };

  it('converts Damascus wall-clock time to the right instant', () => {
    // Damascus is UTC+3.
    expect(zonedTimeToUtc(2026, 10, 25, 17, 0, 'Asia/Damascus').toISOString()).toBe('2026-10-25T14:00:00.000Z');
  });

  it('picks the coming Sunday 17:00-20:00 Damascus time, whatever the server timezone', () => {
    const thursday = at('2026-10-22T17:20:00Z');
    const { startsAt, endsAt } = nextContestWindow(thursday, damascus);
    expect(startsAt.toISOString()).toBe('2026-10-25T14:00:00.000Z');
    expect(endsAt.toISOString()).toBe('2026-10-25T17:00:00.000Z');
  });

  it('uses today when it is Sunday before 17:00, next week once it has started', () => {
    expect(nextContestWindow(at('2026-10-25T10:00:00Z'), damascus).startsAt.toISOString()).toBe('2026-10-25T14:00:00.000Z');
    expect(nextContestWindow(at('2026-10-25T14:30:00Z'), damascus).startsAt.toISOString()).toBe('2026-11-01T14:00:00.000Z');
  });

  it('opens registration exactly 7 days before the start and closes it at the start', () => {
    const contest = { status: 'CURRENT' as const, startsAt: at('2026-10-25T14:00:00Z'), endsAt: at('2026-10-25T17:00:00Z') };
    expect(registrationOpensAt(contest.startsAt).toISOString()).toBe('2026-10-18T14:00:00.000Z');
    expect(isRegistrationOpen(contest, at('2026-10-18T13:59:00Z'))).toBe(false);
    expect(isRegistrationOpen(contest, at('2026-10-18T14:00:00Z'))).toBe(true);
    expect(isRegistrationOpen(contest, at('2026-10-25T13:59:59Z'))).toBe(true);
    expect(isRegistrationOpen(contest, at('2026-10-25T14:00:00Z'))).toBe(false);
    expect(isRegistrationOpen(contest, at('2026-10-25T18:00:00Z'))).toBe(false);
    expect(isRegistrationOpen({ ...contest, status: 'ARCHIVED' }, at('2026-10-20T00:00:00Z'))).toBe(false);
    expect(isRegistrationOpen({ status: 'CURRENT', startsAt: null, endsAt: null })).toBe(false);
  });
});

describe('helpers', () => {
  it('shows only first name and last initial', () => {
    expect(publicName('Lina Haddad Khoury')).toBe('Lina K.');
    expect(publicName('Omar')).toBe('Omar');
    expect(publicName('  ')).toBe('Contender');
    expect(publicName(null)).toBe('Contender');
  });
});
