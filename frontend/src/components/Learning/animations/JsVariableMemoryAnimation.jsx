import { useLayoutEffect, useRef } from "react";
import {
  Box,
  Check,
  Cpu,
  Database,
  Lock,
  Pencil,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsVariableMemoryAnimation.module.css";

function JsVariableMemoryAnimation({
  variableName = "score",
  initialValue = 10,
  updatedValue = 25,
  declaration = "let",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeName =
    String(variableName || "score")
      .trim()
      .replace(/\s+/g, "") || "score";

  const safeDeclaration = declaration === "const" ? "const" : "let";

  const canUpdate = safeDeclaration === "let";

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

    const tokenName = root.querySelector("[data-token-name]");

    const tokenValue = root.querySelector("[data-token-value]");

    const memoryBank = root.querySelector("[data-memory-bank]");

    const memorySlot = root.querySelector("[data-memory-slot]");

    const slotName = root.querySelector("[data-slot-name]");

    const slotValue = root.querySelector("[data-slot-value]");

    const connector = root.querySelector("[data-connector]");

    const packet = root.querySelector("[data-packet]");

    const declarationBadge = root.querySelector("[data-declaration-badge]");

    const updatePacket = root.querySelector("[data-update-packet]");

    const updateLine = root.querySelector("[data-update-line]");

    const referencePanel = root.querySelector("[data-reference-panel]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    slotName.textContent = "empty";
    slotValue.textContent = "—";

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

    gsap.set([tokenName, tokenValue], {
      opacity: 0,
      scale: 0.8,
      y: 12,
    });

    gsap.set(memoryBank, {
      opacity: 0,
      scale: 0.95,
      y: 18,
    });

    gsap.set(memorySlot, {
      opacity: 0,
      scale: 0.86,
    });

    gsap.set(connector, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(packet, {
      opacity: 0,
      scale: 0.75,
      x: -70,
    });

    gsap.set(declarationBadge, {
      opacity: 0,
      scale: 0.8,
      y: 5,
    });

    gsap.set(updateLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(updatePacket, {
      opacity: 0,
      scale: 0.75,
      x: -60,
    });

    gsap.set(referencePanel, {
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
      status.textContent = "VARIABLE MEMORY READY";

      slotName.textContent = safeName;

      slotValue.textContent = String(canUpdate ? updatedValue : initialValue);

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

      gsap.set([tokenName, tokenValue], {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(memoryBank, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(memorySlot, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(connector, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(packet, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(declarationBadge, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      if (canUpdate) {
        gsap.set(updateLine, {
          opacity: 1,
          scaleX: 1,
        });

        gsap.set(updatePacket, {
          opacity: 1,
          scale: 1,
          x: 0,
        });
      }

      gsap.set(referencePanel, {
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
      /* -------------------------------------------------- */
      /* CODE */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · JAVASCRIPT READS THE VARIABLE";
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
        referencePanel,
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
      /* TOKENS */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · NAME AND VALUE ARE IDENTIFIED";
      })

      .to(tokenName, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.38,
        ease: "back.out(1.7)",
      })

      .to(
        tokenValue,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.38,
          ease: "back.out(1.7)",
        },
        "-=0.24",
      )

      /* -------------------------------------------------- */
      /* MEMORY BANK */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · A MEMORY SLOT IS CREATED";
      })

      .to(memoryBank, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.55,
      })

      .to(
        memorySlot,
        {
          opacity: 1,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.8)",
        },
        "-=0.28",
      )

      .to(
        declarationBadge,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.32,
          ease: "back.out(1.8)",
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* VALUE TRAVEL */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 04 · ${safeName.toUpperCase()} STORES ${initialValue}`;
      })

      .to(connector, {
        opacity: 1,
        scaleX: 1,
        duration: 0.5,
        ease: "power2.inOut",
      })

      .to(
        packet,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.58,
          ease: "power2.inOut",
        },
        "-=0.37",
      )

      .call(() => {
        slotName.textContent = safeName;

        slotValue.textContent = String(initialValue);
      })

      .fromTo(
        memorySlot,
        {
          scale: 0.94,
        },
        {
          scale: 1,
          duration: 0.36,
          ease: "back.out(2)",
        },
      );

    /* ================================================== */
    /* LET UPDATE */
    /* ================================================== */

    if (canUpdate) {
      timeline
        .call(() => {
          status.textContent = `STEP 05 · LET CAN CHANGE TO ${updatedValue}`;
        })

        .to(updateLine, {
          opacity: 1,
          scaleX: 1,
          duration: 0.46,
          ease: "power2.inOut",
        })

        .to(
          updatePacket,
          {
            opacity: 1,
            scale: 1,
            x: 0,
            duration: 0.52,
            ease: "power2.inOut",
          },
          "-=0.34",
        )

        .call(() => {
          slotValue.textContent = String(updatedValue);
        })

        .fromTo(
          slotValue,
          {
            opacity: 0.2,
            scale: 1.3,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.8)",
          },
        );
    } else {
      timeline.call(() => {
        status.textContent = "STEP 05 · CONST KEEPS ITS REFERENCE";
      });
    }

    /* ================================================== */
    /* SUMMARY */
    /* ================================================== */

    timeline
      .call(() => {
        status.textContent = "STEP 06 · USE THE NAME TO READ THE VALUE";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        memorySlot,
        {
          scale: 1.035,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.05",
      )

      .call(() => {
        status.textContent = "VARIABLE MEMORY READY";
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
  }, [safeName, initialValue, updatedValue, safeDeclaration]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript variable memory explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>VARIABLE MEMORY</span>

          <strong>Give a value a name and store it for later</strong>
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
          STEP 01 · JAVASCRIPT READS THE VARIABLE
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Pencil size={14} />

              <div>
                <span>DECLARATION</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-row>
                <span className={styles.keyword}>{safeDeclaration}</span>{" "}
                <span className={styles.variable}>{safeName}</span> ={" "}
                <span className={styles.value}>{String(initialValue)}</span>;
              </div>

              {canUpdate && (
                <>
                  <div className={styles.codeSpacer} data-code-row />

                  <div data-code-row>
                    <span className={styles.variable}>{safeName}</span> ={" "}
                    <span className={styles.updatedValue}>
                      {String(updatedValue)}
                    </span>
                    ;
                  </div>
                </>
              )}

              <div className={styles.codeSpacer} data-code-row />

              <div data-code-row>
                console.log(
                <span className={styles.variable}>{safeName}</span>
                );
              </div>
            </div>

            <div className={styles.tokenArea}>
              <div className={styles.token} data-token-name>
                <span>NAME</span>

                <strong>{safeName}</strong>
              </div>

              <div
                className={`${styles.token} ${styles.valueToken}`}
                data-token-value
              >
                <span>VALUE</span>

                <strong>{String(initialValue)}</strong>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* MEMORY */}
          {/* ============================================== */}

          <div className={styles.memoryPanel}>
            <div className={styles.memoryHeader}>
              <div>
                <span>JAVASCRIPT MEMORY</span>

                <strong>Variable Storage</strong>
              </div>

              <Database size={15} />
            </div>

            <div className={styles.memoryBank} data-memory-bank>
              <div className={styles.memoryAddress}>MEM 0x01</div>

              <div className={styles.memorySlot} data-memory-slot>
                <div className={styles.slotTop}>
                  <Box size={14} />

                  <span>VARIABLE SLOT</span>

                  <div
                    className={styles.declarationBadge}
                    data-declaration-badge
                  >
                    {safeDeclaration === "const" ? (
                      <Lock size={10} />
                    ) : (
                      <Pencil size={10} />
                    )}

                    {safeDeclaration.toUpperCase()}
                  </div>
                </div>

                <div className={styles.slotBody}>
                  <div>
                    <span>NAME</span>

                    <strong data-slot-name>empty</strong>
                  </div>

                  <i />

                  <div>
                    <span>VALUE</span>

                    <strong data-slot-value>—</strong>
                  </div>
                </div>
              </div>

              <div className={styles.memoryPulse}>
                <Cpu size={13} />
                MEMORY ACTIVE
              </div>

              {/* INITIAL VALUE FLOW */}

              <div className={styles.initialFlow}>
                <div className={styles.connector} data-connector />

                <span className={styles.packet} data-packet>
                  {String(initialValue)}
                </span>
              </div>

              {/* UPDATE FLOW */}

              {canUpdate && (
                <div className={styles.updateFlow}>
                  <div className={styles.updateLine} data-update-line />

                  <span className={styles.updatePacket} data-update-packet>
                    UPDATE → {String(updatedValue)}
                  </span>
                </div>
              )}

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Variable stored
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* REFERENCE */}
          {/* ============================================== */}

          <div className={styles.referencePanel} data-reference-panel>
            <div className={styles.referenceHeader}>
              <span>VARIABLE RULES</span>

              <strong>What to remember</strong>
            </div>

            <div className={styles.ruleCard}>
              <span>01</span>

              <div>
                <strong>Name</strong>

                <p>The variable name lets your code find the stored value.</p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <span>02</span>

              <div>
                <strong>Value</strong>

                <p>The value is the information stored by the variable.</p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <span>03</span>

              <div>
                <strong>let</strong>

                <p>Use let when the value may be reassigned later.</p>
              </div>
            </div>

            <div className={styles.ruleCard}>
              <span>04</span>

              <div>
                <strong>const</strong>

                <p>Use const when you do not plan to reassign the variable.</p>
              </div>
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
              <strong>Declare</strong>

              <p>Create a variable with let or const.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Name</strong>

              <p>Give the stored data a useful label.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Store</strong>

              <p>JavaScript keeps the value available.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Reuse</strong>

              <p>Use the name whenever you need the value.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>DECLARE</span>

          <div>
            <strong>Create the variable</strong>

            <p>let and const tell JavaScript to create a named value.</p>
          </div>
        </div>

        <div>
          <span>STORE</span>

          <div>
            <strong>Keep information</strong>

            <p>The variable keeps a value available while your program runs.</p>
          </div>
        </div>

        <div>
          <span>REUSE</span>

          <div>
            <strong>Read it later</strong>

            <p>Use the variable name instead of repeating the value.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>DECLARATION → NAME → MEMORY → VALUE → REUSE</span>
      </div>
    </section>
  );
}

export default JsVariableMemoryAnimation;
