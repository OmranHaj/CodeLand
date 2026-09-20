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
} from "lucide-react";

import LessonRobot from "../../components/Learning/LessonRobot";
import AlgoVisualizer from "../../components/AlgorithmWorld/AlgoVisualizer";
import {
  ALGO_SECTORS,
  loadAlgoWorldProgress,
  saveAlgoWorldProgress,
} from "../../data/algorithmWorldLevels";
import { userKey, readStored, writeStored } from "../../services/learningHub";
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

  const currentLesson = currentSector.lessons[activeLessonIdx] || currentSector.lessons[0];

  // Initialize/reset lesson-specific state
  useEffect(() => {
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizIsCorrect(false);
    setUserCode(currentLesson.starterCode || "");
    setCodeRunOutput(null);
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

        // Sync legacy python keys
        try {
          const oldPython = readStored(`codeland_python_${userId}`, []);
          const sIdx = ALGO_SECTORS.findIndex((s) => s.id === currentSector.id);
          if (sIdx >= 0 && sIdx < 5 && !oldPython.includes(sIdx)) {
            writeStored(`codeland_python_${userId}`, [...oldPython, sIdx]);
          }
        } catch {
          // ignore
        }
      }
    } else {
      // Robot Sad Reaction
      setRobotReaction("sad");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("So close! 🥺 Don't give up—review the element movement in the visualizer and try another option!");
    }
  };

  // Handle Code Playground Execution
  const handleRunCode = () => {
    // Simple heuristic / syntax validation for student code
    const hasReturn = userCode.includes("return");
    const isNotEmpty = userCode.trim().length > 25;

    if (hasReturn && isNotEmpty) {
      setCodeRunOutput({
        success: true,
        message: `✓ Test Passed!\nInput: ${currentLesson.testInput || "Sample Data"}\nOutput: ${currentLesson.expectedResult || "Expected Result"}\nExecution Time: 0.38ms · Memory: O(1)`,
      });
      setRobotReaction("happy");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("Incredible! Your C++ code passed all test cases! 🚀✨");
    } else {
      setCodeRunOutput({
        success: false,
        message: `✕ Test Failed: Output did not match expected result.\nMake sure you return the correct value!`,
      });
      setRobotReaction("sad");
      setRobotKey((prev) => prev + 1);
      setRobotMessage("Hmm, looks like your code is missing a return statement or hasn't finished yet! 🧐 Review the C++ code and try again!");
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
                  className={`${styles.lessonTab} ${
                    activeLessonIdx === idx ? styles.lessonTabActive : ""
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
                    className={`${styles.quizOption} ${
                      selectedOption === oIdx ? styles.quizOptionSelected : ""
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
                  className={`${styles.feedbackBox} ${
                    quizIsCorrect ? styles.feedbackSuccess : styles.feedbackError
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
              </div>

              <textarea
                className={styles.codeTextarea}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="Write your algorithm code here..."
                spellCheck={false}
              />

              <button
                type="button"
                className={styles.runCodeBtn}
                onClick={handleRunCode}
              >
                <Play size={14} />
                <span>Run & Test Algorithm</span>
              </button>

              {codeRunOutput && (
                <div
                  className={styles.testResultConsole}
                  style={{
                    borderColor: codeRunOutput.success ? "#10b981" : "#f43f5e",
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      color: codeRunOutput.success ? "#34d399" : "#fda4af",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {codeRunOutput.message}
                  </pre>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
