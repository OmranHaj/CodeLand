import { useLayoutEffect, useRef } from "react";
import {
  Check,
  Clock3,
  Gauge,
  MousePointer2,
  MoveUp,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssMotionTimelineAnimation.module.css";

function CssMotionTimelineAnimation({
  label = "Launch Project",
  distance = 18,
  duration = 0.35,
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeDistance = Math.max(4, Math.min(40, Number(distance) || 18));

  const safeDuration = Math.max(0.1, Math.min(2, Number(duration) || 0.35));

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");

    const controls = root.querySelector("[data-controls]");

    const controlRows = root.querySelectorAll("[data-control-row]");

    const demoStage = root.querySelector("[data-demo-stage]");

    const instantButton = root.querySelector("[data-instant-button]");

    const smoothButton = root.querySelector("[data-smooth-button]");

    const instantPath = root.querySelector("[data-instant-path]");

    const smoothPath = root.querySelector("[data-smooth-path]");

    const durationTrack = root.querySelector("[data-duration-track]");

    const durationFill = root.querySelector("[data-duration-fill]");

    const durationMarker = root.querySelector("[data-duration-marker]");

    const easingCurve = root.querySelector("[data-easing-curve]");

    const easingDot = root.querySelector("[data-easing-dot]");

    const hoverSignal = root.querySelector("[data-hover-signal]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(controls, {
      opacity: 0,
      x: -24,
      scale: 0.96,
    });

    gsap.set(controlRows, {
      opacity: 0.35,
      x: -8,
    });

    gsap.set(demoStage, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(instantButton, {
      y: 0,
      scale: 1,
    });

    gsap.set(smoothButton, {
      y: 0,
      scale: 1,
    });

    gsap.set(instantPath, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "bottom center",
    });

    gsap.set(smoothPath, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "bottom center",
    });

    gsap.set(durationTrack, {
      opacity: 0,
      scaleX: 0.8,
    });

    gsap.set(durationFill, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(durationMarker, {
      opacity: 0,
      scale: 0.8,
    });

    gsap.set(easingCurve, {
      opacity: 0,
      scale: 0.92,
    });

    gsap.set(easingDot, {
      opacity: 0,
      x: 0,
      y: 0,
    });

    gsap.set(hoverSignal, {
      opacity: 0,
      scale: 0.82,
      y: 6,
    });

    gsap.set(summaryCards, {
      opacity: 0,
      y: 12,
      scale: 0.94,
    });

    gsap.set(completeBadge, {
      opacity: 0,
      y: 8,
      scale: 0.84,
    });

    /* ================================================== */
    /* REDUCED MOTION */
    /* ================================================== */

    if (reducedMotion) {
      status.textContent = "MOTION SYSTEM READY";

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(controls, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(controlRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(demoStage, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(instantPath, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(smoothPath, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(durationTrack, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(durationFill, {
        scaleX: 1,
      });

      gsap.set(durationMarker, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(easingCurve, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(easingDot, {
        opacity: 1,
      });

      gsap.set(hoverSignal, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(completeBadge, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      return;
    }

    /* ================================================== */
    /* TIMELINE */
    /* ================================================== */

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline
      /* -------------------------------------------------- */
      /* INTRO */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · INSTANT STATE CHANGE";
      })

      .to(
        controls,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.55,
        },
        0.1,
      )

      .to(
        demoStage,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
        },
        0.18,
      )

      /* -------------------------------------------------- */
      /* INSTANT MOVE */
      /* -------------------------------------------------- */

      .to(controlRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        instantPath,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.28,
        },
        "-=0.05",
      )

      .to(instantButton, {
        y: -safeDistance,
        duration: 0.01,
      })

      .to(instantButton, {
        y: 0,
        duration: 0.01,
        delay: 0.45,
      })

      /* -------------------------------------------------- */
      /* ADD TRANSITION */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · ADD A CSS TRANSITION";
      })

      .to(controlRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        durationTrack,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.42,
        },
        "-=0.08",
      )

      .to(
        durationFill,
        {
          scaleX: 1,
          duration: safeDuration,
          ease: "none",
        },
        "-=0.15",
      )

      .to(
        durationMarker,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.8)",
        },
        "-=0.16",
      )

      /* -------------------------------------------------- */
      /* DURATION */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 03 · DURATION CONTROLS HOW LONG MOTION TAKES`;
      })

      .to(controlRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        smoothPath,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.38,
        },
        "-=0.08",
      )

      .to(
        smoothButton,
        {
          y: -safeDistance,
          duration: safeDuration,
          ease: "power2.out",
        },
        "-=0.05",
      )

      .to(
        smoothButton,
        {
          y: 0,
          duration: safeDuration,
          ease: "power2.inOut",
        },
        "+=0.25",
      )

      /* -------------------------------------------------- */
      /* EASING */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · EASING CHANGES THE FEEL OF MOTION";
      })

      .to(controlRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        easingCurve,
        {
          opacity: 1,
          scale: 1,
          duration: 0.42,
        },
        "-=0.08",
      )

      .to(
        easingDot,
        {
          opacity: 1,
          duration: 0.2,
        },
        "-=0.18",
      )

      .to(easingDot, {
        x: 92,
        y: -58,
        duration: 1.1,
        ease: "power2.inOut",
      })

      .set(easingDot, {
        x: 0,
        y: 0,
      })

      /* -------------------------------------------------- */
      /* HOVER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · :HOVER TRIGGERS THE TRANSITION";
      })

      .to(
        hoverSignal,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.35,
          ease: "back.out(1.8)",
        },
        "-=0.05",
      )

      .to(
        smoothButton,
        {
          y: -safeDistance,
          scale: 1.045,
          duration: safeDuration,
          ease: "power2.out",
        },
        "-=0.05",
      )

      .to(
        smoothButton,
        {
          y: 0,
          scale: 1,
          duration: safeDuration,
          ease: "power2.inOut",
        },
        "+=0.35",
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · SMOOTH MOTION FEELS MORE NATURAL";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        demoStage,
        {
          scale: 1.012,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.05",
      )

      /* -------------------------------------------------- */
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "MOTION SYSTEM READY";
      })

      .to(completeBadge, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "back.out(1.8)",
      });

    timelineRef.current = timeline;
  };

  /* ====================================================== */
  /* EFFECT */
  /* ====================================================== */

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      playAnimation();
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [label, safeDistance, safeDuration]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS transitions and motion visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>MOTION TIMELINE</span>

          <strong>See why transitions make interfaces feel alive</strong>
        </div>

        <button
          type="button"
          className={styles.replayButton}
          onClick={playAnimation}
        >
          <RotateCcw size={14} />
          Replay
        </button>
      </div>

      {/* ================================================== */}
      {/* STAGE */}
      {/* ================================================== */}

      <div className={styles.stage}>
        <div className={styles.backgroundGrid} />

        <div className={styles.status} data-status>
          STEP 01 · INSTANT STATE CHANGE
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CONTROLS */}
          {/* ============================================== */}

          <div className={styles.controlsPanel} data-controls>
            <div className={styles.panelHeader}>
              <Zap size={14} />

              <div>
                <span>CSS MOTION</span>

                <strong>.button</strong>
              </div>
            </div>

            <div className={styles.controlList}>
              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <MoveUp size={13} />
                </div>

                <div>
                  <span>transform</span>

                  <strong>translateY(-{safeDistance}px)</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Clock3 size={13} />
                </div>

                <div>
                  <span>transition</span>

                  <strong>transform</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Gauge size={13} />
                </div>

                <div>
                  <span>duration</span>

                  <strong>{safeDuration}s</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Sparkles size={13} />
                </div>

                <div>
                  <span>easing</span>

                  <strong>ease</strong>
                </div>

                <i />
              </div>
            </div>

            <div className={styles.codeBlock}>
              <span>
                <b>.button</b> {"{"}
              </span>

              <span>
                {"  "}
                <em>transform</em>: translateY(0);
              </span>

              <span>
                {"  "}
                <em>transition</em>: transform {safeDuration}s ease;
              </span>

              <span>{"}"}</span>

              <span className={styles.codeGap} />

              <span>
                <b>.button:hover</b> {"{"}
              </span>

              <span>
                {"  "}
                <em>transform</em>: translateY(-{safeDistance}px);
              </span>

              <span>{"}"}</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* MOTION DEMO */}
          {/* ============================================== */}

          <div className={styles.demoPanel}>
            <div className={styles.demoHeader}>
              <div>
                <span>LIVE MOTION TEST</span>

                <strong>Instant vs Smooth</strong>
              </div>

              <span className={styles.motionBadge}>INTERACTION</span>
            </div>

            <div className={styles.demoStage} data-demo-stage>
              {/* ========================================== */}
              {/* INSTANT */}
              {/* ========================================== */}

              <div className={styles.motionLane}>
                <div className={styles.laneTitle}>
                  <span>WITHOUT TRANSITION</span>

                  <strong>Instant</strong>
                </div>

                <div className={styles.laneTrack}>
                  <div
                    className={`${styles.motionPath} ${styles.instantPath}`}
                    data-instant-path
                  >
                    <span />
                    <span />
                  </div>

                  <button
                    type="button"
                    className={`${styles.demoButton} ${styles.instantButton}`}
                    data-instant-button
                  >
                    <Zap size={13} />
                    {label}
                  </button>
                </div>

                <div className={styles.instantNote}>
                  <Zap size={11} />

                  <span>Position changes immediately</span>
                </div>
              </div>

              {/* ========================================== */}
              {/* SMOOTH */}
              {/* ========================================== */}

              <div className={styles.motionLane}>
                <div className={styles.laneTitle}>
                  <span>WITH TRANSITION</span>

                  <strong>Smooth</strong>
                </div>

                <div className={styles.laneTrack}>
                  <div
                    className={`${styles.motionPath} ${styles.smoothPath}`}
                    data-smooth-path
                  >
                    <span />
                    <span />
                  </div>

                  <button
                    type="button"
                    className={`${styles.demoButton} ${styles.smoothButton}`}
                    data-smooth-button
                  >
                    <Sparkles size={13} />
                    {label}
                  </button>
                </div>

                <div className={styles.hoverSignal} data-hover-signal>
                  <MousePointer2 size={11} />

                  <span>:hover triggered</span>
                </div>
              </div>

              {/* ========================================== */}
              {/* DURATION */}
              {/* ========================================== */}

              <div className={styles.durationPanel} data-duration-track>
                <div className={styles.durationHeader}>
                  <span>TRANSITION DURATION</span>

                  <strong>{safeDuration}s</strong>
                </div>

                <div className={styles.durationTrack}>
                  <span className={styles.durationFill} data-duration-fill />

                  <span className={styles.durationMarker} data-duration-marker>
                    {safeDuration}s
                  </span>
                </div>

                <div className={styles.durationScale}>
                  <span>0s</span>

                  <span>time</span>

                  <span>{safeDuration}s</span>
                </div>
              </div>

              {/* ========================================== */}
              {/* EASING */}
              {/* ========================================== */}

              <div className={styles.easingPanel} data-easing-curve>
                <div className={styles.easingHeader}>
                  <span>EASING CURVE</span>

                  <strong>ease</strong>
                </div>

                <div className={styles.curveStage}>
                  <svg
                    viewBox="0 0 120 80"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line x1="10" y1="68" x2="110" y2="68" />

                    <line x1="10" y1="68" x2="10" y2="10" />

                    <path d="M 10 68 C 35 65, 48 25, 110 10" />
                  </svg>

                  <span className={styles.easingDot} data-easing-dot />
                </div>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Motion feels smooth
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* SUMMARY */}
          {/* ============================================== */}

          <div className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span>MOTION SYSTEM</span>

              <strong>What matters?</strong>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>01</span>

              <div>
                <strong>Property</strong>

                <p>Choose which CSS property should animate.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>02</span>

              <div>
                <strong>Duration</strong>

                <p>Duration decides how quickly the change happens.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>03</span>

              <div>
                <strong>Easing</strong>

                <p>Easing controls acceleration and deceleration.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>04</span>

              <div>
                <strong>Trigger</strong>

                <p>Hover can start a transition when the user interacts.</p>
              </div>
            </div>

            <div className={styles.summarySignal}>
              <Sparkles size={13} />

              <span>SMALL MOTION · BETTER FEEDBACK</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>STATE</span>

          <div>
            <strong>Define what changes</strong>

            <p>Hover can move, resize, recolor, or transform an element.</p>
          </div>
        </div>

        <div>
          <span>TIME</span>

          <div>
            <strong>Add duration</strong>

            <p>
              A transition spreads the change across time instead of jumping
              instantly.
            </p>
          </div>
        </div>

        <div>
          <span>FEEL</span>

          <div>
            <strong>Control easing</strong>

            <p>
              Easing makes movement accelerate and slow down more naturally.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>STATE → TRANSITION → DURATION → EASING → MOTION</span>
      </div>
    </section>
  );
}

export default CssMotionTimelineAnimation;
