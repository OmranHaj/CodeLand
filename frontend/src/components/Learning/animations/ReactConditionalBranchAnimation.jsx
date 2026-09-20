import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactConditionalBranchAnimation({
  conditionName = "online",
  conditionValue = true,
  trueText = "Online",
  falseText = "Offline",
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
    const conditionExpression = root.querySelector(
      "[data-condition-expression]",
    );

    const inputNode = root.querySelector("[data-input-node]");
    const conditionCore = root.querySelector("[data-condition-core]");

    const trueTrack = root.querySelector("[data-true-track]");
    const falseTrack = root.querySelector("[data-false-track]");

    const trueNode = root.querySelector("[data-true-node]");
    const falseNode = root.querySelector("[data-false-node]");

    const preview = root.querySelector("[data-preview]");
    const previewValue = root.querySelector("[data-preview-value]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    const activeTrack = conditionValue ? trueTrack : falseTrack;
    const inactiveTrack = conditionValue ? falseTrack : trueTrack;

    const activeNode = conditionValue ? trueNode : falseNode;
    const inactiveNode = conditionValue ? falseNode : trueNode;

    const finalText = conditionValue ? trueText : falseText;

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    previewValue.textContent = "Evaluating...";

    status.textContent = "STEP 01 · REACT RECEIVES A CONDITION";

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

    gsap.set(conditionExpression, {
      opacity: 0.25,
      scale: 0.82,
    });

    gsap.set(inputNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(conditionCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set([trueTrack, falseTrack], {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set([trueNode, falseNode], {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewValue, {
      opacity: 0.25,
      scale: 0.9,
      y: 8,
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
      previewValue.textContent = finalText;

      status.textContent = "CONDITIONAL RENDER COMPLETE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          conditionExpression,
          inputNode,
          conditionCore,
          activeTrack,
          activeNode,
          preview,
          previewValue,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
        },
      );

      gsap.set([inactiveTrack, inactiveNode], {
        opacity: 0.2,
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
          stagger: 0.06,
        },
        "-=0.24",
      )

      .to(
        conditionExpression,
        {
          opacity: 1,
          scale: 1.1,
          duration: 0.25,
          ease: "back.out(1.8)",
        },
        "-=0.12",
      )

      .to(conditionExpression, {
        scale: 1,
        duration: 0.18,
      })

      /* INPUT */

      .call(() => {
        status.textContent = `STEP 02 · ${conditionName.toUpperCase()} = ${String(
          conditionValue,
        ).toUpperCase()}`;
      })

      .to(inputNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.42,
        ease: "back.out(1.7)",
      })

      /* GATE */

      .call(() => {
        status.textContent = "STEP 03 · REACT EVALUATES THE CONDITION";
      })

      .to(conditionCore, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.8)",
      })

      .to(conditionCore, {
        scale: 1.12,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      /* BRANCH */

      .call(() => {
        status.textContent = conditionValue
          ? "STEP 04 · TRUE BRANCH ACTIVATED"
          : "STEP 04 · FALSE BRANCH ACTIVATED";
      })

      .to(inactiveTrack, {
        opacity: 0.14,
        scaleX: 0.45,
        duration: 0.28,
      })

      .to(
        inactiveNode,
        {
          opacity: 0.18,
          scale: 0.92,
          duration: 0.28,
        },
        "-=0.2",
      )

      .to(activeTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
        ease: "power2.inOut",
      })

      .to(
        activeNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.15",
      )

      /* OUTPUT */

      .call(() => {
        status.textContent = "STEP 05 · REACT RENDERS THE SELECTED UI";
      })

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .call(() => {
        previewValue.textContent = finalText;
      })

      .to(
        previewValue,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.42,
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
        status.textContent = "CONDITIONAL RENDER COMPLETE";
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
  }, [conditionName, conditionValue, trueText, falseText]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React conditional rendering visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>RENDER GATE</span>
          <strong>Show different UI when things change</strong>
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
          STEP 01 · REACT RECEIVES A CONDITION
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>CONDITIONAL JSX</span>
                <strong>Status.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>Status</span>({"{"}{" "}
                {conditionName} {"}"}) {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;p&gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.expression} data-condition-expression>
                  {"{"}
                  {conditionName}
                </span>
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                ? <span className={styles.codeString}>"{trueText}"</span>
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                : <span className={styles.codeString}>"{falseText}"</span>
                {"}"}
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;/p&gt;
              </div>

              <div className={styles.codeIndent} data-code-line>
                );
              </div>

              <div data-code-line>{"}"}</div>
            </div>
          </div>

          {/* DECISION */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>CONDITION ENGINE</span>
                <strong>Ternary Branch</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.node} data-input-node>
                <Code2 size={14} />

                <div>
                  <span>VALUE</span>
                  <strong>
                    {conditionName} = {String(conditionValue)}
                  </strong>
                </div>
              </div>

              <div className={`${styles.compiler}`} data-condition-core>
                <Cpu size={23} />
                <strong>?</strong>
              </div>

              <div className={styles.pipelineNodes}>
                <div>
                  <div className={styles.packetTrack} data-true-track>
                    <span className={styles.dataPacket}>TRUE</span>
                  </div>

                  <div className={styles.pipelineNode} data-true-node>
                    <span>TRUE UI</span>
                    <strong>{trueText}</strong>
                  </div>
                </div>

                <div className={styles.pipelineArrow}>/</div>

                <div>
                  <div className={styles.packetTrack} data-false-track>
                    <span className={styles.dataPacket}>FALSE</span>
                  </div>

                  <div className={styles.pipelineNode} data-false-node>
                    <span>FALSE UI</span>
                    <strong>{falseText}</strong>
                  </div>
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
              <span className={styles.previewEyebrow}>CURRENT STATUS</span>

              <div className={styles.previewCard}>
                <span>RENDERED RESULT</span>

                <strong data-preview-value>Evaluating...</strong>

                <small>React chose one branch</small>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Check</strong>
              <p>React evaluates a condition.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Choose</strong>
              <p>Only the matching branch stays active.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Render</strong>
              <p>The selected interface appears.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Conditional branch resolved
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>CONDITION → TRUE / FALSE → SELECT UI → RENDER</span>
      </div>
    </section>
  );
}

export default ReactConditionalBranchAnimation;
