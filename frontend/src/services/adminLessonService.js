import { WEB_WORLD_LEVELS_BASE } from "../data/webWorldLevels.js";
import { CPP_WORLD_LEVELS_BASE } from "../data/cppWorldLevels.js";
import { ALGO_SECTORS } from "../data/algorithmWorldLevels.js";
// import { pythonLessons } from "../data/hubContent.js"; // MOCK DATA: Commented out to use only PostgreSQL database
import { HTML_FOUNDATIONS_CONTENT } from "../data/htmlFoundationsContent.js";
import { CSS_STYLING_CONTENT } from "../data/cssStylingContent.js";
import { JAVASCRIPT_CORE_CONTENT } from "../data/javascriptCoreContent.js";
import { REACT_NEXUS_CONTENT } from "../data/reactNexusContent.js";
import { PROJECT_SHOWCASE_CONTENT } from "../data/projectShowcaseContent.js";
import cppSyntaxCoreContent from "../data/cppSyntaxCoreContent.js";
import cppDataCircuitsContent from "../data/cppDataCircuitsContent.js";
import cppLogicGatesContent from "../data/cppLogicGatesContent.js";
import cppFunctionEngineContent from "../data/cppFunctionEngineContent.js";
import cppArrayMatrixContent from "../data/cppArrayMatrixContent.js";
import cppMemoryVaultContent from "../data/cppMemoryVaultContent.js";
import cppObjectForgeContent from "../data/cppObjectForgeContent.js";
import cppStlCommandContent from "../data/cppStlCommandContent.js";
import cppFinalSystemContent from "../data/cppFinalSystemContent.js";
import { apiRequest } from "./api.js";

/* ==========================================================================
   STORAGE KEY & VERSIONING
   ========================================================================== */

export const ADMIN_STORAGE_KEY = "codeland_admin_lessons_v1";
export const ADMIN_EVENT_NAME = "codeland:admin-update";

// In-memory fallback if browser localStorage is unavailable
let memoryStoreFallback = null;

/* ==========================================================================
   BASE CONTENT REGISTRY
   ========================================================================== */

const BASE_CONTENT_MAP = {
  "html-foundations": HTML_FOUNDATIONS_CONTENT,
  "css-styling": CSS_STYLING_CONTENT,
  "javascript-core": JAVASCRIPT_CORE_CONTENT,
  "react-nexus": REACT_NEXUS_CONTENT,
  "project-showcase": PROJECT_SHOWCASE_CONTENT,
  "cpp-syntax-core": cppSyntaxCoreContent,
  "cpp-data-circuits": cppDataCircuitsContent,
  "cpp-logic-gates": cppLogicGatesContent,
  "cpp-function-engine": cppFunctionEngineContent,
  "cpp-array-matrix": cppArrayMatrixContent,
  "cpp-memory-vault": cppMemoryVaultContent,
  "cpp-object-forge": cppObjectForgeContent,
  "cpp-stl-command": cppStlCommandContent,
  "cpp-final-system": cppFinalSystemContent,
  ...Object.fromEntries(
    (ALGO_SECTORS || []).map((sector) => [
      sector.id,
      {
        id: sector.id,
        title: sector.title,
        subtitle: sector.subtitle,
        description: sector.description,
        lessons: (sector.lessons || []).map((l, idx) => ({
          id: l.id || `algo-${sector.id}-${idx + 1}`,
          slug: l.id || `algo-${sector.id}-${idx + 1}`,
          title: l.title,
          subtitle: l.subtitle,
          description: l.concept || l.analogyDescription,
          difficulty: "intermediate",
          xp: 75,
          estimatedMinutes: 15,
          status: "published",
          blocks: [
            {
              type: "concept",
              title: l.analogyTitle || l.title,
              content: l.analogyDescription || l.concept,
            },
            {
              type: "complexity",
              time: l.timeComplexity,
              space: l.spaceComplexity,
            },
            {
              type: "code",
              language: "javascript",
              code: Array.isArray(l.steps) && l.steps[0]?.text
                ? l.steps.map((s) => `// Step: ${s.stepTitle || s.title || ""}\n${s.text || ""}`).join("\n\n")
                : `// Algorithm: ${l.title}\nconsole.log("Visualizing ${l.title}");`,
            },
          ],
        })),
      },
    ])
  ),
};

// const PYTHON_COURSE_ID = "python-explorer"; // MOCK DATA: Commented out because Python is not in PostgreSQL database

const BASE_COURSES = [
  ...WEB_WORLD_LEVELS_BASE.map((lvl) => ({
    id: lvl.id,
    title: lvl.title,
    subtitle: lvl.subtitle,
    description: lvl.description,
    group: "Web",
    code: lvl.code || "WEB",
    accent: lvl.accent || "#ff7048",
    secondaryAccent: lvl.secondaryAccent || "#ffb36d",
    route: `/student/level/${lvl.id}`,
    defaultLanguage: "html",
  })),
  ...CPP_WORLD_LEVELS_BASE.map((lvl) => ({
    id: lvl.id,
    title: lvl.title,
    subtitle: lvl.subtitle,
    description: lvl.description,
    group: "C++",
    code: lvl.code || "C++",
    accent: lvl.accent || "#38bdf8",
    secondaryAccent: lvl.secondaryAccent || "#7dd3fc",
    route: `/student/level/${lvl.id}`,
    defaultLanguage: "cpp",
  })),
  ...ALGO_SECTORS.map((lvl) => ({
    id: lvl.id,
    title: lvl.title,
    subtitle: lvl.subtitle,
    description: lvl.description,
    group: "Algorithms",
    code: lvl.code || "ALG",
    accent: lvl.accent || "#10b981",
    secondaryAccent: lvl.secondaryAccent || "#34d399",
    route: `/student/algorithm-lab/${lvl.id}`,
    defaultLanguage: "javascript",
  })),
  /*
  // MOCK DATA: Commented out because Python is not in the database
  {
    id: "python-explorer",
    title: "Python Explorer",
    subtitle: "Journey through computational thinking",
    description:
      "Master Python fundamentals through variables, conditionals, loops, functions, and interactive terminal exercises.",
    group: "Python",
    code: "Py",
    accent: "#65d4ae",
    secondaryAccent: "#38bdf8",
    route: "/student/python-world",
    defaultLanguage: "python",
  },
  */
];

/* ==========================================================================
   LIVE DATABASE CURRICULUM CACHE & API SYNC
   ========================================================================== */

export let dbCurriculumCache = {
  tracks: [],
  levelsBySlug: {},
  levelsById: {},
  lessonsById: {},
  lessonsBySlug: {},
  lastSync: null,
  isSynced: false,
};

export function isDatabaseSynced() {
  return dbCurriculumCache.isSynced === true;
}

export function getDatabaseSyncTime() {
  return dbCurriculumCache.lastSync;
}

export async function fetchAdminCurriculumFromDB() {
  try {
    const tracks = await apiRequest("/learning/admin/curriculum");
    if (Array.isArray(tracks) && tracks.length > 0) {
      const levelsBySlug = {};
      const levelsById = {};
      const lessonsById = {};
      const lessonsBySlug = {};

      for (const track of tracks) {
        if (!Array.isArray(track.levels)) continue;
        for (const level of track.levels) {
          const processedLessons = (level.lessons || []).map((rawLesson, idx) => {
            let code = rawLesson.code || "";
            if (!code && Array.isArray(rawLesson.blocks)) {
              const codeBlock = rawLesson.blocks.find(
                (b) => b && (b.type === "code" || typeof b.code === "string")
              );
              if (codeBlock) code = codeBlock.code;
            }

            const item = {
              ...rawLesson,
              id: rawLesson.id,
              slug: rawLesson.slug,
              levelId: rawLesson.levelId || level.id,
              levelSlug: level.slug,
              trackSlug: track.slug,
              trackTitle: track.title,
              title: rawLesson.title,
              subtitle: rawLesson.subtitle || "",
              description: rawLesson.description || "",
              difficulty: (rawLesson.difficulty || "beginner").toLowerCase(),
              status: (rawLesson.status || "published").toLowerCase(),
              order: Number.isFinite(Number(rawLesson.order)) ? Number(rawLesson.order) : idx + 1,
              xp: Number.isFinite(Number(rawLesson.xp)) ? Number(rawLesson.xp) : 50,
              estimatedMinutes: Number.isFinite(Number(rawLesson.estimatedMinutes))
                ? Number(rawLesson.estimatedMinutes)
                : 8,
              code,
              blocks: rawLesson.blocks || [],
              isDatabaseBacked: true,
            };

            lessonsById[item.id] = item;
            if (item.slug) lessonsBySlug[item.slug] = item;
            return item;
          });

          const levelObj = {
            ...level,
            trackSlug: track.slug,
            trackTitle: track.title,
            lessons: processedLessons,
          };

          levelsBySlug[level.slug] = levelObj;
          levelsById[level.id] = levelObj;
        }
      }

      dbCurriculumCache = {
        tracks,
        levelsBySlug,
        levelsById,
        lessonsById,
        lessonsBySlug,
        lastSync: new Date().toISOString(),
        isSynced: true,
      };

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME, { detail: dbCurriculumCache }));
        window.dispatchEvent(new Event("codeland:update"));
      }

      return dbCurriculumCache;
    }
  } catch (err) {
    console.warn("[CodeLand Admin] fetchAdminCurriculumFromDB warning:", err);
  }
  return dbCurriculumCache;
}

/* ==========================================================================
   BASE LESSON EXTRACTION
   ========================================================================== */

/*
// MOCK DATA: Commented out because Python is not in PostgreSQL database
function getBasePythonLessons() {
  return pythonLessons.map((lesson, index) => ({
    id: `python-lesson-${index + 1}`,
    slug: `python-lesson-${index + 1}`,
    order: index + 1,
    title: lesson.title,
    subtitle: lesson.subtitle,
    description: lesson.concept,
    xp: 50,
    estimatedMinutes: 6,
    difficulty: "beginner",
    status: "published",
    code: lesson.code || "",
    blocks: [
      {
        id: `py-block-text-${index}`,
        type: "text",
        title: lesson.title,
        content: lesson.concept,
      },
      {
        id: `py-block-code-${index}`,
        type: "code",
        language: "python",
        code: lesson.code || "",
      },
    ],
    question: lesson.question,
    options: lesson.options,
    answer: lesson.answer,
    explanation: lesson.explanation,
    isBaseLesson: true,
  }));
}
*/

export function getBaseLessonsForCourse(courseId) {
  /*
  if (courseId === "python-explorer") {
    return getBasePythonLessons();
  }
  */

  const content = BASE_CONTENT_MAP[courseId];
  if (!content || !Array.isArray(content.lessons)) {
    return [];
  }

  return content.lessons.map((lesson, idx) => ({
    ...lesson,
    order: Number.isFinite(Number(lesson.order)) ? Number(lesson.order) : idx + 1,
    difficulty: (lesson.difficulty || "beginner").toLowerCase(),
    status: lesson.status || "published",
    xp: Number.isFinite(Number(lesson.xp)) ? Number(lesson.xp) : 50,
    estimatedMinutes: Number.isFinite(Number(lesson.estimatedMinutes))
      ? Number(lesson.estimatedMinutes)
      : 8,
    isBaseLesson: true,
  }));
}

/* ==========================================================================
   STORAGE ENGINE WITH FAILSAFE & VALIDATION
   ========================================================================== */

function createEmptyStore() {
  return {
    version: 1,
    courses: {},
  };
}

function sanitizeOverlay(rawOverlay) {
  if (!rawOverlay || typeof rawOverlay !== "object") {
    return { added: [], edited: {}, deleted: [] };
  }

  const added = Array.isArray(rawOverlay.added)
    ? rawOverlay.added.filter((item) => item && typeof item === "object" && item.id)
    : [];

  const edited =
    rawOverlay.edited && typeof rawOverlay.edited === "object"
      ? rawOverlay.edited
      : {};

  const deleted = Array.isArray(rawOverlay.deleted)
    ? [...new Set(rawOverlay.deleted.filter((id) => typeof id === "string"))]
    : [];

  return { added, edited, deleted };
}

export function readAdminStore() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem(ADMIN_STORAGE_KEY)
      : null;

    if (!raw) {
      return memoryStoreFallback || createEmptyStore();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || parsed.version !== 1) {
      return createEmptyStore();
    }

    const courses = {};
    if (parsed.courses && typeof parsed.courses === "object") {
      for (const [courseId, overlay] of Object.entries(parsed.courses)) {
        courses[courseId] = sanitizeOverlay(overlay);
      }
    }

    return { version: 1, courses };
  } catch (err) {
    console.warn("[CodeLand Admin] Storage read error or unavailable:", err);
    return memoryStoreFallback || createEmptyStore();
  }
}

export function writeAdminStore(store) {
  const sanitized = {
    version: 1,
    courses: store?.courses && typeof store.courses === "object" ? store.courses : {},
  };

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sanitized));
    }
  } catch (err) {
    console.warn("[CodeLand Admin] Storage write error, using in-memory fallback:", err);
    memoryStoreFallback = sanitized;
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME, { detail: sanitized }));
    window.dispatchEvent(new Event("codeland:update"));
  }
}

export function getCourseOverlay(courseId) {
  const store = readAdminStore();
  return sanitizeOverlay(store.courses[courseId]);
}

function updateCourseOverlay(courseId, updater) {
  const store = readAdminStore();
  const currentOverlay = sanitizeOverlay(store.courses[courseId]);
  const nextOverlay = updater(currentOverlay);

  const nextCourses = { ...store.courses };
  const hasChanges =
    nextOverlay.added.length > 0 ||
    Object.keys(nextOverlay.edited).length > 0 ||
    nextOverlay.deleted.length > 0;

  if (hasChanges) {
    nextCourses[courseId] = nextOverlay;
  } else {
    delete nextCourses[courseId];
  }

  writeAdminStore({ ...store, courses: nextCourses });
}

/* ==========================================================================
   PUBLIC LESSON RESOLVER & AGGREGATOR
   ========================================================================== */

export function getCourseLessons(courseId) {
  const dbLevel = dbCurriculumCache?.levelsBySlug?.[courseId];
  const sourceLessons =
    dbLevel && Array.isArray(dbLevel.lessons) && dbLevel.lessons.length > 0
      ? dbLevel.lessons
      : getBaseLessonsForCourse(courseId);

  const overlay = getCourseOverlay(courseId);
  const deletedSet = new Set(overlay.deleted);

  // 1. Process base or DB lessons: filter deleted & apply edits
  const processedBase = sourceLessons
    .filter((lesson) => !deletedSet.has(lesson.id) && !deletedSet.has(lesson.slug))
    .map((lesson) => {
      const edit = overlay.edited[lesson.id] || (lesson.slug ? overlay.edited[lesson.slug] : null);
      if (!edit) return lesson;
      return {
        ...lesson,
        ...edit,
        isCustomized: true,
      };
    });

  // 2. Process added lessons: filter deleted
  const processedAdded = overlay.added
    .filter((lesson) => !deletedSet.has(lesson.id))
    .map((lesson) => ({
      ...lesson,
      isUserCreated: true,
    }));

  // 3. Combine and sort by order
  const combined = [...processedBase, ...processedAdded];
  combined.sort((a, b) => {
    const orderA = Number(a.order) || 0;
    const orderB = Number(b.order) || 0;
    if (orderA !== orderB) return orderA - orderB;
    return String(a.title || "").localeCompare(String(b.title || ""));
  });

  return combined;
}

export function getAllCourses() {
  const store = readAdminStore();

  const courses = [...BASE_COURSES];

  // Dynamically add any levels from database that aren't in BASE_COURSES (such as Algorithm Lab levels)
  if (dbCurriculumCache.tracks?.length > 0) {
    for (const track of dbCurriculumCache.tracks) {
      if (!Array.isArray(track.levels)) continue;
      for (const level of track.levels) {
        if (!courses.some((c) => c.id === level.slug)) {
          const groupName =
            track.slug === "web-creator" || track.slug === "web-development"
              ? "Web"
              : track.slug === "cpp-developer"
              ? "C++"
              : track.slug === "algorithm-master"
              ? "Algorithms"
              : track.title;

          courses.push({
            id: level.slug,
            dbId: level.id,
            title: level.title,
            subtitle: level.subtitle || "",
            description: level.description || "",
            group: groupName,
            code: groupName.slice(0, 3).toUpperCase(),
            accent: level.accent || "#a855f7",
            secondaryAccent: "#c084fc",
            route: `/student/algorithm-lab?sector=${level.slug}`,
            defaultLanguage: "javascript",
          });
        }
      }
    }
  }

  return courses.map((course) => {
    const overlay = sanitizeOverlay(store.courses[course.id]);
    const baseLessons = getBaseLessonsForCourse(course.id);
    const currentLessons = getCourseLessons(course.id);
    const hasChanges =
      overlay.added.length > 0 ||
      Object.keys(overlay.edited).length > 0 ||
      overlay.deleted.length > 0;

    return {
      ...course,
      baseLessonCount: baseLessons.length,
      lessonCount: currentLessons.length,
      hasChanges,
      isDatabaseSynced: dbCurriculumCache.isSynced === true,
      changeCounts: {
        added: overlay.added.length,
        edited: Object.keys(overlay.edited).length,
        deleted: overlay.deleted.length,
      },
    };
  });
}

export function getCourseById(courseId) {
  const courses = getAllCourses();
  return courses.find((c) => c.id === courseId) || null;
}

/* ==========================================================================
   CRUD OPERATIONS (FRONTEND OVERLAY)
   ========================================================================== */

/**
 * Generate a unique, stable ID for new lessons
 */
export function generateLessonId(courseId, title = "") {
  const prefix = courseId.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const slugifiedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 16)
    .replace(/^-|-$/g, "");
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `custom-${prefix}-${slugifiedTitle ? `${slugifiedTitle}-` : ""}${time}-${rand}`;
}

/**
 * Add a new lesson to a course
 */
export function addLesson(courseId, lessonInput) {
  if (!courseId) throw new Error("A courseId is required to add a lesson.");
  if (!lessonInput?.title?.trim()) throw new Error("Lesson title is required.");

  const id = lessonInput.id || generateLessonId(courseId, lessonInput.title);
  const slug = (
    lessonInput.slug ||
    lessonInput.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    id
  ).trim();

  const currentLessons = getCourseLessons(courseId);
  const nextOrder =
    Number.isFinite(Number(lessonInput.order)) && Number(lessonInput.order) > 0
      ? Number(lessonInput.order)
      : currentLessons.length + 1;

  const newLesson = {
    id,
    slug,
    title: lessonInput.title.trim(),
    subtitle: (lessonInput.subtitle || "").trim(),
    description: (lessonInput.description || "").trim(),
    order: nextOrder,
    xp: Number.isFinite(Number(lessonInput.xp)) ? Math.max(0, Number(lessonInput.xp)) : 50,
    estimatedMinutes: Number.isFinite(Number(lessonInput.estimatedMinutes))
      ? Math.max(1, Number(lessonInput.estimatedMinutes))
      : 8,
    difficulty: (lessonInput.difficulty || "beginner").toLowerCase(),
    status: (lessonInput.status || "published").toLowerCase(),
    code: lessonInput.code || "",
    blocks: Array.isArray(lessonInput.blocks) && lessonInput.blocks.length > 0
      ? lessonInput.blocks
      : [
          {
            id: `${id}-block-text`,
            type: "text",
            title: lessonInput.title.trim(),
            content: lessonInput.description?.trim() || "Explore this lesson concept and practice code.",
          },
          ...(lessonInput.code?.trim()
            ? [
                {
                  id: `${id}-block-code`,
                  type: "code",
                  language: lessonInput.language || "javascript",
                  code: lessonInput.code,
                },
              ]
            : []),
        ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isUserCreated: true,
  };

  updateCourseOverlay(courseId, (overlay) => ({
    ...overlay,
    added: [...overlay.added, newLesson],
    deleted: overlay.deleted.filter((dId) => dId !== id),
  }));

  return newLesson;
}

/**
 * Edit an existing lesson (either base or custom)
 */
export function updateLesson(courseId, lessonId, updates) {
  if (!courseId || !lessonId) {
    throw new Error("Both courseId and lessonId are required to update.");
  }

  const existingLessons = getCourseLessons(courseId);
  const target = existingLessons.find((l) => l.id === lessonId);
  if (!target) {
    throw new Error(`Lesson "${lessonId}" not found in course "${courseId}".`);
  }

  const sanitizedUpdates = { ...updates, updatedAt: new Date().toISOString() };
  if (typeof sanitizedUpdates.order !== "undefined") {
    sanitizedUpdates.order = Number(sanitizedUpdates.order) || target.order;
  }
  if (typeof sanitizedUpdates.xp !== "undefined") {
    sanitizedUpdates.xp = Math.max(0, Number(sanitizedUpdates.xp) || 0);
  }
  if (typeof sanitizedUpdates.estimatedMinutes !== "undefined") {
    sanitizedUpdates.estimatedMinutes = Math.max(1, Number(sanitizedUpdates.estimatedMinutes) || 1);
  }

  updateCourseOverlay(courseId, (overlay) => {
    const isAdded = overlay.added.some((l) => l.id === lessonId);

    if (isAdded) {
      // Update custom lesson in added array
      const nextAdded = overlay.added.map((item) =>
        item.id === lessonId ? { ...item, ...sanitizedUpdates } : item
      );
      return { ...overlay, added: nextAdded };
    }

    // Base lesson: merge in edited dictionary
    const prevEdits = overlay.edited[lessonId] || {};
    return {
      ...overlay,
      edited: {
        ...overlay.edited,
        [lessonId]: {
          ...prevEdits,
          ...sanitizedUpdates,
        },
      },
    };
  });

  return { ...target, ...sanitizedUpdates };
}

/**
 * Delete a lesson (with undo snapshot returned)
 */
export function deleteLesson(courseId, lessonId) {
  if (!courseId || !lessonId) {
    throw new Error("Both courseId and lessonId are required to delete.");
  }

  const currentLessons = getCourseLessons(courseId);
  const targetLesson = currentLessons.find((l) => l.id === lessonId);
  if (!targetLesson) {
    throw new Error(`Lesson "${lessonId}" not found in course "${courseId}".`);
  }

  const overlay = getCourseOverlay(courseId);
  const wasAdded = overlay.added.some((l) => l.id === lessonId);

  updateCourseOverlay(courseId, (curr) => {
    const nextAdded = curr.added.filter((l) => l.id !== lessonId);
    const nextEdited = { ...curr.edited };
    delete nextEdited[lessonId];

    const nextDeleted = curr.deleted.includes(lessonId)
      ? curr.deleted
      : [...curr.deleted, lessonId];

    return {
      added: nextAdded,
      edited: nextEdited,
      deleted: nextDeleted,
    };
  });

  return {
    success: true,
    deletedLesson: targetLesson,
    courseId,
    wasAdded,
  };
}

/**
 * Undo deletion: restores a lesson snapshot
 */
export function undoDeleteLesson(courseId, deletedSnapshot) {
  if (!courseId || !deletedSnapshot?.id) {
    throw new Error("Invalid undo deletion arguments.");
  }

  const lessonId = deletedSnapshot.id;

  updateCourseOverlay(courseId, (curr) => {
    const nextDeleted = curr.deleted.filter((id) => id !== lessonId);
    let nextAdded = curr.added;

    if (deletedSnapshot.isUserCreated && !curr.added.some((l) => l.id === lessonId)) {
      nextAdded = [...curr.added, deletedSnapshot];
    }

    return {
      ...curr,
      added: nextAdded,
      deleted: nextDeleted,
    };
  });

  return deletedSnapshot;
}

/**
 * Reset a course to pristine baseline data
 */
export function resetCourseOverlay(courseId) {
  updateCourseOverlay(courseId, () => ({
    added: [],
    edited: {},
    deleted: [],
  }));
}

/**
 * Reset all courses back to default
 */
export function resetAllAdminOverlays() {
  writeAdminStore(createEmptyStore());
}

/* ==========================================================================
   LIVE DATABASE OPERATIONS (POSTGRESQL SYNCHRONIZATION)
   ========================================================================== */

/**
 * Update an existing lesson directly in PostgreSQL database.
 */
export async function updateLessonInDB(courseId, lessonId, updates) {
  if (!courseId || !lessonId) {
    throw new Error("Both courseId and lessonId are required to update.");
  }

  // 1. Send update to backend PostgreSQL
  const dbLesson = await apiRequest(`/learning/admin/lessons/${lessonId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  // Extract code from blocks if needed
  let code = dbLesson?.code || updates?.code || "";
  if (!code && Array.isArray(dbLesson?.blocks)) {
    const codeBlock = dbLesson.blocks.find(
      (b) => b && (b.type === "code" || typeof b.code === "string")
    );
    if (codeBlock) code = codeBlock.code;
  }

  // 2. Update live in-memory cache
  if (dbLesson) {
    const levelKey = courseId;
    if (dbCurriculumCache.levelsBySlug[levelKey]) {
      const lessons = dbCurriculumCache.levelsBySlug[levelKey].lessons;
      const idx = lessons.findIndex((l) => l.id === lessonId || l.slug === lessonId);
      const updatedItem = {
        ...dbLesson,
        code,
        levelSlug: levelKey,
        isDatabaseBacked: true,
      };

      if (idx >= 0) {
        lessons[idx] = updatedItem;
      } else {
        lessons.push(updatedItem);
      }
      dbCurriculumCache.lessonsById[dbLesson.id] = updatedItem;
      if (dbLesson.slug) dbCurriculumCache.lessonsBySlug[dbLesson.slug] = updatedItem;
    }
  }

  // 3. Keep local overlay in sync if present
  try {
    updateLesson(courseId, lessonId, updates);
  } catch {
    // Ignore overlay errors when using live DB
  }

  // 4. Broadcast update to UI listeners
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ADMIN_EVENT_NAME, { detail: { lessonId, updates, dbLesson } })
    );
    window.dispatchEvent(new Event("codeland:update"));
  }

  return dbLesson;
}

/**
 * Create a new lesson directly in PostgreSQL database.
 */
export async function createLessonInDB(courseId, lessonData) {
  if (!courseId) {
    throw new Error("courseId is required to create a lesson.");
  }

  // 1. Send create request to backend PostgreSQL
  const createdDbLesson = await apiRequest(`/learning/admin/levels/${courseId}/lessons`, {
    method: "POST",
    body: JSON.stringify(lessonData),
  });

  let code = createdDbLesson?.code || lessonData?.code || "";
  if (!code && Array.isArray(createdDbLesson?.blocks)) {
    const codeBlock = createdDbLesson.blocks.find(
      (b) => b && (b.type === "code" || typeof b.code === "string")
    );
    if (codeBlock) code = codeBlock.code;
  }

  // 2. Update live in-memory cache
  if (createdDbLesson && dbCurriculumCache.levelsBySlug[courseId]) {
    const newItem = {
      ...createdDbLesson,
      code,
      levelSlug: courseId,
      isDatabaseBacked: true,
    };
    dbCurriculumCache.levelsBySlug[courseId].lessons.push(newItem);
    dbCurriculumCache.lessonsById[createdDbLesson.id] = newItem;
    if (createdDbLesson.slug) dbCurriculumCache.lessonsBySlug[createdDbLesson.slug] = newItem;
  }

  // 3. Keep local overlay updated
  try {
    addLesson(courseId, createdDbLesson || lessonData);
  } catch {
    // Ignore
  }

  // 4. Broadcast
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ADMIN_EVENT_NAME, { detail: { created: createdDbLesson } })
    );
    window.dispatchEvent(new Event("codeland:update"));
  }

  return createdDbLesson;
}

/**
 * Delete a lesson directly from PostgreSQL database.
 */
export async function deleteLessonInDB(courseId, lessonId) {
  if (!courseId || !lessonId) {
    throw new Error("Both courseId and lessonId are required to delete.");
  }

  // 1. Send DELETE to backend PostgreSQL
  const result = await apiRequest(`/learning/admin/lessons/${lessonId}`, {
    method: "DELETE",
  });

  // 2. Remove from live cache
  if (dbCurriculumCache.levelsBySlug[courseId]) {
    dbCurriculumCache.levelsBySlug[courseId].lessons = dbCurriculumCache.levelsBySlug[
      courseId
    ].lessons.filter((l) => l.id !== lessonId && l.slug !== lessonId);
  }
  delete dbCurriculumCache.lessonsById[lessonId];
  delete dbCurriculumCache.lessonsBySlug[lessonId];

  // 3. Local overlay delete
  try {
    deleteLesson(courseId, lessonId);
  } catch {
    // Ignore
  }

  // 4. Broadcast
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ADMIN_EVENT_NAME, { detail: { deleted: lessonId } })
    );
    window.dispatchEvent(new Event("codeland:update"));
  }

  return result;
}

/* ==========================================================================
   METRICS & SYSTEM STATS
   ========================================================================== */

export function getAdminSummary() {
  const store = readAdminStore();
  const allCourses = getAllCourses();

  let totalLessons = 0;
  let totalAdded = 0;
  let totalEdited = 0;
  let totalDeleted = 0;
  let modifiedCoursesCount = 0;

  for (const c of allCourses) {
    totalLessons += c.lessonCount;
    const overlay = sanitizeOverlay(store.courses[c.id]);
    totalAdded += overlay.added.length;
    totalEdited += Object.keys(overlay.edited).length;
    totalDeleted += overlay.deleted.length;
    if (overlay.added.length > 0 || Object.keys(overlay.edited).length > 0 || overlay.deleted.length > 0) {
      modifiedCoursesCount += 1;
    }
  }

  return {
    totalCourses: allCourses.length,
    totalLessons,
    modifiedCoursesCount,
    totalAdded,
    totalEdited,
    totalDeleted,
    hasAnyModifications: modifiedCoursesCount > 0,
    isDatabaseSynced: dbCurriculumCache.isSynced === true,
    lastSync: dbCurriculumCache.lastSync,
  };
}

/* ==========================================================================
   REACT HOOKS
   ========================================================================== */

import { useState, useEffect, useSyncExternalStore } from "react";

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ADMIN_EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  window.addEventListener("codeland:update", callback);

  return () => {
    window.removeEventListener(ADMIN_EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
    window.removeEventListener("codeland:update", callback);
  };
}

let storeSnapshotCache = null;
let rawStoreSnapshotString = "";

function getSnapshot() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem(ADMIN_STORAGE_KEY) || "{}"
      : "{}";
    if (raw !== rawStoreSnapshotString || !storeSnapshotCache) {
      rawStoreSnapshotString = raw;
      storeSnapshotCache = readAdminStore();
    }
    return storeSnapshotCache;
  } catch {
    return memoryStoreFallback || createEmptyStore();
  }
}

export function useAdminStore() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return store;
}

export function useCourseLessons(courseId) {
  useAdminStore();
  const [lessons, setLessons] = useState(() => getCourseLessons(courseId));

  useEffect(() => {
    setLessons(getCourseLessons(courseId));
  }, [courseId]);

  return lessons;
}
