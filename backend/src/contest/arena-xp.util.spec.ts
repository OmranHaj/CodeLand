import { describe, it, expect } from 'vitest';
import {
  ARENA_XP_TIERS,
  calculateEarnedXp,
  isArenaXpTier,
  xpTierIndex,
} from './arena-xp.util.js';

describe('arena XP rules', () => {
  it('accepts only the fixed XP tiers', () => {
    for (const xp of ARENA_XP_TIERS) {
      expect(isArenaXpTier(xp)).toBe(true);
    }
    for (const xp of [0, 10, 30, 99, 100.5, 175, 200, -25, '100', null]) {
      expect(isArenaXpTier(xp)).toBe(false);
    }
  });

  it('maps each tier to its generator difficulty index', () => {
    expect(ARENA_XP_TIERS.map(xpTierIndex)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(xpTierIndex(60)).toBe(-1);
  });

  it('awards full XP without a hint', () => {
    expect(calculateEarnedXp(100, false)).toBe(100);
    expect(calculateEarnedXp(150, false)).toBe(150);
  });

  it('applies exactly a 25% penalty with a hint, keeping fractions', () => {
    expect(calculateEarnedXp(100, true)).toBe(75);
    expect(calculateEarnedXp(25, true)).toBe(18.75);
    expect(calculateEarnedXp(150, true)).toBe(112.5);
    expect(ARENA_XP_TIERS.map((xp) => calculateEarnedXp(xp, true))).toEqual([
      18.75, 37.5, 56.25, 75, 93.75, 112.5,
    ]);
  });
});
