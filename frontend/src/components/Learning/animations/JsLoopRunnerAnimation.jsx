import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Check,
  CircleDot,
  Code2,
  ListOrdered,
  Repeat2,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsLoopRunnerAnimation.module.css";

function JsLoopRunnerAnimation({ start = 1, end = 5, variableName = "i" }) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeStart = Number.isFinite(Number(start)) ? Number(start) : 1;

  const safeEnd = Math.min(
    safeStart + 7,
    Math.max(safeStart, Number(end) || 5),
  );

  const safeVariable =
    String(variableName || "i")
      .trim()
      .replace(/\s+/g, "") || "i";

  const values = useMemo(
    () =>
      Array.from(
        {
          length: safeEnd - safeStart + 1,
        },
        (_, index) => safeStart + index,
      ),
    [safeStart, safeEnd],
  );

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

    const runner = root.querySelector("[data-runner]");

    const loopCore = root.querySelector("[data-loop-core]");

    const valueCells = root.querySelectorAll("[data-value-cell]");

    const executionPointer = root.querySelector("[data-execution-pointer]");

    const counterValue = root.querySelector("[data-counter-value]");

    const checkValue = root.querySelector("[data-check-value]");

    const consolePanel = root.querySelector("[data-console-panel]");

    const consoleRows = root.querySelectorAll("[data-console-row]");

    const repeatArrow = root.querySelector("[data-repeat-arrow]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    counterValue.textContent = String(safeStart);

    checkValue.textContent = `${safeStart} <= ${safeEnd}`;

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

    gsap.set(runner, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(loopCore, {
      opacity: 0,
      scale: 0.78,
      rotation: -10,
    });

    gsap.set(valueCells, {
      opacity: 0.28,
      scale: 0.9,
    });

    gsap.set(executionPointer, {
      opacity: 0,
      scale: 0.8,
      x: 0,
    });

    gsap.set(consolePanel, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(consoleRows, {
      opacity: 0,
      x: 8,
    });

    gsap.set(repeatArrow, {
      opacity: 0,
      rotation: -35,
      scale: 0.75,
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
      status.textContent = "LOOP COMPLETE";

      counterValue.textContent = String(safeEnd + 1);

      checkValue.textContent = `${safeEnd + 1} <= ${safeEnd} → false`;

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

      gsap.set(runner, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(loopCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(valueCells, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(executionPointer, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(consolePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(consoleRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(repeatArrow, {
        opacity: 1,
        rotation: 0,
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
        status.textContent = "STEP 01 · JAVASCRIPT READS THE LOOP";
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
        codeRows,
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.08,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* LOOP ENGINE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · LOOP RUNNER STARTS";
      })

      .to(runner, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
      })

      .to(
        loopCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.45,
          ease: "back.out(1.8)",
        },
        "-=0.25",
      )

      .to(
        repeatArrow,
        {
          opacity: 1,
          rotation: 0,
          scale: 1,
          duration: 0.36,
          ease: "back.out(1.8)",
        },
        "-=0.2",
      );

    /* ================================================== */
    /* ITERATIONS */
    /* ================================================== */

    values.forEach((value, index) => {
      timeline
        .call(() => {
          status.textContent = `ITERATION ${index + 1} · ${safeVariable} = ${value}`;

          counterValue.textContent = String(value);

          checkValue.textContent = `${value} <= ${safeEnd} → true`;
        })

        .to(valueCells[index], {
          opacity: 1,
          scale: 1.08,
          duration: 0.22,
          ease: "back.out(1.8)",
        })

        .to(
          executionPointer,
          {
            opacity: 1,
            scale: 1,
            x: index * 34,
            duration: 0.34,
            ease: "power2.inOut",
          },
          "<",
        )

        .to(
          loopCore,
          {
            scale: 1.08,
            duration: 0.13,
            yoyo: true,
            repeat: 1,
          },
          "-=0.05",
        )

        .to(
          consoleRows[index],
          {
            opacity: 1,
            x: 0,
            duration: 0.28,
          },
          "-=0.08",
        )

        .to(valueCells[index], {
          scale: 1,
          duration: 0.16,
        });
    });

    /* ================================================== */
    /* EXIT */
    /* ================================================== */

    timeline
      .call(() => {
        counterValue.textContent = String(safeEnd + 1);

        checkValue.textContent = `${safeEnd + 1} <= ${safeEnd} → false`;

        status.textContent = "STEP 03 · CONDITION BECOMES FALSE";
      })

      .to(loopCore, {
        scale: 0.94,
        duration: 0.22,
      })

      .to(loopCore, {
        scale: 1,
        duration: 0.24,
        ease: "back.out(1.6)",
      })

      .call(() => {
        status.textContent = "STEP 04 · LOOP STOPS AUTOMATICALLY";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "LOOP COMPLETE";
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
  }, [safeStart, safeEnd, safeVariable, values]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript loop runner explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>LOOP RUNNER</span>

          <strong>Repeat one instruction without rewriting it</strong>
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
          STEP 01 · JAVASCRIPT READS THE LOOP
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Code2 size={14} />

              <div>
                <span>FOR LOOP</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-row>
                <span className={styles.keyword}>for</span> (
              </div>

              <div className={styles.indent} data-code-row>
                <span className={styles.keyword}>let</span>{" "}
                <span className={styles.variable}>{safeVariable}</span> ={" "}
                {safeStart};
              </div>

              <div className={styles.indent} data-code-row>
                {safeVariable} &lt;= {safeEnd};
              </div>

              <div className={styles.indent} data-code-row>
                {safeVariable}++
              </div>

              <div data-code-row>) {"{"}</div>

              <div className={styles.indent} data-code-row>
                console.log(
                <span className={styles.variable}>{safeVariable}</span>
                );
              </div>

              <div data-code-row>{"}"}</div>
            </div>

            <div className={styles.loopParts}>
              <div>
                <span>START</span>

                <strong>{safeStart}</strong>
              </div>

              <div>
                <span>CHECK</span>

                <strong>≤ {safeEnd}</strong>
              </div>

              <div>
                <span>UPDATE</span>

                <strong>++</strong>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* RUNNER */}
          {/* ============================================== */}

          <div className={styles.runnerPanel}>
            <div className={styles.runnerHeader}>
              <span>EXECUTION ENGINE</span>

              <strong>Iteration Flow</strong>
            </div>

            <div className={styles.runnerStage} data-runner>
              <div className={styles.loopCore} data-loop-core>
                <Repeat2 size={28} />

                <strong>LOOP</strong>

                <span>RUNNING</span>
              </div>

              <Repeat2
                className={styles.repeatArrow}
                size={28}
                data-repeat-arrow
              />

              <div className={styles.counterPanel}>
                <span>CURRENT {safeVariable.toUpperCase()}</span>

                <strong data-counter-value>{safeStart}</strong>
              </div>

              <div className={styles.conditionReadout}>
                <span>CONDITION</span>

                <strong data-check-value>
                  {safeStart} &lt;= {safeEnd}
                </strong>
              </div>

              <div className={styles.iterationTrack}>
                <div className={styles.executionPointer} data-execution-pointer>
                  <CircleDot size={12} />
                </div>

                {values.map((value) => (
                  <div key={value} className={styles.valueCell} data-value-cell>
                    <span>{safeVariable}</span>

                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Loop finished
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* CONSOLE */}
          {/* ============================================== */}

          <div className={styles.consolePanel} data-console-panel>
            <div className={styles.consoleHeader}>
              <Terminal size={14} />

              <div>
                <span>CONSOLE OUTPUT</span>

                <strong>Results</strong>
              </div>
            </div>

            <div className={styles.consoleScreen}>
              {values.map((value) => (
                <div key={value} data-console-row>
                  <span>&gt;</span>

                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.consoleFooter}>
              <ListOrdered size={12} />

              <span>{values.length} ITERATIONS</span>
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
              <strong>Start</strong>

              <p>Create the counter before the loop begins.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Check</strong>

              <p>The loop continues while the condition is true.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Run</strong>

              <p>JavaScript executes the loop body.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Update</strong>

              <p>The counter changes before the next check.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>START</span>

          <div>
            <strong>Initialize once</strong>

            <p>The counter gets its first value before iteration begins.</p>
          </div>
        </div>

        <div>
          <span>REPEAT</span>

          <div>
            <strong>Run while true</strong>

            <p>The same block can execute again and again.</p>
          </div>
        </div>

        <div>
          <span>STOP</span>

          <div>
            <strong>Exit when false</strong>

            <p>As soon as the condition fails, the loop ends.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>START → CHECK → RUN → UPDATE → REPEAT</span>
      </div>
    </section>
  );
}

export default JsLoopRunnerAnimation;
