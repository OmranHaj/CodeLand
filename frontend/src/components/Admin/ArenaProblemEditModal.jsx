import { useEffect, useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import XpTierPicker from "./XpTierPicker";
import { updateArenaProblem } from "../../services/arenaProblemService";

const TEXT_FIELDS = [
  { key: "title", label: "Title", required: true },
  { key: "arabicTitle", label: "Arabic title" },
  { key: "difficulty", label: "Difficulty label", required: true },
  { key: "timeLimit", label: "Time limit" },
  { key: "memoryLimit", label: "Memory limit" },
];

const LONG_FIELDS = [
  { key: "statement", label: "Problem statement", rows: 6, required: true },
  { key: "inputSpec", label: "Input", rows: 3, required: true },
  { key: "outputSpec", label: "Output", rows: 3, required: true },
  { key: "note", label: "Note", rows: 3 },
  { key: "hint", label: "Hint (costs students 25% XP)", rows: 3, required: true },
];

function toForm(problem) {
  return {
    title: problem.title || "",
    arabicTitle: problem.arabicTitle || "",
    difficulty: problem.difficulty || "",
    timeLimit: problem.timeLimit || "",
    memoryLimit: problem.memoryLimit || "",
    statement: problem.statement || "",
    inputSpec: problem.inputSpec || "",
    outputSpec: problem.outputSpec || "",
    note: problem.note || "",
    hint: problem.hint || "",
    xp: problem.xp,
    constraintsText: (problem.constraints || []).join("\n"),
    examples: (problem.examples || []).map((ex) => ({
      input: ex.input || "",
      output: ex.output || "",
      explanation: ex.explanation || "",
    })),
  };
}

export default function ArenaProblemEditModal({ problem, onClose, onSaved }) {
  const [form, setForm] = useState(() => toForm(problem));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(toForm(problem));
    setError("");
  }, [problem]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setExample = (idx, key, value) =>
    setForm((prev) => ({
      ...prev,
      examples: prev.examples.map((ex, i) => (i === idx ? { ...ex, [key]: value } : ex)),
    }));

  const missing = [...TEXT_FIELDS, ...LONG_FIELDS]
    .filter((f) => f.required && !form[f.key].trim())
    .map((f) => f.label);
  if (form.examples.length === 0) missing.push("at least one example");

  const handleSave = async (e) => {
    e.preventDefault();
    if (missing.length > 0) return;
    setSaving(true);
    setError("");
    try {
      const { constraintsText, ...rest } = form;
      const saved = await updateArenaProblem(problem.id, {
        ...rest,
        constraints: constraintsText.split("\n").map((c) => c.trim()).filter(Boolean),
      });
      onSaved(saved);
    } catch (err) {
      setError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-arena-title">
      <form className="admin-modal-card arena-edit-card" onSubmit={handleSave}>
        <div className="admin-modal-header">
          <div>
            <div className="admin-modal-breadcrumb">
              <span className="admin-badge-track">Sunday Arena</span>
              <span className="admin-course-tag">{problem.status}</span>
            </div>
            <h2 id="edit-arena-title">Edit Problem</h2>
            <p className="admin-modal-subtitle">Changes apply immediately to students if the problem is published.</p>
          </div>
          <button type="button" className="admin-close-btn" onClick={onClose} disabled={saving} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="admin-form-grid">
          <div className="admin-field-group full-width">
            <label>XP reward</label>
            <XpTierPicker value={form.xp} onChange={(xp) => set("xp", xp)} />
          </div>

          {TEXT_FIELDS.map((f) => (
            <div key={f.key} className="admin-field-group">
              <label htmlFor={`edit-${f.key}`}>
                {f.label} {f.required && <span className="req">*</span>}
              </label>
              <input
                id={`edit-${f.key}`}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                dir={f.key === "arabicTitle" ? "rtl" : undefined}
              />
            </div>
          ))}

          {LONG_FIELDS.map((f) => (
            <div key={f.key} className="admin-field-group full-width">
              <label htmlFor={`edit-${f.key}`}>
                {f.label} {f.required && <span className="req">*</span>}
              </label>
              <textarea
                id={`edit-${f.key}`}
                rows={f.rows}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          ))}

          <div className="admin-field-group full-width">
            <label htmlFor="edit-constraints">Constraints (one per line)</label>
            <textarea
              id="edit-constraints"
              rows={4}
              className="admin-code-area"
              value={form.constraintsText}
              onChange={(e) => set("constraintsText", e.target.value)}
            />
          </div>

          <div className="admin-field-group full-width">
            <div className="admin-field-label-row">
              <label>
                Examples <span className="req">*</span>
              </label>
              <button
                type="button"
                className="admin-btn ghost admin-btn-sm"
                onClick={() =>
                  set("examples", [...form.examples, { input: "", output: "", explanation: "" }])
                }
              >
                <Plus size={13} /> Add example
              </button>
            </div>
            {form.examples.map((ex, idx) => (
              <div key={idx} className="arena-example-editor">
                <div className="arena-example-editor-head">
                  <span>Example {idx + 1}</span>
                  <button
                    type="button"
                    className="admin-btn ghost admin-btn-sm"
                    onClick={() => set("examples", form.examples.filter((_, i) => i !== idx))}
                    disabled={form.examples.length === 1}
                    title={form.examples.length === 1 ? "A problem needs at least one example" : "Remove example"}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="arena-example-io">
                  <textarea
                    rows={3}
                    className="admin-code-area"
                    placeholder="Input"
                    value={ex.input}
                    onChange={(e) => setExample(idx, "input", e.target.value)}
                  />
                  <textarea
                    rows={3}
                    className="admin-code-area"
                    placeholder="Output"
                    value={ex.output}
                    onChange={(e) => setExample(idx, "output", e.target.value)}
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Explanation (optional)"
                  value={ex.explanation}
                  onChange={(e) => setExample(idx, "explanation", e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {error && <div className="arena-error" role="alert">{error}</div>}

        <div className="admin-modal-footer">
          <span className="admin-footer-status">
            {missing.length > 0 ? `Required: ${missing.join(", ")}` : "All required fields complete"}
          </span>
          <div className="admin-footer-buttons">
            <button type="button" className="admin-btn secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={saving || missing.length > 0}>
              <Save size={15} />
              <span>{saving ? "Saving…" : "Save changes"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
