import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Search,
  RotateCcw,
  RefreshCw,
  Database,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  HelpCircle,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Filter,
} from "lucide-react";
import gsap from "gsap";

import HubLayout from "../../components/Hub/HubLayout";
import AdminSculpture3D from "../../components/Admin/AdminSculpture3D";
import LessonFormModal from "../../components/Admin/LessonFormModal";
import DeleteConfirmModal from "../../components/Admin/DeleteConfirmModal";
import AdminUndoToast from "../../components/Admin/AdminUndoToast";
import {
  getAllCourses,
  getCourseLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  undoDeleteLesson,
  resetCourseOverlay,
  resetAllAdminOverlays,
  getAdminSummary,
  useAdminStore,
  fetchAdminCurriculumFromDB,
  updateLessonInDB,
  createLessonInDB,
  deleteLessonInDB,
  isDatabaseSynced,
} from "../../services/adminLessonService";

import "../../components/Admin/admin.css";

export default function AdminStudio() {
  const [params, setParams] = useSearchParams();
  const store = useAdminStore();

  const allCourses = useMemo(() => getAllCourses(), [store]);
  const summary = useMemo(() => getAdminSummary(), [store]);

  const trackTabs = useMemo(() => {
    const list = ["All"];
    allCourses.forEach((c) => {
      if (c.group && !list.includes(c.group)) {
        list.push(c.group);
      }
    });
    return list;
  }, [allCourses]);

  // Selected Track filter: "All" | "Web" | "C++" | "Algorithms"
  const selectedTrack = params.get("track") || "All";

  // Selected Course
  const courseParam = params.get("course");
  const selectedCourseId = useMemo(() => {
    if (courseParam && allCourses.some((c) => c.id === courseParam)) {
      return courseParam;
    }
    // Default to first course of selected track or first overall
    const trackFiltered =
      selectedTrack === "All"
        ? allCourses
        : allCourses.filter((c) => c.group === selectedTrack);
    return trackFiltered[0]?.id || allCourses[0]?.id || "html-foundations";
  }, [courseParam, allCourses, selectedTrack]);

  const activeCourse = useMemo(
    () => allCourses.find((c) => c.id === selectedCourseId) || allCourses[0],
    [allCourses, selectedCourseId]
  );

  // Lessons for current active course
  const courseLessons = useMemo(
    () => getCourseLessons(selectedCourseId),
    [selectedCourseId, store]
  );

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [formModalState, setFormModalState] = useState({
    isOpen: false,
    mode: "add", // "add" | "edit"
    lesson: null,
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    lesson: null,
  });

  const [undoToast, setUndoToast] = useState(null);
  const [statusNotification, setStatusNotification] = useState("");
  const [isSyncingDb, setIsSyncingDb] = useState(false);

  // Load live curriculum from PostgreSQL database
  const loadDatabaseCurriculum = useCallback(async (isManual = false) => {
    setIsSyncingDb(true);
    try {
      await fetchAdminCurriculumFromDB();
      if (isManual) {
        notify("Curriculum successfully synchronized with PostgreSQL database!");
      }
    } catch (err) {
      console.warn("[AdminStudio] DB fetch warning:", err);
      if (isManual) {
        notify(`Database notice: ${err.message || "Loaded cached data"}`);
      }
    } finally {
      setIsSyncingDb(false);
    }
  }, []);

  useEffect(() => {
    loadDatabaseCurriculum(false);
  }, [loadDatabaseCurriculum]);

  // Refs for animations
  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const lessonListRef = useRef(null);

  // GSAP Initial Entrance Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroRef.current) {
        tl.fromTo(
          heroRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.55 }
        );
      }

      if (metricsRef.current?.children) {
        tl.fromTo(
          metricsRef.current.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
          "-=0.25"
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // GSAP Staggered Reveal on Lesson Cards when course changes
  useEffect(() => {
    if (!lessonListRef.current) return;
    const cards = lessonListRef.current.querySelectorAll(".admin-lesson-card");
    if (!cards.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
      );
    });

    return () => ctx.revert();
  }, [selectedCourseId, searchQuery, difficultyFilter, statusFilter, courseLessons.length]);

  // Track & Course selection helpers
  const handleSelectTrack = (track) => {
    const next = new URLSearchParams(params);
    if (track === "All") next.delete("track");
    else next.set("track", track);

    // Pick first course of track
    const firstOfTrack =
      track === "All"
        ? allCourses[0]
        : allCourses.find((c) => c.group === track);
    if (firstOfTrack) {
      next.set("course", firstOfTrack.id);
    }
    setParams(next, { replace: true });
  };

  const handleSelectCourse = (courseId) => {
    const next = new URLSearchParams(params);
    next.set("course", courseId);
    setParams(next, { replace: true });
  };

  // Filter lessons
  const visibleLessons = useMemo(() => {
    return courseLessons.filter((lesson) => {
      const matchesSearch =
        searchQuery === "" ||
        `${lesson.title} ${lesson.subtitle || ""} ${lesson.description || ""} ${lesson.slug || ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesDiff =
        difficultyFilter === "all" ||
        (lesson.difficulty || "beginner").toLowerCase() === difficultyFilter.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (lesson.status || "published").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDiff && matchesStatus;
    });
  }, [courseLessons, searchQuery, difficultyFilter, statusFilter]);

  // Notification helper
  const notify = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(""), 3500);
  };

  // Lesson CRUD Handlers (Synchronized with Database)
  const handleOpenAdd = () => {
    setFormModalState({
      isOpen: true,
      mode: "add",
      lesson: null,
    });
  };

  const handleOpenEdit = (lesson) => {
    setFormModalState({
      isOpen: true,
      mode: "edit",
      lesson,
    });
  };

  const handleFormSubmit = async (lessonData) => {
    try {
      if (formModalState.mode === "add") {
        const created = await createLessonInDB(selectedCourseId, lessonData);
        notify(`Added "${created?.title || lessonData.title}" directly to database!`);
      } else if (formModalState.mode === "edit" && formModalState.lesson) {
        const updated = await updateLessonInDB(
          selectedCourseId,
          formModalState.lesson.id,
          lessonData
        );
        notify(`Saved changes for "${updated?.title || lessonData.title}" in database!`);
      }
    } catch (err) {
      console.error("[AdminStudio] Submit error:", err);
      // Fallback to local overlay if API failed
      if (formModalState.mode === "add") {
        const created = addLesson(selectedCourseId, lessonData);
        notify(`Added "${created.title}" (Local overlay: ${err.message})`);
      } else if (formModalState.mode === "edit" && formModalState.lesson) {
        const updated = updateLesson(selectedCourseId, formModalState.lesson.id, lessonData);
        notify(`Saved "${updated.title}" (Local overlay: ${err.message})`);
      }
    }
  };

  const handleOpenDelete = (lesson) => {
    setDeleteModalState({
      isOpen: true,
      lesson,
    });
  };

  const handleConfirmDelete = async (lesson) => {
    try {
      const res = await deleteLessonInDB(selectedCourseId, lesson.id);
      if (res?.success) {
        setUndoToast({
          id: Date.now(),
          courseId: selectedCourseId,
          lessonTitle: lesson.title,
          deletedSnapshot: res.deletedLesson || lesson,
        });
        notify(`Removed "${lesson.title}" from PostgreSQL database!`);
      }
    } catch (err) {
      console.error("[AdminStudio] Delete error:", err);
      const res = deleteLesson(selectedCourseId, lesson.id);
      if (res.success) {
        setUndoToast({
          id: Date.now(),
          courseId: selectedCourseId,
          lessonTitle: lesson.title,
          deletedSnapshot: res.deletedLesson,
        });
        notify(`Removed "${lesson.title}" (Local overlay: ${err.message})`);
      }
    }
  };

  const handleUndoDelete = (toast) => {
    if (toast?.deletedSnapshot && toast?.courseId) {
      undoDeleteLesson(toast.courseId, toast.deletedSnapshot);
      setUndoToast(null);
      notify(`Restored "${toast.deletedSnapshot.title}"`);
    }
  };

  const handleResetCourse = () => {
    if (
      window.confirm(
        `Reset all customized lessons for "${activeCourse?.title}" back to default curriculum?`
      )
    ) {
      resetCourseOverlay(selectedCourseId);
      notify(`Reset "${activeCourse?.title}" to baseline.`);
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        "Reset ALL local curriculum additions, edits, and deletions across all courses?"
      )
    ) {
      resetAllAdminOverlays();
      notify("All local curriculum changes have been reset.");
    }
  };

  return (
    <HubLayout title="Admin Studio · Lesson Management">
      <div className="admin-studio">
        {/* ================================================= */}
        {/* HERO SECTION WITH 3D ACCENT SCULPTURE */}
        {/* ================================================= */}
        <section ref={heroRef} className="admin-hero">
          <div className="admin-hero-content">
            <div className="admin-eyebrow-row">
              <span className="admin-eyebrow">
                <ShieldCheck size={14} /> CURRICULUM COMMAND
              </span>
              <span
                className="admin-discreet-pill"
                style={{
                  color: summary.isDatabaseSynced ? "#10b981" : "#f59e0b",
                  borderColor: summary.isDatabaseSynced
                    ? "rgba(16, 185, 129, 0.3)"
                    : "rgba(245, 158, 11, 0.3)",
                }}
              >
                <Database size={13} />
                {isSyncingDb
                  ? "Syncing with PostgreSQL..."
                  : summary.isDatabaseSynced
                  ? "Live PostgreSQL Database Connected"
                  : "Database Cache Active"}
              </span>
            </div>

            <h1>Curriculum Studio & Lesson Operations</h1>
            <p>
              Directly curate courses, introduce interactive modules, reorder sequence paths, and
              modify lesson content synchronized in real time with the PostgreSQL database.
            </p>

            <div className="admin-hero-actions">
              <button
                type="button"
                className="admin-btn primary"
                onClick={handleOpenAdd}
                id="btn-add-lesson-hero"
              >
                <Plus size={16} />
                <span>Add Lesson to {activeCourse?.title}</span>
              </button>

              <button
                type="button"
                className="admin-btn secondary"
                onClick={() => loadDatabaseCurriculum(true)}
                disabled={isSyncingDb}
                title="Fetch latest curriculum from database"
                id="btn-refresh-db"
              >
                <RefreshCw size={14} className={isSyncingDb ? "admin-spin" : ""} />
                <span>{isSyncingDb ? "Syncing..." : "Refresh Database"}</span>
              </button>

              <Link
                to={activeCourse?.route || "/courses"}
                className="admin-btn ghost"
                target="_blank"
                rel="noreferrer"
              >
                <span>View Course Player</span>
                <ExternalLink size={14} />
              </Link>

              {summary.hasAnyModifications && (
                <button
                  type="button"
                  className="admin-btn ghost"
                  onClick={handleResetAll}
                  title="Clear all browser overlays"
                >
                  <RotateCcw size={14} />
                  <span>Reset All Local Changes</span>
                </button>
              )}
            </div>
          </div>

          <aside className="admin-3d-aside">
            <AdminSculpture3D />
            <span className="admin-3d-caption">Core Kinetic Accent</span>
          </aside>
        </section>

        {/* ================================================= */}
        {/* METRICS BAR */}
        {/* ================================================= */}
        <section
          ref={metricsRef}
          className="admin-metrics-grid"
          aria-label="Curriculum Statistics"
        >
          <div className="admin-metric-card">
            <div className="admin-metric-icon">
              <BookOpen size={20} />
            </div>
            <div className="admin-metric-data">
              <strong>{allCourses.length}</strong>
              <span>Active Courses</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon cyan">
              <Layers size={20} />
            </div>
            <div className="admin-metric-data">
              <strong>{summary.totalLessons}</strong>
              <span>Database Lessons</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon emerald">
              <Database size={20} />
            </div>
            <div className="admin-metric-data">
              <strong>{summary.isDatabaseSynced ? "Live" : "Cached"}</strong>
              <span>PostgreSQL Sync</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon rose">
              <ShieldCheck size={20} />
            </div>
            <div className="admin-metric-data">
              <strong>Super Admin</strong>
              <span>Curriculum Control</span>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* TRACK & COURSE SELECTOR */}
        {/* ================================================= */}
        <section className="admin-selector-section">
          {/* Track Tabs */}
          <div className="admin-track-tabs" role="tablist" aria-label="Course Tracks">
            {trackTabs.map((track) => (
              <button
                key={track}
                role="tab"
                aria-selected={selectedTrack === track}
                className={`admin-track-tab ${selectedTrack === track ? "active" : ""}`}
                onClick={() => handleSelectTrack(track)}
              >
                {track === "All" ? `All Tracks (${allCourses.length})` : track}
              </button>
            ))}
          </div>

          {/* Course Pills Carousel */}
          <div className="admin-course-carousel" role="tablist" aria-label="Available Courses">
            {allCourses
              .filter((c) => selectedTrack === "All" || c.group === selectedTrack)
              .map((c) => {
                const isSelected = c.id === selectedCourseId;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={isSelected}
                    className={`admin-course-pill ${isSelected ? "active" : ""}`}
                    style={{ "--pill-accent": c.accent }}
                    onClick={() => handleSelectCourse(c.id)}
                  >
                    <div className="admin-course-pill-left">
                      <span className="admin-course-pill-track">{c.group}</span>
                      <strong className="admin-course-pill-title">{c.title}</strong>
                    </div>
                    <div className="admin-course-pill-right">
                      {c.hasChanges && (
                        <span
                          className="admin-pill-modified-dot"
                          title="Contains browser local modifications"
                        />
                      )}
                      <span className="admin-pill-badge">{c.lessonCount}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </section>

        {/* ================================================= */}
        {/* ACTIVE COURSE MANAGEMENT PANEL */}
        {/* ================================================= */}
        <section
          className="admin-curriculum-panel"
          style={{ "--course-accent": activeCourse?.accent }}
        >
          {/* Top Info */}
          <div className="admin-panel-top">
            <div className="admin-panel-heading">
              <div className="admin-panel-badge-row">
                <span className="admin-badge-code">{activeCourse?.code}</span>
                <span className="admin-badge-track">{activeCourse?.group} Track</span>
                {activeCourse?.hasChanges && (
                  <span className="admin-tag modified">Modified Overlay</span>
                )}
              </div>
              <h2>{activeCourse?.title}</h2>
              <p>{activeCourse?.description}</p>
            </div>

            <div className="admin-panel-actions">
              <button
                type="button"
                className="admin-btn primary"
                onClick={handleOpenAdd}
                id="btn-add-lesson-panel"
              >
                <Plus size={16} />
                <span>Add Lesson</span>
              </button>

              {activeCourse?.hasChanges && (
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={handleResetCourse}
                  title="Reset this course's overlay to original defaults"
                >
                  <RotateCcw size={14} />
                  <span>Restore Course</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="admin-toolbar">
            <label className="admin-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder={`Search ${courseLessons.length} lessons in ${activeCourse?.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search lessons"
              />
            </label>

            <div className="admin-filter-group">
              <select
                aria-label="Filter by difficulty"
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts Only</option>
              </select>

              <span className="admin-lesson-count-tag" aria-live="polite">
                {visibleLessons.length} {visibleLessons.length === 1 ? "lesson" : "lessons"}
              </span>
            </div>
          </div>

          {/* Lessons List */}
          {visibleLessons.length > 0 ? (
            <div ref={lessonListRef} className="admin-lesson-list">
              {visibleLessons.map((lesson, idx) => (
                <article
                  key={lesson.id}
                  className={`admin-lesson-card ${
                    lesson.isUserCreated ? "is-custom" : lesson.isCustomized ? "is-modified" : ""
                  }`}
                >
                  <div className="admin-lesson-left">
                    <span className="admin-lesson-order">
                      {String(lesson.order || idx + 1).padStart(2, "0")}
                    </span>

                    <div className="admin-lesson-info">
                      <div className="admin-lesson-title-row">
                        <h3>{lesson.title}</h3>
                        {lesson.isUserCreated && (
                          <span className="admin-tag custom">Custom</span>
                        )}
                        {lesson.isCustomized && (
                          <span className="admin-tag modified">Edited</span>
                        )}
                        {lesson.status === "draft" && (
                          <span className="admin-tag draft">Draft</span>
                        )}
                        <span className={`admin-tag diff-${lesson.difficulty || "beginner"}`}>
                          {lesson.difficulty || "Beginner"}
                        </span>
                      </div>

                      {lesson.subtitle && (
                        <p className="admin-lesson-desc">{lesson.subtitle}</p>
                      )}

                      <div className="admin-lesson-meta">
                        <span>
                          <Clock size={12} />
                          {lesson.estimatedMinutes || 8} mins
                        </span>
                        <span>
                          <Award size={12} />
                          {lesson.xp || 50} XP
                        </span>
                        {lesson.code && (
                          <span>
                            <FileCode size={12} />
                            Code snippet
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="admin-lesson-right">
                    <button
                      type="button"
                      className="admin-action-btn edit"
                      onClick={() => handleOpenEdit(lesson)}
                      aria-label={`Edit ${lesson.title}`}
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="admin-action-btn delete"
                      onClick={() => handleOpenDelete(lesson)}
                      aria-label={`Delete ${lesson.title}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <AlertCircle size={36} />
              <h3>
                {courseLessons.length === 0
                  ? `No active lessons in ${activeCourse?.title}`
                  : "No matching lessons found"}
              </h3>
              <p>
                {courseLessons.length === 0
                  ? "All lessons have been removed in this browser's local overlay. You can add new lessons or restore the baseline."
                  : `No lessons match "${searchQuery}". Try adjusting your search query or filters.`}
              </p>
              <div className="admin-empty-actions">
                <button
                  type="button"
                  className="admin-btn primary"
                  onClick={handleOpenAdd}
                >
                  <Plus size={15} />
                  <span>Add First Lesson</span>
                </button>
                {courseLessons.length === 0 && (
                  <button
                    type="button"
                    className="admin-btn secondary"
                    onClick={handleResetCourse}
                  >
                    <RotateCcw size={15} />
                    <span>Restore Course Defaults</span>
                  </button>
                )}
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-btn ghost"
                    onClick={() => {
                      setSearchQuery("");
                      setDifficultyFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* MODALS & NOTIFICATIONS */}
        {/* ================================================= */}
        <LessonFormModal
          isOpen={formModalState.isOpen}
          mode={formModalState.mode}
          course={activeCourse}
          lesson={formModalState.lesson}
          maxOrder={courseLessons.length}
          onClose={() =>
            setFormModalState({ isOpen: false, mode: "add", lesson: null })
          }
          onSubmit={handleFormSubmit}
        />

        <DeleteConfirmModal
          isOpen={deleteModalState.isOpen}
          course={activeCourse}
          lesson={deleteModalState.lesson}
          onClose={() => setDeleteModalState({ isOpen: false, lesson: null })}
          onConfirm={handleConfirmDelete}
        />

        <AdminUndoToast
          toast={undoToast}
          onUndo={handleUndoDelete}
          onDismiss={() => setUndoToast(null)}
        />
      </div>
    </HubLayout>
  );
}
