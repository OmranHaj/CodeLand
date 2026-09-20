import { useLayoutEffect, useRef } from "react";
import {
  AlignCenter,
  Box,
  Check,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssFlexboxLayoutAnimation.module.css";

function CssFlexboxLayoutAnimation({ items = ["Explore", "Build", "Create"] }) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeItems =
    Array.isArray(items) && items.length
      ? items.slice(0, 6)
      : ["Explore", "Build", "Create"];

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

    const stage = root.querySelector("[data-flex-stage]");

    const flexItems = root.querySelectorAll("[data-flex-item]");

    const mainAxis = root.querySelector("[data-main-axis]");

    const crossAxis = root.querySelector("[data-cross-axis]");

    const mainAxisLabel = root.querySelector("[data-main-axis-label]");

    const crossAxisLabel = root.querySelector("[data-cross-axis-label]");

    const gapMarkers = root.querySelectorAll("[data-gap-marker]");

    const containerOutline = root.querySelector("[data-container-outline]");

    const propertyCards = root.querySelectorAll("[data-property-card]");

    const completeBadge = root.querySelector("[data-complete]");

    const scatterPositions = [
      {
        x: -72,
        y: -54,
        rotation: -11,
      },
      {
        x: 54,
        y: 42,
        rotation: 9,
      },
      {
        x: -34,
        y: 68,
        rotation: -6,
      },
      {
        x: 68,
        y: -50,
        rotation: 8,
      },
      {
        x: -65,
        y: 34,
        rotation: -9,
      },
      {
        x: 42,
        y: -66,
        rotation: 11,
      },
    ];

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

    gsap.set(stage, {
      opacity: 0,
      scale: 0.95,
      y: 18,
    });

    gsap.set(containerOutline, {
      opacity: 0,
      scale: 0.92,
    });

    flexItems.forEach((item, index) => {
      const position = scatterPositions[index % scatterPositions.length];

      gsap.set(item, {
        opacity: 0,
        x: position.x,
        y: position.y,
        rotation: position.rotation,
        scale: 0.88,
      });
    });

    gsap.set(mainAxis, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(crossAxis, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "center top",
    });

    gsap.set([mainAxisLabel, crossAxisLabel], {
      opacity: 0,
      scale: 0.85,
    });

    gsap.set(gapMarkers, {
      opacity: 0,
      scale: 0,
    });

    gsap.set(propertyCards, {
      opacity: 0,
      y: 12,
      scale: 0.94,
    });

    gsap.set(completeBadge, {
      opacity: 0,
      scale: 0.84,
      y: 8,
    });

    /* ================================================== */
    /* REDUCED MOTION */
    /* ================================================== */

    if (reducedMotion) {
      status.textContent = "FLEXBOX LAYOUT READY";

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

      gsap.set(stage, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(containerOutline, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(flexItems, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
      });

      gsap.set(mainAxis, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(crossAxis, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set([mainAxisLabel, crossAxisLabel], {
        opacity: 1,
        scale: 1,
      });

      gsap.set(gapMarkers, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(propertyCards, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(completeBadge, {
        opacity: 1,
        scale: 1,
        y: 0,
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
        status.textContent = "STEP 01 · ELEMENTS WITHOUT FLEXBOX";
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
        stage,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.62,
        },
        0.18,
      )

      .to(
        flexItems,
        {
          opacity: 1,
          scale: 1,
          duration: 0.42,
          stagger: 0.08,
        },
        "-=0.28",
      )

      /* -------------------------------------------------- */
      /* DISPLAY FLEX */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · DISPLAY FLEX CREATES A FLEX ROW";
      })

      .to(controlRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        containerOutline,
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
        },
        "-=0.08",
      )

      .to(
        flexItems,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.07,
          ease: "back.out(1.5)",
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* MAIN AXIS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · JUSTIFY CONTENT USES THE MAIN AXIS";
      })

      .to(controlRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        mainAxis,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.65,
          ease: "power2.inOut",
        },
        "-=0.08",
      )

      .to(
        mainAxisLabel,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      .to(
        flexItems,
        {
          x: (index) => {
            const total = flexItems.length;

            if (total <= 1) {
              return 0;
            }

            const center = (total - 1) / 2;

            return (index - center) * 4;
          },

          duration: 0.42,

          ease: "power2.inOut",
        },
        "-=0.15",
      )

      /* -------------------------------------------------- */
      /* CROSS AXIS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · ALIGN ITEMS USES THE CROSS AXIS";
      })

      .to(controlRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        crossAxis,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.6,
          ease: "power2.inOut",
        },
        "-=0.08",
      )

      .to(
        crossAxisLabel,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        },
        "-=0.22",
      )

      .to(
        flexItems,
        {
          y: -15,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.inOut",
        },
        "-=0.14",
      )

      .to(flexItems, {
        y: 0,
        duration: 0.4,
        stagger: 0.04,
        ease: "back.out(1.5)",
      })

      /* -------------------------------------------------- */
      /* GAP */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · GAP CREATES CONSISTENT SPACE";
      })

      .to(controlRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        gapMarkers,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          stagger: 0.1,
          ease: "back.out(1.8)",
        },
        "-=0.1",
      )

      .to(
        flexItems,
        {
          scale: 1.04,
          duration: 0.15,
          stagger: 0.05,
          yoyo: true,
          repeat: 1,
        },
        "-=0.1",
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · FLEXBOX CONTROLS THE WHOLE LAYOUT";
      })

      .to(propertyCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        stage,
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
        status.textContent = "FLEXBOX LAYOUT READY";
      })

      .to(completeBadge, {
        opacity: 1,
        scale: 1,
        y: 0,
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
  }, [items]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS Flexbox visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>FLEXBOX LAYOUT ENGINE</span>

          <strong>Turn scattered elements into a controlled layout</strong>
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
        <div className={styles.grid} />

        <div className={styles.status} data-status>
          STEP 01 · ELEMENTS WITHOUT FLEXBOX
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CONTROLS */}
          {/* ============================================== */}

          <div className={styles.controlsPanel} data-controls>
            <div className={styles.panelHeader}>
              <Box size={14} />

              <div>
                <span>CSS LAYOUT</span>

                <strong>.container</strong>
              </div>
            </div>

            <div className={styles.controlList}>
              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Box size={13} />
                </div>

                <div>
                  <span>display</span>

                  <strong>flex</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <MoveHorizontal size={13} />
                </div>

                <div>
                  <span>justify-content</span>

                  <strong>center</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <MoveVertical size={13} />
                </div>

                <div>
                  <span>align-items</span>

                  <strong>center</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <AlignCenter size={13} />
                </div>

                <div>
                  <span>gap</span>

                  <strong>16px</strong>
                </div>

                <i />
              </div>
            </div>

            <div className={styles.codeBlock}>
              <span>
                <b>.container</b> {"{"}
              </span>

              <span>
                {"  "}
                <em>display</em>: flex;
              </span>

              <span>
                {"  "}
                <em>justify-content</em>: center;
              </span>

              <span>
                {"  "}
                <em>align-items</em>: center;
              </span>

              <span>
                {"  "}
                <em>gap</em>: 16px;
              </span>

              <span>{"}"}</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* FLEX STAGE */}
          {/* ============================================== */}

          <div className={styles.flexPanel}>
            <div className={styles.flexHeader}>
              <div>
                <span>LIVE FLEX CONTAINER</span>

                <strong>Layout Playground</strong>
              </div>

              <span className={styles.activeBadge}>FLEX ACTIVE</span>
            </div>

            <div className={styles.flexStage} data-flex-stage>
              <div className={styles.containerOutline} data-container-outline />

              {/* MAIN AXIS */}

              <div className={styles.mainAxis} data-main-axis>
                <span className={styles.axisArrowLeft}>◀</span>

                <div />

                <span className={styles.axisArrowRight}>▶</span>
              </div>

              <div className={styles.mainAxisLabel} data-main-axis-label>
                MAIN AXIS
              </div>

              {/* CROSS AXIS */}

              <div className={styles.crossAxis} data-cross-axis>
                <span>▲</span>

                <div />

                <span>▼</span>
              </div>

              <div className={styles.crossAxisLabel} data-cross-axis-label>
                CROSS AXIS
              </div>

              {/* FLEX ITEMS */}

              <div className={styles.items}>
                {safeItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={styles.flexItem}
                    data-flex-item
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>

                    <strong>{item}</strong>
                  </div>
                ))}

                {safeItems.slice(0, -1).map((_, index) => (
                  <div
                    key={`gap-${index}`}
                    className={styles.gapMarker}
                    data-gap-marker
                    style={{
                      "--gap-index": index,
                      "--gap-count": safeItems.length,
                    }}
                  >
                    <span>16px</span>
                  </div>
                ))}
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Layout aligned
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* PROPERTY SUMMARY */}
          {/* ============================================== */}

          <div className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span>FLEX SYSTEM</span>

              <strong>What changed?</strong>
            </div>

            <div className={styles.propertyCard} data-property-card>
              <span>01</span>

              <div>
                <strong>Flex Container</strong>

                <p>display: flex turns the parent into a layout controller.</p>
              </div>
            </div>

            <div className={styles.propertyCard} data-property-card>
              <span>02</span>

              <div>
                <strong>Main Axis</strong>

                <p>justify-content controls where items sit along the row.</p>
              </div>
            </div>

            <div className={styles.propertyCard} data-property-card>
              <span>03</span>

              <div>
                <strong>Cross Axis</strong>

                <p>align-items controls the opposite direction.</p>
              </div>
            </div>

            <div className={styles.propertyCard} data-property-card>
              <span>04</span>

              <div>
                <strong>Gap</strong>

                <p>gap creates consistent spacing between every flex item.</p>
              </div>
            </div>

            <div className={styles.summarySignal}>
              <Sparkles size={13} />

              <span>ONE PARENT · FULL LAYOUT CONTROL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>FLEX</span>

          <div>
            <strong>Create the layout</strong>

            <p>display: flex gives the parent control over its children.</p>
          </div>
        </div>

        <div>
          <span>AXES</span>

          <div>
            <strong>Control alignment</strong>

            <p>Main and cross axes explain how Flexbox positions elements.</p>
          </div>
        </div>

        <div>
          <span>GAP</span>

          <div>
            <strong>Keep spacing consistent</strong>

            <p>
              One gap value can space every item without individual margins.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>DISPLAY FLEX → JUSTIFY → ALIGN → GAP</span>
      </div>
    </section>
  );
}

export default CssFlexboxLayoutAnimation;
