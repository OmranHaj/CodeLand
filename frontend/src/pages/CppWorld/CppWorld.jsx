import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { OrbitControls } from "@react-three/drei";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Gauge,
  Map,
  Orbit,
  Power,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import * as THREE from "three";

import CppWorldScene from "../../components/CppWorld/CppWorldScene";

import {
  CPP_WORLD_CAMERA,
  buildCppWorldLevels,
  getCurrentCppWorldLevel,
  isCppWorldCompleted,
  loadCppWorldProgress,
  resetCppWorldProgress,
} from "../../data/cppWorldLevels";

import styles from "./CppWorld.module.css";

/* ====================================================== */
/* ROUTES */
/* ====================================================== */

const CPP_LEVEL_ROUTES = {
  "cpp-syntax-core": "/student/level/cpp-syntax-core",
  "cpp-data-circuits": "/student/level/cpp-data-circuits",
  "cpp-logic-gates": "/student/level/cpp-logic-gates",
  "cpp-function-engine": "/student/level/cpp-function-engine",
  "cpp-array-matrix": "/student/level/cpp-array-matrix",
  "cpp-memory-vault": "/student/level/cpp-memory-vault",
  "cpp-object-forge": "/student/level/cpp-object-forge",
  "cpp-stl-command": "/student/level/cpp-stl-command",
  "cpp-final-system": "/student/level/cpp-final-system",
};

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
/* CAMERA RIG */
/* ====================================================== */

function CppCameraRig({ selectedLevel, overviewMode, disabled = false }) {
  const { camera } = useThree();

  const controlsRef = useRef(null);

  const [mouseExploreReady, setMouseExploreReady] = useState(false);

  const targetPosition = useRef(
    new THREE.Vector3(...CPP_WORLD_CAMERA.position),
  );

  const targetLookAt = useRef(new THREE.Vector3(...CPP_WORLD_CAMERA.target));

  const currentLookAt = useRef(new THREE.Vector3(...CPP_WORLD_CAMERA.target));

  /* ==================================================== */
  /* CAMERA DESTINATION */
  /* ==================================================== */

  useEffect(() => {
    /*
      Overview always returns to the master C++ Core view first.
      Once the camera reaches it, OrbitControls takes over and
      the student can freely inspect the city with the mouse.
    */
    if (overviewMode || !selectedLevel) {
      setMouseExploreReady(false);

      targetPosition.current.set(...CPP_WORLD_CAMERA.position);

      targetLookAt.current.set(...CPP_WORLD_CAMERA.target);

      return;
    }

    setMouseExploreReady(false);

    const cameraPosition =
      selectedLevel.cameraPosition || CPP_WORLD_CAMERA.position;

    const cameraTarget = selectedLevel.cameraTarget || selectedLevel.position;

    targetPosition.current.set(...cameraPosition);

    targetLookAt.current.set(...cameraTarget);
  }, [selectedLevel, overviewMode]);

  /* ==================================================== */
  /* CINEMATIC RIG + MOUSE EXPLORATION */
  /* ==================================================== */

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    /*
      Once Overview has settled, OrbitControls owns the camera.
      We only keep the player inside sensible C++ Core bounds.
    */
    if (overviewMode && mouseExploreReady && controls && !disabled) {
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, -9, 9);

      controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.2, 7);

      controls.target.z = THREE.MathUtils.clamp(controls.target.z, -20, 3);

      camera.position.y = Math.max(camera.position.y, 1.4);

      controls.update();

      return;
    }

    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      targetPosition.current.x,
      3.7,
      delta,
    );

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetPosition.current.y,
      3.7,
      delta,
    );

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetPosition.current.z,
      3.7,
      delta,
    );

    currentLookAt.current.x = THREE.MathUtils.damp(
      currentLookAt.current.x,
      targetLookAt.current.x,
      4.2,
      delta,
    );

    currentLookAt.current.y = THREE.MathUtils.damp(
      currentLookAt.current.y,
      targetLookAt.current.y,
      4.2,
      delta,
    );

    currentLookAt.current.z = THREE.MathUtils.damp(
      currentLookAt.current.z,
      targetLookAt.current.z,
      4.2,
      delta,
    );

    camera.lookAt(currentLookAt.current);

    if (controls) {
      controls.target.copy(currentLookAt.current);

      controls.update();
    }

    /*
      Enable mouse exploration only after the Overview camera
      has returned home. This keeps sector transitions cinematic.
    */
    if (overviewMode && !disabled) {
      const positionDistance = camera.position.distanceTo(
        targetPosition.current,
      );

      const targetDistance = currentLookAt.current.distanceTo(
        targetLookAt.current,
      );

      if (positionDistance < 0.08 && targetDistance < 0.05) {
        setMouseExploreReady(true);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={overviewMode && mouseExploreReady && !disabled}
      makeDefault
      enableDamping
      dampingFactor={0.055}
      enableRotate
      enableZoom
      enablePan
      rotateSpeed={0.58}
      zoomSpeed={0.78}
      panSpeed={0.68}
      minDistance={9}
      maxDistance={34}
      minPolarAngle={0.42}
      maxPolarAngle={1.38}
      screenSpacePanning
      target={CPP_WORLD_CAMERA.target}
    />
  );
}

/* ====================================================== */
/* LEVEL HELPERS */
/* ====================================================== */

function getStatusCopy(level) {
  if (level.status === "completed") {
    return {
      label: "SYSTEM ONLINE",
      icon: CheckCircle2,
    };
  }

  if (level.status === "current") {
    return {
      label: "ACTIVE SECTOR",
      icon: Power,
    };
  }

  return {
    label: "AVAILABLE",
    icon: Zap,
  };
}

/* ====================================================== */
/* PAGE */
/* ====================================================== */

function CppWorld() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => getCurrentUser(), []);

  const userId = currentUser?.id || currentUser?.email || "guest";

  const [worldProgress, setWorldProgress] = useState(() =>
    loadCppWorldProgress(userId),
  );

  const [selectedLevelId, setSelectedLevelId] = useState(null);

  const [overviewMode, setOverviewMode] = useState(true);

  const [booted, setBooted] = useState(false);

  const [enteringSector, setEnteringSector] = useState(null);

  const enterTimeoutRef = useRef(null);

  const worldLevels = useMemo(
    () => buildCppWorldLevels(worldProgress),
    [worldProgress],
  );

  const currentLevel = useMemo(
    () => getCurrentCppWorldLevel(worldProgress),
    [worldProgress],
  );

  const worldCompleted = useMemo(
    () => isCppWorldCompleted(worldProgress),
    [worldProgress],
  );

  const selectedLevel = useMemo(
    () => worldLevels.find((level) => level.id === selectedLevelId) || null,
    [worldLevels, selectedLevelId],
  );

  const completedCount = worldProgress.completedLevelIds.length;

  const totalLevels = worldLevels.length;

  const worldProgressPercent =
    totalLevels > 0
      ? Math.round(
          worldLevels.reduce(
            (sum, level) => sum + Number(level.progress || 0),
            0,
          ) / totalLevels,
        )
      : 0;

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
  /* BOOT */
  /* ==================================================== */

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setBooted(true);
    }, 420);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        window.clearTimeout(enterTimeoutRef.current);
      }
    };
  }, []);

  /* ==================================================== */
  /* PROGRESS SYNC */
  /* ==================================================== */

  useEffect(() => {
    const syncProgress = () => {
      setWorldProgress(loadCppWorldProgress(userId));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncProgress();
      }
    };

    syncProgress();

    window.addEventListener("focus", syncProgress);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", syncProgress);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId]);

  /* ==================================================== */
  /* DEFAULT CURRENT LEVEL */
  /* ==================================================== */

  useEffect(() => {
    if (!currentLevel || selectedLevelId) {
      return;
    }

    setSelectedLevelId(currentLevel.id);
  }, [currentLevel, selectedLevelId]);

  /* ==================================================== */
  /* SELECT LEVEL */
  /* ==================================================== */

  const handleSelectLevel = (level) => {
    if (!level) {
      return;
    }

    setSelectedLevelId(level.id);
    setOverviewMode(false);
  };

  /* ==================================================== */
  /* ENTER LEVEL */
  /* ==================================================== */

  const handleEnterLevel = () => {
    if (!selectedLevel || enteringSector) {
      return;
    }

    const route = CPP_LEVEL_ROUTES[selectedLevel.id];

    if (!route) {
      return;
    }

    setEnteringSector({
      id: selectedLevel.id,
      title: selectedLevel.title,
      code: selectedLevel.code,
      sector: selectedLevel.sector,
      accent:
        selectedLevel.status === "completed"
          ? "#63f2b1"
          : selectedLevel.accent || "#2f8cff",
      secondaryAccent: selectedLevel.secondaryAccent || "#6ee7ff",
    });

    enterTimeoutRef.current = window.setTimeout(() => {
      navigate(route);
    }, 1800);
  };

  /* ==================================================== */
  /* OVERVIEW */
  /* ==================================================== */

  const handleOverview = () => {
    setOverviewMode(true);
  };

  /* ==================================================== */
  /* RESET DEV PROGRESS */
  /* ==================================================== */

  const handleResetProgress = () => {
    const nextProgress = resetCppWorldProgress(userId);

    setWorldProgress(nextProgress);

    const nextCurrent = getCurrentCppWorldLevel(nextProgress);

    setSelectedLevelId(nextCurrent?.id || null);
    setOverviewMode(true);
  };

  /* ==================================================== */
  /* AUTH RENDER GUARD */
  /* ==================================================== */

  if (!currentUser) {
    return null;
  }

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  const selectedStatus = selectedLevel ? getStatusCopy(selectedLevel) : null;

  const SelectedStatusIcon = selectedStatus?.icon || Power;

  return (
    <main
      className={`${styles.page} ${booted ? styles.booted : ""} ${
        enteringSector ? styles.sectorEntering : ""
      }`}
    >
      {/* =============================================== */}
      {/* BACKGROUND HUD LAYERS */}
      {/* =============================================== */}

      <div className={styles.screenGlow} />

      <div className={styles.scanLines} />

      <div className={styles.gridOverlay} />

      <div className={styles.cornerFrameTopLeft} />

      <div className={styles.cornerFrameTopRight} />

      <div className={styles.cornerFrameBottomLeft} />

      <div className={styles.cornerFrameBottomRight} />

      {/* =============================================== */}
      {/* 3D WORLD */}
      {/* =============================================== */}

      <div className={styles.canvasShell}>
        <Canvas
          dpr={[0.85, 1.25]}
          camera={{
            position: CPP_WORLD_CAMERA.position,
            fov: 43,
            near: 0.1,
            far: 120,
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={null}>
            <CppCameraRig
              selectedLevel={selectedLevel}
              overviewMode={overviewMode}
              disabled={Boolean(enteringSector)}
            />

            <CppWorldScene
              levels={worldLevels}
              currentLevelId={currentLevel?.id || null}
              selectedLevelId={selectedLevelId}
              onSelectLevel={handleSelectLevel}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* =============================================== */}
      {/* TOP HUD */}
      {/* =============================================== */}

      <header className={styles.topHud}>
        <div className={styles.topHudLeft}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/student/choose-path")}
          >
            <ArrowLeft size={16} />

            <span>Paths</span>
          </button>

          <div className={styles.worldIdentity}>
            <div className={styles.worldMark}>
              <Cpu size={20} />
            </div>

            <div>
              <span>CODELAND SYSTEM</span>

              <strong>C++ CORE</strong>
            </div>
          </div>
        </div>

        <div className={styles.systemReadout}>
          <div className={styles.systemReadoutTop}>
            <span>CORE SYNCHRONIZATION</span>

            <strong>
              {worldCompleted ? "100%" : `${worldProgressPercent}%`}
            </strong>
          </div>

          <div className={styles.systemTrack}>
            <span
              style={{
                width: `${worldCompleted ? 100 : worldProgressPercent}%`,
              }}
            />
          </div>
        </div>

        <div className={styles.topHudRight}>
          <div className={styles.statusChip}>
            <i />

            <span>{worldCompleted ? "CORE MASTERED" : "SYSTEM ONLINE"}</span>
          </div>

          <button
            type="button"
            className={styles.overviewButton}
            onClick={handleOverview}
          >
            <Orbit size={15} />

            <span>Overview</span>
          </button>
        </div>
      </header>

      {/* =============================================== */}
      {/* LEFT COMMAND PANEL */}
      {/* =============================================== */}

      <aside className={styles.commandPanel}>
        <div className={styles.commandHeader}>
          <span>CORE MAP</span>

          <strong>
            {completedCount}/{totalLevels}
          </strong>
        </div>

        <div className={styles.commandDivider} />

        <div className={styles.commandSummary}>
          <div className={styles.summaryIcon}>
            {worldCompleted ? <Trophy size={20} /> : <Map size={20} />}
          </div>

          <div>
            <span>{worldCompleted ? "MISSION STATUS" : "ACTIVE MISSION"}</span>

            <strong>
              {worldCompleted
                ? "C++ Core Mastered"
                : currentLevel?.title || "Initializing"}
            </strong>
          </div>
        </div>

        <div className={styles.sectorList}>
          {worldLevels.map((level) => {
            const selected = selectedLevelId === level.id;

            const completed = level.status === "completed";

            return (
              <button
                key={level.id}
                type="button"
                className={`${styles.sectorButton} ${
                  selected ? styles.sectorButtonSelected : ""
                } ${completed ? styles.sectorButtonCompleted : ""}`}
                style={{
                  "--sector-accent":
                    level.status === "completed" ? "#63f2b1" : level.accent,
                }}
                onClick={() => handleSelectLevel(level)}
              >
                <span className={styles.sectorOrder}>
                  {level.status === "completed" ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    level.order
                  )}
                </span>

                <div>
                  <small>{level.sector}</small>

                  <strong>{level.title}</strong>
                </div>

                <span className={styles.sectorSignal} />
              </button>
            );
          })}
        </div>

        <div className={styles.commandFooter}>
          <ShieldCheck size={14} />

          <span>All core sectors available</span>
        </div>
      </aside>

      {/* =============================================== */}
      {/* SELECTED LEVEL PANEL */}
      {/* =============================================== */}

      <section
        className={`${styles.levelPanel} ${
          selectedLevel && !overviewMode ? styles.levelPanelVisible : ""
        }`}
        style={{
          "--panel-accent":
            selectedLevel?.status === "completed"
              ? "#63f2b1"
              : selectedLevel?.accent || "#2f8cff",

          "--panel-secondary": selectedLevel?.secondaryAccent || "#6ee7ff",
        }}
      >
        {selectedLevel && (
          <>
            <div className={styles.levelPanelTop}>
              <div className={styles.levelCode}>
                <span>{selectedLevel.code}</span>
              </div>

              <div
                className={`${styles.levelStatus} ${
                  selectedLevel.status === "completed"
                    ? styles.levelStatusCompleted
                    : styles.levelStatusCurrent
                }`}
              >
                <SelectedStatusIcon size={13} />

                <span>{selectedStatus.label}</span>
              </div>
            </div>

            <div className={styles.levelPanelCopy}>
              <span>{selectedLevel.sector}</span>

              <h2>{selectedLevel.title}</h2>

              <strong>{selectedLevel.subtitle}</strong>

              <p>{selectedLevel.description}</p>
            </div>

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

                <strong>{Math.round(selectedLevel.progress || 0)}%</strong>
              </div>
            </div>

            <div className={styles.levelProgress}>
              <span
                style={{
                  width: `${Math.round(selectedLevel.progress || 0)}%`,
                }}
              />
            </div>

            <button
              type="button"
              className={`${styles.enterSectorButton} ${
                enteringSector ? styles.enterSectorButtonBusy : ""
              }`}
              onClick={handleEnterLevel}
              disabled={Boolean(enteringSector)}
            >
              {selectedLevel.status === "completed" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Power size={16} />
              )}

              <span>
                {enteringSector
                  ? "Opening Sector..."
                  : selectedLevel.status === "completed"
                    ? "Re-enter Sector"
                    : "Enter Sector"}
              </span>

              <ChevronRight size={17} />
            </button>

            <button
              type="button"
              className={styles.backToOverview}
              onClick={handleOverview}
            >
              <Orbit size={14} />

              <span>Return to Core Map</span>
            </button>
          </>
        )}
      </section>

      {/* =============================================== */}
      {/* BOTTOM HUD */}
      {/* =============================================== */}

      <div className={styles.bottomHud}>
        <div>
          <span>CORE ENGINE</span>

          <strong>C++17 TRAINING MATRIX</strong>
        </div>

        <div className={styles.bottomSignal}>
          <span />

          <small>{overviewMode ? "MAP MODE" : "SECTOR LINKED"}</small>
        </div>

        <div className={styles.bottomCoordinates}>
          <span>NODE</span>

          <strong>{selectedLevel?.sector || "CENTRAL"}</strong>
        </div>
      </div>

      {/* =============================================== */}
      {/* DEV CONTROL */}
      {/* =============================================== */}

      {import.meta.env.DEV && (
        <button
          type="button"
          className={styles.devResetButton}
          onClick={handleResetProgress}
          title="Reset C++ world progress"
        >
          <RotateCcw size={13} />

          <span>Reset Core</span>
        </button>
      )}

      {/* =============================================== */}
      {/* SECTOR ENTRY TRANSITION */}
      {/* =============================================== */}

      {enteringSector && (
        <div
          className={styles.sectorLaunchOverlay}
          style={{
            "--launch-accent": enteringSector.accent,
            "--launch-secondary": enteringSector.secondaryAccent,
          }}
        >
          <div className={styles.launchGrid} />

          <div className={styles.launchBeam} />

          <div className={styles.launchCore}>
            <div className={styles.launchRingOuter} />

            <div className={styles.launchRingMiddle} />

            <div className={styles.launchRingInner} />

            <div className={styles.launchSymbol}>{enteringSector.code}</div>
          </div>

          <div className={styles.launchCopy}>
            <span>{enteringSector.sector}</span>

            <strong>ENTERING {enteringSector.title.toUpperCase()}</strong>

            <small>ESTABLISHING SECURE CORE LINK</small>
          </div>

          <div className={styles.launchProgress}>
            <span />
          </div>
        </div>
      )}

      {/* =============================================== */}
      {/* BOOT SCREEN */}
      {/* =============================================== */}

      <div className={styles.bootOverlay}>
        <div className={styles.bootCore}>
          <div className={styles.bootRingOne} />

          <div className={styles.bootRingTwo} />

          <div className={styles.bootSymbol}>C++</div>
        </div>

        <span>INITIALIZING C++ CORE</span>
      </div>
    </main>
  );
}

export default CppWorld;
