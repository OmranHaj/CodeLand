/**
 * CodeLand Sunday Arena — contest service.
 * Everything comes from the backend: the contest and its live window (stage),
 * registration, standings, history and medals. The server is the authority on
 * timing and scoring; this module only fetches data and formats it.
 */

import { apiRequest } from "./api.js";

/** Visual stage used by the page theme and the 3D scene. */
export const STAGE_THEME = {
  none: "registration",
  unscheduled: "registration",
  upcoming: "registration",
  live: "live",
  ended: "concluded",
  archived: "concluded",
};

export const STAGE_LABELS = {
  none: "NO CONTEST SCHEDULED",
  unscheduled: "SCHEDULE PENDING",
  upcoming: "REGISTRATION WINDOW",
  live: "LIVE COMBAT WINDOW",
  ended: "CONTEST CONCLUDED",
  archived: "ARENA ARCHIVED",
};

export const CERTIFICATE_SIGNATORIES = [
  { name: "Abdullah Al-Buraidi", role: "Co-Founder & Head of Curriculum", title: "Platform Director" },
  { name: "Omran Haj Hussein", role: "Co-Founder & Lead Systems Architect", title: "Technical Director" },
  { name: "Abdullah Hamed", role: "Co-Founder & Head of Competitive Programming", title: "Head of Contests" },
];

const MEDAL_TITLES = {
  gold: "1st Place Champion — Gold Medalist",
  silver: "2nd Place Runner-Up — Silver Medalist",
  bronze: "3rd Place Podium Finalist — Bronze Medalist",
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/** { serverTime, contest: {...stage, startsAt, endsAt...} | null, registration, myStanding } */
export async function fetchCurrentContest() {
  return apiRequest("/arena/contest/current");
}

export async function registerForContest(contestId) {
  return apiRequest(`/arena/contests/${contestId}/registration`, { method: "POST" });
}

export async function unregisterFromContest(contestId) {
  return apiRequest(`/arena/contests/${contestId}/registration`, { method: "DELETE" });
}

export async function fetchStandings(contestId) {
  return apiRequest(`/arena/contests/${contestId}/standings`);
}

export async function fetchContestHistory() {
  return apiRequest("/arena/contests/history");
}

export async function fetchMyMedals() {
  return apiRequest("/arena/me/medals");
}

// ---------------------------------------------------------------------------
// FORMATTING
// ---------------------------------------------------------------------------

/**
 * Time left until `targetIso`, using the server clock (serverOffsetMs =
 * serverTime - Date.now() at fetch time) so a wrong device clock can't skew it.
 */
export function getCountdown(targetIso, serverOffsetMs = 0, nowMs = Date.now()) {
  if (!targetIso) return { days: 0, hours: 0, minutes: 0, seconds: 0, diffMs: 0 };
  const diff = Math.max(0, new Date(targetIso).getTime() - (nowMs + serverOffsetMs));
  return {
    diffMs: diff,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Division badge from a student's platform-wide XP. */
export function divisionFor(totalXp = 0) {
  if (totalXp >= 3500) return { division: "Grandmaster", color: "#fbbf24" };
  if (totalXp >= 2000) return { division: "Master", color: "#c084fc" };
  if (totalXp >= 500) return { division: "Challenger", color: "#38bdf8" };
  return { division: "Rising Star", color: "#34d399" };
}

export function formatContestWindow(contest) {
  if (!contest?.startsAt || !contest?.endsAt) return "Schedule pending";
  const start = new Date(contest.startsAt);
  const end = new Date(contest.endsAt);
  const day = start.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const time = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${day} · ${time(start)} – ${time(end)}`;
}

export function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Shapes a server medal for ContestCertificate and the Achievements vault. */
export function toCertificateMedal(medal) {
  const score = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
  return {
    id: medal.id,
    edition: `#${medal.edition}`,
    studentName: medal.studentName,
    medalType: medal.medalType,
    medalTitle: MEDAL_TITLES[medal.medalType] || "Honors Medalist",
    category: "Weekly Sunday Arena — Story Contest",
    dateAwarded: new Date(medal.awardedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    score: `${score(medal.score)} / ${score(medal.maxScore)} XP`,
    rank: medal.rank,
    totalParticipants: medal.participants,
    xpWon: medal.bonusXp,
    certificateCode: medal.certificateCode,
    signatories: CERTIFICATE_SIGNATORIES,
    isCurrentUser: true,
  };
}
