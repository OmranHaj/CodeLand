import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Heart,
  Eye,
  Smile,
  Lock,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Lightbulb
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";

export default function ParentGuide() {
  const conversationQuestions = [
    {
      prompt: "“Can you show me what your code does when you click that button?”",
      why: "Encourages demonstration and verbal communication of logic without needing code knowledge."
    },
    {
      prompt: "“What bug or error did you run into today, and how did you solve it?”",
      why: "Reframes errors as exciting puzzles rather than failures, reinforcing growth mindset."
    },
    {
      prompt: "“Can you teach me what an algorithm is in your own words?”",
      why: "Teaching a parent is the ultimate test of true understanding."
    }
  ];

  const safetyGuarantees = [
    {
      icon: Lock,
      title: "Zero Third-Party Ads or Tracking",
      desc: "CodeLand is strictly educational. We do not sell user data, run advertising networks, or track children across the web."
    },
    {
      icon: Eye,
      title: "Closed, Safe Coding Sandbox",
      desc: "All code runs in an isolated client environment. There is no open public chat room or unmoderated communication."
    },
    {
      icon: ShieldCheck,
      title: "Parent-Gated Invitations",
      desc: "Student accounts can only be created and linked with a verified parent invitation code, keeping you in full control."
    }
  ];

  const faqs = [
    {
      q: "My child is completely new to coding. Which path should they start with?",
      a: "We recommend Web Creator for beginners aged 8–12. It provides immediate, colorful visual feedback (seeing buttons, colors, and layout changes). If they are 11+ and enjoy math or puzzle games, Algorithm & Data Structures is also a wonderful starting point."
    },
    {
      q: "What should my child do if they get stuck on a difficult challenge?",
      a: "Encourage them to view the 3D visual sketch analogies in the Algorithm Lab, re-run test cases, or take a 10-minute break. In coding, stepping away often lets the brain find the solution effortlessly."
    },
    {
      q: "How many hours per week should my child spend on CodeLand?",
      a: "We recommend 3 to 6 hours per week, ideally divided into 30 to 45-minute daily sessions. Consistency is far more effective than long, exhausting weekend marathon sessions."
    }
  ];

  return (
    <HubLayout title="Parent Guide">
      <div className="hub-heading">
        <div>
          <div className="hub-eyebrow">
            <ShieldCheck size={14} color="#34d399" /> PARENT GUIDANCE & SAFETY
          </div>
          <h1>Empowering Your Young Creator</h1>
          <p>
            You don't need a computer science degree to support your child's coding journey.
            Here is everything you need to guide, protect, and inspire them.
          </p>
        </div>

        <Link to="/parent/dashboard" className="hub-btn ghost">
          Back to Observatory <ArrowRight size={14} />
        </Link>
      </div>

      {/* Hero Tip Card */}
      <div
        className="hub-panel"
        style={{
          background: "linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(16, 22, 39, 0.95))",
          border: "1px solid rgba(244, 63, 94, 0.35)",
          borderRadius: "20px",
          padding: "26px",
          marginBottom: "28px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <Heart size={22} color="#f43f5e" />
          <h2 style={{ margin: 0, fontSize: "17px", color: "#f8fafc" }}>
            The #1 Secret to Supporting a Young Programmer
          </h2>
        </div>
        <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13px", lineHeight: "1.7" }}>
          You don't have to read their code or understand syntax. Instead, be their <strong>biggest cheerleader and curious audience</strong>.
          Asking <em>“Can you show me what you built?”</em> inspires pride and builds communication skills that last a lifetime.
        </p>
      </div>

      {/* 2-Column Section: Conversation Starters & Safety Guarantees */}
      <div className="hub-columns" style={{ marginBottom: "28px" }}>
        {/* Conversation Starters */}
        <section className="hub-panel" style={{ borderRadius: "18px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <MessageCircle size={18} color="#818cf8" />
            <h2 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>
              Great Conversation Starters
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {conversationQuestions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  background: "#12182c",
                  border: "1px solid #1f2a44",
                  borderRadius: "12px",
                  padding: "14px 16px"
                }}
              >
                <strong style={{ display: "block", color: "#c4b5fd", fontSize: "12px", marginBottom: "4px" }}>
                  {q.prompt}
                </strong>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", lineHeight: "1.5" }}>
                  💡 {q.why}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Digital Safety & Child Privacy */}
        <aside className="hub-panel" style={{ borderRadius: "18px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Lock size={18} color="#34d399" />
            <h2 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>
              Digital Safety & Privacy
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {safetyGuarantees.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(52, 211, 153, 0.15)",
                      display: "grid",
                      placeItems: "center",
                      color: "#34d399",
                      flexShrink: 0
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#f8fafc", fontSize: "12px", marginBottom: "2px" }}>
                      {s.title}
                    </strong>
                    <p style={{ margin: 0, color: "#94a3b8", fontSize: "11px", lineHeight: "1.5" }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Parent FAQs Accordion / List */}
      <div className="hub-panel" style={{ borderRadius: "18px", padding: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
          <HelpCircle size={18} color="#fbbf24" />
          <h2 style={{ margin: 0, fontSize: "16px", color: "#f8fafc" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#12182c",
                border: "1px solid #1f2a44"
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#f8fafc" }}>
                {faq.q}
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", lineHeight: "1.7" }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </HubLayout>
  );
}
