import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactFormControlAnimation({
  stateName = "username",
  setterName = "setUsername",
  initialValue = "",
  typedValue = "Alex",
  placeholder = "Explorer name",
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
    const valueBinding = root.querySelector("[data-value-binding]");
    const changeBinding = root.querySelector("[data-change-binding]");

    const inputNode = root.querySelector("[data-input-node]");
    const eventTrack = root.querySelector("[data-event-track]");
    const eventPacket = root.querySelector("[data-event-packet]");

    const stateCore = root.querySelector("[data-state-core]");
    const stateRings = root.querySelectorAll("[data-state-ring]");
    const stateValue = root.querySelector("[data-state-value]");

    const syncTrack = root.querySelector("[data-sync-track]");
    const syncPacket = root.querySelector("[data-sync-packet]");

    const preview = root.querySelector("[data-preview]");
    const previewInput = root.querySelector("[data-preview-input]");
    const previewState = root.querySelector("[data-preview-state]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · STATE CONTROLS THE INPUT";

    stateValue.textContent = initialValue || "empty";
    previewInput.textContent = placeholder;
    previewState.textContent = initialValue || "empty";

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

    gsap.set([valueBinding, changeBinding], {
      opacity: 0.25,
      scale: 0.82,
    });

    gsap.set(inputNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(eventTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(eventPacket, {
      opacity: 0,
      scale: 0.72,
      x: -42,
    });

    gsap.set(stateCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set(stateRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -24,
    });

    gsap.set(syncTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(syncPacket, {
      opacity: 0,
      scale: 0.72,
      x: -42,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewInput, {
      opacity: 0.5,
      scale: 1,
    });

    gsap.set(previewState, {
      opacity: 0.45,
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
      stateValue.textContent = typedValue;
      previewInput.textContent = typedValue;
      previewState.textContent = typedValue;

      status.textContent = "CONTROLLED INPUT SYNCHRONIZED";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          valueBinding,
          changeBinding,
          inputNode,
          eventTrack,
          eventPacket,
          stateCore,
          stateRings,
          syncTrack,
          syncPacket,
          preview,
          previewInput,
          previewState,
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

      .to(
        valueBinding,
        {
          opacity: 1,
          scale: 1.1,
          duration: 0.22,
          ease: "back.out(1.8)",
        },
        "-=0.1",
      )

      .to(valueBinding, {
        scale: 1,
        duration: 0.16,
      })

      /* INITIAL STATE */

      .call(() => {
        status.textContent = "STEP 02 · REACT STORES THE INPUT VALUE";
      })

      .to(stateCore, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.8)",
      })

      .to(
        stateRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.48,
          stagger: 0.08,
        },
        "-=0.28",
      )

      /* INPUT */

      .to(inputNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
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
        "-=0.16",
      )

      /* TYPE */

      .call(() => {
        status.textContent = "STEP 03 · USER TYPES INTO THE INPUT";
        previewInput.textContent = typedValue;
      })

      .fromTo(
        previewInput,
        {
          opacity: 0.3,
          scale: 0.96,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
        },
      )

      /* ONCHANGE */

      .call(() => {
        status.textContent = "STEP 04 · ONCHANGE SENDS THE NEW VALUE";
      })

      .to(changeBinding, {
        opacity: 1,
        scale: 1.1,
        duration: 0.22,
        ease: "back.out(1.8)",
      })

      .to(changeBinding, {
        scale: 1,
        duration: 0.16,
      })

      .to(eventTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
        ease: "power2.inOut",
      })

      .to(
        eventPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      /* STATE UPDATE */

      .call(() => {
        status.textContent = `STEP 05 · ${setterName.toUpperCase()} UPDATES STATE`;
      })

      .to(stateCore, {
        scale: 1.13,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      .call(() => {
        stateValue.textContent = typedValue;
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
          duration: 0.38,
          ease: "back.out(1.8)",
        },
      )

      /* STATE → INPUT */

      .call(() => {
        status.textContent = "STEP 06 · STATE SYNCS BACK INTO THE INPUT";
      })

      .to(syncTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        syncPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
        },
        "-=0.32",
      )

      .call(() => {
        previewState.textContent = typedValue;
      })

      .to(previewState, {
        opacity: 1,
        scale: 1,
        duration: 0.38,
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
        status.textContent = "CONTROLLED INPUT SYNCHRONIZED";
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
  }, [stateName, setterName, initialValue, typedValue, placeholder]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React controlled form visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>FORM CONTROL LOOP</span>
          <strong>Inputs connected to state</strong>
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
          STEP 01 · STATE CONTROLS THE INPUT
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>CONTROLLED FORM</span>
                <strong>NameForm.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>const</span> [
                <span className={styles.codeVariable}>{stateName}</span>,{" "}
                <span className={styles.codeFunction}>{setterName}</span>] =
                useState(
                <span className={styles.codeString}>"{initialValue}"</span>);
              </div>

              <div className={styles.codeSpacer} data-code-line />

              <div data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndent} data-code-line>
                &lt;input
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                <span className={styles.expression} data-value-binding>
                  value={"{ "}
                  {stateName}
                  {" }"}
                </span>
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                <span className={styles.expression} data-change-binding>
                  onChange={"{(event) =>"}
                </span>
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                {setterName}(event.target.value)
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                {"}"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                /&gt;
              </div>

              <div data-code-line>);</div>
            </div>
          </div>

          {/* STATE LOOP */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>FORM STATE</span>
                <strong>Controlled Input</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.node} data-input-node>
                <Code2 size={14} />

                <div>
                  <span>INPUT</span>
                  <strong>User typing</strong>
                </div>
              </div>

              <div className={styles.packetTrack} data-event-track>
                <span className={styles.dataPacket} data-event-packet>
                  onChange
                </span>
              </div>

              <div className={styles.compiler} data-state-core>
                <span
                  className={`${styles.compilerRing} ${styles.compilerRingOuter}`}
                  data-state-ring
                />

                <span
                  className={`${styles.compilerRing} ${styles.compilerRingInner}`}
                  data-state-ring
                />

                <Cpu size={21} />

                <strong data-state-value>{initialValue || "empty"}</strong>
              </div>

              <div className={styles.packetTrack} data-sync-track>
                <span className={styles.dataPacket} data-sync-packet>
                  value
                </span>
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
              <span className={styles.previewEyebrow}>CONTROLLED INPUT</span>

              <div className={styles.previewCard}>
                <span>INPUT VALUE</span>

                <strong data-preview-input>{placeholder}</strong>
              </div>

              <div className={styles.previewCard}>
                <span>{stateName.toUpperCase()} STATE</span>

                <strong data-preview-state>{initialValue || "empty"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Value</strong>
              <p>State controls what the input displays.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Change</strong>
              <p>onChange captures what the user types.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Sync</strong>
              <p>The setter keeps state and input synchronized.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Controlled form synchronized
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>INPUT → ONCHANGE → STATE → VALUE → INPUT</span>
      </div>
    </section>
  );
}

export default ReactFormControlAnimation;
