import { useLayoutEffect, useRef } from "react";
import { RotateCcw, ExternalLink, Image as ImageIcon } from "lucide-react";
import gsap from "gsap";

import styles from "./HtmlLinksImagesAnimation.module.css";

function HtmlLinksImagesAnimation({
  linkText = "Visit Website",
  href = "example.com",
  imageAlt = "A random example",
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  const playAnimation = () => {
    const root = rootRef.current;
    if (!root) return;

    timelineRef.current?.kill();

    const linkCard = root.querySelector("[data-link]");
    const linkPulse = root.querySelector("[data-link-pulse]");
    const destination = root.querySelector("[data-destination]");
    const imageCode = root.querySelector("[data-image-code]");
    const imagePacket = root.querySelector("[data-image-packet]");
    const imageFrame = root.querySelector("[data-image-frame]");
    const status = root.querySelector("[data-status]");

    gsap.set([linkCard, destination, imageCode, imageFrame, status], { opacity: 0, y: 16 });
    gsap.set(linkPulse, { scaleX: 0, transformOrigin: "left center" });
    gsap.set(imagePacket, { opacity: 0, x: -70 });

    const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .to(status, { opacity: 1, y: 0, duration: 0.25 })
      .call(() => { status.textContent = "CONNECTING THE WEB"; })
      .to(linkCard, { opacity: 1, y: 0, duration: 0.45 })
      .to(linkPulse, { scaleX: 1, duration: 0.7, ease: "power2.inOut" })
      .to(destination, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
      .call(() => { status.textContent = "LOADING IMAGE SOURCE"; })
      .to(imageCode, { opacity: 1, y: 0, duration: 0.45 })
      .to(imagePacket, { opacity: 1, x: 70, duration: 0.85, ease: "power2.inOut" })
      .to(imageFrame, { opacity: 1, y: 0, duration: 0.55 }, "-=0.2")
      .call(() => { status.textContent = "LINK + IMAGE READY"; });

    timelineRef.current = timeline;
  };

  useLayoutEffect(() => {
    const context = gsap.context(() => playAnimation(), rootRef);
    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, [linkText, href, imageAlt]);

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div><span>VISUAL EXPLAINER</span><strong>Links connect. Images load.</strong></div>
        <button type="button" onClick={playAnimation}><RotateCcw size={14} /> Replay</button>
      </div>

      <div className={styles.stage}>
        <div className={styles.status} data-status>CONNECTING THE WEB</div>

        <div className={styles.linkFlow}>
          <div className={styles.linkCard} data-link>
            <ExternalLink size={17} />
            <div><small>&lt;a href="https://{href}"&gt;</small><strong>{linkText}</strong></div>
          </div>
          <div className={styles.linkLine}><span data-link-pulse /></div>
          <div className={styles.destination} data-destination>
            <small>DESTINATION</small><strong>{href}</strong>
          </div>
        </div>

        <div className={styles.imageFlow}>
          <div className={styles.imageCode} data-image-code>
            <ImageIcon size={17} />
            <code>&lt;img src="image.jpg" alt="{imageAlt}" /&gt;</code>
          </div>
          <div className={styles.packetTrack}><span data-image-packet>src</span></div>
          <div className={styles.imageFrame} data-image-frame>
            <div className={styles.fakeImage}><ImageIcon size={28} /></div>
            <small>{imageAlt}</small>
          </div>
        </div>
      </div>

      <div className={styles.explanation}>
        <div><span>LINK</span><p>href tells the browser where the link should go.</p></div>
        <div><span>IMAGE</span><p>src tells the browser where the image should come from.</p></div>
      </div>
    </section>
  );
}

export default HtmlLinksImagesAnimation;
