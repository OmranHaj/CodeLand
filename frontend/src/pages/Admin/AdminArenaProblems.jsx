import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Archive,
  CalendarClock,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";

import HubLayout from "../../components/Hub/HubLayout";
import ArenaProblemView from "../../components/Arena/ArenaProblemView";
import GenerateProblemModal from "../../components/Admin/GenerateProblemModal";
import ArenaProblemEditModal from "../../components/Admin/ArenaProblemEditModal";
import XpTierPicker from "../../components/Admin/XpTierPicker";
import {
  deleteArenaContest,
  deleteArenaProblem,
  fetchAdminArenaContests,
  fetchAdminArenaProblem,
  fetchAdminArenaProblems,
  formatXp,
  publishArenaContest,
  publishArenaProblem,
  scheduleArenaContest,
  setArenaProblemXp,
  unpublishArenaContest,
  unpublishArenaProblem,
} from "../../services/arenaProblemService";

import "../../components/Admin/admin.css";
import "../../components/Admin/arenaAdmin.css";

const FILTERS = [
  { id: "CURRENT", label: "Current contest" },
  { id: "ARCHIVE", label: "Archive" },
  { id: "ALL", label: "All sets" },
];

const STAGE_TAGS = {
  live: ["arena-live", "LIVE NOW"],
  upcoming: ["custom", "UPCOMING"],
  unscheduled: ["draft", "NOT SCHEDULED"],
  ended: ["modified", "ENDED"],
  archived: ["modified", "ARCHIVED"],
};

/** ISO -> value for <input type="datetime-local"> in the admin's local time. */
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatWindow(contest) {
  if (!contest?.startsAt || !contest?.endsAt) return "No live window yet";
  const fmt = (iso) =>
    new Date(iso).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  return `${fmt(contest.startsAt)} → ${fmt(contest.endsAt)}`;
}

/** Live-window editor for one contest (the server enforces it). */
function ContestScheduleEditor({ contest, busy, onSave }) {
  const [startsAt, setStartsAt] = useState(toLocalInput(contest.startsAt));
  const [endsAt, setEndsAt] = useState(toLocalInput(contest.endsAt));
  const locked = Boolean(contest.finalizedAt) || contest.status === "ARCHIVED";
  const invalid = !startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt);

  const apply = (window) => {
    setStartsAt(toLocalInput(window.startsAt));
    setEndsAt(toLocalInput(window.endsAt));
  };

  return (
    <div className="arena-schedule">
      <div className="arena-schedule-fields">
        <label>
          Opens
          <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} disabled={locked} />
        </label>
        <label>
          Closes
          <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} disabled={locked} />
        </label>
      </div>
      <div className="arena-schedule-actions">
        <button
          type="button"
          className="admin-btn ghost"
          disabled={locked || busy}
          onClick={() => onSave({})}
          title="Reset to the standard slot: next Sunday 17:00–20:00 (server timezone)"
        >
          Weekly slot (Sun 17–20)
        </button>
        <button
          type="button"
          className="admin-btn ghost"
          disabled={locked}
          onClick={() => {
            const now = new Date();
            apply({
              startsAt: now.toISOString(),
              endsAt: endsAt && new Date(endsAt) > now ? new Date(endsAt).toISOString() : new Date(now.getTime() + 2 * 3600_000).toISOString(),
            });
          }}
        >
          Start now
        </button>
        <button
          type="button"
          className="admin-btn ghost"
          disabled={locked || !startsAt}
          onClick={() => setEndsAt(toLocalInput(new Date(Math.max(Date.now(), new Date(startsAt).getTime() + 60_000)).toISOString()))}
        >
          End now
        </button>
        <button
          type="button"
          className="admin-btn primary"
          disabled={locked || invalid || busy}
          onClick={() => onSave({ startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString() })}
        >
          <CalendarClock size={14} /> Save window
        </button>
      </div>
      <p className="arena-schedule-note" style={{ color: "#94a3b8" }}>
        Contests run every Sunday 17:00–20:00. Registration opens 7 days before the start and closes when the
        contest begins. Custom times here are an override (e.g. for testing).
      </p>
      {locked && <p className="arena-schedule-note">This contest has finished and its medals were awarded — the window is locked.</p>}
      {!locked && invalid && startsAt && endsAt && <p className="arena-schedule-note">The contest must close after it opens.</p>}
    </div>
  );
}

function MetaRow({ label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="arena-meta-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** Groups problems into their generated 6-problem sets (newest first). */
function groupIntoSets(problems) {
  const sets = new Map();
  for (const p of problems) {
    const key = p.batchId || `solo-${p.id}`;
    if (!sets.has(key)) sets.set(key, { key, batchId: p.batchId, problems: [] });
    sets.get(key).problems.push(p);
  }
  return [...sets.values()]
    .map((set) => {
      const list = [...set.problems].sort((a, b) => (a.difficultyIndex ?? 0) - (b.difficultyIndex ?? 0));
      const published = list.filter((p) => p.status === "PUBLISHED").length;
      return {
        ...set,
        problems: list,
        createdAt: list.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), list[0].createdAt),
        published,
        drafts: list.length - published,
        attempts: list.reduce((sum, p) => sum + (p.attemptCount || 0), 0),
        solves: list.reduce((sum, p) => sum + (p.solvedCount || 0), 0),
        totalXp: list.reduce((sum, p) => sum + p.xp, 0),
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export default function AdminArenaProblems() {
  const [params, setParams] = useSearchParams();
  const [problems, setProblems] = useState([]);
  const [filter, setFilter] = useState("CURRENT");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState(null);

  const [generateOpen, setGenerateOpen] = useState(params.get("generate") === "1");
  const [regenerateFrom, setRegenerateFrom] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [contests, setContests] = useState([]);
  const [scheduleOpen, setScheduleOpen] = useState(null); // contest id

  const notify = (message, tone = "success") => {
    setToast({ message, tone, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [problemList, contestList] = await Promise.all([
        fetchAdminArenaProblems(),
        fetchAdminArenaContests(),
      ]);
      setProblems(problemList);
      setContests(Array.isArray(contestList) ? contestList : []);
    } catch (err) {
      setLoadError(err.message || "Could not load arena problems.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // "?generate=1" (from the Curriculum Studio button) opens the generator once.
  useEffect(() => {
    if (params.get("generate") === "1") {
      const next = new URLSearchParams(params);
      next.delete("generate");
      setParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const contestById = useMemo(() => new Map(contests.map((c) => [c.id, c])), [contests]);
  // Generating archives the current contest, so the server refuses it while one is live.
  const liveContest = useMemo(
    () => contests.find((c) => c.status === "CURRENT" && c.stage === "live") || null,
    [contests]
  );
  const sets = useMemo(
    () => groupIntoSets(problems).map((set) => ({ ...set, contest: contestById.get(set.batchId) || null })),
    [problems, contestById]
  );

  const stats = useMemo(
    () => ({
      sets: sets.length,
      drafts: problems.filter((p) => p.status === "DRAFT").length,
      published: problems.filter((p) => p.status === "PUBLISHED").length,
      solves: problems.reduce((sum, p) => sum + (p.solvedCount || 0), 0),
    }),
    [problems, sets]
  );

  const visibleSets = useMemo(
    () =>
      sets.filter((s) => {
        const archived = s.contest?.status === "ARCHIVED";
        return filter === "ALL" ? true : filter === "ARCHIVE" ? archived : !archived;
      }),
    [sets, filter]
  );

  // Problems of the set currently shown in the preview (for the #1..#6 tabs).
  const previewSet = useMemo(
    () => (preview?.batchId ? sets.find((s) => s.batchId === preview.batchId) : null),
    [sets, preview?.batchId]
  );

  const openPreview = async (id) => {
    setPreviewLoading(true);
    setPreview((prev) => ({ ...(prev?.batchId ? { batchId: prev.batchId } : {}), id }));
    try {
      setPreview(await fetchAdminArenaProblem(id));
    } catch (err) {
      setPreview(null);
      notify(err.message || "Could not open the preview.", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const applyUpdated = (updated) => {
    setPreview((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    load();
  };

  const runAction = async (key, fn, successMessage) => {
    setBusyAction(key);
    try {
      const result = await fn();
      if (successMessage) notify(successMessage);
      return result;
    } catch (err) {
      notify(err.message || "Action failed.", "error");
      return null;
    } finally {
      setBusyAction(null);
    }
  };

  const handleGenerated = async (created) => {
    setGenerateOpen(false);
    const wasRegenerate = Boolean(regenerateFrom);
    setRegenerateFrom(null);
    await load();
    if (created.length === 0) return;
    notify(
      wasRegenerate
        ? `Regenerated all ${created.length} problems of the set — review them before publishing.`
        : `${created.length} draft problems generated. Review them before publishing.`
    );
    // Open the first (tier 1) problem; the preview tabs reach the other 5.
    setPreview(created[0]);
  };

  // ---------------- set-level actions ----------------
  const handleSetPublish = async (set) => {
    const publish = set.drafts > 0;
    const res = await runAction(
      `set-status-${set.batchId}`,
      () => (publish ? publishArenaContest(set.batchId) : unpublishArenaContest(set.batchId)),
      publish
        ? set.contest?.startsAt
          ? `Published — live ${formatWindow(set.contest)}.`
          : "Published — scheduled for next Sunday. Adjust the window with Schedule."
        : "The set moved back to drafts."
    );
    if (res) {
      setPreview((prev) =>
        prev?.batchId === set.batchId ? { ...prev, status: publish ? "PUBLISHED" : "DRAFT" } : prev
      );
      load();
    }
  };

  const handleSchedule = async (set, window) => {
    const res = await runAction(
      `schedule-${set.batchId}`,
      () => scheduleArenaContest(set.batchId, window),
      window.startsAt ? `Live window saved: ${formatWindow(window)}.` : "Reset to the weekly slot (Sunday 17:00–20:00)."
    );
    if (res) {
      setScheduleOpen(null);
      load();
    }
  };

  const handleSetRegenerate = (set) => {
    if (set.attempts > 0) {
      notify("Students already attempted this set — generate a new set instead.", "error");
      return;
    }
    setRegenerateFrom({
      batchId: set.batchId,
      sourceDescription: set.problems[0]?.sourceDescription || preview?.sourceDescription || "",
    });
    setGenerateOpen(true);
  };

  const handleSetDelete = async (set) => {
    const warning =
      set.attempts === 0 && set.published === 0
        ? `Discard this draft set of ${set.problems.length} problems?`
        : `Delete contest #${set.contest?.edition ?? ""} with its ${set.problems.length} problems, registrations, standings and medals? XP students already earned is kept. This cannot be undone.`;
    if (!window.confirm(warning)) return;
    const res = await runAction(`set-delete-${set.batchId}`, () => deleteArenaContest(set.batchId), "Set deleted.");
    if (res?.success) {
      setPreview((prev) => (prev?.batchId === set.batchId ? null : prev));
      load();
    }
  };

  // ---------------- problem-level actions ----------------
  const handlePublishToggle = async (problem) => {
    const publish = problem.status !== "PUBLISHED";
    const updated = await runAction(
      `status-${problem.id}`,
      () => (publish ? publishArenaProblem(problem.id) : unpublishArenaProblem(problem.id)),
      publish ? `"${problem.title}" is now live for students.` : `"${problem.title}" moved back to drafts.`
    );
    if (updated) applyUpdated(updated);
  };

  const handleSetXp = async (problem, xp) => {
    if (xp === problem.xp) return;
    const updated = await runAction(
      `xp-${problem.id}`,
      () => setArenaProblemXp(problem.id, xp),
      `XP for "${problem.title}" set to ${xp}.`
    );
    if (updated) applyUpdated(updated);
  };

  const handleDelete = async (problem) => {
    if (!window.confirm(`Delete only "${problem.title}" from its set? Student attempts on it are removed.`)) return;
    const res = await runAction(`delete-${problem.id}`, () => deleteArenaProblem(problem.id), `Deleted "${problem.title}".`);
    if (res?.success) {
      setPreview((prev) => (prev?.id === problem.id ? null : prev));
      load();
    }
  };

  const openGenerator = () => {
    setRegenerateFrom(null);
    setGenerateOpen(true);
  };

  return (
    <HubLayout title="Admin Studio · Sunday Arena Problems">
      <div className="admin-studio">
        {/* ================= HERO ================= */}
        <section className="admin-hero arena-admin-hero">
          <div className="admin-hero-content">
            <div className="admin-eyebrow-row">
              <span className="admin-eyebrow">
                <Sparkles size={14} /> SUNDAY ARENA FORGE
              </span>
              <span className="admin-discreet-pill">
                <ShieldCheck size={13} /> Generator: ai/generate_contest.py
              </span>
            </div>
            <h1>Arena Problem Studio</h1>
            {liveContest && (
              <p style={{ color: "#4ade80", fontWeight: 700 }}>
                Edition #{liveContest.edition} is live right now. Generating is paused until it closes, so the running
                contest is not archived mid-way.
              </p>
            )}
            <p>
              Write one story and generate a full Sunday Arena contest: 6 connected problems from 25 to 150 XP, each
              with statement, constraints, examples, hint and illustration. Preview them as students will see them,
              then publish the set.
            </p>
            <div className="admin-hero-actions">
              <button
                type="button"
                className="admin-btn primary arena-generate-btn"
                onClick={openGenerator}
                id="btn-generate-problem"
                disabled={Boolean(liveContest)}
                title={liveContest ? "A contest is live — generate the next one after it closes (20:00)." : undefined}
              >
                <Sparkles size={16} />
                <span>Generate Problems</span>
              </button>
              <button type="button" className="admin-btn secondary" onClick={load} disabled={loading}>
                <RefreshCw size={14} className={loading ? "admin-spin" : ""} />
                <span>{loading ? "Loading…" : "Refresh"}</span>
              </button>
              <Link to="/student/contest?tab=arena" className="admin-btn ghost" target="_blank" rel="noreferrer">
                <span>Student view</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= METRICS ================= */}
        <section className="admin-metrics-grid" aria-label="Arena statistics">
          {[
            [Layers, "", stats.sets, "Contests (current + archive)"],
            [FileText, "cyan", stats.drafts, "Draft problems"],
            [Rocket, "emerald", stats.published, "Published problems"],
            [Users, "rose", stats.solves, "Student solves"],
          ].map(([Icon, tone, value, label]) => (
            <div className="admin-metric-card" key={label}>
              <div className={`admin-metric-icon ${tone}`}>
                <Icon size={20} />
              </div>
              <div className="admin-metric-data">
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ================= SETS ================= */}
        <section className="admin-curriculum-panel">
          <div className="admin-track-tabs" role="tablist" aria-label="Filter sets">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`admin-track-tab ${filter === f.id ? "active" : ""}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && problems.length === 0 ? (
            <div className="arena-list">
              {[0, 1, 2].map((n) => (
                <div key={n} className="arena-skeleton" />
              ))}
            </div>
          ) : loadError ? (
            <div className="admin-empty-state">
              <AlertCircle size={36} />
              <h3>Couldn't load arena problems</h3>
              <p>{loadError}</p>
              <button type="button" className="admin-btn primary" onClick={load}>
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          ) : visibleSets.length === 0 ? (
            <div className="admin-empty-state">
              <Sparkles size={36} />
              <h3>{sets.length === 0 ? "No arena problems yet" : "Nothing in this filter"}</h3>
              <p>
                {sets.length === 0
                  ? "Generate your first contest — 6 problems saved as drafts so you can review them before students see them."
                  : "Try another filter."}
              </p>
              {sets.length === 0 && (
                <button type="button" className="admin-btn primary" onClick={openGenerator}>
                  <Sparkles size={14} /> Generate Problems
                </button>
              )}
            </div>
          ) : (
            <div className="arena-list">
              {visibleSets.map((set) => (
                <div key={set.key} className="arena-set">
                  <div className="arena-set-head">
                    <div>
                      <h3 className="arena-set-title">
                        {set.contest ? `Edition #${set.contest.edition}` : "Contest set"} · created{" "}
                        {new Date(set.createdAt).toLocaleDateString()}
                      </h3>
                      <p className="arena-set-story">{set.problems[0]?.sourceDescription}</p>
                      <div className="arena-set-meta">
                        <span className={`admin-tag ${set.drafts === 0 ? "arena-live" : "draft"}`}>
                          {set.drafts === 0
                            ? "Published"
                            : set.published === 0
                            ? "Draft"
                            : `${set.published}/${set.problems.length} published`}
                        </span>
                        {set.contest && (
                          <span className={`admin-tag ${STAGE_TAGS[set.contest.stage]?.[0] || "custom"}`}>
                            {STAGE_TAGS[set.contest.stage]?.[1] || set.contest.stage}
                          </span>
                        )}
                        {set.contest && (
                          <span className="admin-tag custom">
                            <CalendarClock size={10} /> {formatWindow(set.contest)}
                          </span>
                        )}
                        {set.contest && (
                          <span className="admin-tag custom">{set.contest.participants} registered</span>
                        )}
                        {set.contest?.registrationOpensAt && set.contest.status !== "ARCHIVED" && (
                          <span className={`admin-tag ${set.contest.registrationOpen ? "arena-live" : "draft"}`}>
                            {set.contest.registrationOpen
                              ? "Registration open"
                              : new Date(set.contest.registrationOpensAt) > new Date()
                              ? `Registration opens ${new Date(set.contest.registrationOpensAt).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                              : "Registration closed"}
                          </span>
                        )}
                        {set.contest?.medalCount > 0 && (
                          <span className="admin-tag modified">{set.contest.medalCount} medals awarded</span>
                        )}
                        <span className="admin-tag custom">{set.problems.length} problems</span>
                        <span className="admin-tag modified">{formatXp(set.totalXp)} XP total</span>
                        <span className="admin-tag custom">
                          {set.attempts} attempts · {set.solves} solved
                        </span>
                      </div>
                    </div>
                    {set.batchId && (
                      <div className="arena-set-actions">
                        <button
                          type="button"
                          className="admin-btn secondary"
                          onClick={() => openPreview(set.problems[0].id)}
                        >
                          <Eye size={14} /> Preview
                        </button>
                        {set.contest?.status !== "ARCHIVED" ? (
                          <>
                            <button
                              type="button"
                              className="admin-btn primary"
                              onClick={() => handleSetPublish(set)}
                              disabled={Boolean(busyAction)}
                            >
                              {set.drafts > 0 ? <Rocket size={14} /> : <EyeOff size={14} />}
                              {set.drafts > 0 ? `Publish all ${set.problems.length}` : "Unpublish set"}
                            </button>
                            {set.contest && (
                              <button
                                type="button"
                                className="admin-btn secondary"
                                onClick={() => setScheduleOpen((open) => (open === set.batchId ? null : set.batchId))}
                                disabled={Boolean(busyAction)}
                              >
                                <CalendarClock size={14} /> Schedule
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-btn secondary"
                              onClick={() => handleSetRegenerate(set)}
                              disabled={Boolean(busyAction)}
                            >
                              <RefreshCw size={14} /> Regenerate set
                            </button>
                          </>
                        ) : (
                          <span className="admin-tag modified">
                            <Archive size={11} /> Read-only history
                          </span>
                        )}
                        <button
                          type="button"
                          className="admin-btn danger"
                          onClick={() => handleSetDelete(set)}
                          disabled={Boolean(busyAction)}
                        >
                          <Trash2 size={14} /> {set.attempts === 0 && set.published === 0 ? "Discard set" : "Delete set"}
                        </button>
                      </div>
                    )}
                  </div>

                  {scheduleOpen === set.batchId && set.contest && (
                    <ContestScheduleEditor
                      key={`${set.contest.startsAt}-${set.contest.endsAt}`}
                      contest={set.contest}
                      busy={busyAction === `schedule-${set.batchId}`}
                      onSave={(window) => handleSchedule(set, window)}
                    />
                  )}

                  {set.problems.map((p) => (
                    <article
                      key={p.id}
                      className="admin-lesson-card arena-problem-row"
                      style={{ "--tier": p.difficultyColor || "#a855f7" }}
                    >
                      <div className="admin-lesson-left">
                        <span className="arena-tier-badge">#{(p.difficultyIndex ?? 0) + 1}</span>
                        <div className="admin-lesson-info">
                          <div className="admin-lesson-title-row">
                            <h3>{p.title}</h3>
                            <span className={`admin-tag ${p.status === "PUBLISHED" ? "arena-live" : "draft"}`}>
                              {p.status === "PUBLISHED" ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="admin-lesson-meta">
                            <span className="arena-xp-chip">
                              <Zap size={12} /> {formatXp(p.xp)} XP
                            </span>
                            <span>{p.difficulty}</span>
                            <span>
                              <ImageIcon size={12} /> {p.hasImage ? "Illustration" : "No image"}
                            </span>
                            <span>
                              <Users size={12} /> {p.attemptCount} attempts · {p.solvedCount} solved
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="admin-lesson-right">
                        <button type="button" className="admin-action-btn edit" onClick={() => openPreview(p.id)}>
                          <Eye size={14} />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn edit"
                          onClick={() => handlePublishToggle(p)}
                          disabled={busyAction === `status-${p.id}`}
                        >
                          {p.status === "PUBLISHED" ? <EyeOff size={14} /> : <Rocket size={14} />}
                          <span>{p.status === "PUBLISHED" ? "Unpublish" : "Publish"}</span>
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn delete"
                          onClick={() => handleDelete(p)}
                          disabled={busyAction === `delete-${p.id}`}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ================= PREVIEW ================= */}
      {preview && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Problem preview"
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}
        >
          <div className="admin-modal-card arena-preview-card">
            <div className="admin-modal-header">
              <div>
                <div className="admin-modal-breadcrumb">
                  <span className="admin-badge-track">Preview</span>
                  {preview.status && (
                    <span className={`admin-tag ${preview.status === "PUBLISHED" ? "arena-live" : "draft"}`}>
                      {preview.status === "PUBLISHED" ? "Published" : "Draft · not visible to students"}
                    </span>
                  )}
                </div>
                <h2>{preview.title || "Loading preview…"}</h2>
                {previewSet && (
                  <div className="arena-preview-nav" role="tablist" aria-label="Problems in this set">
                    {previewSet.problems.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="tab"
                        aria-selected={p.id === preview.id}
                        className={p.id === preview.id ? "active" : ""}
                        onClick={() => p.id !== preview.id && openPreview(p.id)}
                        title={p.title}
                      >
                        #{(p.difficultyIndex ?? 0) + 1} · {p.xp} XP
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="admin-close-btn" onClick={() => setPreview(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>

            {previewLoading || !preview.title ? (
              <div className="arena-skeleton tall" />
            ) : (
              <div className="arena-preview-body">
                <ArenaProblemView problem={preview} variant="admin" />

                <aside className="arena-preview-side">
                  <div className="arena-side-card">
                    <h4>XP reward</h4>
                    <XpTierPicker
                      compact
                      value={preview.xp}
                      onChange={(xp) => handleSetXp(preview, xp)}
                      disabled={busyAction === `xp-${preview.id}`}
                    />
                    <p>Hint drops the student reward by 25%.</p>
                  </div>

                  <div className="arena-side-card">
                    <h4>Hidden tests</h4>
                    <div className="arena-set-meta" style={{ marginTop: 0 }}>
                      <span
                        className={`admin-tag ${
                          preview.validationStatus === "validated"
                            ? "arena-live"
                            : preview.validationStatus === "failed"
                            ? "draft"
                            : "modified"
                        }`}
                      >
                        {preview.validationStatus === "validated"
                          ? "✓ Validated"
                          : preview.validationStatus === "failed"
                          ? "✗ Validation failed"
                          : "Not validated"}
                      </span>
                      <span className="admin-tag custom">{preview.hiddenTests?.length ?? 0} hidden tests</span>
                    </div>
                    <p>
                      {preview.hiddenTests?.length
                        ? "Submissions must pass every hidden test. Expected outputs come from the reference solution, cross-checked by a brute-force solution."
                        : "No hidden tests: submissions are judged on the visible examples only, so hardcoded answers could pass."}
                    </p>
                    {preview.validationError && <p style={{ color: "#fb7185" }}>{preview.validationError}</p>}
                    {preview.hiddenTests?.length > 0 && (
                      <details className="arena-raw">
                        <summary>Show tests (admin only)</summary>
                        <pre>
                          {preview.hiddenTests
                            .map((t) => `#${t.number} [${t.kind}]\nin:  ${t.input}\nout: ${t.expectedOutput}`)
                            .join("\n\n")}
                        </pre>
                      </details>
                    )}
                    {preview.referenceSolution && (
                      <details className="arena-raw">
                        <summary>Reference solution (Python)</summary>
                        <pre>{preview.referenceSolution}</pre>
                      </details>
                    )}
                  </div>

                  <div className="arena-side-card">
                    <h4>Generation metadata</h4>
                    <dl>
                      <MetaRow label="Core idea">{preview.coreIdea}</MetaRow>
                      <MetaRow label="Diagram style">
                        {preview.canBeExplainedByDiagrams ? "2×2 step diagram" : "Story illustration"}
                      </MetaRow>
                      <MetaRow label="Contest story">{preview.sourceDescription}</MetaRow>
                      <MetaRow label="Story part">{preview.storyPart}</MetaRow>
                      <MetaRow label="Image prompt">{preview.imagePrompt}</MetaRow>
                      <MetaRow label="Image error">
                        {!preview.hasImage ? preview.rawOutput?.imageError || null : null}
                      </MetaRow>
                      <MetaRow label="Stats">
                        {preview.attemptCount !== undefined
                          ? `${preview.attemptCount} attempts · ${preview.solvedCount} solved · ${preview.hintCount} hints`
                          : null}
                      </MetaRow>
                    </dl>
                    {preview.rawOutput && (
                      <details className="arena-raw">
                        <summary>Raw generator output</summary>
                        <pre>{JSON.stringify(preview.rawOutput, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                </aside>
              </div>
            )}

            <div className="admin-modal-footer arena-preview-footer">
              <div className="admin-footer-buttons">
                {previewSet && (
                  <>
                    <button
                      type="button"
                      className="admin-btn danger"
                      onClick={() => handleSetDelete(previewSet)}
                      disabled={!preview.title || Boolean(busyAction)}
                    >
                      <Trash2 size={14} />
                      <span>
                        {previewSet.attempts === 0 && previewSet.published === 0 ? "Discard set" : "Delete set"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="admin-btn secondary"
                      onClick={() => handleSetRegenerate(previewSet)}
                      disabled={!preview.title || Boolean(busyAction)}
                    >
                      <RefreshCw size={14} />
                      <span>Regenerate set</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setEditing(preview)}
                  disabled={!preview.title || Boolean(busyAction)}
                >
                  <Edit3 size={14} />
                  <span>Edit this problem</span>
                </button>
              </div>
              {previewSet ? (
                <button
                  type="button"
                  className="admin-btn primary"
                  onClick={() => handleSetPublish(previewSet)}
                  disabled={!preview.title || Boolean(busyAction)}
                >
                  {previewSet.drafts > 0 ? <CheckCircle2 size={15} /> : <EyeOff size={15} />}
                  <span>
                    {previewSet.drafts > 0 ? `Save & Publish all ${previewSet.problems.length}` : "Unpublish set"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-btn primary"
                  onClick={() => handlePublishToggle(preview)}
                  disabled={!preview.title || Boolean(busyAction)}
                >
                  {preview.status === "PUBLISHED" ? <EyeOff size={15} /> : <CheckCircle2 size={15} />}
                  <span>{preview.status === "PUBLISHED" ? "Unpublish" : "Save & Publish"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <GenerateProblemModal
        isOpen={generateOpen}
        regenerateFrom={regenerateFrom}
        onClose={() => {
          setGenerateOpen(false);
          setRegenerateFrom(null);
        }}
        onGenerated={handleGenerated}
      />

      {editing && (
        <ArenaProblemEditModal
          problem={editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEditing(null);
            applyUpdated(saved);
            notify(`Saved changes to "${saved.title}".`);
          }}
        />
      )}

      {toast && (
        <div className={`arena-toast ${toast.tone}`} role="status" key={toast.id}>
          {toast.tone === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </HubLayout>
  );
}
