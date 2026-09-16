import { useLayoutEffect, useRef } from "react";
import { RotateCcw, Send } from "lucide-react";
import gsap from "gsap";

import styles from "./HtmlFormFlowAnimation.module.css";

function HtmlFormFlowAnimation({
  label = "Your name",
  placeholder = "Enter your name",
  sampleValue = "Alex",
  buttonText = "Join",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;
    if (!root) return;

    timelineRef.current?.kill();

    const labelNode = root.querySelector("[data-label]");
    const inputNode = root.querySelector("[data-input]");
    const inputText = root.querySelector("[data-input-text]");
    const button = root.querySelector("[data-button]");
    const packet = root.querySelector("[data-packet]");
    const success = root.querySelector("[data-success]");
    const status = root.querySelector("[data-status]");

    gsap.set([labelNode, inputNode, button, success, status], { opacity: 0, y: 14 });
    gsap.set(packet, { opacity: 0, x: -80 });
    inputText.textContent = placeholder;
    inputNode.dataset.filled = "false";

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .to(status, { opacity: 1, y: 0, duration: 0.25 })
      .call(() => { status.textContent = "BUILDING FORM"; })
      .to(labelNode, { opacity: 1, y: 0, duration: 0.35 })
      .to(inputNode, { opacity: 1, y: 0, duration: 0.4 }, "-=0.12")
      .to(button, { opacity: 1, y: 0, duration: 0.4 }, "-=0.12")
      .call(() => {
        status.textContent = "USER ENTERS DATA";
        inputText.textContent = sampleValue;
        inputNode.dataset.filled = "true";
      })
      .to(inputNode, { scale: 1.02, duration: 0.2, yoyo: true, repeat: 1 })
      .call(() => { status.textContent = "SUBMITTING FORM"; })
      .to(button, { scale: 0.96, duration: 0.12, yoyo: true, repeat: 1 })
      .to(packet, { opacity: 1, x: 80, duration: 0.75, ease: "power2.inOut" })
      .to(success, { opacity: 1, y: 0, duration: 0.45 }, "-=0.15")
      .call(() => { status.textContent = "FORM FLOW COMPLETE"; });

    timelineRef.current = timeline;
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => playAnimation(), rootRef);
    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [label, placeholder, sampleValue, buttonText]);

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div><span>VISUAL EXPLAINER</span><strong>How a form collects information</strong></div>
        <button type="button" onClick={playAnimation}><RotateCcw size={14} /> Replay</button>
      </div>

      <div className={styles.stage}>
        <div className={styles.status} data-status>BUILDING FORM</div>

        <div className={styles.flow}>
          <div className={styles.formCard}>
            <label data-label>{label}</label>
            <div className={styles.fakeInput} data-input data-filled="false">
              <span data-input-text>{placeholder}</span>
            </div>
            <button type="button" data-button>{buttonText}</button>
          </div>

          <div className={styles.submitTrack}>
            <span data-packet><Send size={12} /> data</span>
          </div>

          <div className={styles.resultCard} data-success>
            <span>FORM SUBMITTED</span>
            <strong>{sampleValue}</strong>
            <small>The browser collected the value.</small>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div><span>INPUT</span><p>Inputs collect information from the user.</p></div>
        <div><span>BUTTON</span><p>A submit button sends the form data forward.</p></div>
      </div>
    </section>
  );
}

export default HtmlFormFlowAnimation;
