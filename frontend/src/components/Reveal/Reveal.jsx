import { useEffect, useRef, useState } from "react";

import styles from "./Reveal.module.css";

function Reveal({ children, delay = 0, direction = "up" }) {
  const revealRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = revealRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={revealRef} className={styles.revealWrapper}>
      <div
        className={`
          ${styles.reveal}
          ${styles[direction]}
          ${isVisible ? styles.visible : ""}
        `}
        style={{
          transitionDelay: `${delay}ms`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Reveal;
