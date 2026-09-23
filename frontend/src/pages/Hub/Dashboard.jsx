import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Compass,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import {
  getProfile,
  getSummary,
  getUser,
  pathRoute,
  userKey,
} from "../../services/learningHub";

export default function Dashboard() {
  const user = getUser();
  const profile = getProfile(user);
  const summary = getSummary(user);

  let activePath;
  try {
    activePath = localStorage.getItem(`codeland_active_path_${userKey(user)}`);
  } catch {
    /* default to web */
  }

  const pathName =
    activePath === "cpp-developer"
      ? "C++ Developer"
      : activePath === "python-explorer"
      ? "Algorithm & Data Structures"
      : "Web Creator";

  const paths = [
    {
      name: "Web Creator",
      subtitle: "HTML, CSS, JavaScript & React",
      symbol: "</>",
      accent: "#a78bfa",
      progress: summary.webPercent,
      to: "/student/world",
    },
    {
      name: "C++ Developer",
      subtitle: "Logic, memory & powerful systems",
      symbol: "C++",
      accent: "#38bdf8",
      progress: summary.cppPercent,
      to: "/student/cpp-world",
    },
    {
      name: "Algorithm & Data Structures",
      subtitle: "Algorithms, Trees, Graphs & Dynamic Programming",
      symbol: "Algo",
      accent: "#34d399",
      progress: summary.pythonPercent,
      to: "/student/python-world",
    },
  ];

  const stats = [
    [Zap, summary.xp, "Total XP earned", "#a78bfa"],
    [BookOpen, summary.lessons, "Lessons completed", "#38bdf8"],
    [Code2, summary.challenges, "Challenges solved", "#34d399"],
    [Trophy, summary.completed, "Worlds completed", "#fbbf24"],
  ];

  const goalProgress = Math.min(summary.practiceIds.length, profile.goal);

  return (
    <HubLayout title="Overview">
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <Sparkles size={13} /> YOUR NEXT CHAPTER
          </span>
          <h1>Ready to build, {profile.name.split(" ")[0]}?</h1>
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
      <section className="hub-feature hub-card-3d" aria-label="Continue learning">
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
            <Link
              className="hub-btn primary"
              to={user ? pathRoute(activePath) : "/student/choose-path"}
            >
              {summary.lessons ? "Continue learning" : "Start your journey"}
              <ArrowRight size={15} />
            </Link>
            <span>{pathName} path</span>
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
      <section className="hub-stats hub-scene-3d" aria-label="Learning statistics">
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
            <Flame size={17} color="#f59e0b" />
          </div>

          <div className="hub-panel hub-card-3d">
            <h2>Your practice goal</h2>
            <p>One challenge at a time. You've got this.</p>

            <div className="hub-goal">
              <div
                className="hub-goal-ring"
                style={{
                  "--progress": `${(goalProgress / profile.goal) * 100}%`,
                }}
              >
                <strong>
                  {goalProgress}
                  <small>/{profile.goal}</small>
                </strong>
              </div>

              <div className="hub-goal-copy">
                <strong>
                  {goalProgress >= profile.goal
                    ? "Goal achieved! 🎉"
                    : "Keep your curiosity going"}
                </strong>
                <p>{profile.goal} arena challenges</p>
                <Link
                  className="hub-inline-link"
                  style={{ fontSize: 11 }}
                  to="/challenges"
                >
                  {goalProgress >= profile.goal
                    ? "Try another challenge"
                    : "Jump into practice"}
                </Link>
              </div>
            </div>

            <div className="hub-tip">
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
