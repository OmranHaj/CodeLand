import { useEffect, useMemo, useState } from "react";
import LessonAnimation from "../../components/Learning/animations/LessonAnimation";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Eye,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  completeWebWorldLevel,
  updateWebWorldLevelProgress,
} from "../../data/webWorldLevels";

import { getLevelContent } from "../../services/learningContentService";

import LessonRobot from "../../components/Learning/LessonRobot";

import styles from "./HTMLFoundations.module.css";

const LEVEL_ID = "html-foundations";

/* ====================================================== */
/* USER */
/* ====================================================== */

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("codeland_current_user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

/* ====================================================== */
/* LEARNING PROGRESS STORAGE */
/* ====================================================== */

function getLearningProgressKey(userId) {
  return `codeland_learning_progress_${userId}_${LEVEL_ID}`;
}

function getDefaultProgress() {
  return {
    completedLessonIds: [],
    completedChallengeIds: [],
    xp: 0,
    drafts: {},
    lastActiveUnitId: null,
  };
}

function loadLearningProgress(userId) {
  try {
    const saved = localStorage.getItem(getLearningProgressKey(userId));

    if (!saved) {
      return getDefaultProgress();
    }

    const parsed = JSON.parse(saved);

    const xp = Number(parsed.xp);

    return {
      ...getDefaultProgress(),
      ...parsed,

      completedLessonIds: Array.isArray(parsed.completedLessonIds)
        ? [...new Set(parsed.completedLessonIds)]
        : [],

      completedChallengeIds: Array.isArray(parsed.completedChallengeIds)
        ? [...new Set(parsed.completedChallengeIds)]
        : [],

      xp: Number.isFinite(xp) ? Math.max(0, xp) : 0,

      drafts:
        parsed.drafts && typeof parsed.drafts === "object" ? parsed.drafts : {},
    };
  } catch {
    return getDefaultProgress();
  }
}

function saveLearningProgress(userId, progress) {
  try {
    localStorage.setItem(
      getLearningProgressKey(userId),
      JSON.stringify(progress),
    );
  } catch (error) {
    console.error("[CodeLand] Unable to save HTML learning progress:", error);
  }
}

function sanitizeLearningProgress(progress, content) {
  const lessonIds = new Set(
    (content?.lessons || []).map((lesson) => lesson.id),
  );

  const challengeIds = new Set(
    (content?.challenges || []).map((challenge) => challenge.id),
  );

  const validUnitIds = new Set([...lessonIds, ...challengeIds]);

  const completedLessonIds = [
    ...new Set(progress.completedLessonIds || []),
  ].filter((id) => lessonIds.has(id));

  const completedChallengeIds = [
    ...new Set(progress.completedChallengeIds || []),
  ].filter((id) => challengeIds.has(id));

  const drafts = Object.fromEntries(
    Object.entries(progress.drafts || {}).filter(([unitId]) =>
      validUnitIds.has(unitId),
    ),
  );

  const xp = Number(progress.xp);

  return {
    ...getDefaultProgress(),
    ...progress,
    completedLessonIds,
    completedChallengeIds,
    xp: Number.isFinite(xp) ? Math.max(0, xp) : 0,
    drafts,
    lastActiveUnitId: validUnitIds.has(progress.lastActiveUnitId)
      ? progress.lastActiveUnitId
      : null,
  };
}

/* ====================================================== */
/* HTML VALIDATION */
/* ====================================================== */

function createDocument(code) {
  const parser = new DOMParser();

  return parser.parseFromString(String(code || ""), "text/html");
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim().toLowerCase();
}

function runValidation(code, validation) {
  if (!validation) {
    return {
      passed: true,
      message: "Looks good!",
    };
  }

  const document = createDocument(code);

  switch (validation.type) {
    case "htmlContainsText": {
      const elements = Array.from(
        document.querySelectorAll(validation.selector),
      );

      if (!elements.length) {
        return {
          passed: false,
          message: `Add a ${validation.selector} element first.`,
        };
      }

      const expectedText = normalizeText(validation.expectedText);

      const matchingElement = elements.find((element) =>
        normalizeText(element.textContent).includes(expectedText),
      );

      return {
        passed: Boolean(matchingElement),

        message: matchingElement
          ? "Perfect! You got it."
          : `Make sure your ${validation.selector} contains "${validation.expectedText}".`,
      };
    }

    case "htmlElementExists": {
      const element = document.querySelector(validation.selector);

      return {
        passed: Boolean(element),

        message: element
          ? "Nice work!"
          : `Your page still needs a ${validation.selector} element.`,
      };
    }

    case "htmlMinimumElements": {
      const elements = document.querySelectorAll(validation.selector);

      const passed = elements.length >= validation.minimum;

      return {
        passed,

        message: passed
          ? "Great job!"
          : `Add at least ${validation.minimum} ${validation.selector} elements.`,
      };
    }

    case "htmlMultipleElementsExist": {
      const missing = validation.selectors.filter(
        (selector) => !document.querySelector(selector),
      );

      return {
        passed: missing.length === 0,

        message:
          missing.length === 0
            ? "Everything is in place!"
            : `Still missing: ${missing.join(", ")}`,
      };
    }

    default:
      console.warn("[CodeLand] Unknown validation type:", validation.type);

      return {
        passed: false,
        message: "This mission has an unsupported validation rule.",
      };
  }
}

/* ====================================================== */
/* PREVIEW DOCUMENT */
/* ====================================================== */

function createPreviewDocument(code) {
  const normalized = code.trim().toLowerCase();

  if (normalized.includes("<!doctype") || normalized.includes("<html")) {
    return code;
  }

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />

    <style>
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 28px;
        font-family:
          Inter,
          system-ui,
          sans-serif;
        background: #ffffff;
        color: #151827;
      }

      img {
        max-width: 100%;
        border-radius: 12px;
      }

      button,
      input {
        font: inherit;
      }

      a {
        color: #6558ff;
      }
    </style>
  </head>

  <body>
    ${code}
  </body>
</html>
`;
}

/* ====================================================== */
/* MAIN PAGE */
/* ====================================================== */

function HTMLFoundations() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => getCurrentUser(), []);

  const userId = currentUser?.id || currentUser?.email || "guest";

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  const [content, setContent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  const [learningProgress, setLearningProgress] = useState(() =>
    loadLearningProgress(userId),
  );

  const [activeUnitId, setActiveUnitId] = useState(null);

  const [editorCode, setEditorCode] = useState("");

  const [result, setResult] = useState(null);

  const [hintIndex, setHintIndex] = useState(-1);

  const [labTab, setLabTab] = useState("code");

  const [levelComplete, setLevelComplete] = useState(false);

  const [robotReaction, setRobotReaction] = useState({
    type: "idle",
    key: 0,
  });

  const [feedbackFx, setFeedbackFx] = useState({
    type: "idle",
    key: 0,
  });

  const [xpToast, setXpToast] = useState(null);

  const [showHintPrompt, setShowHintPrompt] = useState(false);

  const triggerRobotReaction = (type) => {
    setRobotReaction((current) => ({
      type,
      key: current.key + 1,
    }));
  };

  const resetRobotReaction = () => {
    setRobotReaction((current) => ({
      type: "idle",
      key: current.key,
    }));
  };

  const triggerFeedbackFx = (type) => {
    setFeedbackFx((current) => ({
      type,
      key: current.key + 1,
    }));
  };

  const clearFeedbackFx = () => {
    setFeedbackFx((current) => ({
      type: "idle",
      key: current.key,
    }));
  };

  const showXpReward = (amount) => {
    if (!amount) {
      return;
    }

    setXpToast((current) => ({
      amount,
      key: (current?.key || 0) + 1,
    }));
  };

  useEffect(() => {
    if (!xpToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setXpToast(null);
    }, 1900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [xpToast?.key]);

  /* ==================================================== */
  /* LOAD CONTENT */
  /* ==================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        setLoading(true);

        const data = await getLevelContent(LEVEL_ID);

        if (cancelled) {
          return;
        }

        setContent(data);
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(error?.message || "Unable to load this level.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==================================================== */
  /* UNITS */
  /* ==================================================== */

  const units = useMemo(() => {
    if (!content) {
      return [];
    }

    const lessons = content.lessons.map((lesson) => ({
      kind: "lesson",
      id: lesson.id,
      data: lesson,
    }));

    const challenges = content.challenges.map((challenge) => ({
      kind: "challenge",
      id: challenge.id,
      data: challenge,
    }));

    return [...lessons, ...challenges];
  }, [content]);

  const isCompleted = (unit) => {
    if (!unit) {
      return false;
    }

    if (unit.kind === "lesson") {
      return learningProgress.completedLessonIds.includes(unit.id);
    }

    return learningProgress.completedChallengeIds.includes(unit.id);
  };

  const isUnlocked = () => {
    return true;
  };

  const activeUnit = useMemo(
    () => units.find((unit) => unit.id === activeUnitId) || null,
    [units, activeUnitId],
  );

  useEffect(() => {
    if (!content) {
      return;
    }

    setLearningProgress((current) =>
      sanitizeLearningProgress(current, content),
    );
  }, [content]);

  /* ==================================================== */
  /* SELECT INITIAL UNIT */
  /* ==================================================== */

  useEffect(() => {
    if (!units.length || activeUnitId) {
      return;
    }

    const savedUnitIndex = units.findIndex(
      (unit) => unit.id === learningProgress.lastActiveUnitId,
    );

    const savedUnit = savedUnitIndex >= 0 ? units[savedUnitIndex] : null;

    if (savedUnit && (isUnlocked(savedUnitIndex) || isCompleted(savedUnit))) {
      setActiveUnitId(savedUnit.id);
      return;
    }

    const firstIncomplete = units.find((unit) => !isCompleted(unit));

    setActiveUnitId(
      firstIncomplete?.id ||
        learningProgress.lastActiveUnitId ||
        units[units.length - 1].id,
    );
  }, [units, activeUnitId, learningProgress]);

  useEffect(() => {
    if (!activeUnitId) {
      return;
    }

    setLearningProgress((current) => {
      if (current.lastActiveUnitId === activeUnitId) {
        return current;
      }

      return {
        ...current,
        lastActiveUnitId: activeUnitId,
      };
    });
  }, [activeUnitId]);

  /* ==================================================== */
  /* ACTIVE CODE */
  /* ==================================================== */

  const interactiveBlock = useMemo(() => {
    if (activeUnit?.kind !== "lesson") {
      return null;
    }

    return (
      activeUnit.data.blocks?.find((block) => block.type === "interactive") ||
      null
    );
  }, [activeUnit]);

  const starterCode = useMemo(() => {
    if (!activeUnit) {
      return "";
    }

    if (activeUnit.kind === "challenge") {
      return activeUnit.data.starterCode || "";
    }

    return interactiveBlock?.starterCode || "";
  }, [activeUnit, interactiveBlock]);

  useEffect(() => {
    if (!activeUnit) {
      return;
    }

    const savedDraft = learningProgress.drafts[activeUnit.id];

    setEditorCode(savedDraft ?? starterCode);

    setResult(null);
    setHintIndex(-1);
    setShowHintPrompt(false);
    clearFeedbackFx();
    resetRobotReaction();
  }, [activeUnit?.id, starterCode]);

  /* ==================================================== */
  /* SAVE LOCAL LEARNING STATE */
  /* ==================================================== */

  useEffect(() => {
    saveLearningProgress(userId, learningProgress);
  }, [learningProgress, userId]);

  /* ==================================================== */
  /* TOTAL PROGRESS */
  /* ==================================================== */

  const completedCount =
    learningProgress.completedLessonIds.length +
    learningProgress.completedChallengeIds.length;

  const totalCount = units.length;

  const progressPercent = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  /* ==================================================== */
  /* CODE CHANGE */
  /* ==================================================== */

  const handleCodeChange = (event) => {
    const value = event.target.value;

    setEditorCode(value);
    setResult(null);
    setShowHintPrompt(false);
    clearFeedbackFx();
    resetRobotReaction();

    if (!activeUnit) {
      return;
    }

    setLearningProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: value,
      },
    }));
  };

  /* ==================================================== */
  /* RESET CODE */
  /* ==================================================== */

  const handleResetCode = () => {
    if (!activeUnit) {
      return;
    }

    setEditorCode(starterCode);

    setResult(null);
    setShowHintPrompt(false);
    clearFeedbackFx();
    resetRobotReaction();

    setLearningProgress((current) => {
      const drafts = {
        ...current.drafts,
      };

      delete drafts[activeUnit.id];

      return {
        ...current,
        drafts,
      };
    });
  };

  /* ==================================================== */
  /* COMPLETE UNIT */
  /* ==================================================== */

  const completeUnit = (unit) => {
    if (!unit) {
      return 0;
    }

    const alreadyCompleted = isCompleted(unit);

    const reward = alreadyCompleted ? 0 : Number(unit.data.xp) || 0;

    const next = {
      ...learningProgress,
      completedLessonIds: [...learningProgress.completedLessonIds],
      completedChallengeIds: [...learningProgress.completedChallengeIds],
      xp: Number(learningProgress.xp) + reward,
    };

    if (unit.kind === "lesson" && !next.completedLessonIds.includes(unit.id)) {
      next.completedLessonIds.push(unit.id);
    }

    if (
      unit.kind === "challenge" &&
      !next.completedChallengeIds.includes(unit.id)
    ) {
      next.completedChallengeIds.push(unit.id);
    }

    const nextCompletedCount =
      next.completedLessonIds.length + next.completedChallengeIds.length;

    const nextPercent = totalCount
      ? Math.round((nextCompletedCount / totalCount) * 100)
      : 0;

    setLearningProgress(next);

    if (nextPercent >= 100) {
      completeWebWorldLevel(userId, LEVEL_ID);
    } else {
      updateWebWorldLevelProgress(userId, LEVEL_ID, nextPercent);
    }

    return reward;
  };

  /* ==================================================== */
  /* CHECK ANSWER */
  /* ==================================================== */

  const handleCheckAnswer = () => {
    if (!activeUnit) {
      return;
    }

    if (activeUnit.kind === "lesson") {
      if (!interactiveBlock) {
        const reward = completeUnit(activeUnit);

        setResult({
          passed: true,
          message: "Lesson complete!",
        });

        setShowHintPrompt(false);
        triggerFeedbackFx("success");
        triggerRobotReaction("happy");
        showXpReward(reward);

        return;
      }

      const validationResult = runValidation(
        editorCode,
        interactiveBlock.validation,
      );

      setResult(validationResult);

      if (validationResult.passed) {
        const reward = completeUnit(activeUnit);

        setShowHintPrompt(false);
        triggerFeedbackFx("success");
        triggerRobotReaction("happy");
        showXpReward(reward);
      } else {
        setShowHintPrompt(hints.length > 0);
        triggerFeedbackFx("error");
        triggerRobotReaction("sad");
      }

      return;
    }

    const requirements = activeUnit.data.requirements || [];

    const requirementResults = requirements.map((requirement) => ({
      ...requirement,

      result: runValidation(editorCode, requirement.validation),
    }));

    const passed = requirementResults.every(
      (requirement) => requirement.result.passed,
    );

    setResult({
      passed,

      message: passed
        ? "Challenge complete!"
        : "A few requirements still need attention.",

      requirements: requirementResults,
    });

    if (passed) {
      const reward = completeUnit(activeUnit);

      setShowHintPrompt(false);
      triggerFeedbackFx("success");
      triggerRobotReaction("happy");
      showXpReward(reward);
    } else {
      setShowHintPrompt(hints.length > 0);
      triggerFeedbackFx("error");
      triggerRobotReaction("sad");
    }
  };

  /* ==================================================== */
  /* NEXT UNIT */
  /* ==================================================== */

  const handleContinue = () => {
    if (!activeUnit || !isCompleted(activeUnit)) {
      return;
    }

    const currentIndex = units.findIndex((unit) => unit.id === activeUnit.id);

    const nextUnit = units[currentIndex + 1];

    if (!nextUnit) {
      setLevelComplete(true);
      return;
    }

    setActiveUnitId(nextUnit.id);

    setResult(null);
    setHintIndex(-1);
    setShowHintPrompt(false);
    clearFeedbackFx();
    setLabTab("code");
    resetRobotReaction();
  };

  /* ==================================================== */
  /* HINT */
  /* ==================================================== */

  const hints =
    activeUnit?.kind === "challenge"
      ? activeUnit.data.hints || []
      : interactiveBlock?.hints || [];

  const handleHint = () => {
    if (!hints.length) {
      return;
    }

    setShowHintPrompt(false);
    setHintIndex((current) => Math.min(current + 1, hints.length - 1));
  };

  /* ==================================================== */
  /* SELECT SIDEBAR UNIT */
  /* ==================================================== */

  const handleSelectUnit = (unit, index) => {
    if (!isUnlocked(index) && !isCompleted(unit)) {
      return;
    }

    setActiveUnitId(unit.id);

    setResult(null);
    setHintIndex(-1);
    setShowHintPrompt(false);
    clearFeedbackFx();
    resetRobotReaction();
  };

  /* ==================================================== */
  /* AUTH */
  /* ==================================================== */

  if (!currentUser) {
    return null;
  }

  /* ==================================================== */
  /* LOADING */
  /* ==================================================== */

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loaderOrb} />

        <span>INITIALIZING HTML FOUNDATIONS</span>
      </main>
    );
  }

  /* ==================================================== */
  /* ERROR */
  /* ==================================================== */

  if (loadError || !content) {
    return (
      <main className={styles.errorPage}>
        <XCircle size={34} />

        <h1>Unable to load the level</h1>

        <p>{loadError}</p>

        <button type="button" onClick={() => navigate("/student/world")}>
          Return to World
        </button>
      </main>
    );
  }

  if (!activeUnit) {
    return null;
  }

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  return (
    <main className={styles.page}>
      {/* =============================================== */}
      {/* TOP BAR */}
      {/* =============================================== */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/student/world")}
          >
            <ArrowLeft size={17} />

            <span>World</span>
          </button>

          <div className={styles.levelIdentity}>
            <div className={styles.htmlMark}>&lt;/&gt;</div>

            <div>
              <span>WORLD 01</span>

              <strong>HTML Foundations</strong>
            </div>
          </div>
        </div>

        <div className={styles.headerProgress}>
          <div className={styles.progressMeta}>
            <span>LEVEL PROGRESS</span>

            <strong>{progressPercent}%</strong>
          </div>

          <div className={styles.progressTrack}>
            <span
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.xpBadge}>
          <Sparkles size={15} />

          <span>{learningProgress.xp}</span>

          <small>XP</small>
        </div>
      </header>

      {xpToast && (
        <div
          key={xpToast.key}
          className={styles.xpToast}
          role="status"
          aria-live="polite"
        >
          <span className={styles.xpToastIcon}>
            <Sparkles size={16} />
          </span>

          <div>
            <strong>+{xpToast.amount} XP</strong>
            <small>MISSION REWARD</small>
          </div>
        </div>
      )}

      {/* =============================================== */}
      {/* WORKSPACE */}
      {/* =============================================== */}

      <div className={styles.workspace}>
        {/* ============================================= */}
        {/* NAVIGATION */}
        {/* ============================================= */}

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>YOUR JOURNEY</span>

            <strong>
              {completedCount}/{totalCount}
            </strong>
          </div>

          <div
            className={`${styles.robotCoach} ${
              robotReaction.type === "happy"
                ? styles.robotCoachHappy
                : robotReaction.type === "sad"
                  ? styles.robotCoachSad
                  : ""
            }`}
          >
            <div className={styles.robotStage}>
              <LessonRobot
                reaction={robotReaction.type}
                reactionKey={robotReaction.key}
              />

              <div className={styles.robotFloor} />
            </div>

            <div className={styles.robotCoachText}>
              <span>CODE BUDDY</span>

              <strong>
                {robotReaction.type === "happy"
                  ? "Great job!"
                  : robotReaction.type === "sad"
                    ? "Try again — you've got this."
                    : "I'm with you."}
              </strong>
            </div>
          </div>

          <div className={styles.sectionLabel}>
            <BookOpen size={14} />
            Lessons
          </div>

          <div className={styles.unitList}>
            {content.lessons.map((lesson, index) => {
              const unit = units[index];

              const completed = isCompleted(unit);

              const unlocked = isUnlocked(index);

              const active = activeUnit.id === lesson.id;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  className={`${styles.unitButton} ${
                    active ? styles.unitButtonActive : ""
                  } ${completed ? styles.unitButtonCompleted : ""}`}
                  disabled={!unlocked && !completed}
                  onClick={() => handleSelectUnit(unit, index)}
                >
                  <span className={styles.unitNumber}>
                    {completed ? (
                      <Check size={13} />
                    ) : !unlocked ? (
                      <LockKeyhole size={12} />
                    ) : (
                      lesson.order
                    )}
                  </span>

                  <div>
                    <strong>{lesson.title}</strong>

                    <small>{lesson.xp} XP</small>
                  </div>

                  {active && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>

          <div className={styles.sectionLabel}>
            <Target size={14} />
            Challenges
          </div>

          <div className={styles.unitList}>
            {content.challenges.map((challenge, challengeIndex) => {
              const index = content.lessons.length + challengeIndex;

              const unit = units[index];

              const completed = isCompleted(unit);

              const unlocked = isUnlocked(index);

              const active = activeUnit.id === challenge.id;

              return (
                <button
                  key={challenge.id}
                  type="button"
                  className={`${styles.unitButton} ${
                    active ? styles.unitButtonActive : ""
                  } ${completed ? styles.unitButtonCompleted : ""}`}
                  disabled={!unlocked && !completed}
                  onClick={() => handleSelectUnit(unit, index)}
                >
                  <span
                    className={`${styles.unitNumber} ${styles.challengeNumber}`}
                  >
                    {completed ? (
                      <Check size={13} />
                    ) : !unlocked ? (
                      <LockKeyhole size={12} />
                    ) : (
                      <Target size={12} />
                    )}
                  </span>

                  <div>
                    <strong>{challenge.title}</strong>

                    <small>{challenge.xp} XP</small>
                  </div>

                  {active && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ============================================= */}
        {/* CONTENT */}
        {/* ============================================= */}

        <section className={styles.lessonArea}>
          <div className={styles.lessonScroll}>
            <div className={styles.lessonEyebrow}>
              {activeUnit.kind === "lesson" ? (
                <>
                  <BookOpen size={14} />
                  LESSON {activeUnit.data.order}
                </>
              ) : (
                <>
                  <Target size={14} />
                  CHALLENGE {activeUnit.data.order}
                </>
              )}
            </div>

            <h1 className={styles.lessonTitle}>{activeUnit.data.title}</h1>

            <p className={styles.lessonSubtitle}>{activeUnit.data.subtitle}</p>

            <div className={styles.lessonMeta}>
              <span>{activeUnit.data.estimatedMinutes} MIN</span>

              <i />

              <span>{activeUnit.data.xp} XP</span>

              <i />

              <span>{activeUnit.data.difficulty}</span>
            </div>

            {activeUnit.kind === "lesson" &&
              activeUnit.data.blocks
                ?.filter((block) => block.type !== "interactive")
                .map((block) => {
                  if (block.type === "animation") {
                    return <LessonAnimation key={block.id} animation={block} />;
                  }
                  if (block.type === "text") {
                    return (
                      <article key={block.id} className={styles.textBlock}>
                        <h2>{block.title}</h2>

                        <p>{block.content}</p>
                      </article>
                    );
                  }

                  if (block.type === "tip") {
                    return (
                      <div key={block.id} className={styles.tipBlock}>
                        <Lightbulb size={19} />

                        <div>
                          <strong>Quick tip</strong>

                          <p>{block.content}</p>
                        </div>
                      </div>
                    );
                  }

                  if (block.type === "code") {
                    return (
                      <div key={block.id} className={styles.exampleCode}>
                        <div className={styles.codeHeader}>
                          <Code2 size={14} />

                          <span>{block.language}</span>
                        </div>

                        <pre>
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    );
                  }

                  return null;
                })}

            {activeUnit.kind === "lesson" && interactiveBlock && (
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}>
                  <Play size={18} fill="currentColor" />
                </div>

                <div>
                  <span>YOUR MISSION</span>

                  <h2>{interactiveBlock.title}</h2>

                  <p>{interactiveBlock.instructions}</p>
                </div>
              </div>
            )}

            {activeUnit.kind === "challenge" && (
              <>
                <div className={styles.challengeIntro}>
                  <Trophy size={24} />

                  <div>
                    <span>BUILD CHALLENGE</span>

                    <p>{activeUnit.data.description}</p>
                  </div>
                </div>

                <div className={styles.requirements}>
                  <span>REQUIREMENTS</span>

                  {activeUnit.data.requirements?.map((requirement) => (
                    <div key={requirement.id} className={styles.requirement}>
                      <CheckCircle2 size={15} />

                      <p>{requirement.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {hints.length > 0 && (
              <div className={styles.hintArea}>
                <button
                  type="button"
                  className={showHintPrompt ? styles.hintPromptActive : ""}
                  onClick={handleHint}
                >
                  <Lightbulb size={15} />
                  {showHintPrompt ? "Try a hint" : "Need a hint?"}
                </button>

                {hintIndex >= 0 && (
                  <div className={styles.hintBubble}>{hints[hintIndex]}</div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ============================================= */}
        {/* LIVE LAB */}
        {/* ============================================= */}

        <section
          key={`lab-${activeUnit.id}-${feedbackFx.key}`}
          className={`${styles.lab} ${
            feedbackFx.type === "success"
              ? styles.labSuccess
              : feedbackFx.type === "error"
                ? styles.labError
                : ""
          }`}
        >
          {feedbackFx.type === "success" && (
            <div
              key={`success-${feedbackFx.key}`}
              className={styles.successBurst}
              aria-hidden="true"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <span
                  key={index}
                  style={{
                    "--particle-index": index,
                  }}
                />
              ))}
            </div>
          )}

          {feedbackFx.type === "error" && (
            <div
              key={`error-${feedbackFx.key}`}
              className={styles.errorFlash}
              aria-hidden="true"
            />
          )}

          <div className={styles.labHeader}>
            <div>
              <span>LIVE LAB</span>

              <strong>HTML Playground</strong>
            </div>

            <button
              type="button"
              className={styles.resetButton}
              onClick={handleResetCode}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          <div className={styles.labTabs}>
            <button
              type="button"
              className={labTab === "code" ? styles.labTabActive : ""}
              onClick={() => setLabTab("code")}
            >
              <Code2 size={14} />
              Code
            </button>

            <button
              type="button"
              className={labTab === "preview" ? styles.labTabActive : ""}
              onClick={() => setLabTab("preview")}
            >
              <Eye size={14} />
              Preview
            </button>
          </div>

          <div className={styles.labBody}>
            {labTab === "code" ? (
              <div className={styles.editor}>
                <div className={styles.lineRail}>
                  {editorCode.split("\n").map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <textarea
                  value={editorCode}
                  onChange={handleCodeChange}
                  spellCheck={false}
                  aria-label="HTML code editor"
                />
              </div>
            ) : (
              <div className={styles.preview}>
                <div className={styles.browserBar}>
                  <i />
                  <i />
                  <i />

                  <span>preview.codeland</span>
                </div>

                <iframe
                  title="HTML live preview"
                  srcDoc={createPreviewDocument(editorCode)}
                  sandbox=""
                />
              </div>
            )}
          </div>

          {/* =========================================== */}
          {/* RESULT */}
          {/* =========================================== */}

          {result && (
            <div
              className={`${styles.result} ${
                result.passed ? styles.resultSuccess : styles.resultError
              }`}
            >
              {result.passed ? (
                <CheckCircle2 size={19} />
              ) : (
                <XCircle size={19} />
              )}

              <div>
                <strong>
                  {result.passed ? "Mission complete!" : "Almost there"}
                </strong>

                <span>{result.message}</span>
              </div>
            </div>
          )}

          {result?.requirements && (
            <div className={styles.requirementResults}>
              {result.requirements.map((requirement) => (
                <div key={requirement.id}>
                  {requirement.result.passed ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  <span>{requirement.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* =========================================== */}
          {/* ACTIONS */}
          {/* =========================================== */}

          <footer className={styles.labFooter}>
            <div>
              <span>
                {activeUnit.kind === "lesson" ? "LESSON" : "CHALLENGE"}
              </span>

              <strong>{activeUnit.data.xp} XP</strong>
            </div>

            {result?.passed ? (
              <button
                type="button"
                className={styles.continueButton}
                onClick={handleContinue}
              >
                Continue
                <ChevronRight size={17} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.checkButton}
                onClick={handleCheckAnswer}
              >
                <Check size={17} />
                Check Answer
              </button>
            )}
          </footer>
        </section>
      </div>

      {/* =============================================== */}
      {/* LEVEL COMPLETE */}
      {/* =============================================== */}

      {levelComplete && (
        <div className={styles.completeOverlay}>
          <div className={styles.completeCard}>
            <div className={styles.completeGlow} />

            <div className={styles.trophyCircle}>
              <Trophy size={38} />
            </div>

            <span>HTML FOUNDATIONS</span>

            <h2>World upgrade complete.</h2>

            <p>
              You mastered the foundations of HTML. Your next destination is now
              unlocked.
            </p>

            <div className={styles.completeStats}>
              <div>
                <strong>100%</strong>

                <span>COMPLETE</span>
              </div>

              <div>
                <strong>{learningProgress.xp}</strong>

                <span>XP EARNED</span>
              </div>

              <div>
                <strong>CSS</strong>

                <span>UNLOCKED</span>
              </div>
            </div>

            <button type="button" onClick={() => navigate("/student/world")}>
              Return to Web World
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default HTMLFoundations;
