import { useEffect, useRef, useState, useLayoutEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Camera,
  Eye,
  Layers,
  Cpu,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import Algo3DStage from "./Algo3DStage";
import Algo3DCameraRig from "./Algo3DCameraRig";
import styles from "./AlgoVisualizer.module.css";

export default function AlgoVisualizer({ lesson, accent = "#10b981" }) {
  const steps = lesson?.steps || [];
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [cameraMode, setCameraMode] = useState("cinematic"); // 'cinematic' | 'orbit' | 'top'
  const containerRef = useRef(null);
  const stepData = steps[currentStep] || {};

  // Reset when lesson changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [lesson]);

  // Autoplay loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalTime = 2600 / speed;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, steps.length, speed]);

  // GSAP animation triggered on each step change
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      // Animate narrative beacon
      gsap.fromTo(
        ".step-beacon-active",
        { scale: 0.6, opacity: 0.3 },
        { scale: 1.3, opacity: 1, duration: 0.45, yoyo: true, repeat: 1, ease: "power2.out" }
      );

      // Animate narrative card text
      gsap.fromTo(
        ".narrative-text-anim",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }
      );

      // Animate register cards
      gsap.fromTo(
        ".register-badge-anim",
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05, ease: "back.out(2)" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [currentStep, lesson]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const registers = stepData.registers || {};

  return (
    <div className={styles.visualizerRoot} ref={containerRef}>
      {/* Visualizer Header Controls */}
      <div className={styles.visHeader}>
        <div className={styles.visHeaderLeft}>
          <div className={styles.visTag} style={{ borderColor: accent, color: accent }}>
            <Sparkles size={14} />
            <span>3D THREE FIBER ENGINE</span>
          </div>

          {/* Camera Mode Selectors */}
          <div className={styles.cameraModes}>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "cinematic" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("cinematic")}
              title="Cinematic Director View"
            >
              <Camera size={13} />
              <span>Cinematic</span>
            </button>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "orbit" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("orbit")}
              title="Free 3D Orbit View"
            >
              <Eye size={13} />
              <span>3D Orbit</span>
            </button>
            <button
              type="button"
              className={`${styles.camBtn} ${cameraMode === "top" ? styles.camBtnActive : ""}`}
              onClick={() => setCameraMode("top")}
              title="Top Memory Map"
            >
              <Layers size={13} />
              <span>Top View</span>
            </button>
          </div>
        </div>

        <div className={styles.visControls}>
          <button
            type="button"
            className={`${styles.btnControl} ${styles.btnPlay}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause simulation" : "Run simulation"}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? "Pause" : "Simulate"}</span>
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handlePrev}
            disabled={currentStep === 0}
            aria-label="Previous step"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            aria-label="Next step"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handleReset}
            aria-label="Reset simulation"
          >
            <RotateCcw size={14} />
          </button>

          {/* Speed Controls */}
          <div className={styles.speedSelector}>
            {[0.5, 1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.speedBtn} ${speed === s ? styles.speedBtnActive : ""}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive 3D Canvas Stage */}
      <div className={styles.stageCanvas3D}>
        <Canvas
          dpr={[0.9, 1.5]}
          camera={{ position: [0, 4.2, 8.2], fov: 42, near: 0.1, far: 80 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <Algo3DCameraRig
              visualizerType={lesson.visualizerType}
              stepData={stepData}
              cameraMode={cameraMode}
            />
            <Algo3DStage lesson={lesson} stepData={stepData} accent={accent} />
          </Suspense>
        </Canvas>

        {/* Floating In-Scene Orbit Guide Badge */}
        {cameraMode === "orbit" && (
          <div className={styles.orbitGuideBadge}>
            <Eye size={12} />
            <span>Click & Drag to rotate in 3D · Scroll to Zoom</span>
          </div>
        )}
      </div>

      {/* Interactive Step Scrubber Timeline Bar */}
      <div className={styles.timelineScrubber}>
        <div className={styles.timelineTrack}>
          <div
            className={styles.timelineFill}
            style={{
              width: `${((currentStep) / Math.max(steps.length - 1, 1)) * 100}%`,
              background: `linear-gradient(90deg, #10b981, ${accent})`,
            }}
          />
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.timelineDot} ${idx <= currentStep ? styles.timelineDotActive : ""}`}
              style={{ left: `${(idx / Math.max(steps.length - 1, 1)) * 100}%` }}
              onClick={() => setCurrentStep(idx)}
              title={`Jump to Step ${idx + 1}`}
            />
          ))}
        </div>
        <div className={styles.timelineLabel}>
          <span>Step {currentStep + 1} / {steps.length}</span>
        </div>
      </div>

      {/* Live Variable & Hardware Register Readout Bar */}
      {Object.keys(registers).length > 0 && (
        <div className={styles.registerDeck}>
          <div className={styles.registerDeckHeader}>
            <Cpu size={13} color={accent} />
            <span>LIVE REGISTERS & VARIABLES</span>
          </div>
          <div className={styles.registerRow}>
            {Object.entries(registers).map(([key, value]) => (
              <div key={key} className={`${styles.registerBadge} register-badge-anim`}>
                <span className={styles.registerKey}>{key}:</span>
                <span className={styles.registerVal} style={{ color: accent }}>
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Narrative Step Description */}
      <div className={styles.narrativeBox} style={{ borderLeftColor: accent }}>
        <div
          className={`${styles.stepBeacon} step-beacon-active`}
          style={{ background: accent, boxShadow: `0 0 16px ${accent}` }}
        />
        <div className="narrative-text-anim" style={{ flex: 1, minWidth: 0 }}>
          <div className={styles.narrativeHeader}>
            <span className={styles.stepBadge} style={{ borderColor: accent, color: accent }}>
              STEP {currentStep + 1} / {steps.length}
            </span>
            {(stepData.phaseTitle || stepData.stepTitle) && (
              <span className={styles.phaseTitle}>
                {(stepData.phaseTitle || stepData.stepTitle).replace(/^\d+\.\s*/, "")}
              </span>
            )}
          </div>
          <p className={styles.narrativeText}>
            {stepData.text || "Initializing visualizer state..."}
          </p>
          {stepData.subtext && (
            <div className={styles.insightCard}>
              <Sparkles size={15} className={styles.insightIcon} />
              <div className={styles.insightContent}>
                <strong>Core Insight:</strong> {stepData.subtext}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
