import { useLayoutEffect, useRef } from "react";
import {
  Binary,
  Check,
  Hash,
  Quote,
  RotateCcw,
  ScanLine,
  Sparkles,
  ToggleLeft,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsDataTypeScannerAnimation.module.css";

function JsDataTypeScannerAnimation({
  stringValue = "CodeLand",
  numberValue = 42,
  booleanValue = true,
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");
    const sourcePanel = root.querySelector("[data-source-panel]");
    const sourceCards = root.querySelectorAll("[data-source-card]");
    const scanner = root.querySelector("[data-scanner]");
    const scannerBeam = root.querySelector("[data-scanner-beam]");
    const scannerCore = root.querySelector("[data-scanner-core]");
    const typeCards = root.querySelectorAll("[data-type-card]");
    const typeSignals = root.querySelectorAll("[data-type-signal]");
    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(sourcePanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(sourceCards, {
      opacity: 0,
      y: 12,
      scale: 0.92,
    });

    gsap.set(scanner, {
      opacity: 0,
      scale: 0.82,
    });

    gsap.set(scannerCore, {
      opacity: 0.35,
      scale: 0.72,
      rotation: -12,
    });

    gsap.set(scannerBeam, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(typeCards, {
      opacity: 0,
      x: 22,
      scale: 0.94,
    });

    gsap.set(typeSignals, {
      opacity: 0,
      scale: 0.75,
      y: 5,
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
      status.textContent = "DATA TYPES IDENTIFIED";

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(sourcePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(sourceCards, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(scanner, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(scannerCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(scannerBeam, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(typeCards, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(typeSignals, {
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
      /* INPUT VALUES */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · JAVASCRIPT RECEIVES VALUES";
      })

      .to(
        sourcePanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.1,
      )

      .to(
        sourceCards,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.1,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* SCANNER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · TYPE SCANNER ACTIVATES";
      })

      .to(scanner, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.7)",
      })

      .to(
        scannerCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.44,
          ease: "back.out(1.8)",
        },
        "-=0.3",
      )

      .to(
        scannerBeam,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* STRING */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · TEXT IS A STRING";
      })

      .to(typeCards[0], {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
      })

      .to(
        typeSignals[0],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.8)",
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* NUMBER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · MATH VALUES ARE NUMBERS";
      })

      .to(typeCards[1], {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
      })

      .to(
        typeSignals[1],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.8)",
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* BOOLEAN */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · TRUE OR FALSE IS BOOLEAN";
      })

      .to(typeCards[2], {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
      })

      .to(
        typeSignals[2],
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "back.out(1.8)",
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · EACH VALUE HAS A TYPE";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        scannerCore,
        {
          scale: 1.08,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.05",
      )

      .call(() => {
        status.textContent = "DATA TYPES IDENTIFIED";
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
  }, [stringValue, numberValue, booleanValue]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript data type scanner explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>DATA TYPE SCANNER</span>

          <strong>
            JavaScript identifies what kind of value it is working with
          </strong>
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

      <div className={styles.stage}>
        <div className={styles.backgroundGrid} />

        <div className={styles.status} data-status>
          STEP 01 · JAVASCRIPT RECEIVES VALUES
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* VALUES */}
          {/* ============================================== */}

          <div className={styles.sourcePanel} data-source-panel>
            <div className={styles.panelHeader}>
              <Binary size={14} />

              <div>
                <span>INPUT VALUES</span>

                <strong>JavaScript Data</strong>
              </div>
            </div>

            <div className={styles.sourceList}>
              <div className={styles.sourceCard} data-source-card>
                <Quote size={15} />

                <div>
                  <span>VALUE</span>

                  <strong>"{stringValue}"</strong>
                </div>
              </div>

              <div className={styles.sourceCard} data-source-card>
                <Hash size={15} />

                <div>
                  <span>VALUE</span>

                  <strong>{String(numberValue)}</strong>
                </div>
              </div>

              <div className={styles.sourceCard} data-source-card>
                <ToggleLeft size={15} />

                <div>
                  <span>VALUE</span>

                  <strong>{String(booleanValue)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* SCANNER */}
          {/* ============================================== */}

          <div className={styles.scannerPanel}>
            <div className={styles.scannerHeader}>
              <span>TYPE ENGINE</span>

              <strong>Runtime Analyzer</strong>
            </div>

            <div className={styles.scannerStage} data-scanner>
              <div className={styles.scannerBeam} data-scanner-beam />

              <div className={styles.scannerCore} data-scanner-core>
                <ScanLine size={30} />

                <strong>TYPE</strong>

                <span>SCAN</span>
              </div>

              <div className={styles.scanReadout}>
                <span>typeof value</span>

                <strong>ANALYZING...</strong>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Types classified
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* RESULTS */}
          {/* ============================================== */}

          <div className={styles.resultsPanel}>
            <div className={styles.resultsHeader}>
              <span>TYPE RESULTS</span>

              <strong>Classification</strong>
            </div>

            <div className={styles.typeCard} data-type-card>
              <div className={styles.typeIcon}>
                <Quote size={14} />
              </div>

              <div>
                <span>"{stringValue}"</span>

                <strong>string</strong>
              </div>

              <i className={styles.typeSignal} data-type-signal>
                TEXT
              </i>
            </div>

            <div className={styles.typeCard} data-type-card>
              <div className={styles.typeIcon}>
                <Hash size={14} />
              </div>

              <div>
                <span>{String(numberValue)}</span>

                <strong>number</strong>
              </div>

              <i className={styles.typeSignal} data-type-signal>
                MATH
              </i>
            </div>

            <div className={styles.typeCard} data-type-card>
              <div className={styles.typeIcon}>
                <ToggleLeft size={14} />
              </div>

              <div>
                <span>{String(booleanValue)}</span>

                <strong>boolean</strong>
              </div>

              <i className={styles.typeSignal} data-type-signal>
                STATE
              </i>
            </div>
          </div>
        </div>

        {/* ================================================ */}
        {/* SUMMARY */}
        {/* ================================================ */}

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>STRING</span>

            <div>
              <strong>Text</strong>

              <p>Strings store words and characters inside quotes.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>NUMBER</span>

            <div>
              <strong>Math</strong>

              <p>Numbers are values JavaScript can calculate with.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>BOOLEAN</span>

            <div>
              <strong>True / False</strong>

              <p>Booleans represent two possible logical states.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>VALUE</span>

          <div>
            <strong>Data enters JavaScript</strong>

            <p>Every value your program uses has a type.</p>
          </div>
        </div>

        <div>
          <span>TYPE</span>

          <div>
            <strong>JavaScript knows the category</strong>

            <p>Strings, numbers, and booleans behave differently.</p>
          </div>
        </div>

        <div>
          <span>LOGIC</span>

          <div>
            <strong>Types affect behavior</strong>

            <p>Knowing the type helps you use values correctly.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>VALUE → SCAN → TYPE → BEHAVIOR</span>
      </div>
    </section>
  );
}

export default JsDataTypeScannerAnimation;
