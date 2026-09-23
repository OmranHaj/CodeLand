import { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Sliders,
  X,
  Play,
  Bot,
  Zap,
} from "lucide-react";
import soundEngine from "../../services/soundEngine";
import styles from "./AudioHUD.module.css";

const WORLD_LABELS = {
  hub: "Cyber Hub",
  cpp: "C++ Cyber Matrix",
  web: "Web Cosmos",
  algorithm: "Algorithm Lab",
};

export default function AudioHUD() {
  const [isOpen, setIsOpen] = useState(false);
  const [audioState, setAudioState] = useState(() => soundEngine.getState());
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((state) => {
      setAudioState({ ...state });
    });

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const toggleSfx = () => {
    const next = !audioState.sfxEnabled;
    soundEngine.setSfxEnabled(next);
    if (next) {
      soundEngine.playClick("cyber");
    }
  };

  const toggleAmbient = () => {
    const next = !audioState.ambientEnabled;
    soundEngine.setAmbientEnabled(next);
  };

  const handleSfxVol = (e) => {
    soundEngine.setSfxVolume(parseFloat(e.target.value));
  };

  const handleAmbientVol = (e) => {
    soundEngine.setAmbientVolume(parseFloat(e.target.value));
  };

  const currentWorldName = WORLD_LABELS[audioState.activeWorld] || "CodeLand";
  const isMuted = !audioState.sfxEnabled && !audioState.ambientEnabled;
  const isPlaying = audioState.isPlayingSound || audioState.ambientEnabled;

  return (
    <aside
      className={styles.audioHudContainer}
      ref={containerRef}
      aria-label="CodeLand Audio Controls"
    >
      {isOpen && (
        <div className={styles.panel} role="dialog" aria-modal="false">
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Sliders size={16} color="#38bdf8" />
              <span>Cyber Audio</span>
            </div>
            <span className={styles.worldTag}>{currentWorldName}</span>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close audio settings"
            >
              <X size={15} />
            </button>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingTop}>
              <span className={styles.settingLabel}>
                <Zap size={14} color="#facc15" />
                <span>Sound FX</span>
              </span>
              <button
                type="button"
                className={`${styles.switch} ${
                  audioState.sfxEnabled ? styles.active : ""
                }`}
                role="switch"
                aria-checked={audioState.sfxEnabled}
                onClick={toggleSfx}
              >
                <span className={styles.thumb} />
              </button>
            </div>
            <span className={styles.settingDesc}>
              Tactile clicks, robot chirps, and victory fanfares.
            </span>
            {audioState.sfxEnabled && (
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.sfxVolume}
                  onChange={handleSfxVol}
                  className={styles.slider}
                  aria-label="SFX Volume"
                />
                <span className={styles.volumeVal}>
                  {Math.round(audioState.sfxVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingTop}>
              <span className={styles.settingLabel}>
                <Radio size={14} color="#a855f7" />
                <span>Ambient Atmosphere</span>
              </span>
              <button
                type="button"
                className={`${styles.switch} ${
                  audioState.ambientEnabled ? styles.active : ""
                }`}
                role="switch"
                aria-checked={audioState.ambientEnabled}
                onClick={toggleAmbient}
              >
                <span className={styles.thumb} />
              </button>
            </div>
            <span className={styles.settingDesc}>
              Subtle generative sci-fi synthesizer tuned to {currentWorldName}.
            </span>
            {audioState.ambientEnabled && (
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.ambientVolume}
                  onChange={handleAmbientVol}
                  className={styles.slider}
                  aria-label="Ambient Atmosphere Volume"
                />
                <span className={styles.volumeVal}>
                  {Math.round(audioState.ambientVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          <div className={styles.previewRow}>
            <button
              type="button"
              className={styles.previewBtn}
              onClick={() => soundEngine.playRobotChirp("greet")}
              title="Test Robot Mascot Voice"
            >
              <Bot size={13} /> Mascot
            </button>
            <button
              type="button"
              className={styles.previewBtn}
              onClick={() => soundEngine.playSuccess()}
              title="Test Victory Chime"
            >
              <Sparkles size={13} /> Victory
            </button>
            <button
              type="button"
              className={styles.previewBtn}
              onClick={() => soundEngine.playClick("cyber")}
              title="Test Cyber Click"
            >
              <Play size={13} /> Click
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${styles.triggerPill} ${isMuted ? styles.muted : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Open CodeLand Audio HUD"
        aria-expanded={isOpen}
      >
        <div className={styles.pillIcon}>
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </div>

        <div
          className={`${styles.equalizer} ${
            isPlaying ? styles.activePlaying : ""
          }`}
          aria-hidden="true"
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </div>

        <span className={styles.pillLabel}>
          {isMuted ? "Muted" : "Audio"}
        </span>
      </button>
    </aside>
  );
}
