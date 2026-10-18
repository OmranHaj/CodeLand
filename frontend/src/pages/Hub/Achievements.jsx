import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Code2,
  Compass,
  Cpu,
  Flame,
  Loader2,
  Lock,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import HubLayout from "../../components/Hub/HubLayout";
import Trophy3DShowcase from "../../components/Hub/Trophy3DShowcase";
import ContestCertificate from "../../components/Contest/ContestCertificate";
import { loadStudentMedals } from "../../services/contestService";
import { getUser } from "../../services/learningHub";
import {
  fetchAllAchievements,
  fetchMyAchievements,
} from "../../services/achievementsService";

const ICON_MAP = {
  "first-step": Sparkles,
  "curious-mind": BookOpen,
  "challenge-gladiator": Code2,
  "first-project": Rocket,
  "xp-explorer": Zap,
  "xp-1000": Trophy,
  "streak-3": Flame,
  "streak-7": Award,
  "web-creator-apprentice": Compass,
  "cpp-system-pioneer": ShieldCheck,
  "algorithm-mastermind": Cpu,
};

const ACCENT_MAP = {
  "first-step": "#a855f7",
  "curious-mind": "#38bdf8",
  "challenge-gladiator": "#34d399",
  "first-project": "#f43f5e",
  "xp-explorer": "#fbbf24",
  "xp-1000": "#eab308",
  "streak-3": "#f97316",
  "streak-7": "#ec4899",
  "web-creator-apprentice": "#6366f1",
  "cpp-system-pioneer": "#06b6d4",
  "algorithm-mastermind": "#8b5cf6",
};

const FALLBACK_PALETTE = [
  "#a855f7",
  "#38bdf8",
  "#34d399",
  "#fbbf24",
  "#f43f5e",
  "#eab308",
  "#6366f1",
  "#06b6d4",
];

function formatUnlockDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function Achievements() {
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [contestMedals, setContestMedals] = useState(() => loadStudentMedals());
  const [activeCertMedal, setActiveCertMedal] = useState(null);

  const gridRef = useRef(null);

  // Sync contest medals from localStorage
  useEffect(() => {
    const handleMedals = () => {
      setContestMedals(loadStudentMedals());
    };
    window.addEventListener("codeland:medals_update", handleMedals);
    return () => window.removeEventListener("codeland:medals_update", handleMedals);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [available, earned] = await Promise.all([
        fetchAllAchievements().catch((err) => {
          console.warn("Failed to fetch available achievements:", err);
          return [];
        }),
        fetchMyAchievements().catch((err) => {
          console.warn("Failed to fetch earned achievements:", err);
          return [];
        }),
      ]);

      const earnedList = Array.isArray(earned) ? earned : [];
      const availableList = Array.isArray(available) ? available : [];

      setAllBadges(availableList);
      setMyBadges(earnedList);
    } catch (err) {
      setError(err?.message || "Failed to load achievements. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Map backend badges into display cards with unlocked status
  const processedBadges = allBadges.map((badge, index) => {
    const userAch = myBadges.find(
      (ua) =>
        ua.achievementId === badge.id ||
        ua.id === badge.id ||
        (ua.achievement && ua.achievement.id === badge.id),
    );

    const isUnlocked = Boolean(userAch);
    const Icon = ICON_MAP[badge.id] || Award;
    const accent =
      ACCENT_MAP[badge.id] || FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
    const unlockedDate = userAch ? formatUnlockDate(userAch.unlockedAt) : null;

    return {
      ...badge,
      isUnlocked,
      current: isUnlocked ? 1 : 0,
      target: 1,
      Icon,
      accent,
      unlockedDate,
    };
  });

  const totalEarned = processedBadges.filter((b) => b.isUnlocked).length;

  // Set default selected badge for 3D inspection when loaded
  useEffect(() => {
    if (processedBadges.length > 0) {
      setSelectedBadge((prev) => {
        if (prev && processedBadges.some((b) => b.id === prev.id)) {
          return processedBadges.find((b) => b.id === prev.id);
        }
        return processedBadges.find((b) => b.isUnlocked) || processedBadges[0];
      });
    }
  }, [allBadges, myBadges]);

  // GSAP 3D entrance animation for badge cards when loaded
  useLayoutEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".hub-badge-card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 35,
            rotateY: -16,
            scale: 0.94,
            transformPerspective: 1000,
          },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
      }
    }
  }, [loading, processedBadges.length]);

  return (
    <HubLayout title="Achievements">
      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <Award size={13} /> LITTLE WINS. LASTING CONFIDENCE.
          </span>
          <h1>Look how far you can go.</h1>
          <p>
            Every badge marks a verified milestone. Click any card to inspect it
            in the 3D Holographic Showcase.
          </p>
        </div>
        <span className="hub-tag">
          <Trophy size={13} />
          {loading ? "..." : `${totalEarned} / ${processedBadges.length} UNLOCKED`}
        </span>
      </div>

      {/* ================================================= */}
      {/* ERROR BANNER */}
      {/* ================================================= */}
      {error && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px 20px",
            borderRadius: "14px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#fca5a5",
          }}
        >
          <span>{error}</span>
          <button
            onClick={loadData}
            className="hub-btn ghost small"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* 3D INTERACTIVE TROPHY SHOWCASE */}
      {/* ================================================= */}
      <div style={{ marginBottom: "32px" }}>
        <Trophy3DShowcase
          badge={selectedBadge}
          totalEarned={totalEarned}
          totalBadges={processedBadges.length}
        />
      </div>

      {/* ================================================= */}
      {/* WEEKLY SUNDAY CONTEST HONORS & CERTIFICATES       */}
      {/* ================================================= */}
      <div
        style={{
          marginBottom: "36px",
          background: "linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(13, 18, 33, 0.85) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.15em",
                color: "#fbbf24",
                textTransform: "uppercase",
              }}
            >
              <Trophy size={13} /> WEEKLY SUNDAY ARENA HONORS
            </span>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#f8fafc",
                margin: "4px 0 2px 0",
              }}
            >
              Championship Medals & Diplomas
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              Official recognition conferred during our weekly Sunday programming competitions.
            </p>
          </div>

          <Link
            to="/student/contest"
            className="hub-btn ghost small"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              borderColor: "rgba(245, 158, 11, 0.4)",
              color: "#fde047",
            }}
          >
            Enter Sunday Arena <ArrowRight size={14} />
          </Link>
        </div>

        {contestMedals.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {contestMedals.map((medal) => {
              const isGold = medal.medalType === "gold";
              const isSilver = medal.medalType === "silver";
              const accent = isGold ? "#fbbf24" : isSilver ? "#cbd5e1" : "#f97316";

              return (
                <div
                  key={medal.id}
                  style={{
                    background: "rgba(10, 15, 30, 0.8)",
                    border: `1px solid ${accent}50`,
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "12px",
                      }}
                    >
                      <span style={{ fontSize: "28px" }}>
                        {isGold ? "🥇" : isSilver ? "🥈" : "🥉"}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: "14px",
                            color: accent,
                          }}
                        >
                          {medal.medalTitle}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          Edition {medal.edition} • {medal.dateAwarded}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginBottom: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      Score: <strong style={{ color: "#f8fafc" }}>{medal.score}</strong> • Earned{" "}
                      <strong style={{ color: accent }}>+{medal.xpWon} XP</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveCertMedal(medal)}
                    className="hub-btn primary small"
                    style={{
                      width: "100%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    <Award size={14} /> View & Print Official Diploma
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            No Sunday medals earned yet. Register for this Sunday's arena to compete for the podium!
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* LOADING STATE */}
      {/* ================================================= */}
      {loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: "16px",
            color: "#94a3b8",
          }}
        >
          <Loader2 size={36} className="hub-spinner" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ fontSize: "14px", letterSpacing: "0.02em" }}>
            Connecting to CodeLand database and verifying milestones...
          </p>
        </div>
      ) : (
        /* ================================================= */
        /* 3D BADGE GRID */
        /* ================================================= */
        <div className="hub-badge-grid hub-scene-3d" ref={gridRef}>
          {processedBadges.map((badge) => {
            const {
              id,
              title,
              description,
              criteria,
              xpReward,
              isUnlocked,
              unlockedDate,
              Icon,
              accent,
            } = badge;
            const isSelected = selectedBadge?.id === id;

            return (
              <article
                className={`hub-badge-card hub-card-3d ${!isUnlocked ? "locked" : ""
                  } ${isSelected ? "selected" : ""}`}
                key={id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  cursor: "pointer",
                  "--badge-accent": accent,
                  borderColor: isSelected ? accent : undefined,
                  boxShadow: isSelected ? `0 0 30px ${accent}40` : undefined,
                }}
              >
                <div
                  className="hub-badge-emblem"
                  style={{
                    background: isUnlocked
                      ? `linear-gradient(145deg, ${accent}50, ${accent}15)`
                      : undefined,
                    color: isUnlocked ? accent : undefined,
                  }}
                >
                  <Icon size={34} />
                </div>

                <h2>{title}</h2>
                <p>{description}</p>

                <div
                  className="hub-progress"
                  role="progressbar"
                  aria-label={title}
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={isUnlocked ? 1 : 0}
                >
                  <span
                    style={{
                      width: isUnlocked ? "100%" : "0%",
                      background: isUnlocked ? accent : undefined,
                    }}
                  />
                </div>

                <div className="hub-badge-status">
                  {isUnlocked ? (
                    <span style={{ color: accent }}>
                      ✦ Unlocked {unlockedDate ? `· ${unlockedDate}` : ""}
                      {xpReward ? ` (+${xpReward} XP)` : ""}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#64748b",
                      }}
                    >
                      <Lock size={12} />
                      {criteria || "Keep exploring to unlock"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ================================================= */}
      {/* BOTTOM CALLOUT */}
      {/* ================================================= */}
      <div className="hub-bottom-callout hub-card-3d">
        <Rocket size={28} />
        <div className="hub-3d-layer-mid">
          <h3>The best achievement? Something you made yourself.</h3>
          <p>
            Build projects, conquer challenges, and unlock new badges as you
            level up your skills.
          </p>
        </div>
        <Link className="hub-btn primary small" to="/courses">
          Keep discovering <ArrowRight size={14} />
        </Link>
      </div>

      {/* Official Luxurious Printable Certificate Modal */}
      {activeCertMedal && (
        <ContestCertificate
          medalData={activeCertMedal}
          initialStudentName={
            getUser()?.fullName || getUser()?.name || "CodeLand Champion"
          }
          onClose={() => setActiveCertMedal(null)}
        />
      )}
    </HubLayout>
  );
}
