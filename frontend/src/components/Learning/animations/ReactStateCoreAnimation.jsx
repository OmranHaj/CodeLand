import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactStateCoreAnimation({
  stateName = "count",
  setterName = "setCount",
  initialValue = 0,
  updatedValue = 1,
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

    const stateCore = root.querySelector("[data-state-core]");
    const stateRings = root.querySelectorAll("[data-state-ring]");
    const stateValue = root.querySelector("[data-state-value]");

    const signalTrack = root.querySelector("[data-signal-track]");
    const signalPacket = root.querySelector("[data-signal-packet]");

    const renderNode = root.querySelector("[data-render-node]");

    const preview = root.querySelector("[data-preview]");
    const previewValue = root.querySelector("[data-preview-value]");
    const previewButton = root.querySelector("[data-preview-button]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · COMPONENT CREATES STATE";

    stateValue.textContent = String(initialValue);
    previewValue.textContent = String(initialValue);

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

    gsap.set(stateCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set(stateRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -25,
    });

    gsap.set(signalTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(signalPacket, {
      opacity: 0,
      scale: 0.7,
      x: -45,
    });

    gsap.set(renderNode, {
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
      opacity: 0.35,
      scale: 1,
    });

    gsap.set(previewButton, {
      scale: 1,
      y: 0,
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
      stateValue.textContent = String(updatedValue);
      previewValue.textContent = String(updatedValue);

      status.textContent = "STATE UPDATE COMPLETE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          stateCore,
          stateRings,
          signalTrack,
          signalPacket,
          renderNode,
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
          stagger: 0.06,
        },
        "-=0.24",
      )

      /* STATE CORE */

      .call(() => {
        status.textContent = "STEP 02 · REACT STORES THE VALUE";
      })

      .to(stateCore, {
        opacity: 1,
        scale: 1,
        duration: 0.48,
        ease: "back.out(1.75)",
      })

      .to(
        stateRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          stagger: 0.08,
        },
        "-=0.3",
      )

      /* INITIAL RENDER */

      .call(() => {
        status.textContent = "STEP 03 · STATE APPEARS IN THE UI";
      })

      .to(renderNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.38,
        ease: "back.out(1.7)",
      })

      .to(
        preview,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.48,
        },
        "-=0.16",
      )

      .to(previewValue, {
        opacity: 1,
        duration: 0.3,
      })

      /* USER EVENT */

      .call(() => {
        status.textContent = "STEP 04 · USER TRIGGERS THE SETTER";
      })

      .to(previewButton, {
        scale: 0.91,
        duration: 0.12,
      })

      .to(previewButton, {
        scale: 1,
        duration: 0.22,
        ease: "back.out(2)",
      })

      .to(
        signalTrack,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.44,
          ease: "power2.inOut",
        },
        "-=0.08",
      )

      .to(
        signalPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.48,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      /* UPDATE STATE */

      .call(() => {
        status.textContent = "STEP 05 · REACT UPDATES STATE";
      })

      .to(stateCore, {
        scale: 1.12,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      .call(() => {
        stateValue.textContent = String(updatedValue);
      })

      .fromTo(
        stateValue,
        {
          opacity: 0.2,
          scale: 0.75,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.36,
          ease: "back.out(1.8)",
        },
      )

      /* RE-RENDER */

      .call(() => {
        status.textContent = "STEP 06 · COMPONENT RE-RENDERS";
      })

      .to(renderNode, {
        scale: 1.12,
        duration: 0.14,
        yoyo: true,
        repeat: 1,
      })

      .call(() => {
        previewValue.textContent = String(updatedValue);
      })

      .fromTo(
        previewValue,
        {
          opacity: 0.18,
          y: 8,
          scale: 0.82,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.8)",
        },
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
        status.textContent = "STATE UPDATE COMPLETE";
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
  }, [stateName, setterName, initialValue, updatedValue]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React state update visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>STATE CORE</span>
          <strong>Let components remember things</strong>
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
          STEP 01 · COMPONENT CREATES STATE
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>STATE CODE</span>
                <strong>Counter.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>Counter</span>() {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>const</span> [
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                <span className={styles.codeVariable}>{stateName}</span>,
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                <span className={styles.codeFunction}>{setterName}</span>
              </div>

              <div className={styles.codeIndent} data-code-line>
                ] = useState(
                <span className={styles.codeVariable}>{initialValue}</span>);
              </div>

              <div className={styles.codeSpacer} data-code-line />

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;button
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                onClick={"{() => "}
                {setterName}({stateName} + 1)
                {"}"}
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                {"{"}
                {stateName}
                {"}"}
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

          {/* STATE ENGINE */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>REACT MEMORY</span>
                <strong>State Runtime</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.compiler} data-state-core>
                <span
                  className={`${styles.compilerRing} ${styles.compilerRingOuter}`}
                  data-state-ring
                />

                <span
                  className={`${styles.compilerRing} ${styles.compilerRingInner}`}
                  data-state-ring
                />

                <Cpu size={22} />

                <strong data-state-value>{initialValue}</strong>
              </div>

              <div className={styles.packetTrack} data-signal-track>
                <span className={styles.dataPacket} data-signal-packet>
                  {setterName}()
                </span>
              </div>

              <div className={styles.pipelineNodes}>
                <div className={styles.pipelineNode}>
                  <span>STATE</span>
                  <strong>{stateName}</strong>
                </div>

                <div className={styles.pipelineArrow}>→</div>

                <div className={styles.pipelineNode} data-render-node>
                  <span>REACT</span>
                  <strong>Re-render</strong>
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
              <span className={styles.previewEyebrow}>LIVE COMPONENT</span>

              <div className={styles.previewCard}>
                <span>STATE VALUE</span>

                <strong data-preview-value>{initialValue}</strong>

                <small>React remembers this value</small>
              </div>

              <button
                type="button"
                className={styles.previewButton}
                data-preview-button
              >
                Increase
              </button>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Store</strong>
              <p>useState stores changing component data.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Update</strong>
              <p>The setter changes the stored value.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Render</strong>
              <p>React updates the UI with the new state.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          State cycle complete
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>STATE → SETTER → UPDATE → RE-RENDER → NEW UI</span>
      </div>
    </section>
  );
}

export default ReactStateCoreAnimation;
