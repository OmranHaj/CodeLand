import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Cpu,
  Copy,
  Check,
  Play,
  Sparkles,
  BookOpen,
  Terminal,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import Editor from "@monaco-editor/react";

import LessonRobot from "../../components/Learning/LessonRobot";
import AlgoVisualizer from "../../components/AlgorithmWorld/AlgoVisualizer";
import {
  ALGO_SECTORS,
  loadAlgoWorldProgress,
  saveAlgoWorldProgress,
} from "../../data/algorithmWorldLevels";
import { userKey, readStored, writeStored } from "../../services/learningHub";
import { recordLessonCompletion, fetchStudentProgress } from "../../services/learningContentService";
import { runCustomCode, detectCodeNeedsInput } from "../../services/judgeService";
import LessonExplanationPanel from "../../components/Learning/LessonExplanationPanel";
import styles from "./AlgorithmLab.module.css";

export default function AlgorithmLab() {
  const { sectorId } = useParams();
  const navigate = useNavigate();
  const userId = useMemo(() => userKey(), []);

  // Find sector from params or default to first
  const currentSector = useMemo(() => {
    return ALGO_SECTORS.find((s) => s.id === sectorId) || ALGO_SECTORS[0];
  }, [sectorId]);

  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [worldProgress, setWorldProgress] = useState(() =>
    loadAlgoWorldProgress(userId)
  );

  useEffect(() => {
    let cancelled = false;
    fetchStudentProgress()
      .then((res) => {
        if (cancelled || !res?.progress || !Array.isArray(res.progress)) return;
        const algoRecords = res.progress.filter((p) => p.levelId?.startsWith("algo-"));
        if (algoRecords.length > 0) {
          const dbCompletedLessons = [];
          const dbCompletedSectors = [];
          algoRecords.forEach((rec) => {
            if (Array.isArray(rec.completedLessonIds)) {
              dbCompletedLessons.push(...rec.completedLessonIds);
            }
            if (rec.status === "COMPLETED") {
              dbCompletedSectors.push(rec.levelId);
            }
          });

          setWorldProgress((current) => ({
            ...current,
            completedLessons: Array.from(
              new Set([...current.completedLessons, ...dbCompletedLessons])
            ),
            completedSectors: Array.from(
              new Set([...current.completedSectors, ...dbCompletedSectors])
            ),
          }));
        }
      })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  // Robot Reaction State ("idle", "happy", "sad")
  const [robotReaction, setRobotReaction] = useState("idle");
  const [robotKey, setRobotKey] = useState(0);
  const [robotMessage, setRobotMessage] = useState(
    "Hello explorer! I'm your robot companion. Explore the algorithm with 3D animation, and I'll celebrate your victories! 🤖✨"
  );

  // Quiz State
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);

  // Code Playground State
  const [userCode, setUserCode] = useState("");
  const [codeRunOutput, setCodeRunOutput] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);

  const needsInput = useMemo(
    () => detectCodeNeedsInput(userCode),
    [userCode],
  );

  const currentLesson = currentSector.lessons[activeLessonIdx] || currentSector.lessons[0];

  // Initialize/reset lesson-specific state
  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizIsCorrect(false);
    setUserCode(currentLesson.starterCode || "");
    setCodeRunOutput(null);
    setCustomInput("");
    setShowCustomInput(false);
    setRobotReaction("idle");
    setRobotMessage(
      `Welcome to the "${currentLesson.title}" lab! Check out the analogy and animation, then test your understanding!`
    );
  }, [currentLesson]);

  const completedLessons = worldProgress?.completedLessons || [];

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === currentLesson.answer;
    setQuizSubmitted(true);
    setQuizIsCorrect(isCorrect);

    if (isCorrect) {
      // Robot Happy Reaction!
      setRobotReaction("happy");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("Brilliant work! That's completely correct! 🎉🤖 You've mastered this algorithm concept!");

      // Save progress & XP
      if (!completedLessons.includes(currentLesson.id)) {
        const nextLessons = [...completedLessons, currentLesson.id];
        let nextSectors = [...(worldProgress.completedSectors || [])];
        const allDone = currentSector.lessons.every((l) => nextLessons.includes(l.id));
        if (allDone && !nextSectors.includes(currentSector.id)) {
          nextSectors.push(currentSector.id);
        }

        const nextProgress = {
          ...worldProgress,
          completedLessons: nextLessons,
          completedSectors: nextSectors,
          xp: (worldProgress.xp || 0) + 75,
        };
        setWorldProgress(nextProgress);
        saveAlgoWorldProgress(userId, nextProgress);
        recordLessonCompletion(currentSector.id, currentLesson.id, 75, "lesson");

        /*
        // MOCK DATA: Commented out legacy python storage sync
        try {
          const oldPython = readStored(`codeland_python_${userId}`, []);
          const sIdx = ALGO_SECTORS.findIndex((s) => s.id === currentSector.id);
          if (sIdx >= 0 && sIdx < 5 && !oldPython.includes(sIdx)) {
            writeStored(`codeland_python_${userId}`, [...oldPython, sIdx]);
          }
        } catch {
          // ignore
        }
        */
      }
    } else {
      // Robot Sad Reaction
      setRobotReaction("sad");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("So close! 🥺 Don't give up—review the element movement in the visualizer and try another option!");
    }
  };

  // Handle Code Playground Execution with real backend Judge API (Run Mode)
  const handleRunCode = async (overrideInput = null) => {
    if (isRunningCode) return;

    const inputToUse = overrideInput !== null ? overrideInput : customInput;

    // If code has cin/scanf/getline and no input was provided yet, wait for input!
    if (needsInput && !inputToUse.trim() && overrideInput === null) {
      setShowCustomInput(true);
      setRobotReaction("idle");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("Your code contains cin >> input instructions! Please enter the input values below and click Run. ⌨️");
      return;
    }

    setIsRunningCode(true);
    setCodeRunOutput(null);

    // If student code is a standalone function and currentLesson has main(), synthesize complete code
    let codeToExecute = userCode;
    if (!codeToExecute.includes("main(") && currentLesson.cppCode && currentLesson.cppCode.includes("int main(")) {
      const mainIdx = currentLesson.cppCode.indexOf("int main(");
      if (mainIdx !== -1) {
        const mainHarness = currentLesson.cppCode.slice(mainIdx);
        codeToExecute = `${userCode}\n\n${mainHarness}`;
      }
    }

    try {
      const result = await runCustomCode({
        code: codeToExecute,
        language: "cpp",
        customInput: inputToUse || "",
      });

      const isSuccess = result.status === "SUCCESS";
      const isCompileError = result.status === "COMPILATION_ERROR";
      const isTimeLimit = result.status === "TIME_LIMIT_EXCEEDED";

      if (isSuccess) {
        setRobotReaction("happy");
        setRobotKey((prev) => prev + 1);
        setRobotMessage("Code compiled and executed successfully! Output is displayed in the console below. 🚀✨");
      } else if (isCompileError) {
        setRobotReaction("sad");
        setRobotKey((prev) => prev + 1);
        setRobotMessage("Compiler syntax error detected! Review the compiler errors in the console below to fix line issues. 🛠️");
      } else if (isTimeLimit) {
        setRobotReaction("sad");
        setRobotKey((prev) => prev + 1);
        setRobotMessage("Time limit exceeded! Please check for infinite loops or deep recursions. ⏱️");
      } else {
        setRobotReaction("sad");
        setRobotKey((prev) => prev + 1);
        setRobotMessage(result.stderr || "Runtime error occurred during execution. Check your code logic.");
      }

      setCodeRunOutput({
        success: isSuccess,
        status: result.status,
        stdout: result.stdout,
        stderr: result.stderr,
        compileError: result.compileError,
        executionTime: result.executionTime,
      });
    } catch (err) {
      setCodeRunOutput({
        success: false,
        status: "RUNTIME_ERROR",
        stderr: err?.message || "Failed to reach compiler service.",
        compileError: null,
        stdout: "",
        executionTime: null,
      });
      setRobotReaction("sad");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("Unable to reach the compiler service. Please ensure the backend is active!");
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleCopyCode = () => {
    if (navigator.clipboard && currentLesson.cppCode) {
      navigator.clipboard.writeText(currentLesson.cppCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className={styles.labPage}>
      <div className={styles.bgGlow} />

      <div className={styles.labContainer}>
        {/* Top Header & Navigation */}
        <header className={styles.labHeader}>
          <div className={styles.labHeaderLeft}>
            <Link to="/student/python-world" className={styles.backBtn}>
              <ArrowLeft size={16} />
              <span>Return to 3D Matrix</span>
            </Link>

            <div
              className={styles.sectorBadge}
              style={{ "--accent": currentSector.accent }}
            >
              <Cpu size={16} color={currentSector.accent} />
              <span className={styles.sectorCode}>{currentSector.code} · SECTOR {currentSector.order}</span>
              <span className={styles.sectorTitle}>{currentSector.title}</span>
            </div>
          </div>

          {/* Lesson Switcher Tabs */}
          <div className={styles.lessonNavRow}>
            {currentSector.lessons.map((les, idx) => {
              const isDone = completedLessons.includes(les.id);
              return (
                <button
                  key={les.id}
                  type="button"
                  className={`${styles.lessonTab} ${activeLessonIdx === idx ? styles.lessonTabActive : ""
                    }`}
                  onClick={() => setActiveLessonIdx(idx)}
                >
                  {isDone && <CheckCircle2 size={13} style={{ display: "inline", marginRight: "4px" }} />}
                  <span>{idx + 1}. {les.title}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* 3D Mascot Robot Companion Card */}
        <section className={styles.robotCompanionCard}>
          <div className={styles.robotCanvasWrap}>
            <LessonRobot reaction={robotReaction} reactionKey={robotKey} />
          </div>

          <div className={styles.robotSpeech}>
            <div className={styles.robotSpeechHeader}>
              <Sparkles size={13} />
              <span>CODELAND ROBOT COMPANION</span>
            </div>
            <div className={styles.robotSpeechBubble}>
              {robotMessage}
            </div>
          </div>
        </section>

        {/* Main 2-Column Learning Workspace */}
        <main className={styles.workspaceGrid}>
          {/* Left Column: Visual Explanation & 3D Visualizer & Youth Analogy */}
          <div className={styles.columnLeft}>
            {/* Interactive 3D / GSAP Visualizer */}
            <AlgoVisualizer
              lesson={currentLesson}
              accent={currentSector.accent}
            />

            {/* Youth-Friendly Analogy & Story Card */}
            <section className={styles.youthAnalogyCard}>
              <div className={styles.analogyHeader}>
                <h3 className={styles.analogyTitle}>
                  {currentLesson.analogyTitle || "Intuitive & Fun Explanation 💡"}
                </h3>
                <span className={styles.analogyTag}>YOUTH-FRIENDLY ANALOGY</span>
              </div>

              <p className={styles.analogyText}>
                {currentLesson.analogyDescription || currentLesson.concept}
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#34d399" }}>
                  Time: {currentLesson.timeComplexity}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid #f59e0b", color: "#fbbf24" }}>
                  Space: {currentLesson.spaceComplexity}
                </span>
              </div>
            </section>

            <LessonExplanationPanel lessonId={currentLesson.id} />

            {/* C++ Code Showcase */}
            <section className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <div className={styles.codeBadge}>
                  <Code2 size={16} />
                  <span>C++ IMPLEMENTATION</span>
                </div>

                <button
                  type="button"
                  className={styles.copyCodeBtn}
                  onClick={handleCopyCode}
                >
                  {copiedCode ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                  <span>{copiedCode ? "Copied!" : "Copy C++ Code"}</span>
                </button>
              </div>

              <pre className={styles.codeBlock}>
                <code>{currentLesson.cppCode}</code>
              </pre>
            </section>
          </div>

          {/* Right Column: Quiz & Interactive Code Playground */}
          <div className={styles.columnRight}>
            {/* Multiple Choice Quiz */}
            <section className={styles.quizCard}>
              <div className={styles.quizTag}>
                <BookOpen size={13} />
                <span>TEST YOUR UNDERSTANDING · +75 XP</span>
              </div>

              <h3 className={styles.quizQuestion}>
                {currentLesson.question}
              </h3>

              <div className={styles.quizOptionsList}>
                {currentLesson.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    type="button"
                    className={`${styles.quizOption} ${selectedOption === oIdx ? styles.quizOptionSelected : ""
                      }`}
                    onClick={() => {
                      setSelectedOption(oIdx);
                      setQuizSubmitted(false);
                    }}
                  >
                    <span className={styles.quizOptionLetter}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={styles.submitQuizBtn}
                disabled={selectedOption === null}
                onClick={handleQuizSubmit}
              >
                <span>Submit Answer</span>
              </button>

              {quizSubmitted && (
                <div
                  className={`${styles.feedbackBox} ${quizIsCorrect ? styles.feedbackSuccess : styles.feedbackError
                    }`}
                >
                  <strong>
                    {quizIsCorrect
                      ? "✓ Outstanding! Correct answer and +75 XP awarded!"
                      : "✕ Not quite! Review the explanation and try again."}
                  </strong>
                  <p style={{ margin: "6px 0 0", fontSize: "12px" }}>
                    {quizIsCorrect
                      ? currentLesson.explanation
                      : "Look closely at how elements move in the visualizer above and give it another try!"}
                  </p>
                </div>
              )}
            </section>

            {/* Interactive Code Playground */}
            <section className={styles.playgroundCard}>
              <div className={styles.playgroundHeader}>
                <div className={styles.playgroundTag}>
                  <Terminal size={15} />
                  <span>Write & Test Your Algorithm (C++ Playground)</span>
                </div>
                <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  ONLINE JUDGE
                </span>
              </div>

              {/* Monaco Code Editor */}
              <div className={styles.editorWrap}>
                <Editor
                  height="220px"
                  language="cpp"
                  theme="vs-dark"
                  value={userCode}
                  onChange={(val) => setUserCode(val || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'Fira Code', monospace",
                    scrollBeyondLastLine: false,
                    tabSize: 2,
                    automaticLayout: true,
                    lineNumbersMinChars: 3,
                    padding: { top: 8, bottom: 8 },
                  }}
                />
              </div>

              {/* Custom Input Accordion */}
              <div className={styles.customInputSection}>
                <button
                  type="button"
                  className={styles.customInputToggle}
                  onClick={() => setShowCustomInput((prev) => !prev)}
                  style={needsInput ? { borderColor: "rgba(56, 189, 248, 0.5)", background: "rgba(14, 165, 233, 0.12)", color: "#38bdf8" } : {}}
                >
                  {showCustomInput || needsInput ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  <span>{needsInput ? "Program Input (cin >>) Detected - stdin" : "Custom Input (stdin)"}</span>
                </button>
                {(showCustomInput || needsInput) && (
                  <textarea
                    className={styles.customInputArea}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom input / stdin for cin (e.g. 25)..."
                    spellCheck={false}
                  />
                )}
              </div>

              <button
                type="button"
                className={styles.runCodeBtn}
                onClick={handleRunCode}
                disabled={isRunningCode}
              >
                {isRunningCode ? (
                  <>
                    <Loader2 size={14} className={styles.spinIcon} />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Run</span>
                  </>
                )}
              </button>

              {codeRunOutput && (
                <div
                  className={styles.testResultConsole}
                  style={{
                    borderColor: codeRunOutput.success ? "#10b981" : "#f43f5e",
                  }}
                >
                  <div className={styles.consoleStatusRow}>
                    <span
                      className={`${styles.consoleBadge} ${codeRunOutput.success
                        ? styles.badgeSuccess
                        : codeRunOutput.status === "TIME_LIMIT_EXCEEDED"
                          ? styles.badgeWarn
                          : styles.badgeError
                        }`}
                    >
                      {codeRunOutput.status || (codeRunOutput.success ? "SUCCESS" : "ERROR")}
                    </span>

                    {codeRunOutput.executionTime && (
                      <span className={styles.consoleMeta}>
                        <Clock size={12} />
                        <span>{codeRunOutput.executionTime}</span>
                      </span>
                    )}
                  </div>

                  {codeRunOutput.compileError && (
                    <div style={{ color: "#fda4af", whiteSpace: "pre-wrap", fontSize: "12px" }}>
                      <strong style={{ display: "block", marginBottom: "4px" }}>Compilation Error:</strong>
                      <pre style={{ margin: 0, color: "#fca5a5", whiteSpace: "pre-wrap" }}>{codeRunOutput.compileError}</pre>
                    </div>
                  )}

                  {codeRunOutput.stderr && !codeRunOutput.compileError && (
                    <div style={{ color: "#fb7185", whiteSpace: "pre-wrap", fontSize: "12px" }}>
                      <strong style={{ display: "block", marginBottom: "4px" }}>Standard Error:</strong>
                      <pre style={{ margin: 0, color: "#fda4af", whiteSpace: "pre-wrap" }}>{codeRunOutput.stderr}</pre>
                    </div>
                  )}

                  {codeRunOutput.stdout && (
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
                      <strong style={{ color: "#34d399", display: "block", marginBottom: "4px" }}>Standard Output:</strong>
                      <pre style={{ margin: 0, color: "#e2e8f0", whiteSpace: "pre-wrap" }}>{codeRunOutput.stdout}</pre>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
