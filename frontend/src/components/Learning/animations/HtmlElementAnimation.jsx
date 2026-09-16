import { createElement, useLayoutEffect, useMemo, useRef } from "react";

import { RotateCcw } from "lucide-react";

import gsap from "gsap";

import styles from "./HtmlElementAnimation.module.css";

/* ====================================================== */
/* SUPPORTED TAGS */
/* ====================================================== */

const SUPPORTED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "button",
  "div",
  "span",
]);

function normalizeTag(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return SUPPORTED_TAGS.has(normalized) ? normalized : "div";
}

/* ====================================================== */
/* COMPONENT */
/* ====================================================== */

function HtmlElementAnimation({ tag = "h1", text = "My Website" }) {
  const rootRef = useRef(null);

  const timelineRef = useRef(null);

  const safeTag = useMemo(() => normalizeTag(tag), [tag]);

  const safeText = String(text || "").trim() || "My Website";

  const openingTag = `<${safeTag}>`;

  const closingTag = `</${safeTag}>`;

  /* ==================================================== */
  /* PLAY */
  /* ==================================================== */

  const playAnimation = () => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    timelineRef.current?.kill();

    const opening = root.querySelector("[data-part='opening']");

    const content = root.querySelector("[data-part='content']");

    const closing = root.querySelector("[data-part='closing']");

    const openingLabel = root.querySelector("[data-label='opening']");

    const contentLabel = root.querySelector("[data-label='content']");

    const closingLabel = root.querySelector("[data-label='closing']");

    const connector = root.querySelector("[data-connector]");

    const browser = root.querySelector("[data-browser]");

    const browserContent = root.querySelector("[data-browser-content]");

    const status = root.querySelector("[data-status]");

    gsap.set(
      [
        opening,
        content,
        closing,
        openingLabel,
        contentLabel,
        closingLabel,
        browser,
        browserContent,
        status,
      ],
      {
        opacity: 0,
      },
    );

    gsap.set(opening, {
      x: -55,
      y: -10,
      scale: 0.85,
    });

    gsap.set(content, {
      y: 24,
      scale: 0.9,
    });

    gsap.set(closing, {
      x: 55,
      y: -10,
      scale: 0.85,
    });

    gsap.set([openingLabel, contentLabel, closingLabel], {
      y: 12,
    });

    gsap.set(connector, {
      scaleX: 0,

      transformOrigin: "left center",
    });

    gsap.set(browser, {
      y: 30,
      scale: 0.96,
    });

    gsap.set(browserContent, {
      y: 18,
      scale: 0.94,
    });

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline

      .to(status, {
        opacity: 1,
        duration: 0.3,
      })

      .call(() => {
        status.textContent = "BUILDING ELEMENT";
      })

      .to(opening, {
        opacity: 1,

        x: 0,
        y: 0,

        scale: 1,

        duration: 0.6,
      })

      .to(
        openingLabel,
        {
          opacity: 1,

          y: 0,

          duration: 0.3,
        },

        "-=0.18",
      )

      .to(content, {
        opacity: 1,

        y: 0,

        scale: 1,

        duration: 0.6,
      })

      .to(
        contentLabel,
        {
          opacity: 1,

          y: 0,

          duration: 0.3,
        },

        "-=0.18",
      )

      .to(closing, {
        opacity: 1,

        x: 0,
        y: 0,

        scale: 1,

        duration: 0.6,
      })

      .to(
        closingLabel,
        {
          opacity: 1,

          y: 0,

          duration: 0.3,
        },

        "-=0.18",
      )

      .to(connector, {
        scaleX: 1,

        duration: 0.65,

        ease: "power2.inOut",
      })

      .call(() => {
        status.textContent = "ELEMENT COMPLETE";
      })

      .to(
        browser,
        {
          opacity: 1,

          y: 0,

          scale: 1,

          duration: 0.65,
        },

        "-=0.2",
      )

      .to(browserContent, {
        opacity: 1,

        y: 0,

        scale: 1,

        duration: 0.55,
      });

    timelineRef.current = timeline;
  };

  /* ==================================================== */
  /* EFFECT */
  /* ==================================================== */

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      playAnimation();
    }, rootRef);

    return () => {
      timelineRef.current?.kill();

      context.revert();
    };
  }, [safeTag, safeText]);

  /* ==================================================== */
  /* PREVIEW */
  /* ==================================================== */

  const previewElement = createElement(
    safeTag,

    safeTag === "button"
      ? {
          type: "button",
        }
      : null,

    safeText,
  );

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  return (
    <section
      ref={rootRef}
      className={styles.animation}
      aria-label="HTML element animation"
    >
      <div className={styles.topBar}>
        <div>
          <span className={styles.eyebrow}>VISUAL EXPLAINER</span>

          <strong>How an HTML element works</strong>
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
        <div className={styles.grid} />

        <div className={styles.status} data-status>
          BUILDING ELEMENT
        </div>

        <div className={styles.elementRow}>
          <div className={styles.partColumn}>
            <span
              data-part="opening"
              className={`${styles.codePart} ${styles.openingTag}`}
            >
              {openingTag}
            </span>

            <div data-label="opening" className={styles.partLabel}>
              <span className={styles.labelDot} />
              Opening Tag
            </div>
          </div>

          <div className={styles.partColumn}>
            <span
              data-part="content"
              className={`${styles.codePart} ${styles.content}`}
            >
              {safeText}
            </span>

            <div data-label="content" className={styles.partLabel}>
              <span className={styles.labelDot} />
              Content
            </div>
          </div>

          <div className={styles.partColumn}>
            <span
              data-part="closing"
              className={`${styles.codePart} ${styles.closingTag}`}
            >
              {closingTag}
            </span>

            <div data-label="closing" className={styles.partLabel}>
              <span className={styles.labelDot} />
              Closing Tag
            </div>
          </div>
        </div>

        <div className={styles.flow}>
          <span>HTML CODE</span>

          <div className={styles.connector} data-connector />

          <span>BROWSER</span>
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
            <div data-browser-content className={styles.browserContent}>
              {previewElement}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div>
          <span>01</span>

          <p>The opening tag tells the browser which element starts here.</p>
        </div>

        <div>
          <span>02</span>

          <p>The content is what the visitor sees inside the element.</p>
        </div>

        <div>
          <span>03</span>

          <p>The closing tag tells the browser where the element ends.</p>
        </div>
      </div>
    </section>
  );
}

export default HtmlElementAnimation;
