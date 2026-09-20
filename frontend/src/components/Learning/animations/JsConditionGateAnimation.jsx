import { useLayoutEffect, useRef } from "react";
import {
  Check,
  CircleCheck,
  CircleX,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsConditionGateAnimation.module.css";

function JsConditionGateAnimation({
  score = 12,
  threshold = 10,
  successText = "Level complete!",
  failText = "Keep going!",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const conditionPassed = Number(score) >= Number(threshold);

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");
    const inputPanel = root.querySelector("[data-input-panel]");
    const inputPacket = root.querySelector("[data-input-packet]");
    const conditionGate = root.querySelector("[data-condition-gate]");
    const conditionCore = root.querySelector("[data-condition-core]");
    const truePath = root.querySelector("[data-true-path]");
    const falsePath = root.querySelector("[data-false-path]");
    const truePacket = root.querySelector("[data-true-packet]");
    const falsePacket = root.querySelector("[data-false-packet]");
    const trueResult = root.querySelector("[data-true-result]");
    const falseResult = root.querySelector("[data-false-result]");
    const output = root.querySelector("[data-output]");
    const outputText = root.querySelector("[data-output-text]");
    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    outputText.textContent = "Waiting for condition...";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(inputPanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(inputPacket, {
      opacity: 0,
      x: -60,
      scale: 0.75,
    });

    gsap.set(conditionGate, {
      opacity: 0,
      scale: 0.82,
    });

    gsap.set(conditionCore, {
      opacity: 0.3,
      scale: 0.75,
      rotation: -8,
    });

    gsap.set([truePath, falsePath], {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set([truePacket, falsePacket], {
      opacity: 0,
      scale: 0.75,
      x: -35,
    });

    gsap.set([trueResult, falseResult], {
      opacity: 0.25,
      scale: 0.94,
    });

    gsap.set(output, {
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
      status.textContent = "CONDITION RESOLVED";

      outputText.textContent = conditionPassed ? successText : failText;

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(inputPanel, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(inputPacket, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(conditionGate, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(conditionCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set([truePath, falsePath], {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set([trueResult, falseResult], {
        opacity: 1,
        scale: 1,
      });

      if (conditionPassed) {
        gsap.set(truePacket, {
          opacity: 1,
          scale: 1,
          x: 0,
        });
      } else {
        gsap.set(falsePacket, {
          opacity: 1,
          scale: 1,
          x: 0,
        });
      }

      gsap.set(output, {
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
        status.textContent = "STEP 01 · A VALUE ENTERS THE CONDITION";
      })

      .to(
        inputPanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.1,
      )

      .to(
        output,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.52,
        },
        0.17,
      )

      .to(
        inputPacket,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "-=0.2",
      )

      .call(() => {
        status.textContent = `STEP 02 · IS ${score} >= ${threshold}?`;
      })

      .to(conditionGate, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        ease: "back.out(1.7)",
      })

      .to(
        conditionCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "back.out(1.8)",
        },
        "-=0.3",
      )

      .to(
        [truePath, falsePath],
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.48,
          stagger: 0.08,
          ease: "power2.inOut",
        },
        "-=0.12",
      )

      .call(() => {
        status.textContent = conditionPassed
          ? "STEP 03 · CONDITION IS TRUE"
          : "STEP 03 · CONDITION IS FALSE";
      });

    if (conditionPassed) {
      timeline
        .to(trueResult, {
          opacity: 1,
          scale: 1.04,
          duration: 0.3,
        })

        .to(
          falseResult,
          {
            opacity: 0.18,
            scale: 0.94,
            duration: 0.25,
          },
          "<",
        )

        .to(
          truePacket,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.48,
            ease: "power2.inOut",
          },
          "-=0.05",
        )

        .call(() => {
          outputText.textContent = successText;
        });
    } else {
      timeline
        .to(falseResult, {
          opacity: 1,
          scale: 1.04,
          duration: 0.3,
        })

        .to(
          trueResult,
          {
            opacity: 0.18,
            scale: 0.94,
            duration: 0.25,
          },
          "<",
        )

        .to(
          falsePacket,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.48,
            ease: "power2.inOut",
          },
          "-=0.05",
        )

        .call(() => {
          outputText.textContent = failText;
        });
    }

    timeline
      .call(() => {
        status.textContent = "STEP 04 · ONLY ONE BRANCH RUNS";
      })

      .fromTo(
        outputText,
        {
          opacity: 0.15,
          y: 7,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.65)",
        },
      )

      .call(() => {
        status.textContent = "STEP 05 · CONDITIONS CONTROL PROGRAM FLOW";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "CONDITION RESOLVED";
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
  }, [score, threshold, successText, failText, conditionPassed]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript condition gate explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>CONDITION GATE</span>

          <strong>JavaScript chooses one path based on true or false</strong>
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
          STEP 01 · A VALUE ENTERS THE CONDITION
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* INPUT */}
          {/* ============================================== */}

          <div className={styles.inputPanel} data-input-panel>
            <div className={styles.panelHeader}>
              <Zap size={14} />

              <div>
                <span>INPUT</span>

                <strong>score</strong>
              </div>
            </div>

            <div className={styles.inputValue}>
              <span>CURRENT SCORE</span>

              <strong>{score}</strong>
            </div>

            <div className={styles.codeBlock}>
              <span>
                if (score &gt;= {threshold}) {"{"}
              </span>

              <span>
                {"  "}
                console.log(
                <b>"{successText}"</b>
                );
              </span>

              <span>
                {"}"} else {"{"}
              </span>

              <span>
                {"  "}
                console.log(
                <b>"{failText}"</b>
                );
              </span>

              <span>{"}"}</span>
            </div>

            <div className={styles.inputPacket} data-input-packet>
              score = {score}
            </div>
          </div>

          {/* ============================================== */}
          {/* GATE */}
          {/* ============================================== */}

          <div className={styles.gatePanel}>
            <div className={styles.gateHeader}>
              <span>DECISION ENGINE</span>

              <strong>if / else</strong>
            </div>

            <div className={styles.conditionGate} data-condition-gate>
              <div className={styles.conditionCore} data-condition-core>
                <GitBranch size={26} />

                <strong>
                  {score} ≥ {threshold}
                </strong>

                <span>CONDITION</span>
              </div>

              <div
                className={`${styles.path} ${styles.truePath}`}
                data-true-path
              >
                <span className={styles.branchPacket} data-true-packet>
                  TRUE
                </span>
              </div>

              <div
                className={`${styles.path} ${styles.falsePath}`}
                data-false-path
              >
                <span className={styles.branchPacket} data-false-packet>
                  FALSE
                </span>
              </div>

              <div
                className={`${styles.branchResult} ${styles.trueResult}`}
                data-true-result
              >
                <CircleCheck size={15} />

                <div>
                  <span>TRUE PATH</span>

                  <strong>Run if block</strong>
                </div>
              </div>

              <div
                className={`${styles.branchResult} ${styles.falseResult}`}
                data-false-result
              >
                <CircleX size={15} />

                <div>
                  <span>FALSE PATH</span>

                  <strong>Run else block</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* OUTPUT */}
          {/* ============================================== */}

          <div className={styles.outputPanel} data-output>
            <div className={styles.outputHeader}>
              <span>PROGRAM OUTPUT</span>

              <strong>Result</strong>
            </div>

            <div className={styles.outputScreen}>
              <ShieldCheck size={24} />

              <span>CONSOLE</span>

              <strong data-output-text>Waiting for condition...</strong>
            </div>

            <div className={styles.logicInfo}>
              <div>
                <span>TRUE</span>

                <strong>condition passes</strong>
              </div>

              <div>
                <span>FALSE</span>

                <strong>condition fails</strong>
              </div>
            </div>

            <div className={styles.completeBadge} data-complete>
              <Check size={12} />
              Branch selected
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Check</strong>

              <p>JavaScript evaluates a condition.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Decide</strong>

              <p>The condition becomes true or false.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Branch</strong>

              <p>Only the matching branch runs.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>IF</span>

          <div>
            <strong>Test a condition</strong>

            <p>The if block runs when the condition is true.</p>
          </div>
        </div>

        <div>
          <span>ELSE</span>

          <div>
            <strong>Handle the other case</strong>

            <p>The else block runs when the condition is false.</p>
          </div>
        </div>

        <div>
          <span>FLOW</span>

          <div>
            <strong>Control what happens</strong>

            <p>Conditions let programs make decisions.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>VALUE → CONDITION → TRUE / FALSE → BRANCH</span>
      </div>
    </section>
  );
}

export default JsConditionGateAnimation;
