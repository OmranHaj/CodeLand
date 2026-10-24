import { describe, it, expect } from 'vitest';
import { FailedAttemptLimiter } from './failed-attempt-limiter.js';

describe('FailedAttemptLimiter', () => {
  const make = () => {
    let now = 1_000_000;
    const limiter = new FailedAttemptLimiter(3, 60_000, () => now);
    return { limiter, advance: (ms: number) => (now += ms) };
  };

  it('blocks a key after the maximum number of failures', () => {
    const { limiter } = make();
    limiter.recordFailure('a@x.com');
    limiter.recordFailure('a@x.com');
    expect(limiter.isBlocked('a@x.com')).toBe(false);
    limiter.recordFailure('a@x.com');
    expect(limiter.isBlocked('a@x.com')).toBe(true);
  });

  it('keys are independent', () => {
    const { limiter } = make();
    for (let i = 0; i < 3; i++) limiter.recordFailure('a@x.com');
    expect(limiter.isBlocked('b@x.com')).toBe(false);
  });

  it('unblocks once the window has passed', () => {
    const { limiter, advance } = make();
    for (let i = 0; i < 3; i++) limiter.recordFailure('a@x.com');
    advance(60_000);
    expect(limiter.isBlocked('a@x.com')).toBe(false);
    limiter.recordFailure('a@x.com');
    expect(limiter.isBlocked('a@x.com')).toBe(false);
  });

  it('reset clears the count (successful login)', () => {
    const { limiter } = make();
    limiter.recordFailure('a@x.com');
    limiter.recordFailure('a@x.com');
    limiter.reset('a@x.com');
    limiter.recordFailure('a@x.com');
    expect(limiter.isBlocked('a@x.com')).toBe(false);
  });
});
