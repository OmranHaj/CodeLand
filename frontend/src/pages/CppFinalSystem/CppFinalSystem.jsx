import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Lightbulb,
  LockKeyhole,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import LessonRobot from "../../components/Learning/LessonRobot";

import cppFinalSystemContent from "../../data/cppFinalSystemContent";

import {
  completeCppWorldLevel,
  updateCppWorldLevelProgress,
} from "../../data/cppWorldLevels";

import styles from "./CppFinalSystem.module.css";

const LEVEL_ID = "cpp-final-system";

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
      "[CodeLand] Unable to save C++ Final System progress:",
      error,
    );
  }
}

/* ====================================================== */
/* FUTURE C++ RUNNER */
/* ====================================================== */

async function runCppCode({ code, validation }) {
  void code;
  void validation;

  return {
    connected: false,
    passed: false,
    output: [],
    error: null,
    message: "The CodeLand C++ compiler service is not connected yet.",
  };
}

/* ====================================================== */
/* PAGE */
/* ====================================================== */

function CppFinalSystem() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => getCurrentUser(), []);

  const userId = currentUser?.id || currentUser?.email || "guest";

  const content = cppFinalSystemContent;

  const [learningProgress, setLearningProgress] = useState(() =>
    loadProgress(userId),
  );

  const [activeUnitId, setActiveUnitId] = useState(null);

  const [editorCode, setEditorCode] = useState("");

  const [labTab, setLabTab] = useState("code");

  const [consoleLines, setConsoleLines] = useState([]);

  const [result, setResult] = useState(null);

  const [hintIndex, setHintIndex] = useState(-1);

  const [running, setRunning] = useState(false);

  const [robotReaction, setRobotReaction] = useState({
    type: "idle",
    key: 0,
  });

  const [xpToast, setXpToast] = useState(null);

  const [feedbackEffect, setFeedbackEffect] = useState(null);

  const [levelComplete, setLevelComplete] = useState(false);

  const runnerAvailable = Boolean(content.execution?.enabled);

  /* ==================================================== */
  /* AUTH */
  /* ==================================================== */

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  /* ==================================================== */
  /* SAVE */
  /* ==================================================== */

  useEffect(() => {
    saveProgress(userId, learningProgress);
  }, [userId, learningProgress]);

  /* ==================================================== */
  /* TIMER CLEANUP */
  /* ==================================================== */

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
  /* UNITS */
  /* ==================================================== */

  const units = useMemo(() => {
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

  const lessonCount = content.lessons?.length || 0;

  const challengeCount = content.challenges?.length || 0;

  const totalCount = units.length;

  const isCompleted = (unit) => {
    if (!unit) {
      return false;
    }

    if (unit.kind === "lesson") {
      return learningProgress.completedLessonIds.includes(unit.id);
    }

    return learningProgress.completedChallengeIds.includes(unit.id);
  };

  const isUnlocked = (index) => {
    if (!runnerAvailable) {
      return true;
    }

    if (index === 0) {
      return true;
    }

    return units.slice(0, index).every((unit) => isCompleted(unit));
  };

  /* ==================================================== */
  /* ACTIVE UNIT */
  /* ==================================================== */

  const activeUnit = useMemo(
    () => units.find((unit) => unit.id === activeUnitId) || null,
    [units, activeUnitId],
  );

  const activeUnitIndex = activeUnit
    ? units.findIndex((unit) => unit.id === activeUnit.id)
    : -1;

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

    setActiveUnitId(firstIncomplete?.id || units[units.length - 1]?.id || null);
  }, [units, activeUnitId, learningProgress]);

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
      ? mission?.validation || []
      : activeUnit?.data?.validation || [];

  useEffect(() => {
    if (!activeUnit) {
      return;
    }

    const savedDraft = learningProgress.drafts?.[activeUnit.id];

    setEditorCode(typeof savedDraft === "string" ? savedDraft : starterCode);

    setLabTab("code");
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
  }, [activeUnit?.id, starterCode]);

  /* ==================================================== */
  /* PROGRESS VALUES */
  /* ==================================================== */

  const completedCount =
    learningProgress.completedLessonIds.length +
    learningProgress.completedChallengeIds.length;

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  /* ==================================================== */
  /* INTERACTIONS */
  /* ==================================================== */

  const handleSelectUnit = (unit, index) => {
    if (!isUnlocked(index)) {
      return;
    }

    setActiveUnitId(unit.id);
  };

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

  const triggerRobotReaction = (type) => {
    setRobotReaction((current) => ({
      type,
      key: current.key + 1,
    }));
  };

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

    const nextPercent =
      totalCount > 0 ? Math.round((nextCompleted / totalCount) * 100) : 0;

    setLearningProgress(next);

    if (nextPercent >= 100) {
      completeCppWorldLevel(userId, LEVEL_ID);
    } else {
      updateCppWorldLevelProgress(userId, LEVEL_ID, nextPercent);
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
  /* RUNNER */
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
      const response = await runCppCode({
        code: editorCode,
        validation,
      });

      if (!response.connected) {
        setConsoleLines([
          {
            type: "system",
            text: "CodeLand C++ Compiler",
          },
          {
            type: "muted",
            text: "Compiler service is not connected yet.",
          },
          {
            type: "muted",
            text: "Your C++ code is saved and ready for the backend runner.",
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
          message: "Compilation successful. Mission complete!",
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
          message: response.message || "The compiler found an issue.",
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
          text: error?.message || "Unable to reach the compiler service.",
        },
      ]);

      setResult({
        type: "error",
        passed: false,
        message: "Unable to compile code.",
      });

      triggerRobotReaction("sad");
    } finally {
      setRunning(false);
    }
  };

  /* ==================================================== */
  /* DEV COMPLETE */
  /* ==================================================== */

  const handleDevComplete = () => {
    if (!import.meta.env.DEV || !activeUnit) {
      return;
    }

    setResult({
      type: "success",
      passed: true,
      message: "Development pass simulated.",
    });

    setLabTab("console");

    setConsoleLines([
      {
        type: "system",
        text: "Development compiler simulation",
      },
      {
        type: "output",
        text: "Mission passed.",
      },
    ]);

    triggerRobotReaction("happy");

    setFeedbackEffect((current) => ({
      type: "success",
      key: (current?.key || 0) + 1,
    }));

    completeUnit(activeUnit);
  };

  /* ==================================================== */
  /* HINT / CONTINUE */
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
  /* ROBOT COPY */
  /* ==================================================== */

  const robotMessage =
    robotReaction.type === "happy"
      ? "Excellent. The final C++ system is operating correctly."
      : robotReaction.type === "sad"
        ? "Compiler fault detected. Check the mission and inspect your syntax."
        : runnerAvailable
          ? "Write your C++ code, then send it to the compiler."
          : "Master Terminal is ready. Complete the final system build to finish C++ Core.";

  const lineCount = Math.max(editorCode.split("\n").length, 16);

  if (!currentUser) {
    return null;
  }

  return (
    <main className={styles.page}>
      {/* XP */}

      {xpToast && (
        <div key={xpToast.key} className={styles.xpToast}>
          <Zap size={15} />

          <div>
            <strong>+{xpToast.amount} XP</strong>

            <span>CORE POWER</span>
          </div>
        </div>
      )}

      {/* HEADER */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/student/cpp-world")}
          >
            <ArrowLeft size={16} />
            Core Map
          </button>

          <div className={styles.identity}>
            <div className={styles.coreMark}>
              <Cpu size={20} />
            </div>

            <div>
              <span>SECTOR 07</span>

              <strong>FINAL SYSTEM BUILD</strong>
            </div>
          </div>
        </div>

        <div className={styles.headerProgress}>
          <div className={styles.progressMeta}>
            <span>CORE SYNC</span>

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
          <Sparkles size={14} />

          <strong>{learningProgress.xp}</strong>

          <span>XP</span>
        </div>
      </header>

      {/* WORKSPACE */}

      <section className={styles.workspace}>
        {/* LEFT NAV */}

        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <span>TRAINING MATRIX</span>

            <strong>
              {completedCount}/{totalCount}
            </strong>
          </div>

          <div className={styles.robotCard}>
            <div className={styles.robotStage}>
              <LessonRobot
                reaction={robotReaction.type}
                reactionKey={robotReaction.key}
              />

              <div className={styles.robotFloor} />
            </div>

            <div className={styles.robotCopy}>
              <span>FINAL SYSTEM BUILDER</span>

              <strong>{robotMessage}</strong>
            </div>
          </div>

          <div className={styles.trainingScroll}>
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
                    <span className={styles.unitIndex}>
                      {completed ? (
                        <CheckCircle2 size={13} />
                      ) : unlocked ? (
                        String(index + 1).padStart(2, "0")
                      ) : (
                        <LockKeyhole size={12} />
                      )}
                    </span>

                    <div>
                      <strong>{unit.data.title}</strong>

                      <small>{unit.data.xp} XP</small>
                    </div>

                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>

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
                      className={`${styles.unitIndex} ${styles.challengeIndex}`}
                    >
                      {completed ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        `C${challengeIndex + 1}`
                      )}
                    </span>

                    <div>
                      <strong>{unit.data.title}</strong>

                      <small>{unit.data.xp} XP</small>
                    </div>

                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* BRIEFING */}

        <section className={styles.briefing}>
          <div className={styles.briefingScroll}>
            {activeUnit && (
              <>
                <div className={styles.eyebrow}>
                  {activeUnit.kind === "lesson" ? (
                    <>
                      <Code2 size={13} />
                      FINAL BUILD {activeUnitIndex + 1}
                    </>
                  ) : (
                    <>
                      <Trophy size={13} />
                      SYNTAX CHALLENGE
                    </>
                  )}
                </div>

                <h1>{activeUnit.data.title}</h1>

                <p className={styles.subtitle}>{activeUnit.data.subtitle}</p>

                <div className={styles.meta}>
                  <span>{activeUnit.data.difficulty}</span>

                  <i />

                  <span>{activeUnit.data.estimatedMinutes} MIN</span>

                  <i />

                  <span>{activeUnit.data.xp} XP</span>
                </div>

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
                          <Lightbulb size={16} />

                          <div>
                            <strong>Engineer Tip</strong>

                            <p>{block.content}</p>
                          </div>
                        </div>
                      );
                    }

                    if (block.type === "code") {
                      return (
                        <div key={block.id} className={styles.exampleCode}>
                          <div>
                            <Code2 size={13} />
                            C++ Example
                          </div>

                          <pre>
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      );
                    }

                    return null;
                  })}

                {activeUnit.kind === "lesson" && mission && (
                  <div className={styles.missionCard}>
                    <Zap size={18} />

                    <div>
                      <span>CORE MISSION</span>

                      <h2>{mission.title}</h2>

                      <p>{mission.instructions}</p>
                    </div>
                  </div>
                )}

                {activeUnit.kind === "challenge" && (
                  <div className={styles.challengeCard}>
                    <Trophy size={19} />

                    <div>
                      <span>COMPILER CHALLENGE</span>

                      <p>{activeUnit.data.description}</p>
                    </div>
                  </div>
                )}

                {!runnerAvailable && (
                  <div className={styles.runnerNotice}>
                    <Terminal size={16} />

                    <div>
                      <strong>C++ Compiler Offline</strong>

                      <p>
                        Write and save your code now. Secure compilation and
                        automated tests will connect to the backend runner
                        later.
                      </p>
                    </div>
                  </div>
                )}

                <div className={styles.hintArea}>
                  <button type="button" onClick={handleHint}>
                    <Lightbulb size={14} />
                    Request Hint
                  </button>

                  {hintIndex >= 0 && hints[hintIndex] && (
                    <div className={styles.hintBubble}>{hints[hintIndex]}</div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* MASTER TERMINAL */}

        <section
          className={`${styles.chamber} ${
            feedbackEffect?.type === "success" ? styles.chamberSuccess : ""
          } ${feedbackEffect?.type === "error" ? styles.chamberError : ""}`}
        >
          <div className={styles.chamberHeader}>
            <div>
              <span>MASTER TERMINAL</span>

              <strong>C++17 Master Runtime</strong>
            </div>

            <div
              className={
                runnerAvailable ? styles.runnerOnline : styles.runnerOffline
              }
            >
              <i />

              {runnerAvailable ? "Compiler Online" : "Compiler Offline"}
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

          <div className={styles.tabs}>
            <button
              type="button"
              className={labTab === "code" ? styles.tabActive : ""}
              onClick={() => setLabTab("code")}
            >
              <Code2 size={13} />
              main.cpp
            </button>

            <button
              type="button"
              className={labTab === "console" ? styles.tabActive : ""}
              onClick={() => setLabTab("console")}
            >
              <Terminal size={13} />
              Compiler
            </button>
          </div>

          <div className={styles.chamberBody}>
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
                  aria-label="C++ code editor"
                />
              </div>
            )}

            {labTab === "console" && (
              <div className={styles.console}>
                <div className={styles.consoleTop}>
                  <Terminal size={13} />
                  COMPILER OUTPUT
                </div>

                <div className={styles.consoleOutput}>
                  {!consoleLines.length ? (
                    <div className={styles.consoleEmpty}>
                      <span>&gt;</span>
                      Send your source code to the compiler.
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
                <CheckCircle2 size={16} />
              ) : result.type === "offline" ? (
                <Terminal size={16} />
              ) : (
                <XCircle size={16} />
              )}

              <div>
                <strong>
                  {result.type === "success"
                    ? "Mission complete"
                    : result.type === "offline"
                      ? "Compiler not connected"
                      : "Compilation failed"}
                </strong>

                <span>{result.message}</span>
              </div>
            </div>
          )}

          <div className={styles.chamberFooter}>
            <div>
              <span>SIGNAL REWARD</span>

              <strong>{activeUnit?.data?.xp || 0} XP</strong>
            </div>

            <div className={styles.footerActions}>
              {import.meta.env.DEV && !isCompleted(activeUnit) && (
                <button
                  type="button"
                  className={styles.devPassButton}
                  onClick={handleDevComplete}
                >
                  Simulate Pass
                </button>
              )}

              {isCompleted(activeUnit) ? (
                <button
                  type="button"
                  className={styles.continueButton}
                  onClick={handleContinue}
                >
                  {activeUnitIndex === units.length - 1
                    ? "Activate Core"
                    : "Continue"}

                  <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.runButton}
                  disabled={running}
                  onClick={handleRunCode}
                >
                  <Play size={14} fill="currentColor" />

                  {running ? "Compiling..." : "Compile & Run"}
                </button>
              )}
            </div>
          </div>
        </section>
      </section>

      {levelComplete && (
        <div className={styles.completeOverlay}>
          <div className={styles.completeCard}>
            <div className={styles.completeCore}>
              <Cpu size={31} />
            </div>

            <span>FINAL SYSTEM BUILD ONLINE</span>

            <h2>Final System Build Complete</h2>

            <p>
              You completed every C++ Core sector and brought the full system
              online. Syntax, data, logic, functions, arrays, memory, objects,
              and STL tools are now connected in one final build.
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

                <span>XP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/student/cpp-world")}
            >
              Return to C++ Core
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CppFinalSystem;
