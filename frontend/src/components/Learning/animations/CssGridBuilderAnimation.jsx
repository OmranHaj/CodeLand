import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Check,
  Columns3,
  Grid3X3,
  LayoutGrid,
  RotateCcw,
  Rows3,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssGridBuilderAnimation.module.css";

function CssGridBuilderAnimation({
  columns = 3,

  items = [
    "Project 1",
    "Project 2",
    "Project 3",
    "Project 4",
    "Project 5",
    "Project 6",
  ],
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeColumns = Math.min(4, Math.max(1, Number(columns) || 3));

  const safeItems = useMemo(() => {
    if (!Array.isArray(items) || !items.length) {
      return [
        "Project 1",
        "Project 2",
        "Project 3",
        "Project 4",
        "Project 5",
        "Project 6",
      ];
    }

    return items.slice(0, 9);
  }, [items]);

  const rowCount = Math.max(1, Math.ceil(safeItems.length / safeColumns));

  const verticalTracks = Array.from(
    {
      length: Math.max(0, safeColumns - 1),
    },
    (_, index) => index + 1,
  );

  const horizontalTracks = Array.from(
    {
      length: Math.max(0, rowCount - 1),
    },
    (_, index) => index + 1,
  );

  /* ====================================================== */
  /* ANIMATION */
  /* ====================================================== */

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

    const gridStage = root.querySelector("[data-grid-stage]");

    const gridShell = root.querySelector("[data-grid-shell]");

    const verticalLines = root.querySelectorAll("[data-vertical-track]");

    const horizontalLines = root.querySelectorAll("[data-horizontal-track]");

    const columnLabels = root.querySelectorAll("[data-column-label]");

    const rowLabels = root.querySelectorAll("[data-row-label]");

    const gridItems = root.querySelectorAll("[data-grid-item]");

    const cellSignals = root.querySelectorAll("[data-cell-signal]");

    const gapIndicators = root.querySelectorAll("[data-gap-indicator]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    const scanner = root.querySelector("[data-scanner]");

    const scatter = [
      {
        x: -90,
        y: -52,
        rotation: -10,
      },
      {
        x: 74,
        y: -64,
        rotation: 9,
      },
      {
        x: -52,
        y: 78,
        rotation: -7,
      },
      {
        x: 92,
        y: 45,
        rotation: 11,
      },
      {
        x: -80,
        y: 42,
        rotation: -9,
      },
      {
        x: 58,
        y: 82,
        rotation: 8,
      },
      {
        x: -65,
        y: -78,
        rotation: -6,
      },
      {
        x: 70,
        y: -38,
        rotation: 10,
      },
      {
        x: 30,
        y: 86,
        rotation: -8,
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

    gsap.set(gridStage, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(gridShell, {
      opacity: 0,
      scale: 0.94,
    });

    gsap.set(verticalLines, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "top center",
    });

    gsap.set(horizontalLines, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(columnLabels, {
      opacity: 0,
      y: -6,
      scale: 0.85,
    });

    gsap.set(rowLabels, {
      opacity: 0,
      x: -6,
      scale: 0.85,
    });

    gridItems.forEach((item, index) => {
      const position = scatter[index % scatter.length];

      gsap.set(item, {
        opacity: 0,
        x: position.x,
        y: position.y,
        rotation: position.rotation,
        scale: 0.82,
      });
    });

    gsap.set(cellSignals, {
      opacity: 0,
      scale: 0,
    });

    gsap.set(gapIndicators, {
      opacity: 0,
      scale: 0.7,
    });

    gsap.set(scanner, {
      opacity: 0,
      xPercent: -120,
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
      status.textContent = "GRID SYSTEM READY";

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

      gsap.set(gridStage, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(gridShell, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(verticalLines, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(horizontalLines, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(columnLabels, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(rowLabels, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(gridItems, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
      });

      gsap.set(cellSignals, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(gapIndicators, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(scanner, {
        opacity: 0,
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
        status.textContent = "STEP 01 · ELEMENTS WITHOUT A GRID";
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
        gridStage,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
        },
        0.18,
      )

      .to(
        gridItems,
        {
          opacity: 1,
          scale: 0.9,
          duration: 0.4,
          stagger: 0.055,
        },
        "-=0.25",
      )

      /* -------------------------------------------------- */
      /* DISPLAY GRID */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · DISPLAY GRID CREATES THE GRID SYSTEM";
      })

      .to(controlRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        gridShell,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        "-=0.08",
      )

      /* -------------------------------------------------- */
      /* COLUMNS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 03 · BUILDING ${safeColumns} EQUAL COLUMNS`;
      })

      .to(controlRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        verticalLines,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.62,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        "-=0.08",
      )

      .to(
        columnLabels,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )

      /* -------------------------------------------------- */
      /* ROWS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · GRID CREATES ROWS AUTOMATICALLY";
      })

      .to(
        horizontalLines,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.62,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        "-=0.05",
      )

      .to(
        rowLabels,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      )

      /* -------------------------------------------------- */
      /* GAP */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · GAP CREATES SPACE BETWEEN TRACKS";
      })

      .to(controlRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        gapIndicators,
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.08,
          ease: "back.out(1.8)",
        },
        "-=0.08",
      )

      /* -------------------------------------------------- */
      /* SNAP ITEMS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · ITEMS SNAP INTO GRID CELLS";
      })

      .to(controlRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        scanner,
        {
          opacity: 0.7,
          xPercent: 120,
          duration: 1,
          ease: "power2.inOut",
        },
        "-=0.05",
      )

      .to(
        gridItems,
        {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.72,
          stagger: 0.09,
          ease: "back.out(1.55)",
        },
        "-=0.72",
      )

      .to(
        cellSignals,
        {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          stagger: 0.06,
          ease: "back.out(2)",
        },
        "-=0.48",
      )

      .to(scanner, {
        opacity: 0,
        duration: 0.25,
      })

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 07 · ROWS + COLUMNS = 2D LAYOUT";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        gridShell,
        {
          scale: 1.015,
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
        status.textContent = "GRID SYSTEM READY";
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
  }, [safeColumns, safeItems]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS Grid visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>GRID BUILDER</span>

          <strong>Build rows and columns into a powerful layout</strong>
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
          STEP 01 · ELEMENTS WITHOUT A GRID
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CONTROLS */}
          {/* ============================================== */}

          <div className={styles.controlsPanel} data-controls>
            <div className={styles.panelHeader}>
              <Grid3X3 size={14} />

              <div>
                <span>CSS GRID</span>

                <strong>.projects</strong>
              </div>
            </div>

            <div className={styles.controlList}>
              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <LayoutGrid size={13} />
                </div>

                <div>
                  <span>display</span>

                  <strong>grid</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Columns3 size={13} />
                </div>

                <div>
                  <span>grid-template-columns</span>

                  <strong>repeat({safeColumns}, 1fr)</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Rows3 size={13} />
                </div>

                <div>
                  <span>gap</span>

                  <strong>20px</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Grid3X3 size={13} />
                </div>

                <div>
                  <span>auto-placement</span>

                  <strong>enabled</strong>
                </div>

                <i />
              </div>
            </div>

            <div className={styles.codeBlock}>
              <span>
                <b>.projects</b> {"{"}
              </span>

              <span>
                {"  "}
                <em>display</em>: grid;
              </span>

              <span>
                {"  "}
                <em>grid-template-columns</em>:
              </span>

              <span className={styles.codeIndent}>
                repeat({safeColumns}, 1fr);
              </span>

              <span>
                {"  "}
                <em>gap</em>: 20px;
              </span>

              <span>{"}"}</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* GRID STAGE */}
          {/* ============================================== */}

          <div className={styles.gridPanel}>
            <div className={styles.gridHeader}>
              <div>
                <span>LIVE GRID MATRIX</span>

                <strong>
                  {safeColumns} Columns · {rowCount}{" "}
                  {rowCount === 1 ? "Row" : "Rows"}
                </strong>
              </div>

              <span className={styles.matrixBadge}>2D LAYOUT</span>
            </div>

            <div className={styles.gridStage} data-grid-stage>
              <div className={styles.gridShell} data-grid-shell>
                {/* ======================================== */}
                {/* COLUMN LABELS */}
                {/* ======================================== */}

                <div
                  className={styles.columnLabels}
                  style={{
                    gridTemplateColumns: `repeat(${safeColumns}, 1fr)`,
                  }}
                >
                  {Array.from(
                    {
                      length: safeColumns,
                    },
                    (_, index) => (
                      <span key={`column-${index}`} data-column-label>
                        COL {index + 1}
                      </span>
                    ),
                  )}
                </div>

                {/* ======================================== */}
                {/* ROW LABELS */}
                {/* ======================================== */}

                <div className={styles.rowLabels}>
                  {Array.from(
                    {
                      length: rowCount,
                    },
                    (_, index) => (
                      <span
                        key={`row-${index}`}
                        data-row-label
                        style={{
                          top: `${((index + 0.5) / rowCount) * 100}%`,
                        }}
                      >
                        R{index + 1}
                      </span>
                    ),
                  )}
                </div>

                {/* ======================================== */}
                {/* TRACKS */}
                {/* ======================================== */}

                <div className={styles.tracks}>
                  {verticalTracks.map((track) => (
                    <span
                      key={`vertical-${track}`}
                      className={styles.verticalTrack}
                      data-vertical-track
                      style={{
                        left: `${(track / safeColumns) * 100}%`,
                      }}
                    />
                  ))}

                  {horizontalTracks.map((track) => (
                    <span
                      key={`horizontal-${track}`}
                      className={styles.horizontalTrack}
                      data-horizontal-track
                      style={{
                        top: `${(track / rowCount) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                {/* ======================================== */}
                {/* GAP SIGNALS */}
                {/* ======================================== */}

                <div className={styles.gapSignals}>
                  {verticalTracks.map((track) => (
                    <span
                      key={`gap-v-${track}`}
                      className={styles.verticalGap}
                      data-gap-indicator
                      style={{
                        left: `${(track / safeColumns) * 100}%`,
                      }}
                    >
                      GAP
                    </span>
                  ))}

                  {horizontalTracks.map((track) => (
                    <span
                      key={`gap-h-${track}`}
                      className={styles.horizontalGap}
                      data-gap-indicator
                      style={{
                        top: `${(track / rowCount) * 100}%`,
                      }}
                    />
                  ))}
                </div>

                {/* ======================================== */}
                {/* SCANNER */}
                {/* ======================================== */}

                <div className={styles.scanner} data-scanner />

                {/* ======================================== */}
                {/* ACTUAL GRID */}
                {/* ======================================== */}

                <div
                  className={styles.itemsGrid}
                  style={{
                    gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
                  }}
                >
                  {safeItems.map((item, index) => (
                    <article
                      key={`${item}-${index}`}
                      className={styles.gridItem}
                      data-grid-item
                    >
                      <div className={styles.itemTop}>
                        <span>CELL</span>

                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                      </div>

                      <div className={styles.itemIcon}>
                        <LayoutGrid size={15} />
                      </div>

                      <strong className={styles.itemTitle}>{item}</strong>

                      <div className={styles.cellSignal} data-cell-signal>
                        <Check size={9} />
                        SNAPPED
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Grid tracks locked
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* SUMMARY */}
          {/* ============================================== */}

          <div className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span>GRID SYSTEM</span>

              <strong>How it works</strong>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>01</span>

              <div>
                <strong>Columns</strong>

                <p>Define the vertical tracks of the layout.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>02</span>

              <div>
                <strong>Rows</strong>

                <p>Grid creates new rows as more items arrive.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>03</span>

              <div>
                <strong>Cells</strong>

                <p>Every row and column intersection creates a cell.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>04</span>

              <div>
                <strong>Auto Placement</strong>

                <p>Grid automatically places items into available cells.</p>
              </div>
            </div>

            <div className={styles.summarySignal}>
              <Sparkles size={13} />

              <span>ROWS + COLUMNS = GRID POWER</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>TRACKS</span>

          <div>
            <strong>Define the structure</strong>

            <p>Grid columns and rows create tracks across the container.</p>
          </div>
        </div>

        <div>
          <span>CELLS</span>

          <div>
            <strong>Organize the content</strong>

            <p>Items are placed inside cells created by intersecting tracks.</p>
          </div>
        </div>

        <div>
          <span>2D</span>

          <div>
            <strong>Control two directions</strong>

            <p>Unlike a simple row, Grid controls columns and rows together.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Grid3X3 size={13} />

        <span>CONTAINER → COLUMNS → ROWS → CELLS → SNAP</span>
      </div>
    </section>
  );
}

export default CssGridBuilderAnimation;
