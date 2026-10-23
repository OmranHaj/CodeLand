/**
 * XP rules for Sunday Arena problems.
 *
 * Problem XP is one of six fixed tiers. The tier index (0-5) is also the
 * difficulty index used by ai/generate_contest.py (XP_PROGRESSION), so picking
 * an XP value picks the algorithmic difficulty of the generated problem.
 */
export const ARENA_XP_TIERS = [25, 50, 75, 100, 125, 150] as const;
export type ArenaXpTier = (typeof ARENA_XP_TIERS)[number];

/** Fraction of the problem XP a student loses for revealing the hint. */
export const HINT_PENALTY_RATE = 0.25;

export function isArenaXpTier(value: unknown): value is ArenaXpTier {
  return typeof value === 'number' && (ARENA_XP_TIERS as readonly number[]).includes(value);
}

export function xpTierIndex(xp: number): number {
  return (ARENA_XP_TIERS as readonly number[]).indexOf(xp);
}

/**
 * XP a student earns for solving a problem.
 *
 * Every tier is a multiple of 25, so 75% of it is always a multiple of 0.25
 * (e.g. 25 -> 18.75, 150 -> 112.5). Those values are exact in binary floating
 * point, so they are stored as-is (no rounding to integers). The 2-decimal
 * rounding only guards against a future non-multiple-of-25 tier.
 */
export function calculateEarnedXp(problemXp: number, hintUsed: boolean): number {
  const raw = hintUsed ? problemXp * (1 - HINT_PENALTY_RATE) : problemXp;
  return Math.round(raw * 100) / 100;
}
