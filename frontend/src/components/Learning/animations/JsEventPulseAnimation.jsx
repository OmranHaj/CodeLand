import { useLayoutEffect, useRef } from "react";
import {
  Activity,
  BellRing,
  Check,
  Code2,
  MousePointerClick,
  Radio,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsEventPulseAnimation.module.css";

function JsEventPulseAnimation({
  eventName = "click",
  buttonLabel = "Launch",
  message = "Button clicked!",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeEventName =
    String(eventName || "click")
      .trim()
      .toLowerCase() || "click";

  const safeButtonLabel = String(buttonLabel || "Launch");

  const safeMessage = String(message || "Button clicked!");

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");

    const browserPanel = root.querySelector("[data-browser-panel]");

    const browserButton = root.querySelector("[data-browser-button]");

    const eventSensor = root.querySelector("[data-event-sensor]");

    const eventRing = root.querySelector("[data-event-ring]");

    const eventPacket = root.querySelector("[data-event-packet]");

    const eventLine = root.querySelector("[data-event-line]");

    const listenerPanel = root.querySelector("[data-listener-panel]");

    const listenerCore = root.querySelector("[data-listener-core]");

    const callbackLine = root.querySelector("[data-callback-line]");

    const callbackPacket = root.querySelector("[data-callback-packet]");

    const consolePanel = root.querySelector("[data-console-panel]");

    const consoleMessage = root.querySelector("[data-console-message]");

    const codeRows = root.querySelectorAll("[data-code-row]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    consoleMessage.textContent = "Waiting for event...";

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(browserPanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(browserButton, {
      scale: 1,
      y: 0,
    });

    gsap.set(eventSensor, {
      opacity: 0,
      scale: 0.8,
    });

    gsap.set(eventRing, {
      opacity: 0,
      scale: 0.55,
    });

    gsap.set(eventLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(eventPacket, {
      opacity: 0,
      scale: 0.75,
      x: -55,
    });

    gsap.set(listenerPanel, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(listenerCore, {
      opacity: 0.3,
      scale: 0.75,
      rotation: -10,
    });

    gsap.set(codeRows, {
      opacity: 0.3,
      x: -8,
    });

    gsap.set(callbackLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(callbackPacket, {
      opacity: 0,
      scale: 0.75,
      x: -40,
    });

    gsap.set(consolePanel, {
      opacity: 0,
      x: 22,
      scale: 0.96,
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
      status.textContent = "EVENT HANDLED";

      consoleMessage.textContent = safeMessage;

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(browserPanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(eventSensor, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(eventRing, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(eventLine, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(eventPacket, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(listenerPanel, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(listenerCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(codeRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(callbackLine, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(callbackPacket, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(consolePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
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
      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · JAVASCRIPT WAITS FOR AN EVENT";
      })

      .to(
        browserPanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.1,
      )

      .to(
        consolePanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.17,
      )

      .to(
        listenerPanel,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.48,
        },
        0.22,
      )

      .to(
        listenerCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "back.out(1.8)",
        },
        "-=0.24",
      )

      .to(
        codeRows,
        {
          opacity: 1,
          x: 0,
          duration: 0.28,
          stagger: 0.07,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* USER ACTION */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 02 · USER TRIGGERS "${safeEventName}"`;
      })

      .to(browserButton, {
        scale: 0.9,
        duration: 0.12,
      })

      .to(browserButton, {
        scale: 1,
        duration: 0.22,
        ease: "back.out(2)",
      })

      .to(
        eventSensor,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          ease: "back.out(1.8)",
        },
        "-=0.1",
      )

      .to(
        eventRing,
        {
          opacity: 1,
          scale: 1.8,
          duration: 0.55,
          ease: "power2.out",
        },
        "-=0.2",
      )

      .to(eventRing, {
        opacity: 0,
        duration: 0.18,
      })

      /* -------------------------------------------------- */
      /* EVENT TRAVELS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · THE BROWSER CREATES AN EVENT";
      })

      .to(eventLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.48,
        ease: "power2.inOut",
      })

      .to(
        eventPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "-=0.34",
      )

      /* -------------------------------------------------- */
      /* LISTENER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · EVENT LISTENER RECEIVES IT";
      })

      .to(listenerCore, {
        scale: 1.1,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
      })

      /* -------------------------------------------------- */
      /* CALLBACK */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · CALLBACK FUNCTION RUNS";
      })

      .to(callbackLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.45,
        ease: "power2.inOut",
      })

      .to(
        callbackPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.46,
        },
        "-=0.31",
      )

      .call(() => {
        consoleMessage.textContent = safeMessage;
      })

      .fromTo(
        consoleMessage,
        {
          opacity: 0.15,
          y: 8,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · JAVASCRIPT RESPONDS TO THE USER";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "EVENT HANDLED";
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
  }, [safeEventName, safeButtonLabel, safeMessage]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript event listener explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>EVENT PULSE</span>

          <strong>JavaScript listens and reacts to what users do</strong>
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
        <div className={styles.backgroundGrid} />

        <div className={styles.status} data-status>
          STEP 01 · JAVASCRIPT WAITS FOR AN EVENT
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* BROWSER */}
          {/* ============================================== */}

          <div className={styles.browserPanel} data-browser-panel>
            <div className={styles.browserHeader}>
              <MousePointerClick size={14} />

              <div>
                <span>USER INTERACTION</span>

                <strong>Browser</strong>
              </div>
            </div>

            <div className={styles.browser}>
              <div className={styles.browserBar}>
                <div>
                  <i />
                  <i />
                  <i />
                </div>

                <span>codeland.app</span>
              </div>

              <div className={styles.browserBody}>
                <span>INTERACTIVE BUTTON</span>

                <button
                  type="button"
                  className={styles.browserButton}
                  data-browser-button
                >
                  <MousePointerClick size={13} />

                  {safeButtonLabel}
                </button>

                <div className={styles.eventSensor} data-event-sensor>
                  <Radio size={15} />

                  <strong>{safeEventName}</strong>

                  <span className={styles.eventRing} data-event-ring />
                </div>
              </div>
            </div>

            <div className={styles.eventFlow}>
              <div className={styles.eventLine} data-event-line />

              <span className={styles.eventPacket} data-event-packet>
                {safeEventName.toUpperCase()} EVENT
              </span>
            </div>
          </div>

          {/* ============================================== */}
          {/* LISTENER */}
          {/* ============================================== */}

          <div className={styles.listenerColumn}>
            <div className={styles.listenerHeader}>
              <span>EVENT SYSTEM</span>

              <strong>addEventListener</strong>
            </div>

            <div className={styles.listenerPanel} data-listener-panel>
              <div className={styles.listenerCore} data-listener-core>
                <BellRing size={28} />

                <strong>LISTENER</strong>

                <span>WAITING</span>
              </div>

              <div className={styles.codeBlock}>
                <div data-code-row>button.addEventListener(</div>

                <div className={styles.indent} data-code-row>
                  <span className={styles.string}>"{safeEventName}"</span>,
                </div>

                <div className={styles.indent} data-code-row>
                  () =&gt; {"{"}
                </div>

                <div className={styles.indentLarge} data-code-row>
                  console.log(
                </div>

                <div className={styles.indentLarge} data-code-row>
                  <span className={styles.string}>"{safeMessage}"</span>
                  );
                </div>

                <div className={styles.indent} data-code-row>
                  {"}"}
                </div>

                <div data-code-row>);</div>
              </div>

              <div className={styles.callbackFlow}>
                <div className={styles.callbackLine} data-callback-line />

                <span className={styles.callbackPacket} data-callback-packet>
                  CALLBACK
                </span>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Event processed
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* CONSOLE */}
          {/* ============================================== */}

          <div className={styles.consolePanel} data-console-panel>
            <div className={styles.consoleHeader}>
              <Code2 size={14} />

              <div>
                <span>CALLBACK OUTPUT</span>

                <strong>Console</strong>
              </div>
            </div>

            <div className={styles.consoleScreen}>
              <Activity size={22} />

              <span>EVENT RESPONSE</span>

              <strong data-console-message>Waiting for event...</strong>
            </div>

            <div className={styles.consoleStatus}>
              <Zap size={11} />

              <span>CALLBACK EXECUTION</span>
            </div>
          </div>
        </div>

        {/* ================================================ */}
        {/* SUMMARY */}
        {/* ================================================ */}

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Listen</strong>

              <p>JavaScript waits for a specific event.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Trigger</strong>

              <p>The user performs an action like a click.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Callback</strong>

              <p>JavaScript runs the registered function.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>React</strong>

              <p>The program responds to the interaction.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>EVENT</span>

          <div>
            <strong>Something happens</strong>

            <p>Clicking, typing, and submitting can all create events.</p>
          </div>
        </div>

        <div>
          <span>LISTENER</span>

          <div>
            <strong>JavaScript waits</strong>

            <p>addEventListener connects an event to your code.</p>
          </div>
        </div>

        <div>
          <span>CALLBACK</span>

          <div>
            <strong>Your code runs</strong>

            <p>The callback executes when the matching event occurs.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>USER ACTION → EVENT → LISTENER → CALLBACK → RESPONSE</span>
      </div>
    </section>
  );
}

export default JsEventPulseAnimation;
