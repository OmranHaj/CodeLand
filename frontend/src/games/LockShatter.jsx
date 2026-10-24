import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Lock } from "lucide-react";
import { prefersReducedMotion } from "./motion";

const PIECES = 50;

/**
 * The padlock on a game card. When `celebrate` turns true it shakes, then bursts into glowing
 * shards on a canvas, and calls onDone so the card can show its unlocked state.
 */
export default function LockShatter({ celebrate, accent, onDone, className, canvasClassName }) {
  const lockRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!celebrate) return undefined;
    if (prefersReducedMotion()) {
      onDone?.();
      return undefined;
    }

    let frame = 0;
    const canvas = canvasRef.current;
    const lock = lockRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !lock || !ctx) {
      onDone?.();
      return undefined;
    }

    const box = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = box.width * ratio;
    canvas.height = box.height * ratio;
    ctx.scale(ratio, ratio);

    const lockBox = lock.getBoundingClientRect();
    const cx = lockBox.left + lockBox.width / 2 - box.left;
    const cy = lockBox.top + lockBox.height / 2 - box.top;

    const shards = Array.from({ length: PIECES }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 4,
        spin: Math.random() * Math.PI,
        life: 1,
      };
    });

    const burst = () => {
      ctx.clearRect(0, 0, box.width, box.height);
      let alive = false;
      for (const s of shards) {
        if (s.life <= 0) continue;
        alive = true;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.18; // gravity
        s.vx *= 0.985;
        s.spin += 0.2;
        s.life -= 0.018;
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.translate(s.x, s.y);
        ctx.rotate(s.spin);
        ctx.fillStyle = accent;
        ctx.shadowColor = accent;
        ctx.shadowBlur = 12;
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size * 1.6);
        ctx.restore();
      }
      if (alive) {
        frame = requestAnimationFrame(burst);
      } else {
        ctx.clearRect(0, 0, box.width, box.height);
        onDone?.();
      }
    };

    const timeline = gsap
      .timeline()
      .to(lock, { x: -6, rotation: -12, duration: 0.06, repeat: 7, yoyo: true, ease: "power1.inOut" })
      .to(lock, { scale: 1.25, duration: 0.12 })
      .add(() => {
        gsap.set(lock, { opacity: 0 });
        frame = requestAnimationFrame(burst);
      });

    return () => {
      timeline.kill();
      cancelAnimationFrame(frame);
    };
    // onDone/accent are stable for the life of a celebration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrate]);

  return (
    <>
      <span ref={lockRef} className={className} aria-hidden="true">
        <Lock size={16} />
      </span>
      <canvas ref={canvasRef} className={canvasClassName} aria-hidden="true" />
    </>
  );
}
