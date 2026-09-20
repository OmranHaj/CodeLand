import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Braces,
  Check,
  Database,
  KeyRound,
  RotateCcw,
  ScanLine,
  Sparkles,
  UserRound,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsObjectBuilderAnimation.module.css";

function JsObjectBuilderAnimation({
  objectName = "player",
  properties = {
    name: "Alex",
    level: 5,
    online: true,
  },
  selectedProperty = "level",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeObjectName =
    String(objectName || "player")
      .trim()
      .replace(/\s+/g, "") || "player";

  const safeProperties = useMemo(() => {
    const source =
      properties && typeof properties === "object" && !Array.isArray(properties)
        ? properties
        : {
            name: "Alex",
            level: 5,
            online: true,
          };

    return Object.entries(source)
      .slice(0, 5)
      .map(([key, value]) => ({
        key: String(key),
        value,
      }));
  }, [properties]);

  const selectedIndex = Math.max(
    0,
    safeProperties.findIndex((property) => property.key === selectedProperty),
  );

  const activeProperty = safeProperties[selectedIndex] || safeProperties[0];

  const formatCodeValue = (value) => {
    if (typeof value === "string") {
      return `"${value}"`;
    }

    return String(value);
  };

  const formatDisplayValue = (value) => String(value);

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

    const objectBuilder = root.querySelector("[data-object-builder]");

    const objectCore = root.querySelector("[data-object-core]");

    const propertyCards = root.querySelectorAll("[data-property-card]");

    const keyLabels = root.querySelectorAll("[data-key-label]");

    const valueLabels = root.querySelectorAll("[data-value-label]");

    const scanner = root.querySelector("[data-scanner]");

    const outputPanel = root.querySelector("[data-output-panel]");

    const outputKey = root.querySelector("[data-output-key]");

    const outputValue = root.querySelector("[data-output-value]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    const activeCard = propertyCards[selectedIndex] || propertyCards[0];

    outputKey.textContent = `${safeObjectName}.${activeProperty.key}`;

    outputValue.textContent = "Waiting...";

    /* ================================================== */
    /* RESET */
    /* ================================================== */

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

    gsap.set(objectBuilder, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(objectCore, {
      opacity: 0,
      scale: 0.78,
      rotation: -10,
    });

    gsap.set(propertyCards, {
      opacity: 0,
      y: 14,
      scale: 0.9,
    });

    gsap.set(keyLabels, {
      opacity: 0,
      x: -8,
    });

    gsap.set(valueLabels, {
      opacity: 0,
      x: 8,
    });

    gsap.set(scanner, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "top center",
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
      status.textContent = "OBJECT READY";

      outputValue.textContent = formatDisplayValue(activeProperty.value);

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

      gsap.set(objectBuilder, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(objectCore, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(propertyCards, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(keyLabels, {
        opacity: 1,
        x: 0,
      });

      gsap.set(valueLabels, {
        opacity: 1,
        x: 0,
      });

      gsap.set(scanner, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(activeCard, {
        scale: 1.04,
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
        status.textContent = "STEP 01 · JAVASCRIPT CREATES AN OBJECT";
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
          stagger: 0.07,
        },
        "-=0.2",
      )

      /* -------------------------------------------------- */
      /* OBJECT CORE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · RELATED DATA IS GROUPED TOGETHER";
      })

      .to(objectBuilder, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
      })

      .to(
        objectCore,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.42,
          ease: "back.out(1.8)",
        },
        "-=0.28",
      )

      /* -------------------------------------------------- */
      /* PROPERTIES */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · OBJECTS STORE KEY + VALUE PAIRS";
      })

      .to(propertyCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.34,
        stagger: 0.09,
      })

      .to(
        keyLabels,
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          stagger: 0.07,
        },
        "-=0.22",
      )

      .to(
        valueLabels,
        {
          opacity: 1,
          x: 0,
          duration: 0.25,
          stagger: 0.07,
        },
        "-=0.3",
      )

      /* -------------------------------------------------- */
      /* PROPERTY LOOKUP */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 04 · ACCESS ${safeObjectName}.${activeProperty.key}`;
      })

      .to(scanner, {
        opacity: 1,
        scaleY: 1,
        duration: 0.4,
      })

      .to(activeCard, {
        scale: 1.06,
        duration: 0.25,
        ease: "back.out(1.8)",
      })

      .call(() => {
        outputValue.textContent = formatDisplayValue(activeProperty.value);
      })

      .fromTo(
        outputValue,
        {
          opacity: 0.18,
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
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · PROPERTY NAME RETURNS ITS VALUE";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "OBJECT READY";
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
  }, [safeObjectName, safeProperties, selectedIndex, activeProperty]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript object builder explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>OBJECT BUILDER</span>

          <strong>Group related information using named properties</strong>
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
          STEP 01 · JAVASCRIPT CREATES AN OBJECT
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE */}
          {/* ============================================== */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Braces size={14} />

              <div>
                <span>OBJECT CODE</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-row>
                <span className={styles.keyword}>const</span>{" "}
                <span className={styles.variable}>{safeObjectName}</span> ={" "}
                {"{"}
              </div>

              {safeProperties.map((property) => (
                <div key={property.key} className={styles.indent} data-code-row>
                  <span className={styles.property}>{property.key}</span>:{" "}
                  <span className={styles.value}>
                    {formatCodeValue(property.value)}
                  </span>
                  ,
                </div>
              ))}

              <div data-code-row>{"}"};</div>

              <div className={styles.codeSpacer} data-code-row />

              <div data-code-row>
                <span className={styles.variable}>{safeObjectName}</span>.
                <span className={styles.property}>{activeProperty.key}</span>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* OBJECT BUILDER */}
          {/* ============================================== */}

          <div className={styles.builderPanel}>
            <div className={styles.builderHeader}>
              <span>OBJECT STORAGE</span>

              <strong>Key / Value System</strong>
            </div>

            <div className={styles.objectBuilder} data-object-builder>
              <div className={styles.objectCore} data-object-core>
                <UserRound size={24} />

                <strong>{safeObjectName}</strong>

                <span>OBJECT</span>
              </div>

              <div className={styles.propertyList}>
                {safeProperties.map((property) => (
                  <div
                    key={property.key}
                    className={styles.propertyCard}
                    data-property-card
                  >
                    <div className={styles.keyBox} data-key-label>
                      <KeyRound size={11} />

                      <span>KEY</span>

                      <strong>{property.key}</strong>
                    </div>

                    <div className={styles.propertyConnector}>
                      <span />
                    </div>

                    <div className={styles.valueBox} data-value-label>
                      <Database size={11} />

                      <span>VALUE</span>

                      <strong>{formatDisplayValue(property.value)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className={styles.scanner}
                data-scanner
                style={{
                  top: `${154 + selectedIndex * 62}px`,
                }}
              >
                <ScanLine size={15} />
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Property found
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* OUTPUT */}
          {/* ============================================== */}

          <div className={styles.outputPanel} data-output-panel>
            <div className={styles.outputHeader}>
              <KeyRound size={14} />

              <div>
                <span>PROPERTY LOOKUP</span>

                <strong>Result</strong>
              </div>
            </div>

            <div className={styles.lookup}>
              <span data-output-key>
                {safeObjectName}.{activeProperty.key}
              </span>

              <strong data-output-value>Waiting...</strong>
            </div>

            <div className={styles.lookupTip}>
              <span>DOT NOTATION</span>

              <strong>object.property</strong>
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
              <strong>Group</strong>

              <p>Objects keep related information together.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Key</strong>

              <p>Each property has a meaningful name.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Value</strong>

              <p>Each key points to a stored value.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Access</strong>

              <p>Dot notation reads one property.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>OBJECT</span>

          <div>
            <strong>Describe one thing</strong>

            <p>An object can represent a player, project, product, or user.</p>
          </div>
        </div>

        <div>
          <span>PROPERTY</span>

          <div>
            <strong>Give data meaning</strong>

            <p>Keys explain what each stored value represents.</p>
          </div>
        </div>

        <div>
          <span>ACCESS</span>

          <div>
            <strong>Read exactly what you need</strong>

            <p>Use object.property to retrieve one value.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>OBJECT → KEY → VALUE → PROPERTY LOOKUP</span>
      </div>
    </section>
  );
}

export default JsObjectBuilderAnimation;
