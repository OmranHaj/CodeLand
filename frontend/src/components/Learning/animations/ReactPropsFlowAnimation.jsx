import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactPropsFlowAnimation({
  parentName = "App",
  childName = "PlayerCard",
  propName = "name",
  propValue = "Lina",
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

    const parentNode = root.querySelector("[data-parent]");
    const childNode = root.querySelector("[data-child]");

    const propTrack = root.querySelector("[data-prop-track]");
    const propPacket = root.querySelector("[data-prop-packet]");

    const codePanel = root.querySelector("[data-code-panel]");
    const codeLines = root.querySelectorAll("[data-code-line]");
    const propExpression = root.querySelector("[data-prop-expression]");

    const preview = root.querySelector("[data-preview]");
    const previewValue = root.querySelector("[data-preview-value]");

    const reuseCards = root.querySelectorAll("[data-reuse-card]");
    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · PARENT OWNS THE DATA";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(parentNode, {
      opacity: 0,
      scale: 0.78,
      x: -14,
    });

    gsap.set(childNode, {
      opacity: 0,
      scale: 0.78,
      x: 14,
    });

    gsap.set(propTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(propPacket, {
      opacity: 0,
      scale: 0.7,
      x: -44,
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

    gsap.set(propExpression, {
      opacity: 0.25,
      scale: 0.8,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewValue, {
      opacity: 0,
      scale: 0.78,
      y: 8,
    });

    gsap.set(reuseCards, {
      opacity: 0,
      scale: 0.82,
      y: 10,
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
      status.textContent = "PROP FLOW COMPLETE";

      gsap.set(
        [
          status,
          parentNode,
          childNode,
          propTrack,
          propPacket,
          codePanel,
          codeLines,
          propExpression,
          preview,
          previewValue,
          reuseCards,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
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

      /* PARENT */

      .to(
        parentNode,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.45,
          ease: "back.out(1.7)",
        },
        0.08,
      )

      /* PROP SIGNAL */

      .call(() => {
        status.textContent = "STEP 02 · PROP TRAVELS FROM PARENT TO CHILD";
      })

      .to(propTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.44,
        ease: "power2.inOut",
      })

      .to(
        propPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.48,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      .to(
        childNode,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.7)",
        },
        "-=0.12",
      )

      /* CODE */

      .call(() => {
        status.textContent = "STEP 03 · CHILD READS THE PROP";
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

      .to(propExpression, {
        opacity: 1,
        scale: 1.12,
        duration: 0.24,
        ease: "back.out(1.8)",
      })

      .to(propExpression, {
        scale: 1,
        duration: 0.18,
      })

      /* RENDER */

      .call(() => {
        status.textContent = "STEP 04 · PROP BECOMES VISIBLE UI";
      })

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        previewValue,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      /* REUSE */

      .call(() => {
        status.textContent = "STEP 05 · SAME COMPONENT · DIFFERENT PROPS";
      })

      .to(reuseCards, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.11,
        ease: "back.out(1.65)",
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.35,
        stagger: 0.09,
      })

      .call(() => {
        status.textContent = "PROP FLOW COMPLETE";
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
  }, [parentName, childName, propName, propValue]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React props data flow visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>PROP CHANNEL</span>
          <strong>Pass information into components</strong>
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
          STEP 01 · PARENT OWNS THE DATA
        </div>

        <div className={styles.jsxWorkspace}>
          {/* DATA FLOW */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>ONE-WAY DATA FLOW</span>
                <strong>Parent → Child</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={`${styles.node} ${styles.appNode}`} data-parent>
                <Cpu size={15} />

                <div>
                  <span>PARENT</span>
                  <strong>{parentName}</strong>
                </div>
              </div>

              <div className={styles.packetTrack} data-prop-track>
                <span className={styles.dataPacket} data-prop-packet>
                  {propName}="{propValue}"
                </span>
              </div>

              <div className={styles.node} data-child>
                <Code2 size={14} />

                <div>
                  <span>CHILD</span>
                  <strong>{childName}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>PROPS IN JSX</span>
                <strong>{childName}.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>{childName}</span>({"{"}{" "}
                {propName} {"}"}) {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> &lt;h2&gt;
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                <span className={styles.expression} data-prop-expression>
                  {"{"}
                  {propName}
                  {"}"}
                </span>
              </div>

              <div className={styles.codeIndent} data-code-line>
                &lt;/h2&gt;;
              </div>

              <div data-code-line>{"}"}</div>

              <div className={styles.codeSpacer} data-code-line />

              <div data-code-line>
                &lt;
                <span className={styles.codeComponent}>{childName}</span>
              </div>

              <div className={styles.codeIndent} data-code-line>
                {propName}=
                <span className={styles.codeString}>"{propValue}"</span>
              </div>

              <div data-code-line>/&gt;</div>
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
              <span className={styles.previewEyebrow}>
                {childName.toUpperCase()}
              </span>

              <div className={styles.previewCard}>
                <span>PROP RECEIVED</span>

                <strong data-preview-value>{propValue}</strong>

                <small>{propName} → rendered successfully</small>
              </div>
            </div>
          </div>
        </div>

        {/* SAME COMPONENT WITH DIFFERENT DATA */}

        <div className={styles.reuseFlow}>
          <div className={`${styles.reuseNode} ${styles.reuseSource}`}>
            <span>COMPONENT</span>
            <strong>{childName}</strong>
          </div>

          <div className={styles.reuseArrow}>→</div>

          <div className={styles.reuseCopies}>
            {["Lina", "Maya", "Alex"].map((name) => (
              <div key={name} className={styles.reuseNode} data-reuse-card>
                <span>{propName}</span>
                <strong>{name}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Parent</strong>
              <p>The parent provides the value.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Prop</strong>
              <p>The value travels into the child.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Child</strong>
              <p>The component renders that value.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          One-way prop channel connected
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>PARENT DATA → PROP → CHILD COMPONENT → UI</span>
      </div>
    </section>
  );
}

export default ReactPropsFlowAnimation;
