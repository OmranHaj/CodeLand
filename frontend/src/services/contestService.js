/**
 * CodeLand Weekly Contest Service
 * Handles state, registration, competitors roster, countdown, and medal distribution.
 */

import { getUser } from "./learningHub.js";

const CONTEST_STORAGE_KEY = "codeland_weekly_contest_v2";
const MEDALS_STORAGE_KEY = "codeland_student_contest_medals_v2";

// Seed participants with diverse ranks and realistic XP
export const SEED_COMPETITORS = [
  {
    id: "comp-1",
    name: "Tariq Al-Mansoor",
    handle: "@tariq_dev",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    xp: 4920,
    streak: 28,
    division: "Grandmaster",
    divisionColor: "#fbbf24",
    registeredAt: "2026-10-02T09:14:00Z",
    status: "Confirmed Contender",
    isTopContender: true,
  },
  {
    id: "comp-2",
    name: "Maya Lin",
    handle: "@mayacodes",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    xp: 4680,
    streak: 21,
    division: "Grandmaster",
    divisionColor: "#fbbf24",
    registeredAt: "2026-10-02T11:22:00Z",
    status: "Confirmed Contender",
    isTopContender: true,
  },
  {
    id: "comp-3",
    name: "Ziad El-Masri",
    handle: "@ziad_byte",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    xp: 4350,
    streak: 19,
    division: "Master",
    divisionColor: "#c084fc",
    registeredAt: "2026-10-02T14:40:00Z",
    status: "Confirmed Contender",
    isTopContender: true,
  },
  {
    id: "comp-4",
    name: "Lina Kaddoura",
    handle: "@lina_algorithms",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    xp: 3950,
    streak: 15,
    division: "Master",
    divisionColor: "#c084fc",
    registeredAt: "2026-10-02T16:15:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-5",
    name: "Kareem Haddad",
    handle: "@kareem_h",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    xp: 3720,
    streak: 14,
    division: "Master",
    divisionColor: "#c084fc",
    registeredAt: "2026-10-02T17:05:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-6",
    name: "Sarah Chen",
    handle: "@sarah_c",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    xp: 3410,
    streak: 12,
    division: "Challenger",
    divisionColor: "#38bdf8",
    registeredAt: "2026-10-02T19:30:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-7",
    name: "Omar Al-Khatib",
    handle: "@omar_dev",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
    xp: 3180,
    streak: 10,
    division: "Challenger",
    divisionColor: "#38bdf8",
    registeredAt: "2026-10-02T20:10:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-8",
    name: "Nourhan Farouk",
    handle: "@nourhan_f",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
    xp: 2950,
    streak: 8,
    division: "Challenger",
    divisionColor: "#38bdf8",
    registeredAt: "2026-10-02T21:45:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-9",
    name: "Youssef Nader",
    handle: "@ynader_pro",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
    xp: 2680,
    streak: 7,
    division: "Challenger",
    divisionColor: "#38bdf8",
    registeredAt: "2026-10-03T01:10:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-10",
    name: "Reem Al-Sabah",
    handle: "@reem_code",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    xp: 2420,
    streak: 6,
    division: "Rising Star",
    divisionColor: "#34d399",
    registeredAt: "2026-10-03T03:25:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-11",
    name: "Hassan Qabbani",
    handle: "@hqabbani",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    xp: 2210,
    streak: 5,
    division: "Rising Star",
    divisionColor: "#34d399",
    registeredAt: "2026-10-03T05:40:00Z",
    status: "Confirmed Contender",
  },
  {
    id: "comp-12",
    name: "Fatima Al-Zahra",
    handle: "@fatima_z",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    xp: 1980,
    streak: 4,
    division: "Rising Star",
    divisionColor: "#34d399",
    registeredAt: "2026-10-03T08:15:00Z",
    status: "Confirmed Contender",
  },
];

/**
 * Checks if current day is Sunday (0 = Sunday).
 */
export function isCurrentlySunday() {
  const day = new Date().getDay();
  return day === 0;
}

/**
 * Calculates countdown to the next Sunday (at 10:00:00 AM local time).
 */
export function getTimeUntilSunday() {
  const now = new Date();
  const currentDay = now.getDay();

  // If today is Sunday
  if (currentDay === 0) {
    const endOfSunday = new Date(now);
    endOfSunday.setHours(23, 59, 59, 999);
    const diff = Math.max(0, endOfSunday.getTime() - now.getTime());
    return {
      isSunday: true,
      diffMs: diff,
      days: 0,
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  // Next Sunday target
  const daysUntilSunday = 7 - currentDay;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(10, 0, 0, 0);

  const diff = Math.max(0, nextSunday.getTime() - now.getTime());
  return {
    isSunday: false,
    diffMs: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * Loads stored contest state or initializes default.
 */
export function loadContestState() {
  const defaultState = {
    edition: "#42",
    title: "CodeLand Grand Sunday Arena — Algorithmic Showdown",
    theme: "Dynamic Graph Optimization & Matrix Sorcery",
    stageOverride: "auto", // "auto" | "registration" | "live" | "concluded"
    registeredStudents: [...SEED_COMPETITORS],
    startTime: "Sunday 10:00 AM UTC",
    duration: "2 Hours",
    totalPrizeXp: 950,
  };

  try {
    const raw = localStorage.getItem(CONTEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...defaultState,
          ...parsed,
          registeredStudents:
            Array.isArray(parsed.registeredStudents) && parsed.registeredStudents.length > 0
              ? parsed.registeredStudents
              : [...SEED_COMPETITORS],
        };
      }
    }
  } catch (e) {
    console.warn("Error reading contest state from storage:", e);
  }

  saveContestState(defaultState);
  return defaultState;
}

/**
 * Saves contest state to localStorage.
 */
export function saveContestState(state) {
  try {
    localStorage.setItem(CONTEST_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("codeland:contest_update"));
  } catch (e) {
    console.error("Failed to save contest state:", e);
  }
}

/**
 * Determines the effective contest stage:
 * "registration" | "live" | "concluded"
 */
export function getEffectiveStage(state) {
  if (!state) return isCurrentlySunday() ? "live" : "registration";
  if (state.stageOverride && state.stageOverride !== "auto") {
    return state.stageOverride;
  }
  return isCurrentlySunday() ? "live" : "registration";
}

/**
 * Checks if current logged-in user is registered.
 */
export function isUserRegistered(user, state) {
  if (!user || !state) return false;
  const list = Array.isArray(state.registeredStudents)
    ? state.registeredStudents
    : [];
  const currentId = user.id || user.email || "student";
  const userEmail = user.email || null;
  return list.some(
    (s) => s && (s.id === currentId || (userEmail && s.email === userEmail))
  );
}

/**
 * Registers current student into the contest.
 */
export function registerCurrentStudent(user, userXp = 500, userStreak = 3) {
  if (!user) return false;
  const state = loadContestState();
  if (!Array.isArray(state.registeredStudents)) {
    state.registeredStudents = [...SEED_COMPETITORS];
  }
  const currentId = user.id || user.email || "student";
  const userEmail = user.email || null;

  // Check if already registered
  const existingIndex = state.registeredStudents.findIndex(
    (s) => s && (s.id === currentId || (userEmail && s.email === userEmail))
  );

  const studentName =
    user.fullName ||
    user.name ||
    user.email?.split("@")[0] ||
    "CodeLand Explorer";

  const newEntry = {
    id: currentId,
    email: user.email || "",
    name: studentName,
    handle: `@${studentName.toLowerCase().replace(/\s+/g, "_")}`,
    avatar:
      user.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        studentName
      )}`,
    xp: userXp,
    streak: userStreak,
    division: userXp >= 3500 ? "Grandmaster" : userXp >= 2000 ? "Master" : "Challenger",
    divisionColor: userXp >= 3500 ? "#fbbf24" : userXp >= 2000 ? "#c084fc" : "#38bdf8",
    registeredAt: new Date().toISOString(),
    status: "Confirmed Contender",
    isCurrentUser: true,
  };

  if (existingIndex >= 0) {
    state.registeredStudents[existingIndex] = newEntry;
  } else {
    state.registeredStudents.unshift(newEntry);
  }

  saveContestState(state);
  return true;
}

/**
 * Unregisters student from contest.
 */
export function unregisterCurrentStudent(user) {
  if (!user) return false;
  const state = loadContestState();
  const currentId = user.id || user.email || "student";
  const userEmail = user.email || null;

  state.registeredStudents = (state.registeredStudents || []).filter((s) => {
    if (!s) return false;
    if (s.id === currentId) return false;
    if (userEmail && s.email === userEmail) return false;
    return true;
  });

  saveContestState(state);
  return true;
}

/**
 * Loads student's earned medals history from localStorage.
 */
export function loadStudentMedals(studentId) {
  try {
    const raw = localStorage.getItem(MEDALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (m) => !studentId || m.studentId === studentId || m.isCurrentUser
        );
      }
    }
  } catch (e) {
    console.warn("Error reading student medals:", e);
  }

  // Default default sample medal for instant inspection
  return [
    {
      id: "medal-sun-41-gold",
      edition: "#41",
      studentId: studentId || "current-student",
      studentName: "CodeLand Champion",
      medalType: "gold", // "gold" | "silver" | "bronze"
      medalTitle: "1st Place Champion — Gold Medal",
      category: "Weekly Sunday Grand Invitational — Division I",
      dateAwarded: "September 27, 2026",
      score: "980 / 1000",
      rank: 1,
      totalParticipants: 48,
      xpWon: 500,
      certificateCode: "CL-SUN-2026-GLD-0198",
      signatories: [
        {
          name: "Abdullah Al-Buraidi",
          role: "Co-Founder & Head of Curriculum",
          title: "Platform Director",
        },
        {
          name: "Omran Haj Hussein",
          role: "Co-Founder & Lead Systems Architect",
          title: "Technical Director",
        },
        {
          name: "Abdullah Hamed",
          role: "Co-Founder & Head of Competitive Programming",
          title: "Head of Contests",
        },
      ],
      isCurrentUser: true,
    },
  ];
}

/**
 * Awards a new medal to the current student and saves to medal vault.
 */
export function awardStudentMedal({
  user,
  medalType = "gold",
  rank = 1,
  edition = "#42",
  score = "985 / 1000",
  totalParticipants = 52,
}) {
  const studentName =
    user?.fullName ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Distinguished Explorer";

  const studentId = user?.id || user?.email || "current-student";

  const titles = {
    gold: "1st Place Champion — Gold Medalist",
    silver: "2nd Place Runner-Up — Silver Medalist",
    bronze: "3rd Place Podium Finalist — Bronze Medalist",
  };

  const xpValues = {
    gold: 500,
    silver: 300,
    bronze: 150,
  };

  const codePrefix = {
    gold: "GLD",
    silver: "SLV",
    bronze: "BRZ",
  };

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newMedal = {
    id: `medal-${edition}-${medalType}-${Date.now()}`,
    edition,
    studentId,
    studentName,
    medalType,
    medalTitle: titles[medalType] || "Honors Medalist",
    category: "Weekly Sunday Grand Invitational — Division I",
    dateAwarded: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    score,
    rank,
    totalParticipants,
    xpWon: xpValues[medalType] || 200,
    certificateCode: `CL-SUN-2026-${codePrefix[medalType] || "HON"}-${randomCode}`,
    signatories: [
      {
        name: "Abdullah Al-Buraidi",
        role: "Co-Founder & Head of Curriculum",
        title: "Platform Director",
      },
      {
        name: "Omran Haj Hussein",
        role: "Co-Founder & Lead Systems Architect",
        title: "Technical Director",
      },
      {
        name: "Abdullah Hamed",
        role: "Co-Founder & Head of Competitive Programming",
        title: "Head of Contests",
      },
    ],
    isCurrentUser: true,
  };

  try {
    const existing = loadStudentMedals();
    const updated = [newMedal, ...existing.filter((m) => m.id !== newMedal.id)];
    localStorage.setItem(MEDALS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("codeland:medals_update"));
  } catch (e) {
    console.error("Failed to save awarded medal:", e);
  }

  return newMedal;
}
