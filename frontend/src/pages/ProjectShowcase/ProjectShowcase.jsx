import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileCode2,
  FileJson2,
  FileText,
  FolderCode,
  Lightbulb,
  LockKeyhole,
  Monitor,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  XCircle,
} from "lucide-react";

import {
  completeWebWorldLevel,
  updateWebWorldLevelProgress,
} from "../../data/webWorldLevels";

import { getLevelContent } from "../../services/learningContentService";

import LessonRobot from "../../components/Learning/LessonRobot";

import styles from "./ProjectShowcase.module.css";

const LEVEL_ID = "project-showcase";

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
/* PROGRESS */
/* ====================================================== */

function getProgressKey(userId) {
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

function loadProgress(userId) {
  try {
    const saved = localStorage.getItem(getProgressKey(userId));

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

function saveProgress(userId, progress) {
  try {
    localStorage.setItem(getProgressKey(userId), JSON.stringify(progress));
  } catch (error) {
    console.error(
      "[CodeLand] Unable to save Project Showcase progress:",
      error,
    );
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
/* FUTURE PROJECT RUNNER */
/* ====================================================== */

/*
  IMPORTANT:

  Student JavaScript is NOT executed in the frontend.

  Later this function can connect to:

  POST /api/code/run

  {
    language: "web-project",
    files: {
      html,
      css,
      javascript
    },
    validation
  }
*/

async function runProjectCode({ files, validation }) {
  void files;
  void validation;

  return {
    connected: false,

    passed: false,

    output: [],

    error: null,

    message: "The CodeLand project runner is not connected yet.",
  };
}

/* ====================================================== */
/* MAIN */
/* ====================================================== */

function ProjectShowcase() {
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

  /* ==================================================== */
  /* CONTENT */
  /* ==================================================== */

  const [content, setContent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");

  /* ==================================================== */
  /* PROGRESS */
  /* ==================================================== */

  const [learningProgress, setLearningProgress] = useState(() =>
    loadProgress(userId),
  );

  /* ==================================================== */
  /* ACTIVE UNIT */
  /* ==================================================== */

  const [activeUnitId, setActiveUnitId] = useState(null);

  /* ==================================================== */
  /* PLAN EDITOR */
  /* ==================================================== */

  const [planCode, setPlanCode] = useState("");

  /* ==================================================== */
  /* PROJECT FILES */
  /* ==================================================== */

  const [projectFiles, setProjectFiles] = useState({
    html: "",
    css: "",
    javascript: "",
  });

  const [activeFile, setActiveFile] = useState("html");

  /* ==================================================== */
  /* LAB */
  /* ==================================================== */

  const [labTab, setLabTab] = useState("editor");

  const [consoleLines, setConsoleLines] = useState([]);

  const [result, setResult] = useState(null);

  const [running, setRunning] = useState(false);

  /* ==================================================== */
  /* HINTS */
  /* ==================================================== */

  const [hintIndex, setHintIndex] = useState(-1);

  /* ==================================================== */
  /* ROBOT */
  /* ==================================================== */

  const [robotReaction, setRobotReaction] = useState({
    type: "idle",
    key: 0,
  });

  const triggerRobotReaction = (type) => {
    setRobotReaction((current) => ({
      type,

      key: current.key + 1,
    }));
  };

  /* ==================================================== */
  /* FEEDBACK */
  /* ==================================================== */

  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const [xpToast, setXpToast] = useState(null);

  const [levelComplete, setLevelComplete] = useState(false);

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

  useEffect(() => {
    if (!feedbackEffect) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedbackEffect(null);
    }, 950);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedbackEffect?.key]);

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

        setLoadError(error?.message || "Unable to load Project Showcase.");
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
  /* SAVE PROGRESS */
  /* ==================================================== */

  useEffect(() => {
    saveProgress(userId, learningProgress);
  }, [userId, learningProgress]);

  /* ==================================================== */
  /* UNITS */
  /* ==================================================== */

  const units = useMemo(() => {
    if (!content) {
      return [];
    }

    const lessons = (content.lessons || []).map((lesson) => ({
      id: lesson.id,

      kind: "lesson",

      data: lesson,
    }));

    const challenges = (content.challenges || []).map((challenge) => ({
      id: challenge.id,

      kind: "challenge",

      data: challenge,
    }));

    return [...lessons, ...challenges];
  }, [content]);

  const lessonCount = content?.lessons?.length || 0;

  const challengeCount = content?.challenges?.length || 0;

  const totalCount = units.length;

  /* ==================================================== */
  /* COMPLETED */
  /* ==================================================== */

  const isCompleted = (unit) => {
    if (!unit) {
      return false;
    }

    if (unit.kind === "lesson") {
      return learningProgress.completedLessonIds.includes(unit.id);
    }

    return learningProgress.completedChallengeIds.includes(unit.id);
  };

  const runnerAvailable = Boolean(content?.execution?.enabled);

  /*
    While the backend runner is offline,
    all Project Showcase areas stay available
    for frontend testing and writing.
  */

  const isUnlocked = (unitIndex) => {
    if (!runnerAvailable) {
      return true;
    }

    if (unitIndex === 0) {
      return true;
    }

    return units.slice(0, unitIndex).every((unit) => isCompleted(unit));
  };

  /* ==================================================== */
  /* ACTIVE UNIT */
  /* ==================================================== */

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

  const activeUnitIndex = activeUnit
    ? units.findIndex((unit) => unit.id === activeUnit.id)
    : -1;

  /* ==================================================== */
  /* INITIAL UNIT */
  /* ==================================================== */

  useEffect(() => {
    if (!units.length || activeUnitId) {
      return;
    }

    const savedUnit = units.find(
      (unit, index) =>
        unit.id === learningProgress.lastActiveUnitId && isUnlocked(index),
    );

    if (savedUnit) {
      setActiveUnitId(savedUnit.id);

      return;
    }

    const firstIncomplete = units.find(
      (unit, index) => !isCompleted(unit) && isUnlocked(index),
    );

    setActiveUnitId(
      firstIncomplete?.id ||
        learningProgress.lastActiveUnitId ||
        units[units.length - 1]?.id ||
        null,
    );
  }, [units, activeUnitId, learningProgress]);

  /* ==================================================== */
  /* ACTIVE DATA */
  /* ==================================================== */

  const mission =
    activeUnit?.kind === "lesson" ? activeUnit.data?.mission : null;

  const hints =
    activeUnit?.kind === "lesson"
      ? mission?.hints || []
      : activeUnit?.data?.hints || [];

  const validation =
    activeUnit?.kind === "lesson"
      ? mission?.validation
      : activeUnit?.data?.validation || [];

  /* ==================================================== */
  /* LOAD DRAFT */
  /* ==================================================== */

  useEffect(() => {
    if (!activeUnit) {
      return;
    }

    const savedDraft = learningProgress.drafts?.[activeUnit.id];

    if (activeUnit.kind === "lesson") {
      setPlanCode(
        typeof savedDraft === "string"
          ? savedDraft
          : mission?.starterCode || "",
      );

      setLabTab("editor");
    } else {
      const starterFiles = activeUnit.data?.starterFiles || {};

      setProjectFiles({
        html: savedDraft?.html ?? starterFiles.html ?? "",

        css: savedDraft?.css ?? starterFiles.css ?? "",

        javascript: savedDraft?.javascript ?? starterFiles.javascript ?? "",
      });

      setActiveFile("html");

      setLabTab("editor");
    }

    setConsoleLines([]);

    setResult(null);

    setHintIndex(-1);

    setRobotReaction((current) => ({
      type: "idle",

      key: current.key + 1,
    }));

    setLearningProgress((current) => {
      if (current.lastActiveUnitId === activeUnit.id) {
        return current;
      }

      return {
        ...current,

        lastActiveUnitId: activeUnit.id,
      };
    });
  }, [activeUnit?.id, mission?.starterCode]);

  /* ==================================================== */
  /* PROGRESS */
  /* ==================================================== */

  const completedCount =
    learningProgress.completedLessonIds.length +
    learningProgress.completedChallengeIds.length;

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  /* ==================================================== */
  /* SELECT UNIT */
  /* ==================================================== */

  const handleSelectUnit = (unit, index) => {
    if (!isUnlocked(index)) {
      return;
    }

    setActiveUnitId(unit.id);
  };

  /* ==================================================== */
  /* PLAN CHANGE */
  /* ==================================================== */

  const handlePlanChange = (event) => {
    const value = event.target.value;

    setPlanCode(value);

    if (!activeUnit) {
      return;
    }

    setLearningProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: value,
      },

      lastActiveUnitId: activeUnit.id,
    }));

    setResult(null);
  };

  /* ==================================================== */
  /* PROJECT FILE CHANGE */
  /* ==================================================== */

  const handleProjectFileChange = (event) => {
    if (!activeUnit) {
      return;
    }

    const value = event.target.value;

    const nextFiles = {
      ...projectFiles,

      [activeFile]: value,
    };

    setProjectFiles(nextFiles);

    setLearningProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: nextFiles,
      },

      lastActiveUnitId: activeUnit.id,
    }));

    setResult(null);
  };

  /* ==================================================== */
  /* RESET */
  /* ==================================================== */

  const handleReset = () => {
    if (!activeUnit) {
      return;
    }

    if (activeUnit.kind === "lesson") {
      setPlanCode(mission?.starterCode || "");
    } else {
      const starterFiles = activeUnit.data?.starterFiles || {};

      setProjectFiles({
        html: starterFiles.html || "",

        css: starterFiles.css || "",

        javascript: starterFiles.javascript || "",
      });

      setActiveFile("html");
    }

    setConsoleLines([]);

    setResult(null);

    setHintIndex(-1);

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

    const nextCompleted =
      next.completedLessonIds.length + next.completedChallengeIds.length;

    const nextPercent = totalCount
      ? Math.round((nextCompleted / totalCount) * 100)
      : 0;

    setLearningProgress(next);

    if (nextPercent >= 100) {
      completeWebWorldLevel(userId, LEVEL_ID);
    } else {
      updateWebWorldLevelProgress(userId, LEVEL_ID, nextPercent);
    }

    if (reward > 0) {
      setXpToast((current) => ({
        amount: reward,
        key: (current?.key || 0) + 1,
      }));
    }

    return reward;
  };

  /* ==================================================== */
  /* RUN PROJECT */
  /* ==================================================== */

  const handleRunProject = async () => {
    if (!activeUnit || running) {
      return;
    }

    setRunning(true);

    setConsoleLines([]);

    setResult(null);

    setLabTab("console");

    try {
      const response = await runProjectCode({
        files:
          activeUnit.kind === "lesson"
            ? {
                plan: planCode,
              }
            : projectFiles,

        validation,
      });

      if (!response.connected) {
        setConsoleLines([
          {
            type: "system",

            text: "CodeLand Project Runner",
          },

          {
            type: "muted",

            text: "Execution service is not connected yet.",
          },

          {
            type: "muted",

            text: "Your project has been saved locally and is ready for the backend runner.",
          },
        ]);

        setResult({
          type: "offline",

          passed: false,

          message: response.message,
        });

        return;
      }

      const output = Array.isArray(response.output) ? response.output : [];

      setConsoleLines(
        output.map((line) => ({
          type: "output",

          text: String(line),
        })),
      );

      if (response.error) {
        setConsoleLines((current) => [
          ...current,

          {
            type: "error",

            text: response.error,
          },
        ]);
      }

      if (response.passed) {
        setResult({
          type: "success",

          passed: true,

          message:
            activeUnit.kind === "lesson"
              ? "Project plan complete!"
              : "Final project complete!",
        });

        triggerRobotReaction("happy");

        setFeedbackEffect((current) => ({
          type: "success",
          key: (current?.key || 0) + 1,
        }));

        completeUnit(activeUnit);
      } else {
        setResult({
          type: "error",

          passed: false,

          message:
            response.message || "Your project still needs a few improvements.",
        });

        triggerRobotReaction("sad");

        setFeedbackEffect((current) => ({
          type: "error",
          key: (current?.key || 0) + 1,
        }));
      }
    } catch (error) {
      setConsoleLines([
        {
          type: "error",

          text: error?.message || "Unable to reach the project runner.",
        },
      ]);

      setResult({
        type: "error",

        passed: false,

        message: "Unable to run the project.",
      });

      triggerRobotReaction("sad");
    } finally {
      setRunning(false);
    }
  };

  /* ==================================================== */
  /* HINT */
  /* ==================================================== */

  const handleHint = () => {
    if (!hints.length) {
      return;
    }

    setHintIndex((current) => {
      if (current >= hints.length - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  /* ==================================================== */
  /* CONTINUE */
  /* ==================================================== */

  const handleContinue = () => {
    if (!activeUnit || !isCompleted(activeUnit)) {
      return;
    }

    const currentIndex = units.findIndex((unit) => unit.id === activeUnit.id);

    const nextUnit = units[currentIndex + 1];

    if (nextUnit) {
      setActiveUnitId(nextUnit.id);

      return;
    }

    setLevelComplete(true);
  };

  /* ==================================================== */
  /* ACTIVE EDITOR VALUE */
  /* ==================================================== */

  const activeEditorValue =
    activeUnit?.kind === "lesson" ? planCode : projectFiles[activeFile] || "";

  const lineCount = Math.max(activeEditorValue.split("\n").length, 18);

  /* ==================================================== */
  /* ROBOT MESSAGE */
  /* ==================================================== */

  const robotMessage =
    robotReaction.type === "happy"
      ? "Amazing work. Your project is coming to life!"
      : robotReaction.type === "sad"
        ? "Keep building. Great projects improve one step at a time."
        : activeUnit?.kind === "challenge"
          ? "This is your project. Make it something you are proud to show."
          : "Plan the experience before you start building.";

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

        <span>LOADING PROJECT SHOWCASE</span>
      </main>
    );
  }

  /* ==================================================== */
  /* ERROR */
  /* ==================================================== */

  if (loadError || !content) {
    return (
      <main className={styles.errorPage}>
        <XCircle size={32} />

        <h1>Project Showcase could not load</h1>

        <p>{loadError || "Content is unavailable."}</p>

        <button type="button" onClick={() => navigate("/student/world")}>
          Back to World
        </button>
      </main>
    );
  }

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  return (
    <main className={styles.page}>
      {/* =============================================== */}
      {/* XP TOAST */}
      {/* =============================================== */}

      {xpToast && (
        <div key={xpToast.key} className={styles.xpToast}>
          <span className={styles.xpToastIcon}>
            <Sparkles size={16} />
          </span>

          <div>
            <strong>+{xpToast.amount} XP</strong>

            <small>SHOWCASE REWARD</small>
          </div>
        </div>
      )}

      {/* =============================================== */}
      {/* HEADER */}
      {/* =============================================== */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/student/world")}
          >
            <ArrowLeft size={16} />
            World
          </button>

          <div className={styles.levelIdentity}>
            <div className={styles.projectMark}>
              <FolderCode size={20} />
            </div>

            <div>
              <span>WORLD 05</span>

              <strong>Project Showcase</strong>
            </div>
          </div>
        </div>

        <div className={styles.headerProgress}>
          <div className={styles.progressMeta}>
            <span>SHOWCASE PROGRESS</span>

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

      <section className={styles.workspace}>
        {/* ============================================= */}
        {/* SIDEBAR */}
        {/* ============================================= */}

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>FINAL JOURNEY</span>

            <strong>
              {completedCount}/{totalCount}
            </strong>
          </div>

          {/* ROBOT */}

          <div
            className={`${styles.robotCoach} ${
              robotReaction.type === "happy" ? styles.robotCoachHappy : ""
            } ${robotReaction.type === "sad" ? styles.robotCoachSad : ""}`}
          >
            <div className={styles.robotStage}>
              <LessonRobot
                reaction={robotReaction.type}
                reactionKey={robotReaction.key}
              />

              <div className={styles.robotFloor} />
            </div>

            <div className={styles.robotCoachText}>
              <span>PROJECT GUIDE</span>

              <strong>{robotMessage}</strong>
            </div>
          </div>

          {/* JOURNEY */}

          <div className={styles.sectionLabel}>
            <BookOpen size={13} />
            Project Journey
          </div>

          <div className={styles.unitList}>
            {units.map((unit, index) => {
              const completed = isCompleted(unit);

              const unlocked = isUnlocked(index);

              const active = activeUnit?.id === unit.id;

              return (
                <button
                  key={unit.id}
                  type="button"
                  disabled={!unlocked}
                  className={`${styles.unitButton} ${
                    active ? styles.unitButtonActive : ""
                  } ${completed ? styles.unitButtonCompleted : ""}`}
                  onClick={() => handleSelectUnit(unit, index)}
                >
                  <span
                    className={
                      unit.kind === "challenge"
                        ? `${styles.unitNumber} ${styles.challengeNumber}`
                        : styles.unitNumber
                    }
                  >
                    {unit.kind === "challenge"
                      ? "FINAL"
                      : String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <strong>{unit.data.title}</strong>

                    <small>{unit.data.xp} XP</small>
                  </div>

                  {completed ? (
                    <CheckCircle2 size={15} />
                  ) : unlocked ? (
                    <ChevronRight size={15} />
                  ) : (
                    <LockKeyhole size={14} />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* ============================================= */}
        {/* PROJECT BRIEF */}
        {/* ============================================= */}

        <section className={styles.lessonArea}>
          <div className={styles.lessonScroll}>
            {activeUnit && (
              <>
                <div className={styles.lessonEyebrow}>
                  {activeUnit.kind === "lesson" ? (
                    <>
                      <Target size={14} />
                      PROJECT PLANNING
                    </>
                  ) : (
                    <>
                      <Trophy size={14} />
                      FINAL MISSION
                    </>
                  )}
                </div>

                <h1 className={styles.lessonTitle}>{activeUnit.data.title}</h1>

                <p className={styles.lessonSubtitle}>
                  {activeUnit.data.subtitle}
                </p>

                <div className={styles.lessonMeta}>
                  <span>{activeUnit.data.difficulty}</span>

                  <i />

                  <span>{activeUnit.data.estimatedMinutes} MIN</span>

                  <i />

                  <span>{activeUnit.data.xp} XP</span>
                </div>

                {/* LESSON BLOCKS */}

                {activeUnit.kind === "lesson" &&
                  (activeUnit.data.blocks || []).map((block) => {
                    if (block.type === "text") {
                      return (
                        <div key={block.id} className={styles.textBlock}>
                          <h2>{block.title}</h2>

                          <p>{block.content}</p>
                        </div>
                      );
                    }

                    if (block.type === "tip") {
                      return (
                        <div key={block.id} className={styles.tipBlock}>
                          <Lightbulb size={17} />

                          <div>
                            <strong>Creator Tip</strong>

                            <p>{block.content}</p>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}

                {/* PLANNING MISSION */}

                {activeUnit.kind === "lesson" && mission && (
                  <div className={styles.missionCard}>
                    <div className={styles.missionIcon}>
                      <Target size={18} />
                    </div>

                    <div>
                      <span>PLANNING MISSION</span>

                      <h2>{mission.title}</h2>

                      <p>{mission.instructions}</p>
                    </div>
                  </div>
                )}

                {/* FINAL BRIEF */}

                {activeUnit.kind === "challenge" && (
                  <>
                    <div className={styles.finalBrief}>
                      <Trophy size={21} />

                      <div>
                        <span>FINAL PROJECT</span>

                        <h2>{activeUnit.data.projectBrief?.title}</h2>

                        <p>{activeUnit.data.projectBrief?.description}</p>
                      </div>
                    </div>

                    {activeUnit.data.projectBrief?.ideas?.length > 0 && (
                      <div className={styles.ideaSection}>
                        <span>PROJECT IDEAS</span>

                        <div className={styles.ideaGrid}>
                          {activeUnit.data.projectBrief.ideas.map((idea) => (
                            <div key={idea}>
                              <Sparkles size={13} />

                              {idea}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.requirements}>
                      <div className={styles.requirementsHeader}>
                        <Target size={14} />
                        PROJECT REQUIREMENTS
                      </div>

                      {(activeUnit.data.requirements || []).map(
                        (requirement, index) => (
                          <div
                            key={requirement.id}
                            className={styles.requirementCard}
                          >
                            <span>{String(index + 1).padStart(2, "0")}</span>

                            <div>
                              <strong>{requirement.title}</strong>

                              <p>{requirement.description}</p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </>
                )}

                {/* RUNNER */}

                {!runnerAvailable && (
                  <div className={styles.runnerNotice}>
                    <Terminal size={17} />

                    <div>
                      <strong>Project Runner Offline</strong>

                      <p>
                        Your project files are saved locally. Live execution and
                        automated project validation will be connected through
                        the CodeLand backend runner.
                      </p>
                    </div>
                  </div>
                )}

                {/* HINT */}

                <div className={styles.hintArea}>
                  <button type="button" onClick={handleHint}>
                    <Lightbulb size={15} />
                    Need a hint?
                  </button>

                  {hintIndex >= 0 && hints[hintIndex] && (
                    <div className={styles.hintBubble}>{hints[hintIndex]}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ============================================= */}
        {/* PROJECT LAB */}
        {/* ============================================= */}

        <section
          className={`${styles.lab} ${
            feedbackEffect?.type === "success" ? styles.labSuccess : ""
          } ${feedbackEffect?.type === "error" ? styles.labError : ""}`}
        >
          {/* LAB HEADER */}

          <div className={styles.labHeader}>
            <div>
              <span>CREATOR STUDIO</span>

              <strong>
                {activeUnit?.kind === "lesson" ? "Project Plan" : "Web Project"}
              </strong>
            </div>

            <div
              className={
                runnerAvailable
                  ? styles.runnerStatusOnline
                  : styles.runnerStatusOffline
              }
            >
              <i />

              {runnerAvailable ? "Runner Online" : "Runner Offline"}
            </div>

            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>

          {/* MAIN TABS */}

          <div className={styles.labTabs}>
            <button
              type="button"
              className={labTab === "editor" ? styles.labTabActive : ""}
              onClick={() => setLabTab("editor")}
            >
              <Code2 size={13} />
              Editor
            </button>

            <button
              type="button"
              className={labTab === "preview" ? styles.labTabActive : ""}
              onClick={() => setLabTab("preview")}
            >
              <Monitor size={13} />
              Preview
            </button>

            <button
              type="button"
              className={labTab === "console" ? styles.labTabActive : ""}
              onClick={() => setLabTab("console")}
            >
              <Terminal size={13} />
              Console
            </button>
          </div>

          {/* FILE TABS */}

          {labTab === "editor" && activeUnit?.kind === "challenge" && (
            <div className={styles.fileTabs}>
              <button
                type="button"
                className={activeFile === "html" ? styles.fileTabActive : ""}
                onClick={() => setActiveFile("html")}
              >
                <FileCode2 size={13} />
                index.html
              </button>

              <button
                type="button"
                className={activeFile === "css" ? styles.fileTabActive : ""}
                onClick={() => setActiveFile("css")}
              >
                <FileText size={13} />
                styles.css
              </button>

              <button
                type="button"
                className={
                  activeFile === "javascript" ? styles.fileTabActive : ""
                }
                onClick={() => setActiveFile("javascript")}
              >
                <FileJson2 size={13} />
                script.js
              </button>
            </div>
          )}

          {/* LAB BODY */}

          <div className={styles.labBody}>
            {/* EDITOR */}

            {labTab === "editor" && (
              <div className={styles.editor}>
                <div className={styles.lineRail}>
                  {Array.from({
                    length: lineCount,
                  }).map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <textarea
                  value={activeEditorValue}
                  onChange={
                    activeUnit?.kind === "lesson"
                      ? handlePlanChange
                      : handleProjectFileChange
                  }
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Project editor"
                />
              </div>
            )}

            {/* PREVIEW */}

            {labTab === "preview" && (
              <div className={styles.preview}>
                <div className={styles.previewTop}>
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>project.preview</span>
                </div>

                <div className={styles.previewBody}>
                  <div className={styles.previewIcon}>
                    <Monitor size={31} />
                  </div>

                  <span>LIVE PROJECT PREVIEW</span>

                  <h3>Your creation will appear here</h3>

                  <p>
                    HTML, CSS and JavaScript rendering will be enabled when the
                    secure backend project runner is connected.
                  </p>
                </div>
              </div>
            )}

            {/* CONSOLE */}

            {labTab === "console" && (
              <div className={styles.console}>
                <div className={styles.consoleTop}>
                  <Terminal size={13} />
                  PROJECT CONSOLE
                </div>

                <div className={styles.consoleOutput}>
                  {!consoleLines.length ? (
                    <div className={styles.consoleEmpty}>
                      <span>&gt;</span>
                      Run the project to see output.
                    </div>
                  ) : (
                    consoleLines.map((line, index) => (
                      <div
                        key={`${line.type}-${index}`}
                        className={`${styles.consoleLine} ${
                          line.type === "error" ? styles.consoleError : ""
                        } ${
                          line.type === "system" ? styles.consoleSystem : ""
                        } ${line.type === "muted" ? styles.consoleMuted : ""}`}
                      >
                        <span>&gt;</span>

                        <code>{line.text}</code>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RESULT */}

          {result && (
            <div
              className={`${styles.result} ${
                result.type === "success"
                  ? styles.resultSuccess
                  : result.type === "offline"
                    ? styles.resultOffline
                    : styles.resultError
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 size={17} />
              ) : result.type === "offline" ? (
                <Save size={17} />
              ) : (
                <XCircle size={17} />
              )}

              <div>
                <strong>
                  {result.type === "offline"
                    ? "Project saved"
                    : result.passed
                      ? "Mission complete"
                      : "Keep building"}
                </strong>

                <span>{result.message}</span>
              </div>
            </div>
          )}

          {/* FOOTER */}

          <div className={styles.labFooter}>
            <div>
              <span>REWARD</span>

              <strong>{activeUnit?.data?.xp || 0} XP</strong>
            </div>

            {isCompleted(activeUnit) ? (
              <button
                type="button"
                className={styles.continueButton}
                onClick={handleContinue}
              >
                {activeUnitIndex === units.length - 1
                  ? "Finish World"
                  : "Continue"}

                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.runButton}
                disabled={running}
                onClick={handleRunProject}
              >
                <Play size={15} fill="currentColor" />

                {running
                  ? "Running..."
                  : activeUnit?.kind === "lesson"
                    ? "Check Plan"
                    : "Run Project"}
              </button>
            )}
          </div>
        </section>
      </section>

      {/* =============================================== */}
      {/* WORLD COMPLETE */}
      {/* =============================================== */}

      {levelComplete && (
        <div className={styles.completeOverlay}>
          <div className={styles.completeCard}>
            <div className={styles.completeGlow} />

            <div className={styles.trophyCircle}>
              <Trophy size={32} />
            </div>

            <span>WEB WORLD COMPLETE</span>

            <h2>You Built the Journey</h2>

            <p>
              From your first HTML element to a complete project, you finished
              the Web World and built your foundation as a web creator.
            </p>

            <div className={styles.completeStats}>
              <div>
                <strong>{lessonCount}</strong>

                <span>PROJECT LESSON</span>
              </div>

              <div>
                <strong>{challengeCount}</strong>

                <span>FINAL PROJECT</span>
              </div>

              <div>
                <strong>{learningProgress.xp}</strong>

                <span>XP EARNED</span>
              </div>
            </div>

            <button type="button" onClick={() => navigate("/student/world")}>
              Return to World
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProjectShowcase;
