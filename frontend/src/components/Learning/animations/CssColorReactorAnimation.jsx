import { useLayoutEffect, useRef } from "react";
import { Check, Droplets, Palette, RotateCcw, Sparkles } from "lucide-react";
import gsap from "gsap";

import styles from "./CssColorReactorAnimation.module.css";

function CssColorReactorAnimation({
  colorName = "cyan",
  hex = "#46dfff",
  rgb = "rgb(70, 223, 255)",
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

    const sourceCards = root.querySelectorAll("[data-color-source]");

    const sourceValues = root.querySelectorAll("[data-color-value]");

    const reactor = root.querySelector("[data-reactor]");

    const reactorRing = root.querySelector("[data-reactor-ring]");

    const reactorCore = root.querySelector("[data-reactor-core]");

    const particles = root.querySelectorAll("[data-particle]");

    const beam = root.querySelector("[data-color-beam]");

    const preview = root.querySelector("[data-preview]");

    const previewHeading = root.querySelector("[data-preview-heading]");

    const previewCard = root.querySelector("[data-preview-card]");

    const swatches = root.querySelectorAll("[data-swatch]");

    const resultBadge = root.querySelector("[data-result-badge]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(sourceCards, {
      opacity: 0,
      y: 20,
      scale: 0.94,
    });

    gsap.set(sourceValues, {
      opacity: 0,
      x: -10,
    });

    gsap.set(reactor, {
      opacity: 0,
      scale: 0.7,
    });

    gsap.set(reactorRing, {
      rotate: -45,
    });

    gsap.set(reactorCore, {
      scale: 0.65,
      opacity: 0,
    });

    gsap.set(particles, {
      opacity: 0,
      scale: 0.4,
    });

    gsap.set(beam, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    gsap.set(preview, {
      opacity: 0,
      x: 32,
      scale: 0.94,
      filter: "brightness(0.55)",
    });

    gsap.set(previewCard, {
      opacity: 0,
      y: 14,
      scale: 0.96,
    });

    gsap.set(previewHeading, {
      opacity: 0,
      y: 14,
    });

    gsap.set(swatches, {
      opacity: 0,
      y: 10,
      scale: 0.8,
    });

    gsap.set(resultBadge, {
      opacity: 0,
      y: 8,
      scale: 0.85,
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
      /* COLOR FORMATS */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.25,
      })

      .call(() => {
        status.textContent = "STEP 01 · IDENTIFYING COLOR VALUES";
      })

      .to(sourceCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.16,
      })

      .to(
        sourceValues,
        {
          opacity: 1,
          x: 0,
          duration: 0.32,
          stagger: 0.12,
        },
        "-=0.45",
      )

      /* -------------------------------------------------- */
      /* REACTOR */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · FEEDING COLOR REACTOR";
      })

      .to(reactor, {
        opacity: 1,
        scale: 1,
        duration: 0.55,
        ease: "back.out(1.7)",
      })

      .to(
        reactorRing,
        {
          rotate: 0,
          duration: 0.7,
        },
        "-=0.4",
      )

      .to(
        reactorCore,
        {
          opacity: 1,
          scale: 1,
          duration: 0.42,
          ease: "back.out(2)",
        },
        "-=0.38",
      )

      .to(
        particles,
        {
          opacity: 1,
          scale: 1,
          duration: 0.28,
          stagger: 0.08,
        },
        "-=0.22",
      )

      /* -------------------------------------------------- */
      /* OUTPUT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 03 · APPLYING COLOR";
      })

      .to(beam, {
        scaleX: 1,
        duration: 0.9,
        ease: "power2.inOut",
      })

      .to(
        preview,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "brightness(1)",
          duration: 0.72,
        },
        "-=0.25",
      )

      .to(previewCard, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
      })

      .to(
        previewHeading,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
        },
        "-=0.22",
      )

      .call(() => {
        status.textContent = "STEP 04 · BUILDING COLOR PALETTE";
      })

      .to(swatches, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.32,
        stagger: 0.1,
      })

      .to(
        previewCard,
        {
          scale: 1.025,
          duration: 0.18,
          yoyo: true,
          repeat: 1,
        },
        "-=0.12",
      )

      .call(() => {
        status.textContent = "COLOR SYSTEM READY";
      })

      .to(resultBadge, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
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
  }, [colorName, hex, rgb, background]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="CSS color reactor animation"
      style={{
        "--reactor-color": hex,
        "--reactor-background": background,
      }}
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>COLOR REACTOR</span>

          <strong>Different values. Same visual color.</strong>
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

        <div className={styles.status} data-status>
          STEP 01 · IDENTIFYING COLOR VALUES
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* COLOR INPUTS */}
          {/* ============================================== */}

          <div className={styles.sources}>
            <div className={styles.sectionHeading}>
              <span>INPUT</span>

              <strong>CSS Color Formats</strong>
            </div>

            <div className={styles.sourceCard} data-color-source>
              <div
                className={styles.sourceIcon}
                style={{
                  background: colorName,
                }}
              />

              <div>
                <small>COLOR NAME</small>

                <strong data-color-value>{colorName}</strong>
              </div>
            </div>

            <div className={styles.sourceCard} data-color-source>
              <div
                className={styles.sourceIcon}
                style={{
                  background: hex,
                }}
              />

              <div>
                <small>HEX</small>

                <strong data-color-value>{hex}</strong>
              </div>
            </div>

            <div className={styles.sourceCard} data-color-source>
              <div
                className={styles.sourceIcon}
                style={{
                  background: rgb,
                }}
              />

              <div>
                <small>RGB</small>

                <strong data-color-value>{rgb}</strong>
              </div>
            </div>

            <div className={styles.codeHint}>
              <Palette size={14} />

              <code>color: {hex};</code>
            </div>
          </div>

          {/* ============================================== */}
          {/* REACTOR */}
          {/* ============================================== */}

          <div className={styles.reactorZone}>
            <div className={styles.reactorLabel}>
              <span>CSS ENGINE</span>

              <strong>Color Reactor</strong>
            </div>

            <div className={styles.reactor} data-reactor>
              <span className={styles.reactorOuterRing} data-reactor-ring />

              <span className={styles.reactorMiddleRing} />

              <div className={styles.reactorCore} data-reactor-core>
                <Droplets size={21} />

                <strong>COLOR</strong>
              </div>

              <i className={styles.particleOne} data-particle />

              <i className={styles.particleTwo} data-particle />

              <i className={styles.particleThree} data-particle />

              <i className={styles.particleFour} data-particle />
            </div>

            <div className={styles.reactorProperties}>
              <span>TEXT</span>

              <span>BACKGROUND</span>

              <span>BORDER</span>
            </div>

            <div className={styles.energyFlow}>
              <span>VALUE</span>

              <div className={styles.beamTrack}>
                <div className={styles.beam} data-color-beam />

                <i />

                <i />

                <i />
              </div>

              <span>STYLE</span>
            </div>
          </div>

          {/* ============================================== */}
          {/* PREVIEW */}
          {/* ============================================== */}

          <div className={styles.previewZone}>
            <div className={styles.sectionHeading}>
              <span>OUTPUT</span>

              <strong>Browser Result</strong>
            </div>

            <div className={styles.browser} data-preview>
              <div className={styles.browserBar}>
                <div>
                  <i />
                  <i />
                  <i />
                </div>

                <span>colors.codeland</span>
              </div>

              <div
                className={styles.browserBody}
                style={{
                  background,
                }}
              >
                <div
                  className={styles.previewGlow}
                  style={{
                    background: hex,
                  }}
                />

                <span className={styles.previewBadge}>LIVE CSS</span>

                <div className={styles.previewCard} data-preview-card>
                  <small>COLOR SYSTEM</small>

                  <h2
                    data-preview-heading
                    style={{
                      color: hex,
                    }}
                  >
                    Code Explorer
                  </h2>

                  <p>Color creates mood, contrast, and visual hierarchy.</p>

                  <button
                    type="button"
                    style={{
                      background: hex,
                    }}
                  >
                    Explore
                  </button>
                </div>

                <div className={styles.palette}>
                  <span
                    data-swatch
                    style={{
                      background: hex,
                    }}
                  />

                  <span
                    data-swatch
                    style={{
                      background: background,
                    }}
                  />

                  <span
                    data-swatch
                    style={{
                      background: "#ffffff",
                    }}
                  />

                  <span
                    data-swatch
                    style={{
                      background: "#7666ff",
                    }}
                  />
                </div>

                <div className={styles.resultBadge} data-result-badge>
                  <Check size={12} />
                  Palette applied
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>NAME</span>

          <div>
            <strong>Easy to read</strong>

            <p>
              CSS includes built-in color names such as blue, red, and cyan.
            </p>
          </div>
        </div>

        <div>
          <span>HEX</span>

          <div>
            <strong>Precise colors</strong>

            <p>HEX values give designers exact control over a color.</p>
          </div>
        </div>

        <div>
          <span>RGB</span>

          <div>
            <strong>Light channels</strong>

            <p>RGB mixes red, green, and blue values to create a color.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Sparkles size={13} />

        <span>COLOR CREATES MOOD · CONTRAST · HIERARCHY</span>
      </div>
    </section>
  );
}

export default CssColorReactorAnimation;
