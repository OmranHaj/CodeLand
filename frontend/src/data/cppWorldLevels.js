export const CPP_WORLD_CAMERA = {
  position: [0, 7.5, 21],
  target: [0, 1.8, -5],
};

/* ====================================================== */
/* C++ WORLD LEVEL METADATA */
/* ====================================================== */

export const CPP_WORLD_LEVELS_BASE = [
  {
    id: "cpp-syntax-core",
    order: "01",

    code: "C++",

    title: "Syntax Core",

    subtitle: "Power up the language",

    description:
      "Enter the C++ Core and learn how programs are structured using main, statements, output, comments, and fundamental syntax.",

    accent: "#2f8cff",
    secondaryAccent: "#6ee7ff",

    sector: "CORE-01",

    position: [0, 0.2, 2.2],

    radius: 2.7,

    cameraPosition: [0, 4.3, 9.3],

    cameraTarget: [0, 1.25, 2.2],

    lessons: 6,
    challenges: 3,
  },

  {
    id: "cpp-data-circuits",
    order: "02",

    code: "DATA",

    title: "Data Circuits",

    subtitle: "Control information",

    description:
      "Work with variables, primitive types, constants, operators, input, and the data that powers every C++ system.",

    accent: "#38bdf8",
    secondaryAccent: "#7dd3fc",

    sector: "CORE-02",

    position: [-5.8, 0.85, -1.2],

    radius: 2.55,

    cameraPosition: [-5.8, 5, 5.8],

    cameraTarget: [-5.8, 1.6, -1.2],

    lessons: 7,
    challenges: 4,
  },

  {
    id: "cpp-logic-gates",
    order: "03",

    code: "IF",

    title: "Logic Gates",

    subtitle: "Make decisions",

    description:
      "Use comparisons, boolean logic, if statements, switch blocks, and loops to control the flow of your programs.",

    accent: "#6c7cff",
    secondaryAccent: "#4fd1ff",

    sector: "CORE-03",

    position: [5.8, 0.85, -1.2],

    radius: 2.55,

    cameraPosition: [5.8, 5, 5.8],

    cameraTarget: [5.8, 1.6, -1.2],

    lessons: 8,
    challenges: 4,
  },

  {
    id: "cpp-function-engine",
    order: "04",

    code: "FN",

    title: "Function Engine",

    subtitle: "Build reusable systems",

    description:
      "Create functions, pass parameters, return values, understand scope, and break complex programs into reusable modules.",

    accent: "#8b6dff",
    secondaryAccent: "#45d8ff",

    sector: "CORE-04",

    position: [-4.2, 2.25, -6.4],

    radius: 2.8,

    cameraPosition: [-4.2, 6.4, 0.6],

    cameraTarget: [-4.2, 2.8, -6.4],

    lessons: 7,
    challenges: 4,
  },

  {
    id: "cpp-array-matrix",
    order: "05",

    code: "[]",

    title: "Array Matrix",

    subtitle: "Organize collections",

    description:
      "Master arrays, strings, multidimensional data, iteration, and the techniques used to process collections efficiently.",

    accent: "#37d5ff",
    secondaryAccent: "#48a5ff",

    sector: "CORE-05",

    position: [4.2, 2.25, -6.4],

    radius: 2.8,

    cameraPosition: [4.2, 6.4, 0.6],

    cameraTarget: [4.2, 2.8, -6.4],

    lessons: 7,
    challenges: 4,
  },

  {
    id: "cpp-memory-vault",
    order: "06",

    code: "*",

    title: "Memory Vault",

    subtitle: "Understand what happens underneath",

    description:
      "Explore references, pointers, addresses, stack and heap concepts, dynamic memory, and one of the most powerful parts of C++.",

    accent: "#ff5c7a",
    secondaryAccent: "#ff8fa4",

    sector: "CORE-06",

    position: [-5.3, 3.55, -11.4],

    radius: 3,

    cameraPosition: [-5.3, 7.7, -4],

    cameraTarget: [-5.3, 4.15, -11.4],

    lessons: 8,
    challenges: 5,
  },

  {
    id: "cpp-object-forge",
    order: "07",

    code: "OOP",

    title: "Object Forge",

    subtitle: "Engineer real systems",

    description:
      "Build classes and objects, use constructors, encapsulation, inheritance, polymorphism, and organize larger applications.",

    accent: "#a56cff",
    secondaryAccent: "#4de2ff",

    sector: "CORE-07",

    position: [5.3, 3.55, -11.4],

    radius: 3.1,

    cameraPosition: [5.3, 7.7, -4],

    cameraTarget: [5.3, 4.15, -11.4],

    lessons: 9,
    challenges: 5,
  },

  {
    id: "cpp-stl-command",
    order: "08",

    code: "STL",

    title: "STL Command Center",

    subtitle: "Unlock modern C++ power",

    description:
      "Use vectors, maps, sets, iterators, algorithms, and the Standard Template Library to solve bigger problems with less code.",

    accent: "#ffc857",
    secondaryAccent: "#62e8ff",

    sector: "CORE-08",

    position: [0, 5.15, -16.3],

    radius: 3.5,

    cameraPosition: [0, 9.8, -8.1],

    cameraTarget: [0, 5.8, -16.3],

    lessons: 8,
    challenges: 5,
  },

  {
    id: "cpp-final-system",
    order: "09",

    code: "◆",

    title: "Final System Build",

    subtitle: "Build something powerful",

    description:
      "Combine everything you learned and engineer a complete C++ application using clean architecture, logic, data, memory, and reusable components.",

    accent: "#61f2b5",
    secondaryAccent: "#5ca8ff",

    sector: "CORE-X",

    position: [0, 8, -22],

    radius: 4,

    cameraPosition: [0, 13, -13],

    cameraTarget: [0, 8.7, -22],

    lessons: 1,
    challenges: 1,
  },
];

export const CPP_WORLD_LEVEL_IDS = CPP_WORLD_LEVELS_BASE.map(
  (level) => level.id,
);

/* ====================================================== */
/* DEFAULT PROGRESS */
/* ====================================================== */

export const DEFAULT_CPP_WORLD_PROGRESS = {
  completedLevelIds: [],

  levelProgress: CPP_WORLD_LEVEL_IDS.reduce((progress, levelId) => {
    progress[levelId] = 0;

    return progress;
  }, {}),
};

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function clampProgress(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(100, Math.max(0, numericValue));
}

function isValidLevelId(levelId) {
  return CPP_WORLD_LEVEL_IDS.includes(levelId);
}

function normalizeCompletedIds(completedLevelIds = []) {
  return CPP_WORLD_LEVEL_IDS.filter((levelId) =>
    completedLevelIds.includes(levelId),
  );
}

/* ====================================================== */
/* STORAGE KEY */
/* ====================================================== */

export function getCppWorldProgressKey(userId = "guest") {
  return `codeland_cpp_world_progress_${userId}`;
}

/* ====================================================== */
/* NORMALIZE */
/* ====================================================== */

export function normalizeCppWorldProgress(progress = {}) {
  const rawCompletedLevelIds = Array.isArray(progress.completedLevelIds)
    ? progress.completedLevelIds
    : [];

  const completedLevelIds = normalizeCompletedIds(rawCompletedLevelIds);

  const completedSet = new Set(completedLevelIds);

  const incomingLevelProgress =
    progress.levelProgress && typeof progress.levelProgress === "object"
      ? progress.levelProgress
      : {};

  const levelProgress = CPP_WORLD_LEVEL_IDS.reduce((normalized, levelId) => {
    normalized[levelId] = completedSet.has(levelId)
      ? 100
      : clampProgress(incomingLevelProgress[levelId]);

    return normalized;
  }, {});

  return {
    completedLevelIds,
    levelProgress,
  };
}

/* ====================================================== */
/* LOAD */
/* ====================================================== */

export function loadCppWorldProgress(userId = "guest") {
  if (typeof window === "undefined") {
    return normalizeCppWorldProgress(DEFAULT_CPP_WORLD_PROGRESS);
  }

  try {
    const savedProgress = window.localStorage.getItem(
      getCppWorldProgressKey(userId),
    );

    if (!savedProgress) {
      return normalizeCppWorldProgress(DEFAULT_CPP_WORLD_PROGRESS);
    }

    return normalizeCppWorldProgress(JSON.parse(savedProgress));
  } catch (error) {
    console.error("[CodeLand] Unable to load C++ world progress:", error);

    return normalizeCppWorldProgress(DEFAULT_CPP_WORLD_PROGRESS);
  }
}

/* ====================================================== */
/* SAVE */
/* ====================================================== */

export function saveCppWorldProgress(
  userId = "guest",
  progress = DEFAULT_CPP_WORLD_PROGRESS,
) {
  const normalizedProgress = normalizeCppWorldProgress(progress);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getCppWorldProgressKey(userId),
        JSON.stringify(normalizedProgress),
      );
    } catch (error) {
      console.error("[CodeLand] Unable to save C++ world progress:", error);
    }
  }

  return normalizedProgress;
}

/* ====================================================== */
/* BUILD LEVELS */
/* ====================================================== */

export function buildCppWorldLevels(progress = DEFAULT_CPP_WORLD_PROGRESS) {
  const normalizedProgress = normalizeCppWorldProgress(progress);

  const completedSet = new Set(normalizedProgress.completedLevelIds);

  const firstIncompleteIndex = CPP_WORLD_LEVELS_BASE.findIndex(
    (level) => !completedSet.has(level.id),
  );

  return CPP_WORLD_LEVELS_BASE.map((level, index) => {
    const completed = completedSet.has(level.id);

    let status = "available";

    if (completed) {
      status = "completed";
    } else if (firstIncompleteIndex === index) {
      status = "current";
    }

    return {
      ...level,

      status,

      progress: completed
        ? 100
        : (normalizedProgress.levelProgress[level.id] ?? 0),
    };
  });
}

/* ====================================================== */
/* CURRENT LEVEL */
/* ====================================================== */

export function getCurrentCppWorldLevel(progress = DEFAULT_CPP_WORLD_PROGRESS) {
  const levels = buildCppWorldLevels(progress);

  return (
    levels.find((level) => level.status === "current") ||
    levels[levels.length - 1] ||
    null
  );
}

/* ====================================================== */
/* ACCESS */
/* ====================================================== */

export function canAccessCppWorldLevel(
  progress = DEFAULT_CPP_WORLD_PROGRESS,
  levelId,
) {
  void progress;

  return isValidLevelId(levelId);
}

/* ====================================================== */
/* NEXT LEVEL */
/* ====================================================== */

export function getNextCppWorldLevel(
  progress = DEFAULT_CPP_WORLD_PROGRESS,
  levelId,
) {
  if (!isValidLevelId(levelId)) {
    return null;
  }

  const currentIndex = CPP_WORLD_LEVELS_BASE.findIndex(
    (level) => level.id === levelId,
  );

  return CPP_WORLD_LEVELS_BASE[currentIndex + 1] || null;
}

/* ====================================================== */
/* WORLD COMPLETE */
/* ====================================================== */

export function isCppWorldCompleted(progress = DEFAULT_CPP_WORLD_PROGRESS) {
  const normalizedProgress = normalizeCppWorldProgress(progress);

  return (
    normalizedProgress.completedLevelIds.length === CPP_WORLD_LEVELS_BASE.length
  );
}

/* ====================================================== */
/* UPDATE LEVEL PROGRESS */
/* ====================================================== */

export function updateCppWorldLevelProgress(userId, levelId, progressValue) {
  if (!isValidLevelId(levelId)) {
    console.warn(`[CodeLand] Unknown C++ World level "${levelId}".`);

    return loadCppWorldProgress(userId);
  }

  const currentProgress = loadCppWorldProgress(userId);

  const targetLevel = buildCppWorldLevels(currentProgress).find(
    (level) => level.id === levelId,
  );

  if (!targetLevel) {
    return currentProgress;
  }

  const previousValue = clampProgress(currentProgress.levelProgress[levelId]);

  const requestedValue = clampProgress(progressValue);

  const nextValue =
    targetLevel.status === "completed"
      ? 100
      : Math.max(previousValue, requestedValue);

  const completedLevelIds = new Set(currentProgress.completedLevelIds);

  if (nextValue >= 100) {
    completedLevelIds.add(levelId);
  }

  const nextProgress = {
    completedLevelIds: Array.from(completedLevelIds),

    levelProgress: {
      ...currentProgress.levelProgress,

      [levelId]: nextValue,
    },
  };

  return saveCppWorldProgress(userId, nextProgress);
}

/* ====================================================== */
/* COMPLETE LEVEL */
/* ====================================================== */

export function completeCppWorldLevel(userId, levelId) {
  return updateCppWorldLevelProgress(userId, levelId, 100);
}

/* ====================================================== */
/* RESET */
/* ====================================================== */

export function resetCppWorldProgress(userId = "guest") {
  const freshProgress = normalizeCppWorldProgress(DEFAULT_CPP_WORLD_PROGRESS);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(getCppWorldProgressKey(userId));
    } catch (error) {
      console.error("[CodeLand] Unable to reset C++ world progress:", error);
    }
  }

  return freshProgress;
}

/* ====================================================== */
/* LEGACY / INITIAL */
/* ====================================================== */

export const CPP_WORLD_LEVELS = buildCppWorldLevels(DEFAULT_CPP_WORLD_PROGRESS);
