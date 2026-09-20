import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactIntroNexusAnimation({
  appName = "CodeLand App",
  components = ["Header", "ProfileCard", "ActionButton"],
  reusableComponent = "ActionButton",
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

    const appNode = root.querySelector("[data-app-node]");
    const componentNodes = root.querySelectorAll("[data-component-node]");

    const connectorLines = root.querySelectorAll("[data-connector]");

    const codePanel = root.querySelector("[data-code-panel]");
    const codeLines = root.querySelectorAll("[data-code-line]");

    const preview = root.querySelector("[data-preview]");
    const previewItems = root.querySelectorAll("[data-preview-item]");

    const reuseSource = root.querySelector("[data-reuse-source]");
    const reuseCopies = root.querySelectorAll("[data-reuse-copy]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · ONE LARGE INTERFACE";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(appNode, {
      opacity: 0,
      scale: 0.82,
      y: 10,
    });

    gsap.set(componentNodes, {
      opacity: 0,
      scale: 0.78,
      y: 18,
    });

    gsap.set(connectorLines, {
      scaleY: 0,
      opacity: 0,
      transformOrigin: "top center",
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(codeLines, {
      opacity: 0.28,
      x: -8,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewItems, {
      opacity: 0,
      y: 12,
      scale: 0.94,
    });

    gsap.set(reuseSource, {
      opacity: 0,
      scale: 0.8,
    });

    gsap.set(reuseCopies, {
      opacity: 0,
      scale: 0.7,
      y: 12,
    });

    gsap.set(summaryCards, {
      opacity: 0,
      y: 12,
      scale: 0.94,
    });

    gsap.set(completeBadge, {
      opacity: 0,
      scale: 0.84,
      y: 8,
    });

    /* ================================================== */
    /* REDUCED MOTION */
    /* ================================================== */

    if (reducedMotion) {
      status.textContent = "REACT COMPONENT SYSTEM ONLINE";

      gsap.set(
        [
          status,
          appNode,
          componentNodes,
          connectorLines,
          codePanel,
          codeLines,
          preview,
          previewItems,
          reuseSource,
          reuseCopies,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          scaleY: 1,
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
      /* -------------------------------------------------- */
      /* APP */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.25,
      })

      .to(
        appNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.48,
          ease: "back.out(1.7)",
        },
        0.08,
      )

      /* -------------------------------------------------- */
      /* COMPONENT TREE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · BREAK THE UI INTO COMPONENTS";
      })

      .to(connectorLines, {
        opacity: 1,
        scaleY: 1,
        duration: 0.35,
        stagger: 0.07,
      })

      .to(
        componentNodes,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.42,
          stagger: 0.1,
          ease: "back.out(1.55)",
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* COMPONENT CODE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · EACH COMPONENT HAS ITS OWN LOGIC";
      })

      .to(codePanel, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        codeLines,
        {
          opacity: 1,
          x: 0,
          duration: 0.24,
          stagger: 0.06,
        },
        "-=0.25",
      )

      /* -------------------------------------------------- */
      /* PREVIEW */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · REACT COMBINES THEM INTO THE PAGE";
      })

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        previewItems,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.1,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* REUSE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · BUILD ONCE · REUSE MANY TIMES";
      })

      .to(reuseSource, {
        opacity: 1,
        scale: 1,
        duration: 0.38,
        ease: "back.out(1.7)",
      })

      .to(
        reuseCopies,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.12,
          ease: "back.out(1.7)",
        },
        "-=0.18",
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .call(() => {
        status.textContent = "REACT COMPONENT SYSTEM ONLINE";
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
  }, [appName, components, reusableComponent]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React component system visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>REACT NEXUS</span>
          <strong>Think in components</strong>
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
          STEP 01 · ONE LARGE INTERFACE
        </div>

        <div className={styles.introWorkspace}>
          {/* COMPONENT TREE */}

          <div className={styles.treePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>COMPONENT GRAPH</span>
                <strong>{appName}</strong>
              </div>
            </div>

            <div className={styles.treeStage}>
              <div className={`${styles.node} ${styles.appNode}`} data-app-node>
                <Cpu size={17} />

                <div>
                  <span>ROOT</span>
                  <strong>App</strong>
                </div>
              </div>

              <div className={styles.treeBranches}>
                {components.map((component) => (
                  <div key={component} className={styles.branch}>
                    <span className={styles.verticalConnector} data-connector />

                    <div className={styles.node} data-component-node>
                      <Code2 size={14} />

                      <div>
                        <span>COMPONENT</span>
                        <strong>{component}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>COMPONENT CODE</span>
                <strong>App.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>App</span>() {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;main&gt;
              </div>

              {components.map((component) => (
                <div
                  key={component}
                  className={styles.codeIndentXL}
                  data-code-line
                >
                  &lt;
                  <span className={styles.codeComponent}>{component}</span>{" "}
                  /&gt;
                </div>
              ))}

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;/main&gt;
              </div>

              <div className={styles.codeIndent} data-code-line>
                );
              </div>

              <div data-code-line>{"}"}</div>
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
              <div className={styles.previewHeader} data-preview-item>
                CodeLand
              </div>

              <div className={styles.previewCard} data-preview-item>
                <span>PROFILE CARD</span>
                <strong>Future Coder</strong>
                <small>React Explorer</small>
              </div>

              <button
                type="button"
                className={styles.previewButton}
                data-preview-item
              >
                Explore
              </button>
            </div>
          </div>
        </div>

        {/* REUSE */}

        <div className={styles.reuseFlow}>
          <div
            className={`${styles.reuseNode} ${styles.reuseSource}`}
            data-reuse-source
          >
            <span>COMPONENT</span>
            <strong>{reusableComponent}</strong>
          </div>

          <div className={styles.reuseArrow}>→</div>

          <div className={styles.reuseCopies}>
            {["Explore", "Continue", "Launch"].map((label) => (
              <div key={label} className={styles.reuseNode} data-reuse-copy>
                <span>INSTANCE</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY */}

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Split</strong>
              <p>Break interfaces into focused pieces.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Compose</strong>
              <p>Combine components to build a page.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Reuse</strong>
              <p>Use the same component many times.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Component system assembled
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>JS</span>

          <div>
            <strong>Adds logic</strong>
            <p>JavaScript controls application behavior.</p>
          </div>
        </div>

        <div>
          <span>REACT</span>

          <div>
            <strong>Organizes the UI</strong>
            <p>React turns that logic into reusable components.</p>
          </div>
        </div>

        <div>
          <Sparkles size={15} />

          <div>
            <strong>Reusable systems</strong>
            <p>Build once, combine, and reuse.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>INTERFACE → COMPONENTS → COMPOSITION → REUSE</span>
      </div>
    </section>
  );
}

export default ReactIntroNexusAnimation;
