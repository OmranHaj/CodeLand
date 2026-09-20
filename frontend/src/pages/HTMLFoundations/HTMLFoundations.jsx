import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Eye,
  FileCode2,
  Lightbulb,
  LockKeyhole,
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
import LessonAnimation from "../../components/Learning/animations/LessonAnimation";

import styles from "./HTMLFoundations.module.css";

const LEVEL_ID = "css-styling";

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

      lastActiveUnitId:
        typeof parsed.lastActiveUnitId === "string"
          ? parsed.lastActiveUnitId
          : null,
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
    console.error("[CodeLand] Unable to save CSS learning progress:", error);
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
/* CSS VALIDATION */
/* ====================================================== */

function normalizeCssValue(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ",")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")");
}

function normalizeSelector(selector = "") {
  return String(selector).trim().replace(/\s+/g, " ");
}

function getStyleRules(css = "") {
  try {
    const documentShell = document.implementation.createHTMLDocument("");
    const styleElement = documentShell.createElement("style");

    styleElement.textContent = String(css || "");
    documentShell.head.appendChild(styleElement);

    const collectedRules = [];

    const collect = (ruleList) => {
      Array.from(ruleList || []).forEach((rule) => {
        if (rule.type === CSSRule.STYLE_RULE) {
          collectedRules.push(rule);
          return;
        }

        if (rule.cssRules) {
          collect(rule.cssRules);
        }
      });
    };

    collect(styleElement.sheet?.cssRules);

    return collectedRules;
  } catch (error) {
    console.warn("[CodeLand] Unable to parse CSS:", error);
    return [];
  }
}

function findStyleRule(css, selector) {
  const expectedSelector = normalizeSelector(selector);

  return getStyleRules(css).find((rule) => {
    const selectors = String(rule.selectorText || "")
      .split(",")
      .map(normalizeSelector);

    return selectors.includes(expectedSelector);
  });
}

function getRulePropertyValue(rule, property) {
  if (!rule?.style) {
    return "";
  }

  let value = rule.style.getPropertyValue(property).trim();

  /*
    Let students use background-color when a challenge asks
    for a styled background, and vice versa.
  */

  if (!value && property === "background") {
    value =
      rule.style.getPropertyValue("background-color").trim() ||
      rule.style.getPropertyValue("background-image").trim();
  }

  if (!value && property === "background-color") {
    value =
      rule.style.getPropertyValue("background-color").trim() ||
      rule.style.getPropertyValue("background").trim();
  }

  return value;
}

function canonicalColor(value) {
  if (!value || typeof window === "undefined") {
    return null;
  }

  const testElement = document.createElement("span");

  testElement.style.position = "fixed";
  testElement.style.pointerEvents = "none";
  testElement.style.opacity = "0";
  testElement.style.color = "";

  testElement.style.color = value;

  if (!testElement.style.color) {
    return null;
  }

  document.body.appendChild(testElement);

  const computedColor = window.getComputedStyle(testElement).color;

  testElement.remove();

  return computedColor;
}

function valuesMatch(property, actualValue, expectedValue) {
  if (
    property === "color" ||
    property === "background-color" ||
    property === "border-color"
  ) {
    const actualColor = canonicalColor(actualValue);
    const expectedColor = canonicalColor(expectedValue);

    if (actualColor && expectedColor) {
      return actualColor === expectedColor;
    }
  }

  return normalizeCssValue(actualValue) === normalizeCssValue(expectedValue);
}

function runCssValidation(css, validation) {
  if (!validation) {
    return {
      passed: true,
      message: "Looks good!",
    };
  }

  const rule = findStyleRule(css, validation.selector);

  if (!rule) {
    return {
      passed: false,
      message: `Add a CSS rule for ${validation.selector}.`,
    };
  }

  if (validation.type === "cssPropertyExists") {
    const value = getRulePropertyValue(rule, validation.property);

    return {
      passed: Boolean(value),
      message: value
        ? `${validation.property} is in place.`
        : `Add ${validation.property} to ${validation.selector}.`,
    };
  }

  if (validation.type === "cssProperty") {
    const value = getRulePropertyValue(rule, validation.property);

    if (!value) {
      return {
        passed: false,
        message: `Add ${validation.property} to ${validation.selector}.`,
      };
    }

    const passed = valuesMatch(
      validation.property,
      value,
      validation.expectedValue,
    );

    return {
      passed,
      message: passed
        ? `${validation.property} looks great.`
        : `Set ${validation.property} to ${validation.expectedValue}.`,
    };
  }

  return {
    passed: false,
    message: "This CSS mission uses an unsupported validation rule.",
  };
}

/* ====================================================== */
/* LIVE PREVIEW */
/* ====================================================== */

function createPreviewDocument(html, css) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <style>
      * {
        box-sizing: border-box;
      }

      html,
      body {
        min-height: 100%;
      }

      body {
        margin: 0;
        padding: 30px;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f6f8ff;
        color: #151827;
      }

      img {
        max-width: 100%;
      }

      button,
      input {
        font: inherit;
      }

      ${css}
    </style>
  </head>

  <body>
    ${html}
  </body>
</html>
`;
}

/* ====================================================== */
/* MAIN PAGE */
/* ====================================================== */

function CSSStyling() {
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

  const [htmlCode, setHtmlCode] = useState("");

  const [cssCode, setCssCode] = useState("");

  const [result, setResult] = useState(null);

  const [hintIndex, setHintIndex] = useState(-1);

  const [labTab, setLabTab] = useState("css");

  const [levelComplete, setLevelComplete] = useState(false);

  const [robotReaction, setRobotReaction] = useState({
    type: "idle",
    key: 0,
  });

  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const [xpToast, setXpToast] = useState(null);

  useEffect(() => {
    if (!feedbackEffect) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackEffect(null);
    }, 900);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedbackEffect?.key]);

  useEffect(() => {
    if (!xpToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setXpToast(null);
    }, 1800);

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

        setLoadError(error?.message || "Unable to load CSS Styling.");
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

  const isUnlocked = (unitIndex) => {
    if (unitIndex === 0) {
      return true;
    }

    return units.slice(0, unitIndex).every((unit) => isCompleted(unit));
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
  /* INITIAL / LAST ACTIVE UNIT */
  /* ==================================================== */

  useEffect(() => {
    if (!units.length || activeUnitId) {
      return;
    }

    const savedUnitIndex = units.findIndex(
      (unit) => unit.id === learningProgress.lastActiveUnitId,
    );

    if (
      savedUnitIndex >= 0 &&
      (isUnlocked(savedUnitIndex) || isCompleted(units[savedUnitIndex]))
    ) {
      setActiveUnitId(units[savedUnitIndex].id);

      return;
    }

    const firstIncomplete = units.find((unit) => !isCompleted(unit));

    setActiveUnitId(
      firstIncomplete?.id ||
        learningProgress.lastActiveUnitId ||
        units[units.length - 1].id,
    );
  }, [units, activeUnitId, learningProgress]);

  /* ==================================================== */
  /* ACTIVE INTERACTIVE CONTENT */
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

  const starterHtml = useMemo(() => {
    if (!activeUnit) {
      return "";
    }

    if (activeUnit.kind === "challenge") {
      return activeUnit.data.starterHtml || "";
    }

    return interactiveBlock?.starterHtml || "";
  }, [activeUnit, interactiveBlock]);

  const starterCss = useMemo(() => {
    if (!activeUnit) {
      return "";
    }

    if (activeUnit.kind === "challenge") {
      return activeUnit.data.starterCss || "";
    }

    return interactiveBlock?.starterCss || "";
  }, [activeUnit, interactiveBlock]);

  /* ==================================================== */
  /* LOAD UNIT DRAFT */
  /* ==================================================== */

  useEffect(() => {
    if (!activeUnit) {
      return;
    }

    const savedDraft = learningProgress.drafts[activeUnit.id];

    setHtmlCode(savedDraft?.html ?? starterHtml);

    setCssCode(savedDraft?.css ?? starterCss);

    setResult(null);
    setHintIndex(-1);
    setLabTab("css");
    setFeedbackEffect(null);

    setRobotReaction((current) => ({
      type: "idle",
      key: current.key + 1,
    }));
  }, [activeUnit?.id, starterHtml, starterCss]);

  /* ==================================================== */
  /* SAVE PROGRESS */
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
  /* REACTION / FEEDBACK */
  /* ==================================================== */

  const triggerRobotReaction = (type) => {
    setRobotReaction((current) => ({
      type,
      key: current.key + 1,
    }));
  };

  const triggerFeedback = (type) => {
    setFeedbackEffect((current) => ({
      type,
      key: (current?.key || 0) + 1,
    }));
  };

  const showXpToast = (amount) => {
    if (!amount) {
      return;
    }

    setXpToast((current) => ({
      amount,
      key: (current?.key || 0) + 1,
    }));
  };

  /* ==================================================== */
  /* CSS CHANGE */
  /* ==================================================== */

  const handleCssChange = (event) => {
    const value = event.target.value;

    setCssCode(value);
    setResult(null);

    if (!activeUnit) {
      return;
    }

    setLearningProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: {
          html: htmlCode,
          css: value,
        },
      },

      lastActiveUnitId: activeUnit.id,
    }));
  };

  /* ==================================================== */
  /* RESET CODE */
  /* ==================================================== */

  const handleResetCode = () => {
    if (!activeUnit) {
      return;
    }

    setHtmlCode(starterHtml);
    setCssCode(starterCss);

    setResult(null);
    setHintIndex(-1);
    setLabTab("css");

    setLearningProgress((current) => {
      const drafts = {
        ...current.drafts,
      };

      delete drafts[activeUnit.id];

      return {
        ...current,
        drafts,
        lastActiveUnitId: activeUnit.id,
      };
    });

    setRobotReaction((current) => ({
      type: "idle",
      key: current.key + 1,
    }));
  };

  /* ==================================================== */
  /* COMPLETE UNIT */
  /* ==================================================== */

  const completeUnit = (unit) => {
    if (!unit) {
      return false;
    }

    const alreadyCompleted = isCompleted(unit);

    const reward = alreadyCompleted ? 0 : Number(unit.data.xp) || 0;

    const next = {
      ...learningProgress,
      completedLessonIds: [...learningProgress.completedLessonIds],
      completedChallengeIds: [...learningProgress.completedChallengeIds],
      xp: Number(learningProgress.xp) + reward,
      lastActiveUnitId: unit.id,
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

    return !alreadyCompleted;
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
        const newlyCompleted = completeUnit(activeUnit);

        setResult({
          passed: true,
          message: "Lesson complete!",
        });

        triggerRobotReaction("happy");

        triggerFeedback("success");

        if (newlyCompleted) {
          showXpToast(activeUnit.data.xp);
        }

        return;
      }

      const validations = Array.isArray(interactiveBlock.validation)
        ? interactiveBlock.validation
        : [interactiveBlock.validation].filter(Boolean);

      const validationResults = validations.map((validation) =>
        runCssValidation(cssCode, validation),
      );

      const passed = validationResults.every((item) => item.passed);

      const failedResult = validationResults.find((item) => !item.passed);

      setResult({
        passed,

        message: passed
          ? "Your CSS matches the mission!"
          : failedResult?.message || "A few CSS rules still need attention.",

        checks: validationResults,
      });

      triggerRobotReaction(passed ? "happy" : "sad");

      triggerFeedback(passed ? "success" : "error");

      if (passed) {
        const newlyCompleted = completeUnit(activeUnit);

        if (newlyCompleted) {
          showXpToast(activeUnit.data.xp);
        }
      }

      return;
    }

    const requirements = activeUnit.data.requirements || [];

    const requirementResults = requirements.map((requirement) => ({
      ...requirement,

      result: runCssValidation(cssCode, requirement.validation),
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

    triggerRobotReaction(passed ? "happy" : "sad");

    triggerFeedback(passed ? "success" : "error");

    if (passed) {
      const newlyCompleted = completeUnit(activeUnit);

      if (newlyCompleted) {
        showXpToast(activeUnit.data.xp);
      }
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

    setLearningProgress((current) => ({
      ...current,
      lastActiveUnitId: nextUnit.id,
    }));

    setResult(null);
    setHintIndex(-1);
    setLabTab("css");
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

    setHintIndex((current) => Math.min(current + 1, hints.length - 1));
  };

  /* ==================================================== */
  /* SELECT UNIT */
  /* ==================================================== */

  const handleSelectUnit = (unit, index) => {
    if (!isUnlocked(index) && !isCompleted(unit)) {
      return;
    }

    setActiveUnitId(unit.id);

    setLearningProgress((current) => ({
      ...current,
      lastActiveUnitId: unit.id,
    }));

    setResult(null);
    setHintIndex(-1);
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

        <span>INITIALIZING CSS STYLING</span>
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

        <h1>Unable to load CSS Styling</h1>

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

  const robotMessage =
    robotReaction.type === "happy"
      ? "That looks awesome!"
      : robotReaction.type === "sad"
        ? "Try one more change."
        : "Let's style it.";

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  return (
    <main className={styles.page}>
      {/* =============================================== */}
      {/* XP TOAST */}
      {/* =============================================== */}

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
            <div className={styles.cssMark}>CSS</div>

            <div>
              <span>WORLD 02</span>

              <strong>CSS Styling</strong>
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

      {/* =============================================== */}
      {/* WORKSPACE */}
      {/* =============================================== */}

      <div className={styles.workspace}>
        {/* ============================================= */}
        {/* SIDEBAR */}
        {/* ============================================= */}

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>YOUR JOURNEY</span>

            <strong>
              {completedCount}/{totalCount}
            </strong>
          </div>

          {/* =========================================== */}
          {/* ROBOT */}
          {/* =========================================== */}

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

              <strong>{robotMessage}</strong>
            </div>
          </div>

          {/* =========================================== */}
          {/* LESSONS */}
          {/* =========================================== */}

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

          {/* =========================================== */}
          {/* CHALLENGES */}
          {/* =========================================== */}

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

            {/* ========================================= */}
            {/* LESSON BLOCKS */}
            {/* ========================================= */}

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

            {/* ========================================= */}
            {/* MISSION */}
            {/* ========================================= */}

            {activeUnit.kind === "lesson" && interactiveBlock && (
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}>
                  <Code2 size={18} />
                </div>

                <div>
                  <span>CSS MISSION</span>

                  <h2>{interactiveBlock.title}</h2>

                  <p>{interactiveBlock.instructions}</p>
                </div>
              </div>
            )}

            {/* ========================================= */}
            {/* CHALLENGE */}
            {/* ========================================= */}

            {activeUnit.kind === "challenge" && (
              <>
                <div className={styles.challengeIntro}>
                  <Trophy size={24} />

                  <div>
                    <span>DESIGN CHALLENGE</span>

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

            {/* ========================================= */}
            {/* HINT */}
            {/* ========================================= */}

            {hints.length > 0 && (
              <div className={styles.hintArea}>
                <button
                  type="button"
                  className={
                    result && !result.passed ? styles.hintPromptActive : ""
                  }
                  onClick={handleHint}
                >
                  <Lightbulb size={15} />

                  {result && !result.passed ? "Try a hint" : "Need a hint?"}
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
          key={feedbackEffect?.key || "lab"}
          className={`${styles.lab} ${
            feedbackEffect?.type === "success"
              ? styles.labSuccess
              : feedbackEffect?.type === "error"
                ? styles.labError
                : ""
          }`}
        >
          {feedbackEffect?.type === "success" && (
            <div
              key={`success-${feedbackEffect.key}`}
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

          {feedbackEffect?.type === "error" && (
            <div
              key={`error-${feedbackEffect.key}`}
              className={styles.errorFlash}
              aria-hidden="true"
            />
          )}

          <div className={styles.labHeader}>
            <div>
              <span>STYLE LAB</span>

              <strong>CSS Playground</strong>
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

          {/* =========================================== */}
          {/* TABS */}
          {/* =========================================== */}

          <div className={styles.labTabs}>
            <button
              type="button"
              className={labTab === "html" ? styles.labTabActive : ""}
              onClick={() => setLabTab("html")}
            >
              <FileCode2 size={14} />
              HTML
            </button>

            <button
              type="button"
              className={labTab === "css" ? styles.labTabActive : ""}
              onClick={() => setLabTab("css")}
            >
              <Code2 size={14} />
              CSS
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

          {/* =========================================== */}
          {/* LAB BODY */}
          {/* =========================================== */}

          <div className={styles.labBody}>
            {labTab === "html" && (
              <div className={styles.editor}>
                <div className={styles.lineRail}>
                  {htmlCode.split("\n").map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <div className={styles.readOnlyEditor}>
                  <div className={styles.readOnlyBadge}>HTML STRUCTURE</div>

                  <textarea
                    value={htmlCode}
                    readOnly
                    spellCheck={false}
                    aria-label="HTML structure"
                  />
                </div>
              </div>
            )}

            {labTab === "css" && (
              <div className={styles.editor}>
                <div className={styles.lineRail}>
                  {cssCode.split("\n").map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <textarea
                  value={cssCode}
                  onChange={handleCssChange}
                  spellCheck={false}
                  aria-label="CSS code editor"
                />
              </div>
            )}

            {labTab === "preview" && (
              <div className={styles.preview}>
                <div className={styles.browserBar}>
                  <i />
                  <i />
                  <i />

                  <span>preview.codeland</span>
                </div>

                <iframe
                  title="CSS live preview"
                  srcDoc={createPreviewDocument(htmlCode, cssCode)}
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
                  {result.passed ? "Style mission complete!" : "Almost there"}
                </strong>

                <span>{result.message}</span>
              </div>
            </div>
          )}

          {/* =========================================== */}
          {/* LESSON CHECK RESULTS */}
          {/* =========================================== */}

          {result?.checks && result.checks.length > 1 && (
            <div className={styles.requirementResults}>
              {result.checks.map((check, index) => (
                <div key={index}>
                  {check.passed ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}

                  <span>{check.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* =========================================== */}
          {/* CHALLENGE RESULTS */}
          {/* =========================================== */}

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
          {/* FOOTER */}
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
                Check CSS
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

            <span>CSS STYLING</span>

            <h2>Your designs are alive.</h2>

            <p>
              You mastered colors, typography, spacing, layouts, responsive
              design and motion. JavaScript Core is now unlocked.
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
                <strong>JS</strong>

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

export default CSSStyling;
