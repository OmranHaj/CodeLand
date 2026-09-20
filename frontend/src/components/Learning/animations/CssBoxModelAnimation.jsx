import { useLayoutEffect, useRef } from "react";
import {
  Box,
  Check,
  Layers3,
  Maximize2,
  Move,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssBoxModelAnimation.module.css";

function CssBoxModelAnimation({
  content = "My Project",
  padding = 24,
  margin = 20,
  border = 2,
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

    const codePanel = root.querySelector("[data-code-panel]");
    const codeRows = root.querySelectorAll("[data-code-row]");

    const scene = root.querySelector("[data-box-scene]");

    const contentLayer = root.querySelector("[data-content-layer]");
    const paddingLayer = root.querySelector("[data-padding-layer]");
    const borderLayer = root.querySelector("[data-border-layer]");
    const marginLayer = root.querySelector("[data-margin-layer]");

    const contentLabel = root.querySelector("[data-content-label]");
    const paddingLabel = root.querySelector("[data-padding-label]");
    const borderLabel = root.querySelector("[data-border-label]");
    const marginLabel = root.querySelector("[data-margin-label]");

    const paddingMeasure = root.querySelector("[data-padding-measure]");
    const borderMeasure = root.querySelector("[data-border-measure]");
    const marginMeasure = root.querySelector("[data-margin-measure]");

    const siblingLeft = root.querySelector("[data-sibling-left]");
    const siblingRight = root.querySelector("[data-sibling-right]");

    const layerCards = root.querySelectorAll("[data-layer-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -24,
      scale: 0.96,
    });

    gsap.set(codeRows, {
      opacity: 0.35,
      x: -8,
    });

    gsap.set(scene, {
      opacity: 0,
      scale: 0.94,
      y: 18,
    });

    gsap.set(contentLayer, {
      opacity: 0,
      scale: 0.82,
    });

    gsap.set(paddingLayer, {
      opacity: 0,
      scale: 0.66,
    });

    gsap.set(borderLayer, {
      opacity: 0,
      scale: 0.58,
    });

    gsap.set(marginLayer, {
      opacity: 0,
      scale: 0.5,
    });

    gsap.set([contentLabel, paddingLabel, borderLabel, marginLabel], {
      opacity: 0,
      y: 6,
    });

    gsap.set([paddingMeasure, borderMeasure, marginMeasure], {
      opacity: 0,
      scale: 0.7,
    });

    gsap.set(siblingLeft, {
      x: 70,
      opacity: 0.28,
    });

    gsap.set(siblingRight, {
      x: -70,
      opacity: 0.28,
    });

    gsap.set(layerCards, {
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
      status.textContent = "BOX MODEL COMPLETE";

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(codePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(codeRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(scene, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(contentLayer, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(paddingLayer, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(borderLayer, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(marginLayer, {
        opacity: 1,
        scale: 1,
      });

      gsap.set([contentLabel, paddingLabel, borderLabel, marginLabel], {
        opacity: 1,
        y: 0,
      });

      gsap.set([paddingMeasure, borderMeasure, marginMeasure], {
        opacity: 1,
        scale: 1,
      });

      gsap.set(siblingLeft, {
        x: 0,
        opacity: 0.7,
      });

      gsap.set(siblingRight, {
        x: 0,
        opacity: 0.7,
      });

      gsap.set(layerCards, {
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
        status.textContent = "STEP 01 · EVERY ELEMENT IS A BOX";
      })

      .to(
        codePanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.55,
        },
        0.1,
      )

      .to(
        scene,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.62,
        },
        0.18,
      )

      /* -------------------------------------------------- */
      /* CONTENT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · CONTENT";
      })

      .to(codeRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.28,
      })

      .to(
        contentLayer,
        {
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: "back.out(1.8)",
        },
        "-=0.05",
      )

      .to(
        contentLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* PADDING */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · PADDING EXPANDS INSIDE SPACE";
      })

      .to(codeRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.28,
      })

      .to(
        paddingLayer,
        {
          opacity: 1,
          scale: 1,
          duration: 0.72,
          ease: "expo.out",
        },
        "-=0.05",
      )

      .to(
        paddingLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=0.3",
      )

      .to(
        paddingMeasure,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          ease: "back.out(1.7)",
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* BORDER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · BORDER WRAPS THE BOX";
      })

      .to(codeRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.28,
      })

      .to(
        borderLayer,
        {
          opacity: 1,
          scale: 1,
          duration: 0.62,
          ease: "back.out(1.6)",
        },
        "-=0.05",
      )

      .to(
        borderLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=0.28",
      )

      .to(
        borderMeasure,
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* MARGIN */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · MARGIN PUSHES OTHER ELEMENTS AWAY";
      })

      .to(codeRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.28,
      })

      .to(
        marginLayer,
        {
          opacity: 1,
          scale: 1,
          duration: 0.72,
          ease: "expo.out",
        },
        "-=0.05",
      )

      .to(
        marginLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=0.3",
      )

      .to(
        marginMeasure,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      .to(
        siblingLeft,
        {
          x: 0,
          opacity: 0.7,
          duration: 0.65,
          ease: "power2.out",
        },
        "-=0.45",
      )

      .to(
        siblingRight,
        {
          x: 0,
          opacity: 0.7,
          duration: 0.65,
          ease: "power2.out",
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* LAYERS SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · BOX MODEL LAYERS";
      })

      .to(layerCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.11,
      })

      .to(
        scene,
        {
          scale: 1.025,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.1",
      )

      /* -------------------------------------------------- */
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "BOX MODEL COMPLETE";
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

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      playAnimation();
    }, rootRef);

    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [content, padding, margin, border]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS box model visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>BOX MODEL SCANNER</span>

          <strong>See how every CSS box is built</strong>
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
          STEP 01 · EVERY ELEMENT IS A BOX
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE PANEL */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Box size={14} />

              <div>
                <span>CSS RULE</span>

                <strong>.card</strong>
              </div>
            </div>

            <div className={styles.code}>
              <div data-code-row>
                <span className={styles.selector}>.card</span> {"{"}
              </div>

              <div data-code-row>
                {"  "}
                <span className={styles.property}>padding</span>:{" "}
                <strong>{padding}px</strong>;
              </div>

              <div data-code-row>
                {"  "}
                <span className={styles.property}>border</span>:{" "}
                <strong>{border}px solid</strong>;
              </div>

              <div data-code-row>
                {"  "}
                <span className={styles.property}>margin</span>:{" "}
                <strong>{margin}px</strong>;
              </div>

              <div>{"}"}</div>
            </div>

            <div className={styles.codeNote}>
              <Layers3 size={13} />

              <span>Each property controls a different layer.</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* BOX SCENE */}
          {/* ============================================== */}

          <div className={styles.boxScene} data-box-scene>
            <div className={styles.sceneHeader}>
              <span>LIVE BOX MODEL</span>

              <strong>.card</strong>
            </div>

            <div className={styles.sceneBody}>
              <div className={styles.sibling} data-sibling-left>
                A
              </div>

              <div className={styles.model}>
                {/* MARGIN */}

                <div
                  className={`${styles.layer} ${styles.marginLayer}`}
                  data-margin-layer
                >
                  <span className={styles.layerLabel} data-margin-label>
                    MARGIN
                  </span>

                  <div
                    className={`${styles.measure} ${styles.marginMeasure}`}
                    data-margin-measure
                  >
                    <Move size={11} />
                    {margin}px
                  </div>

                  {/* BORDER */}

                  <div
                    className={`${styles.layer} ${styles.borderLayer}`}
                    data-border-layer
                  >
                    <span className={styles.layerLabel} data-border-label>
                      BORDER
                    </span>

                    <div
                      className={`${styles.measure} ${styles.borderMeasure}`}
                      data-border-measure
                    >
                      <Maximize2 size={11} />
                      {border}px
                    </div>

                    {/* PADDING */}

                    <div
                      className={`${styles.layer} ${styles.paddingLayer}`}
                      data-padding-layer
                    >
                      <span className={styles.layerLabel} data-padding-label>
                        PADDING
                      </span>

                      <div
                        className={`${styles.measure} ${styles.paddingMeasure}`}
                        data-padding-measure
                      >
                        <Move size={11} />
                        {padding}px
                      </div>

                      {/* CONTENT */}

                      <div
                        className={`${styles.layer} ${styles.contentLayer}`}
                        data-content-layer
                      >
                        <span className={styles.contentType} data-content-label>
                          CONTENT
                        </span>

                        <strong>{content}</strong>

                        <p>Element content lives here.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.sibling} data-sibling-right>
                B
              </div>
            </div>

            <div className={styles.completeBadge} data-complete>
              <Check size={12} />
              Full box calculated
            </div>
          </div>

          {/* ============================================== */}
          {/* LAYER EXPLANATION */}
          {/* ============================================== */}

          <div className={styles.layersPanel}>
            <div className={styles.layersHeader}>
              <span>ANATOMY</span>

              <strong>4 Layers</strong>
            </div>

            <div
              className={`${styles.layerCard} ${styles.contentCard}`}
              data-layer-card
            >
              <span>01</span>

              <div>
                <strong>Content</strong>

                <p>The actual text, image, or component.</p>
              </div>
            </div>

            <div
              className={`${styles.layerCard} ${styles.paddingCard}`}
              data-layer-card
            >
              <span>02</span>

              <div>
                <strong>Padding</strong>

                <p>Space between content and border.</p>
              </div>
            </div>

            <div
              className={`${styles.layerCard} ${styles.borderCard}`}
              data-layer-card
            >
              <span>03</span>

              <div>
                <strong>Border</strong>

                <p>The visible edge around the element.</p>
              </div>
            </div>

            <div
              className={`${styles.layerCard} ${styles.marginCard}`}
              data-layer-card
            >
              <span>04</span>

              <div>
                <strong>Margin</strong>

                <p>Space between this box and nearby elements.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>INSIDE</span>

          <div>
            <strong>Padding</strong>

            <p>Padding gives the content breathing room inside the element.</p>
          </div>
        </div>

        <div>
          <span>EDGE</span>

          <div>
            <strong>Border</strong>

            <p>The border surrounds both the content and its padding.</p>
          </div>
        </div>

        <div>
          <span>OUTSIDE</span>

          <div>
            <strong>Margin</strong>

            <p>
              Margin creates distance between the element and its neighbors.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>CONTENT → PADDING → BORDER → MARGIN</span>
      </div>
    </section>
  );
}

export default CssBoxModelAnimation;
