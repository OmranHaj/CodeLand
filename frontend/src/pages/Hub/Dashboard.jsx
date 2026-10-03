import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Compass,
  Flame,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import StudentCheerNotification from "../../components/Hub/StudentCheerNotification";
import { fetchStudentProgress } from "../../services/learningContentService";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudentProgress();
      if (!res) {
        throw new Error("Unable to retrieve student progress from database.");
      }
      setData(res);
    } catch (err) {
      console.error("[Dashboard] Error fetching progress:", err);
      setError(
        err?.message || "Failed to load progress. Please verify server connection."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Derived telemetry calculations from live database records
  const {
    studentName,
    dailyGoal,
    totalXp,
    streakDays,
    lessonsCount,
    challengesCount,
    worldsCompleted,
    webPercent,
    cppPercent,
    algoPercent,
    activePathInfo,
    goalProgress,
  } = useMemo(() => {
    const user = data?.user || {};
    const progressList = Array.isArray(data?.progress) ? data.progress : [];

    const name = user.name || user.email?.split("@")[0] || "Explorer";
    const goal = user.UserProfile?.dailyGoal || 3;
    const xp = Number.isFinite(user.totalXp) ? user.totalXp : 0;

    let lessons = 0;
    let challenges = 0;
    let completedWorlds = 0;

    for (const record of progressList) {
      if (Array.isArray(record.completedLessonIds)) {
        lessons += new Set(record.completedLessonIds).size;
      }
      if (Array.isArray(record.completedChallengeIds)) {
        challenges += new Set(record.completedChallengeIds).size;
      }
      if (
        record.status === "COMPLETED" ||
        (Number(record.progressPercent) || 0) >= 100
      ) {
        completedWorlds += 1;
      }
    }

    // Web Track Progress (5 levels in curriculum)
    const webLevelIds = [
      "html-foundations",
      "css-styling",
      "javascript-core",
      "react-nexus",
      "project-showcase",
    ];
    const webRecords = progressList.filter(
      (p) =>
        p.trackId === "web-creator" ||
        p.trackId === "web" ||
        webLevelIds.includes(p.levelId)
    );
    const webSum = webRecords.reduce(
      (sum, r) => sum + (Number(r.progressPercent) || 0),
      0
    );
    const calculatedWebPercent = Math.min(
      100,
      Math.round(webSum / webLevelIds.length)
    );

    // C++ Track Progress (9 levels in curriculum)
    const cppLevelIds = [
      "cpp-syntax-core",
      "cpp-data-circuits",
      "cpp-logic-gates",
      "cpp-function-engine",
      "cpp-array-matrix",
      "cpp-memory-vault",
      "cpp-object-forge",
      "cpp-stl-command",
      "cpp-final-system",
    ];
    const cppRecords = progressList.filter(
      (p) =>
        p.trackId === "cpp-developer" ||
        p.trackId === "cpp" ||
        cppLevelIds.includes(p.levelId)
    );
    const cppSum = cppRecords.reduce(
      (sum, r) => sum + (Number(r.progressPercent) || 0),
      0
    );
    const calculatedCppPercent = Math.min(
      100,
      Math.round(cppSum / cppLevelIds.length)
    );

    // Algorithm & Data Structures (8 sectors in database curriculum)
    const algoRecords = progressList.filter(
      (p) =>
        p.trackId === "algorithm-master" ||
        p.trackId === "algo" ||
        // p.trackId === "python" || // MOCK DATA: Commented out because Python is not in the database
        p.levelId?.includes("algo")
        // || p.levelId?.includes("python") // MOCK DATA: Commented out
    );
    const algoSum = algoRecords.reduce(
      (sum, r) => sum + (Number(r.progressPercent) || 0),
      0
    );
    const calculatedAlgoPercent = Math.min(100, Math.round(algoSum / 5));

    // Determine active path from most recently accessed level in DB
    const sortedByAccess = [...progressList].sort(
      (a, b) =>
        new Date(b.lastAccessedAt || 0).getTime() -
        new Date(a.lastAccessedAt || 0).getTime()
    );
    const lastActive = sortedByAccess[0];

    let pathName = "Web Creator";
    let pathRoute = "/student/world";

    if (lastActive) {
      if (
        lastActive.trackId === "cpp-developer" ||
        lastActive.trackId === "cpp" ||
        cppLevelIds.includes(lastActive.levelId)
      ) {
        pathName = "C++ Developer";
        pathRoute = "/student/cpp-world";
      } else if (
        lastActive.trackId === "algorithm-master" ||
        lastActive.trackId === "algo" ||
        lastActive.levelId?.includes("algo")
      ) {
        pathName = "Algorithm & Data Structures";
        pathRoute = "/student/python-world";
      }
    }

    return {
      studentName: name,
      dailyGoal: goal,
      totalXp: xp,
      streakDays: Number.isFinite(user.streakDays) ? user.streakDays : 0,
      lessonsCount: lessons,
      challengesCount: challenges,
      worldsCompleted: completedWorlds,
      webPercent: calculatedWebPercent,
      cppPercent: calculatedCppPercent,
      algoPercent: calculatedAlgoPercent,
      activePathInfo: { name: pathName, route: pathRoute },
      goalProgress: Math.min(challenges, goal),
    };
  }, [data]);

  // Loading State with Sci-Fi Spinner
  if (loading) {
    return (
      <HubLayout title="Overview">
        <div
          style={{
            minHeight: "450px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            color: "#94a3b8",
          }}
        >
          <Loader2
            size={36}
            color="#818cf8"
            style={{ animation: "spin 1s linear infinite" }}
          />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.5px",
            }}
          >
            Connecting to CodeLand Neural Network & Loading Live Progress...
          </p>
        </div>
      </HubLayout>
    );
  }

  // Error State with Retry Button
  if (error) {
    return (
      <HubLayout title="Overview">
        <div
          className="hub-panel hub-card-3d"
          style={{
            maxWidth: "600px",
            margin: "50px auto",
            textAlign: "center",
            padding: "36px 24px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h2
            style={{ fontSize: "18px", color: "#f8fafc", marginBottom: "8px" }}
          >
            Unable to Synchronize Student Progress
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#94a3b8",
              marginBottom: "22px",
              lineHeight: "1.6",
            }}
          >
            {error}
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "12px" }}
          >
            <button className="hub-btn primary" onClick={loadProgress}>
              <RefreshCw size={15} /> Retry Connection
            </button>
            <Link className="hub-btn ghost" to="/login">
              Sign In Again
            </Link>
          </div>
        </div>
      </HubLayout>
    );
  }

  const paths = [
    {
      name: "Web Creator",
      subtitle: "HTML, CSS, JavaScript & React",
      symbol: "</>",
      accent: "#a78bfa",
      progress: webPercent,
      to: "/student/world",
    },
    {
      name: "C++ Developer",
      subtitle: "Logic, memory & powerful systems",
      symbol: "C++",
      accent: "#38bdf8",
      progress: cppPercent,
      to: "/student/cpp-world",
    },
    {
      name: "Algorithm & Data Structures",
      subtitle: "Algorithms, Trees, Graphs & Dynamic Programming",
      symbol: "Algo",
      accent: "#34d399",
      progress: algoPercent,
      to: "/student/python-world",
    },
  ];

  const stats = [
    [Zap, totalXp, "Total XP earned", "#a78bfa"],
    [Flame, streakDays, "Day streak 🔥", "#f97316"],
    [BookOpen, lessonsCount, "Lessons completed", "#38bdf8"],
    [Code2, challengesCount, "Challenges solved", "#34d399"],
  ];

  return (
    <HubLayout title="Overview">
      {/* REAL-TIME PARENT CHEER NOTIFICATION */}
      <StudentCheerNotification />

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <Sparkles size={13} /> YOUR NEXT CHAPTER
          </span>
          <h1>Ready to build, {studentName.split(" ")[0]}?</h1>
          <p>
            Big ideas start with a little curiosity. Let's make something great
            today.
          </p>
        </div>

        <Link className="hub-btn ghost" to="/student/choose-path">
          <Compass size={16} />
          Explore worlds
        </Link>
      </div>

      {/* ================================================= */}
      {/* 3D HERO COMPANION & FEATURE */}
      {/* ================================================= */}
      <section
        className="hub-feature hub-card-3d"
        aria-label="Continue learning"
      >
        <div className="hub-feature-copy hub-3d-layer-front">
          <span className="hub-tag">
            <span>✦</span> YOUR ADVENTURE AWAITS
          </span>
          <h2>
            Small steps.
            <br />
            <span>Extraordinary possibilities.</span>
          </h2>
          <p>
            Unlock new skills, bring your ideas to life, and turn “what if” into
            “I made this.”
          </p>
          <div className="hub-feature-links">
            <Link className="hub-btn primary" to={activePathInfo.route}>
              {lessonsCount > 0 ? "Continue learning" : "Start your journey"}
              <ArrowRight size={15} />
            </Link>
            <span>{activePathInfo.name} path</span>
          </div>
        </div>

        <div className="hub-orbit" aria-hidden="true">
          <div className="hub-orbit-ring" />
          <div className="hub-orbit-ring" />
          <div className="hub-orbit-ring" />

          <div className="hub-robot-head">
            <div className="hub-robot-face">
              <i />
              <i />
            </div>
          </div>

          <span className="hub-float-chip one">&lt;/&gt;</span>
          <span className="hub-float-chip two">{"{ }"}</span>
          <span className="hub-float-chip three">✦</span>

          <span className="hub-orbit-caption">YOUR CODING COMPANION</span>
        </div>
      </section>

      {/* ================================================= */}
      {/* 3D HOLOGRAPHIC STATS */}
      {/* ================================================= */}
      <section
        className="hub-stats hub-scene-3d"
        aria-label="Learning statistics"
      >
        {stats.map(([Icon, value, label, accent]) => (
          <div
            className="hub-stat hub-card-3d"
            key={label}
            style={{ "--accent": accent, "--card-glow": accent }}
          >
            <div className="hub-stat-icon">
              <Icon size={22} />
            </div>
            <div className="hub-3d-layer-mid">
              <strong>{value.toLocaleString()}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ================================================= */}
      {/* 3D COLUMNS: PATHS & GOAL */}
      {/* ================================================= */}
      <div className="hub-columns">
        {/* LEARNING PATHS */}
        <section>
          <div className="hub-section-heading">
            <h2>Your learning paths</h2>
            <Link to="/courses">
              View all courses <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="hub-path-list hub-scene-3d">
            {paths.map((path) => (
              <Link
                to={path.to}
                className="hub-path-row hub-card-3d"
                key={path.name}
                style={{ "--accent": path.accent, "--card-glow": path.accent }}
              >
                <span className="hub-path-symbol">{path.symbol}</span>
                <div className="hub-path-info">
                  <div className="hub-path-top">
                    <h3>{path.name}</h3>
                    <span>{path.progress}%</span>
                  </div>
                  <p>{path.subtitle}</p>
                  <div
                    className="hub-progress"
                    role="progressbar"
                    aria-label={`${path.name} progress`}
                    aria-valuenow={path.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${path.progress}%` }} />
                  </div>
                </div>

                <div className="hub-path-arrow">
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MOMENTUM & PRACTICE GOAL */}
        <section>
          <div className="hub-section-heading">
            <h2>A little momentum</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Flame size={17} color="#f97316" />
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f97316" }}>
                {streakDays > 0 ? `${streakDays}d Streak 🔥` : "0d Streak"}
              </span>
            </div>
          </div>

          <div className="hub-panel hub-card-3d">
            <h2>Your practice goal</h2>
            <p>One challenge at a time. You've got this.</p>

            <div className="hub-goal">
              <div
                className="hub-goal-ring"
                style={{
                  "--progress": `${(goalProgress / dailyGoal) * 100}%`,
                }}
              >
                <strong>
                  {goalProgress}
                  <small>/{dailyGoal}</small>
                </strong>
              </div>

              <div className="hub-goal-copy">
                <strong>
                  {goalProgress >= dailyGoal
                    ? "Goal achieved! 🎉"
                    : "Keep your curiosity going"}
                </strong>
                <p>{dailyGoal} arena challenges</p>
                <Link
                  className="hub-inline-link"
                  style={{ fontSize: 11 }}
                  to="/challenges"
                >
                  {goalProgress >= dailyGoal
                    ? "Try another challenge"
                    : "Jump into practice"}
                </Link>
              </div>
            </div>

            {/* STREAK STATUS INDICATOR */}
            <div
              style={{
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "12px",
                background:
                  streakDays > 0
                    ? "rgba(249, 115, 22, 0.08)"
                    : "rgba(148, 163, 184, 0.06)",
                border:
                  streakDays > 0
                    ? "1px solid rgba(249, 115, 22, 0.25)"
                    : "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "12px",
                color: streakDays > 0 ? "#fdba74" : "#94a3b8",
              }}
            >
              <Flame size={16} color={streakDays > 0 ? "#f97316" : "#64748b"} />
              <span>
                {streakDays > 0 ? (
                  <>
                    <strong>{streakDays}-day streak active!</strong> Solve any lesson
                    or challenge today to keep your streak burning! 🔥
                  </>
                ) : (
                  <>
                    Solve any lesson or challenge today to ignite your streak! 🔥
                  </>
                )}
              </span>
            </div>

            <div className="hub-tip" style={{ marginTop: "12px" }}>
              <Target size={18} />
              <span>
                Understanding one new idea is progress. Your pace is the right
                pace.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================= */}
      {/* 3D CELEBRATION CALLOUT */}
      {/* ================================================= */}
      <div className="hub-bottom-callout hub-card-3d">
        <Trophy size={28} />
        <div className="hub-3d-layer-mid">
          <h3>Your effort deserves a little celebration.</h3>
          <p>
            Complete lessons and challenges to unlock your achievement
            collection.
          </p>
        </div>
        <Link className="hub-btn small ghost" to="/student/achievements">
          View achievements <ArrowUpRight size={14} />
        </Link>
      </div>
    </HubLayout>
  );
}
