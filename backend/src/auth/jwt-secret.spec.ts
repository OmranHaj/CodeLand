import { describe, it, expect, afterEach } from 'vitest';
import { getJwtSecret } from './jwt-secret.js';

describe('getJwtSecret', () => {
  const original = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.JWT_SECRET = original;
  });

  it('refuses a missing secret', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow('JWT_SECRET');
  });

  it('refuses a short secret', () => {
    process.env.JWT_SECRET = 'short-secret';
    expect(() => getJwtSecret()).toThrow('at least 32 characters');
  });

  it('refuses the public placeholder values even if someone pads the length check', () => {
    process.env.JWT_SECRET = 'your-jwt-secret-key';
    expect(() => getJwtSecret()).toThrow();
    process.env.JWT_SECRET = 'super-secret-jwt-key-for-codeland-platform';
    expect(() => getJwtSecret()).toThrow();
  });

  it('accepts a long private value', () => {
    process.env.JWT_SECRET = 'a'.repeat(20) + 'b'.repeat(20);
    expect(getJwtSecret()).toBe('a'.repeat(20) + 'b'.repeat(20));
  });
});
