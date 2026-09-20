import { HTML_FOUNDATIONS_CONTENT } from "../data/htmlFoundationsContent";
import { CSS_STYLING_CONTENT } from "../data/cssStylingContent";
import { JAVASCRIPT_CORE_CONTENT } from "../data/javascriptCoreContent";
import { REACT_NEXUS_CONTENT } from "../data/reactNexusContent";
import { PROJECT_SHOWCASE_CONTENT } from "../data/projectShowcaseContent";
/* ====================================================== */
/* CONFIG */
/* ====================================================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const USE_MOCK_API =
  String(import.meta.env.VITE_USE_MOCK_API).toLowerCase() === "true";

/* ====================================================== */
/* MOCK CONTENT */
/* ====================================================== */

const MOCK_LEVEL_CONTENT = {
  "html-foundations": HTML_FOUNDATIONS_CONTENT,
  "css-styling": CSS_STYLING_CONTENT,
  "javascript-core": JAVASCRIPT_CORE_CONTENT,
  "react-nexus": REACT_NEXUS_CONTENT,
  "project-showcase": PROJECT_SHOWCASE_CONTENT,
};

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function normalizeLevelId(levelId = "") {
  return String(levelId).trim().toLowerCase();
}

function sortByOrder(items = []) {
  return [...items].sort(
    (a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0),
  );
}

function getPublishedItems(items = []) {
  return items.filter((item) => {
    return item?.status !== "draft";
  });
}

function normalizeLevelContent(content) {
  if (!content) {
    return null;
  }

  const lessons = getPublishedItems(sortByOrder(content.lessons || []));

  const challenges = getPublishedItems(sortByOrder(content.challenges || []));

  return {
    ...content,

    lessons,

    challenges,
  };
}

/* ====================================================== */
/* MOCK API */
/* ====================================================== */

async function getMockLevelContent(levelId) {
  const normalizedLevelId = normalizeLevelId(levelId);

  const content = MOCK_LEVEL_CONTENT[normalizedLevelId];

  if (!content) {
    throw new Error(
      `Learning content not found for level "${normalizedLevelId}".`,
    );
  }

  /*
    Keep this asynchronous so the frontend behaves
    similarly to the future backend API.
  */

  await Promise.resolve();

  return normalizeLevelContent(content);
}

/* ====================================================== */
/* REAL API */
/* ====================================================== */

async function requestLevelContent(levelId) {
  const normalizedLevelId = normalizeLevelId(levelId);

  const response = await fetch(
    `${API_URL}/learning/levels/${encodeURIComponent(normalizedLevelId)}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    let message = "Unable to load learning content.";

    try {
      const errorData = await response.json();

      message = errorData?.message || errorData?.error || message;
    } catch {
      // Keep fallback message.
    }

    throw new Error(message);
  }

  const data = await response.json();

  /*
    This supports both:

    {
      level: {...}
    }

    and:

    {
      data: {...}
    }

    and a direct level object.
  */

  const content = data?.level || data?.data || data;

  return normalizeLevelContent(content);
}

/* ====================================================== */
/* LEVEL CONTENT */
/* ====================================================== */

export async function getLevelContent(levelId) {
  if (!levelId) {
    throw new Error("A level id is required.");
  }

  if (USE_MOCK_API) {
    return getMockLevelContent(levelId);
  }

  return requestLevelContent(levelId);
}

/* ====================================================== */
/* LESSONS */
/* ====================================================== */

export async function getLevelLessons(levelId) {
  const content = await getLevelContent(levelId);

  return content.lessons || [];
}

export async function getLesson(levelId, lessonId) {
  if (!lessonId) {
    throw new Error("A lesson id is required.");
  }

  const lessons = await getLevelLessons(levelId);

  const lesson = lessons.find(
    (item) => item.id === lessonId || item.slug === lessonId,
  );

  if (!lesson) {
    throw new Error(`Lesson "${lessonId}" was not found.`);
  }

  return lesson;
}

/* ====================================================== */
/* CHALLENGES */
/* ====================================================== */

export async function getLevelChallenges(levelId) {
  const content = await getLevelContent(levelId);

  return content.challenges || [];
}

export async function getChallenge(levelId, challengeId) {
  if (!challengeId) {
    throw new Error("A challenge id is required.");
  }

  const challenges = await getLevelChallenges(levelId);

  const challenge = challenges.find(
    (item) => item.id === challengeId || item.slug === challengeId,
  );

  if (!challenge) {
    throw new Error(`Challenge "${challengeId}" was not found.`);
  }

  return challenge;
}

/* ====================================================== */
/* CONTENT SUMMARY */
/* ====================================================== */

export async function getLevelContentSummary(levelId) {
  const content = await getLevelContent(levelId);

  const lessons = content.lessons || [];

  const challenges = content.challenges || [];

  const totalLessonXp = lessons.reduce(
    (total, lesson) => total + (Number(lesson?.xp) || 0),
    0,
  );

  const totalChallengeXp = challenges.reduce(
    (total, challenge) => total + (Number(challenge?.xp) || 0),
    0,
  );

  const lessonMinutes = lessons.reduce(
    (total, lesson) => total + (Number(lesson?.estimatedMinutes) || 0),
    0,
  );

  const challengeMinutes = challenges.reduce(
    (total, challenge) => total + (Number(challenge?.estimatedMinutes) || 0),
    0,
  );

  return {
    id: content.id,

    slug: content.slug,

    title: content.title,

    subtitle: content.subtitle,

    description: content.description,

    accent: content.accent,

    secondaryAccent: content.secondaryAccent,

    status: content.status,

    version: content.version,

    lessonCount: lessons.length,

    challengeCount: challenges.length,

    totalUnits: lessons.length + challenges.length,

    totalXp: totalLessonXp + totalChallengeXp,

    estimatedMinutes:
      Number(content.estimatedMinutes) || lessonMinutes + challengeMinutes,
  };
}

/* ====================================================== */
/* MOCK HELPERS */
/* ====================================================== */

export function hasMockLevelContent(levelId) {
  const normalizedLevelId = normalizeLevelId(levelId);

  return Boolean(MOCK_LEVEL_CONTENT[normalizedLevelId]);
}

export function getMockLevelIds() {
  return Object.keys(MOCK_LEVEL_CONTENT);
}

/* ====================================================== */
/* CONFIG INFO */
/* ====================================================== */

export function getLearningContentConfig() {
  return {
    apiUrl: API_URL,

    useMockApi: USE_MOCK_API,
  };
}
