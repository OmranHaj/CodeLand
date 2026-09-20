import { useLayoutEffect, useRef } from "react";
import {
  Check,
  Code2,
  Cpu,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactEventPulseAnimation({
  eventName = "onClick",
  handlerName = "handleClick",
  buttonLabel = "Activate",
  resultMessage = "Activated!",
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
    const eventBinding = root.querySelector("[data-event-binding]");

    const userNode = root.querySelector("[data-user-node]");
    const eventTrack = root.querySelector("[data-event-track]");
    const eventPacket = root.querySelector("[data-event-packet]");

    const handlerNode = root.querySelector("[data-handler-node]");
    const logicTrack = root.querySelector("[data-logic-track]");
    const logicPacket = root.querySelector("[data-logic-packet]");

    const preview = root.querySelector("[data-preview]");
    const previewButton = root.querySelector("[data-preview-button]");
    const previewMessage = root.querySelector("[data-preview-message]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    previewMessage.textContent = "Waiting for interaction...";

    status.textContent = "STEP 01 · REACT CONNECTS THE EVENT";

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

    gsap.set(eventBinding, {
      opacity: 0.28,
      scale: 0.82,
    });

    gsap.set(userNode, {
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
      scale: 0.7,
      x: -44,
    });

    gsap.set(handlerNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(logicTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(logicPacket, {
      opacity: 0,
      scale: 0.7,
      x: -38,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewButton, {
      scale: 1,
      y: 0,
    });

    gsap.set(previewMessage, {
      opacity: 0.35,
      y: 0,
      scale: 1,
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
      previewMessage.textContent = resultMessage;
      status.textContent = "EVENT FLOW COMPLETE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          eventBinding,
          userNode,
          eventTrack,
          eventPacket,
          handlerNode,
          logicTrack,
          logicPacket,
          preview,
          previewMessage,
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
        eventBinding,
        {
          opacity: 1,
          scale: 1.1,
          duration: 0.24,
          ease: "back.out(1.8)",
        },
        "-=0.12",
      )

      .to(eventBinding, {
        scale: 1,
        duration: 0.18,
      })

      /* USER */

      .call(() => {
        status.textContent = "STEP 02 · USER INTERACTS WITH THE UI";
      })

      .to(userNode, {
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
          duration: 0.45,
        },
        "-=0.15",
      )

      .to(previewButton, {
        scale: 0.91,
        duration: 0.12,
      })

      .to(previewButton, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(2)",
      })

      /* EVENT PACKET */

      .call(() => {
        status.textContent = `STEP 03 · REACT FIRES ${eventName.toUpperCase()}`;
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
          duration: 0.46,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      /* HANDLER */

      .call(() => {
        status.textContent = "STEP 04 · EVENT HANDLER RUNS";
      })

      .to(handlerNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      })

      .to(handlerNode, {
        scale: 1.1,
        duration: 0.14,
        yoyo: true,
        repeat: 1,
      })

      /* RESULT */

      .to(logicTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.4,
      })

      .to(
        logicPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.44,
        },
        "-=0.3",
      )

      .call(() => {
        status.textContent = "STEP 05 · THE INTERFACE REACTS";
        previewMessage.textContent = resultMessage;
      })

      .fromTo(
        previewMessage,
        {
          opacity: 0.15,
          y: 8,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.75)",
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
        status.textContent = "EVENT FLOW COMPLETE";
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
  }, [eventName, handlerName, buttonLabel, resultMessage]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React event handling visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>EVENT SIGNAL</span>
          <strong>React to user interactions</strong>
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
          STEP 01 · REACT CONNECTS THE EVENT
        </div>

        <div className={styles.jsxWorkspace}>
          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>EVENT CODE</span>
                <strong>Button.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>Button</span>() {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{handlerName}</span>(){" "}
                {"{"}
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                console.log(
                <span className={styles.codeString}>"{resultMessage}"</span>
                );
              </div>

              <div className={styles.codeIndent} data-code-line>
                {"}"}
              </div>

              <div className={styles.codeSpacer} data-code-line />

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;button
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.expression} data-event-binding>
                  {eventName}={"{ "}
                  {handlerName}
                  {" }"}
                </span>
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                {buttonLabel}
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

          {/* FLOW */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Zap size={14} />

              <div>
                <span>EVENT PIPELINE</span>
                <strong>User → Handler</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.node} data-user-node>
                <MousePointerClick size={15} />

                <div>
                  <span>USER</span>
                  <strong>Click</strong>
                </div>
              </div>

              <div className={styles.packetTrack} data-event-track>
                <span className={styles.dataPacket} data-event-packet>
                  {eventName}
                </span>
              </div>

              <div
                className={`${styles.node} ${styles.appNode}`}
                data-handler-node
              >
                <Cpu size={15} />

                <div>
                  <span>HANDLER</span>
                  <strong>{handlerName}</strong>
                </div>
              </div>

              <div className={styles.packetTrack} data-logic-track>
                <span className={styles.dataPacket} data-logic-packet>
                  RESULT
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
              <span className={styles.previewEyebrow}>LIVE EVENT</span>

              <div className={styles.previewCard}>
                <span>STATUS</span>

                <strong data-preview-message>Waiting for interaction...</strong>
              </div>

              <button
                type="button"
                className={styles.previewButton}
                data-preview-button
              >
                <MousePointerClick size={12} /> {buttonLabel}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Interact</strong>
              <p>The user performs an action.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Handle</strong>
              <p>React calls the connected function.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>React</strong>
              <p>The application performs the requested logic.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Event signal processed
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>USER ACTION → EVENT → HANDLER → LOGIC → REACTION</span>
      </div>
    </section>
  );
}

export default ReactEventPulseAnimation;
