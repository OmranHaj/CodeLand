/** Most seconds one report can add; the browser reports every ~30 seconds of active time. */
export const MAX_SECONDS_PER_REPORT = 60;

/** Network jitter allowed between two reports. */
const TOLERANCE_SECONDS = 2;

/**
 * How many of the reported seconds to credit: never more than the wall-clock time since the
 * student's previous report, so a client cannot inflate its time and two open tabs are not
 * counted twice.
 */
export function creditStudySeconds(reportedSeconds: number, lastReportAt: number | undefined, now: number): number {
  const reported = Math.max(0, Math.floor(reportedSeconds));
  const elapsed =
    lastReportAt === undefined ? MAX_SECONDS_PER_REPORT : Math.floor((now - lastReportAt) / 1000) + TOLERANCE_SECONDS;
  return Math.max(0, Math.min(reported, MAX_SECONDS_PER_REPORT, elapsed));
}
