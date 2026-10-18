import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Gauge,
} from "lucide-react";
import LESSON_EXPLANATIONS from "../../data/lessonExplanations";
import styles from "./LessonExplanationPanel.module.css";

/* ====================================================== */
/* LESSON EXPLANATION PANEL                               */
/* Beginner-friendly written + audio explanations        */
/* ====================================================== */

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(elapsed, total) {
  if (!total) return "0:00 / 0:00";
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  return `${fmt(elapsed)} / ${fmt(total)}`;
}

export default function LessonExplanationPanel({ lessonId }) {
  const explanation = LESSON_EXPLANATIONS[lessonId] || null;

  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1x
  const [progress, setProgress] = useState(0); // 0-100
  const [timeLabel, setTimeLabel] = useState("0:00 / 0:00");
  const [ttsAvailable] = useState(() => "speechSynthesis" in window);

  const utteranceRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(0);
  const pausedAtRef = useRef(0);
  const rafRef = useRef(null);
  const heartbeatRef = useRef(null);
  const totalDurationRef = useRef(0);

  /* ---- estimate total speech duration ---- */
  const estimateDuration = useCallback(
    (text, rate) => {
      // Average English TTS: ~130 words/min at 1x; adjust by rate
      const wordCount = text.trim().split(/\s+/).length;
      return (wordCount / 130 / rate) * 60; // seconds
    },
    [],
  );

  /* ---- cleanup utterance ---- */
  const stopSpeech = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setSpeaking(false);
    setPaused(false);
    setProgress(0);
    setTimeLabel("0:00 / 0:00");
    elapsedRef.current = 0;
    pausedAtRef.current = 0;
    startTimeRef.current = null;
  }, []);

  /* ---- clean up on unmount / lessonId change ---- */
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [lessonId, stopSpeech]);

  /* ---- progress ticker ---- */
  const tickProgress = useCallback(() => {
    if (!startTimeRef.current || !totalDurationRef.current) return;
    const now = Date.now();
    const elapsed = elapsedRef.current + (now - startTimeRef.current) / 1000;
    const pct = Math.min((elapsed / totalDurationRef.current) * 100, 100);
    setProgress(pct);
    setTimeLabel(formatTime(elapsed, totalDurationRef.current));
    if (pct < 100) {
      rafRef.current = requestAnimationFrame(tickProgress);
    }
  }, []);

  /* ---- internal helper to start speech with a given rate ---- */
  const playUtterance = useCallback(
    (rate) => {
      if (!explanation || !ttsAvailable) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.lang = "en-US";
      utterance.rate = rate;
      utterance.pitch = 1;

      // Select best English voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        const enVoice =
          voices.find((v) => v.lang === "en-US" && !v.localService) ||
          voices.find((v) => v.lang.startsWith("en-US")) ||
          voices.find((v) => v.lang.startsWith("en"));
        if (enVoice) utterance.voice = enVoice;
      } catch {
        // fallback to default
      }

      totalDurationRef.current = estimateDuration(explanation, rate);
      elapsedRef.current = 0;
      pausedAtRef.current = 0;
      startTimeRef.current = Date.now();

      utterance.onstart = () => {
        setSpeaking(true);
        setPaused(false);
        rafRef.current = requestAnimationFrame(tickProgress);

        // Keep-alive heartbeat every 10 seconds to avoid Chromium speech synthesis pause bug
        heartbeatRef.current = setInterval(() => {
          if (
            window.speechSynthesis &&
            window.speechSynthesis.speaking &&
            !window.speechSynthesis.paused
          ) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };

      utterance.onend = () => {
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }
        setSpeaking(false);
        setPaused(false);
        setProgress(100);
        setTimeLabel(
          formatTime(totalDurationRef.current, totalDurationRef.current),
        );
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        startTimeRef.current = null;
      };

      utterance.onerror = () => {
        stopSpeech();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [explanation, ttsAvailable, estimateDuration, tickProgress, stopSpeech],
  );

  /* ---- start / resume speech ---- */
  const startSpeech = useCallback(() => {
    if (!explanation || !ttsAvailable) return;

    // Resume if paused
    if (paused) {
      window.speechSynthesis.resume();
      startTimeRef.current = Date.now();
      setPaused(false);
      setSpeaking(true);
      rafRef.current = requestAnimationFrame(tickProgress);
      return;
    }

    const rate = SPEEDS[speedIndex];
    playUtterance(rate);
  }, [
    explanation,
    ttsAvailable,
    paused,
    speedIndex,
    tickProgress,
    playUtterance,
  ]);

  /* ---- pause speech ---- */
  const pauseSpeech = useCallback(() => {
    if (!speaking || paused) return;
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    window.speechSynthesis.pause();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const now = Date.now();
    elapsedRef.current += (now - (startTimeRef.current || now)) / 1000;
    startTimeRef.current = null;
    setPaused(true);
    setSpeaking(false);
  }, [speaking, paused]);

  /* ---- restart ---- */
  const restartSpeech = useCallback(() => {
    stopSpeech();
    setTimeout(() => {
      startSpeech();
    }, 60);
  }, [stopSpeech, startSpeech]);

  /* ---- change speed ---- */
  const cycleSpeed = useCallback(() => {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    // If currently playing, restart immediately at new speed
    if (speaking || paused) {
      stopSpeech();
      setTimeout(() => {
        playUtterance(SPEEDS[next]);
      }, 60);
    }
  }, [
    speedIndex,
    speaking,
    paused,
    stopSpeech,
    playUtterance,
  ]);

  if (!explanation) return null;

  const sections = parseExplanation(explanation);

  return (
    <div
      className={`${styles.panel} ${expanded ? styles.panelExpanded : ""}`}
      role="region"
      aria-label="Lesson explanation"
    >
      {/* ---- Header row ---- */}
      <button
        type="button"
        className={styles.header}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={styles.headerLeft}>
          <BookOpen size={16} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Lesson Explanation</span>
          <span className={styles.badge}>Beginner Friendly</span>
        </span>

        <span className={styles.headerRight}>
          {ttsAvailable && (
            <span
              className={`${styles.audioChip} ${speaking ? styles.audioChipActive : ""}`}
              aria-hidden="true"
            >
              <Volume2 size={13} />
              {speaking ? "Speaking…" : paused ? "Paused" : "Audio"}
            </span>
          )}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* ---- Collapsible body ---- */}
      {expanded && (
        <div className={styles.body}>
          {/* ---- Audio player bar ---- */}
          {ttsAvailable && (
            <div className={styles.audioBar} role="group" aria-label="Audio controls">
              {/* Play / Pause */}
              <button
                type="button"
                className={`${styles.audioBtn} ${styles.playBtn}`}
                onClick={speaking ? pauseSpeech : startSpeech}
                aria-label={speaking ? "Pause explanation" : "Play explanation"}
                title={speaking ? "Pause" : "Play"}
              >
                {speaking ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>

              {/* Restart */}
              <button
                type="button"
                className={styles.audioBtn}
                onClick={restartSpeech}
                aria-label="Restart audio"
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>

              {/* Progress bar */}
              <div className={styles.progressWrap} aria-label="Audio progress">
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={styles.timeLabel} aria-live="off">
                  {timeLabel}
                </span>
              </div>

              {/* Speed */}
              <button
                type="button"
                className={`${styles.audioBtn} ${styles.speedBtn}`}
                onClick={cycleSpeed}
                aria-label={`Playback speed: ${SPEEDS[speedIndex]}x. Click to change.`}
                title="Change speed"
              >
                <Gauge size={13} />
                <span>{SPEEDS[speedIndex]}x</span>
              </button>
            </div>
          )}

          {/* ---- Written explanation ---- */}
          <div className={styles.explanationBody}>
            {sections.map((section, i) => (
              <div key={i} className={styles.section}>
                {section.heading && (
                  <h3 className={styles.sectionHeading}>{section.heading}</h3>
                )}
                {section.paragraphs.map((para, j) => (
                  <p key={j} className={styles.paragraph}>
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================================================== */
/* PARSE EXPLANATION INTO SECTIONS                        */
/* ====================================================== */

const SECTION_HEADERS = [
  "Introduction",
  "Step-by-Step Explanation",
  "Simple Examples",
  "Key Points",
  "Quick Summary",
];

function parseExplanation(text) {
  // Split by double newlines into paragraphs
  const rawParagraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const sections = [];
  let currentSection = { heading: null, paragraphs: [] };

  for (const para of rawParagraphs) {
    const matchedHeader = SECTION_HEADERS.find(
      (h) => para.trim().toLowerCase() === h.toLowerCase(),
    );
    if (matchedHeader) {
      if (
        currentSection.paragraphs.length > 0 ||
        currentSection.heading !== null
      ) {
        sections.push(currentSection);
      }
      currentSection = { heading: matchedHeader, paragraphs: [] };
    } else {
      currentSection.paragraphs.push(para);
    }
  }

  if (currentSection.paragraphs.length > 0 || currentSection.heading !== null) {
    sections.push(currentSection);
  }

  return sections.length > 0 ? sections : [{ heading: null, paragraphs: rawParagraphs }];
}
