import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactReusableUiAnimation({
  componentName = "ActionButton",
  labelProp = "label",
  actionProp = "onClick",
  instances = ["Explore", "Continue", "Launch"],
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const instanceKey = instances.join("|");

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
    const labelExpression = root.querySelector("[data-label-expression]");
    const actionExpression = root.querySelector("[data-action-expression]");

    const componentCore = root.querySelector("[data-component-core]");
    const componentRings = root.querySelectorAll("[data-component-ring]");

    const propTrack = root.querySelector("[data-prop-track]");
    const propPacket = root.querySelector("[data-prop-packet]");

    const instanceCards = root.querySelectorAll("[data-instance-card]");
    const preview = root.querySelector("[data-preview]");
    const previewButtons = root.querySelectorAll("[data-preview-button]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · BUILD ONE FLEXIBLE COMPONENT";

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

    gsap.set([labelExpression, actionExpression], {
      opacity: 0.25,
      scale: 0.82,
    });

    gsap.set(componentCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set(componentRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -25,
    });

    gsap.set(propTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(propPacket, {
      opacity: 0,
      scale: 0.72,
      x: -42,
    });

    gsap.set(instanceCards, {
      opacity: 0,
      y: 12,
      scale: 0.82,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewButtons, {
      opacity: 0,
      y: 10,
      scale: 0.9,
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
      status.textContent = "REUSABLE UI SYSTEM ONLINE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          labelExpression,
          actionExpression,
          componentCore,
          componentRings,
          propTrack,
          propPacket,
          instanceCards,
          preview,
          previewButtons,
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

      /* PROPS */

      .call(() => {
        status.textContent = "STEP 02 · PROPS CONTROL DATA AND BEHAVIOR";
      })

      .to(labelExpression, {
        opacity: 1,
        scale: 1.1,
        duration: 0.22,
        ease: "back.out(1.8)",
      })

      .to(labelExpression, {
        scale: 1,
        duration: 0.16,
      })

      .to(actionExpression, {
        opacity: 1,
        scale: 1.1,
        duration: 0.22,
        ease: "back.out(1.8)",
      })

      .to(actionExpression, {
        scale: 1,
        duration: 0.16,
      })

      /* COMPONENT CORE */

      .call(() => {
        status.textContent = "STEP 03 · ONE COMPONENT DEFINES THE DESIGN";
      })

      .to(componentCore, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.8)",
      })

      .to(
        componentRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.48,
          stagger: 0.08,
        },
        "-=0.28",
      )

      /* INSTANCE DATA */

      .call(() => {
        status.textContent = "STEP 04 · DIFFERENT PROPS CREATE NEW INSTANCES";
      })

      .to(propTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        propPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
        },
        "-=0.32",
      )

      .to(instanceCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
        ease: "back.out(1.7)",
      })

      /* PREVIEW */

      .call(() => {
        status.textContent = "STEP 05 · SAME COMPONENT · DIFFERENT UI";
      })

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        previewButtons,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.11,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      /* SUMMARY */

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.09,
      })

      .call(() => {
        status.textContent = "REUSABLE UI SYSTEM ONLINE";
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
  }, [componentName, labelProp, actionProp, instanceKey]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React reusable UI visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>REUSABLE UI CORE</span>
          <strong>Build once. Reuse everywhere.</strong>
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
          STEP 01 · BUILD ONE FLEXIBLE COMPONENT
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>REUSABLE COMPONENT</span>
                <strong>{componentName}.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{componentName}</span>(
                {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                {labelProp},
              </div>

              <div className={styles.codeIndent} data-code-line>
                {actionProp}
              </div>

              <div data-code-line>
                {"}"}) {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;button
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.expression} data-action-expression>
                  onClick={"{ "}
                  {actionProp}
                  {" }"}
                </span>
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.expression} data-label-expression>
                  {"{"}
                  {labelProp}
                  {"}"}
                </span>
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;/button&gt;
              </div>

              <div className={styles.codeIndent} data-code-line>
                );
              </div>

              <div data-code-line>{"}"}</div>
            </div>
          </div>

          {/* COMPONENT CORE */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>COMPONENT ENGINE</span>
                <strong>{componentName}</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.compiler} data-component-core>
                <span
                  className={`${styles.compilerRing} ${styles.compilerRingOuter}`}
                  data-component-ring
                />

                <span
                  className={`${styles.compilerRing} ${styles.compilerRingInner}`}
                  data-component-ring
                />

                <Cpu size={21} />

                <strong>UI</strong>
              </div>

              <div className={styles.packetTrack} data-prop-track>
                <span className={styles.dataPacket} data-prop-packet>
                  PROPS
                </span>
              </div>

              <div className={styles.reuseCopies}>
                {instances.map((label, index) => (
                  <div
                    key={`${label}-${index}`}
                    className={styles.reuseNode}
                    data-instance-card
                  >
                    <span>INSTANCE {index + 1}</span>
                    <strong>{label}</strong>
                  </div>
                ))}
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
              <span className={styles.previewEyebrow}>REUSABLE INSTANCES</span>

              {instances.map((label, index) => (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  className={styles.previewButton}
                  data-preview-button
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Design once</strong>
              <p>One component defines structure and behavior.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Configure</strong>
              <p>Props provide different data and actions.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Reuse</strong>
              <p>The same component powers many UI instances.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Reusable component system ready
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>COMPONENT + PROPS + EVENTS → FLEXIBLE REUSABLE UI</span>
      </div>
    </section>
  );
}

export default ReactReusableUiAnimation;
