import React, { useEffect, useRef, useState } from "react";
import { RotateCcw, X, CheckCircle2 } from "lucide-react";
import gsap from "gsap";

export default function AdminUndoToast({ toast, onUndo, onDismiss }) {
  const toastRef = useRef(null);
  const progressBarRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(7);

  useEffect(() => {
    if (!toast) return;

    // Entrance animation
    const ctx = gsap.context(() => {
      if (toastRef.current) {
        gsap.fromTo(
          toastRef.current,
          { opacity: 0, y: 24, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(1.2)" }
        );
      }
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { width: "100%" },
          { width: "0%", duration: 7, ease: "linear" }
        );
      }
    });

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      ctx.revert();
    };
  }, [toast?.id, onDismiss]);

  if (!toast) return null;

  return (
    <div
      ref={toastRef}
      className="admin-undo-toast"
      role="status"
      aria-live="polite"
    >
      <div className="admin-undo-top">
        <div className="admin-undo-info">
          <span className="admin-undo-dot" />
          <span className="admin-undo-msg">
            Deleted <strong>"{toast.lessonTitle}"</strong>
          </span>
        </div>
        <div className="admin-undo-actions">
          <button
            type="button"
            className="admin-undo-btn"
            onClick={() => onUndo(toast)}
            aria-label={`Undo deletion of ${toast.lessonTitle}`}
          >
            <RotateCcw size={14} />
            <span>Undo ({timeLeft}s)</span>
          </button>
          <button
            type="button"
            className="admin-toast-close"
            onClick={onDismiss}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      <div className="admin-undo-progress-track">
        <div ref={progressBarRef} className="admin-undo-progress-bar" />
      </div>
    </div>
  );
}
