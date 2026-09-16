import { useLayoutEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import gsap from "gsap";

import styles from "./HtmlDocumentStructureAnimation.module.css";

function HtmlDocumentStructureAnimation({
  title = "My Website",
  heading = "Welcome!",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;
    if (!root) return;

    timelineRef.current?.kill();

    const nodes = root.querySelectorAll("[data-node]");
    const connectors = root.querySelectorAll("[data-connector]");
    const preview = root.querySelector("[data-preview]");
    const previewHeading = root.querySelector("[data-preview-heading]");
    const status = root.querySelector("[data-status]");

    gsap.set(nodes, { opacity: 0, y: 18, scale: 0.96 });
    gsap.set(connectors, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(preview, { opacity: 0, y: 22, scale: 0.97 });
    gsap.set(previewHeading, { opacity: 0, y: 14 });
    gsap.set(status, { opacity: 0 });

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    timeline
      .to(status, { opacity: 1, duration: 0.25 })
      .call(() => {
        status.textContent = "BUILDING DOCUMENT TREE";
      })
      .to(nodes, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.22,
      })
      .to(
        connectors,
        {
          scaleY: 1,
          duration: 0.35,
          stagger: 0.12,
        },
        "-=0.7",
      )
      .call(() => {
        status.textContent = "RENDERING BODY";
      })
      .to(preview, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
      })
      .to(previewHeading, {
        opacity: 1,
        y: 0,
        duration: 0.45,
      })
      .call(() => {
        status.textContent = "DOCUMENT READY";
      });

    timelineRef.current = timeline;
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => playAnimation(), rootRef);
    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [title, heading]);

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div>
          <span>VISUAL EXPLAINER</span>
          <strong>Inside an HTML document</strong>
        </div>
        <button type="button" onClick={playAnimation}>
          <RotateCcw size={14} /> Replay
        </button>
      </div>

      <div className={styles.stage}>
        <div className={styles.status} data-status>BUILDING DOCUMENT TREE</div>

        <div className={styles.tree}>
          <div className={`${styles.node} ${styles.doctype}`} data-node>
            <small>DOCUMENT MODE</small>
            <code>&lt;!DOCTYPE html&gt;</code>
          </div>

          <div className={styles.connector} data-connector />

          <div className={`${styles.node} ${styles.html}`} data-node>
            <small>ROOT ELEMENT</small>
            <code>&lt;html&gt;</code>
          </div>

          <div className={styles.connector} data-connector />

          <div className={styles.branchRow}>
            <div className={`${styles.node} ${styles.head}`} data-node>
              <small>PAGE INFORMATION</small>
              <code>&lt;head&gt;</code>
              <span>&lt;title&gt;{title}&lt;/title&gt;</span>
            </div>

            <div className={`${styles.node} ${styles.body}`} data-node>
              <small>VISIBLE CONTENT</small>
              <code>&lt;body&gt;</code>
              <span>&lt;h1&gt;{heading}&lt;/h1&gt;</span>
            </div>
          </div>
        </div>

        <div className={styles.preview} data-preview>
          <div className={styles.browserBar}>
            <div><i /><i /><i /></div>
            <span>{title}</span>
          </div>
          <div className={styles.previewBody}>
            <h1 data-preview-heading>{heading}</h1>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div><span>HEAD</span><p>Stores page information such as the title.</p></div>
        <div><span>BODY</span><p>Contains the content visitors actually see.</p></div>
      </div>
    </section>
  );
}

export default HtmlDocumentStructureAnimation;
