import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  Palette,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import HubLayout from "../../components/Hub/HubLayout";
import Arena3DStage from "../../components/Hub/Arena3DStage";
import { practiceChallenges } from "../../data/hubContent";
import { getSummary, userKey, writeStored } from "../../services/learningHub";
import soundEngine from "../../services/soundEngine";
import {
  submitChallengeProgress,
  fetchMyChallengeSubmissions,
} from "../../services/learningContentService";

const CATEGORY_THEMES = {
  HTML: {
    accent: "#ff6b4a",
    secondary: "#f97316",
    glow: "rgba(255, 107, 74, 0.25)",
    icon: Code2,
    file: "index.html",
    matrix: "STRUCTURE",
  },
  CSS: {
    accent: "#38bdf8",
    secondary: "#6366f1",
    glow: "rgba(56, 189, 248, 0.25)",
    icon: Palette,
    file: "styles.css",
    matrix: "STYLING",
  },
  JavaScript: {
    accent: "#facc15",
    secondary: "#f59e0b",
    glow: "rgba(250, 204, 21, 0.22)",
    icon: Zap,
    file: "script.js",
    matrix: "RUNTIME",
  },
  Python: {
    accent: "#38bdf8",
    secondary: "#10b981",
    glow: "rgba(16, 185, 129, 0.22)",
    icon: Terminal,
    file: "main.py",
    matrix: "LOGIC",
  },
  "C++": {
    accent: "#818cf8",
    secondary: "#3b82f6",
    glow: "rgba(99, 102, 241, 0.25)",
    icon: Cpu,
    file: "core.cpp",
    matrix: "MEMORY",
  },
  React: {
    accent: "#06b6d4",
    secondary: "#c084fc",
    glow: "rgba(6, 182, 212, 0.25)",
    icon: Boxes,
    file: "App.jsx",
    matrix: "REACTORS",
  },
};

function formatCodePreview(code = "") {
  const lines = code.trim().split("\n");
  const sliced = lines.slice(0, 4);
  const text = sliced.join("\n") + (lines.length > 4 ? "\n..." : "");
  return { lines: sliced, text };
}

export default function Challenges() {
  const { challengeId } = useParams();
  const [filter, setFilter] = useState("All challenges");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(() => getSummary().practiceIds);

  const cardsContainerRef = useRef(null);
  const missionRef = useRef(null);

  // Sync challenge completions from backend database
  useEffect(() => {
    let isMounted = true;
    fetchMyChallengeSubmissions()
      .then((data) => {
        if (!isMounted || !data?.passedChallengeIds) return;
        const remoteIds = data.passedChallengeIds
          .map((id) => Number(id))
          .filter((n) => Number.isInteger(n) && n >= 1 && n <= 6);
        if (remoteIds.length > 0) {
          setCompleted((prev) => {
            const merged = Array.from(new Set([...prev, ...remoteIds]));
            try {
              writeStored(`codeland_practice_${userKey()}`, merged);
            } catch {
              // ignore storage errors
            }
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn("[CodeLand] Failed to load challenge submissions:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const challenge = practiceChallenges.find(
    (item) => String(item.id) === challengeId,
  );

  const currentTheme = challenge
    ? CATEGORY_THEMES[challenge.category] || CATEGORY_THEMES.HTML
    : CATEGORY_THEMES.HTML;

  // Compute 3D Core interaction state
  const arenaState =
    result === true
      ? "correct"
      : result === false
      ? "wrong"
      : selected !== null
      ? "selected"
      : "idle";

  // Mouse move interactive spotlight
  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  // GSAP animation for challenge catalog cards
  useLayoutEffect(() => {
    if (!challengeId && cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(
        ".hub-challenge-card",
      );
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 35,
            rotateX: 12,
            scale: 0.95,
            transformPerspective: 1000,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
      }
    }
  }, [filter, challengeId]);

  // GSAP animation when entering single challenge mission
  useLayoutEffect(() => {
    if (challenge && missionRef.current) {
      gsap.fromTo(
        missionRef.current.children,
        {
          opacity: 0,
          y: 25,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
        },
      );
    }
  }, [challengeId]);

  const check = () => {
    if (!challenge) return;
    const correct = selected === challenge.answer;
    const submittedText = challenge.options[selected] || String(selected);

    // Sync challenge submission to PostgreSQL backend!
    submitChallengeProgress(challenge.id, submittedText, correct, 25).catch((err) => {
      console.warn("[CodeLand] Submit challenge sync error:", err);
    });

    if (correct) {
      soundEngine.playSuccess();
      if (!completed.includes(challenge.id)) {
        const next = [...completed, challenge.id];
        try {
          writeStored(`codeland_practice_${userKey()}`, next);
          setCompleted(next);
          setError("");
        } catch {
          setError(
            "Your answer is correct, but progress could not be saved. Please enable browser storage and check again.",
          );
          return;
        }
      }
    } else {
      soundEngine.playError();
    }
    setResult(correct);
  };

  const activeTheme = currentTheme;
  const ActiveCategoryIcon = activeTheme.icon;

  return (
    <HubLayout title="Practice arena">
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <Code2 size={13} /> A LITTLE CHALLENGE. A NEW SUPERPOWER.
          </span>
          <h1>
            {challenge ? challenge.title : "Put your skills into play."}
          </h1>
          <p>
            {challenge
              ? "Read the code, think it through, and make your move."
              : "Small puzzles. Real understanding. Every discovery counts."}
          </p>
        </div>
        <span className="hub-tag">
          <Zap size={13} />
          {completed.length * 25} ARENA XP
        </span>
      </div>

      {challengeId && !challenge ? (
        <div className="hub-empty">
          <h2>This challenge doesn't exist.</h2>
          <Link
            className="hub-btn primary"
            to="/challenges"
            onClick={() => soundEngine.playClick("soft")}
          >
            Back to the arena
          </Link>
        </div>
      ) : challenge ? (
        <>
          <div style={{ marginBottom: "20px" }}>
            <Link
              to="/challenges"
              className="hub-btn small ghost"
              onClick={() => soundEngine.playClick("soft")}
            >
              <ArrowLeft size={14} />
              All challenges
            </Link>
          </div>

          <div className="hub-split hub-spaced" ref={missionRef}>
            {/* LEFT: MISSION CODE */}
            <section
              className="hub-panel hub-card-3d"
              style={{
                "--card-accent": activeTheme.accent,
                "--card-secondary": activeTheme.secondary,
                "--card-glow": activeTheme.glow,
              }}
            >
              <div className="hub-mission-header">
                <span className="hub-challenge-category">
                  <ActiveCategoryIcon size={14} />
                  {challenge.category}
                </span>
                <span
                  className={`hub-challenge-difficulty ${challenge.difficulty.toLowerCase()}`}
                >
                  <span className="hub-diff-dot" />
                  {challenge.difficulty}
                </span>
                <span className="hub-status-badge reward">
                  <Zap size={13} />
                  +25 XP
                </span>
              </div>

              <h2 className="hub-spaced">Your mission</h2>
              <p className="hub-lesson-copy">{challenge.description}</p>

              <div className="hub-code">
                <div className="hub-code-label">
                  <span>
                    {challenge.category.toUpperCase()} · {activeTheme.file}
                  </span>
                  <span>PREDICT &amp; SOLVE</span>
                </div>
                <pre>
                  <code>{challenge.code}</code>
                </pre>
              </div>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginTop: "auto",
                }}
              >
                <Sparkles size={14} color="#38bdf8" /> Take your time.
                Understanding beats guessing.
              </p>
            </section>

            {/* RIGHT: ANSWER CHOICES */}
            <section className="hub-panel hub-card-3d">
              <h2>What's your answer?</h2>

              <div
                className="hub-answers"
                role="group"
                aria-label="Answer choices"
              >
                {challenge.options.map((option, i) => (
                  <button
                    key={option}
                    className={`hub-answer ${selected === i ? "selected" : ""}`}
                    aria-pressed={selected === i}
                    onClick={() => {
                      setSelected(i);
                      setResult(null);
                      soundEngine.playClick("cyber");
                    }}
                  >
                    <span className="hub-answer-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="hub-answer-text">{option}</span>
                  </button>
                ))}
              </div>

              <button
                className="hub-btn primary"
                disabled={selected === null}
                onClick={check}
                style={{ width: "100%", marginTop: "12px" }}
              >
                Check answer <ArrowRight size={14} />
              </button>

              {error && (
                <p className="hub-feedback" role="alert">
                  {error}
                </p>
              )}

              {result !== null && (
                <div
                  className={`hub-feedback ${result ? "success" : ""}`}
                  role="status"
                >
                  <strong>
                    {result
                      ? "Nicely done! Challenge completed."
                      : "Not quite. Give it another try."}
                  </strong>
                  <p style={{ margin: "6px 0 0" }}>
                    {result
                      ? challenge.explanation
                      : "Look carefully at what each line does. You can change your answer and try again."}
                  </p>
                  {result && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "12px",
                        opacity: 0.85,
                      }}
                    >
                      25 XP awarded · Arena Core Synchronized
                    </p>
                  )}
                </div>
              )}

              {result && (
                <Link
                  to={
                    challenge.id < practiceChallenges.length
                      ? `/challenges/${challenge.id + 1}`
                      : "/student/achievements"
                  }
                  className="hub-btn ghost"
                  style={{
                    marginTop: "14px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onClick={() => soundEngine.playClick("pop")}
                >
                  {challenge.id < practiceChallenges.length
                    ? "Next challenge"
                    : "View achievements"}
                  <ArrowRight size={14} />
                </Link>
              )}
            </section>
          </div>

          {/* 3D Core Stage for Active Mission */}
          <div style={{ marginTop: "28px" }}>
            <Arena3DStage
              state={arenaState}
              title={`MISSION ${challenge.id} · ${challenge.category.toUpperCase()}`}
              subtitle={
                arenaState === "correct"
                  ? "Neural Link Synchronized · +25 XP"
                  : arenaState === "wrong"
                  ? "Anomaly Detected · Recalibrate Answer"
                  : arenaState === "selected"
                  ? "Answer Primed · Awaiting Confirmation"
                  : "Awaiting Input · Neural Core Ready"
              }
            />
          </div>
        </>
      ) : (
        <>
          {/* 3D Core Stage for Arena Catalog */}
          <Arena3DStage
            state={arenaState}
            title="Cyber Arena Core"
            subtitle={`${completed.length} / ${practiceChallenges.length} Challenges Mastered`}
          />

          {/* Toolbar with Filter Tabs and Mastery Meter */}
          <div className="hub-toolbar">
            <div className="hub-tabs">
              {["All challenges", "Beginner", "Intermediate", "Completed"].map(
                (item) => (
                  <button
                    key={item}
                    aria-pressed={filter === item}
                    onClick={() => {
                      setFilter(item);
                      soundEngine.playClick("soft");
                    }}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <div className="hub-progress-pill">
              <div className="hub-progress-info">
                <span>ARENA MASTERY</span>
                <strong>
                  {Math.round(
                    (completed.length / (practiceChallenges.length || 1)) * 100,
                  )}
                  %
                </strong>
              </div>
              <div className="hub-progress-track">
                <div
                  className="hub-progress-bar"
                  style={{
                    width: `${
                      (completed.length / (practiceChallenges.length || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3D CHALLENGE CARDS */}
          <div className="hub-catalog" ref={cardsContainerRef}>
            {practiceChallenges
              .filter(
                (item) =>
                  filter === "All challenges" ||
                  item.difficulty === filter ||
                  (filter === "Completed" && completed.includes(item.id)),
              )
              .map((item) => {
                const theme =
                  CATEGORY_THEMES[item.category] || CATEGORY_THEMES.HTML;
                const CategoryIcon = theme.icon;
                const isCompleted = completed.includes(item.id);
                const { lines, text } = formatCodePreview(item.code);

                return (
                  <article
                    className="hub-challenge-card hub-card-3d"
                    key={item.id}
                    onMouseMove={handleCardMouseMove}
                    style={{
                      "--card-accent": theme.accent,
                      "--card-secondary": theme.secondary,
                      "--card-glow": theme.glow,
                    }}
                  >
                    {/* Top Neon Ambient Edge */}
                    <div className="hub-card-neon-edge" aria-hidden="true" />

                    {/* Card Header: Category & Difficulty & Reward */}
                    <div className="hub-challenge-top">
                      <div className="hub-challenge-tags">
                        <span className="hub-challenge-category">
                          <CategoryIcon size={13} />
                          {item.category}
                        </span>
                        <span
                          className={`hub-challenge-difficulty ${item.difficulty.toLowerCase()}`}
                        >
                          <span className="hub-diff-dot" />
                          {item.difficulty}
                        </span>
                      </div>

                      <div className="hub-challenge-status">
                        {isCompleted ? (
                          <span className="hub-status-badge completed">
                            <CheckCircle2 size={13} />
                            MASTERED
                          </span>
                        ) : (
                          <span className="hub-status-badge reward">
                            <Zap size={13} />
                            +25 XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Cyber Terminal Preview Window */}
                    <div className="hub-challenge-terminal">
                      <div className="hub-terminal-header">
                        <div className="hub-terminal-dots" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </div>
                        <span className="hub-terminal-file">{theme.file}</span>
                        <span className="hub-terminal-badge">{theme.matrix}</span>
                      </div>

                      <div className="hub-terminal-code">
                        <div className="hub-terminal-lines" aria-hidden="true">
                          {lines.map((_, idx) => (
                            <span key={idx}>{idx + 1}</span>
                          ))}
                        </div>
                        <pre>
                          <code>{text}</code>
                        </pre>
                        <div
                          className="hub-terminal-scanline"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Card Content: Title & Description */}
                    <div className="hub-challenge-content">
                      <h2 className="hub-challenge-title">{item.title}</h2>
                      <p className="hub-challenge-desc">{item.description}</p>
                    </div>

                    {/* Card Footer & Action Button */}
                    <div className="hub-challenge-footer">
                      <div className="hub-challenge-meta">
                        <span>
                          <Clock3 size={13} /> Self-paced
                        </span>
                        <span>
                          <Sparkles size={13} /> Interactive
                        </span>
                      </div>

                      <Link
                        to={`/challenges/${item.id}`}
                        className={`hub-challenge-action ${
                          isCompleted ? "completed" : "primary"
                        }`}
                        onClick={() => soundEngine.playClick("pop")}
                      >
                        <span>
                          {isCompleted ? "Retake Mission" : "Launch Mission"}
                        </span>
                        <ArrowRight size={15} className="hub-action-arrow" />
                      </Link>
                    </div>
                  </article>
                );
              })}
          </div>

          {filter === "Completed" && !completed.length && (
            <div className="hub-empty">
              <Code2 size={40} />
              <h2>Your first win is waiting.</h2>
              <p>Solve a challenge and it will appear here in your hall of fame.</p>
              <button
                className="hub-btn primary"
                onClick={() => {
                  setFilter("All challenges");
                  soundEngine.playClick("soft");
                }}
              >
                Find a challenge
              </button>
            </div>
          )}
        </>
      )}
    </HubLayout>
  );
}
