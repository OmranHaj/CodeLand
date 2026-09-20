import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Boxes,
  Check,
  Database,
  Hash,
  RotateCcw,
  ScanLine,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsArrayVaultAnimation.module.css";

function JsArrayVaultAnimation({
  arrayName = "colors",
  items = ["red", "blue", "green"],
  selectedIndex = 0,
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeName =
    String(arrayName || "colors")
      .trim()
      .replace(/\s+/g, "") || "colors";

  const safeItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return ["red", "blue", "green"];
    }

    return items.slice(0, 6).map((item) => String(item));
  }, [items]);

  const safeIndex = Math.min(
    safeItems.length - 1,
    Math.max(0, Number(selectedIndex) || 0),
  );

  const selectedValue = safeItems[safeIndex];

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

    const vault = root.querySelector("[data-vault]");
    const cells = root.querySelectorAll("[data-cell]");
    const indexLabels = root.querySelectorAll("[data-index-label]");

    const scanner = root.querySelector("[data-scanner]");
    const selectedCell = cells[safeIndex];

    const outputPanel = root.querySelector("[data-output-panel]");
    const outputValue = root.querySelector("[data-output-value]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

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

    gsap.set(vault, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(cells, {
      opacity: 0,
      y: 12,
      scale: 0.9,
    });

    gsap.set(indexLabels, {
      opacity: 0,
      y: -6,
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

    if (reducedMotion) {
      status.textContent = "ARRAY READY";
      outputValue.textContent = selectedValue;

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

      gsap.set(vault, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(cells, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(indexLabels, {
        opacity: 1,
        y: 0,
      });

      gsap.set(scanner, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(selectedCell, {
        scale: 1.06,
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
        status.textContent = "STEP 01 · JAVASCRIPT CREATES AN ARRAY";
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

      .call(() => {
        status.textContent = "STEP 02 · ONE VARIABLE STORES MANY VALUES";
      })

      .to(vault, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
      })

      .to(
        cells,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.09,
        },
        "-=0.22",
      )

      .call(() => {
        status.textContent = "STEP 03 · EACH VALUE GETS AN INDEX";
      })

      .to(indexLabels, {
        opacity: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.08,
      })

      .call(() => {
        status.textContent = `STEP 04 · ACCESS INDEX ${safeIndex}`;
      })

      .to(scanner, {
        opacity: 1,
        scaleY: 1,
        duration: 0.4,
      })

      .to(selectedCell, {
        scale: 1.08,
        duration: 0.25,
        ease: "back.out(1.8)",
      })

      .call(() => {
        outputValue.textContent = selectedValue;
      })

      .fromTo(
        outputValue,
        {
          opacity: 0.2,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
        },
      )

      .call(() => {
        status.textContent = "STEP 05 · INDEX RETURNS THE STORED VALUE";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "ARRAY READY";
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
  }, [safeName, safeItems, safeIndex, selectedValue]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript array vault explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>ARRAY VAULT</span>

          <strong>Store multiple related values inside one variable</strong>
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
          STEP 01 · JAVASCRIPT CREATES AN ARRAY
        </div>

        <div className={styles.workspace}>
          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeader}>
              <Boxes size={14} />

              <div>
                <span>ARRAY CODE</span>

                <strong>script.js</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-row>
                <span className={styles.keyword}>const</span>{" "}
                <span className={styles.variable}>{safeName}</span> = [
              </div>

              {safeItems.map((item) => (
                <div key={item} className={styles.indent} data-code-row>
                  <span className={styles.string}>"{item}"</span>,
                </div>
              ))}

              <div data-code-row>];</div>

              <div className={styles.codeSpacer} data-code-row />

              <div data-code-row>
                {safeName}[{safeIndex}]
              </div>
            </div>
          </div>

          <div className={styles.vaultPanel}>
            <div className={styles.vaultHeader}>
              <span>ARRAY STORAGE</span>

              <strong>Indexed Collection</strong>
            </div>

            <div className={styles.vault} data-vault>
              <Database size={18} />

              <div className={styles.arrayName}>{safeName}</div>

              <div className={styles.cells}>
                {safeItems.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={styles.cell}
                    data-cell
                  >
                    <span className={styles.indexLabel} data-index-label>
                      [{index}]
                    </span>

                    <strong>{item}</strong>
                  </div>
                ))}
              </div>

              <div
                className={styles.scanner}
                data-scanner
                style={{
                  left: `${((safeIndex + 0.5) / safeItems.length) * 100}%`,
                }}
              >
                <ScanLine size={15} />
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Value found
              </div>
            </div>
          </div>

          <div className={styles.outputPanel} data-output-panel>
            <div className={styles.outputHeader}>
              <Hash size={14} />

              <div>
                <span>INDEX LOOKUP</span>

                <strong>Result</strong>
              </div>
            </div>

            <div className={styles.lookup}>
              <span>
                {safeName}[{safeIndex}]
              </span>

              <strong data-output-value>Waiting...</strong>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Store</strong>

              <p>One array can hold multiple values.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Index</strong>

              <p>Array positions begin at index 0.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Access</strong>

              <p>Use square brackets to read one item.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>ARRAY</span>

          <div>
            <strong>Many values together</strong>

            <p>Arrays group related data under one variable name.</p>
          </div>
        </div>

        <div>
          <span>INDEX</span>

          <div>
            <strong>Every position has a number</strong>

            <p>The first array item is always index 0.</p>
          </div>
        </div>

        <div>
          <span>ACCESS</span>

          <div>
            <strong>Read one item</strong>

            <p>Use arrayName[index] to retrieve a stored value.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>ARRAY → INDEX → LOOKUP → VALUE</span>
      </div>
    </section>
  );
}

export default JsArrayVaultAnimation;
