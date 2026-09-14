import { HTML_FOUNDATIONS_CONTENT } from "../data/htmlFoundationsContent";
import { CSS_STYLING_CONTENT } from "../data/cssStylingContent";

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
};

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function sortByOrder(items = []) {
  return [...items].sort((a, b) => Number(a.order) - Number(b.order));
}

function onlyPublished(items = []) {
  return items.filter((item) => item.status === "published");
}

function normalizeLevelContent(level) {
  if (!level) {
    return null;
  }

  return {
    ...level,

    lessons: sortByOrder(onlyPublished(level.lessons || [])),

    challenges: sortByOrder(onlyPublished(level.challenges || [])),
  };
}

/* ====================================================== */
/* GET LEVEL CONTENT */
/* ====================================================== */

export async function getLevelContent(levelId) {
  /*
    FRONTEND / MOCK MODE
  */

  if (USE_MOCK_API) {
    const content = MOCK_LEVEL_CONTENT[levelId];

    if (!content) {
      throw new Error(`Learning content not found for "${levelId}".`);
    }

    /*
      نخليها async مثل الـ backend
      حتى الواجهة ما تتغير لاحقاً.
    */

    return normalizeLevelContent(content);
  }

  /*
    BACKEND MODE
  */

  const response = await fetch(`${API_URL}/learning/levels/${levelId}`);

  if (!response.ok) {
    throw new Error("Unable to load learning content.");
  }

  const data = await response.json();

  return normalizeLevelContent(data.level || data);
}

/* ====================================================== */
/* GET LESSONS */
/* ====================================================== */

export async function getLevelLessons(levelId) {
  const level = await getLevelContent(levelId);

  return level?.lessons || [];
}

/* ====================================================== */
/* GET LESSON */
/* ====================================================== */

export async function getLesson(levelId, lessonId) {
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
/* GET CHALLENGES */
/* ====================================================== */

export async function getLevelChallenges(levelId) {
  const level = await getLevelContent(levelId);

  return level?.challenges || [];
}

/* ====================================================== */
/* GET CHALLENGE */
/* ====================================================== */

export async function getChallenge(levelId, challengeId) {
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
  const level = await getLevelContent(levelId);

  const lessons = level?.lessons || [];

  const challenges = level?.challenges || [];

  const lessonXp = lessons.reduce(
    (total, lesson) => total + (Number(lesson.xp) || 0),
    0,
  );

  const challengeXp = challenges.reduce(
    (total, challenge) => total + (Number(challenge.xp) || 0),
    0,
  );

  const calculatedMinutes = [...lessons, ...challenges].reduce(
    (total, item) => total + (Number(item.estimatedMinutes) || 0),
    0,
  );

  return {
    levelId: level.id,

    lessons: lessons.length,

    challenges: challenges.length,

    totalXp: lessonXp + challengeXp,

    estimatedMinutes: calculatedMinutes || Number(level.estimatedMinutes) || 0,
  };
}
