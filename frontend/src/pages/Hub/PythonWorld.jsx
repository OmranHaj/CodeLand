import { Suspense, useEffect, useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Layers,
  Orbit,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import AlgorithmWorldScene from "../../components/AlgorithmWorld/AlgorithmWorldScene";
import AlgoCameraRig from "../../components/AlgorithmWorld/AlgoCameraRig";
import AlgoVisualizer from "../../components/AlgorithmWorld/AlgoVisualizer";
import {
  ALGO_SECTORS,
  ALGO_WORLD_CAMERA,
  loadAlgoWorldProgress,
  saveAlgoWorldProgress,
  resetAlgoWorldProgress,
} from "../../data/algorithmWorldLevels";
import { userKey, writeStored, readStored } from "../../services/learningHub";
import { fetchStudentProgress } from "../../services/learningContentService";
import styles from "./AlgorithmWorld.module.css";

export default function PythonWorld() {
  const navigate = useNavigate();
  const [params, setSearchParams] = useSearchParams();
  const userId = useMemo(() => userKey(), []);

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
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const [selectedSectorId, setSelectedSectorId] = useState("algo-arrays");
  const [overviewMode, setOverviewMode] = useState(true);
  const [booted, setBooted] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooted(true);
      gsap.fromTo(
        `.${styles.topHud}, .${styles.commandPanel}, .${styles.levelPanel}`,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" }
      );
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Handle URL params if directed from Courses ?lesson=x
  useEffect(() => {
    const lessonParam = params.get("lesson");
    if (lessonParam !== null) {
      const parsed = parseInt(lessonParam, 10);
      if (!isNaN(parsed) && ALGO_SECTORS[parsed]) {
        setSelectedSectorId(ALGO_SECTORS[parsed].id);
        setOverviewMode(false);
      }
    }
  }, [params]);

  const selectedSector = useMemo(
    () => ALGO_SECTORS.find((s) => s.id === selectedSectorId) || ALGO_SECTORS[0],
    [selectedSectorId]
  );

  const completedSectors = worldProgress?.completedSectors || [];
  const completedLessons = worldProgress?.completedLessons || [];

  const totalLessons = useMemo(
    () => ALGO_SECTORS.reduce((acc, s) => acc + s.lessons.length, 0),
    []
  );

  const progressPercent = Math.round(
    (completedLessons.length / Math.max(totalLessons, 1)) * 100
  );

  const [enteringSector, setEnteringSector] = useState(null);

  const handleSelectSector = (sector) => {
    setSelectedSectorId(sector.id);
    setOverviewMode(false);
  };

  const handleEnterSector = () => {
    if (!selectedSector || enteringSector) return;
    setEnteringSector(selectedSector);
    setTimeout(() => {
      navigate(`/student/algorithm-lab/${selectedSector.id}`);
    }, 1400);
  };

  return (
    <main
      className={`${styles.page} ${booted ? styles.booted : ""}`}
      ref={pageRef}
    >
      {/* Background HUD Layers */}
      <div className={styles.screenGlow} />
      <div className={styles.scanLines} />
      <div className={styles.gridOverlay} />

      {/* Decorative Metallic Corner Accents */}
      <div className={styles.cornerFrameTopLeft} />
      <div className={styles.cornerFrameTopRight} />
      <div className={styles.cornerFrameBottomLeft} />
      <div className={styles.cornerFrameBottomRight} />

      {/* 3D Canvas Shell */}
      <div className={styles.canvasShell}>
        <Canvas
          dpr={[0.85, 1.25]}
          camera={{
            position: ALGO_WORLD_CAMERA.overviewPosition,
            fov: 42,
            near: 0.1,
            far: 140,
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
          }}
        >
          <Suspense fallback={null}>
            <AlgoCameraRig
              selectedSector={selectedSector}
              overviewMode={overviewMode}
              disabled={Boolean(enteringSector)}
            />

            <AlgorithmWorldScene
              sectors={ALGO_SECTORS}
              selectedSectorId={selectedSectorId}
              completedSectorIds={completedSectors}
              onSelectSector={handleSelectSector}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Top HUD */}
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
              <span>QUANTUM CITADEL</span>
              <strong>ALGORITHM & DATA STRUCTURES</strong>
            </div>
          </div>
        </div>

        {/* Global Progress Synchronization */}
        <div className={styles.systemReadout}>
          <div className={styles.systemReadoutTop}>
            <span>ALGORITHMIC MASTERY</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div className={styles.systemTrack}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <div className={styles.topHudRight}>
          <button
            type="button"
            className={styles.overviewButton}
            onClick={() => {
              setOverviewMode(true);
            }}
          >
            <Orbit size={15} />
            <span>Overview</span>
          </button>
        </div>
      </header>

      {/* Left Sector Navigation Dock */}
      <aside className={styles.commandPanel}>
        <div className={styles.commandHeader}>
          <span>SECTOR ARCHIVES</span>
          <strong>
            {completedSectors.length}/{ALGO_SECTORS.length} Mastered
          </strong>
        </div>

        <div className={styles.sectorList}>
          {ALGO_SECTORS.map((sec) => {
            const isSelected = selectedSectorId === sec.id;
            const isDone = completedSectors.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                className={`${styles.sectorButton} ${
                  isSelected ? styles.sectorButtonSelected : ""
                }`}
                style={{ "--sec-accent": sec.accent }}
                onClick={() => handleSelectSector(sec)}
              >
                <span className={styles.sectorOrder}>
                  {isDone ? <CheckCircle2 size={14} color="#34d399" /> : sec.code}
                </span>
                <div>
                  <small>SECTOR {sec.order}</small>
                  <strong>{sec.title}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Selected Sector Floating HUD Card */}
      <section
        className={`${styles.levelPanel} ${
          selectedSector && !overviewMode && !enteringSector
            ? styles.levelPanelVisible
            : ""
        }`}
        style={{ "--panel-accent": selectedSector?.accent || "#10b981" }}
      >
        {selectedSector && (
          <>
            <div className={styles.levelPanelTop}>
              <span className={styles.levelCode}>{selectedSector.code} · SECTOR {selectedSector.order}</span>
              <div className={styles.levelStatus}>
                <Sparkles size={14} />
                <span>{selectedSector.lessons.length} LESSONS AVAILABLE</span>
              </div>
            </div>

            <div className={styles.levelPanelCopy}>
              <span>{selectedSector.subtitle}</span>
              <h2>{selectedSector.title}</h2>
              <p>{selectedSector.description}</p>
            </div>

            <div className={styles.complexityChips}>
              <span className={styles.chip}>Time: {selectedSector.complexity.time}</span>
              <span className={styles.chip}>Space: {selectedSector.complexity.space}</span>
            </div>

            <button
              type="button"
              className={styles.enterSectorButton}
              onClick={handleEnterSector}
            >
              <span>Enter Algorithmic Lab</span>
              <ChevronRight size={17} />
            </button>
          </>
        )}
      </section>

      {/* Quantum Warp Portal Transition Overlay */}
      {enteringSector && (
        <div
          className={styles.warpOverlay}
          style={{ "--warp-accent": enteringSector.accent }}
        >
          <div className={styles.warpCore}>
            <div className={styles.warpRingOuter} />
            <div className={styles.warpRingMiddle} />
            <div className={styles.warpRingInner} />
            <div className={styles.warpSymbol}>{enteringSector.code}</div>
          </div>

          <div className={styles.warpCopy}>
            <span>SECTOR {enteringSector.order}</span>
            <strong>WARPING TO {enteringSector.title.toUpperCase()}</strong>
            <small>ESTABLISHING QUANTUM ALGORITHM LAB LINK...</small>
          </div>

          <div className={styles.warpProgressTrack}>
            <div className={styles.warpProgressBar} />
          </div>
        </div>
      )}
    </main>
  );
}
