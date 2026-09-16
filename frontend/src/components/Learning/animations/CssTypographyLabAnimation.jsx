import { useLayoutEffect, useRef } from "react";
import {
  AlignCenter,
  Check,
  MoveVertical,
  RotateCcw,
  Sparkles,
  Type,
  Weight,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssTypographyLabAnimation.module.css";

function CssTypographyLabAnimation({
  heading = "Future Coder",
  paragraph = "Building amazing things with code.",
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

    const propertyPanel = root.querySelector("[data-property-panel]");

    const propertyRows = root.querySelectorAll("[data-property]");

    const propertyValues = root.querySelectorAll("[data-property-value]");

    const preview = root.querySelector("[data-preview]");

    const previewHeading = root.querySelector("[data-heading]");

    const previewParagraph = root.querySelector("[data-paragraph]");

    const baselineLines = root.querySelectorAll("[data-baseline]");

    const sizeGuide = root.querySelector("[data-size-guide]");

    const sizeValue = root.querySelector("[data-size-value]");

    const weightMeter = root.querySelector("[data-weight-meter]");

    const alignmentAxis = root.querySelector("[data-alignment-axis]");

    const rhythmGuide = root.querySelector("[data-rhythm-guide]");

    const hierarchyCards = root.querySelectorAll("[data-hierarchy-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(propertyPanel, {
      opacity: 0,
      x: -24,
      scale: 0.96,
    });

    gsap.set(propertyRows, {
      opacity: 0.42,
      x: -8,
    });

    gsap.set(propertyValues, {
      opacity: 0.35,
    });

    gsap.set(preview, {
      opacity: 0,
      y: 18,
      scale: 0.96,
    });

    gsap.set(previewHeading, {
      fontSize: "18px",
      fontWeight: 400,
      textAlign: "left",
      letterSpacing: "0px",
      opacity: 1,
    });

    gsap.set(previewParagraph, {
      fontSize: "12px",
      lineHeight: 1.2,
      textAlign: "left",
      opacity: 0.68,
    });

    gsap.set(baselineLines, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(sizeGuide, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "bottom center",
    });

    gsap.set(sizeValue, {
      opacity: 0,
      y: 5,
    });

    gsap.set(weightMeter, {
      scaleX: 0.18,
      transformOrigin: "left center",
      opacity: 0.35,
    });

    gsap.set(alignmentAxis, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "center center",
    });

    gsap.set(rhythmGuide, {
      opacity: 0,
      scaleY: 0.55,
    });

    gsap.set(hierarchyCards, {
      opacity: 0,
      y: 12,
      scale: 0.94,
    });

    gsap.set(completeBadge, {
      opacity: 0,
      scale: 0.82,
      y: 7,
    });

    /* ================================================== */
    /* REDUCED MOTION */
    /* ================================================== */

    if (reducedMotion) {
      status.textContent = "TYPOGRAPHY SYSTEM READY";

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(propertyPanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(propertyRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(propertyValues, {
        opacity: 1,
      });

      gsap.set(preview, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(previewHeading, {
        fontSize: "42px",
        fontWeight: 800,
        textAlign: "center",
        letterSpacing: "-1.4px",
      });

      gsap.set(previewParagraph, {
        fontSize: "16px",
        lineHeight: 1.6,
        textAlign: "center",
        opacity: 0.82,
      });

      gsap.set(baselineLines, {
        opacity: 0.25,
        scaleX: 1,
      });

      gsap.set(sizeGuide, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(sizeValue, {
        opacity: 1,
        y: 0,
      });

      gsap.set(weightMeter, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(alignmentAxis, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(rhythmGuide, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(hierarchyCards, {
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
        status.textContent = "STEP 01 · PLAIN TYPOGRAPHY";
      })

      .to(
        propertyPanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.55,
        },
        0.1,
      )

      .to(
        preview,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
        },
        0.18,
      )

      .to(
        baselineLines,
        {
          opacity: 0.13,
          scaleX: 1,
          duration: 0.65,
          stagger: 0.05,
        },
        "-=0.35",
      )

      /* -------------------------------------------------- */
      /* FONT SIZE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · FONT SIZE CREATES HIERARCHY";
      })

      .to(propertyRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        propertyValues[0],
        {
          opacity: 1,
          duration: 0.25,
        },
        "<",
      )

      .to(
        sizeGuide,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.42,
        },
        "-=0.1",
      )

      .to(
        sizeValue,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=0.25",
      )

      .to(
        previewHeading,
        {
          fontSize: "42px",
          letterSpacing: "-1px",
          duration: 0.9,
          ease: "expo.out",
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* FONT WEIGHT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · FONT WEIGHT ADDS EMPHASIS";
      })

      .to(propertyRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        propertyValues[1],
        {
          opacity: 1,
          duration: 0.25,
        },
        "<",
      )

      .to(
        weightMeter,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.72,
          ease: "power2.inOut",
        },
        "-=0.1",
      )

      .to(
        previewHeading,
        {
          fontWeight: 800,
          letterSpacing: "-1.4px",
          duration: 0.72,
          ease: "power2.inOut",
        },
        "-=0.6",
      )

      .to(
        previewHeading,
        {
          scale: 1.035,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.15",
      )

      /* -------------------------------------------------- */
      /* ALIGNMENT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · ALIGNMENT CONTROLS FOCUS";
      })

      .to(propertyRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        propertyValues[2],
        {
          opacity: 1,
          duration: 0.25,
        },
        "<",
      )

      .to(
        alignmentAxis,
        {
          opacity: 0.8,
          scaleX: 1,
          duration: 0.5,
        },
        "-=0.1",
      )

      .to(
        [previewHeading, previewParagraph],
        {
          x: 18,
          duration: 0.26,
          ease: "power2.inOut",
        },
        "-=0.25",
      )

      .set([previewHeading, previewParagraph], {
        textAlign: "center",
      })

      .to([previewHeading, previewParagraph], {
        x: 0,
        duration: 0.48,
        ease: "back.out(1.4)",
      })

      /* -------------------------------------------------- */
      /* LINE HEIGHT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · LINE HEIGHT BUILDS RHYTHM";
      })

      .to(propertyRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        propertyValues[3],
        {
          opacity: 1,
          duration: 0.25,
        },
        "<",
      )

      .to(
        rhythmGuide,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.5,
        },
        "-=0.08",
      )

      .to(
        previewParagraph,
        {
          fontSize: "16px",
          lineHeight: 1.6,
          opacity: 0.82,
          duration: 0.75,
          ease: "power2.inOut",
        },
        "-=0.35",
      )

      .to(
        baselineLines,
        {
          opacity: 0.25,
          duration: 0.35,
        },
        "-=0.3",
      )

      /* -------------------------------------------------- */
      /* HIERARCHY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · BUILDING VISUAL HIERARCHY";
      })

      .to(hierarchyCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.12,
      })

      .to(
        preview,
        {
          y: -5,
          duration: 0.17,
          yoyo: true,
          repeat: 1,
        },
        "-=0.05",
      )

      /* -------------------------------------------------- */
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "TYPOGRAPHY SYSTEM READY";
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
  }, [heading, paragraph]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS typography visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>TYPOGRAPHY LAB</span>

          <strong>Turn plain text into visual hierarchy</strong>
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
          STEP 01 · PLAIN TYPOGRAPHY
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* PROPERTIES */}
          {/* ============================================== */}

          <div className={styles.propertyPanel} data-property-panel>
            <div className={styles.panelHeader}>
              <Type size={14} />

              <div>
                <span>CSS CONTROLS</span>
                <strong>Typography Properties</strong>
              </div>
            </div>

            <div className={styles.propertyList}>
              <div className={styles.propertyRow} data-property>
                <div className={styles.propertyIcon}>
                  <Type size={14} />
                </div>

                <div className={styles.propertyInfo}>
                  <span>font-size</span>

                  <strong data-property-value>42px</strong>
                </div>

                <i />
              </div>

              <div className={styles.propertyRow} data-property>
                <div className={styles.propertyIcon}>
                  <Weight size={14} />
                </div>

                <div className={styles.propertyInfo}>
                  <span>font-weight</span>

                  <strong data-property-value>800</strong>
                </div>

                <i />
              </div>

              <div className={styles.propertyRow} data-property>
                <div className={styles.propertyIcon}>
                  <AlignCenter size={14} />
                </div>

                <div className={styles.propertyInfo}>
                  <span>text-align</span>

                  <strong data-property-value>center</strong>
                </div>

                <i />
              </div>

              <div className={styles.propertyRow} data-property>
                <div className={styles.propertyIcon}>
                  <MoveVertical size={14} />
                </div>

                <div className={styles.propertyInfo}>
                  <span>line-height</span>

                  <strong data-property-value>1.6</strong>
                </div>

                <i />
              </div>
            </div>

            <div className={styles.codeBlock}>
              <span>
                <b>h1</b> {"{"}
              </span>

              <span>
                {"  "}
                <em>font-size</em>: 42px;
              </span>

              <span>
                {"  "}
                <em>font-weight</em>: 800;
              </span>

              <span>
                {"  "}
                <em>text-align</em>: center;
              </span>

              <span>{"}"}</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* TYPOGRAPHY PREVIEW */}
          {/* ============================================== */}

          <div className={styles.previewZone}>
            <div className={styles.previewHeader}>
              <div>
                <span>LIVE TYPE STAGE</span>

                <strong>Browser Preview</strong>
              </div>

              <span className={styles.liveBadge}>LIVE</span>
            </div>

            <div className={styles.preview} data-preview>
              <div className={styles.browserBar}>
                <div>
                  <i />
                  <i />
                  <i />
                </div>

                <span>typography.codeland</span>
              </div>

              <div className={styles.previewBody}>
                <div className={styles.baselines}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <span key={index} data-baseline />
                  ))}
                </div>

                <div className={styles.alignmentAxis} data-alignment-axis>
                  <span />
                  <strong>CENTER AXIS</strong>
                  <span />
                </div>

                <div className={styles.sizeGuide} data-size-guide>
                  <span />

                  <strong data-size-value>42px</strong>

                  <span />
                </div>

                <div className={styles.typeContent}>
                  <span className={styles.contentEyebrow}>
                    CODELAND CREATOR
                  </span>

                  <h2 data-heading>{heading}</h2>

                  <p data-paragraph>{paragraph}</p>

                  <div className={styles.weightArea}>
                    <span>WEIGHT</span>

                    <div>
                      <i data-weight-meter />
                    </div>

                    <strong>800</strong>
                  </div>

                  <div className={styles.rhythmGuide} data-rhythm-guide>
                    <MoveVertical size={12} />

                    <span>LINE RHYTHM · 1.6</span>
                  </div>

                  <div className={styles.completeBadge} data-complete>
                    <Check size={12} />
                    Typography balanced
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* HIERARCHY */}
          {/* ============================================== */}

          <div className={styles.hierarchyPanel}>
            <div className={styles.hierarchyHeader}>
              <span>OUTPUT</span>

              <strong>Visual Hierarchy</strong>
            </div>

            <div className={styles.hierarchyCard} data-hierarchy-card>
              <span className={styles.hierarchyNumber}>01</span>

              <div>
                <strong>Heading</strong>

                <p>Large + bold grabs attention first.</p>
              </div>

              <div className={styles.headingSample}>Aa</div>
            </div>

            <div className={styles.hierarchyCard} data-hierarchy-card>
              <span className={styles.hierarchyNumber}>02</span>

              <div>
                <strong>Supporting text</strong>

                <p>Smaller type explains the idea.</p>
              </div>

              <div className={styles.bodySample}>Aa</div>
            </div>

            <div className={styles.hierarchyCard} data-hierarchy-card>
              <span className={styles.hierarchyNumber}>03</span>

              <div>
                <strong>Rhythm</strong>

                <p>Line height gives text room to breathe.</p>
              </div>

              <div className={styles.rhythmSample}>
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className={styles.hierarchySignal}>
              <Sparkles size={13} />

              <span>CLEAR TYPE = CLEAR COMMUNICATION</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>SIZE</span>

          <div>
            <strong>Create importance</strong>

            <p>Larger text naturally receives more visual attention.</p>
          </div>
        </div>

        <div>
          <span>WEIGHT</span>

          <div>
            <strong>Add emphasis</strong>

            <p>Bold text makes important information easier to find.</p>
          </div>
        </div>

        <div>
          <span>RHYTHM</span>

          <div>
            <strong>Improve readability</strong>

            <p>
              Alignment and line height make text easier to scan and understand.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Type size={13} />

        <span>SIZE · WEIGHT · ALIGNMENT · RHYTHM</span>
      </div>
    </section>
  );
}

export default CssTypographyLabAnimation;
