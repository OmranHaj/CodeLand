/**
 * Parent Observatory Analytics & Telemetry Data
 * Provides 30-day telemetry, multi-child records, and learning insights.
 */

// Generate a 30-day activity array ending today
export function generate30DayActivity(activityLevel = "high") {
  const days = [];
  const now = new Date();

  // Deterministic pattern based on activityLevel
  const intensityMap = {
    high: [45, 60, 30, 0, 75, 50, 40, 60, 0, 45, 90, 30, 40, 0, 60, 75, 45, 0, 30, 80, 60, 45, 0, 50, 65, 40, 90, 0, 60, 45],
    medium: [30, 0, 45, 30, 0, 40, 60, 0, 30, 45, 0, 30, 60, 45, 0, 30, 40, 0, 45, 30, 0, 60, 30, 45, 0, 30, 40, 0, 50, 35],
    starter: [0, 20, 0, 30, 0, 0, 45, 0, 25, 0, 35, 0, 0, 40, 0, 20, 0, 30, 0, 0, 45, 0, 25, 0, 35, 0, 0, 40, 0, 30]
  };

  const pattern = intensityMap[activityLevel] || intensityMap.high;

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const minutes = pattern[29 - i];
    const lessons = minutes > 50 ? 3 : minutes > 25 ? 2 : minutes > 0 ? 1 : 0;

    days.push({
      date: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      minutes,
      lessonsCompleted: lessons,
      active: minutes > 0
    });
  }

  return days;
}

export const SAMPLE_CHILDREN = [
  {
    id: "student-maya",
    fullName: "Maya Morgan",
    age: 12,
    grade: "7th Grade",
    avatar: "M",
    activePath: "Algorithm & Data Structures",
    pathId: "algorithm-explorer",
    themeColor: "#10b981", // Emerald
    level: 8,
    rankTitle: "Master Algorithmist",
    streakDays: 16,
    totalXp: 4850,
    monthlyHours: 24.5,
    weeklyGoalHours: 6,
    activityLevel: "high",
    weeklyBreakdown: [
      { week: "Week 1", hours: 5.5, target: 6, lessons: 7 },
      { week: "Week 2", hours: 6.8, target: 6, lessons: 9 },
      { week: "Week 3", hours: 5.2, target: 6, lessons: 6 },
      { week: "Week 4 (Current)", hours: 7.0, target: 6, lessons: 10 }
    ],
    subjectMastery: [
      {
        id: "algo",
        title: "Algorithm & Data Structures",
        percent: 88,
        completedSectors: "7 of 8 Citadels",
        color: "#10b981",
        keySkills: ["Binary Search Logic", "Hash Tables", "Stack Tracing", "Pointers Movement"]
      },
      {
        id: "web",
        title: "Web Creator",
        percent: 92,
        completedSectors: "All 5 Modules",
        color: "#8b5cf6",
        keySkills: ["Semantic HTML5", "CSS Flex & Grid", "DOM Interactivity", "Responsive UI"]
      },
      {
        id: "cpp",
        title: "C++ Developer",
        percent: 64,
        completedSectors: "5 of 8 Circuits",
        color: "#f59e0b",
        keySkills: ["Memory Vaults", "Variables & Types", "Conditional Logic"]
      }
    ],
    quizMetrics: {
      accuracy: 94,
      totalQuizzesTaken: 38,
      challengesSolved: 31,
      playgroundRuns: 84,
      persistenceRating: "Exceptional"
    },
    recentBadges: [
      {
        id: "badge-1",
        title: "Citadel Architect",
        domain: "Algorithms",
        date: "Yesterday",
        icon: "🏰",
        desc: "Mastered 7 core data structure sectors in the Quantum Citadel."
      },
      {
        id: "badge-2",
        title: "14-Day Streak Champion",
        domain: "Habit",
        date: "3 days ago",
        icon: "🔥",
        desc: "Maintained a continuous daily coding habit for 2 full weeks."
      },
      {
        id: "badge-3",
        title: "Binary Search Sniper",
        domain: "Algorithms",
        date: "Oct 12",
        icon: "🎯",
        desc: "Solved the book-page guessing algorithm with zero trial errors."
      }
    ],
    aiInsights: {
      conversationStarter: "Maya recently mastered Binary Search! Ask her: 'How does the magic book page-guessing game cut search time in half?'",
      strength: "Exceptional visual decomposition of algorithmic logic and data structures.",
      growthTip: "She is beginning C++ pointers next—celebrate her curiosity when tackling memory references!",
      lastActive: "Today at 3:45 PM"
    }
  },
  {
    id: "student-leo",
    fullName: "Leo Morgan",
    age: 9,
    grade: "4th Grade",
    avatar: "L",
    activePath: "Web Creator",
    pathId: "web-creator",
    themeColor: "#8b5cf6", // Purple/Cyan
    level: 4,
    rankTitle: "Junior Web Builder",
    streakDays: 8,
    totalXp: 2150,
    monthlyHours: 15.0,
    weeklyGoalHours: 4,
    activityLevel: "medium",
    weeklyBreakdown: [
      { week: "Week 1", hours: 3.5, target: 4, lessons: 4 },
      { week: "Week 2", hours: 4.2, target: 4, lessons: 5 },
      { week: "Week 3", hours: 3.0, target: 4, lessons: 4 },
      { week: "Week 4 (Current)", hours: 4.3, target: 4, lessons: 6 }
    ],
    subjectMastery: [
      {
        id: "web",
        title: "Web Creator",
        percent: 75,
        completedSectors: "4 of 5 Modules",
        color: "#8b5cf6",
        keySkills: ["Color Palettes", "HTML Tags", "Button Triggers", "CSS Card Layouts"]
      },
      {
        id: "algo",
        title: "Algorithm & Data Structures",
        percent: 30,
        completedSectors: "2 of 8 Citadels",
        color: "#10b981",
        keySkills: ["Numbered Lockers (Arrays)", "Tray Stacks"]
      },
      {
        id: "cpp",
        title: "C++ Developer",
        percent: 15,
        completedSectors: "1 of 8 Circuits",
        color: "#f59e0b",
        keySkills: ["Hello World", "Terminal Output"]
      }
    ],
    quizMetrics: {
      accuracy: 86,
      totalQuizzesTaken: 22,
      challengesSolved: 18,
      playgroundRuns: 42,
      persistenceRating: "High"
    },
    recentBadges: [
      {
        id: "badge-4",
        title: "Style Sorcerer",
        domain: "Web",
        date: "2 days ago",
        icon: "🎨",
        desc: "Designed 3 custom responsive web project cards."
      },
      {
        id: "badge-5",
        title: "First Code Streak",
        domain: "Habit",
        date: "Oct 8",
        icon: "⚡",
        desc: "Coded 7 consecutive days without missing a single session."
      }
    ],
    aiInsights: {
      conversationStarter: "Leo built his own customized web card yesterday! Ask him to show you how his glowing button animation works.",
      strength: "Great creative eye for visual design, colors, and layout aesthetics.",
      growthTip: "Encourage him to try the cafeteria tray stack challenge in the Algorithm Citadel!",
      lastActive: "Yesterday at 5:10 PM"
    }
  }
];

/**
 * Merges real user student accounts with sample telemetry if real data is incomplete
 */
export function buildParentChildrenList(storedUsers = [], parentId = null) {
  const realStudents = storedUsers.filter(u => u.role === "student" && (!parentId || u.parentId === parentId));

  /*
  // ORIGINAL MOCK FALLBACK (Preserved for reference):
  if (!realStudents.length) {
    return SAMPLE_CHILDREN;
  }
  */
  if (!realStudents.length) {
    return [];
  }

  // Transform real student accounts using real database telemetry
  return realStudents.map((student, idx) => {
    /*
    // ORIGINAL MOCK MERGE (Preserved for reference):
    const sample = SAMPLE_CHILDREN[idx % SAMPLE_CHILDREN.length];
    return {
      ...sample,
      ...student,
      id: student.id,
      fullName: student.fullName || student.name || student.email?.split("@")[0] || sample.fullName,
      avatar: student.avatar || (student.fullName || student.name || student.email || "E")[0].toUpperCase(),
      totalXp: student.totalXp !== undefined ? student.totalXp : sample.totalXp,
      streakDays: student.streakDays !== undefined ? student.streakDays : sample.streakDays,
      level: student.level || sample.level,
      rankTitle: student.rankTitle || sample.rankTitle,
      themeColor: student.themeColor || sample.themeColor,
      weeklyGoalHours: student.weeklyGoalHours ?? sample.weeklyGoalHours,
      monthlyHours: student.monthlyHours !== undefined ? student.monthlyHours : sample.monthlyHours,
      dailyActivities: student.dailyActivities || sample.dailyActivities,
    };
    */

    const completedLessons = Array.isArray(student.learningProgress)
      ? student.learningProgress.filter(p => p.completed).length
      : 0;

    const webPercent = Math.min(100, Math.round((completedLessons / 20) * 100));

    const subjectMastery = [
      {
        id: "web",
        title: "Web Development",
        completedSectors: `${completedLessons}/20`,
        percent: webPercent,
        color: "#10b981",
        keySkills: ["HTML Structure", "CSS Styling", "Interactive JS"]
      },
      {
        id: "algo",
        title: "Algorithms & Logic",
        completedSectors: "0/16",
        percent: 0,
        color: "#6366f1",
        keySkills: ["Sequencing", "Variables", "Conditionals"]
      },
      {
        id: "python",
        title: "Python & Data",
        completedSectors: "0/12",
        percent: 0,
        color: "#f59e0b",
        keySkills: ["Syntax", "Loops", "Functions"]
      }
    ];

    const quizMetrics = {
      accuracy: 0,
      totalQuizzesTaken: 0,
      challengesSolved: 0,
      playgroundRuns: 0,
      persistenceRating: "New Learner",
    };

    const weeklyGoal = student.weeklyGoalHours ?? 6;
    const weeklyBreakdown = [
      { week: "Week 1", hours: 0, target: weeklyGoal, lessons: 0 },
      { week: "Week 2", hours: 0, target: weeklyGoal, lessons: 0 },
      { week: "Week 3", hours: 0, target: weeklyGoal, lessons: 0 },
      { week: "Week 4 (Current)", hours: 0, target: weeklyGoal, lessons: 0 }
    ];

    const aiInsights = {
      conversationStarter: (student.totalXp || 0) > 0
        ? `Ask about what was learned in today's coding session!`
        : `Ready to begin their coding journey! Ask which track they would like to explore first.`,
      strength: (student.totalXp || 0) > 0 ? "Active Learner" : "Ready to Start",
      growthTip: "Consistent 15-minute daily practice builds lasting mastery.",
    };

    const parentReport = {
      overallAttendance: "100%",
      pace: (student.totalXp || 0) > 0 ? "Active" : "New Explorer",
      weeklyTargetMet: false,
      lastActive: student.lastActive || "Not yet active"
    };

    return {
      id: student.id,
      fullName: student.fullName || student.name || student.email?.split("@")[0] || "Student",
      email: student.email,
      avatar: student.avatar || (student.fullName || student.name || student.email || "S")[0].toUpperCase(),
      grade: student.grade || "Grade 4-6",
      themeColor: student.themeColor || "#6366f1",
      activePath: student.activePath || "Web Foundations",
      totalXp: student.totalXp ?? 0,
      streakDays: student.streakDays ?? 0,
      level: student.level || (student.totalXp ? Math.floor(student.totalXp / 100) + 1 : 1),
      rankTitle: student.rankTitle || "Novice Explorer",
      weeklyGoalHours: student.weeklyGoalHours ?? 6,
      monthlyHours: student.monthlyHours ?? 0,
      dailyActivities: student.dailyActivities || [],
      weeklyBreakdown,
      subjectMastery,
      quizMetrics,
      recentBadges: student.badges || [],
      aiInsights,
      parentReport,
      recentActivity: student.recentActivity || [],
    };
  });
}

