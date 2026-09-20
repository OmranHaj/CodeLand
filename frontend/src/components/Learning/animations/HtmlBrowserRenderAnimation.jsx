import { useLayoutEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import gsap from "gsap";

import styles from "./HtmlBrowserRenderAnimation.module.css";

function HtmlBrowserRenderAnimation({
  heading = "Hello CodeLand!",
  paragraph = "This is my first web page.",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const codeLines = root.querySelectorAll("[data-code-line]");
    const beam = root.querySelector("[data-beam]");
    const status = root.querySelector("[data-status]");
    const browser = root.querySelector("[data-browser]");
    const headingNode = root.querySelector("[data-heading]");
    const paragraphNode = root.querySelector("[data-paragraph]");

    gsap.set(codeLines, { opacity: 0, x: -18 });
    gsap.set(beam, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(browser, { opacity: 0, x: 24, scale: 0.97 });
    gsap.set([headingNode, paragraphNode], { opacity: 0, y: 18 });
    gsap.set(status, { opacity: 0 });

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    timeline
      .to(status, { opacity: 1, duration: 0.25 })
      .call(() => {
        status.textContent = "READING HTML";
      })
      .to(codeLines, {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.18,
      })
      .call(() => {
        status.textContent = "BUILDING PAGE";
      })
      .to(beam, {
        scaleX: 1,
        duration: 0.8,
        ease: "power2.inOut",
      })
      .to(
        browser,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.7,
        },
        "-=0.25",
      )
      .to(headingNode, {
        opacity: 1,
        y: 0,
        duration: 0.45,
      })
      .to(
        paragraphNode,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
        },
        "-=0.2",
      )
      .call(() => {
        status.textContent = "PAGE READY";
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
  }, [heading, paragraph]);

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div>
          <span>VISUAL EXPLAINER</span>
          <strong>HTML becomes a webpage</strong>
        </div>

        <button type="button" onClick={playAnimation}>
          <RotateCcw size={14} />
          Replay
        </button>
      </div>

      <div className={styles.stage}>
        <div className={styles.grid} />

        <div className={styles.status} data-status>
          READING HTML
        </div>

        <div className={styles.flowGrid}>
          <div className={styles.codePanel}>
            <div className={styles.panelLabel}>HTML CODE</div>

            <pre>
              <code>
                <span data-code-line>{`<h1>${heading}</h1>`}</span>
                <span data-code-line>{`<p>${paragraph}</p>`}</span>
              </code>
            </pre>
          </div>

          <div className={styles.processor}>
            <span>Browser reads the code</span>
            <div className={styles.beamTrack}>
              <div className={styles.beam} data-beam />
            </div>
            <small>PARSE → BUILD → RENDER</small>
          </div>

          <div className={styles.browser} data-browser>
            <div className={styles.browserBar}>
              <div>
                <i />
                <i />
                <i />
              </div>
              <span>preview.codeland</span>
            </div>

            <div className={styles.browserBody}>
              <h1 data-heading>{heading}</h1>
              <p data-paragraph>{paragraph}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>01</span>
          <p>You write HTML instructions.</p>
        </div>
        <div>
          <span>02</span>
          <p>The browser reads the structure.</p>
        </div>
        <div>
          <span>03</span>
          <p>The browser renders a visible page.</p>
        </div>
      </div>
    </section>
  );
}

export default HtmlBrowserRenderAnimation;
