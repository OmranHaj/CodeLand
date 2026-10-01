import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  Code2,
  FileText,
  AlertTriangle,
  Check,
  ChevronRight,
} from "lucide-react";
import gsap from "gsap";

export default function LessonFormModal({
  isOpen,
  mode = "add", // "add" | "edit"
  course,
  lesson = null,
  maxOrder = 1,
  onClose,
  onSubmit,
}) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const titleInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    order: 1,
    estimatedMinutes: 8,
    xp: 50,
    difficulty: "beginner",
    status: "published",
    description: "",
    code: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);

  // Initialize or reset form data when opening
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      setShowDiscardPrompt(false);
      setErrors({});
      setTouched({});
      setIsDirty(false);
      setIsSubmitting(false);

      if (mode === "edit" && lesson) {
        let extractedCode = lesson.code || "";
        if (!extractedCode && Array.isArray(lesson.blocks)) {
          const codeBlock = lesson.blocks.find(
            (b) => b && (b.type === "code" || typeof b.code === "string")
          );
          if (codeBlock && typeof codeBlock.code === "string") {
            extractedCode = codeBlock.code;
          }
        }

        setFormData({
          title: lesson.title || "",
          subtitle: lesson.subtitle || "",
          slug: lesson.slug || "",
          order: Number(lesson.order) || 1,
          estimatedMinutes: Number(lesson.estimatedMinutes) || 8,
          xp: Number(lesson.xp) || 50,
          difficulty: lesson.difficulty || "beginner",
          status: lesson.status || "published",
          description: lesson.description || "",
          code: extractedCode,
        });
      } else {
        // Adding new lesson
        const defaultCode =
          course?.defaultLanguage === "html"
            ? "<h1>Hello CodeLand</h1>\n<p>Start your discovery.</p>"
            : course?.defaultLanguage === "cpp"
            ? '#include <iostream>\n\nint main() {\n    std::cout << "CodeLand Active!\\n";\n    return 0;\n}'
            /*
            : course?.defaultLanguage === "python"
            ? 'print("Hello from Python Explorer!")\npoints = 100\nprint(f"XP: {points}")'
            */
            : '// Write code here\nconsole.log("Ready!");';

        setFormData({
          title: "",
          subtitle: "",
          slug: "",
          order: maxOrder + 1,
          estimatedMinutes: 8,
          xp: 50,
          difficulty: "beginner",
          status: "published",
          description: "",
          code: defaultCode,
        });
      }

      // GSAP Entrance
      const ctx = gsap.context(() => {
        if (backdropRef.current && modalRef.current) {
          gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.28, ease: "power2.out" }
          );
          gsap.fromTo(
            modalRef.current,
            { opacity: 0, scale: 0.94, y: 18 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.35,
              ease: "back.out(1.15)",
              onComplete: () => {
                titleInputRef.current?.focus();
              },
            }
          );
        }
      });

      return () => ctx.revert();
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen, mode, lesson, course, maxOrder]);

  // Handle ESC key and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty]);

  // Validation function
  const validate = (data) => {
    const errs = {};
    if (!data.title?.trim()) {
      errs.title = "Lesson title is required.";
    } else if (data.title.trim().length < 3) {
      errs.title = "Title must be at least 3 characters.";
    }

    if (data.order === "" || isNaN(Number(data.order)) || Number(data.order) < 1) {
      errs.order = "Order must be a positive integer.";
    }

    if (
      data.estimatedMinutes === "" ||
      isNaN(Number(data.estimatedMinutes)) ||
      Number(data.estimatedMinutes) < 1
    ) {
      errs.estimatedMinutes = "Minutes must be at least 1.";
    }

    if (data.xp === "" || isNaN(Number(data.xp)) || Number(data.xp) < 0) {
      errs.xp = "XP cannot be negative.";
    }

    return errs;
  };

  const handleChange = (field, value) => {
    setIsDirty(true);
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug if adding and user hasn't explicitly customized slug
      if (field === "title" && mode === "add" && !touched.slug) {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      // Re-validate touched
      const errs = validate(next);
      setErrors(errs);
      return next;
    });
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors(errs);
  };

  const requestClose = () => {
    if (isDirty) {
      setShowDiscardPrompt(true);
    } else {
      animateAndClose();
    }
  };

  const animateAndClose = () => {
    if (backdropRef.current && modalRef.current) {
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 12,
        duration: 0.22,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = {
      title: true,
      order: true,
      estimatedMinutes: true,
      xp: true,
    };
    setTouched(allTouched);

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await Promise.resolve(
        onSubmit({
          ...formData,
          order: Number(formData.order),
          estimatedMinutes: Number(formData.estimatedMinutes),
          xp: Number(formData.xp),
          language: course?.defaultLanguage || "javascript",
        })
      );
      animateAndClose();
    } catch (err) {
      console.error("[LessonFormModal] Save error:", err);
      setErrors({ form: err.message || "Failed to save lesson to database." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="admin-modal-overlay"
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) requestClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-modal-title"
    >
      <div className="admin-modal-card" ref={modalRef}>
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <div className="admin-modal-breadcrumb">
              <span className="admin-badge-track">{course?.group || "Course"}</span>
              <ChevronRight size={13} />
              <span className="admin-course-tag">{course?.title}</span>
            </div>
            <h2 id="lesson-modal-title">
              {mode === "edit" ? "Edit Curriculum Lesson" : "Add New Lesson"}
            </h2>
            <p className="admin-modal-subtitle">
              {mode === "edit"
                ? `Update content, rewards, and sequence for "${lesson?.title}".`
                : `Create an interactive lesson for ${course?.title}.`}
            </p>
          </div>
          <button
            type="button"
            className="admin-close-btn"
            onClick={requestClose}
            aria-label="Close lesson form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Unsaved Changes Confirmation Banner */}
        {showDiscardPrompt && (
          <div className="admin-discard-warning" role="alert">
            <div className="admin-discard-content">
              <AlertTriangle size={18} color="#f59e0b" />
              <span>You have unsaved changes. Discard your edits?</span>
            </div>
            <div className="admin-discard-actions">
              <button
                type="button"
                className="admin-btn-sm ghost"
                onClick={() => setShowDiscardPrompt(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="admin-btn-sm danger"
                onClick={animateAndClose}
              >
                Discard Changes
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-grid">
            {/* Title */}
            <div className="admin-field-group full-width">
              <label htmlFor="lesson-title">
                Lesson Title <span className="req">*</span>
              </label>
              <div className="admin-input-wrapper">
                <input
                  id="lesson-title"
                  ref={titleInputRef}
                  type="text"
                  placeholder="e.g. Master Flexbox Layouts"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  onBlur={() => handleBlur("title")}
                  aria-invalid={Boolean(touched.title && errors.title)}
                  aria-describedby={touched.title && errors.title ? "title-error" : undefined}
                />
              </div>
              {touched.title && errors.title && (
                <span id="title-error" className="admin-inline-error" role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Subtitle */}
            <div className="admin-field-group full-width">
              <label htmlFor="lesson-subtitle">Subtitle / Hook</label>
              <input
                id="lesson-subtitle"
                type="text"
                placeholder="e.g. Align, distribute, and space interface items"
                value={formData.subtitle}
                onChange={(e) => handleChange("subtitle", e.target.value)}
              />
            </div>

            {/* Slug & Order */}
            <div className="admin-field-group">
              <label htmlFor="lesson-slug">URL Slug / Identifier</label>
              <input
                id="lesson-slug"
                type="text"
                placeholder="lesson-slug"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                onBlur={() => handleBlur("slug")}
              />
            </div>

            <div className="admin-field-group">
              <label htmlFor="lesson-order">
                Sequence Order <span className="req">*</span>
              </label>
              <div className="admin-input-with-icon">
                <Layers size={15} />
                <input
                  id="lesson-order"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.order}
                  onChange={(e) => handleChange("order", e.target.value)}
                  onBlur={() => handleBlur("order")}
                  aria-invalid={Boolean(touched.order && errors.order)}
                />
              </div>
              {touched.order && errors.order && (
                <span className="admin-inline-error" role="alert">
                  {errors.order}
                </span>
              )}
            </div>

            {/* Duration & XP */}
            <div className="admin-field-group">
              <label htmlFor="lesson-duration">
                Duration (minutes) <span className="req">*</span>
              </label>
              <div className="admin-input-with-icon">
                <Clock size={15} />
                <input
                  id="lesson-duration"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.estimatedMinutes}
                  onChange={(e) => handleChange("estimatedMinutes", e.target.value)}
                  onBlur={() => handleBlur("estimatedMinutes")}
                  aria-invalid={Boolean(touched.estimatedMinutes && errors.estimatedMinutes)}
                />
              </div>
              {touched.estimatedMinutes && errors.estimatedMinutes && (
                <span className="admin-inline-error" role="alert">
                  {errors.estimatedMinutes}
                </span>
              )}
            </div>

            <div className="admin-field-group">
              <label htmlFor="lesson-xp">XP Reward</label>
              <div className="admin-input-with-icon">
                <Award size={15} />
                <input
                  id="lesson-xp"
                  type="number"
                  min="0"
                  step="10"
                  value={formData.xp}
                  onChange={(e) => handleChange("xp", e.target.value)}
                  onBlur={() => handleBlur("xp")}
                  aria-invalid={Boolean(touched.xp && errors.xp)}
                />
              </div>
              {touched.xp && errors.xp && (
                <span className="admin-inline-error" role="alert">
                  {errors.xp}
                </span>
              )}
            </div>

            {/* Difficulty & Status */}
            <div className="admin-field-group">
              <label htmlFor="lesson-diff">Difficulty Level</label>
              <select
                id="lesson-diff"
                value={formData.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="admin-field-group">
              <label htmlFor="lesson-status">Publish Status</label>
              <select
                id="lesson-status"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden from students)</option>
              </select>
            </div>

            {/* Concept Description */}
            <div className="admin-field-group full-width">
              <label htmlFor="lesson-desc">Concept & Instructions</label>
              <textarea
                id="lesson-desc"
                rows="3"
                placeholder="Explain the core mental model and what the student will learn..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Code Snippet */}
            <div className="admin-field-group full-width">
              <div className="admin-field-label-row">
                <label htmlFor="lesson-code">Starter / Example Code</label>
                <span className="admin-lang-indicator">
                  <Code2 size={13} /> {course?.defaultLanguage?.toUpperCase() || "CODE"}
                </span>
              </div>
              <textarea
                id="lesson-code"
                rows="5"
                className="admin-code-area"
                placeholder="// Enter starter code for this lesson..."
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                spellCheck="false"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-modal-footer">
            <div className="admin-footer-status">
              <Sparkles size={14} color="#10b981" />
              <span>Direct PostgreSQL Database Sync</span>
            </div>
            <div className="admin-footer-buttons">
              <button
                type="button"
                className="admin-btn secondary"
                onClick={requestClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn primary" disabled={isSubmitting}>
                <Check size={16} />
                <span>
                  {isSubmitting
                    ? "Saving to Database..."
                    : mode === "edit"
                    ? "Save to Database"
                    : "Create in Database"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
