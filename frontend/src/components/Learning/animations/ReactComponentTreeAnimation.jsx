import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactComponentTreeAnimation({
  rootComponent = "Profile",
  childComponents = ["Avatar", "PlayerInfo", "Badge"],
  repeatedComponent = "Badge",
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

    const rootNode = root.querySelector("[data-root-node]");
    const childNodes = root.querySelectorAll("[data-child-node]");
    const connectors = root.querySelectorAll("[data-connector]");

    const codePanel = root.querySelector("[data-code-panel]");
    const codeLines = root.querySelectorAll("[data-code-line]");

    const preview = root.querySelector("[data-preview]");
    const previewParts = root.querySelectorAll("[data-preview-part]");

    const reusableSource = root.querySelector("[data-reusable-source]");
    const reusableCopies = root.querySelectorAll("[data-reusable-copy]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · START WITH ONE COMPONENT";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(rootNode, {
      opacity: 0,
      scale: 0.78,
      y: 12,
    });

    gsap.set(childNodes, {
      opacity: 0,
      scale: 0.72,
      y: 18,
    });

    gsap.set(connectors, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "top center",
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

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewParts, {
      opacity: 0,
      y: 12,
      scale: 0.92,
    });

    gsap.set(reusableSource, {
      opacity: 0,
      scale: 0.82,
    });

    gsap.set(reusableCopies, {
      opacity: 0,
      y: 10,
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
      status.textContent = "COMPONENT TREE ASSEMBLED";

      gsap.set(
        [
          status,
          rootNode,
          childNodes,
          connectors,
          codePanel,
          codeLines,
          preview,
          previewParts,
          reusableSource,
          reusableCopies,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
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

      /* ROOT */

      .to(
        rootNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.46,
          ease: "back.out(1.7)",
        },
        0.08,
      )

      /* CHILDREN */

      .call(() => {
        status.textContent = "STEP 02 · SPLIT THE UI INTO SMALLER PIECES";
      })

      .to(connectors, {
        opacity: 1,
        scaleY: 1,
        duration: 0.34,
        stagger: 0.07,
      })

      .to(
        childNodes,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.18",
      )

      /* CODE */

      .call(() => {
        status.textContent = "STEP 03 · COMPONENTS ARE USED LIKE CUSTOM TAGS";
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
        "-=0.25",
      )

      /* PREVIEW */

      .call(() => {
        status.textContent = "STEP 04 · REACT COMPOSES THE FINAL INTERFACE";
      })

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
          duration: 0.35,
          stagger: 0.1,
          ease: "back.out(1.6)",
        },
        "-=0.2",
      )

      /* REUSE */

      .call(() => {
        status.textContent = "STEP 05 · COMPONENTS CAN BE REUSED";
      })

      .to(reusableSource, {
        opacity: 1,
        scale: 1,
        duration: 0.38,
        ease: "back.out(1.7)",
      })

      .to(
        reusableCopies,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        "-=0.16",
      )

      /* SUMMARY */

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.36,
        stagger: 0.09,
      })

      .call(() => {
        status.textContent = "COMPONENT TREE ASSEMBLED";
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
  }, [rootComponent, childComponents, repeatedComponent]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React component tree visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>COMPONENT NETWORK</span>
          <strong>Small pieces build big apps</strong>
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
          STEP 01 · START WITH ONE COMPONENT
        </div>

        <div className={styles.introWorkspace}>
          {/* TREE */}

          <div className={styles.treePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>COMPONENT TREE</span>
                <strong>{rootComponent}</strong>
              </div>
            </div>

            <div className={styles.treeStage}>
              <div
                className={`${styles.node} ${styles.appNode}`}
                data-root-node
              >
                <Cpu size={16} />

                <div>
                  <span>PARENT</span>
                  <strong>{rootComponent}</strong>
                </div>
              </div>

              <div className={styles.treeBranches}>
                {childComponents.map((component) => (
                  <div className={styles.branch} key={component}>
                    <span className={styles.verticalConnector} data-connector />

                    <div className={styles.node} data-child-node>
                      <Code2 size={13} />

                      <div>
                        <span>CHILD</span>
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
                <span>JSX COMPOSITION</span>
                <strong>{rootComponent}.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{rootComponent}</span>(){" "}
                {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;section&gt;
              </div>

              {childComponents.map((component) => (
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
                PROFILE
              </span>

              <div className={styles.previewCard} data-preview-part>
                <span>AVATAR</span>
                <strong>🤖</strong>
              </div>

              <div className={styles.previewCard} data-preview-part>
                <span>PLAYER INFO</span>
                <strong>Alex</strong>
                <small>React Explorer</small>
              </div>

              <button
                type="button"
                className={styles.previewButton}
                data-preview-part
              >
                Explorer
              </button>
            </div>
          </div>
        </div>

        {/* REUSABILITY */}

        <div className={styles.reuseFlow}>
          <div
            className={`${styles.reuseNode} ${styles.reuseSource}`}
            data-reusable-source
          >
            <span>COMPONENT</span>
            <strong>{repeatedComponent}</strong>
          </div>

          <div className={styles.reuseArrow}>→</div>

          <div className={styles.reuseCopies}>
            {["Explorer", "Builder", "Creator"].map((label) => (
              <div key={label} className={styles.reuseNode} data-reusable-copy>
                <span>INSTANCE</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Divide</strong>
              <p>Split one large interface into smaller pieces.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Compose</strong>
              <p>Render components inside other components.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Reuse</strong>
              <p>Use the same piece throughout the app.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Component architecture online
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>PARENT → CHILD COMPONENTS → COMPOSITION → REUSE</span>
      </div>
    </section>
  );
}

export default ReactComponentTreeAnimation;
