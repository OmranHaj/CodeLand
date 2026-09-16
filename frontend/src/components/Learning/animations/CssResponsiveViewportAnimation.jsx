import { useLayoutEffect, useRef } from "react";
import {
  Check,
  Laptop,
  Maximize2,
  Minimize2,
  Monitor,
  RotateCcw,
  Smartphone,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./CssResponsiveViewportAnimation.module.css";

function CssResponsiveViewportAnimation({ breakpoint = 700 }) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const safeBreakpoint = Math.max(320, Number(breakpoint) || 700);

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const status = root.querySelector("[data-status]");

    const controls = root.querySelector("[data-controls]");

    const controlRows = root.querySelectorAll("[data-control-row]");

    const viewportStage = root.querySelector("[data-viewport-stage]");

    const browser = root.querySelector("[data-browser]");

    const browserShell = root.querySelector("[data-browser-shell]");

    const viewportValue = root.querySelector("[data-viewport-value]");

    const rulerFill = root.querySelector("[data-ruler-fill]");

    const breakpointMarker = root.querySelector("[data-breakpoint-marker]");

    const breakpointSignal = root.querySelector("[data-breakpoint-signal]");

    const desktopBadge = root.querySelector("[data-desktop-badge]");

    const mobileBadge = root.querySelector("[data-mobile-badge]");

    const mediaQuery = root.querySelector("[data-media-query]");

    const mediaQueryLines = root.querySelectorAll("[data-media-line]");

    const cards = root.querySelectorAll("[data-responsive-card]");

    const summaryCards = root.querySelectorAll("[data-summary-card]");

    const completeBadge = root.querySelector("[data-complete]");

    /* ================================================== */
    /* RESET */
    /* ================================================== */

    gsap.set(status, {
      opacity: 0,
      y: -8,
    });

    gsap.set(controls, {
      opacity: 0,
      x: -24,
      scale: 0.96,
    });

    gsap.set(controlRows, {
      opacity: 0.35,
      x: -8,
    });

    gsap.set(viewportStage, {
      opacity: 0,
      y: 18,
      scale: 0.95,
    });

    gsap.set(browserShell, {
      width: "94%",
    });

    gsap.set(browser, {
      opacity: 0,
      scale: 0.96,
    });

    gsap.set(viewportValue, {
      opacity: 0,
      y: -4,
    });

    gsap.set(rulerFill, {
      scaleX: 1,
      transformOrigin: "left center",
    });

    gsap.set(breakpointMarker, {
      opacity: 0,
      scaleY: 0,
      transformOrigin: "bottom center",
    });

    gsap.set(breakpointSignal, {
      opacity: 0,
      scale: 0.8,
      y: 5,
    });

    gsap.set(desktopBadge, {
      opacity: 0,
      scale: 0.85,
    });

    gsap.set(mobileBadge, {
      opacity: 0,
      scale: 0.85,
    });

    gsap.set(mediaQuery, {
      opacity: 0,
      x: 22,
      scale: 0.96,
    });

    gsap.set(mediaQueryLines, {
      opacity: 0.35,
      x: 8,
    });

    gsap.set(cards, {
      opacity: 0,
      y: 14,
      scale: 0.94,
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
      status.textContent = "RESPONSIVE SYSTEM READY";

      viewportValue.textContent = `${safeBreakpoint - 20}px`;

      gsap.set(status, {
        opacity: 1,
        y: 0,
      });

      gsap.set(controls, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(controlRows, {
        opacity: 1,
        x: 0,
      });

      gsap.set(viewportStage, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(browserShell, {
        width: "52%",
      });

      gsap.set(browser, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(viewportValue, {
        opacity: 1,
        y: 0,
      });

      gsap.set(rulerFill, {
        scaleX: 0.52,
      });

      gsap.set(breakpointMarker, {
        opacity: 1,
        scaleY: 1,
      });

      gsap.set(breakpointSignal, {
        opacity: 1,
        scale: 1,
        y: 0,
      });

      gsap.set(desktopBadge, {
        opacity: 0.3,
        scale: 1,
      });

      gsap.set(mobileBadge, {
        opacity: 1,
        scale: 1,
      });

      gsap.set(mediaQuery, {
        opacity: 1,
        x: 0,
        scale: 1,
      });

      gsap.set(mediaQueryLines, {
        opacity: 1,
        x: 0,
      });

      gsap.set(cards, {
        opacity: 1,
        y: 0,
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

    const viewportState = {
      width: 1200,
    };

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline
      /* -------------------------------------------------- */
      /* DESKTOP */
      /* -------------------------------------------------- */

      .to(status, {
        opacity: 1,
        y: 0,
        duration: 0.28,
      })

      .call(() => {
        status.textContent = "STEP 01 · DESKTOP LAYOUT";
      })

      .to(
        controls,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.55,
        },
        0.1,
      )

      .to(
        viewportStage,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
        },
        0.18,
      )

      .to(
        browser,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
        },
        "-=0.25",
      )

      .to(
        cards,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.38,
          stagger: 0.08,
        },
        "-=0.15",
      )

      .to(
        desktopBadge,
        {
          opacity: 1,
          scale: 1,
          duration: 0.32,
          ease: "back.out(1.8)",
        },
        "-=0.25",
      )

      .to(
        viewportValue,
        {
          opacity: 1,
          y: 0,
          duration: 0.25,
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* SHRINK VIEWPORT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 02 · VIEWPORT GETS SMALLER";
      })

      .to(controlRows[0], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        browserShell,
        {
          width: "74%",
          duration: 0.85,
          ease: "power2.inOut",
        },
        "-=0.05",
      )

      .to(
        rulerFill,
        {
          scaleX: 0.74,
          duration: 0.85,
          ease: "power2.inOut",
        },
        "<",
      )

      .to(
        viewportState,
        {
          width: 900,
          duration: 0.85,
          ease: "power2.inOut",

          onUpdate: () => {
            viewportValue.textContent = `${Math.round(viewportState.width)}px`;
          },
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* BREAKPOINT */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 03 · APPROACHING ${safeBreakpoint}px BREAKPOINT`;
      })

      .to(controlRows[1], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        breakpointMarker,
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.5,
          ease: "back.out(1.5)",
        },
        "-=0.05",
      )

      .to(
        browserShell,
        {
          width: "58%",
          duration: 0.9,
          ease: "power2.inOut",
        },
        "-=0.1",
      )

      .to(
        rulerFill,
        {
          scaleX: 0.58,
          duration: 0.9,
          ease: "power2.inOut",
        },
        "<",
      )

      .to(
        viewportState,
        {
          width: safeBreakpoint + 20,
          duration: 0.9,
          ease: "power2.inOut",

          onUpdate: () => {
            viewportValue.textContent = `${Math.round(viewportState.width)}px`;
          },
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* MEDIA QUERY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = `STEP 04 · ${safeBreakpoint}px MEDIA QUERY ACTIVATES`;
      })

      .to(controlRows[2], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        mediaQuery,
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
        },
        "-=0.05",
      )

      .to(mediaQueryLines, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.09,
      })

      .to(
        breakpointSignal,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.36,
          ease: "back.out(1.8)",
        },
        "-=0.15",
      )

      .to(
        browserShell,
        {
          width: "52%",
          duration: 0.55,
          ease: "power2.inOut",
        },
        "-=0.1",
      )

      .to(
        rulerFill,
        {
          scaleX: 0.52,
          duration: 0.55,
          ease: "power2.inOut",
        },
        "<",
      )

      .to(
        viewportState,
        {
          width: safeBreakpoint - 20,
          duration: 0.55,
          ease: "power2.inOut",

          onUpdate: () => {
            viewportValue.textContent = `${Math.round(viewportState.width)}px`;
          },
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* REFLOW */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 05 · LAYOUT REFLOWS FOR SMALL SCREENS";
      })

      .to(controlRows[3], {
        opacity: 1,
        x: 0,
        duration: 0.3,
      })

      .to(
        cards,
        {
          scale: 0.94,
          duration: 0.16,
          stagger: 0.04,
        },
        "-=0.05",
      )

      .set(cards, {
        clearProps: "transform",
      })

      .to(browser, {
        "--responsive-columns": "1fr",
        duration: 0.01,
      })

      .to(cards, {
        scale: 1,
        duration: 0.46,
        stagger: 0.08,
        ease: "back.out(1.6)",
      })

      .to(
        desktopBadge,
        {
          opacity: 0.28,
          scale: 0.92,
          duration: 0.25,
        },
        "-=0.2",
      )

      .to(
        mobileBadge,
        {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.8)",
        },
        "<",
      )

      /* -------------------------------------------------- */
      /* SUMMARY */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "STEP 06 · ONE WEBSITE · MANY SCREEN SIZES";
      })

      .to(summaryCards, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.38,
        stagger: 0.1,
      })

      .to(
        browserShell,
        {
          scale: 1.025,
          duration: 0.16,
          yoyo: true,
          repeat: 1,
        },
        "-=0.05",
      )

      /* -------------------------------------------------- */
      /* COMPLETE */
      /* -------------------------------------------------- */

      .call(() => {
        status.textContent = "RESPONSIVE SYSTEM READY";
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
  }, [safeBreakpoint]);

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="Responsive CSS visual explanation"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.topBarIdentity}>
          <span className={styles.eyebrow}>RESPONSIVE VIEWPORT LAB</span>

          <strong>Watch one layout adapt to different screens</strong>
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
        <div className={styles.backgroundGrid} />

        <div className={styles.status} data-status>
          STEP 01 · DESKTOP LAYOUT
        </div>

        <div className={styles.workspace}>
          {/* ============================================== */}
          {/* CONTROLS */}
          {/* ============================================== */}

          <div className={styles.controlsPanel} data-controls>
            <div className={styles.panelHeader}>
              <Maximize2 size={14} />

              <div>
                <span>RESPONSIVE CSS</span>

                <strong>.cards</strong>
              </div>
            </div>

            <div className={styles.controlList}>
              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Monitor size={13} />
                </div>

                <div>
                  <span>desktop</span>

                  <strong>repeat(3, 1fr)</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Minimize2 size={13} />
                </div>

                <div>
                  <span>breakpoint</span>

                  <strong>{safeBreakpoint}px</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <Smartphone size={13} />
                </div>

                <div>
                  <span>media query</span>

                  <strong>max-width</strong>
                </div>

                <i />
              </div>

              <div className={styles.controlRow} data-control-row>
                <div className={styles.controlIcon}>
                  <LayoutIcon />
                </div>

                <div>
                  <span>mobile layout</span>

                  <strong>1fr</strong>
                </div>

                <i />
              </div>
            </div>

            <div className={styles.mediaQuery} data-media-query>
              <div data-media-line>
                <b>@media</b> (max-width: {safeBreakpoint}px) {"{"}
              </div>

              <div data-media-line>
                {"  "}
                <span>.cards</span> {"{"}
              </div>

              <div data-media-line>
                {"    "}
                <em>grid-template-columns</em>: 1fr;
              </div>

              <div data-media-line>
                {"  "}
                {"}"}
              </div>

              <div data-media-line>{"}"}</div>
            </div>
          </div>

          {/* ============================================== */}
          {/* VIEWPORT */}
          {/* ============================================== */}

          <div className={styles.viewportPanel}>
            <div className={styles.viewportHeader}>
              <div>
                <span>LIVE VIEWPORT</span>

                <strong>Browser Resize Simulator</strong>
              </div>

              <div className={styles.deviceBadges}>
                <span className={styles.desktopBadge} data-desktop-badge>
                  <Laptop size={10} />
                  DESKTOP
                </span>

                <span className={styles.mobileBadge} data-mobile-badge>
                  <Smartphone size={10} />
                  MOBILE
                </span>
              </div>
            </div>

            <div className={styles.viewportStage} data-viewport-stage>
              {/* ========================================== */}
              {/* RULER */}
              {/* ========================================== */}

              <div className={styles.viewportRuler}>
                <div className={styles.rulerTop}>
                  <span>320</span>

                  <span>{safeBreakpoint}</span>

                  <span>1200px</span>
                </div>

                <div className={styles.rulerTrack}>
                  <span className={styles.rulerFill} data-ruler-fill />

                  <span
                    className={styles.breakpointMarker}
                    data-breakpoint-marker
                    style={{
                      left: `${((safeBreakpoint - 320) / (1200 - 320)) * 100}%`,
                    }}
                  >
                    <i />

                    <b>{safeBreakpoint}px</b>
                  </span>
                </div>
              </div>

              {/* ========================================== */}
              {/* BROWSER */}
              {/* ========================================== */}

              <div className={styles.browserShell} data-browser-shell>
                <div
                  className={styles.browser}
                  data-browser
                  style={{
                    "--responsive-columns": "repeat(3, minmax(0, 1fr))",
                  }}
                >
                  <div className={styles.browserBar}>
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>

                    <span>responsive.codeland</span>

                    <strong data-viewport-value>1200px</strong>
                  </div>

                  <div className={styles.browserBody}>
                    <div className={styles.hero}>
                      <span>RESPONSIVE WORLD</span>

                      <h3>
                        Build once.
                        <br />
                        Adapt everywhere.
                      </h3>

                      <p>Resize the viewport and watch the layout respond.</p>
                    </div>

                    <div className={styles.cards}>
                      {["Learn", "Build", "Create"].map((item, index) => (
                        <article key={item} data-responsive-card>
                          <span>0{index + 1}</span>

                          <strong>{item}</strong>

                          <p>Responsive content</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.breakpointSignal} data-breakpoint-signal>
                <Smartphone size={12} />

                <span>MEDIA QUERY ACTIVE</span>
              </div>

              <div className={styles.completeBadge} data-complete>
                <Check size={12} />
                Layout adapted successfully
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* SUMMARY */}
          {/* ============================================== */}

          <div className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span>RESPONSIVE FLOW</span>

              <strong>What happens?</strong>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>01</span>

              <div>
                <strong>Viewport</strong>

                <p>The browser gives your page available screen space.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>02</span>

              <div>
                <strong>Breakpoint</strong>

                <p>A breakpoint defines when the design should change.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>03</span>

              <div>
                <strong>Media Query</strong>

                <p>CSS activates different rules when the condition matches.</p>
              </div>
            </div>

            <div className={styles.summaryCard} data-summary-card>
              <span>04</span>

              <div>
                <strong>Reflow</strong>

                <p>Content rearranges to stay readable on smaller screens.</p>
              </div>
            </div>

            <div className={styles.summarySignal}>
              <Sparkles size={13} />

              <span>SAME CONTENT · SMARTER LAYOUT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* EXPLANATION */}
      {/* ================================================== */}

      <div className={styles.explanation}>
        <div>
          <span>WIDTH</span>

          <div>
            <strong>Screen space changes</strong>

            <p>A website can be viewed on wide desktops and narrow phones.</p>
          </div>
        </div>

        <div>
          <span>QUERY</span>

          <div>
            <strong>CSS checks a condition</strong>

            <p>
              Media queries activate rules when the viewport crosses a
              breakpoint.
            </p>
          </div>
        </div>

        <div>
          <span>REFLOW</span>

          <div>
            <strong>Layout adapts</strong>

            <p>Columns can stack so content stays comfortable and readable.</p>
          </div>
        </div>
      </div>

      <div className={styles.footerSignal}>
        <Smartphone size={13} />

        <span>VIEWPORT → BREAKPOINT → MEDIA QUERY → REFLOW</span>
      </div>
    </section>
  );
}

/* ====================================================== */
/* SMALL INLINE ICON */
/* ====================================================== */

function LayoutIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />

      <path d="M3 9h18" />

      <path d="M9 21V9" />
    </svg>
  );
}

export default CssResponsiveViewportAnimation;
