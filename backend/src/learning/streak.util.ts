/**
 * Streak Calculation Utility for CodeLand Educational Platform.
 * 
 * Rules:
 * 1. Increment on solving any lesson, challenge, or project in a calendar day.
 * 2. If an activity was already completed earlier on the same day, streak does not increment again.
 * 3. If the last active day was yesterday, streak increments by 1 (consecutive habit).
 * 4. If 1 or more days were skipped (diffDays >= 2), the streak resets to 0.
 * 5. When solving after a broken streak, the streak restarts at 1.
 */

/**
 * Calculates calendar day difference between two dates.
 * Immune to Daylight Saving Time and sub-day time offsets.
 * 
 * @param date1 - Prior date (e.g. lastStreakAt)
 * @param date2 - Subsequent date (e.g. now)
 * @returns Number of calendar days between date1 and date2 (e.g. 0 = same day, 1 = yesterday)
 */
export function getCalendarDayDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const utc1 = Date.UTC(d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate());
  const utc2 = Date.UTC(d2.getUTCFullYear(), d2.getUTCMonth(), d2.getUTCDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Computes the currently effective streak when viewing a student's profile/progress.
 * If 2 or more days have elapsed since lastStreakAt, the streak is considered broken (0).
 */
export function computeEffectiveStreak(
  streakDays: number,
  lastStreakAt: Date | null,
  now: Date = new Date(),
): { effectiveStreak: number; isBroken: boolean; daysSinceLastActive: number | null } {
  if (!lastStreakAt || streakDays <= 0) {
    return { effectiveStreak: 0, isBroken: true, daysSinceLastActive: null };
  }

  const diffDays = getCalendarDayDifference(lastStreakAt, now);

  if (diffDays <= 0) {
    // Solved today or in current calendar window
    return {
      effectiveStreak: streakDays,
      isBroken: false,
      daysSinceLastActive: 0,
    };
  }

  if (diffDays === 1) {
    // Solved yesterday: streak is still active today while waiting for student to solve
    return {
      effectiveStreak: streakDays,
      isBroken: false,
      daysSinceLastActive: 1,
    };
  }

  // diffDays >= 2: Student skipped at least one full day. Streak resets to 0.
  return {
    effectiveStreak: 0,
    isBroken: true,
    daysSinceLastActive: diffDays,
  };
}

/**
 * Computes the updated streak when a student successfully completes any activity.
 */
export function computeStreakOnActivity(
  streakDays: number,
  lastStreakAt: Date | null,
  now: Date = new Date(),
): { newStreak: number; incremented: boolean; isRestart: boolean } {
  if (!lastStreakAt) {
    // First activity ever recorded
    return { newStreak: 1, incremented: true, isRestart: true };
  }

  const diffDays = getCalendarDayDifference(lastStreakAt, now);

  if (diffDays <= 0) {
    // Already solved an activity today: keep current streak, do not double-increment
    return {
      newStreak: Math.max(1, streakDays || 1),
      incremented: false,
      isRestart: false,
    };
  }

  if (diffDays === 1) {
    // Solved yesterday: consecutive day streak increment!
    return {
      newStreak: (streakDays || 0) + 1,
      incremented: true,
      isRestart: false,
    };
  }

  // diffDays >= 2: Skipped at least one day. Restarts today at 1.
  return {
    newStreak: 1,
    incremented: true,
    isRestart: true,
  };
}
