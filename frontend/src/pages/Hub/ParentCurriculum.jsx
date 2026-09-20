import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Compass,
  Code2,
  Cpu,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";

export default function ParentCurriculum() {
  const tracks = [
    {
      id: "algo",
      title: "Algorithm & Data Structures",
      subtitle: "Computer Science Foundations & Problem Solving",
      badge: "AGES 10 – 16",
      accent: "#10b981",
      icon: Boxes,
      description:
        "The Quantum Citadel immerses learners in the fundamental data structures and algorithmic thinking patterns that power modern technology.",
      modules: [
        "Numbered Lockers: Contiguous Arrays & Memory Layout",
        "Pincer Movement: Two-Pointer & Sliding Window Algorithms",
        "Cafeteria Stack: Last-In, First-Out (LIFO) Discipline",
        "Magic Book Sniper: Binary Search & Logarithmic Efficiency",
        "Branching Trees: Hierarchical Organization & Traversals",
        "Instant Vault: Hash Tables & Key-Value Lookups",
        "Connected Citadels: Graph Networks & Pathfinding",
        "Memory Bank: Dynamic Programming & Memoization"
      ],
      skillsLearned: [
        "Algorithmic efficiency (Big-O notation intuition)",
        "Mathematical and computational decomposition",
        "Step-by-step debugging and test case verification"
      ],
      parentBenefit:
        "Strengthens school mathematics, spatial reasoning, and critical thinking with intuitive 3D visual analogies."
    },
    {
      id: "web",
      title: "Web Creator",
      subtitle: "Frontend Engineering, Design & Interactivity",
      badge: "AGES 8 – 14",
      accent: "#8b5cf6",
      icon: Code2,
      description:
        "A highly visual, creative journey where students build their own responsive websites and interactive web applications from scratch.",
      modules: [
        "HTML Foundations: Semantic Tags, Headers & Page Structure",
        "CSS Styling: Colors, Modern Typography, Flexbox & Grid",
        "JavaScript Core: Events, Variables, Conditions & DOM Control",
        "React Nexus: Component Architecture & State Management",
        "Project Showcase: Publishing & Sharing Custom Projects"
      ],
      skillsLearned: [
        "Visual design principles and color harmony",
        "Interactive UI architecture and user experience",
        "Hands-on project development from concept to reality"
      ],
      parentBenefit:
        "Kids see instant visual results for every line of code they write, building deep confidence and creative drive."
    },
    {
      id: "cpp",
      title: "C++ Developer",
      subtitle: "Systems Programming & Performance Computing",
      badge: "AGES 11 – 16",
      accent: "#f59e0b",
      icon: Cpu,
      description:
        "A deep dive into computational architecture, memory management, and industrial-strength systems programming.",
      modules: [
        "Syntax Core: Data Types, Constants & Safe Input/Output",
        "Data Circuits: Loops, Iteration & Control Flow",
        "Logic Gates: Boolean Logic & Complex Decision Systems",
        "Function Engine: Modularity, Parameters & Return Types",
        "Array Matrix: Multi-Dimensional Data & Traversal",
        "Memory Vault: Pointers, References & Memory Allocation",
        "Object Forge: Object-Oriented Classes & Encapsulation",
        "STL Command: Standard Library Vectors, Sets & Maps"
      ],
      skillsLearned: [
        "Hardware-level computational understanding",
        "High-performance memory management",
        "Strict type systems and software engineering rigor"
      ],
      parentBenefit:
        "Prepares students for advanced high-school computer science (AP CS), engineering competitions, and robotics."
    }
  ];

  return (
    <HubLayout title="Curriculum Guide">
      <div className="hub-heading">
        <div>
          <div className="hub-eyebrow">
            <GraduationCap size={14} color="#a78bfa" /> PARENT CURRICULUM ROADMAP
          </div>
          <h1>What Your Child Learns at CodeLand</h1>
          <p>
            An educational guide designed for parents to understand the learning objectives,
            cognitive skills, and real-world outcomes of each curriculum track.
          </p>
        </div>
        <Link to="/parent/dashboard" className="hub-btn ghost">
          Back to Observatory <ArrowRight size={14} />
        </Link>
      </div>

      {/* Safety & Educational Principles Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "18px",
          marginBottom: "32px",
          padding: "24px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 22, 39, 0.9))",
          border: "1px solid #312e81",
          borderRadius: "18px"
        }}
      >
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <ShieldCheck size={26} color="#34d399" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ display: "block", color: "#f8fafc", fontSize: "14px", marginBottom: "4px" }}>
              100% Safe, Ad-Free Learning
            </strong>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
              No third-party advertisements, no unmoderated public chat rooms, and zero tracking. A private, secure sandbox built strictly for learning.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <Sparkles size={26} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ display: "block", color: "#f8fafc", fontSize: "14px", marginBottom: "4px" }}>
              Youth-Friendly 3D Analogies
            </strong>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
              Abstract computer science concepts are taught through tangible visual sketches and 3D simulations (e.g. school lockers, cafeteria trays, book-guessing).
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
          <Layers size={26} color="#a855f7" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong style={{ display: "block", color: "#f8fafc", fontSize: "14px", marginBottom: "4px" }}>
              Scaffolded Mastery
            </strong>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
              Each lesson pairs interactive concept explanation with code playground practice, instant automated feedback, and cheer reactions from our 3D mascot robot.
            </p>
          </div>
        </div>
      </div>

      {/* Curriculum Tracks */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {tracks.map((track) => {
          const Icon = track.icon;
          return (
            <article
              key={track.id}
              className="hub-panel"
              style={{
                border: `1px solid ${track.accent}35`,
                background: "linear-gradient(165deg, #111728, #0c1120)",
                borderRadius: "20px",
                padding: "28px"
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  flexWrap: "wrap",
                  marginBottom: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background: `${track.accent}20`,
                      border: `1px solid ${track.accent}40`,
                      color: track.accent,
                      display: "grid",
                      placeItems: "center"
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc" }}>
                        {track.title}
                      </h2>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: `${track.accent}18`,
                          border: `1px solid ${track.accent}40`,
                          color: track.accent
                        }}
                      >
                        {track.badge}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "12px" }}>
                      {track.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.7", marginBottom: "20px" }}>
                {track.description}
              </p>

              {/* 3-Column Detail Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  paddingTop: "18px",
                  borderTop: "1px solid #1e293b"
                }}
              >
                {/* Modules */}
                <div>
                  <strong style={{ display: "block", fontSize: "12px", color: track.accent, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Curriculum Modules:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12px", color: "#94a3b8", lineHeight: "1.8" }}>
                    {track.modules.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Skills */}
                <div>
                  <strong style={{ display: "block", fontSize: "12px", color: track.accent, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Skills Developed:
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {track.skillsLearned.map((s, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#cbd5e1" }}>
                        <CheckCircle2 size={14} color={track.accent} style={{ flexShrink: 0 }} />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why It Matters for Parents */}
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.6)",
                    border: "1px dashed #334155",
                    borderRadius: "14px",
                    padding: "16px"
                  }}
                >
                  <strong style={{ display: "block", fontSize: "12px", color: "#e2e8f0", marginBottom: "6px" }}>
                    💡 Why It Matters for Your Child
                  </strong>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.6" }}>
                    {track.parentBenefit}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </HubLayout>
  );
}
