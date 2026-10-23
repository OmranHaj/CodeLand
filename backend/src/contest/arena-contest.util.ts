/**
 * Pure rules for Sunday Arena contests: stage, standings order, medals and
 * the default Sunday window. Kept free of Prisma so they are unit-testable.
 */

export type ArenaStage = 'unscheduled' | 'upcoming' | 'live' | 'ended' | 'archived';

export interface ContestWindow {
  status: 'CURRENT' | 'ARCHIVED';
  startsAt: Date | null;
  endsAt: Date | null;
}

export function getContestStage(contest: ContestWindow, now: Date = new Date()): ArenaStage {
  if (contest.status === 'ARCHIVED') return 'archived';
  if (!contest.startsAt || !contest.endsAt) return 'unscheduled';
  if (now < contest.startsAt) return 'upcoming';
  if (now < contest.endsAt) return 'live';
  return 'ended';
}

/** Students may read problems (and run examples) once the contest has started. */
export function canViewProblems(stage: ArenaStage): boolean {
  return stage === 'live' || stage === 'ended' || stage === 'archived';
}

/** XP-bearing actions (submit, paid hints) only happen while the contest is live. */
export function canCompete(stage: ArenaStage): boolean {
  return stage === 'live';
}

// ---------------------------------------------------------------------------
// WEEKLY SCHEDULE
// ---------------------------------------------------------------------------

function parseClock(value: string | undefined, fallback: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec((value || fallback).trim()) || /^(\d{1,2}):(\d{2})$/.exec(fallback)!;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/**
 * Every contest runs on Sunday from 17:00 to 20:00 in ARENA_TIMEZONE, and
 * registration is open during the 7 days before it starts. Times and the
 * timezone can be changed with ARENA_START_TIME / ARENA_END_TIME /
 * ARENA_TIMEZONE; the timezone is explicit so a server running in UTC still
 * opens the arena at 17:00 local time for the students.
 */
export const ARENA_SCHEDULE = {
  weekday: 0, // Sunday
  start: parseClock(process.env.ARENA_START_TIME, '17:00'),
  end: parseClock(process.env.ARENA_END_TIME, '20:00'),
  registrationDays: 7,
  timeZone: process.env.ARENA_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export type ArenaScheduleConfig = typeof ARENA_SCHEDULE;

/** Wall-clock parts of `date` as seen in `timeZone`. */
function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour'), minute: get('minute'), second: get('second') };
}

function zoneOffsetMs(date: Date, timeZone: string) {
  const p = zonedParts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant at which the wall clock in `timeZone` reads y-m-d h:min (DST-safe). */
export function zonedTimeToUtc(y: number, m: number, d: number, h: number, min: number, timeZone: string): Date {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - zoneOffsetMs(new Date(guess), timeZone);
  const second = guess - zoneOffsetMs(new Date(first), timeZone);
  return new Date(second);
}

/**
 * The next contest slot that has not started yet: the coming Sunday
 * 17:00-20:00, or the one after if this Sunday's has already begun.
 */
export function nextContestWindow(
  now: Date = new Date(),
  schedule: ArenaScheduleConfig = ARENA_SCHEDULE,
): { startsAt: Date; endsAt: Date } {
  const today = zonedParts(now, schedule.timeZone);
  for (let add = 0; add <= 14; add++) {
    const day = new Date(Date.UTC(today.year, today.month - 1, today.day + add));
    if (day.getUTCDay() !== schedule.weekday) continue;
    const [y, m, d] = [day.getUTCFullYear(), day.getUTCMonth() + 1, day.getUTCDate()];
    const startsAt = zonedTimeToUtc(y, m, d, schedule.start.hour, schedule.start.minute, schedule.timeZone);
    if (startsAt <= now) continue;
    const endsAt = zonedTimeToUtc(y, m, d, schedule.end.hour, schedule.end.minute, schedule.timeZone);
    return { startsAt, endsAt };
  }
  throw new Error('Could not compute the next contest window.');
}

export function registrationOpensAt(startsAt: Date, schedule: ArenaScheduleConfig = ARENA_SCHEDULE): Date {
  return new Date(startsAt.getTime() - schedule.registrationDays * 24 * 60 * 60 * 1000);
}

/**
 * Registration (and leaving) is only possible during the week before the
 * contest. Once it starts nobody can register any more.
 */
export function isRegistrationOpen(
  contest: ContestWindow,
  now: Date = new Date(),
  schedule: ArenaScheduleConfig = ARENA_SCHEDULE,
): boolean {
  if (contest.status !== 'CURRENT' || !contest.startsAt) return false;
  return now >= registrationOpensAt(contest.startsAt, schedule) && now < contest.startsAt;
}

export interface StandingInput {
  userId: string;
  registeredAt: Date;
  score: number;
  solvedCount: number;
  lastSolvedAt: Date | null;
  failedCount: number;
}

/**
 * Standings order: more XP first; then more problems solved; then whoever
 * reached their score earlier; then fewer rejected submissions; then earlier
 * registration. Equal keys share a rank (1, 2, 2, 4 …).
 *
 * Only contenders who solved at least one problem are ranked. Everyone else
 * gets rank null ("not started") and stays at the bottom in registration
 * order, so a freshly registered field doesn't show everybody as #1.
 */
export function rankStandings<T extends StandingInput>(entries: T[]): Array<T & { rank: number | null }> {
  const time = (d: Date | null) => (d ? d.getTime() : Number.POSITIVE_INFINITY);
  const sorted = [...entries].sort(
    (a, b) =>
      b.score - a.score ||
      b.solvedCount - a.solvedCount ||
      time(a.lastSolvedAt) - time(b.lastSolvedAt) ||
      a.failedCount - b.failedCount ||
      a.registeredAt.getTime() - b.registeredAt.getTime(),
  );
  const sameKey = (a: T, b: T) =>
    a.score === b.score &&
    a.solvedCount === b.solvedCount &&
    time(a.lastSolvedAt) === time(b.lastSolvedAt) &&
    a.failedCount === b.failedCount;

  return sorted.map((entry, i) => {
    if (entry.solvedCount === 0) return { ...entry, rank: null };
    let rank = i + 1;
    if (i > 0 && sameKey(entry, sorted[i - 1])) {
      // Walk back to the first entry of this tie group.
      let j = i - 1;
      while (j > 0 && sameKey(sorted[j - 1], entry)) j--;
      rank = j + 1;
    }
    return { ...entry, rank };
  });
}

export const MEDALS = [
  { rank: 1, type: 'gold', bonusXp: 500 },
  { rank: 2, type: 'silver', bonusXp: 300 },
  { rank: 3, type: 'bronze', bonusXp: 150 },
] as const;

/** Medals go to ranks 1-3, but only to contenders who actually scored. */
export function pickMedalists<T extends StandingInput & { rank: number | null }>(ranked: T[]) {
  return ranked
    .filter((e): e is T & { rank: number } => e.rank !== null && e.score > 0 && e.rank <= 3)
    .map((e) => ({ entry: e, medal: MEDALS[e.rank - 1] }));
}

/** Public display name for other students: first name + last initial (no emails). */
export function publicName(name: string | null | undefined): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Contender';
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
