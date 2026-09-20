import { useLayoutEffect, useRef } from "react";
import {
  ArrowRight,
  Braces,
  Check,
  CornerDownRight,
  Cpu,
  FunctionSquare,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsFunctionEngineAnimation.module.css";

function JsFunctionEngineAnimation({
  functionName = "greet",
  parameterName = "name",
  argumentValue = "CodeLand",
  returnedValue = "Hello CodeLand",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeFunctionName =
    String(functionName || "greet")
      .trim()
      .replace(/\s+/g, "") || "greet";

  const safeParameter =
    String(parameterName || "name")
      .trim()
      .replace(/\s+/g, "") || "name";

  const safeArgument = String(argumentValue ?? "CodeLand");
  const safeReturn = String(returnedValue ?? "Hello CodeLand");

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

    const engine = root.querySelector("[data-engine]");
    const engineCore = root.querySelector("[data-engine-core]");

    const argumentPacket = root.querySelector("[data-argument-packet]");
    const parameterSlot = root.querySelector("[data-parameter-slot]");
    const parameterValue = root.querySelector("[data-parameter-value]");

    const executeLine = root.querySelector("[data-execute-line]");
    const executePulse = root.querySelector("[data-execute-pulse]");

    const returnLine = root.querySelector("[data-return-line]");
    const returnPacket = root.querySelector("[data-return-packet]");

    const outputPanel = root.querySelector("[data-output-panel]");
    const outputValue = root.querySelector("[data-output-value]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    parameterValue.textContent = "empty";
    outputValue.textContent = "Waiting...";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(codeRows, {
      opacity: 0.3,
      x: -8,
    });

    gsap.set(engine, {
      opacity: 0,
      scale: 0.84,
    });

    gsap.set(engineCore, {
      opacity: 0.35,
      scale: 0.76,
      rotation: -10,
    });

    gsap.set(argumentPacket, {
      opacity: 0,
      scale: 0.75,
      x: -60,
    });

    gsap.set(parameterSlot, {
      opacity: 0,
      y: 10,
      scale: 0.9,
    });

    gsap.set(executeLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(executePulse, {
      opacity: 0,
      scale: 0.75,
      x: -35,
    });

    gsap.set(returnLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(returnPacket, {
      opacity: 0,
      scale: 0.75,
      x: -35,
    });

    gsap.set(outputPanel, {
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
      status.textContent = "FUNCTION EXECUTION COMPLETE";
      parameterValue.textContent = safeArgument;
      outputValue.textContent = safeReturn;

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

      gsap.set(engine, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(engineCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(argumentPacket, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(parameterSlot, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set([executeLine, returnLine], {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set([executePulse, returnPacket], {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(outputPanel, {
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
        status.textContent = "STEP 01 · JAVASCRIPT DEFINES A FUNCTION";
      })

      .to(
        codePanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.1,
      )

      .to(
        outputPanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.17,
      )

      .to(
        codeRows,
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.08,
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* ENGINE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · THE FUNCTION ENGINE IS READY";
      })

      .to(engine, {
        opacity: 1,
        scale: 1,
        duration: 0.48,
        ease: "back.out(1.7)",
      })

      .to(
        engineCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.42,
          ease: "back.out(1.8)",
        },
        "-=0.28",
      )

      .to(
        parameterSlot,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.34,
        },
        "-=0.15",
      )

      /* -------------------------------------------------- */
      /* ARGUMENT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 03 · ARGUMENT "${safeArgument}" ENTERS`;
      })

      .to(argumentPacket, {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: 0.52,
        ease: "power2.inOut",
      })

      .call(() => {
        parameterValue.textContent = safeArgument;
      })

      .fromTo(
        parameterValue,
        {
          opacity: 0.2,
          scale: 1.2,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.8)",
        },
      )

      /* -------------------------------------------------- */
      /* EXECUTION */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · FUNCTION BODY EXECUTES";
      })

      .to(executeLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.45,
        ease: "power2.inOut",
      })

      .to(
        executePulse,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
        },
        "-=0.3",
      )

      .to(
        engineCore,
        {
          scale: 1.1,
          duration: 0.14,
          yoyo: true,
          repeat: 1,
        },
        "-=0.08",
      )

      /* -------------------------------------------------- */
      /* RETURN */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · RETURN VALUE LEAVES THE FUNCTION";
      })

      .to(returnLine, {
        opacity: 1,
        scaleX: 1,
        duration: 0.45,
        ease: "power2.inOut",
      })

      .to(
        returnPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.48,
        },
        "-=0.32",
      )

      .call(() => {
        outputValue.textContent = safeReturn;
      })

      .fromTo(
        outputValue,
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
      /* REUSE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · FUNCTIONS CAN RUN AGAIN";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "FUNCTION EXECUTION COMPLETE";
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
  }, [safeFunctionName, safeParameter, safeArgument, safeReturn]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript function engine explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>FUNCTION ENGINE</span>

          <strong>Send data in, run logic, get a result back</strong>
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
          STEP 01 · JAVASCRIPT DEFINES A FUNCTION
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Braces size={14} />

              <div>
                <span>FUNCTION CODE</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-row>
                <span className={styles.keyword}>function</span>{" "}
                <span className={styles.functionName}>{safeFunctionName}</span>(
                <span className={styles.parameter}>{safeParameter}</span>) {"{"}
              </div>

              <div className={styles.indent} data-code-row>
                <span className={styles.keyword}>return</span> "Hello " +{" "}
                {safeParameter};
              </div>

              <div data-code-row>{"}"}</div>

              <div className={styles.codeSpacer} data-code-row />

              <div data-code-row>
                <span className={styles.functionName}>{safeFunctionName}</span>(
                <span className={styles.string}>"{safeArgument}"</span>
                );
              </div>
            </div>

            <div className={styles.codeLegend}>
              <div>
                <span>PARAMETER</span>

                <strong>{safeParameter}</strong>
              </div>

              <div>
                <span>ARGUMENT</span>

                <strong>"{safeArgument}"</strong>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* ENGINE */}
          {/* ============================================== */}

          <div className={styles.enginePanel}>
            <div className={styles.engineHeader}>
              <span>EXECUTION CORE</span>

              <strong>{safeFunctionName}()</strong>
            </div>

            <div className={styles.engineStage} data-engine>
              <div className={styles.argumentPacket} data-argument-packet>
                "{safeArgument}"
              </div>

              <div className={styles.engineCore} data-engine-core>
                <FunctionSquare size={28} />

                <strong>{safeFunctionName}()</strong>

                <span>FUNCTION</span>
              </div>

              <div className={styles.parameterSlot} data-parameter-slot>
                <span>PARAMETER · {safeParameter}</span>

                <strong data-parameter-value>empty</strong>
              </div>

              <div className={styles.executionFlow}>
                <div className={styles.executeLine} data-execute-line />

                <span className={styles.executePulse} data-execute-pulse>
                  EXECUTE
                </span>
              </div>

              <div className={styles.returnFlow}>
                <div className={styles.returnLine} data-return-line />

                <span className={styles.returnPacket} data-return-packet>
                  RETURN
                </span>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Function complete
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* OUTPUT */}
          {/* ============================================== */}

          <div className={styles.outputPanel} data-output-panel>
            <div className={styles.outputHeader}>
              <CornerDownRight size={14} />

              <div>
                <span>RETURN VALUE</span>

                <strong>Result</strong>
              </div>
            </div>

            <div className={styles.outputScreen}>
              <Cpu size={22} />

              <span>FUNCTION OUTPUT</span>

              <strong data-output-value>Waiting...</strong>
            </div>

            <div className={styles.returnInfo}>
              <ArrowRight size={12} />

              <span>return sends a value back to the caller</span>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Define</strong>

              <p>Create a reusable block of logic.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Pass</strong>

              <p>Arguments send information into the function.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Execute</strong>

              <p>The function body runs its instructions.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Return</strong>

              <p>A result can leave the function.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>INPUT</span>

          <div>
            <strong>Arguments enter</strong>

            <p>Values are passed into function parameters.</p>
          </div>
        </div>

        <div>
          <span>LOGIC</span>

          <div>
            <strong>Instructions run</strong>

            <p>The function executes the same reusable logic.</p>
          </div>
        </div>

        <div>
          <span>OUTPUT</span>

          <div>
            <strong>A value returns</strong>

            <p>return sends a result back to the code that called it.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>ARGUMENT → PARAMETER → EXECUTE → RETURN</span>
      </div>
    </section>
  );
}

export default JsFunctionEngineAnimation;
