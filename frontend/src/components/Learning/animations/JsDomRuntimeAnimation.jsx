import { useLayoutEffect, useRef } from "react";
import {
  Check,
  Code2,
  Cpu,
  FileCode2,
  Monitor,
  MousePointer2,
  RotateCcw,
  Search,
  Sparkles,
  Type,
} from "lucide-react";
import gsap from "gsap";

import styles from "./JsDomRuntimeAnimation.module.css";

function JsDomRuntimeAnimation({
  selector = "#message",
  initialText = "Waiting for JavaScript...",
  updatedText = "JavaScript is working!",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeSelector = String(selector || "#message").trim() || "#message";

  const safeInitialText = String(initialText ?? "Waiting for JavaScript...");

  const safeUpdatedText = String(updatedText ?? "JavaScript is working!");

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

    const domTree = root.querySelector("[data-dom-tree]");

    const domNodes = root.querySelectorAll("[data-dom-node]");

    const targetNode = root.querySelector("[data-target-node]");

    const selectorBeam = root.querySelector("[data-selector-beam]");

    const selectorPacket = root.querySelector("[data-selector-packet]");

    const jsEngine = root.querySelector("[data-js-engine]");

    const updateLine = root.querySelector("[data-update-line]");

    const updatePacket = root.querySelector("[data-update-packet]");

    const browserPanel = root.querySelector("[data-browser-panel]");

    const browserText = root.querySelector("[data-browser-text]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    browserText.textContent = safeInitialText;

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

    gsap.set(domTree, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(domNodes, {
      opacity: 0,
      y: 8,
      scale: 0.93,
    });

    gsap.set(targetNode, {
      boxShadow: "0 0 0 rgba(70, 223, 255, 0)",
    });

    gsap.set(selectorBeam, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(selectorPacket, {
      opacity: 0,
      scale: 0.75,
      x: -45,
    });

    gsap.set(jsEngine, {
      opacity: 0,
      scale: 0.78,
      rotation: -10,
    });

    gsap.set(updateLine, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(updatePacket, {
      opacity: 0,
      scale: 0.75,
      x: -45,
    });

    gsap.set(browserPanel, {
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
      status.textContent = "DOM UPDATE COMPLETE";

      browserText.textContent = safeUpdatedText;

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

      gsap.set(domTree, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(domNodes, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(selectorBeam, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(selectorPacket, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(jsEngine, {
        opacity: 1,
        scale: 1,
        rotation: 0,
      });

      gsap.set(updateLine, {
        opacity: 1,
        scaleX: 1,
      });

      gsap.set(updatePacket, {
        opacity: 1,
        scale: 1,
        x: 0,
      });

      gsap.set(browserPanel, {
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
        status.textContent = "STEP 01 · THE BROWSER BUILDS THE DOM";
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
        browserPanel,
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
          duration: 0.28,
          stagger: 0.07,
        },
        "-=0.22",
      )

      .to(domTree, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        domNodes,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.08,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* SELECT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 02 · querySelector FINDS ${safeSelector}`;
      })

      .to(selectorBeam, {
        opacity: 1,
        scaleX: 1,
        duration: 0.46,
        ease: "power2.inOut",
      })

      .to(
        selectorPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.48,
        },
        "-=0.32",
      )

      .to(targetNode, {
        scale: 1.05,
        boxShadow: "0 0 24px rgba(70, 223, 255, 0.16)",
        duration: 0.28,
      })

      /* -------------------------------------------------- */
      /* JS ENGINE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · JAVASCRIPT GETS THE ELEMENT";
      })

      .to(jsEngine, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.42,
        ease: "back.out(1.8)",
      })

      /* -------------------------------------------------- */
      /* UPDATE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · textContent CHANGES THE DOM";
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
          duration: 0.48,
        },
        "-=0.32",
      )

      .call(() => {
        browserText.textContent = safeUpdatedText;
      })

      .fromTo(
        browserText,
        {
          opacity: 0.15,
          y: 8,
          scale: 0.94,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.7)",
        },
      )

      /* -------------------------------------------------- */
      /* RENDER */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · THE BROWSER SHOWS THE NEW CONTENT";
      })

      .to(browserPanel, {
        scale: 1.018,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "DOM UPDATE COMPLETE";
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
  }, [safeSelector, safeInitialText, safeUpdatedText]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JavaScript DOM runtime explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>DOM RUNTIME</span>

          <strong>JavaScript finds HTML elements and changes the page</strong>
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
          STEP 01 · THE BROWSER BUILDS THE DOM
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CODE */}
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
              <div data-code-row>
                <span className={styles.keyword}>const</span>{" "}
                <span className={styles.variable}>message</span> =
              </div>

              <div className={styles.indent} data-code-row>
                document.querySelector(
              </div>

              <div className={styles.indentLarge} data-code-row>
                <span className={styles.string}>"{safeSelector}"</span>
              </div>

              <div className={styles.indent} data-code-row>
                );
              </div>

              <div className={styles.codeSpacer} data-code-row />

              <div data-code-row>
                <span className={styles.variable}>message</span>
                .textContent =
              </div>

              <div className={styles.indent} data-code-row>
                <span className={styles.string}>"{safeUpdatedText}"</span>;
              </div>
            </div>

            <div className={styles.selectorCard}>
              <Search size={12} />

              <div>
                <span>SELECTOR</span>

                <strong>{safeSelector}</strong>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* DOM TREE */}
          {/* ============================================== */}

          <div className={styles.domPanel}>
            <div className={styles.domHeader}>
              <span>DOCUMENT OBJECT MODEL</span>

              <strong>Live DOM Tree</strong>
            </div>

            <div className={styles.domTree} data-dom-tree>
              <div className={styles.jsEngine} data-js-engine>
                <Cpu size={17} />

                <span>JS</span>
              </div>

              <div className={styles.domNode} data-dom-node>
                <FileCode2 size={13} />

                <strong>document</strong>
              </div>

              <div className={styles.treeLine} />

              <div className={styles.domNode} data-dom-node>
                <span className={styles.tag}>&lt;body&gt;</span>
              </div>

              <div className={styles.treeLine} />

              <div
                className={`${styles.domNode} ${styles.targetNode}`}
                data-dom-node
                data-target-node
              >
                <Type size={13} />

                <div>
                  <strong>&lt;h2&gt;</strong>

                  <span>{safeSelector}</span>
                </div>
              </div>

              <div className={styles.selectorFlow}>
                <div className={styles.selectorBeam} data-selector-beam />

                <span className={styles.selectorPacket} data-selector-packet>
                  SELECT
                </span>
              </div>

              <div className={styles.updateFlow}>
                <div className={styles.updateLine} data-update-line />

                <span className={styles.updatePacket} data-update-packet>
                  textContent
                </span>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                DOM updated
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* BROWSER */}
          {/* ============================================== */}

          <div className={styles.browserPanel} data-browser-panel>
            <div className={styles.browserHeader}>
              <Monitor size={14} />

              <div>
                <span>LIVE PAGE</span>

                <strong>Browser Output</strong>
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
                <MousePointer2 size={18} />

                <span>PAGE CONTENT</span>

                <h3 data-browser-text>{safeInitialText}</h3>
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
              <strong>DOM</strong>

              <p>The browser represents HTML as objects.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Select</strong>

              <p>querySelector finds an element in the page.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Update</strong>

              <p>JavaScript changes an element property.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>04</span>

            <div>
              <strong>Render</strong>

              <p>The browser immediately shows the new content.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>SELECT</span>

          <div>
            <strong>Find an element</strong>

            <p>querySelector connects JavaScript to an HTML element.</p>
          </div>
        </div>

        <div>
          <span>CHANGE</span>

          <div>
            <strong>Update the DOM</strong>

            <p>Properties like textContent change the selected element.</p>
          </div>
        </div>

        <div>
          <span>RENDER</span>

          <div>
            <strong>The page reacts</strong>

            <p>The browser displays the updated DOM immediately.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>HTML → DOM → SELECT → UPDATE → RENDER</span>
      </div>
    </section>
  );
}

export default JsDomRuntimeAnimation;
