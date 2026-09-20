import { useLayoutEffect, useRef } from "react";
import { Braces, Check, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./CssIntroTransformationAnimation.module.css";

function CssIntroTransformationAnimation({
  heading = "Hello CodeLand!",
  paragraph = "CSS makes websites beautiful.",
  accent = "#46dfff",
  background = "#10172a",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const status = root.querySelector("[data-status]");

    const plainBrowser = root.querySelector("[data-plain-browser]");

    const plainElements = root.querySelectorAll("[data-plain-element]");

    const cssPanel = root.querySelector("[data-css-panel]");

    const cssLines = root.querySelectorAll("[data-css-line]");

    const propertyChips = root.querySelectorAll("[data-property-chip]");

    const beam = root.querySelector("[data-style-beam]");

    const core = root.querySelector("[data-css-core]");

    const styledBrowser = root.querySelector("[data-styled-browser]");

    const styledElements = root.querySelectorAll("[data-styled-element]");

    const completeBadge = root.querySelector("[data-complete]");

    const glow = root.querySelector("[data-glow]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(plainBrowser, {
      opacity: 0,
      x: -32,
      scale: 0.96,
    });

    gsap.set(plainElements, {
      opacity: 0,
      y: 12,
    });

    gsap.set(cssPanel, {
      opacity: 0,
      y: 24,
      scale: 0.96,
    });

    gsap.set(cssLines, {
      opacity: 0,
      x: -18,
    });

    gsap.set(propertyChips, {
      opacity: 0,
      scale: 0.72,
      y: 10,
    });

    gsap.set(beam, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(core, {
      opacity: 0,
      scale: 0.6,
      rotate: -20,
    });

    gsap.set(styledBrowser, {
      opacity: 0,
      x: 35,
      scale: 0.92,
      filter: "brightness(0.55)",
    });

    gsap.set(styledElements, {
      opacity: 0,
      y: 18,
    });

    gsap.set(completeBadge, {
      opacity: 0,
      scale: 0.8,
      y: 8,
    });

    gsap.set(glow, {
      opacity: 0,
      scale: 0.65,
    });

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
      /* HTML */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · LOADING PLAIN HTML";
      })

      .to(plainBrowser, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.65,
      })

      .to(plainElements, {
        opacity: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.14,
      })

      /* -------------------------------------------------- */
      /* CSS CODE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · READING CSS RULES";
      })

      .to(cssPanel, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
      })

      .to(cssLines, {
        opacity: 1,
        x: 0,
        duration: 0.35,
        stagger: 0.12,
      })

      /* -------------------------------------------------- */
      /* PROPERTIES */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · APPLYING PROPERTIES";
      })

      .to(core, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.55,
        ease: "back.out(1.8)",
      })

      .to(
        glow,
        {
          opacity: 0.8,
          scale: 1,
          duration: 0.55,
        },
        "-=0.4",
      )

      .to(propertyChips, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.12,
      })

      /* -------------------------------------------------- */
      /* STYLE BEAM */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 04 · TRANSFORMING THE PAGE";
      })

      .to(beam, {
        scaleX: 1,
        duration: 0.95,
        ease: "power2.inOut",
      })

      /* -------------------------------------------------- */
      /* RESULT */
      /* -------------------------------------------------- */

      .to(
        styledBrowser,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "brightness(1)",
          duration: 0.75,
        },
        "-=0.25",
      )

      .to(styledElements, {
        opacity: 1,
        y: 0,
        duration: 0.42,
        stagger: 0.12,
      })

      .to(
        styledBrowser,
        {
          y: -5,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
        },
        "-=0.1",
      )

      .call(() => {
        status.textContent = "CSS TRANSFORMATION COMPLETE";
      })

      .to(completeBadge, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.7)",
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
  }, [heading, paragraph, accent, background]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS transformation visual explanation"
      style={{
        "--css-accent": accent,
        "--css-background": background,
      }}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>CSS VISUAL ENGINE</span>

          <strong>Watch CSS transform plain HTML</strong>
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

      {/* ================================================== */}
      {/* STAGE */}
      {/* ================================================== */}

      <div className={styles.stage}>
        <div className={styles.grid} />

        <div className={styles.ambientGlow} data-glow />

        <div className={styles.status} data-status>
          STEP 01 · LOADING PLAIN HTML
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* BEFORE */}
          {/* ============================================== */}

          <div className={styles.previewZone}>
            <div className={styles.zoneHeader}>
              <span>INPUT</span>

              <strong>Plain HTML</strong>
            </div>

            <div
              className={`${styles.browser} ${styles.plainBrowser}`}
              data-plain-browser
            >
              <div className={styles.browserBar}>
                <div className={styles.browserDots}>
                  <i />
                  <i />
                  <i />
                </div>

                <span>index.html</span>
              </div>

              <div className={styles.plainBody}>
                <h1 data-plain-element>{heading}</h1>

                <p data-plain-element>{paragraph}</p>

                <button type="button" data-plain-element>
                  Explore
                </button>
              </div>
            </div>

            <div className={styles.stateLabel}>
              <span />
              Browser default styles
            </div>
          </div>

          {/* ============================================== */}
          {/* CSS ENGINE */}
          {/* ============================================== */}

          <div className={styles.engineZone}>
            <div className={styles.cssPanel} data-css-panel>
              <div className={styles.cssPanelHeader}>
                <Braces size={14} />

                <span>CSS RULES</span>
              </div>

              <div className={styles.code}>
                <span data-css-line>
                  <b>.card</b> {"{"}
                </span>

                <span data-css-line>
                  {"  "}
                  <em>background</em>: {background};
                </span>

                <span data-css-line>
                  {"  "}
                  <em>color</em>: white;
                </span>

                <span data-css-line>
                  {"  "}
                  <em>padding</em>: 28px;
                </span>

                <span data-css-line>
                  {"  "}
                  <em>border-radius</em>: 20px;
                </span>

                <span data-css-line>{"}"}</span>

                <span className={styles.codeSpacer} data-css-line />

                <span data-css-line>
                  <b>h1</b> {"{"}
                </span>

                <span data-css-line>
                  {"  "}
                  <em>color</em>: {accent};
                </span>

                <span data-css-line>{"}"}</span>
              </div>
            </div>

            {/* ============================================ */}
            {/* CORE */}
            {/* ============================================ */}

            <div className={styles.engineCoreArea}>
              <div className={styles.engineCore} data-css-core>
                <span className={styles.coreRing} />

                <span className={styles.coreRingInner} />

                <strong>CSS</strong>
              </div>

              <div className={styles.propertyCloud}>
                <span data-property-chip>COLOR</span>

                <span data-property-chip>SPACE</span>

                <span data-property-chip>RADIUS</span>

                <span data-property-chip>STYLE</span>
              </div>
            </div>

            {/* ============================================ */}
            {/* ENERGY PATH */}
            {/* ============================================ */}

            <div className={styles.energyFlow}>
              <span>HTML</span>

              <div className={styles.beamTrack}>
                <div className={styles.styleBeam} data-style-beam />

                <i />

                <i />

                <i />
              </div>

              <span>STYLED UI</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* RESULT */}
          {/* ============================================== */}

          <div className={styles.previewZone}>
            <div className={styles.zoneHeader}>
              <span>OUTPUT</span>

              <strong>Styled Page</strong>
            </div>

            <div
              className={`${styles.browser} ${styles.styledBrowser}`}
              data-styled-browser
            >
              <div className={styles.browserBar}>
                <div className={styles.browserDots}>
                  <i />
                  <i />
                  <i />
                </div>

                <span>preview.codeland</span>
              </div>

              <div className={styles.styledBody}>
                <div className={styles.designGlow} />

                <span className={styles.designBadge}>CSS ACTIVE</span>

                <h1 data-styled-element>{heading}</h1>

                <p data-styled-element>{paragraph}</p>

                <button type="button" data-styled-element>
                  Explore
                </button>

                <div className={styles.completeBadge} data-complete>
                  <Check size={12} />
                  Styled
                </div>
              </div>
            </div>

            <div className={`${styles.stateLabel} ${styles.stateLabelActive}`}>
              <span />
              CSS rules applied
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>01</span>

          <div>
            <strong>Structure</strong>

            <p>HTML creates the content of the page.</p>
          </div>
        </div>

        <div>
          <span>02</span>

          <div>
            <strong>Style Rules</strong>

            <p>CSS properties tell the browser how elements should look.</p>
          </div>
        </div>

        <div>
          <span>03</span>

          <div>
            <strong>Transformation</strong>

            <p>
              The same HTML becomes a completely different visual experience.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>HTML BUILDS IT · CSS STYLES IT</span>
      </div>
    </section>
  );
}

export default CssIntroTransformationAnimation;
