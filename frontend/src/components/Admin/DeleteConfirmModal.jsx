import React, { useEffect, useRef } from "react";
import { AlertCircle, Trash2, X, RotateCcw } from "lucide-react";
import gsap from "gsap";

export default function DeleteConfirmModal({
  isOpen,
  course,
  lesson,
  onClose,
  onConfirm,
}) {
  const backdropRef = useRef(null);
  const cardRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        if (backdropRef.current && cardRef.current) {
          gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.22, ease: "power2.out" }
          );
          gsap.fromTo(
            cardRef.current,
            { opacity: 0, scale: 0.92, y: 14 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.28,
              ease: "back.out(1.2)",
              onComplete: () => {
                confirmBtnRef.current?.focus();
              },
            }
          );
        }
      });

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        ctx.revert();
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !lesson) return null;

  return (
    <div
      className="admin-modal-overlay"
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="admin-confirm-card" ref={cardRef}>
        <div className="admin-confirm-icon-wrap">
          <Trash2 size={24} color="#f43f5e" />
        </div>

        <h3 id="delete-dialog-title">Delete Lesson?</h3>

        <p id="delete-dialog-desc" className="admin-confirm-text">
          Are you sure you want to remove{" "}
          <strong className="admin-highlight-target">
            "{lesson.title}"
          </strong>{" "}
          from{" "}
          <span className="admin-highlight-course">
            {course?.title || "this course"}
          </span>
          ?
        </p>

        <div className="admin-confirm-details">
          <div className="admin-confirm-detail-item">
            <span>Sequence Position</span>
            <strong>#{lesson.order}</strong>
          </div>
          <div className="admin-confirm-detail-item">
            <span>Reward</span>
            <strong>{lesson.xp || 50} XP</strong>
          </div>
          <div className="admin-confirm-detail-item">
            <span>Type</span>
            <strong>{lesson.isUserCreated ? "Custom Lesson" : "Standard Lesson"}</strong>
          </div>
        </div>

        <p className="admin-confirm-note">
          This overlay removal takes effect immediately in this browser. You can undo this action from the notification prompt.
        </p>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-btn secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="admin-btn danger"
            onClick={() => {
              onConfirm(lesson);
              onClose();
            }}
          >
            <Trash2 size={16} />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
