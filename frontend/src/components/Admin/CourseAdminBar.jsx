import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Sliders,
  Check,
  X,
} from "lucide-react";
import gsap from "gsap";

import LessonFormModal from "./LessonFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AdminUndoToast from "./AdminUndoToast";
import {
  getAllCourses,
  getCourseLessons,
  getCourseById,
  addLesson,
  updateLesson,
  deleteLesson,
  undoDeleteLesson,
  useAdminStore,
} from "../../services/adminLessonService";

import "./admin.css";

const ADMIN_MODE_KEY = "codeland_admin_mode_active";

export function getIsAdminMode() {
  try {
    return localStorage.getItem(ADMIN_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setIsAdminMode(active) {
  try {
    localStorage.setItem(ADMIN_MODE_KEY, String(active));
    window.dispatchEvent(new Event("codeland:admin-mode-change"));
    window.dispatchEvent(new Event("codeland:update"));
  } catch (err) {
    console.warn("Storage error setting admin mode:", err);
  }
}

export default function CourseAdminBar({
  courseId,
  currentLessonId,
  onSelectLesson,
  onReload,
}) {
  const navigate = useNavigate();
  const store = useAdminStore();
  const barRef = useRef(null);

  const [isAdmin, setIsAdmin] = useState(() => getIsAdminMode());
  const [isExpanded, setIsExpanded] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);

  // Modals state
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: "add",
    lesson: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    lesson: null,
  });

  const [undoToast, setUndoToast] = useState(null);

  useEffect(() => {
    const handleToggle = () => {
      setIsAdmin(getIsAdminMode());
    };
    window.addEventListener("codeland:admin-mode-change", handleToggle);
    window.addEventListener("storage", handleToggle);
    return () => {
      window.removeEventListener("codeland:admin-mode-change", handleToggle);
      window.removeEventListener("storage", handleToggle);
    };
  }, []);

  const allCourses = useMemo(() => getAllCourses(), [store]);
  const currentCourse = useMemo(
    () => getCourseById(courseId) || allCourses.find((c) => c.id === courseId) || allCourses[0],
    [courseId, allCourses]
  );
  const lessons = useMemo(() => getCourseLessons(courseId), [courseId, store]);

  const activeLesson = useMemo(() => {
    return lessons.find((l) => l.id === currentLessonId) || lessons[0];
  }, [lessons, currentLessonId]);

  const handleToggleAdminMode = () => {
    const next = !isAdmin;
    setIsAdmin(next);
    setIsAdminMode(next);
  };

  const handleOpenAdd = () => {
    setFormModalState({
      isOpen: true,
      mode: "add",
      lesson: null,
    });
  };

  const handleOpenEditActive = () => {
    if (activeLesson) {
      setFormModalState({
        isOpen: true,
        mode: "edit",
        lesson: activeLesson,
      });
    }
  };

  const handleOpenDeleteActive = () => {
    if (activeLesson) {
      setDeleteModalState({
        isOpen: true,
        lesson: activeLesson,
      });
    }
  };

  const handleFormSubmit = (lessonData) => {
    if (formModalState.mode === "add") {
      const created = addLesson(courseId, lessonData);
      if (typeof onReload === "function") onReload();
      if (typeof onSelectLesson === "function") onSelectLesson(created);
    } else if (formModalState.mode === "edit" && formModalState.lesson) {
      const updated = updateLesson(courseId, formModalState.lesson.id, lessonData);
      if (typeof onReload === "function") onReload();
      if (typeof onSelectLesson === "function") onSelectLesson(updated);
    }
  };

  const handleConfirmDelete = (lesson) => {
    const res = deleteLesson(courseId, lesson.id);
    if (res.success) {
      setUndoToast({
        id: Date.now(),
        courseId,
        lessonTitle: lesson.title,
        deletedSnapshot: res.deletedLesson,
      });

      // Safe handling if currently open lesson was deleted
      const remaining = lessons.filter((l) => l.id !== lesson.id);
      if (typeof onReload === "function") onReload();
      if (remaining.length > 0 && typeof onSelectLesson === "function") {
        onSelectLesson(remaining[0]);
      }
    }
  };

  const handleUndoDelete = (toast) => {
    if (toast?.deletedSnapshot && toast?.courseId) {
      const restored = undoDeleteLesson(toast.courseId, toast.deletedSnapshot);
      setUndoToast(null);
      if (typeof onReload === "function") onReload();
      if (typeof onSelectLesson === "function") onSelectLesson(restored);
    }
  };

  return (
    <>
      <div
        ref={barRef}
        className={`course-admin-bar ${isAdmin ? "is-active" : "is-minimized"}`}
        role="region"
        aria-label="Course Lesson Management Controls"
      >
        <div className="course-admin-bar-inner">
          {/* Left: Mode Badge & Discreet note */}
          <div className="course-admin-left">
            <button
              type="button"
              className={`course-admin-toggle-pill ${isAdmin ? "active" : ""}`}
              onClick={handleToggleAdminMode}
              title={isAdmin ? "Disable Admin Overlay Bar" : "Enable Admin Overlay Bar"}
            >
              <ShieldCheck size={14} />
              <span>{isAdmin ? "Admin Mode Active" : "Enable Admin Controls"}</span>
            </button>

            {isAdmin && (
              <span className="course-admin-discreet">
                <Sparkles size={12} color="#06b6d4" />
                Changes saved in this browser only
              </span>
            )}
          </div>

          {/* Center: Course Switcher & Lesson Actions */}
          {isAdmin && (
            <div className="course-admin-center">
              {/* Course Switcher Dropdown */}
              <div className="course-admin-switcher">
                <button
                  type="button"
                  className="course-admin-switcher-btn"
                  onClick={() => setCourseDropdownOpen(!courseDropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={courseDropdownOpen}
                >
                  <span className="course-admin-code">{currentCourse?.code}</span>
                  <span className="course-admin-title">{currentCourse?.title}</span>
                  <ChevronDown size={14} />
                </button>

                {courseDropdownOpen && (
                  <div className="course-admin-dropdown" role="listbox">
                    <div className="course-admin-dropdown-header">Switch Course:</div>
                    {allCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={c.id === courseId}
                        className={`course-admin-dropdown-item ${
                          c.id === courseId ? "selected" : ""
                        }`}
                        onClick={() => {
                          setCourseDropdownOpen(false);
                          navigate(c.route);
                        }}
                      >
                        <span className="course-item-track">{c.group}</span>
                        <strong className="course-item-name">{c.title}</strong>
                        <span className="course-item-count">{c.lessonCount} lessons</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Lesson Actions */}
              <div className="course-admin-actions">
                <button
                  type="button"
                  className="course-admin-btn primary"
                  onClick={handleOpenAdd}
                  title="Add a new lesson to this course"
                >
                  <Plus size={14} />
                  <span>Add Lesson</span>
                </button>

                {activeLesson && (
                  <>
                    <button
                      type="button"
                      className="course-admin-btn secondary"
                      onClick={handleOpenEditActive}
                      title={`Edit current lesson: ${activeLesson.title}`}
                    >
                      <Edit3 size={13} />
                      <span>Edit Current</span>
                    </button>

                    <button
                      type="button"
                      className="course-admin-btn danger"
                      onClick={handleOpenDeleteActive}
                      title={`Delete current lesson: ${activeLesson.title}`}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Right: Studio Link */}
          <div className="course-admin-right">
            <button
              type="button"
              className="course-admin-studio-link"
              onClick={() => navigate(`/admin?course=${courseId}`)}
              title="Open Full Curriculum Command Studio"
            >
              <span>Admin Studio</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals & Toasts */}
      <LessonFormModal
        isOpen={formModalState.isOpen}
        mode={formModalState.mode}
        course={currentCourse}
        lesson={formModalState.lesson}
        maxOrder={lessons.length}
        onClose={() => setFormModalState({ isOpen: false, mode: "add", lesson: null })}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        course={currentCourse}
        lesson={deleteModalState.lesson}
        onClose={() => setDeleteModalState({ isOpen: false, lesson: null })}
        onConfirm={handleConfirmDelete}
      />

      <AdminUndoToast
        toast={undoToast}
        onUndo={handleUndoDelete}
        onDismiss={() => setUndoToast(null)}
      />
    </>
  );
}
