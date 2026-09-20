import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  TrendingUp,
  Printer,
  Copy,
  Check,
  Plus,
  Compass,
  MessageSquareHeart,
  Send,
  Target,
  Brain,
  X
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import ParentMasteryOrb from "../../components/Parent/ParentMasteryOrb";
import { getParentInviteCode, getUser, readStored, writeStored, startPreview } from "../../services/learningHub";
import { apiRequest } from "../../services/api";
import {
  buildParentChildrenList,
  generate30DayActivity
} from "../../data/parentMockData";
import styles from "./ParentDashboard.module.css";

export default function ParentDashboard() {
  const [user, setUser] = useState(getUser);
  const [copyStatus, setCopyStatus] = useState("");
  const [cheerInput, setCheerInput] = useState("");
  const [cheerSent, setCheerSent] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkInputCode, setLinkInputCode] = useState("");
  const [linkSuccessMessage, setLinkSuccessMessage] = useState("");

  useEffect(() => {
    async function syncUser() {
      const token = localStorage.getItem("codeland_token");
      if (token) {
        try {
          const profile = await apiRequest("/auth/me");
          if (profile) {
            const rawRole = (profile.role || "").toLowerCase();
            const updated = {
              ...getUser(),
              ...profile,
              role: rawRole === "child" ? "student" : rawRole,
              parentCode: profile.parentCode,
              inviteCode: profile.parentCode || profile.inviteCode,
              fullName: profile.name || profile.fullName,
            };
            writeStored("codeland_current_user", updated);
            setUser(updated);
          }
        } catch {
          // ignore error
        }
      }
    }
    syncUser();

    const handleUpdate = () => setUser(getUser());
    window.addEventListener("codeland:update", handleUpdate);
    return () => window.removeEventListener("codeland:update", handleUpdate);
  }, []);

  const inviteCode = user?.parentCode || user?.inviteCode || getParentInviteCode(user) || "";

  const mockMode = import.meta.env.VITE_USE_MOCK_API === "true";
  const storedUsers = mockMode ? readStored("codeland_mock_users", []) : [];

  // Build the list of children (sample or linked)
  const children = useMemo(() => {
    return buildParentChildrenList(storedUsers, user?.id);
  }, [storedUsers, user?.id]);

  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id);

  const selectedChild = useMemo(() => {
    return children.find((c) => c.id === selectedChildId) || children[0];
  }, [children, selectedChildId]);

  // Generate 30-day activity telemetry for the selected child
  const activityDays = useMemo(() => {
    return generate30DayActivity(selectedChild?.activityLevel || "high");
  }, [selectedChild]);

  // Weekly study goal state
  const [weeklyGoal, setWeeklyGoal] = useState(selectedChild?.weeklyGoalHours || 6);

  // Copy invitation code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(""), 3000);
    } catch {
      setCopyStatus("Select code manually");
    }
  };

  // Send Cheer to Child
  const handleSendCheer = (e) => {
    e.preventDefault();
    if (!cheerInput.trim()) return;
    setCheerSent(true);
    setCheerInput("");
    setTimeout(() => setCheerSent(false), 4000);
  };

  // Handle Link Child
  const handleLinkChild = (e) => {
    e.preventDefault();
    if (!linkInputCode.trim()) return;
    setLinkSuccessMessage(`Successfully connected student account (${linkInputCode})!`);
    setTimeout(() => {
      setLinkSuccessMessage("");
      setShowLinkModal(false);
      setLinkInputCode("");
    }, 2000);
  };

  // Print Monthly Report
  const handlePrintReport = () => {
    window.print();
  };

  // If not logged in as parent, show preview / login screen
  if (user?.role !== "parent") {
    return (
      <HubLayout title="Family Observatory">
        <div className="hub-empty">
          <Users size={40} color="#a855f7" />
          <h1>A Front-Row Seat to Their Future.</h1>
          <p>
            Sign in with a parent account to observe your family's 30-day learning journey,
            review skill progress, and guide their coding habits.
          </p>
          <div className="hub-flex" style={{ justifyContent: "center", marginTop: "20px" }}>
            <Link to="/login" className="hub-btn primary">
              Parent Log In
            </Link>
            <button
              className="hub-btn"
              onClick={() => {
                startPreview("parent");
                setUser(getUser());
              }}
            >
              Preview Parent Observatory
            </button>
          </div>
        </div>
      </HubLayout>
    );
  }

  return (
    <HubLayout title="Parent Observatory">
      <div className={styles.dashboard}>
        {/* Top Header */}
        <div className={styles.topHeader}>
          <div className={styles.headerTitleArea}>
            <div className="hub-eyebrow">
              <Heart size={13} color="#f43f5e" /> PARENT OBSERVATORY & INSIGHTS
            </div>
            <h1>Empowering Their Coding Journey</h1>
            <p className={styles.headerSubtitle}>
              Monitor 30-day learning activity, track skill mastery across Algorithms, Web, and C++,
              and celebrate every milestone together.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.actionBtn}
              onClick={handlePrintReport}
              title="Print or export monthly learning report"
            >
              <Printer size={15} /> Print Monthly Report
            </button>

            <button
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={handleCopyCode}
              title="Copy family invite code"
            >
              {copyStatus ? <Check size={15} /> : <Copy size={15} />}
              {copyStatus ? "Code Copied!" : `Family Code: ${inviteCode}`}
            </button>
          </div>
        </div>

        {/* Dedicated Family Invitation Code Banner */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          padding: "16px 22px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(16, 22, 39, 0.9))",
          border: "1px solid #6366f1",
          borderRadius: "16px",
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.2)",
              display: "grid",
              placeItems: "center",
              color: "#c4b5fd",
              flexShrink: 0
            }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "14px", color: "#f8fafc" }}>Your Family Invitation Code</strong>
                <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "6px", background: "rgba(99, 102, 241, 0.25)", color: "#c4b5fd", fontWeight: "700" }}>STUDENT REGISTRATION</span>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: "3px 0 0 0" }}>
                Share this code with your child. Entering it when creating their student account will automatically link them to you.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <code style={{
              fontFamily: "monospace",
              fontSize: "18px",
              fontWeight: "700",
              letterSpacing: "3px",
              padding: "8px 16px",
              background: "#0d1222",
              border: "1px dashed #6366f1",
              borderRadius: "10px",
              color: "#c4b5fd"
            }}>
              {inviteCode}
            </code>
            <button
              className={styles.actionBtn}
              onClick={handleCopyCode}
              style={{ padding: "9px 14px" }}
            >
              {copyStatus ? <Check size={15} color="#34d399" /> : <Copy size={15} />}
              <span>{copyStatus ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
        </div>

        {/* Child Selector Tabs Bar */}
        <div className={styles.childSelectorBar}>
          <div className={styles.childTabs}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
              Enrolled Children:
            </span>
            {children.map((child) => {
              const isSelected = child.id === selectedChild.id;
              return (
                <button
                  key={child.id}
                  className={`${styles.childTab} ${isSelected ? styles.childTabActive : ""}`}
                  onClick={() => {
                    setSelectedChildId(child.id);
                    setWeeklyGoal(child.weeklyGoalHours || 6);
                  }}
                >
                  <div className={styles.childAvatar} style={{ background: child.themeColor }}>
                    {child.avatar}
                  </div>
                  <div className={styles.childTabInfo}>
                    <span className={styles.childTabName}>{child.fullName}</span>
                    <span className={styles.childTabMeta}>
                      {child.grade} · {child.streakDays}d Streak 🔥
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            className={styles.linkChildBtn}
            onClick={() => setShowLinkModal(true)}
          >
            <Plus size={14} /> Link Child Account
          </button>
        </div>

        {/* Hero Grid: 3D Mastery Beacon + 4 Quick Stat Cards */}
        <div className={styles.heroGrid}>
          {/* 3D Mastery Beacon Card */}
          <div className={styles.beaconCard}>
            <div className={styles.beaconHeader}>
              <span className={styles.beaconBadge} style={{ color: selectedChild.themeColor, borderColor: `${selectedChild.themeColor}50` }}>
                {selectedChild.activePath}
              </span>
              <div className={styles.beaconStatus}>
                <span className={styles.beaconStatusDot} style={{ background: selectedChild.themeColor, boxShadow: `0 0 10px ${selectedChild.themeColor}` }} />
                <span>Active Today</span>
              </div>
            </div>

            <ParentMasteryOrb
              color={selectedChild.themeColor}
              childName={selectedChild.fullName}
              rankTitle={selectedChild.rankTitle}
              level={selectedChild.level}
            />

            <div style={{ marginTop: "14px", textAlign: "center" }}>
              <h3 style={{ fontSize: "17px", margin: "0 0 4px 0", color: "#f8fafc" }}>
                {selectedChild.fullName}
              </h3>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
                {selectedChild.rankTitle} · {selectedChild.grade}
              </p>
            </div>
          </div>

          {/* 4 Stat Cards with 3D Tilt Hover */}
          <div className={styles.statsGrid}>
            {/* Stat 1: 30-Day Study Time */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ color: "#38bdf8", background: "rgba(56, 189, 248, 0.12)", borderColor: "rgba(56, 189, 248, 0.25)" }}>
                  <Clock size={22} />
                </div>
                <span className={styles.statTrend}>
                  <TrendingUp size={12} /> +18% vs last month
                </span>
              </div>
              <div className={styles.statMain}>
                <div className={styles.statValue}>{selectedChild.monthlyHours} hrs</div>
                <div className={styles.statLabel}>30-Day Learning Time</div>
                <div className={styles.statSubtext}>Average ~50 mins per active day</div>
              </div>
            </div>

            {/* Stat 2: Current Streak */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.12)", borderColor: "rgba(245, 158, 11, 0.25)" }}>
                  <Flame size={22} />
                </div>
                <span className={styles.statTrend} style={{ color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.25)" }}>
                  Unbroken
                </span>
              </div>
              <div className={styles.statMain}>
                <div className={styles.statValue}>{selectedChild.streakDays} Days 🔥</div>
                <div className={styles.statLabel}>Daily Habit Streak</div>
                <div className={styles.statSubtext}>Consistent coding every single day</div>
              </div>
            </div>

            {/* Stat 3: Quiz Accuracy */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.12)", borderColor: "rgba(16, 185, 129, 0.25)" }}>
                  <CheckCircle2 size={22} />
                </div>
                <span className={styles.statTrend}>
                  {selectedChild.quizMetrics.persistenceRating}
                </span>
              </div>
              <div className={styles.statMain}>
                <div className={styles.statValue}>{selectedChild.quizMetrics.accuracy}%</div>
                <div className={styles.statLabel}>Quiz & Concept Accuracy</div>
                <div className={styles.statSubtext}>
                  {selectedChild.quizMetrics.challengesSolved} of {selectedChild.quizMetrics.totalQuizzesTaken} challenges passed
                </div>
              </div>
            </div>

            {/* Stat 4: Total XP & Level */}
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIconWrap} style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.12)", borderColor: "rgba(168, 85, 247, 0.25)" }}>
                  <Award size={22} />
                </div>
                <span className={styles.statTrend} style={{ color: "#a855f7", background: "rgba(168, 85, 247, 0.1)", borderColor: "rgba(168, 85, 247, 0.25)" }}>
                  Level {selectedChild.level}
                </span>
              </div>
              <div className={styles.statMain}>
                <div className={styles.statValue}>{selectedChild.totalXp.toLocaleString()} XP</div>
                <div className={styles.statLabel}>Total Experience Points</div>
                <div className={styles.statSubtext}>{selectedChild.quizMetrics.playgroundRuns} code executions in lab</div>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Activity Heatmap Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <CalendarIcon /> 30-Day Learning Activity Heatmap
              </h2>
              <div className={styles.panelSubtitle}>
                Hover over any day to inspect coding session duration and completed lessons
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className={styles.heatmapLegend}>
              <span>Less</span>
              <div className={styles.legendBox} style={{ background: "#141b30" }} title="0 mins" />
              <div className={styles.legendBox} style={{ background: "rgba(16, 185, 129, 0.25)" }} title="15 - 30 mins" />
              <div className={styles.legendBox} style={{ background: "rgba(16, 185, 129, 0.55)" }} title="30 - 60 mins" />
              <div className={styles.legendBox} style={{ background: "#10b981" }} title="60+ mins" />
              <span>More</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className={styles.heatmapGrid}>
            {activityDays.map((day, idx) => {
              let cellClass = styles.heatmapCellEmpty;
              if (day.minutes >= 60) cellClass = styles.heatmapCellHigh;
              else if (day.minutes >= 30) cellClass = styles.heatmapCellMed;
              else if (day.minutes > 0) cellClass = styles.heatmapCellLow;

              return (
                <div
                  key={idx}
                  className={`${styles.heatmapCell} ${cellClass}`}
                  title={`${day.date} (${day.dayName}): ${day.minutes} mins · ${day.lessonsCompleted} lessons`}
                >
                  <span>{day.dayNumber}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.heatmapFooter}>
            <div>
              <strong>Active Learning Time:</strong> Typically active between <strong>3:30 PM – 5:30 PM</strong>
            </div>
            <div>
              <strong>Longest Session:</strong> 90 minutes on recent weekend
            </div>
          </div>
        </div>

        {/* 2-Column Analytics Grid: Left (Study Hours & Subject Mastery) | Right (AI Insights, Badges, Cheer) */}
        <div className={styles.analyticsGrid}>
          {/* Left Column: Weekly Hours + Subject Mastery */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Weekly Study Hours Breakdown */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>
                    <TrendingUp size={18} color="#818cf8" /> Weekly Study Hours
                  </h2>
                  <div className={styles.panelSubtitle}>
                    Weekly progress toward target of {weeklyGoal} hrs/week
                  </div>
                </div>
              </div>

              <div className={styles.weeklyBars}>
                {selectedChild.weeklyBreakdown.map((w, idx) => {
                  const percent = Math.min(100, Math.round((w.hours / 8) * 100));
                  const targetPercent = Math.round((weeklyGoal / 8) * 100);
                  return (
                    <div key={idx} className={styles.weekRow}>
                      <span className={styles.weekLabel}>{w.week}</span>
                      <div className={styles.weekTrack}>
                        <div
                          className={styles.weekFill}
                          style={{ width: `${percent}%` }}
                        />
                        <div
                          className={styles.weekTargetLine}
                          style={{ left: `${targetPercent}%` }}
                          title={`Target: ${weeklyGoal} hrs`}
                        />
                      </div>
                      <span className={styles.weekHours}>{w.hours}h</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Mastery Progress */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>
                    <Compass size={18} color="#10b981" /> Curriculum & Skill Mastery
                  </h2>
                  <div className={styles.panelSubtitle}>
                    Current standing across core coding disciplines
                  </div>
                </div>
              </div>

              <div className={styles.subjectList}>
                {selectedChild.subjectMastery.map((subj) => (
                  <div key={subj.id} className={styles.subjectCard}>
                    <div className={styles.subjectHeader}>
                      <span className={styles.subjectTitle}>{subj.title}</span>
                      <span className={styles.subjectSectors}>
                        {subj.completedSectors} ({subj.percent}%)
                      </span>
                    </div>

                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${subj.percent}%`, background: subj.color }}
                      />
                    </div>

                    <div className={styles.skillChips}>
                      {subj.keySkills.map((skill, sIdx) => (
                        <span key={sIdx} className={styles.skillChip}>
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Insights, Badges, Parental Cheer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* AI Parent Insights & Conversation Starter */}
            <div className={styles.aiInsightCard}>
              <div className={styles.insightHeader}>
                <div className={styles.insightIconWrap}>
                  <Brain size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "14px", color: "#f8fafc", fontWeight: 700 }}>
                    Parent AI Guidance & Insight
                  </h3>
                  <span style={{ fontSize: "10px", color: "#c4b5fd" }}>
                    Personalized based on {selectedChild.fullName}'s recent work
                  </span>
                </div>
              </div>

              <div className={styles.insightPromptBox}>
                <strong>Ask About the Discovery:</strong>
                "{selectedChild.aiInsights.conversationStarter}"
              </div>

              <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.6" }}>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>Key Strength:</strong> {selectedChild.aiInsights.strength}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Growth Tip:</strong> {selectedChild.aiInsights.growthTip}
                </p>
              </div>
            </div>

            {/* Recent Milestones & Badges */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>
                    <Award size={18} color="#fbbf24" /> 30-Day Milestones & Badges
                  </h2>
                  <div className={styles.panelSubtitle}>
                    Achievements unlocked this past month
                  </div>
                </div>
              </div>

              <div className={styles.badgeList}>
                {selectedChild.recentBadges.map((b) => (
                  <div key={b.id} className={styles.badgeRow}>
                    <div className={styles.badgeIcon}>{b.icon}</div>
                    <div className={styles.badgeContent}>
                      <div className={styles.badgeTitle}>{b.title}</div>
                      <div className={styles.badgeDesc}>{b.desc}</div>
                    </div>
                    <span className={styles.badgeDate}>{b.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parental Actions: Goal Setter & Cheer Sender */}
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2 className={styles.panelTitle}>
                    <MessageSquareHeart size={18} color="#f43f5e" /> Send Parent Cheer
                  </h2>
                  <div className={styles.panelSubtitle}>
                    Send an encouraging note to appear on {selectedChild.fullName}'s learning hub
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendCheer} className={styles.cheerSection}>
                <div className={styles.cheerChips}>
                  {[
                    "Super proud of your streak! 🔥",
                    "Your algorithm logic was brilliant! 🚀",
                    "Keep building! You've got this! 💻",
                    "Take a break and grab a healthy snack! 🍎"
                  ].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      className={styles.cheerChip}
                      onClick={() => setCheerInput(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className={styles.cheerInput}
                    placeholder={`Write a cheer note to ${selectedChild.fullName}...`}
                    value={cheerInput}
                    onChange={(e) => setCheerInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                    style={{ padding: "0 16px" }}
                  >
                    <Send size={15} />
                  </button>
                </div>

                {cheerSent && (
                  <div style={{ fontSize: "11px", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={14} /> Cheer note delivered to {selectedChild.fullName}'s dashboard!
                  </div>
                )}
              </form>

              {/* Weekly Goal Adjuster */}
              <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #1c263d", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Target size={16} color="#818cf8" />
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>Weekly Target Goal:</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    className="hub-btn small"
                    onClick={() => setWeeklyGoal((g) => Math.max(2, g - 1))}
                  >
                    -
                  </button>
                  <strong style={{ fontSize: "12px", color: "#f8fafc" }}>{weeklyGoal} hrs / wk</strong>
                  <button
                    className="hub-btn small"
                    onClick={() => setWeeklyGoal((g) => Math.min(15, g + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link Child Modal */}
        {showLinkModal && (
          <div className={styles.modalOverlay} onClick={() => setShowLinkModal(false)}>
            <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.modalClose}
                onClick={() => setShowLinkModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <h2 style={{ fontSize: "18px", margin: "0 0 8px 0", color: "#f8fafc" }}>
                Link Student Account
              </h2>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "18px" }}>
                Enter your child's student username, email, or student invitation code to connect
                their learning records to your family dashboard.
              </p>

              <form onSubmit={handleLinkChild} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "#cbd5e1", marginBottom: "6px" }}>
                    Student Code or Email
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.cheerInput}
                    placeholder="e.g. STU-8921 or child@codeland.com"
                    value={linkInputCode}
                    onChange={(e) => setLinkInputCode(e.target.value)}
                  />
                </div>

                {linkSuccessMessage && (
                  <div style={{ fontSize: "12px", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Check size={14} /> {linkSuccessMessage}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                  <button
                    type="button"
                    className="hub-btn"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                  >
                    Connect Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </HubLayout>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
