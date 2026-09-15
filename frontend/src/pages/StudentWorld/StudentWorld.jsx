import { Suspense, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Canvas } from "@react-three/fiber";

import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  LockKeyhole,
  Map,
  RotateCcw,
  Sparkles,
  Play,
  Trophy,
} from "lucide-react";

import WebWorldScene from "../../components/StudentWorld/WebWorldScene";

import {
  WEB_WORLD_CAMERA,
  buildWebWorldLevels,
  loadWebWorldProgress,
} from "../../data/webWorldLevels";

import styles from "./StudentWorld.module.css";

const LEVEL_ROUTES = {
  "html-foundations": "/student/level/html-foundations",
  "css-styling": "/student/level/css-styling",
  "javascript-core": "/student/level/javascript-core",
  "react-nexus": "/student/level/react-nexus",
  "project-showcase": "/student/level/project-showcase",
};

function StudentWorld() {
  const navigate = useNavigate();

  /* ====================================================== */
  /* WORLD STATES */
  /* ====================================================== */

  const [selectedLevel, setSelectedLevel] = useState(null);

  const [lockedLevel, setLockedLevel] = useState(null);

  /* ====================================================== */
  /* JOURNEY STATES */
  /* ====================================================== */

  const [journeyActive, setJourneyActive] = useState(false);

  const [journeyPhase, setJourneyPhase] = useState("idle");

  const [journeyLevel, setJourneyLevel] = useState(null);

  /* ====================================================== */
  /* CURRENT USER */
  /* ====================================================== */

  const currentUser = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("codeland_current_user");

      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });
    }
  }, [currentUser, navigate]);

  /* ====================================================== */
  /* WORLD PROGRESS */
  /* ====================================================== */

  const userId = currentUser?.id || currentUser?.email || "guest";

  const [worldProgress, setWorldProgress] = useState(() =>
    loadWebWorldProgress(userId),
  );

  useEffect(() => {
    const syncWorldProgress = () => {
      setWorldProgress(loadWebWorldProgress(userId));
    };

    syncWorldProgress();

    window.addEventListener("focus", syncWorldProgress);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncWorldProgress();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncWorldProgress);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);

  const worldLevels = useMemo(
    () => buildWebWorldLevels(worldProgress),
    [worldProgress],
  );

  const worldCompleted = useMemo(
    () =>
      worldLevels.length > 0 &&
      worldLevels.every((level) => level.status === "completed"),
    [worldLevels],
  );

  const currentLevel = useMemo(
    () =>
      worldLevels.find((level) => level.status === "current") ||
      worldLevels[worldLevels.length - 1] ||
      null,
    [worldLevels],
  );

  const worldProgressPercent = useMemo(() => {
    if (!worldLevels.length) {
      return 0;
    }

    const totalProgress = worldLevels.reduce(
      (total, level) => total + (Number(level.progress) || 0),
      0,
    );

    if (worldCompleted) {
      return 100;
    }

    return Math.round(totalProgress / worldLevels.length);
  }, [worldLevels, worldCompleted]);

  /* ====================================================== */
  /* LOCK MESSAGE TIMER */
  /* ====================================================== */

  useEffect(() => {
    if (!lockedLevel) {
      return;
    }

    const timer = window.setTimeout(() => {
      setLockedLevel(null);
    }, 2800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [lockedLevel]);

  /* ====================================================== */
  /* STUDENT NAME */
  /* ====================================================== */

  const studentName =
    currentUser?.email?.split("@")[0]?.replace(/[._-]/g, " ") || "Student";

  /* ====================================================== */
  /* LEVEL SELECT */
  /* ====================================================== */

  const handleSelectLevel = (level) => {
    if (journeyActive) {
      return;
    }

    setLockedLevel(null);

    setSelectedLevel(level);
  };

  /* ====================================================== */
  /* LOCKED LEVEL */
  /* ====================================================== */

  const handleLockedLevel = (level) => {
    if (journeyActive) {
      return;
    }

    setSelectedLevel(null);

    setLockedLevel(level);
  };

  /* ====================================================== */
  /* BEGIN LEVEL */
  /* ====================================================== */

  const handleBeginLevel = () => {
    if (!selectedLevel || journeyActive) {
      return;
    }

    const targetRoute = LEVEL_ROUTES[selectedLevel.id];

    if (!targetRoute) {
      console.warn(
        `[CodeLand] No learning page connected for "${selectedLevel.id}".`,
      );

      return;
    }

    setLockedLevel(null);

    setJourneyLevel(selectedLevel);

    setSelectedLevel(null);

    setJourneyPhase("approach");

    setJourneyActive(true);
  };

  /* ====================================================== */
  /* JOURNEY PHASE */
  /* ====================================================== */

  const handleJourneyPhase = (phase) => {
    setJourneyPhase(phase);
  };

  /* ====================================================== */
  /* JOURNEY COMPLETE */
  /* ====================================================== */

  const handleJourneyComplete = () => {
    const targetRoute = LEVEL_ROUTES[journeyLevel?.id];

    if (targetRoute) {
      navigate(targetRoute, {
        replace: false,
      });

      return;
    }

    setJourneyActive(false);
    setJourneyPhase("idle");
    setJourneyLevel(null);
  };

  /* ====================================================== */
  /* JOURNEY STATUS TEXT */
  /* ====================================================== */

  const getJourneyStatus = () => {
    switch (journeyPhase) {
      case "approach":
        return "ROUTE INITIALIZED";

      case "walking":
        return "APPROACHING PORTAL";

      case "charging":
        return "PORTAL CHARGING";

      case "entering":
        return `ENTERING ${(journeyLevel?.title || "LEVEL").toUpperCase()}`;

      default:
        return "PREPARING JOURNEY";
    }
  };

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <main className={styles.page}>
      {/* ================================================= */}
      {/* 3D WORLD */}
      {/* ================================================= */}

      <div className={styles.canvasWrapper}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{
            position: WEB_WORLD_CAMERA.position,

            fov: 42,

            near: 0.1,

            far: 150,
          }}
          gl={{
            antialias: true,

            powerPreference: "high-performance",

            toneMapping: 4,

            toneMappingExposure: 1.05,
          }}
          onPointerMissed={() => {
            /*
              During the cinematic,
              clicking the canvas
              should do nothing.
            */

            if (journeyActive) {
              return;
            }

            if (selectedLevel) {
              setSelectedLevel(null);
            }
          }}
        >
          <Suspense fallback={null}>
            <WebWorldScene
              levels={worldLevels}
              currentLevelId={currentLevel?.id}
              journeyLevelId={journeyLevel?.id}
              selectedLevel={selectedLevel}
              journeyActive={journeyActive}
              onJourneyPhase={handleJourneyPhase}
              onJourneyComplete={handleJourneyComplete}
              onSelect={handleSelectLevel}
              onLocked={handleLockedLevel}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* ================================================= */}
      {/* NORMAL WORLD UI */}
      {/* ================================================= */}

      {!journeyActive && (
        <>
          {/* ============================================= */}
          {/* TOP HUD */}
          {/* ============================================= */}

          <header className={styles.hud}>
            <div className={styles.hudLeft}>
              <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate("/student/choose-path")}
              >
                <ArrowLeft size={17} />
              </button>

              <div className={styles.brandIcon}>
                <Bot size={20} />
              </div>

              <div>
                <span className={styles.brand}>
                  Code
                  <strong>Land</strong>
                </span>

                <p>LEARN · BUILD · EXPLORE</p>
              </div>
            </div>

            <div className={styles.worldTitle}>
              <span>JOURNEY 01</span>

              <strong>THE WEB WORLD</strong>
            </div>

            <div className={styles.profile}>
              <div>
                <span>EXPLORER</span>

                <strong>{studentName}</strong>
              </div>

              <div className={styles.avatar}>
                {currentUser?.email?.charAt(0)?.toUpperCase() || "S"}
              </div>
            </div>
          </header>

          {/* ============================================= */}
          {/* WORLD INTRO */}
          {/* ============================================= */}

          {!selectedLevel && (
            <section className={styles.worldIntro}>
              <div className={styles.worldIntroBadge}>
                {worldCompleted ? <Trophy size={13} /> : <Map size={13} />}
                {worldCompleted ? "WORLD MASTERED" : "WEB CREATOR"}
              </div>

              <span className={styles.chapter}>WORLD 01</span>

              <h1>
                {worldCompleted ? "Web World" : "The Web"}
                <span>{worldCompleted ? " Complete." : " World."}</span>
              </h1>

              <p>
                {worldCompleted
                  ? "You mastered every area of the Web World. Revisit any island whenever you want."
                  : "Turn your ideas into amazing digital experiences."}
              </p>

              <div className={styles.worldProgress}>
                <div className={styles.progressHead}>
                  <span>WORLD PROGRESS</span>

                  <strong>{worldProgressPercent}%</strong>
                </div>

                <div className={styles.progressTrack}>
                  <span
                    style={{
                      width: `${worldProgressPercent}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          )}

          {/* ============================================= */}
          {/* LEVEL DETAIL */}
          {/* ============================================= */}

          {selectedLevel && (
            <aside
              className={styles.levelPanel}
              style={{
                "--panel-accent": selectedLevel.accent,
              }}
            >
              <button
                type="button"
                className={styles.closePanel}
                onClick={() => setSelectedLevel(null)}
              >
                <RotateCcw size={15} />
                World View
              </button>

              <div className={styles.panelEyebrow}>
                <span>{selectedLevel.order}</span>
                {selectedLevel.status === "completed"
                  ? "COMPLETED LEVEL"
                  : "CURRENT LEVEL"}
              </div>

              <h2>{selectedLevel.title}</h2>

              <h3>{selectedLevel.subtitle}</h3>

              <p>{selectedLevel.description}</p>

              <div className={styles.levelStats}>
                <div>
                  <span>LESSONS</span>

                  <strong>{selectedLevel.lessons}</strong>
                </div>

                <div>
                  <span>CHALLENGES</span>

                  <strong>{selectedLevel.challenges}</strong>
                </div>

                <div>
                  <span>PROGRESS</span>

                  <strong>{selectedLevel.progress}%</strong>
                </div>
              </div>

              <button
                type="button"
                className={styles.enterLevelButton}
                onClick={handleBeginLevel}
              >
                <span>
                  {selectedLevel.status === "completed"
                    ? "Revisit Level"
                    : "Begin Level"}
                </span>

                {selectedLevel.status === "completed" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>

              <div className={styles.panelHint}>
                <Sparkles size={14} />
                {selectedLevel.status === "completed"
                  ? "You completed this area. Revisit it anytime."
                  : "Your coding adventure continues here."}
              </div>
            </aside>
          )}

          {/* ============================================= */}
          {/* LOCKED LEVEL */}
          {/* ============================================= */}

          {lockedLevel && (
            <div className={styles.lockedNotice}>
              <div className={styles.lockIcon}>
                <LockKeyhole size={18} />
              </div>

              <div>
                <strong>{lockedLevel.title} is locked</strong>

                <span>Complete every area before this one to unlock it.</span>
              </div>
            </div>
          )}

          {/* ============================================= */}
          {/* CONTROLS */}
          {/* ============================================= */}

          {!selectedLevel && (
            <div className={styles.controlsHint}>
              <span>DRAG</span>
              Explore
              <i />
              <span>SCROLL</span>
              Zoom
              <i />
              <span>CLICK</span>
              {worldCompleted ? "Revisit Area" : "Focus Area"}
            </div>
          )}

          {/* ============================================= */}
          {/* WORLD IDENTIFIER */}
          {/* ============================================= */}

          <div className={styles.worldNumber}>
            <span>01</span>

            <div />

            <small>WEB REALM</small>
          </div>
        </>
      )}

      {/* ================================================= */}
      {/* CINEMATIC JOURNEY */}
      {/* ================================================= */}

      {journeyActive && (
        <div className={styles.journeyCinematic}>
          {/* CINEMATIC BLACK BARS */}

          <div className={styles.cinematicTop} />

          <div className={styles.cinematicBottom} />

          {/* WORLD / LEVEL INDICATOR */}

          <div className={styles.cinematicChapter}>
            <span>WORLD 01</span>

            <strong>
              {(journeyLevel?.title || "HTML Foundations").toUpperCase()}
            </strong>
          </div>

          {/* JOURNEY STATUS */}

          <div className={styles.journeyStatus} aria-live="polite">
            <span>{getJourneyStatus()}</span>

            <div className={styles.journeyDots}>
              <i />
              <i />
              <i />
            </div>
          </div>

          {/* CORNER DETAILS */}

          <div className={styles.cinematicLeft}>
            <span>CODELAND</span>

            <small>JOURNEY SYSTEM</small>
          </div>

          <div className={styles.cinematicRight}>
            <span>{journeyLevel?.order || "01"}</span>

            <small>{journeyLevel?.code || "HTML"}</small>
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentWorld;
