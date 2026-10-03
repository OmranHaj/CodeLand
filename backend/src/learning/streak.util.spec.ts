import { describe, it, expect } from 'vitest';
import {
  getCalendarDayDifference,
  computeEffectiveStreak,
  computeStreakOnActivity,
} from './streak.util.js';

describe('Streak Utility', () => {
  describe('getCalendarDayDifference', () => {
    it('returns 0 for identical dates', () => {
      const d1 = new Date('2026-10-02T10:00:00Z');
      const d2 = new Date('2026-10-02T18:30:00Z');
      expect(getCalendarDayDifference(d1, d2)).toBe(0);
    });

    it('returns 1 for consecutive days', () => {
      const d1 = new Date('2026-10-01T23:59:00Z');
      const d2 = new Date('2026-10-02T00:01:00Z');
      expect(getCalendarDayDifference(d1, d2)).toBe(1);
    });

    it('returns 2 when one day is skipped', () => {
      const d1 = new Date('2026-09-30T14:00:00Z');
      const d2 = new Date('2026-10-02T10:00:00Z');
      expect(getCalendarDayDifference(d1, d2)).toBe(2);
    });

    it('handles month and year boundaries correctly', () => {
      const d1 = new Date('2025-12-31T20:00:00Z');
      const d2 = new Date('2026-01-01T08:00:00Z');
      expect(getCalendarDayDifference(d1, d2)).toBe(1);
    });
  });

  describe('computeEffectiveStreak', () => {
    it('returns 0 when lastStreakAt is null', () => {
      const res = computeEffectiveStreak(5, null, new Date('2026-10-02'));
      expect(res.effectiveStreak).toBe(0);
      expect(res.isBroken).toBe(true);
    });

    it('returns streak unchanged when solved today', () => {
      const today = new Date('2026-10-02T12:00:00Z');
      const lastStreakAt = new Date('2026-10-02T08:00:00Z');
      const res = computeEffectiveStreak(4, lastStreakAt, today);
      expect(res.effectiveStreak).toBe(4);
      expect(res.isBroken).toBe(false);
    });

    it('returns streak intact when solved yesterday (waiting for today)', () => {
      const today = new Date('2026-10-02T12:00:00Z');
      const lastStreakAt = new Date('2026-10-01T15:00:00Z');
      const res = computeEffectiveStreak(4, lastStreakAt, today);
      expect(res.effectiveStreak).toBe(4);
      expect(res.isBroken).toBe(false);
    });

    it('resets to 0 when a day was skipped (2+ days ago)', () => {
      const today = new Date('2026-10-02T12:00:00Z');
      const lastStreakAt = new Date('2026-09-30T18:00:00Z');
      const res = computeEffectiveStreak(7, lastStreakAt, today);
      expect(res.effectiveStreak).toBe(0);
      expect(res.isBroken).toBe(true);
      expect(res.daysSinceLastActive).toBe(2);
    });
  });

  describe('computeStreakOnActivity', () => {
    it('starts streak at 1 on first activity ever', () => {
      const today = new Date('2026-10-02T12:00:00Z');
      const res = computeStreakOnActivity(0, null, today);
      expect(res.newStreak).toBe(1);
      expect(res.incremented).toBe(true);
      expect(res.isRestart).toBe(true);
    });

    it('does not increment if another activity is solved on the same day', () => {
      const today = new Date('2026-10-02T16:00:00Z');
      const lastStreakAt = new Date('2026-10-02T09:00:00Z');
      const res = computeStreakOnActivity(3, lastStreakAt, today);
      expect(res.newStreak).toBe(3);
      expect(res.incremented).toBe(false);
      expect(res.isRestart).toBe(false);
    });

    it('increments streak by 1 if previous activity was yesterday', () => {
      const today = new Date('2026-10-02T10:00:00Z');
      const lastStreakAt = new Date('2026-10-01T21:00:00Z');
      const res = computeStreakOnActivity(3, lastStreakAt, today);
      expect(res.newStreak).toBe(4);
      expect(res.incremented).toBe(true);
      expect(res.isRestart).toBe(false);
    });

    it('restarts streak at 1 if previous activity was 2 or more days ago', () => {
      const today = new Date('2026-10-02T10:00:00Z');
      const lastStreakAt = new Date('2026-09-28T21:00:00Z');
      const res = computeStreakOnActivity(10, lastStreakAt, today);
      expect(res.newStreak).toBe(1);
      expect(res.incremented).toBe(true);
      expect(res.isRestart).toBe(true);
    });
  });
});
