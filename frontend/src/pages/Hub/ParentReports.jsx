import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Printer,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { getUser, readStored } from "../../services/learningHub";
import { buildParentChildrenList } from "../../data/parentMockData";
import { getParentChildren } from "../../services/parentService";

export default function ParentReports() {
  const user = getUser();
  const [realChildren, setRealChildren] = useState([]);

  useEffect(() => {
    async function loadChildren() {
      const data = await getParentChildren();
      if (Array.isArray(data) && data.length > 0) {
        setRealChildren(data);
      }
    }
    loadChildren();
  }, []);

  // const mockMode = import.meta.env.VITE_USE_MOCK_API === "true";
  // const storedUsers = mockMode ? readStored("codeland_mock_users", []) : [];

  const children = useMemo(() => {
    if (realChildren.length > 0) {
      return buildParentChildrenList(realChildren, user?.id);
    }
    // Mock data fallback commented out:
    // return buildParentChildrenList(storedUsers, user?.id);
    return buildParentChildrenList([]);
  }, [realChildren, user?.id]);

  const [selectedChildId, setSelectedChildId] = useState(children[0]?.id);

  useEffect(() => {
    if (children.length > 0 && !children.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(children[0]?.id);
    }
  }, [children, selectedChildId]);

  const selectedChild = useMemo(() => {
    return children.find((c) => c.id === selectedChildId) || children[0];
  }, [children, selectedChildId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <HubLayout title="Monthly Reports">
      <div className="hub-heading">
        <div>
          <div className="hub-eyebrow">
            <FileText size={14} color="#38bdf8" /> MONTHLY ACADEMIC & PROGRESS AUDIT
          </div>
          <h1>Official Learning Progress Reports</h1>
          <p>
            Comprehensive monthly performance review, screen-time balance, curriculum milestones,
            and downloadable certificates for your records.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="hub-btn primary" onClick={handlePrint}>
            <Printer size={15} /> Print / Export Official Report
          </button>
        </div>
      </div>

      {/* Child Selector Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 18px",
          background: "#0f1527",
          border: "1px solid #202b44",
          borderRadius: "14px",
          marginBottom: "28px",
          flexWrap: "wrap"
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
          Select Student:
        </span>
        {children.map((child) => {
          const isSelected = child.id === selectedChild.id;
          return (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 14px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                background: isSelected ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2), #1e1b4b)" : "#131a2e",
                border: isSelected ? "1px solid #6366f1" : "1px solid #263352",
                color: isSelected ? "#ffffff" : "#94a3b8"
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: child.themeColor,
                  color: "white",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "10px",
                  fontWeight: "700"
                }}
              >
                {child.avatar}
              </span>
              <span>{child.fullName}</span>
            </button>
          );
        })}
      </div>

      {/* Official Monthly Report Card Container */}
      <div
        className="hub-panel"
        style={{
          background: "linear-gradient(170deg, #10162a, #0b0f1d)",
          border: "1px solid #283556",
          borderRadius: "20px",
          padding: "32px"
        }}
      >
        {/* Certificate / Report Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid #1f2b47",
            paddingBottom: "22px",
            marginBottom: "26px",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="#fbbf24" />
              <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "1.5px", color: "#a5b4fc", textTransform: "uppercase" }}>
                CodeLand Academic Progress Certificate
              </span>
            </div>
            <h2 style={{ fontSize: "24px", color: "#f8fafc", margin: "6px 0 4px 0" }}>
              Monthly Evaluation for {selectedChild.fullName}
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
              Period: Past 30 Days · Grade: {selectedChild.grade} · Standing:{" "}
              <strong style={{ color: "#34d399" }}>Excellent (Top 5% Habit Consistency)</strong>
            </p>
          </div>

          <div
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              textAlign: "right"
            }}
          >
            <span style={{ fontSize: "10px", color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "1px", display: "block" }}>
              Overall Accuracy
            </span>
            <strong style={{ fontSize: "22px", color: "#34d399" }}>
              {selectedChild.quizMetrics.accuracy}%
            </strong>
          </div>
        </div>

        {/* 4 Summary Metric Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "30px"
          }}
        >
          <div style={{ padding: "16px", background: "#12192e", borderRadius: "14px", border: "1px solid #1f2a48" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Total Study Time
            </span>
            <strong style={{ fontSize: "22px", color: "#38bdf8" }}>
              {selectedChild.monthlyHours} Hours
            </strong>
            <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
              Target: {selectedChild.weeklyGoalHours * 4} hrs/month
            </span>
          </div>

          <div style={{ padding: "16px", background: "#12192e", borderRadius: "14px", border: "1px solid #1f2a48" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Active Streak
            </span>
            <strong style={{ fontSize: "22px", color: "#f59e0b" }}>
              {selectedChild.streakDays} Days 🔥
            </strong>
            <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
              Continuous daily sessions
            </span>
          </div>

          <div style={{ padding: "16px", background: "#12192e", borderRadius: "14px", border: "1px solid #1f2a48" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Challenges Solved
            </span>
            <strong style={{ fontSize: "22px", color: "#34d399" }}>
              {selectedChild.quizMetrics.challengesSolved} Passed
            </strong>
            <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
              {selectedChild.quizMetrics.totalQuizzesTaken} quizzes evaluated
            </span>
          </div>

          <div style={{ padding: "16px", background: "#12192e", borderRadius: "14px", border: "1px solid #1f2a48" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Experience Earned
            </span>
            <strong style={{ fontSize: "22px", color: "#c084fc" }}>
              {selectedChild.totalXp.toLocaleString()} XP
            </strong>
            <span style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "4px" }}>
              Level {selectedChild.level} · {selectedChild.rankTitle}
            </span>
          </div>
        </div>

        {/* Screen-Time Health Meter */}
        <div
          style={{
            background: "#131b31",
            border: "1px solid #233152",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "30px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#38bdf8" />
              <strong style={{ fontSize: "14px", color: "#f8fafc" }}>
                Screen-Time Balance & Cognitive Wellness
              </strong>
            </div>
            <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontWeight: "700" }}>
              HEALTHY LEARNING ZONE
            </span>
          </div>

          <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
            {selectedChild.fullName} spends an average of <strong>~50 minutes per active session</strong>,
            which fits perfectly within pediatrician recommendations for productive, screen-positive cognitive exercise.
          </p>

          <div style={{ height: "10px", background: "#0d1324", borderRadius: "5px", overflow: "hidden", display: "flex" }}>
            <div style={{ width: "35%", background: "#38bdf8" }} title="Weekdays (35%)" />
            <div style={{ width: "40%", background: "#818cf8" }} title="Weekend Afternoons (40%)" />
            <div style={{ width: "25%", background: "#34d399" }} title="Coding Labs (25%)" />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "10px", color: "#64748b" }}>
            <span>0 hrs</span>
            <span>Balanced Zone: 4–7 hrs/week</span>
            <span>Excessive: &gt;15 hrs/week</span>
          </div>
        </div>

        {/* Subject Competencies */}
        <h3 style={{ fontSize: "16px", color: "#f8fafc", marginBottom: "14px" }}>
          Subject Competency Breakdown
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {selectedChild.subjectMastery.map((subj) => (
            <div
              key={subj.id}
              style={{
                padding: "16px",
                background: "#12182c",
                border: "1px solid #1f2a44",
                borderRadius: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "13px", color: "#f1f5f9" }}>{subj.title}</strong>
                <span style={{ fontSize: "12px", fontWeight: "700", color: subj.color }}>
                  {subj.percent}% Mastery ({subj.completedSectors})
                </span>
              </div>
              <div style={{ height: "6px", background: "#172138", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${subj.percent}%`, height: "100%", background: subj.color, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </HubLayout>
  );
}
