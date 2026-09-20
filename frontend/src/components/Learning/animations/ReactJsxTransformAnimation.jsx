import { useLayoutEffect, useRef } from "react";
import { Check, Code2, Cpu, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./ReactNexusAnimations.module.css";

function ReactJsxTransformAnimation({
  variableName = "name",
  variableValue = "Maya",
  element = "h2",
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

    const jsxPanel = root.querySelector("[data-jsx-panel]");
    const jsxLines = root.querySelectorAll("[data-jsx-line]");

    const expression = root.querySelector("[data-expression]");

    const compiler = root.querySelector("[data-compiler]");
    const compilerRings = root.querySelectorAll("[data-compiler-ring]");

    const packet = root.querySelector("[data-packet]");
    const packetTrack = root.querySelector("[data-packet-track]");

    const reactNode = root.querySelector("[data-react-node]");
    const domNode = root.querySelector("[data-dom-node]");

    const preview = root.querySelector("[data-preview]");
    const previewText = root.querySelector("[data-preview-text]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");
    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    status.textContent = "STEP 01 · JSX ENTERS THE PIPELINE";

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(jsxPanel, {
      opacity: 0,
      x: -22,
      scale: 0.96,
    });

    gsap.set(jsxLines, {
      opacity: 0.28,
      x: -8,
    });

    gsap.set(expression, {
      opacity: 0.25,
      scale: 0.8,
    });

    gsap.set(compiler, {
      opacity: 0,
      scale: 0.76,
    });

    gsap.set(compilerRings, {
      opacity: 0,
      scale: 0.7,
      rotation: -25,
    });

    gsap.set(packetTrack, {
      opacity: 0,
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(packet, {
      opacity: 0,
      scale: 0.72,
      x: -44,
    });

    gsap.set([reactNode, domNode], {
      opacity: 0,
      scale: 0.78,
      y: 10,
    });

    gsap.set(preview, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(previewText, {
      opacity: 0.15,
      y: 8,
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
      status.textContent = "JSX TRANSFORMATION COMPLETE";

      gsap.set(
        [
          status,
          jsxPanel,
          jsxLines,
          expression,
          compiler,
          compilerRings,
          packetTrack,
          packet,
          reactNode,
          domNode,
          preview,
          previewText,
          summaryCards,
          completeBadge,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
          rotation: 0,
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
      /* JSX */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.25,
      })

      .to(
        jsxPanel,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
        },
        0.08,
      )

      .to(
        jsxLines,
        {
          opacity: 1,
          x: 0,
          duration: 0.26,
          stagger: 0.07,
        },
        "-=0.24",
      )

      /* EXPRESSION */

      .call(() => {
        status.textContent = "STEP 02 · JAVASCRIPT EXPRESSION IS READ";
      })

      .to(expression, {
        opacity: 1,
        scale: 1.12,
        duration: 0.25,
        ease: "back.out(1.8)",
      })

      .to(expression, {
        scale: 1,
        duration: 0.2,
      })

      /* COMPILER */

      .call(() => {
        status.textContent = "STEP 03 · JSX BECOMES REACT INSTRUCTIONS";
      })

      .to(compiler, {
        opacity: 1,
        scale: 1,
        duration: 0.48,
        ease: "back.out(1.7)",
      })

      .to(
        compilerRings,
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.52,
          stagger: 0.08,
        },
        "-=0.3",
      )

      /* PACKET */

      .to(packetTrack, {
        opacity: 1,
        scaleX: 1,
        duration: 0.42,
      })

      .to(
        packet,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        "-=0.32",
      )

      /* REACT TREE */

      .call(() => {
        status.textContent = "STEP 04 · REACT BUILDS THE UI TREE";
      })

      .to(reactNode, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      })

      .to(
        domNode,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        "-=0.2",
      )

      /* PREVIEW */

      .call(() => {
        status.textContent = "STEP 05 · THE BROWSER SHOWS THE RESULT";
      })

      .to(preview, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.48,
      })

      .to(
        previewText,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.42,
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
        status.textContent = "JSX TRANSFORMATION COMPLETE";
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
  }, [variableName, variableValue, element]);

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="JSX transformation visual explanation"
    >
      <div className={styles.topBar}>
        <div className={styles.topIdentity}>
          <span>JSX PIPELINE</span>
          <strong>JavaScript meets markup</strong>
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
          STEP 01 · JSX ENTERS THE PIPELINE
        </div>

        <div className={styles.jsxWorkspace}>
          {/* JSX SOURCE */}

          <div className={styles.codePanel} data-jsx-panel>
            <div className={styles.panelHeading}>
              <Code2 size={14} />

              <div>
                <span>JSX SOURCE</span>
                <strong>Greeting.jsx</strong>
              </div>
            </div>

            <div className={styles.codeBlock}>
              <div data-jsx-line>
                <span className={styles.codeKeyword}>const</span>{" "}
                <span className={styles.codeVariable}>{variableName}</span> ={" "}
                <span className={styles.codeString}>"{variableValue}"</span>;
              </div>

              <div className={styles.codeSpacer} data-jsx-line />

              <div data-jsx-line>
                <span className={styles.codeKeyword}>function</span>{" "}
                <span className={styles.codeFunction}>Greeting</span>() {"{"}
              </div>

              <div className={styles.codeIndent} data-jsx-line>
                <span className={styles.codeKeyword}>return</span> (
              </div>

              <div className={styles.codeIndentLarge} data-jsx-line>
                &lt;{element}&gt;Hello{" "}
                <span className={styles.expression} data-expression>
                  {"{"}
                  {variableName}
                  {"}"}
                </span>
                &lt;/{element}&gt;
              </div>

              <div className={styles.codeIndent} data-jsx-line>
                );
              </div>

              <div data-jsx-line>{"}"}</div>
            </div>
          </div>

          {/* PIPELINE */}

          <div className={styles.pipelinePanel}>
            <div className={styles.panelHeading}>
              <Cpu size={14} />

              <div>
                <span>TRANSFORMATION</span>
                <strong>React Pipeline</strong>
              </div>
            </div>

            <div className={styles.pipelineStage}>
              <div className={styles.compiler} data-compiler>
                <span
                  className={`${styles.compilerRing} ${styles.compilerRingOuter}`}
                  data-compiler-ring
                />

                <span
                  className={`${styles.compilerRing} ${styles.compilerRingInner}`}
                  data-compiler-ring
                />

                <Cpu size={24} />

                <strong>JSX</strong>
              </div>

              <div className={styles.packetTrack} data-packet-track>
                <span className={styles.dataPacket} data-packet>
                  UI DATA
                </span>
              </div>

              <div className={styles.pipelineNodes}>
                <div className={styles.pipelineNode} data-react-node>
                  <span>REACT</span>
                  <strong>Element Tree</strong>
                </div>

                <div className={styles.pipelineArrow}>→</div>

                <div className={styles.pipelineNode} data-dom-node>
                  <span>BROWSER</span>
                  <strong>DOM Output</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RESULT */}

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
              <span className={styles.previewEyebrow}>RENDERED JSX</span>

              <h3 data-preview-text>Hello {variableValue}</h3>

              <p>
                JavaScript supplied the value.
                <br />
                JSX described where it belongs.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryCard} data-summary-card>
            <span>01</span>

            <div>
              <strong>Markup</strong>
              <p>JSX describes the interface.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>02</span>

            <div>
              <strong>Expression</strong>
              <p>Curly braces insert JavaScript values.</p>
            </div>
          </div>

          <div className={styles.summaryCard} data-summary-card>
            <span>03</span>

            <div>
              <strong>Render</strong>
              <p>React turns the description into UI.</p>
            </div>
          </div>
        </div>

        <div className={styles.completeBadge} data-complete>
          <Check size={12} />
          JSX rendered successfully
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>JAVASCRIPT + JSX → REACT TREE → BROWSER UI</span>
      </div>
    </section>
  );
}

export default ReactJsxTransformAnimation;
