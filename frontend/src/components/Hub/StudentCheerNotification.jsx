import React, { useState, useEffect, useCallback } from "react";
import { Heart, Sparkles, X, Check, MessageSquareHeart } from "lucide-react";
import { getStudentCheers, markCheerAsRead } from "../../services/cheerService";
import soundEngine from "../../services/soundEngine";

export default function StudentCheerNotification() {
  const [cheers, setCheers] = useState([]);
  const [dismissingId, setDismissingId] = useState(null);

  const fetchCheers = useCallback(async () => {
    try {
      const data = await getStudentCheers();
      if (Array.isArray(data)) {
        setCheers(data);
      }
    } catch {
      // ignore background polling errors
    }
  }, []);

  useEffect(() => {
    fetchCheers();
    // Poll every 30 seconds for real-time family cheers
    const interval = setInterval(fetchCheers, 30000);
    return () => clearInterval(interval);
  }, [fetchCheers]);

  const handleDismiss = async (cheerId) => {
    setDismissingId(cheerId);
    try {
      soundEngine.playClick("pop");
      await markCheerAsRead(cheerId);
      setCheers((prev) => prev.filter((c) => c.id !== cheerId));
    } catch {
      // fallback filter
      setCheers((prev) => prev.filter((c) => c.id !== cheerId));
    } finally {
      setDismissingId(null);
    }
  };

  if (!cheers || cheers.length === 0) {
    return null;
  }

  // Display the latest cheer message
  const activeCheer = cheers[0];

  return (
    <div
      style={{
        margin: "0 0 24px 0",
        background:
          "linear-gradient(135deg, rgba(244, 63, 94, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)",
        border: "1px solid rgba(244, 63, 94, 0.35)",
        borderRadius: "18px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        boxShadow: "0 8px 32px rgba(244, 63, 94, 0.15)",
        backdropFilter: "blur(12px)",
        position: "relative",
        overflow: "hidden",
        animation: "fadeInSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Decorative background glow beam */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-10%",
          width: "120px",
          height: "200%",
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)",
          transform: "rotate(25deg)",
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(244, 63, 94, 0.45)",
            flexShrink: 0,
            color: "#fff",
          }}
        >
          <Heart size={22} fill="currentColor" />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "3px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "#fda4af",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Sparkles size={11} /> Cheer Note from {activeCheer.parentName}
            </span>
            {cheers.length > 1 && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "8px",
                  background: "rgba(244, 63, 94, 0.2)",
                  color: "#fecdd3",
                  fontWeight: "600",
                }}
              >
                +{cheers.length - 1} more
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "600",
              color: "#f8fafc",
              letterSpacing: "0.2px",
            }}
          >
            “{activeCheer.message}”
          </p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <button
          onClick={() => handleDismiss(activeCheer.id)}
          disabled={dismissingId === activeCheer.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(244, 63, 94, 0.2)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            color: "#fda4af",
            padding: "8px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244, 63, 94, 0.35)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(244, 63, 94, 0.2)";
            e.currentTarget.style.color = "#fda4af";
          }}
        >
          <Check size={14} /> Got it, thanks!
        </button>

        <button
          onClick={() => handleDismiss(activeCheer.id)}
          aria-label="Dismiss cheer note"
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
