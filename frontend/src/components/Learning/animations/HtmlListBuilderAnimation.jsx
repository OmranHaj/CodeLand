import { useLayoutEffect, useMemo, useRef } from "react";
import { RotateCcw } from "lucide-react";
import gsap from "gsap";

import styles from "./HtmlListBuilderAnimation.module.css";

function HtmlListBuilderAnimation({ items = ["HTML", "CSS", "JavaScript"] }) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);
  const safeItems = useMemo(() => (Array.isArray(items) ? items.slice(0, 6) : []), [items]);

  const playAnimation = () => {
    const root = rootRef.current;
    if (!root) return;

    timelineRef.current?.kill();

    const container = root.querySelector("[data-list-container]");
    const codeItems = root.querySelectorAll("[data-code-item]");
    const visualItems = root.querySelectorAll("[data-visual-item]");
    const status = root.querySelector("[data-status]");

    gsap.set(container, { opacity: 0, scaleY: 0.85, transformOrigin: "top center" });
    gsap.set(codeItems, { opacity: 0, x: -16 });
    gsap.set(visualItems, { opacity: 0, x: 18, scale: 0.96 });
    gsap.set(status, { opacity: 0 });

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .to(status, { opacity: 1, duration: 0.25 })
      .call(() => { status.textContent = "CREATING <ul>"; })
      .to(container, { opacity: 1, scaleY: 1, duration: 0.5 })
      .call(() => { status.textContent = "ADDING <li> ITEMS"; })
      .to(codeItems, { opacity: 1, x: 0, duration: 0.35, stagger: 0.2 })
      .to(visualItems, { opacity: 1, x: 0, scale: 1, duration: 0.4, stagger: 0.2 }, "-=0.65")
      .call(() => { status.textContent = "LIST READY"; });

    timelineRef.current = timeline;
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => playAnimation(), rootRef);
    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [safeItems]);

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div><span>VISUAL EXPLAINER</span><strong>How lists organize related items</strong></div>
        <button type="button" onClick={playAnimation}><RotateCcw size={14} /> Replay</button>
      </div>

      <div className={styles.stage}>
        <div className={styles.status} data-status>CREATING &lt;ul&gt;</div>

        <div className={styles.columns}>
          <div className={styles.codePanel} data-list-container>
            <div className={styles.ulTag}>&lt;ul&gt;</div>
            {safeItems.map((item) => (
              <div key={item} className={styles.liTag} data-code-item>
                &nbsp;&nbsp;&lt;li&gt;{item}&lt;/li&gt;
              </div>
            ))}
            <div className={styles.ulTag}>&lt;/ul&gt;</div>
          </div>

          <div className={styles.browserPanel}>
            <span className={styles.browserLabel}>BROWSER RESULT</span>
            <ul>
              {safeItems.map((item) => (
                <li key={item} data-visual-item>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div><span>&lt;ul&gt;</span><p>The list container groups related items.</p></div>
        <div><span>&lt;li&gt;</span><p>Each list item represents one piece of content.</p></div>
      </div>
    </section>
  );
}

export default HtmlListBuilderAnimation;
