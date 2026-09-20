import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactCompositionNexusAnimation({
  parentComponent = "Profile",
  components = ["Avatar", "PlayerInfo"],
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const componentKey = components.join("|");

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");

    const sourceNodes = root.querySelectorAll("[data-source-node]");
    const connectors = root.querySelectorAll("[data-connector]");

    const parentNode = root.querySelector("[data-parent-node]");

    const codePanel = root.querySelector("[data-code-panel]");
    const codeLines = root.querySelectorAll("[data-code-line]");

    const compositionTrack = root.querySelector("[data-composition-track]");
    const compositionPacket = root.querySelector("[data-composition-packet]");

    const preview = root.querySelector("[data-preview]");
    const previewParts = root.querySelectorAll("[data-preview-part]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · START WITH SMALL COMPONENTS";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(sourceNodes, {
      opacity: 0,
      scale: 0.75,
      y: 14,
    });

    gsap.set(connectors, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "top center",
    });

    gsap.set(parentNode, {
      opacity: 0,
      scale: 0.72,
      y: 12,
    });

    gsap.set(codePanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(codeLines, {
      opacity: 0.25,
      x: -8,
    });

    gsap.set(compositionTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(compositionPacket, {
      opacity: 0,
      scale: 0.72,
      x: -42,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewParts, {
      opacity: 0,
      y: 10,
      scale: 0.92,
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
      status.textContent = "COMPONENT COMPOSITION COMPLETE";

      gsap.set(
        [
          status,
          sourceNodes,
          connectors,
          parentNode,
          codePanel,
          codeLines,
          compositionTrack,
          compositionPacket,
          preview,
          previewParts,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
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
      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.25,
      })

      /* SMALL COMPONENTS */

      .to(
        sourceNodes,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.11,
          ease: "back.out(1.7)",
        },
        0.08,
      )

      /* CONNECT */

      .call(() => {
        status.textContent = "STEP 02 · COMPONENTS CONNECT TO A PARENT";
      })

      .to(connectors, {
        opacity: 1,
        scaleY: 1,
        duration: 0.36,
        stagger: 0.08,
      })

      .to(
        parentNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          ease: "back.out(1.8)",
        },
        "-=0.18",
      )

      /* CODE */

      .call(() => {
        status.textContent = "STEP 03 · PARENT COMPOSES THE CHILDREN";
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
          duration: 0.25,
          stagger: 0.06,
        },
        "-=0.24",
      )

      /* ASSEMBLE */

      .call(() => {
        status.textContent = "STEP 04 · REACT ASSEMBLES ONE COMPLETE SECTION";
      })

      .to(compositionTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        compositionPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
        },
        "-=0.32",
      )

      /* PREVIEW */

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        previewParts,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.11,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      /* SUMMARY */

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.09,
      })

      .call(() => {
        status.textContent = "COMPONENT COMPOSITION COMPLETE";
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
  }, [parentComponent, componentKey]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React component composition visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>COMPOSITION NEXUS</span>
          <strong>Build bigger interfaces from smaller pieces</strong>
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
          STEP 01 · START WITH SMALL COMPONENTS
        </div>

        <div className={styles.introWorkspace}>
          {/* COMPONENT SOURCES */}

          <div className={styles.treePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>COMPONENT MODULES</span>
                <strong>Reusable Pieces</strong>
              </div>
            </div>

            <div className={styles.treeStage}>
              <div className={styles.treeBranches}>
                {components.map((component) => (
                  <div className={styles.branch} key={component}>
                    <div className={styles.node} data-source-node>
                      <Code2 size={13} />

                      <div>
                        <span>COMPONENT</span>
                        <strong>{component}</strong>
                      </div>
                    </div>

                    <span className={styles.verticalConnector} data-connector />
                  </div>
                ))}
              </div>

              <div
                className={`${styles.node} ${styles.appNode}`}
                data-parent-node
              >
                <Cpu size={16} />

                <div>
                  <span>PARENT</span>
                  <strong>{parentComponent}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>COMPOSITION JSX</span>
                <strong>{parentComponent}.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              {components.map((component) => (
                <div key={`function-${component}`} data-code-line>
                  <span className={styles.codeKeyword}>function</span>{" "}
                  <span className={styles.codeFunction}>{component}</span>()
                  {" {"} ... {"}"}
                </div>
              ))}

              <div className={styles.codeSpacer} data-code-line />

              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{parentComponent}</span>
                () {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;section&gt;
              </div>

              {components.map((component) => (
                <div
                  key={`render-${component}`}
                  className={styles.codeIndentXL}
                  data-code-line
                >
                  &lt;
                  <span className={styles.codeComponent}>{component}</span>{" "}
                  /&gt;
                </div>
              ))}

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;/section&gt;
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
              <span className={styles.previewEyebrow} data-preview-part>
                {parentComponent.toUpperCase()}
              </span>

              <div className={styles.previewCard} data-preview-part>
                <span>AVATAR COMPONENT</span>
                <strong>🤖</strong>
              </div>

              <div className={styles.previewCard} data-preview-part>
                <span>PLAYER INFO COMPONENT</span>
                <strong>Explorer</strong>
                <small>React Nexus</small>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.reuseFlow}>
          <div className={`${styles.reuseNode} ${styles.reuseSource}`}>
            <span>SMALL COMPONENTS</span>
            <strong>{components.join(" + ")}</strong>
          </div>

          <div className={styles.reuseArrow}>→</div>

          <div className={styles.packetTrack} data-composition-track>
            <span className={styles.dataPacket} data-composition-packet>
              COMPOSE
            </span>
          </div>

          <div className={styles.reuseArrow}>→</div>

          <div className={styles.reuseNode}>
            <span>COMPLETE UI</span>
            <strong>{parentComponent}</strong>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Focus</strong>
              <p>Each component does one small job.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Combine</strong>
              <p>A parent renders multiple child components.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Scale</strong>
              <p>Small pieces make large interfaces easier to manage.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Component composition assembled
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>SMALL COMPONENTS → COMPOSITION → COMPLETE INTERFACE</span>
      </div>
    </section>
  );
}

export default ReactCompositionNexusAnimation;
