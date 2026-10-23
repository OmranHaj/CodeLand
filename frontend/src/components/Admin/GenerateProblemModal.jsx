import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw, Sparkles, X, Zap } from "lucide-react";
import gsap from "gsap";
import {
  ARENA_TIER_LABELS,
  ARENA_XP_TIERS,
  generateArenaContest,
  regenerateArenaContest,
} from "../../services/arenaProblemService";

const STAGES = [
  "Splitting the story into 6 connected chapters…",
  "Designing the algorithm for each tier…",
  "Writing statements, input/output and constraints…",
  "Crafting examples and hints…",
  "Painting the illustrations…",
  "Validating all 6 problems…",
];

/**
 * Generates a full Sunday Arena contest (6 connected problems, 25 → 150 XP),
 * or regenerates an existing set in place. On success the caller receives the
 * 6 saved DRAFT problems for preview.
 *
 * @param {{ batchId: string, sourceDescription: string } | null} regenerateFrom
 */
export default function GenerateProblemModal({ isOpen, onClose, onGenerated, regenerateFrom = null }) {
  const isRegenerate = Boolean(regenerateFrom);
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setDescription(regenerateFrom?.sourceDescription || "");
    setError("");
    setElapsed(0);
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.94, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }
      );
    }
  }, [isOpen, regenerateFrom]);

  useEffect(() => {
    if (!isGenerating) return undefined;
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [isGenerating]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !isGenerating) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const trimmed = description.trim();
  const canSubmit = trimmed.length >= 10 && !isGenerating;
  const stage = STAGES[Math.min(Math.floor(elapsed / 20), STAGES.length - 1)];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsGenerating(true);
    setError("");
    try {
      const result = isRegenerate
        ? await regenerateArenaContest(regenerateFrom.batchId, { description: trimmed })
        : await generateArenaContest({ description: trimmed });
      onGenerated(result.problems || []);
    } catch (err) {
      setError(err.message || "Contest generation failed. Nothing was saved.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="generate-problem-title">
      <form className="admin-modal-card arena-generate-card" ref={cardRef} onSubmit={handleSubmit}>
        <div className="admin-modal-header">
          <div>
            <div className="admin-modal-breadcrumb">
              <span className="admin-badge-track">Sunday Arena</span>
              <span className="admin-course-tag">{isRegenerate ? "Regenerate set" : "AI Contest Forge"}</span>
            </div>
            <h2 id="generate-problem-title">
              {isRegenerate ? "Regenerate the 6-problem set" : "Generate Problems"}
            </h2>
            <p className="admin-modal-subtitle">
              {isRegenerate
                ? "All 6 problems of this set get new content in place. The previous version is discarded — no leftover records."
                : "Write one story. The generator turns it into 6 connected problems — statement, constraints, examples, hint and illustration for each — saved as drafts for you to preview before publishing. The current contest leaves the arena and moves to the archive with its standings and medals."}
            </p>
          </div>
          <button
            type="button"
            className="admin-close-btn"
            onClick={onClose}
            disabled={isGenerating}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isGenerating ? (
          <div className="arena-generating" role="status" aria-live="polite">
            <div className="arena-orb">
              <Sparkles size={26} />
            </div>
            <strong>{stage}</strong>
            <span>
              {elapsed}s elapsed · a full contest usually takes 1–3 minutes
              {elapsed > 180 && " — the AI service is busy and retrying, please keep this open"}
            </span>
            <div className="arena-progress">
              <span style={{ width: `${Math.min(95, (elapsed / 150) * 100)}%` }} />
            </div>
          </div>
        ) : (
          <div className="admin-form-grid">
            <div className="admin-field-group full-width">
              <label htmlFor="arena-description">
                Contest story / theme <span className="req">*</span>
              </label>
              <textarea
                id="arena-description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A young engineer repairs the lighthouses along a stormy coast, one beacon at a time…"
                maxLength={2000}
                autoFocus
              />
              {trimmed.length > 0 && trimmed.length < 10 && (
                <span className="admin-inline-error">Please write at least 10 characters.</span>
              )}
            </div>

            <div className="admin-field-group full-width">
              <label>What you'll get</label>
              <div className="arena-tier-preview" aria-label="Generated problem tiers">
                {ARENA_XP_TIERS.map((xp, idx) => (
                  <div key={xp}>
                    <span className="arena-tier-num">#{idx + 1}</span>
                    <span className="arena-xp-value">
                      <Zap size={11} />
                      {xp}
                    </span>
                    <span className="arena-xp-tier">{ARENA_TIER_LABELS[idx]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="arena-error" role="alert">
            <AlertCircle size={16} />
            <div>
              <strong>Generation failed — nothing was saved.</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="admin-modal-footer">
          <span className="admin-footer-status">
            {isRegenerate ? "No student has attempted this set yet." : "Saved as DRAFT · not visible to students"}
          </span>
          <div className="admin-footer-buttons">
            <button type="button" className="admin-btn secondary" onClick={onClose} disabled={isGenerating}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={!canSubmit}>
              {isRegenerate || error ? <RefreshCw size={15} /> : <Sparkles size={15} />}
              <span>
                {isGenerating
                  ? "Generating 6 problems…"
                  : error
                  ? "Try again"
                  : isRegenerate
                  ? "Regenerate Set"
                  : "Generate 6 Problems"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
