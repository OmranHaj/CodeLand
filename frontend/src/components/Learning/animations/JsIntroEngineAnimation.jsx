import { useLayoutEffect, useRef } from "react";
import {
  Check,
  Code2,
  Cpu,
  Monitor,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsIntroEngineAnimation.module.css";

function JsIntroEngineAnimation({
  buttonText = "Activate",
  initialMessage = "Waiting for JavaScript...",
  updatedMessage = "JavaScript is working!",
  eventName = "click",
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

    const browser = root.querySelector("[data-browser]");
    const browserButton = root.querySelector("[data-browser-button]");
    const browserMessage = root.querySelector("[data-browser-message]");

    const engine = root.querySelector("[data-engine]");
    const engineCore = root.querySelector("[data-engine-core]");
    const engineRings = root.querySelectorAll("[data-engine-ring]");
    const engineLabel = root.querySelector("[data-engine-label]");

    const eventPacket = root.querySelector("[data-event-packet]");
    const eventLine = root.querySelector("[data-event-line]");

    const logicPacket = root.querySelector("[data-logic-packet]");
    const logicLine = root.querySelector("[data-logic-line]");

    const domPacket = root.querySelector("[data-dom-packet]");
    const domLine = root.querySelector("[data-dom-line]");

    const runtimeSteps = root.querySelectorAll("[data-runtime-step]");
    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    browserMessage.textContent = initialMessage;

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -24,
      scale: 0.96,
    });

    gsap.set(codeLines, {
      opacity: 0.3,
      x: -8,
    });

    gsap.set(browser, {
      opacity: 0,
      x: 24,
      scale: 0.96,
    });

    gsap.set(browserButton, {
      scale: 1,
      y: 0,
    });

    gsap.set(browserMessage, {
      opacity: 0.72,
      y: 0,
      scale: 1,
    });

    gsap.set(engine, {
      opacity: 0,
      scale: 0.78,
    });

    gsap.set(engineCore, {
      scale: 0.72,
      opacity: 0.25,
      rotation: -15,
    });

    gsap.set(engineRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -20,
    });

    gsap.set(engineLabel, {
      opacity: 0,
      y: 6,
    });

    gsap.set(eventLine, {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 0,
    });

    gsap.set(eventPacket, {
      opacity: 0,
      scale: 0.7,
      x: -38,
    });

    gsap.set(logicLine, {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 0,
    });

    gsap.set(logicPacket, {
      opacity: 0,
      scale: 0.7,
      x: -30,
    });

    gsap.set(domLine, {
      scaleX: 0,
      transformOrigin: "left center",
      opacity: 0,
    });

    gsap.set(domPacket, {
      opacity: 0,
      scale: 0.7,
      x: -30,
    });

    gsap.set(runtimeSteps, {
      opacity: 0.28,
      x: -8,
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
      status.textContent = "JAVASCRIPT RUNTIME ONLINE";
      browserMessage.textContent = updatedMessage;

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(codePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(codeLines, {
        opacity: 1,
        x: 0,
      });

      gsap.set(browser, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(engine, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(engineCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(engineRings, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(engineLabel, {
        opacity: 1,
        y: 0,
      });

      gsap.set([eventLine, logicLine, domLine], {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set([eventPacket, logicPacket, domPacket], {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(runtimeSteps, {
        opacity: 1,
        x: 0,
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
      /* STATIC WEBSITE */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · STATIC WEBSITE";
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
        browser,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.58,
        },
        0.18,
      )

      .to(
        codeLines,
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.07,
        },
        "-=0.25",
      )

      /* -------------------------------------------------- */
      /* ENGINE BOOT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · JAVASCRIPT ENGINE BOOTS";
      })

      .to(engine, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.6)",
      })

      .to(
        engineRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.55,
          stagger: 0.08,
        },
        "-=0.3",
      )

      .to(
        engineCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.55,
          ease: "back.out(1.8)",
        },
        "-=0.42",
      )

      .to(
        engineLabel,
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
        },
        "-=0.2",
      )

      .to(
        runtimeSteps[0],
        {
          opacity: 1,
          x: 0,
          duration: 0.28,
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* USER CLICK */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 03 · USER TRIGGERS A ${eventName.toUpperCase()} EVENT`;
      })

      .to(
        browserButton,
        {
          scale: 0.92,
          duration: 0.12,
        },
        "+=0.08",
      )

      .to(browserButton, {
        scale: 1,
        duration: 0.22,
        ease: "back.out(2)",
      })

      .to(
        eventLine,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.45,
          ease: "power2.inOut",
        },
        "-=0.08",
      )

      .to(
        eventPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.48,
          ease: "power2.inOut",
        },
        "-=0.34",
      )

      .to(
        runtimeSteps[1],
        {
          opacity: 1,
          x: 0,
          duration: 0.28,
        },
        "-=0.12",
      )

      /* -------------------------------------------------- */
      /* LOGIC EXECUTION */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · JAVASCRIPT LOGIC EXECUTES";
      })

      .to(engineCore, {
        scale: 1.12,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      .to(
        logicLine,
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.42,
          ease: "power2.inOut",
        },
        "-=0.1",
      )

      .to(
        logicPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.44,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      .to(
        runtimeSteps[2],
        {
          opacity: 1,
          x: 0,
          duration: 0.28,
        },
        "-=0.12",
      )

      /* -------------------------------------------------- */
      /* DOM UPDATE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · JAVASCRIPT UPDATES THE DOM";
      })

      .to(domLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
        ease: "power2.inOut",
      })

      .to(
        domPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.44,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      .call(() => {
        browserMessage.textContent = updatedMessage;
      })

      .fromTo(
        browserMessage,
        {
          opacity: 0.15,
          y: 8,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.65)",
        },
      )

      .to(
        runtimeSteps[3],
        {
          opacity: 1,
          x: 0,
          duration: 0.28,
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* PAGE REACTS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · THE PAGE REACTS";
      })

      .to(browser, {
        scale: 1.018,
        duration: 0.17,
        yoyo: true,
        repeat: 1,
      })

      .to(
        summaryCards,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.1,
        },
        "-=0.05",
      )

      /* -------------------------------------------------- */
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "JAVASCRIPT RUNTIME ONLINE";
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
  }, [buttonText, initialMessage, updatedMessage, eventName]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript runtime visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>JAVASCRIPT RUNTIME</span>

          <strong>From user action to a reacting webpage</strong>
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
          STEP 01 · STATIC WEBSITE
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* JAVASCRIPT CODE */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Code2 size={14} />

              <div>
                <span>JAVASCRIPT</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.keyword}>const</span>{" "}
                <span className={styles.variable}>button</span> =
              </div>

              <div className={styles.indent} data-code-line>
                document.querySelector(
                <span className={styles.string}>"#activate"</span>
                );
              </div>

              <div className={styles.codeSpacer} data-code-line />

              <div data-code-line>button.addEventListener(</div>

              <div className={styles.indent} data-code-line>
                <span className={styles.string}>"{eventName}"</span>, () =&gt;{" "}
                {"{"}
              </div>

              <div className={styles.indentLarge} data-code-line>
                message.textContent =
              </div>

              <div className={styles.indentLarge} data-code-line>
                <span className={styles.string}>"{updatedMessage}"</span>;
              </div>

              <div className={styles.indent} data-code-line>
                {"}"});
              </div>
            </div>

            <div className={styles.codeSignal}>
              <Zap size={12} />

              <span>WAITING FOR EVENT</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* RUNTIME ENGINE */}
          {/* ============================================== */}

          <div className={styles.runtimePanel}>
            <div className={styles.runtimeHeader}>
              <span>EXECUTION FLOW</span>

              <strong>Browser Runtime</strong>
            </div>

            <div className={styles.runtimeStage}>
              {/* EVENT FLOW */}

              <div className={styles.flowRow}>
                <div className={styles.flowSource}>
                  <MousePointerClick size={14} />

                  <span>USER</span>
                </div>

                <div
                  className={`${styles.flowLine} ${styles.eventLine}`}
                  data-event-line
                >
                  <span className={styles.packet} data-event-packet>
                    EVENT
                  </span>
                </div>

                <div className={styles.engine} data-engine>
                  <span
                    className={`${styles.engineRing} ${styles.engineRingOuter}`}
                    data-engine-ring
                  />

                  <span
                    className={`${styles.engineRing} ${styles.engineRingInner}`}
                    data-engine-ring
                  />

                  <div className={styles.engineCore} data-engine-core>
                    <Cpu size={26} />

                    <strong>JS</strong>
                  </div>

                  <span className={styles.engineLabel} data-engine-label>
                    ENGINE
                  </span>
                </div>
              </div>

              {/* LOGIC FLOW */}

              <div className={styles.logicFlow}>
                <div className={styles.logicNode}>
                  <Code2 size={13} />

                  <span>LOGIC</span>
                </div>

                <div
                  className={`${styles.flowLine} ${styles.logicLine}`}
                  data-logic-line
                >
                  <span className={styles.packet} data-logic-packet>
                    RUN
                  </span>
                </div>

                <div className={styles.logicNode}>
                  <Zap size={13} />

                  <span>RESULT</span>
                </div>
              </div>

              {/* DOM FLOW */}

              <div className={styles.domFlow}>
                <div className={styles.domNode}>
                  <Cpu size={13} />

                  <span>JS</span>
                </div>

                <div
                  className={`${styles.flowLine} ${styles.domLine}`}
                  data-dom-line
                >
                  <span className={styles.packet} data-dom-packet>
                    DOM
                  </span>
                </div>

                <div className={styles.domNode}>
                  <Monitor size={13} />

                  <span>PAGE</span>
                </div>
              </div>

              {/* EXECUTION STEPS */}

              <div className={styles.runtimeSteps}>
                <div data-runtime-step>
                  <span>01</span>

                  <div>
                    <strong>Engine ready</strong>

                    <p>JavaScript waits for something to happen.</p>
                  </div>
                </div>

                <div data-runtime-step>
                  <span>02</span>

                  <div>
                    <strong>Event received</strong>

                    <p>The browser reports the user click.</p>
                  </div>
                </div>

                <div data-runtime-step>
                  <span>03</span>

                  <div>
                    <strong>Logic executes</strong>

                    <p>JavaScript runs the matching instructions.</p>
                  </div>
                </div>

                <div data-runtime-step>
                  <span>04</span>

                  <div>
                    <strong>DOM updates</strong>

                    <p>The visible page changes immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* BROWSER */}
          {/* ============================================== */}

          <div className={styles.browserPanel}>
            <div className={styles.browserHeader}>
              <span>LIVE WEBSITE</span>

              <strong>Browser Output</strong>
            </div>

            <div className={styles.browser} data-browser>
              <div className={styles.browserBar}>
                <div>
                  <i />
                  <i />
                  <i />
                </div>

                <span>codeland.app</span>
              </div>

              <div className={styles.browserBody}>
                <span className={styles.previewEyebrow}>INTERACTIVE DEMO</span>

                <h3>JavaScript Core</h3>

                <p className={styles.browserMessage} data-browser-message>
                  {initialMessage}
                </p>

                <button
                  type="button"
                  className={styles.browserButton}
                  data-browser-button
                >
                  <MousePointerClick size={13} />

                  {buttonText}
                </button>

                <div className={styles.browserStatus}>
                  <span />
                  Runtime connected
                </div>
              </div>
            </div>

            <div className={styles.completeBadge} data-complete>
              <Check size={12} />
              Website reacted successfully
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Event</strong>

              <p>Something happens, like a click.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>JavaScript</strong>

              <p>The engine executes your instructions.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>DOM</strong>

              <p>JavaScript changes something in the page.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Reaction</strong>

              <p>The user immediately sees the result.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>HTML</span>

          <div>
            <strong>Builds the page</strong>

            <p>HTML gives the browser elements and structure.</p>
          </div>
        </div>

        <div>
          <span>CSS</span>

          <div>
            <strong>Styles the page</strong>

            <p>CSS controls how those elements look.</p>
          </div>
        </div>

        <div>
          <span>JS</span>

          <div>
            <strong>Makes it react</strong>

            <p>JavaScript listens, thinks, and changes the page.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>USER ACTION → EVENT → LOGIC → DOM → REACTION</span>
      </div>
    </section>
  );
}

export default JsIntroEngineAnimation;
