/**
 * Counts failed attempts per key (an email or an IP) inside a time window and reports when the key
 * is blocked. In-memory: limits reset when the server restarts and are per server process.
 */
export class FailedAttemptLimiter {
  private readonly records = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxFailures: number,
    private readonly windowMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  isBlocked(key: string): boolean {
    const record = this.records.get(key);
    if (!record) return false;
    if (this.now() >= record.resetAt) {
      this.records.delete(key);
      return false;
    }
    return record.count >= this.maxFailures;
  }

  recordFailure(key: string): void {
    const now = this.now();
    const record = this.records.get(key);
    if (!record || now >= record.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + this.windowMs });
    } else {
      record.count += 1;
    }
    this.pruneExpired(now);
  }

  reset(key: string): void {
    this.records.delete(key);
  }

  /** Keeps memory bounded when many different keys fail (e.g. a scan across many emails). */
  private pruneExpired(now: number): void {
    if (this.records.size < 10_000) return;
    for (const [key, record] of this.records) {
      if (now >= record.resetAt) this.records.delete(key);
    }
  }
}
