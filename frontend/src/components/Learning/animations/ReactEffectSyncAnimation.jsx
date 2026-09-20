import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactEffectSyncAnimation({
  componentName = "App",
  effectMessage = "Component ready",
  dependencyLabel = "[]",
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
    const codeLines = root.querySelectorAll("[data-code-line]");
    const effectExpression = root.querySelector("[data-effect-expression]");

    const renderNode = root.querySelector("[data-render-node]");

    const commitTrack = root.querySelector("[data-commit-track]");
    const commitPacket = root.querySelector("[data-commit-packet]");

    const effectCore = root.querySelector("[data-effect-core]");
    const effectRings = root.querySelectorAll("[data-effect-ring]");

    const effectTrack = root.querySelector("[data-effect-track]");
    const effectPacket = root.querySelector("[data-effect-packet]");

    const externalNode = root.querySelector("[data-external-node]");

    const preview = root.querySelector("[data-preview]");
    const previewStatus = root.querySelector("[data-preview-status]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · COMPONENT RENDERS";

    previewStatus.textContent = "Rendering component...";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(codeLines, {
      opacity: 0.25,
      x: -8,
    });

    gsap.set(effectExpression, {
      opacity: 0.25,
      scale: 0.82,
    });

    gsap.set(renderNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(commitTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(commitPacket, {
      opacity: 0,
      scale: 0.72,
      x: -40,
    });

    gsap.set(effectCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set(effectRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -25,
    });

    gsap.set(effectTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(effectPacket, {
      opacity: 0,
      scale: 0.72,
      x: -42,
    });

    gsap.set(externalNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewStatus, {
      opacity: 0.35,
      y: 6,
      scale: 0.92,
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
      previewStatus.textContent = effectMessage;

      status.textContent = "EFFECT SYNCHRONIZATION COMPLETE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          effectExpression,
          renderNode,
          commitTrack,
          commitPacket,
          effectCore,
          effectRings,
          effectTrack,
          effectPacket,
          externalNode,
          preview,
          previewStatus,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
          rotation: 0,
        },
      );

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
      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.25,
      })

      /* CODE */

      .to(
        codePanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.48,
        },
        0.08,
      )

      .to(
        codeLines,
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          stagger: 0.055,
        },
        "-=0.24",
      )

      /* RENDER */

      .to(renderNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.42,
        ease: "back.out(1.7)",
      })

      .to(
        preview,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.46,
        },
        "-=0.15",
      )

      /* COMMIT */

      .call(() => {
        status.textContent = "STEP 02 · REACT COMMITS THE UI";
      })

      .to(commitTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        commitPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.44,
        },
        "-=0.32",
      )

      /* EFFECT */

      .call(() => {
        status.textContent = "STEP 03 · USEEFFECT RUNS AFTER RENDER";
      })

      .to(effectExpression, {
        opacity: 1,
        scale: 1.1,
        duration: 0.24,
        ease: "back.out(1.8)",
      })

      .to(effectExpression, {
        scale: 1,
        duration: 0.16,
      })

      .to(effectCore, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.8)",
      })

      .to(
        effectRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.48,
          stagger: 0.08,
        },
        "-=0.3",
      )

      /* EXTERNAL WORK */

      .call(() => {
        status.textContent = "STEP 04 · EFFECT SYNCS WITH THE OUTSIDE WORLD";
      })

      .to(effectTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        effectPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
        },
        "-=0.32",
      )

      .to(externalNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      })

      /* RESULT */

      .call(() => {
        status.textContent = "STEP 05 · EFFECT WORK IS COMPLETE";
        previewStatus.textContent = effectMessage;
      })

      .to(previewStatus, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.42,
        ease: "back.out(1.7)",
      })

      /* SUMMARY */

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.09,
      })

      .call(() => {
        status.textContent = "EFFECT SYNCHRONIZATION COMPLETE";
      })

      .to(completeBadge, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
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
  }, [componentName, effectMessage, dependencyLabel]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React useEffect visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>EFFECT SYNC</span>
          <strong>Run code after rendering</strong>
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
        <div className={styles.gridBackground} />

        <div className={styles.status} data-status>
          STEP 01 · COMPONENT RENDERS
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>EFFECT CODE</span>
                <strong>{componentName}.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{componentName}</span>(){" "}
                {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.expression} data-effect-expression>
                  useEffect
                </span>
                (() =&gt; {"{"}
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                console.log(
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.codeString}>"{effectMessage}"</span>
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                );
              </div>

              <div className={styles.codeIndent} data-code-line>
                {"}"}, {dependencyLabel});
              </div>

              <div className={styles.codeSpacer} data-code-line />

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span>{" "}
                &lt;h1&gt;Hello&lt;/h1&gt;;
              </div>

              <div data-code-line>{"}"}</div>
            </div>
          </div>

          {/* EFFECT PIPELINE */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>LIFECYCLE FLOW</span>
                <strong>Render → Effect</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.node} data-render-node>
                <Code2 size={14} />

                <div>
                  <span>PHASE 01</span>
                  <strong>Render</strong>
                </div>
              </div>

              <div className={styles.packetTrack} data-commit-track>
                <span className={styles.dataPacket} data-commit-packet>
                  COMMIT
                </span>
              </div>

              <div className={styles.compiler} data-effect-core>
                <span
                  className={`${styles.compilerRing} ${styles.compilerRingOuter}`}
                  data-effect-ring
                />

                <span
                  className={`${styles.compilerRing} ${styles.compilerRingInner}`}
                  data-effect-ring
                />

                <Cpu size={21} />

                <strong>effect</strong>
              </div>

              <div className={styles.packetTrack} data-effect-track>
                <span className={styles.dataPacket} data-effect-packet>
                  SYNC
                </span>
              </div>

              <div className={styles.node} data-external-node>
                <Sparkles size={14} />

                <div>
                  <span>OUTSIDE REACT</span>
                  <strong>Side Effect</strong>
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW */}

          <div className={styles.browserPanel} data-preview>
            <div className={styles.browserBar}>
              <div>
                <i />
                <i />
                <i />
              </div>

              <span>react.preview</span>
            </div>

            <div className={styles.browserBody}>
              <span className={styles.previewEyebrow}>COMPONENT LIFECYCLE</span>

              <div className={styles.previewCard}>
                <span>SCREEN</span>
                <strong>Hello</strong>
                <small>UI rendered first</small>
              </div>

              <div className={styles.previewCard}>
                <span>EFFECT OUTPUT</span>

                <strong data-preview-status>Rendering component...</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Render</strong>
              <p>React creates and commits the UI.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Effect</strong>
              <p>useEffect runs after rendering.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Sync</strong>
              <p>Effects connect React to external systems.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Effect lifecycle complete
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>RENDER → COMMIT → EFFECT → EXTERNAL WORK</span>
      </div>
    </section>
  );
}

export default ReactEffectSyncAnimation;
