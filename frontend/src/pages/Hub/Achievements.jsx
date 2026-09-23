import { useState, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  Code2,
  Compass,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import HubLayout from "../../components/Hub/HubLayout";
import Trophy3DShowcase from "../../components/Hub/Trophy3DShowcase";
import { getSummary } from "../../services/learningHub";

export default function Achievements() {
  const summary = getSummary();

  const badges = [
    {
      title: "First spark",
      description: "Complete your very first lesson.",
      current: summary.lessons,
      target: 1,
      Icon: Sparkles,
      accent: "#a855f7",
    },
    {
      title: "Curious mind",
      description: "Discover something new in 5 lessons.",
      current: summary.lessons,
      target: 5,
      Icon: BookOpen,
      accent: "#38bdf8",
    },
    {
      title: "Problem solver",
      description: "Solve 3 coding challenges in the arena.",
      current: summary.challenges,
      target: 3,
      Icon: Code2,
      accent: "#34d399",
    },
    {
      title: "XP explorer",
      description: "Earn your first 250 experience points.",
      current: summary.xp,
      target: 250,
      Icon: Zap,
      accent: "#fbbf24",
    },
    {
      title: "World builder",
      description: "Complete an entire learning world.",
      current: summary.completed,
      target: 1,
      Icon: Compass,
      accent: "#f43f5e",
    },
    {
      title: "Arena champion",
      description: "Solve all 6 practice arena challenges.",
      current: summary.practiceIds.length,
      target: 6,
      Icon: Trophy,
      accent: "#eab308",
    },
  ];

  const earned = badges.filter((badge) => badge.current >= badge.target).length;

  // Track the badge currently being inspected in the 3D Showcase
  const [selectedBadge, setSelectedBadge] = useState(
    () => badges.find((b) => b.current >= b.target) || badges[0],
  );

  const gridRef = useRef(null);

  // GSAP 3D entrance animation for badge cards
  useLayoutEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".hub-badge-card");
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 40,
          rotateY: -18,
          scale: 0.94,
          transformPerspective: 1000,
        },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
        },
      );
    }
  }, []);

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
            Every badge tells a story. Click any card to inspect it in the 3D
            Holographic Showcase.
          </p>
        </div>
        <span className="hub-tag">
          <Trophy size={13} />
          {earned} / {badges.length} UNLOCKED
        </span>
      </div>

      {/* ================================================= */}
      {/* 3D INTERACTIVE TROPHY SHOWCASE */}
      {/* ================================================= */}
      <div style={{ marginBottom: "32px" }}>
        <Trophy3DShowcase
          badge={selectedBadge}
          totalEarned={earned}
          totalBadges={badges.length}
        />
      </div>

      {/* ================================================= */}
      {/* 3D BADGE GRID */}
      {/* ================================================= */}
      <div className="hub-badge-grid hub-scene-3d" ref={gridRef}>
        {badges.map((badge) => {
          const { title, description, current, target, Icon } = badge;
          const isUnlocked = current >= target;
          const isSelected = selectedBadge?.title === title;

          return (
            <article
              className={`hub-badge-card hub-card-3d ${
                !isUnlocked ? "locked" : ""
              } ${isSelected ? "selected" : ""}`}
              key={title}
              onClick={() => setSelectedBadge(badge)}
              style={{
                cursor: "pointer",
                "--badge-accent": badge.accent,
                borderColor: isSelected
                  ? badge.accent
                  : undefined,
                boxShadow: isSelected
                  ? `0 0 30px ${badge.accent}40`
                  : undefined,
              }}
            >
              <div
                className="hub-badge-emblem"
                style={{
                  background: isUnlocked
                    ? `linear-gradient(145deg, ${badge.accent}50, ${badge.accent}15)`
                    : undefined,
                  color: isUnlocked ? badge.accent : undefined,
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
                aria-valuemax={target}
                aria-valuenow={Math.min(current, target)}
              >
                <span
                  style={{
                    width: `${Math.min(current / target, 1) * 100}%`,
                    background: isUnlocked ? badge.accent : undefined,
                  }}
                />
              </div>

              <div className="hub-badge-status">
                {isUnlocked
                  ? "✦ Achievement unlocked"
                  : `${current} / ${target} · Keep exploring`}
              </div>
            </article>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* BOTTOM CALLOUT */}
      {/* ================================================= */}
      <div className="hub-bottom-callout hub-card-3d">
        <Rocket size={28} />
        <div className="hub-3d-layer-mid">
          <h3>The best achievement? Something you made yourself.</h3>
          <p>
            Keep learning, experiment often, and enjoy every little breakthrough.
          </p>
        </div>
        <Link className="hub-btn primary small" to="/courses">
          Keep discovering <ArrowRight size={14} />
        </Link>
      </div>
    </HubLayout>
  );
}
