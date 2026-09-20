export const WEB_WORLD_CAMERA = {
  position: [0, 8.5, 20],
  target: [0, 1.5, -4],
};

/* ====================================================== */
/* WORLD LEVEL METADATA */
/* ====================================================== */

export const WEB_WORLD_LEVELS_BASE = [
  {
    id: "html-foundations",
    order: "01",
    code: "HTML",
    title: "HTML Foundations",
    subtitle: "Build the structure",
    description:
      "Learn how real web pages are structured using semantic HTML, elements, links, images, forms, and more.",
    accent: "#ff7048",
    secondaryAccent: "#ffb36d",
    position: [-7, -0.2, 1.8],
    radius: 2.8,
    cameraPosition: [-7, 4.5, 8.5],
    cameraTarget: [-7, 1.1, 1.8],
    lessons: 6,
    challenges: 3,
  },

  {
    id: "css-styling",
    order: "02",
    code: "CSS",
    title: "CSS Styling",
    subtitle: "Make it beautiful",
    description:
      "Master colors, layouts, typography, responsive design and animation to transform structure into beautiful experiences.",
    accent: "#40c8ff",
    secondaryAccent: "#7666ff",
    position: [-2.2, 1, -3.7],
    radius: 2.65,
    cameraPosition: [-2.2, 5.6, 3],
    cameraTarget: [-2.2, 1.8, -3.7],
    lessons: 8,
    challenges: 4,
  },

  {
    id: "javascript-core",
    order: "03",
    code: "JS",
    title: "JavaScript Core",
    subtitle: "Bring it to life",
    description:
      "Use variables, conditions, loops, functions and events to make your creations intelligent and interactive.",
    accent: "#ffd34e",
    secondaryAccent: "#ff873c",
    position: [5.8, 0.45, -1.6],
    radius: 2.8,
    cameraPosition: [5.8, 5, 5.5],
    cameraTarget: [5.8, 1.5, -1.6],
    lessons: 10,
    challenges: 6,
  },

  {
    id: "react-nexus",
    order: "04",
    code: "⚛",
    title: "React Nexus",
    subtitle: "Build the future",
    description:
      "Enter the Nexus and master components, state, events, reusable interfaces and modern application architecture.",
    accent: "#8067ff",
    secondaryAccent: "#36d8ff",
    position: [0.5, 3.2, -10.5],
    radius: 4,
    cameraPosition: [0.5, 8.4, -1.5],
    cameraTarget: [0.5, 4.2, -10.5],
    lessons: 12,
    challenges: 7,
  },

  {
    id: "project-showcase",
    order: "05",
    code: "◆",
    title: "Project Showcase",
    subtitle: "Create something real",
    description:
      "Combine everything you have learned and build a polished project that belongs to you.",
    accent: "#46dfff",
    secondaryAccent: "#9d72ff",
    position: [8.2, 2.65, -8.4],
    radius: 2.4,
    cameraPosition: [8.2, 7.3, -1],
    cameraTarget: [8.2, 3.7, -8.4],
    lessons: 1,
    challenges: 1,
  },
];

export const WEB_WORLD_LEVEL_IDS = WEB_WORLD_LEVELS_BASE.map(
  (level) => level.id,
);

/* ====================================================== */
/* DEFAULT PROGRESS */
/* ====================================================== */

export const DEFAULT_WEB_WORLD_PROGRESS = {
  completedLevelIds: [],

  levelProgress: WEB_WORLD_LEVEL_IDS.reduce((progress, levelId) => {
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
  return WEB_WORLD_LEVEL_IDS.includes(levelId);
}

/*
  The Web World is sequential.

  A later level is never considered completed unless every level before it
  is also completed. This protects the world progression from malformed
  localStorage data or direct-route completion attempts.
*/
function normalizeSequentialCompletedIds(completedLevelIds = []) {
  const requestedCompletedIds = new Set(
    completedLevelIds.filter((levelId) => isValidLevelId(levelId)),
  );

  const sequentialCompletedIds = [];

  for (const level of WEB_WORLD_LEVELS_BASE) {
    if (!requestedCompletedIds.has(level.id)) {
      break;
    }

    sequentialCompletedIds.push(level.id);
  }

  return sequentialCompletedIds;
}

/* ====================================================== */
/* STORAGE KEY */
/* ====================================================== */

export function getWebWorldProgressKey(userId = "guest") {
  return `codeland_web_world_progress_${userId}`;
}

/* ====================================================== */
/* NORMALIZE PROGRESS */
/* ====================================================== */

export function normalizeWebWorldProgress(progress = {}) {
  const rawCompletedLevelIds = Array.isArray(progress.completedLevelIds)
    ? progress.completedLevelIds
    : [];

  const completedLevelIds =
    normalizeSequentialCompletedIds(rawCompletedLevelIds);

  const completedSet = new Set(completedLevelIds);

  const incomingLevelProgress =
    progress.levelProgress && typeof progress.levelProgress === "object"
      ? progress.levelProgress
      : {};

  const levelProgress = WEB_WORLD_LEVEL_IDS.reduce((normalized, levelId) => {
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
/* LOAD PROGRESS */
/* ====================================================== */

export function loadWebWorldProgress(userId = "guest") {
  if (typeof window === "undefined") {
    return normalizeWebWorldProgress(DEFAULT_WEB_WORLD_PROGRESS);
  }

  try {
    const savedProgress = window.localStorage.getItem(
      getWebWorldProgressKey(userId),
    );

    if (!savedProgress) {
      return normalizeWebWorldProgress(DEFAULT_WEB_WORLD_PROGRESS);
    }

    return normalizeWebWorldProgress(JSON.parse(savedProgress));
  } catch (error) {
    console.error("[CodeLand] Unable to load world progress:", error);

    return normalizeWebWorldProgress(DEFAULT_WEB_WORLD_PROGRESS);
  }
}

/* ====================================================== */
/* SAVE PROGRESS */
/* ====================================================== */

export function saveWebWorldProgress(
  userId = "guest",
  progress = DEFAULT_WEB_WORLD_PROGRESS,
) {
  const normalizedProgress = normalizeWebWorldProgress(progress);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getWebWorldProgressKey(userId),
        JSON.stringify(normalizedProgress),
      );
    } catch (error) {
      console.error("[CodeLand] Unable to save world progress:", error);
    }
  }

  return normalizedProgress;
}

/* ====================================================== */
/* BUILD DYNAMIC WORLD LEVELS */
/* ====================================================== */

export function buildWebWorldLevels(progress = DEFAULT_WEB_WORLD_PROGRESS) {
  const normalizedProgress = normalizeWebWorldProgress(progress);

  const completedSet = new Set(normalizedProgress.completedLevelIds);

  const firstIncompleteIndex = WEB_WORLD_LEVELS_BASE.findIndex(
    (level) => !completedSet.has(level.id),
  );

  return WEB_WORLD_LEVELS_BASE.map((level, index) => {
    const completed = completedSet.has(level.id);

    let status = "locked";

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

export function getCurrentWebWorldLevel(progress = DEFAULT_WEB_WORLD_PROGRESS) {
  const levels = buildWebWorldLevels(progress);

  return (
    levels.find((level) => level.status === "current") ||
    levels[levels.length - 1] ||
    null
  );
}

/* ====================================================== */
/* LEVEL ACCESS */
/* ====================================================== */

export function canAccessWebWorldLevel(
  progress = DEFAULT_WEB_WORLD_PROGRESS,
  levelId,
) {
  if (!isValidLevelId(levelId)) {
    return false;
  }

  const level = buildWebWorldLevels(progress).find(
    (item) => item.id === levelId,
  );

  return Boolean(level && level.status !== "locked");
}

/* ====================================================== */
/* NEXT LEVEL */
/* ====================================================== */

export function getNextWebWorldLevel(
  progress = DEFAULT_WEB_WORLD_PROGRESS,
  levelId,
) {
  if (!isValidLevelId(levelId)) {
    return null;
  }

  const currentIndex = WEB_WORLD_LEVELS_BASE.findIndex(
    (level) => level.id === levelId,
  );

  return WEB_WORLD_LEVELS_BASE[currentIndex + 1] || null;
}

/* ====================================================== */
/* WORLD COMPLETE */
/* ====================================================== */

export function isWebWorldCompleted(progress = DEFAULT_WEB_WORLD_PROGRESS) {
  const normalizedProgress = normalizeWebWorldProgress(progress);

  return (
    normalizedProgress.completedLevelIds.length === WEB_WORLD_LEVELS_BASE.length
  );
}

/* ====================================================== */
/* UPDATE LEVEL PROGRESS */
/* ====================================================== */

export function updateWebWorldLevelProgress(userId, levelId, progressValue) {
  if (!isValidLevelId(levelId)) {
    console.warn(`[CodeLand] Unknown Web World level "${levelId}".`);

    return loadWebWorldProgress(userId);
  }

  const currentProgress = loadWebWorldProgress(userId);
  const currentLevels = buildWebWorldLevels(currentProgress);

  const targetLevel = currentLevels.find((level) => level.id === levelId);

  if (!targetLevel || targetLevel.status === "locked") {
    console.warn(
      `[CodeLand] Ignored progress update for locked level "${levelId}".`,
    );

    return currentProgress;
  }

  const previousValue = clampProgress(currentProgress.levelProgress[levelId]);

  const requestedValue = clampProgress(progressValue);

  /*
    Progress is monotonic.
    Reopening a lesson/challenge must never move
    the world backwards.
  */
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

  return saveWebWorldProgress(userId, nextProgress);
}

/* ====================================================== */
/* COMPLETE LEVEL */
/* ====================================================== */

export function completeWebWorldLevel(userId, levelId) {
  return updateWebWorldLevelProgress(userId, levelId, 100);
}

/* ====================================================== */
/* RESET WORLD PROGRESS */
/* ====================================================== */

export function resetWebWorldProgress(userId = "guest") {
  const freshProgress = normalizeWebWorldProgress(DEFAULT_WEB_WORLD_PROGRESS);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(getWebWorldProgressKey(userId));
    } catch (error) {
      console.error("[CodeLand] Unable to reset world progress:", error);
    }
  }

  return freshProgress;
}

/* ====================================================== */
/* INITIAL / LEGACY EXPORT */
/* ====================================================== */

/*
  Legacy export kept temporarily for older components.

  Initial state:
  HTML = current
  CSS = locked
  JavaScript = locked
  React = locked
  Project = locked
*/

export const WEB_WORLD_LEVELS = buildWebWorldLevels(DEFAULT_WEB_WORLD_PROGRESS);
