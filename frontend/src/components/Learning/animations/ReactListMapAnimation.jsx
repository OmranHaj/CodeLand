import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactListMapAnimation({
  arrayName = "skills",
  items = ["HTML", "CSS", "JavaScript", "React"],
  element = "li",
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

    const codePanel = root.querySelector("[data-code-panel]");
    const codeLines = root.querySelectorAll("[data-code-line]");
    const mapExpression = root.querySelector("[data-map-expression]");

    const arrayNode = root.querySelector("[data-array-node]");
    const arrayItems = root.querySelectorAll("[data-array-item]");

    const mapCore = root.querySelector("[data-map-core]");

    const renderTrack = root.querySelector("[data-render-track]");
    const renderPacket = root.querySelector("[data-render-packet]");

    const preview = root.querySelector("[data-preview]");
    const previewItems = root.querySelectorAll("[data-preview-item]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · REACT RECEIVES AN ARRAY";

    gsap.set(status, {
      opacity: 0,
      y: -8,
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

    gsap.set(mapExpression, {
      opacity: 0.25,
      scale: 0.82,
    });

    gsap.set(arrayNode, {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(arrayItems, {
      opacity: 0,
      y: 8,
      scale: 0.82,
    });

    gsap.set(mapCore, {
      opacity: 0,
      scale: 0.72,
    });

    gsap.set(renderTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(renderPacket, {
      opacity: 0,
      scale: 0.7,
      x: -42,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewItems, {
      opacity: 0,
      x: -10,
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
      status.textContent = "LIST RENDER COMPLETE";

      gsap.set(
        [
          status,
          codePanel,
          codeLines,
          mapExpression,
          arrayNode,
          arrayItems,
          mapCore,
          renderTrack,
          renderPacket,
          preview,
          previewItems,
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

      /* ARRAY */

      .to(
        arrayNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.42,
          ease: "back.out(1.7)",
        },
        0.08,
      )

      .to(
        arrayItems,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.34,
          stagger: 0.09,
          ease: "back.out(1.6)",
        },
        "-=0.18",
      )

      /* CODE */

      .call(() => {
        status.textContent = "STEP 02 · MAP LOOPS THROUGH THE ARRAY";
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

      .to(
        mapExpression,
        {
          opacity: 1,
          scale: 1.1,
          duration: 0.25,
          ease: "back.out(1.8)",
        },
        "-=0.1",
      )

      .to(mapExpression, {
        scale: 1,
        duration: 0.18,
      })

      /* MAP ENGINE */

      .call(() => {
        status.textContent = "STEP 03 · EACH ITEM BECOMES JSX";
      })

      .to(mapCore, {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.8)",
      })

      .to(mapCore, {
        scale: 1.12,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
      })

      /* OUTPUT FLOW */

      .to(renderTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
        ease: "power2.inOut",
      })

      .to(
        renderPacket,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.46,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      /* PREVIEW */

      .call(() => {
        status.textContent = "STEP 04 · REACT RENDERS EVERY ELEMENT";
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
          x: 0,
          scale: 1,
          duration: 0.36,
          stagger: 0.11,
          ease: "back.out(1.6)",
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
        status.textContent = "LIST RENDER COMPLETE";
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
  }, [arrayName, items, element]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="React list rendering visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>MAP MATRIX</span>
          <strong>Turn arrays into interface</strong>
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
          STEP 01 · REACT RECEIVES AN ARRAY
        </div>

        <div className={styles.jsxWorkspace}>
          {/* ARRAY */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>DATA ARRAY</span>
                <strong>{arrayName}</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div
                className={`${styles.node} ${styles.appNode}`}
                data-array-node
              >
                <Code2 size={14} />

                <div>
                  <span>ARRAY</span>
                  <strong>{arrayName}</strong>
                </div>
              </div>

              <div className={styles.reuseCopies}>
                {items.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={styles.reuseNode}
                    data-array-item
                  >
                    <span>[{index}]</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>

              <div className={styles.compiler} data-map-core>
                <Cpu size={21} />
                <strong>map</strong>
              </div>

              <div className={styles.packetTrack} data-render-track>
                <span className={styles.dataPacket} data-render-packet>
                  JSX
                </span>
              </div>
            </div>
          </div>

          {/* CODE */}

          <div className={styles.codePanel} data-code-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>LIST JSX</span>
                <strong>Skills.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-code-line>
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>{arrayName}</span> = [
              </div>

              {items.slice(0, 4).map((item) => (
                <div key={item} className={styles.codeIndent} data-code-line>
                  <span className={styles.codeString}>"{item}"</span>,
                </div>
              ))}

              <div data-code-line>];</div>

              <div className={styles.codeSpacer} data-code-line />

              <div data-code-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>Skills</span>() {"{"}
              </div>

              <div className={styles.codeIndent} data-code-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;ul&gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                <span className={styles.expression} data-map-expression>
                  {"{"}
                  {arrayName}.map((item) =&gt; (
                </span>
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                &lt;{element} key={"{item}"}&gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                {"{"}item{"}"}
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                &lt;/{element}&gt;
              </div>

              <div className={styles.codeIndentXL} data-code-line>
                )){"}"}
              </div>

              <div className={styles.codeIndentLarge} data-code-line>
                &lt;/ul&gt;
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
              <span className={styles.previewEyebrow}>RENDERED LIST</span>

              {items.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className={styles.previewCard}
                  data-preview-item
                >
                  <span>ITEM {index + 1}</span>
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Array</strong>
              <p>Start with a collection of data.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Map</strong>
              <p>Transform each item into JSX.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Render</strong>
              <p>React displays every generated element.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          Array transformed into UI
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>ARRAY → MAP → JSX ELEMENTS → RENDERED LIST</span>
      </div>
    </section>
  );
}

export default ReactListMapAnimation;
