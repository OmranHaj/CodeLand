import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Bot, X } from "lucide-react";

export default function AiVerdictCard({ verdict, onClose }) {
  if (!verdict) return null;

  const isAccepted = verdict.verdict === "Accepted";
  const isCompilationError = verdict.verdict === "Compilation Error";
  const isTimeLimit = verdict.verdict === "Time Limit Exceeded";

  const theme = isAccepted
    ? {
        border: "rgba(16, 185, 129, 0.45)",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(6, 78, 59, 0.28))",
        color: "#10b981",
        badgeBg: "rgba(16, 185, 129, 0.2)",
        badgeText: "#34d399",
      }
    : isCompilationError
      ? {
          border: "rgba(244, 63, 94, 0.45)",
          background: "linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(136, 19, 55, 0.28))",
          color: "#f43f5e",
          badgeBg: "rgba(244, 63, 94, 0.2)",
          badgeText: "#fb7185",
        }
      : {
          border: "rgba(245, 158, 11, 0.45)",
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(120, 53, 15, 0.28))",
          color: "#f59e0b",
          badgeBg: "rgba(245, 158, 11, 0.2)",
          badgeText: "#fbbf24",
        };

  return (
    <div
      style={{
        margin: "10px 16px",
        padding: "14px 18px",
        borderRadius: "12px",
        border: `1px solid ${theme.border}`,
        background: theme.background,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        animation: "aiFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isAccepted ? (
            <CheckCircle2 size={18} color={theme.color} />
          ) : isCompilationError ? (
            <XCircle size={18} color={theme.color} />
          ) : isTimeLimit ? (
            <Clock size={18} color={theme.color} />
          ) : (
            <AlertTriangle size={18} color={theme.color} />
          )}

          <span
            style={{
              fontWeight: 800,
              fontSize: "13px",
              letterSpacing: "0.6px",
              color: theme.color,
              textTransform: "uppercase",
            }}
          >
            {verdict.verdict}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: theme.badgeText,
              background: theme.badgeBg,
              padding: "3px 9px",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Bot size={12} />
            AI Judge
          </span>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: 0,
                color: "#94a3b8",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                borderRadius: "4px",
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {verdict.feedback_ar && (
        <div
          dir="rtl"
          style={{
            fontSize: "13px",
            lineHeight: "1.65",
            color: "#f1f5f9",
            fontWeight: 500,
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            background: "rgba(0, 0, 0, 0.2)",
            padding: "8px 12px",
            borderRadius: "8px",
            borderRight: `3px solid ${theme.color}`,
          }}
        >
          {verdict.feedback_ar}
        </div>
      )}

      {verdict.failed_scenario && verdict.failed_scenario !== "None" && (
        <div
          style={{
            fontSize: "11px",
            color: "#cbd5e1",
            background: "rgba(2, 6, 23, 0.5)",
            padding: "8px 12px",
            borderRadius: "6px",
            fontFamily: "'Fira Code', monospace",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <span style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", fontSize: "10px" }}>
            Failed Scenario / Diagnosis:
          </span>
          <span style={{ color: theme.badgeText, wordBreak: "break-word" }}>
            {verdict.failed_scenario}
          </span>
        </div>
      )}
    </div>
  );
}
