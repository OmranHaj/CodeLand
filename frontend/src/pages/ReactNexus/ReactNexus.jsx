import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Eye,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
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

import styles from "./ReactNexus.module.css";

const LEVEL_ID = "react-nexus";

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
/* LEARNING PROGRESS */
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
    console.error("[CodeLand] Unable to save React learning progress:", error);
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
/* FUTURE REACT RUNNER */
/* ====================================================== */

/*
  No React / JSX code is executed in the frontend.

  Later this will connect to the backend runner:

  POST /api/code/run

  {
    language: "jsx",
    code,
    validation
  }
*/

async function runReactCode({ code, validation }) {
  void code;
  void validation;

  return {
    connected: false,

    passed: false,

    output: [],

    error: null,

    message: "The CodeLand React runner is not connected yet.",
  };
}

/* ====================================================== */
/* MAIN PAGE */
/* ====================================================== */

function ReactNexus() {
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
    loadLearningProgress(userId),
  );

  /* ==================================================== */
  /* UNIT */
  /* ==================================================== */

  const [activeUnitId, setActiveUnitId] = useState(null);

  const [editorCode, setEditorCode] = useState("");

  const [labTab, setLabTab] = useState("code");

  const [consoleLines, setConsoleLines] = useState([]);

  const [result, setResult] = useState(null);

  const [hintIndex, setHintIndex] = useState(-1);

  const [running, setRunning] = useState(false);

  const [levelComplete, setLevelComplete] = useState(false);

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
  /* XP */
  /* ==================================================== */

  const [xpToast, setXpToast] = useState(null);

  /* ==================================================== */
  /* FEEDBACK */
  /* ==================================================== */

  const [feedbackEffect, setFeedbackEffect] = useState(null);

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

        setLoadError(error?.message || "Unable to load React Nexus.");
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
    saveLearningProgress(userId, learningProgress);
  }, [userId, learningProgress]);

  /* ==================================================== */
  /* UNITS */
  /* ==================================================== */

  const units = useMemo(() => {
    if (!content) {
      return [];
    }

    const lessons = (content.lessons || []).map((lesson) => ({
      kind: "lesson",

      id: lesson.id,

      data: lesson,
    }));

    const challenges = (content.challenges || []).map((challenge) => ({
      kind: "challenge",

      id: challenge.id,

      data: challenge,
    }));

    return [...lessons, ...challenges];
  }, [content]);

  const lessonCount = content?.lessons?.length || 0;

  const challengeCount = content?.challenges?.length || 0;

  const totalCount = units.length;

  /* ==================================================== */
  /* COMPLETE CHECK */
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
    Because the backend runner is not ready,
    all units stay browseable during frontend development.

    When execution.enabled becomes true,
    sequential locking automatically becomes active.
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
  /* UNIT CONTENT */
  /* ==================================================== */

  const mission =
    activeUnit?.kind === "lesson" ? activeUnit.data.mission : null;

  const starterCode =
    activeUnit?.kind === "lesson"
      ? mission?.starterCode || ""
      : activeUnit?.data?.starterCode || "";

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

    setEditorCode(typeof savedDraft === "string" ? savedDraft : starterCode);

    setConsoleLines([]);

    setResult(null);

    setHintIndex(-1);

    setLabTab("code");

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
  }, [activeUnit?.id, starterCode]);

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
  /* EDIT CODE */
  /* ==================================================== */

  const handleCodeChange = (event) => {
    const value = event.target.value;

    setEditorCode(value);

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
  /* RESET */
  /* ==================================================== */

  const handleResetCode = () => {
    if (!activeUnit) {
      return;
    }

    setEditorCode(starterCode);

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

    if (reward > 0) {
      setXpToast((current) => ({
        amount: reward,
        key: (current?.key || 0) + 1,
      }));
    }

    return reward;
  };

  /* ==================================================== */
  /* RUN REACT CODE */
  /* ==================================================== */

  const handleRunCode = async () => {
    if (!activeUnit || running) {
      return;
    }

    setRunning(true);

    setResult(null);

    setConsoleLines([]);

    setLabTab("console");

    try {
      const response = await runReactCode({
        code: editorCode,

        validation,
      });

      if (!response.connected) {
        setConsoleLines([
          {
            type: "system",

            text: "CodeLand React Runner",
          },

          {
            type: "muted",

            text: "JSX execution service is not connected yet.",
          },

          {
            type: "muted",

            text: "Your React code is saved and ready for the backend runner.",
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

          message: "React mission complete!",
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

          message: response.message || "Your React code needs another look.",
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

          text: error?.message || "Unable to reach the React runner.",
        },
      ]);

      setResult({
        type: "error",

        passed: false,

        message: "Unable to run React code.",
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
  /* ROBOT MESSAGE */
  /* ==================================================== */

  const robotMessage =
    robotReaction.type === "happy"
      ? "Excellent! Your React component passed the mission."
      : robotReaction.type === "sad"
        ? "Almost there. Check your JSX and try again."
        : runnerAvailable
          ? "Build your component, then run it when you're ready."
          : "React Nexus is ready. The JSX runner comes with the backend.";

  /* ==================================================== */
  /* LINE NUMBERS */
  /* ==================================================== */

  const lineCount = Math.max(editorCode.split("\n").length, 15);

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

        <span>LOADING REACT NEXUS</span>
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

        <h1>React Nexus could not load</h1>

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

            <small>NEXUS REWARD</small>
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
            <div className={styles.reactMark}>
              <Cpu size={20} />
            </div>

            <div>
              <span>WORLD 04</span>

              <strong>React Nexus</strong>
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

      <section className={styles.workspace}>
        {/* ============================================= */}
        {/* SIDEBAR */}
        {/* ============================================= */}

        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span>NEXUS JOURNEY</span>

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
              <span>NEXUS GUIDE</span>

              <strong>{robotMessage}</strong>
            </div>
          </div>

          {/* LESSONS */}

          <div className={styles.sectionLabel}>
            <BookOpen size={13} />
            Lessons
          </div>

          <div className={styles.unitList}>
            {units.slice(0, lessonCount).map((unit, index) => {
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
                  <span className={styles.unitNumber}>
                    {String(index + 1).padStart(2, "0")}
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

          {/* CHALLENGES */}

          <div className={styles.sectionLabel}>
            <Trophy size={13} />
            Challenges
          </div>

          <div className={styles.unitList}>
            {units.slice(lessonCount).map((unit, challengeIndex) => {
              const index = lessonCount + challengeIndex;

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
                    className={`${styles.unitNumber} ${styles.challengeNumber}`}
                  >
                    C{challengeIndex + 1}
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
        {/* LESSON */}
        {/* ============================================= */}

        <section className={styles.lessonArea}>
          <div className={styles.lessonScroll}>
            {activeUnit && (
              <>
                <div className={styles.lessonEyebrow}>
                  {activeUnit.kind === "lesson" ? (
                    <>
                      <Code2 size={14} />
                      REACT LESSON {activeUnitIndex + 1}
                    </>
                  ) : (
                    <>
                      <Trophy size={14} />
                      NEXUS CHALLENGE
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

                {/* BLOCKS */}

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
                            <strong>React Tip</strong>

                            <p>{block.content}</p>
                          </div>
                        </div>
                      );
                    }

                    if (block.type === "code") {
                      return (
                        <div key={block.id} className={styles.exampleCode}>
                          <div className={styles.codeHeader}>
                            <Code2 size={13} />
                            JSX Example
                          </div>

                          <pre>
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      );
                    }

                    return null;
                  })}

                {/* MISSION */}

                {activeUnit.kind === "lesson" && mission && (
                  <div className={styles.missionCard}>
                    <div className={styles.missionIcon}>
                      <Target size={18} />
                    </div>

                    <div>
                      <span>NEXUS MISSION</span>

                      <h2>{mission.title}</h2>

                      <p>{mission.instructions}</p>
                    </div>
                  </div>
                )}

                {/* CHALLENGE */}

                {activeUnit.kind === "challenge" && (
                  <div className={styles.challengeIntro}>
                    <Trophy size={20} />

                    <div>
                      <span>REACT CHALLENGE</span>

                      <p>{activeUnit.data.description}</p>
                    </div>
                  </div>
                )}

                {/* RUNNER */}

                {!runnerAvailable && (
                  <div className={styles.runnerNotice}>
                    <Terminal size={17} />

                    <div>
                      <strong>JSX Runner Offline</strong>

                      <p>
                        You can build and save your React components now.
                        Rendering and automated tests will be connected through
                        the backend runner.
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
        {/* REACT LAB */}
        {/* ============================================= */}

        <section
          className={`${styles.lab} ${
            feedbackEffect?.type === "success" ? styles.labSuccess : ""
          } ${feedbackEffect?.type === "error" ? styles.labError : ""}`}
        >
          <div className={styles.labHeader}>
            <div>
              <span>REACT LAB</span>

              <strong>Nexus Runtime</strong>
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
              onClick={handleResetCode}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>

          {/* TABS */}

          <div className={styles.labTabs}>
            <button
              type="button"
              className={labTab === "code" ? styles.labTabActive : ""}
              onClick={() => setLabTab("code")}
            >
              <Code2 size={13} />
              JSX
            </button>

            <button
              type="button"
              className={labTab === "console" ? styles.labTabActive : ""}
              onClick={() => setLabTab("console")}
            >
              <Terminal size={13} />
              Console
            </button>

            <button
              type="button"
              className={labTab === "preview" ? styles.labTabActive : ""}
              onClick={() => setLabTab("preview")}
            >
              <Eye size={13} />
              Preview
            </button>
          </div>

          {/* BODY */}

          <div className={styles.labBody}>
            {/* CODE */}

            {labTab === "code" && (
              <div className={styles.editor}>
                <div className={styles.lineRail}>
                  {Array.from({
                    length: lineCount,
                  }).map((_, index) => (
                    <span key={index}>{index + 1}</span>
                  ))}
                </div>

                <textarea
                  value={editorCode}
                  onChange={handleCodeChange}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="React JSX code editor"
                />
              </div>
            )}

            {/* CONSOLE */}

            {labTab === "console" && (
              <div className={styles.console}>
                <div className={styles.consoleTop}>
                  <Terminal size={13} />
                  NEXUS CONSOLE
                </div>

                <div className={styles.consoleOutput}>
                  {!consoleLines.length ? (
                    <div className={styles.consoleEmpty}>
                      <span>&gt;</span>
                      Run your React code to see output.
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

            {/* PREVIEW */}

            {labTab === "preview" && (
              <div className={styles.preview}>
                <div className={styles.previewTop}>
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>react.preview</span>
                </div>

                <div className={styles.previewBody}>
                  <div className={styles.previewOrb}>
                    <Cpu size={30} />
                  </div>

                  <span>LIVE REACT PREVIEW</span>

                  <h3>JSX rendering comes next</h3>

                  <p>
                    Your component preview will render here once the backend
                    React runner is connected.
                  </p>
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
                <Terminal size={17} />
              ) : (
                <XCircle size={17} />
              )}

              <div>
                <strong>
                  {result.type === "offline"
                    ? "Runner not connected"
                    : result.passed
                      ? "Mission complete"
                      : "Check your JSX"}
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
                Continue
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.runButton}
                disabled={running}
                onClick={handleRunCode}
              >
                <Play size={15} fill="currentColor" />

                {running ? "Running..." : "Run Component"}
              </button>
            )}
          </div>
        </section>
      </section>

      {/* =============================================== */}
      {/* COMPLETE */}
      {/* =============================================== */}

      {levelComplete && (
        <div className={styles.completeOverlay}>
          <div className={styles.completeCard}>
            <div className={styles.completeGlow} />

            <div className={styles.trophyCircle}>
              <Trophy size={31} />
            </div>

            <span>REACT NEXUS COMPLETE</span>

            <h2>Project Showcase Unlocked</h2>

            <p>
              You completed the React Nexus and combined components, props,
              state, events, lists and reusable UI patterns.
            </p>

            <div className={styles.completeStats}>
              <div>
                <strong>{lessonCount}</strong>

                <span>LESSONS</span>
              </div>

              <div>
                <strong>{challengeCount}</strong>

                <span>CHALLENGES</span>
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

export default ReactNexus;
