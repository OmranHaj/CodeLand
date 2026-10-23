import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";

import {

  AlertTriangle,


  BookOpen,

  CheckCircle2,

  ChevronLeft,

  ChevronRight,

  Clock,

  Code2,

  Copy,

  Cpu,

  Crown,

  Flame,

  HelpCircle,

  Lock,

  Play,

  RotateCcw,

  Send,

  ShieldAlert,

  ShieldCheck,

  Sparkles,

  Trophy,

  Zap,

} from "lucide-react";

import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";

import ArenaRichText, { renderInline } from "../Arena/ArenaRichText";
import {
  fetchArenaProblem,
  fetchArenaProblems,
  formatXp,
  revealArenaHint,
  runArenaExamples,
  submitArenaSolution,
  xpAfterHint,
} from "../../services/arenaProblemService";




const ARENA_STYLES = String.raw`
.cinematic-arena {
  --arena-bg: #03050d;
  --arena-panel: rgba(7, 11, 24, 0.72);
  --arena-panel-strong: rgba(5, 8, 18, 0.9);
  --arena-line: rgba(148, 163, 184, 0.14);
  --arena-muted: #73809a;
  --arena-text: #e7edf8;
  --arena-cyan: #38bdf8;
  --arena-green: #34d399;
  --arena-yellow: #fbbf24;
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  overflow: hidden;
  padding: 28px;
  color: var(--arena-text);
  background:
    radial-gradient(circle at 75% 10%, color-mix(in srgb, var(--chapter-accent) 18%, transparent), transparent 32%),
    radial-gradient(circle at 15% 75%, rgba(14, 165, 233, 0.08), transparent 34%),
    linear-gradient(180deg, #040611 0%, #02030a 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.cinematic-arena *,
.cinematic-arena *::before,
.cinematic-arena *::after {
  box-sizing: border-box;
}

.cinematic-arena button,
.cinematic-arena select,
.cinematic-arena textarea {
  font: inherit;
}

.arena-three-layer,
.arena-vignette,
.arena-scanlines,
.arena-noise,
.arena-cursor-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.arena-three-layer {
  z-index: -5;
  opacity: 0.8;
  mask-image: linear-gradient(to bottom, #000 0%, #000 74%, transparent 100%);
}

.arena-three-layer canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.arena-vignette {
  z-index: -3;
  background:
    radial-gradient(circle at center, transparent 25%, rgba(0, 0, 0, 0.42) 74%, rgba(0, 0, 0, 0.82) 100%),
    linear-gradient(90deg, rgba(2, 6, 23, 0.65), transparent 24%, transparent 72%, rgba(2, 6, 23, 0.52));
}

.arena-scanlines {
  z-index: 4;
  opacity: 0.16;
  mix-blend-mode: soft-light;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgba(255, 255, 255, 0.05) 4px
  );
}

.arena-noise {
  z-index: -1;
  opacity: 0.14;
  background-image:
    linear-gradient(115deg, transparent 0 48%, rgba(255,255,255,.035) 49%, transparent 50%),
    linear-gradient(45deg, rgba(255,255,255,.018) 25%, transparent 25%, transparent 75%, rgba(255,255,255,.018) 75%);
  background-size: 17px 17px, 8px 8px;
}

.arena-cursor-glow {
  inset: auto;
  z-index: -2;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  opacity: 0.42;
  filter: blur(26px);
  background: radial-gradient(circle, color-mix(in srgb, var(--chapter-accent) 20%, transparent), transparent 68%);
  will-change: transform;
}

.arena-content-shell {
  position: relative;
  z-index: 2;
  width: min(1540px, 100%);
  margin: 0 auto;
}

.arena-glass {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--arena-line);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), transparent 32%),
    linear-gradient(180deg, rgba(9, 14, 29, 0.86), rgba(5, 8, 18, 0.72));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.045),
    0 30px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(22px) saturate(1.18);
  -webkit-backdrop-filter: blur(22px) saturate(1.18);
}

.arena-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(115deg, color-mix(in srgb, var(--chapter-accent) 8%, transparent), transparent 32% 72%, rgba(56, 189, 248, 0.035));
}

/* HERO */
.arena-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 236px;
  gap: 28px;
  min-height: 274px;
  padding: 30px 34px;
  border-radius: 28px;
}

.arena-hero::after {
  content: "";
  position: absolute;
  top: 0;
  left: 12%;
  width: 42%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--chapter-accent), transparent);
  opacity: 0.75;
  box-shadow: 0 0 20px var(--chapter-accent);
}

.arena-hero-copy {
  align-self: center;
  min-width: 0;
}

.arena-kicker,
.arena-eyebrow,
.hero-metric span,
.reactor-core span,
.reactor-core small,
.sector-index,
.chapter-sector-tag,
.chrome-left,
.intel-label,
.transmission-head,
.vector-number,
.terminal-header,
.arena-footer {
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.arena-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  padding: 6px 10px;
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 999px;
  color: #fcd34d;
  background: rgba(251, 191, 36, 0.055);
  font-size: 10px;
  font-weight: 800;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.08), 0 0 14px #22c55e;
  animation: arenaLivePulse 1.8s ease-in-out infinite;
}

.kicker-divider {
  width: 18px;
  height: 1px;
  background: rgba(251, 191, 36, 0.38);
}

.arena-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-top: 20px;
}

.arena-eyebrow {
  margin: 0 0 4px;
  color: #77839a;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 9px;
  font-weight: 700;
}

.arena-main-title {
  margin: 0;
  max-width: 860px;
  color: #f8fbff;
  font-size: clamp(30px, 4vw, 58px);
  font-weight: 900;
  line-height: 0.98;
  letter-spacing: -0.045em;
  text-wrap: balance;
  text-shadow: 0 0 42px color-mix(in srgb, var(--chapter-accent) 20%, transparent);
}

.operator-chip {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  max-width: 260px;
  padding: 8px 10px;
  border: 1px solid rgba(56, 189, 248, 0.17);
  border-radius: 10px;
  color: #a9b5ca;
  background: rgba(3, 7, 18, 0.55);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 10px;
}

.operator-chip > span:not(.operator-status) {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operator-status {
  color: #34d399;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.arena-prologue {
  max-width: 880px;
  margin: 15px 0 0;
  color: #aab4c6;
  font-size: 13px;
  line-height: 1.72;
}

.hero-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 22px;
}

.hero-metric {
  min-width: 110px;
  padding: 9px 11px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 11px;
  background: rgba(3, 7, 18, 0.4);
}

.hero-metric span {
  display: block;
  margin-bottom: 3px;
  color: #5f6d85;
  font-size: 8px;
  font-weight: 800;
}

.hero-metric strong {
  color: #dce6f5;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
}

.progress-metric {
  width: min(230px, 100%);
}

.progress-metric i {
  display: block;
  height: 2px;
  margin-top: 7px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.12);
}

.progress-metric i b {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--chapter-accent), #38bdf8);
  box-shadow: 0 0 12px var(--chapter-accent);
  transition: width 0.5s ease;
}

.score-reactor {
  position: relative;
  align-self: center;
  justify-self: center;
  width: 204px;
  height: 204px;
  display: grid;
  place-items: center;
}

.hero-orbit,
.hero-orbit-secondary {
  position: absolute;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--chapter-accent) 40%, transparent);
  box-shadow: inset 0 0 18px color-mix(in srgb, var(--chapter-accent) 8%, transparent);
}

.hero-orbit {
  inset: 2px;
  border-left-color: transparent;
  border-bottom-color: rgba(56, 189, 248, 0.55);
}

.hero-orbit::before,
.hero-orbit-secondary::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--chapter-accent);
  box-shadow: 0 0 14px var(--chapter-accent);
}

.hero-orbit-secondary {
  inset: 19px;
  border-style: dashed;
  opacity: 0.52;
}

.reactor-core {
  width: 138px;
  height: 138px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--chapter-accent) 30%, transparent);
  border-radius: 50%;
  color: var(--chapter-accent);
  background:
    radial-gradient(circle, color-mix(in srgb, var(--chapter-accent) 14%, rgba(3, 7, 18, 0.76)), rgba(3, 7, 18, 0.92) 66%);
  box-shadow:
    inset 0 0 35px color-mix(in srgb, var(--chapter-accent) 10%, transparent),
    0 0 45px color-mix(in srgb, var(--chapter-accent) 10%, transparent);
}

.reactor-core span {
  margin-top: 7px;
  color: #8190aa;
  font-size: 8px;
  font-weight: 800;
}

.reactor-core strong {
  margin: 2px 0;
  color: #f8fafc;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 25px;
  line-height: 1;
}

.reactor-core small {
  color: var(--chapter-accent);
  font-size: 6px;
  font-weight: 900;
}

/* SECTOR RAIL */
.sector-rail {
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  margin: 15px 0;
  padding: 7px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 18px;
  background: rgba(3, 6, 15, 0.58);
  backdrop-filter: blur(14px);
}

.sector-rail-line {
  position: absolute;
  left: 3%;
  right: 3%;
  bottom: -1px;
  height: 1px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.08);
}

.sector-rail-line span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #34d399, var(--chapter-accent));
  box-shadow: 0 0 12px var(--chapter-accent);
  transition: width 0.55s ease;
}

.sector-node {
  --sector-accent: #8b5cf6;
  position: relative;
  min-width: 0;
  min-height: 72px;
  display: grid;
  grid-template-columns: 26px 30px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #64748b;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, opacity 0.2s ease;
}

.sector-node::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: linear-gradient(135deg, color-mix(in srgb, var(--sector-accent) 14%, transparent), transparent 56%);
  transition: opacity 0.25s ease;
}

.sector-node:hover:not(:disabled)::before,
.sector-node.is-active::before {
  opacity: 1;
}

.sector-node:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--sector-accent) 22%, transparent);
  color: #cbd5e1;
}

.sector-node.is-active {
  border-color: color-mix(in srgb, var(--sector-accent) 48%, transparent);
  color: #f8fafc;
  background: rgba(8, 12, 25, 0.7);
  box-shadow: inset 0 0 24px color-mix(in srgb, var(--sector-accent) 6%, transparent);
}

.sector-node.is-done {
  --sector-accent: #34d399 !important;
}

.sector-node.is-locked {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.7);
}

.sector-index {
  position: relative;
  z-index: 1;
  color: #526078;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  font-weight: 800;
  writing-mode: vertical-rl;
}

.sector-icon {
  position: relative;
  z-index: 1;
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  color: var(--sector-accent);
  background: rgba(3, 7, 18, 0.72);
  box-shadow: 0 0 16px color-mix(in srgb, var(--sector-accent) 7%, transparent);
}

.sector-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.sector-copy b,
.sector-copy em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sector-copy b {
  color: currentColor;
  font-size: 10px;
  font-style: normal;
  font-weight: 750;
}

.sector-copy em {
  margin-top: 3px;
  color: var(--sector-accent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.sector-signal {
  position: absolute;
  top: 0;
  right: 0;
  width: 22px;
  height: 1px;
  background: var(--sector-accent);
  opacity: 0;
  box-shadow: 0 0 10px var(--sector-accent);
}

.sector-node.is-active .sector-signal {
  opacity: 1;
}

/* WORKSPACE */
.arena-workspace {
  display: grid;
  grid-template-columns: minmax(320px, 0.88fr) minmax(500px, 1.42fr);
  gap: 15px;
  align-items: stretch;
}

.mission-panel,
.ide-panel {
  min-width: 0;
  border-radius: 22px;
}

.mission-panel {
  display: flex;
  min-height: 710px;
  flex-direction: column;
}

.ide-panel {
  min-height: 710px;
  display: grid;
  grid-template-rows: auto minmax(340px, 1fr) auto auto;
}

.panel-chrome,
.ide-header,
.terminal-header,
.ide-action-bar {
  position: relative;
  z-index: 1;
  border-color: rgba(148, 163, 184, 0.1);
  background: rgba(3, 7, 18, 0.55);
}

.panel-chrome {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.chrome-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #66748c;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  font-weight: 800;
}

.chrome-lights {
  display: flex;
  gap: 5px;
}

.chrome-lights i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #334155;
}

.chrome-lights i:nth-child(1) { background: #ef4444; }
.chrome-lights i:nth-child(2) { background: #f59e0b; }
.chrome-lights i:nth-child(3) { background: #22c55e; }

.chapter-nav-arrows {
  display: flex;
  gap: 4px;
}

.chapter-nav-arrows button,
.ide-tools button,
.intel-tabs button,
.test-button,
.submit-button {
  border: 0;
  outline: 0;
}

.chapter-nav-arrows button {
  width: 28px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 7px;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.44);
  cursor: pointer;
}

.chapter-nav-arrows button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.mission-scroll {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 24px;
  overflow: auto;
}

.mission-scroll::-webkit-scrollbar,
.terminal-body::-webkit-scrollbar,
.editor-stage textarea::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

.mission-scroll::-webkit-scrollbar-thumb,
.terminal-body::-webkit-scrollbar-thumb,
.editor-stage textarea::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
}

.chapter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chapter-heading > div {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.chapter-sector-tag {
  color: var(--chapter-accent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 9px;
  font-weight: 900;
}

.chapter-arabic {
  padding-inline-start: 9px;
  border-inline-start: 1px solid rgba(148, 163, 184, 0.16);
  color: #8290a8;
  font-size: 11px;
  direction: rtl;
}

.difficulty-pill {
  flex: 0 0 auto;
  padding: 5px 8px;
  border: 1px solid color-mix(in srgb, var(--chapter-accent) 30%, transparent);
  border-radius: 7px;
  color: var(--chapter-accent);
  background: color-mix(in srgb, var(--chapter-accent) 7%, transparent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chapter-title {
  margin: 12px 0 17px;
  color: #f7faff;
  font-size: clamp(24px, 2.6vw, 38px);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.02;
}

.transmission-card {
  position: relative;
  padding: 15px 16px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--chapter-accent) 18%, transparent);
  border-left: 2px solid var(--chapter-accent);
  border-radius: 0 12px 12px 0;
  background: linear-gradient(90deg, color-mix(in srgb, var(--chapter-accent) 7%, rgba(4, 8, 18, 0.72)), rgba(4, 8, 18, 0.45));
}

.transmission-card::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-105%);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--chapter-accent) 9%, transparent), transparent);
  animation: transmissionSweep 5s ease-in-out infinite;
}

.transmission-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--chapter-accent);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
  font-weight: 900;
}

.transmission-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 12px;
}

.transmission-wave i {
  width: 2px;
  height: 4px;
  border-radius: 2px;
  background: currentColor;
  animation: waveBars 1s ease-in-out infinite alternate;
}

.transmission-wave i:nth-child(2) { animation-delay: .12s; height: 8px; }
.transmission-wave i:nth-child(3) { animation-delay: .24s; height: 11px; }
.transmission-wave i:nth-child(4) { animation-delay: .36s; height: 7px; }
.transmission-wave i:nth-child(5) { animation-delay: .48s; height: 4px; }

.transmission-card p {
  position: relative;
  z-index: 1;
  margin: 8px 0 0;
  color: #9ca9bd;
  font-size: 12.5px;
  font-style: italic;
  line-height: 1.7;
}

.intel-tabs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 6px;
  margin: 18px 0 13px;
  padding: 4px;
  border: 1px solid rgba(148, 163, 184, 0.09);
  border-radius: 10px;
  background: rgba(2, 6, 15, 0.46);
}

.intel-tabs button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 7px 8px;
  border-radius: 7px;
  color: #64748b;
  background: transparent;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.intel-tabs button.is-active {
  color: #e6edf8;
  background: color-mix(in srgb, var(--chapter-accent) 9%, rgba(15, 23, 42, 0.7));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--chapter-accent) 16%, transparent);
}

.intel-pane {
  min-height: 220px;
}

.intel-block + .intel-block {
  margin-top: 17px;
}

.intel-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 7px;
  color: #7b899f;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  font-weight: 900;
}

.objective-block p {
  margin: 0;
  color: #bcc6d6;
  font-size: 13px;
  line-height: 1.72;
}

.constraint-grid {
  display: grid;
  gap: 6px;
}

.constraint-grid code {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  padding: 8px 9px;
  border: 1px solid rgba(56, 189, 248, 0.08);
  border-radius: 8px;
  color: #91a1b8;
  background: rgba(2, 6, 15, 0.45);
  font-size: 10.5px;
  overflow-wrap: anywhere;
}

.constraint-grid code span {
  color: #3c4b63;
  font-size: 8px;
}

.vector-list {
  display: grid;
  gap: 8px;
}

.vector-card {
  padding: 11px 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 10px;
  background: rgba(2, 6, 15, 0.45);
}

.vector-number {
  margin-bottom: 7px;
  color: var(--chapter-accent);
  font-size: 7px;
  font-weight: 900;
}

.vector-row {
  display: grid;
  grid-template-columns: 68px minmax(0, 1fr);
  gap: 8px;
  margin-top: 5px;
  color: #627087;
  font-size: 9px;
}

.vector-row code {
  color: #b9c5d6;
  overflow-wrap: anywhere;
}

.vector-expected code {
  color: #34d399;
}

.vector-card p {
  margin: 7px 0 0;
  color: #68758b;
  font-size: 9px;
  line-height: 1.5;
}

.mission-status {
  position: relative;
  z-index: 1;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 15px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(2, 6, 15, 0.62);
  color: #718099;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
  letter-spacing: 0.05em;
}

.mission-status > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mission-status b {
  color: #e2e8f0;
}

.status-slash { color: #334155; }
.status-safe { color: #34d399; }
.status-danger { color: #fb7185; }

/* IDE */
.ide-header {
  min-height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.ide-file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.ide-mark {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, var(--chapter-accent) 25%, transparent);
  border-radius: 9px;
  color: var(--chapter-accent);
  background: color-mix(in srgb, var(--chapter-accent) 7%, transparent);
}

.ide-file-meta strong,
.ide-file-meta small {
  display: block;
}

.ide-file-meta strong {
  color: #dbe5f4;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
}

.ide-file-meta small {
  margin-top: 2px;
  color: #526078;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
  letter-spacing: 0.08em;
}

.ide-tools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ide-tools button,
.language-select {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  color: #7f8ca2;
  background: rgba(15, 23, 42, 0.38);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8px;
}

.ide-tools button {
  cursor: pointer;
}

.ide-tools button:hover {
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.22);
}

.language-select select {
  max-width: 145px;
  border: 0;
  outline: 0;
  color: #c2cede;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 8px;
}

.language-select select option {
  color: #e2e8f0;
  background: #0b1020;
}

.editor-stage {
  position: relative;
  min-height: 340px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(2, 6, 15, 0.76) 48px, transparent 48px),
    radial-gradient(circle at 75% 20%, color-mix(in srgb, var(--chapter-accent) 4%, transparent), transparent 35%),
    rgba(3, 7, 17, 0.66);
}

.editor-stage::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 48px;
  width: 1px;
  background: rgba(148, 163, 184, 0.08);
}

.editor-gutter {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 18px 0;
  overflow: hidden;
  color: #344158;
  background: rgba(2, 6, 15, 0.5);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 11px;
  line-height: 1.72;
  text-align: center;
  user-select: none;
}

.editor-gutter span {
  display: block;
  height: 18.92px;
}

.editor-stage textarea {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 340px;
  padding: 18px 20px;
  resize: none;
  border: 0;
  outline: 0;
  color: #d8e2ef;
  caret-color: var(--chapter-accent);
  background: transparent;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  font-size: 11px;
  line-height: 1.72;
  tab-size: 2;
}

.editor-stage textarea::selection {
  color: #fff;
  background: color-mix(in srgb, var(--chapter-accent) 35%, transparent);
}

.editor-beam {
  position: absolute;
  z-index: 0;
  top: -50%;
  left: 0;
  width: 100%;
  height: 70px;
  opacity: 0.18;
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--chapter-accent) 9%, transparent), transparent);
  animation: editorScan 8s linear infinite;
}

.arena-terminal-window {
  position: relative;
  z-index: 1;
  min-height: 165px;
  max-height: 220px;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: #02040a;
}

.terminal-header {
  min-height: 37px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  color: #536178;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
  font-weight: 800;
}

.terminal-header > div,
.engine-state {
  display: flex;
  align-items: center;
  gap: 7px;
}

.terminal-prompt {
  color: var(--chapter-accent);
  font-size: 13px;
  text-shadow: 0 0 10px var(--chapter-accent);
}

.engine-state i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 9px #34d399;
}

.engine-state.is-running {
  color: var(--chapter-accent);
}

.engine-state.is-running i {
  background: var(--chapter-accent);
  box-shadow: 0 0 12px var(--chapter-accent);
  animation: arenaLivePulse 0.7s ease-in-out infinite;
}

.terminal-body {
  padding: 11px 14px 14px;
  overflow: auto;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 9px;
  line-height: 1.55;
}

.terminal-empty {
  color: #354158;
  font-style: italic;
}

.terminal-empty span {
  margin-right: 7px;
  color: var(--chapter-accent);
}

.terminal-line {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  margin-bottom: 4px;
  color: #8491a6;
}

.terminal-line-no {
  color: #313c50;
  user-select: none;
}

.log-pass { color: #34d399; }
.log-error { color: #fb7185; }
.log-warning { color: #fbbf24; }
.log-success { color: #38bdf8; font-weight: 800; }
.log-score { color: #fde047; font-weight: 800; }

.ide-action-bar {
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 13px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.submission-state {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: #64748b;
  font-size: 9px;
}

.submission-state svg {
  flex: 0 0 auto;
  color: var(--chapter-accent);
}

.submission-state b {
  color: #cbd5e1;
}

.action-buttons {
  display: flex;
  flex: 0 0 auto;
  gap: 7px;
}

.test-button,
.submit-button {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 13px;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 850;
  cursor: pointer;
}

.test-button {
  border: 1px solid rgba(148, 163, 184, 0.13);
  color: #93a0b4;
  background: rgba(15, 23, 42, 0.46);
}

.test-button:hover:not(:disabled) {
  color: #e2e8f0;
  border-color: rgba(148, 163, 184, 0.28);
}

.submit-button {
  position: relative;
  min-width: 148px;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--chapter-accent) 88%, #fff 12%), color-mix(in srgb, var(--chapter-accent) 60%, #312e81));
  box-shadow: 0 8px 28px color-mix(in srgb, var(--chapter-accent) 18%, transparent);
}

.submit-button::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 40%);
  pointer-events: none;
}

.submit-button > * {
  position: relative;
  z-index: 1;
}

.submit-button i {
  width: 3px;
  height: 3px;
  margin-left: 4px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 10px #fff;
}

.submit-button.is-complete {
  --chapter-accent: #10b981;
}

.test-button:disabled,
.submit-button:disabled {
  opacity: 0.52;
  cursor: wait;
}

.spin-icon {
  animation: spinIcon 1s linear infinite;
}

.arena-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 10px;
  padding: 0 5px;
  color: #3f4b61;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 7px;
  font-weight: 800;
}

.arena-footer span:first-child {
  display: flex;
  align-items: center;
  gap: 6px;
}

.arena-footer i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
}

@keyframes arenaLivePulse {
  0%, 100% { opacity: 0.55; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes transmissionSweep {
  0%, 68% { transform: translateX(-105%); }
  92%, 100% { transform: translateX(105%); }
}

@keyframes waveBars {
  from { transform: scaleY(0.45); opacity: 0.45; }
  to { transform: scaleY(1.1); opacity: 1; }
}

@keyframes editorScan {
  from { transform: translateY(0); }
  to { transform: translateY(780px); }
}

@keyframes spinIcon {
  to { transform: rotate(360deg); }
}

@media (max-width: 1180px) {
  .cinematic-arena {
    padding: 20px;
  }

  .arena-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .mission-panel,
  .ide-panel {
    min-height: auto;
  }

  .mission-panel {
    max-height: none;
  }

  .sector-rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .arena-three-layer {
    opacity: 0.58;
  }
}

@media (max-width: 760px) {
  .cinematic-arena {
    padding: 12px;
  }

  .arena-hero {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px;
  }

  .score-reactor {
    display: none;
  }

  .arena-title-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .operator-chip {
    max-width: 100%;
  }

  .sector-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sector-node {
    grid-template-columns: 24px 28px minmax(0, 1fr);
  }

  .chapter-heading,
  .mission-status,
  .ide-header,
  .ide-action-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .mission-status,
  .ide-action-bar {
    padding: 12px;
  }

  .ide-tools,
  .action-buttons {
    width: 100%;
  }

  .ide-tools {
    flex-wrap: wrap;
  }

  .language-select {
    flex: 1;
  }

  .language-select select {
    max-width: none;
    width: 100%;
  }

  .action-buttons > button {
    flex: 1;
  }

  .editor-stage {
    grid-template-columns: 38px minmax(0, 1fr);
  }

  .editor-stage::before {
    left: 38px;
  }

  .editor-stage textarea {
    padding: 16px 13px;
    font-size: 10px;
  }

  .editor-gutter {
    font-size: 9px;
  }

  .arena-footer {
    display: none;
  }
}

@media (max-width: 480px) {
  .sector-rail {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-metric,
  .progress-metric {
    width: auto;
    min-width: 0;
  }

  .chapter-arabic {
    display: none;
  }

  .mission-scroll {
    padding: 18px;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cinematic-arena *,
  .cinematic-arena *::before,
  .cinematic-arena *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
  .mission-promo {
  position: relative;
  margin: 22px 0;
  padding: 14px;
  overflow: hidden;

  border: 1px solid rgba(99, 102, 241, 0.28);
  border-radius: 20px;

  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(139, 92, 246, 0.13),
      transparent 50%
    ),
    linear-gradient(
      145deg,
      rgba(8, 13, 30, 0.96),
      rgba(3, 7, 18, 0.92)
    );

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.38),
    inset 0 0 35px rgba(99, 102, 241, 0.04);
}

.mission-promo::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(168, 85, 247, 0.05),
      transparent
    );

  transform: translateX(-100%);
  animation: promoSweep 5s linear infinite;
}

.mission-promo__header {
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  margin-bottom: 12px;
}

.mission-promo__eyebrow {
  display: block;

  margin-bottom: 4px;

  color: #a78bfa;

  font-family: monospace;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.mission-promo__header h3 {
  margin: 0;

  color: #f8fafc;

  font-size: 15px;
  font-weight: 800;
}

.mission-promo__status {
  color: #34d399;

  font-family: monospace;
  font-size: 9px;
  font-weight: 800;

  text-shadow: 0 0 10px rgba(52, 211, 153, 0.65);
}

.mission-promo__video-shell {
  position: relative;

  overflow: hidden;

  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 14px;

  background: #02040c;

  box-shadow:
    0 0 30px rgba(99, 102, 241, 0.12),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
}

.mission-promo__video {
  display: block;

  width: 100%;
  aspect-ratio: 16 / 9;

  object-fit: cover;

  background: #020617;
}

.mission-promo__scanline {
  position: absolute;
  inset: 0;

  pointer-events: none;

  opacity: 0.13;

  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 3px,
    rgba(255, 255, 255, 0.08) 4px
  );
}

.mission-promo__video-shell::after {
  content: "";

  position: absolute;
  inset: 0;

  pointer-events: none;

  box-shadow:
    inset 0 0 40px rgba(76, 29, 149, 0.18),
    inset 0 0 8px rgba(56, 189, 248, 0.12);
}

.mission-promo__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  margin-top: 10px;

  color: #64748b;

  font-family: monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

@keyframes promoSweep {
  0% {
    transform: translateX(-120%);
  }

  45%,
  100% {
    transform: translateX(120%);
  }
}

@media (max-width: 700px) {
  .mission-promo__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .mission-promo__footer {
    flex-direction: column;
  }
}

`;






function formatArenaTime(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = Math.max(0, totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function StarField({ count = 750, accent = "#8b5cf6" }) {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 7 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      data[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      data[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      data[i * 3 + 2] = radius * Math.cos(phi);
    }
    return data;
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.018;
    pointsRef.current.rotation.x += delta * 0.004;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={accent}
        size={0.035}
        sizeAttenuation
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}

function EnergyCore({ accent, isRunning, isCompleted, chapterIndex }) {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  const ringARef = useRef(null);
  const ringBRef = useRef(null);
  const pulseRef = useRef(0);
  const finalAccent = isCompleted ? "#34d399" : accent || "#8b5cf6";

  useFrame((state, delta) => {
    pulseRef.current += delta;
    if (!groupRef.current || !coreRef.current) return;

    const pointerX = state.pointer?.x || 0;
    const pointerY = state.pointer?.y || 0;
    groupRef.current.rotation.y += delta * 0.12;
    groupRef.current.rotation.x += (pointerY * 0.12 - groupRef.current.rotation.x) * 0.035;
    groupRef.current.position.x += (pointerX * 0.42 - groupRef.current.position.x) * 0.03;

    const pulse = 1 + Math.sin(pulseRef.current * (isRunning ? 6.5 : 2.3)) * (isRunning ? 0.075 : 0.025);
    coreRef.current.scale.setScalar(pulse);

    if (ringARef.current) {
      ringARef.current.rotation.z += delta * (isRunning ? 1.15 : 0.3);
      ringARef.current.rotation.x += delta * 0.08;
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.z -= delta * (isRunning ? 0.9 : 0.22);
      ringBRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={[2.85, 0.35, 0]}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshStandardMaterial
          color={finalAccent}
          emissive={finalAccent}
          emissiveIntensity={isRunning ? 3.6 : 2.1}
          roughness={0.18}
          metalness={0.55}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh scale={1.23}>
        <icosahedronGeometry args={[1.05, 2]} />
        <meshBasicMaterial color={finalAccent} wireframe transparent opacity={0.38} />
      </mesh>

      <mesh ref={ringARef} rotation={[Math.PI / 2.8, 0.2, 0]}>
        <torusGeometry args={[1.65, 0.012, 12, 180]} />
        <meshBasicMaterial color={finalAccent} transparent opacity={0.72} />
      </mesh>

      <mesh ref={ringBRef} rotation={[0.4, Math.PI / 2.2, 0.8]}>
        <torusGeometry args={[1.9, 0.008, 12, 180]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.42} />
      </mesh>

      {Array.from({ length: 6 }).map((_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        const radius = 2.25;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius * 0.52, Math.sin(angle * 1.7) * 0.35]}
            scale={index === chapterIndex ? 1.45 : 1}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial
              color={index <= chapterIndex ? finalAccent : "#334155"}
              transparent
              opacity={index <= chapterIndex ? 0.95 : 0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ArenaBackground({ accent, isRunning, isCompleted, chapterIndex }) {
  return (
    <div className="arena-three-layer" aria-hidden="true">
      <Canvas
        dpr={[1, 1.55]}
        camera={{ position: [0, 0.4, 8.5], fov: 52, near: 0.1, far: 80 }}
      >
        <fog attach="fog" args={["#03050d", 8, 26]} />
        <ambientLight intensity={0.34} />
        <pointLight position={[3.5, 3, 5]} intensity={2.1} color={accent || "#8b5cf6"} />
        <pointLight position={[-5, -1, 2]} intensity={1.2} color="#0ea5e9" />
        <StarField accent={accent} />
        <EnergyCore
          accent={accent}
          isRunning={isRunning}
          isCompleted={isCompleted}
          chapterIndex={chapterIndex}
        />
        <gridHelper args={[30, 30, "#312e81", "#111827"]} position={[0, -3.8, -1]} />
      </Canvas>
    </div>
  );
}

const DB_ARENA_STYLES = String.raw`
.cinematic-arena .intel-tabs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cinematic-arena .intel-tabs button { font-size: 11px; }
.cinematic-arena .intel-label { font-size: 9.5px; letter-spacing: .08em; }
.cinematic-arena .transmission-card p { font-size: 13.5px; }
.arena-prose { color: #c3cddc; font-size: 13.5px; line-height: 1.75; overflow-wrap: anywhere; }
.arena-prose p { margin: 0 0 10px; }
.arena-prose p:last-child { margin-bottom: 0; }
.arena-prose ul { margin: 0 0 10px; padding-left: 18px; }
.arena-prose code { padding: 1px 5px; border-radius: 5px; color: #7dd3fc; background: rgba(56, 189, 248, .1); font-size: .9em; }
.transmission-card .arena-prose { position: relative; z-index: 1; margin-top: 8px; font-style: italic; color: #a9b6c9; }
.cinematic-arena .constraint-grid code { font-size: 12px; color: #b6c3d6; }
.arena-figure { margin: 14px 0 0; }
.arena-figure button { display: block; width: 100%; padding: 0; border: 1px solid color-mix(in srgb, var(--chapter-accent) 22%, transparent); border-radius: 12px; overflow: hidden; background: #050915; cursor: zoom-in; }
.arena-figure img { display: block; width: 100%; max-height: 360px; object-fit: contain; }
.arena-figure figcaption { margin-top: 6px; color: #64748b; font-size: 10.5px; text-align: center; }
.arena-lightbox { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 24px; background: rgba(2, 4, 12, .92); cursor: zoom-out; }
.arena-lightbox img { max-width: min(1100px, 100%); max-height: 90vh; border-radius: 12px; }
.vector-io { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px; margin-top: 6px; }
.vector-io span { display: block; margin-bottom: 4px; color: #627087; font-size: 9px; font-weight: 900; letter-spacing: .1em; }
.vector-io pre { margin: 0; padding: 9px 10px; border: 1px solid rgba(56, 189, 248, .12); border-radius: 8px; color: #e2e8f0; background: #040812; font-family: "SFMono-Regular", Consolas, monospace; font-size: 12.5px; line-height: 1.55; white-space: pre; overflow-x: auto; }
.vector-io .vector-out pre { color: #6ee7b7; }
.cinematic-arena .vector-card p { font-size: 11.5px; color: #8391a7; }
.hint-pane { display: grid; gap: 12px; }
.hint-box { padding: 14px; border: 1px solid rgba(251, 191, 36, .25); border-radius: 12px; background: rgba(251, 191, 36, .05); }
.hint-box h4 { display: flex; align-items: center; gap: 7px; margin: 0 0 8px; color: #fbbf24; font-size: 12px; }
.hint-box p { margin: 0 0 12px; color: #c3cddc; font-size: 12.5px; line-height: 1.6; }
.hint-foot { margin-top: 10px; color: #fbbf24; font-size: 11px; font-weight: 700; }
.hint-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.hint-btn { display: inline-flex; align-items: center; gap: 7px; padding: 8px 13px; border: 0; border-radius: 9px; color: #1c1303; background: linear-gradient(135deg, #fde047, #f59e0b); font-size: 11.5px; font-weight: 800; cursor: pointer; }
.hint-btn:disabled { opacity: .55; cursor: wait; }
.hint-ghost { padding: 8px 12px; border: 1px solid rgba(148, 163, 184, .25); border-radius: 9px; color: #cbd5e1; background: transparent; font-size: 11.5px; cursor: pointer; }
.arena-state-card { display: grid; place-items: center; gap: 10px; min-height: 320px; padding: 40px 24px; text-align: center; color: #94a3b8; }
.arena-state-card h2 { margin: 6px 0 0; color: #fff; font-size: 22px; }
.arena-state-card p { max-width: 520px; margin: 0; font-size: 13.5px; line-height: 1.6; }
.arena-state-card svg { color: var(--chapter-accent); }
.arena-retry { display: inline-flex; align-items: center; gap: 7px; margin-top: 6px; padding: 9px 15px; border: 1px solid rgba(148, 163, 184, .25); border-radius: 10px; color: #e2e8f0; background: rgba(15, 23, 42, .6); font-weight: 700; cursor: pointer; }
.arena-spinner { width: 34px; height: 34px; border-radius: 50%; border: 3px solid rgba(148, 163, 184, .2); border-top-color: var(--chapter-accent); animation: arena-spin .9s linear infinite; }
@keyframes arena-spin { to { transform: rotate(360deg); } }
.xp-strike { margin-left: 6px; color: #64748b; text-decoration: line-through; }
@media (max-width: 640px) { .vector-io { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .arena-spinner { animation: none; } }
`;

const LANGUAGES = [
  { id: "cpp", label: "C++17", file: "cpp" },
  { id: "python", label: "Python 3", file: "py" },
  { id: "javascript", label: "JavaScript / Node", file: "js" },
];
const LANG_KEY = "codeland_arena_lang";
const draftKey = (problemId, lang) => `codeland_arena_code_${problemId}_${lang}`;

// Per-browser editor drafts (guarded: storage may be unavailable).
function readStoredValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Drafts simply won't persist.
  }
}

/**
 * @param {string} [contestId]  a past contest to browse (defaults to the current one)
 * @param {boolean} [readOnly]  contest not live: Run works, Submit is off, hints are free
 */
export default function ContestStoryArena({ onContestComplete, onProgress, user, contestId, readOnly = false }) {
  const role = (user?.role || "").toLowerCase();
  const isStudent = role === "student" || role === "child";

  // ---------------- data from the backend ----------------
  const [problems, setProblems] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // "loading" | "ready" | "error"
  const [loadError, setLoadError] = useState("");
  const [details, setDetails] = useState({});
  const [detailError, setDetailError] = useState("");

  // ---------------- UI state ----------------
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [selectedLang, setSelectedLang] = useState(() => {
    const saved = readStoredValue(LANG_KEY, "cpp");
    return LANGUAGES.some((l) => l.id === saved) ? saved : "cpp";
  });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(null); // "run" | "submit" | null
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("description"); // "description" | "vectors" | "hint"
  const [copiedCode, setCopiedCode] = useState(false);
  const [hintConfirm, setHintConfirm] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintError, setHintError] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [chapterSeconds, setChapterSeconds] = useState(0);

  const isRunning = Boolean(busy);

  const loadProblems = async () => {
    setLoadState("loading");
    setLoadError("");
    try {
      const list = await fetchArenaProblems(contestId);
      const sorted = (Array.isArray(list) ? list : []).sort(
        (a, b) => (a.difficultyIndex ?? 0) - (b.difficultyIndex ?? 0)
      );
      setProblems(sorted);
      // Start on the first sector the student has not solved yet.
      const firstOpen = sorted.findIndex((p) => !p.progress?.solved);
      setActiveChapterIndex(firstOpen === -1 ? Math.max(0, sorted.length - 1) : firstOpen);
      setLoadState("ready");
    } catch (err) {
      setLoadError(err.message || "Could not load the arena.");
      setLoadState("error");
    }
  };

  useEffect(() => {
    loadProblems();
  }, [contestId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeSummary = problems[activeChapterIndex] || null;
  const activeId = activeSummary?.id;
  const activeChapter = activeId ? details[activeId] : null;
  const progress = activeChapter?.progress || activeSummary?.progress || {};
  const isChapterCompleted = Boolean(progress.solved);
  // The server decides (live window + registration); readOnly is the page's own hint.
  const canSubmit = isStudent && !readOnly && activeChapter?.competition?.canSubmit !== false;
  const contestStage = activeChapter?.competition?.stage;
  // Hints are free only once the contest is over; while live they cost XP and need registration.
  const freeHints = contestStage ? contestStage === "ended" || contestStage === "archived" : readOnly && Boolean(contestId);

  // Load full details (statement, examples, image…) for the active sector.
  useEffect(() => {
    if (!activeId || details[activeId]) return;
    let cancelled = false;
    setDetailError("");
    fetchArenaProblem(activeId)
      .then((detail) => {
        if (!cancelled) setDetails((prev) => ({ ...prev, [activeId]: detail }));
      })
      .catch((err) => {
        if (!cancelled) setDetailError(err.message || "Could not load this sector.");
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, details]);

  // Restore the draft (or starter code) when the sector or language changes.
  const starterCode = activeChapter?.starterCode;
  useEffect(() => {
    if (!activeId || !starterCode) return;
    setCode(readStoredValue(draftKey(activeId, selectedLang), null) ?? (starterCode[selectedLang] || ""));
  }, [activeId, selectedLang, starterCode]);

  useEffect(() => {
    setTerminalLogs([]);
    setChapterSeconds(0);
    setHintConfirm(false);
    setHintError("");
    setActiveTab("description");
  }, [activeId]);

  // Session + sector timers (display only).
  useEffect(() => {
    if (loadState !== "ready" || problems.length === 0) return undefined;
    const timer = setInterval(() => {
      setSessionSeconds((s) => s + 1);
      if (!isChapterCompleted) setChapterSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loadState, problems.length, isChapterCompleted]);

  useEffect(() => {
    if (!zoomed) return undefined;
    const onKey = (e) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  /** Applies backend progress (and an optional revealed hint) to list + details. */
  const applyProgress = (id, nextProgress, hint) => {
    setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, progress: nextProgress } : p)));
    setDetails((prev) =>
      prev[id]
        ? {
            ...prev,
            [id]: {
              ...prev[id],
              progress: nextProgress,
              ...(hint ? { hint, hintRevealed: true } : {}),
            },
          }
        : prev
    );
  };

  const handleCodeChange = (value) => {
    setCode(value);
    if (activeId) writeStoredValue(draftKey(activeId, selectedLang), value);
  };

  const handleEditorKeyDown = (event) => {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const el = event.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = `${code.slice(0, selectionStart)}    ${code.slice(selectionEnd)}`;
    handleCodeChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 4;
    });
  };

  const handleLanguage = (lang) => {
    setSelectedLang(lang);
    writeStoredValue(LANG_KEY, lang);
  };

  const handleResetCode = () => {
    const starter = starterCode?.[selectedLang] || "";
    handleCodeChange(starter);
    setTerminalLogs([{ type: "info", text: "↺ Code reset to the sector's starter template." }]);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText?.(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const describeExamples = (results, logs) => {
    for (const r of results || []) {
      const time = r.executionTime ? ` (${r.executionTime})` : "";
      if (r.passed) {
        logs.push({ type: "pass", text: `✓ Example ${r.index + 1}: PASS${time}` });
      } else {
        logs.push({ type: "error", text: `✗ Example ${r.index + 1}: FAIL${time}` });
        if (r.error) {
          logs.push({ type: "warning", text: r.error.split("\n").slice(0, 6).join("\n") });
        } else {
          logs.push({ type: "info", text: `   expected: ${JSON.stringify(r.expectedOutput)}` });
          logs.push({ type: "info", text: `   got:      ${JSON.stringify(r.actualOutput || "")}` });
        }
      }
    }
  };

  const shake = () =>
    gsap.fromTo(
      ".arena-terminal-window",
      { x: -6 },
      { x: 6, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut" }
    );

  // Run = examples only (no XP). Submit = full judging + XP, computed server-side.
  const handleExecute = async (isSubmission = false) => {
    if (!activeChapter || !code.trim()) return;
    setBusy(isSubmission ? "submit" : "run");
    const langLabel = LANGUAGES.find((l) => l.id === selectedLang)?.label || selectedLang;
    const logs = [
      {
        type: "info",
        text: `[${langLabel}] ${isSubmission ? "Submitting" : "Running"} on ${activeChapter.examples?.length || 0} example(s)…`,
      },
    ];
    setTerminalLogs([...logs]);

    try {
      if (!isSubmission) {
        const res = await runArenaExamples(activeChapter.id, { code, language: selectedLang });
        describeExamples(res.exampleResults, logs);
        logs.push({
          type: res.verdict === "Accepted" ? "success" : "warning",
          text:
            res.verdict === "Accepted"
              ? "All examples pass. Submit to verify and claim the XP."
              : `Run result: ${res.verdict}`,
        });
        setTerminalLogs(logs);
        if (res.verdict !== "Accepted") shake();
        return;
      }

      const res = await submitArenaSolution(activeChapter.id, { code, language: selectedLang });
      describeExamples(res.exampleResults, logs);
      // Hidden tests: counts only — their inputs never reach the browser.
      const hidden = res.hiddenTests;
      if (hidden?.total > 0) {
        logs.push(
          hidden.failedTest
            ? {
                type: "error",
                text: `✗ Hidden test ${hidden.failedTest}: ${res.verdict} (${hidden.passed}/${hidden.total} hidden tests passed)`,
              }
            : hidden.passed === hidden.total
            ? { type: "pass", text: `✓ Hidden tests: ${hidden.passed}/${hidden.total} passed` }
            : { type: "info", text: `Hidden tests not run yet — fix the examples first (${hidden.total} waiting).` }
        );
      }
      if (res.verdict === "Accepted") {
        if (res.xpAwarded > 0) {
          logs.push({ type: "success", text: `🎉 SECTOR ${String(activeChapterIndex + 1).padStart(2, "0")} CLEARED!` });
          logs.push({
            type: "score",
            text: res.progress?.hintUsed
              ? `+${formatXp(res.xpAwarded)} XP (problem ${formatXp(activeChapter.xp)} XP − 25% hint penalty)`
              : `+${formatXp(res.xpAwarded)} XP — full reward, no hint used`,
          });
        } else {
          logs.push({ type: "success", text: "✓ Accepted again — XP is awarded only once per sector." });
        }
        if (res.feedback) logs.push({ type: "info", text: res.feedback });
        gsap.fromTo(
          ".arena-status-bar",
          { scale: 0.98, boxShadow: "0 0 40px rgba(52, 211, 153, 0.6)" },
          { scale: 1, boxShadow: "none", duration: 0.5 }
        );
      } else {
        logs.push({ type: "error", text: `✗ Verdict: ${res.verdict}` });
        if (res.feedback) logs.push({ type: "warning", text: res.feedback });
        if (res.failedScenario && res.failedScenario !== "None") {
          logs.push({ type: "info", text: `Failed on: ${res.failedScenario}` });
        }
        shake();
      }
      setTerminalLogs(logs);
      applyProgress(activeChapter.id, res.progress, res.hint);
      if (res.xpAwarded > 0) onProgress?.();

      // Whole contest cleared in this session → let the page award the medal.
      if (res.xpAwarded > 0) {
        const nextProblems = problems.map((p) =>
          p.id === activeChapter.id ? { ...p, progress: res.progress } : p
        );
        if (nextProblems.every((p) => p.progress?.solved)) {
          const earned = nextProblems.reduce((sum, p) => sum + (p.progress?.earnedXp || 0), 0);
          const maxScore = nextProblems.reduce((sum, p) => sum + p.xp, 0);
          setTimeout(() => {
            onContestComplete?.({
              totalScore: earned,
              maxScore,
              elapsedSeconds: sessionSeconds,
              wrongAttempts: totalAttempts - nextProblems.length,
            });
          }, 1500);
        }
      }
    } catch (err) {
      logs.push({ type: "error", text: `✗ ${err.message || "The judge could not be reached."}` });
      setTerminalLogs(logs);
      shake();
    } finally {
      setBusy(null);
    }
  };

  const handleRevealHint = async () => {
    if (!activeChapter) return;
    setHintBusy(true);
    setHintError("");
    try {
      const res = await revealArenaHint(activeChapter.id);
      applyProgress(activeChapter.id, res.progress, res.hint);
      setHintConfirm(false);
    } catch (err) {
      setHintError(err.message || "Could not reveal the hint.");
    } finally {
      setHintBusy(false);
    }
  };

  // ---------------- derived values ----------------
  const totalChaptersCompleted = problems.filter((p) => p.progress?.solved).length;
  const totalAttempts = problems.reduce((sum, p) => sum + (p.progress?.submissionCount || 0), 0);
  const earnedXp = problems.reduce((sum, p) => sum + (p.progress?.earnedXp || 0), 0);
  const maxXp = problems.reduce((sum, p) => sum + (p.xp || 0), 0);
  const completionPercent = Math.round((totalChaptersCompleted / Math.max(problems.length, 1)) * 100);
  const isLockedAt = (idx) => isStudent && !readOnly && idx > 0 && !problems[idx - 1]?.progress?.solved;
  const canGoPrev = activeChapterIndex > 0;
  const canGoNext = activeChapterIndex < problems.length - 1 && !isLockedAt(activeChapterIndex + 1);
  const story = problems[0]?.story;

  const arenaRootRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const glowXRef = useRef(null);
  const glowYRef = useRef(null);

  const chapterAccent = activeSummary?.difficultyColor || "#8b5cf6";

  useLayoutEffect(() => {
    if (!arenaRootRef.current) return undefined;
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .fromTo(
          ".arena-reveal",
          { opacity: 0, y: 34, filter: "blur(14px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.07 }
        )
        .fromTo(
          ".sector-node",
          { opacity: 0, y: 18, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.055 },
          "-=0.45"
        );
      gsap.to(".hero-orbit", { rotate: 360, duration: 18, repeat: -1, ease: "none" });
      gsap.to(".hero-orbit-secondary", { rotate: -360, duration: 26, repeat: -1, ease: "none" });
    }, arenaRootRef);

    if (cursorGlowRef.current) {
      glowXRef.current = gsap.quickTo(cursorGlowRef.current, "x", { duration: 0.45, ease: "power3.out" });
      glowYRef.current = gsap.quickTo(cursorGlowRef.current, "y", { duration: 0.45, ease: "power3.out" });
    }
    return () => ctx.revert();
  }, [loadState]);

  useEffect(() => {
    if (!arenaRootRef.current || !activeChapter) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".chapter-motion",
        { opacity: 0, y: 20, filter: "blur(9px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.045, ease: "power3.out" }
      );
    }, arenaRootRef);
    return () => ctx.revert();
  }, [activeChapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!terminalLogs.length || !arenaRootRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".terminal-line",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" }
      );
    }, arenaRootRef);
    return () => ctx.revert();
  }, [terminalLogs]);

  useEffect(() => {
    if (!arenaRootRef.current) return undefined;
    const ctx = gsap.context(() => {
      if (isRunning) {
        gsap.to(".run-pulse", {
          scale: 1.035,
          boxShadow: `0 0 44px ${chapterAccent}55`,
          duration: 0.48,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      } else {
        gsap.to(".run-pulse", { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.28, overwrite: true });
      }
    }, arenaRootRef);
    return () => ctx.revert();
  }, [isRunning, chapterAccent]);

  const handleArenaPointerMove = (event) => {
    if (!arenaRootRef.current) return;
    const bounds = arenaRootRef.current.getBoundingClientRect();
    glowXRef.current?.(event.clientX - bounds.left - 210);
    glowYRef.current?.(event.clientY - bounds.top - 210);
  };

  const shell = (children) => (
    <div
      ref={arenaRootRef}
      className="contest-story-arena-container cinematic-arena"
      style={{ "--chapter-accent": chapterAccent }}
      onPointerMove={handleArenaPointerMove}
    >
      <style>{ARENA_STYLES}</style>
      <style>{DB_ARENA_STYLES}</style>
      <ArenaBackground
        accent={chapterAccent}
        isRunning={isRunning}
        isCompleted={isChapterCompleted}
        chapterIndex={activeChapterIndex}
      />
      <div ref={cursorGlowRef} className="arena-cursor-glow" aria-hidden="true" />
      <div className="arena-vignette" aria-hidden="true" />
      <div className="arena-scanlines" aria-hidden="true" />
      <div className="arena-noise" aria-hidden="true" />
      <div className="arena-content-shell">{children}</div>
    </div>
  );

  // ---------------- loading / error / empty ----------------
  if (loadState === "loading") {
    return shell(
      <div className="arena-glass arena-state-card arena-reveal" role="status">
        <div className="arena-spinner" />
        <p>Synchronizing arena sectors with the CodeLand database…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return shell(
      <div className="arena-glass arena-state-card arena-reveal" role="alert">
        <ShieldAlert size={34} />
        <h2>Arena signal lost</h2>
        <p>{loadError}</p>
        <button type="button" className="arena-retry" onClick={loadProblems}>
          <RotateCcw size={14} /> Try again
        </button>
      </div>
    );
  }

  if (problems.length === 0) {
    return shell(
      <div className="arena-glass arena-state-card arena-reveal">
        <Lock size={34} />
        <h2>{contestId ? "No sectors in this contest" : "No sectors published yet"}</h2>
        <p>
          {contestId
            ? "This contest has no published problems."
            : "The Sunday Arena is empty right now. As soon as an arena admin generates and publishes this week's contest, its six sectors will appear here."}
        </p>
        <button type="button" className="arena-retry" onClick={loadProblems}>
          <RotateCcw size={14} /> Check again
        </button>
      </div>
    );
  }

  const examples = activeChapter?.examples || [];
  const constraints = activeChapter?.constraints || [];
  const hintPenalised = progress.hintUsed && !progress.solved;
  const langMeta = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[0];

  return shell(
    <>
      <header className="arena-hero arena-glass arena-reveal">
        <div className="arena-hero-copy">
          <div className="arena-kicker">
            <span className="live-dot" />
            <Sparkles size={13} />
            SUNDAY STORY CONTEST // {problems.length} SECTORS
            <span className="kicker-divider" />
            SUNDAY PROTOCOL
          </div>

          <div className="arena-title-row">
            <div>
              <p className="arena-eyebrow">CODELAND // LIVE ARENA DATABASE</p>
              <h1 className="arena-main-title">Sunday Arena</h1>
            </div>
            <div className="operator-chip">
              <Cpu size={14} />
              <span>{user?.fullName || user?.name || user?.username || "OPERATOR"}</span>
              <span className="operator-status">{isStudent ? "ONLINE" : "PREVIEW"}</span>
            </div>
          </div>

          {story && <p className="arena-prologue">{story}</p>}

          <div className="hero-metrics">
            <div className="hero-metric">
              <span>SECTORS</span>
              <strong>{totalChaptersCompleted}/{problems.length}</strong>
            </div>
            <div className="hero-metric">
              <span>RUNTIME</span>
              <strong>{formatArenaTime(sessionSeconds)}</strong>
            </div>
            <div className="hero-metric">
              <span>SUBMISSIONS</span>
              <strong>{totalAttempts}</strong>
            </div>
            <div className="hero-metric progress-metric">
              <span>ARENA SYNC</span>
              <strong>{completionPercent}%</strong>
              <i><b style={{ width: `${completionPercent}%` }} /></i>
            </div>
          </div>
        </div>

        <div className="score-reactor" aria-label={`Arena XP ${formatXp(earnedXp)} of ${formatXp(maxXp)}`}>
          <div className="hero-orbit" />
          <div className="hero-orbit-secondary" />
          <div className="reactor-core">
            <Trophy size={18} />
            <span>ARENA XP</span>
            <strong>{formatXp(earnedXp)}</strong>
            <small>OF {formatXp(maxXp)} XP</small>
          </div>
        </div>
      </header>

      <section className="sector-rail arena-reveal" aria-label="Contest sectors">
        <div className="sector-rail-line">
          <span style={{ width: `${completionPercent}%` }} />
        </div>
        {problems.map((ch, idx) => {
          const isDone = Boolean(ch.progress?.solved);
          const isActive = idx === activeChapterIndex;
          const isLocked = isLockedAt(idx);
          return (
            <button
              key={ch.id}
              type="button"
              disabled={isLocked}
              onClick={() => setActiveChapterIndex(idx)}
              className={`sector-node ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}
              style={{ "--sector-accent": ch.difficultyColor || chapterAccent }}
              title={isLocked ? "Solve the previous sector to unlock" : ch.title}
            >
              <span className="sector-index">0{idx + 1}</span>
              <span className="sector-icon">
                {isDone ? <CheckCircle2 size={16} /> : isLocked ? <Lock size={14} /> : <Zap size={15} />}
              </span>
              <span className="sector-copy">
                <b>{ch.title}</b>
                <em>{isDone ? `+${formatXp(ch.progress.earnedXp)} XP` : `${ch.difficulty} · ${ch.xp} XP`}</em>
              </span>
              <span className="sector-signal" />
            </button>
          );
        })}
      </section>

      <main className="arena-workspace">
        <section className="mission-panel arena-glass arena-reveal chapter-motion">
          <div className="panel-chrome">
            <div className="chrome-left">
              <span className="chrome-lights"><i /><i /><i /></span>
              <span>MISSION INTELLIGENCE</span>
            </div>
            <div className="chapter-nav-arrows">
              <button
                type="button"
                disabled={!canGoPrev}
                onClick={() => canGoPrev && setActiveChapterIndex((v) => v - 1)}
                aria-label="Previous sector"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={() => canGoNext && setActiveChapterIndex((v) => v + 1)}
                aria-label="Next sector"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="mission-scroll">
            {!activeChapter ? (
              <div className="arena-state-card">
                {detailError ? (
                  <>
                    <ShieldAlert size={28} />
                    <p>{detailError}</p>
                    <button
                      type="button"
                      className="arena-retry"
                      onClick={() => {
                        setDetailError("");
                        setDetails((prev) => ({ ...prev }));
                      }}
                    >
                      <RotateCcw size={14} /> Retry
                    </button>
                  </>
                ) : (
                  <>
                    <div className="arena-spinner" />
                    <p>Decrypting sector intelligence…</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="chapter-heading chapter-motion">
                  <div>
                    <span className="chapter-sector-tag">SECTOR // {String(activeChapterIndex + 1).padStart(2, "0")}</span>
                    {activeChapter.arabicTitle && (
                      <span className="chapter-arabic" dir="rtl">{activeChapter.arabicTitle}</span>
                    )}
                  </div>
                  <span className="difficulty-pill">{activeChapter.difficulty}</span>
                </div>

                <h2 className="chapter-title chapter-motion">{activeChapter.title}</h2>

                <div className="transmission-card chapter-motion">
                  <div className="transmission-head">
                    <span className="transmission-wave"><i /><i /><i /><i /><i /></span>
                    <span>ENCRYPTED TRANSMISSION // DECODED</span>
                  </div>
                  <ArenaRichText text={activeChapter.statement} className="arena-prose" />

                  {activeChapter.imageUrl && (
                    <figure className="arena-figure">
                      <button type="button" onClick={() => setZoomed(true)} aria-label="Enlarge illustration">
                        <img
                          src={activeChapter.imageUrl}
                          alt={activeChapter.imageAlt || `Illustration for ${activeChapter.title}`}
                          loading="lazy"
                        />
                      </button>
                      <figcaption>
                        {activeChapter.canBeExplainedByDiagrams ? "Step-by-step diagram" : "Mission illustration"} · click to enlarge
                      </figcaption>
                    </figure>
                  )}
                </div>

                <div className="intel-tabs chapter-motion">
                  <button
                    type="button"
                    className={activeTab === "description" ? "is-active" : ""}
                    onClick={() => setActiveTab("description")}
                  >
                    <BookOpen size={14} /> Mission
                  </button>
                  <button
                    type="button"
                    className={activeTab === "vectors" ? "is-active" : ""}
                    onClick={() => setActiveTab("vectors")}
                  >
                    <Code2 size={14} /> Examples
                  </button>
                  <button
                    type="button"
                    className={activeTab === "hint" ? "is-active" : ""}
                    onClick={() => setActiveTab("hint")}
                  >
                    <HelpCircle size={14} /> Hint
                  </button>
                </div>

                {activeTab === "description" && (
                  <div className="intel-pane chapter-motion">
                    <div className="intel-block">
                      <span className="intel-label"><ShieldCheck size={14} /> INPUT</span>
                      <ArenaRichText text={activeChapter.inputSpec} className="arena-prose" />
                    </div>
                    <div className="intel-block">
                      <span className="intel-label"><Send size={14} /> OUTPUT</span>
                      <ArenaRichText text={activeChapter.outputSpec} className="arena-prose" />
                    </div>
                    {constraints.length > 0 && (
                      <div className="intel-block">
                        <span className="intel-label"><AlertTriangle size={14} /> CONSTRAINT MATRIX</span>
                        <div className="constraint-grid">
                          {constraints.map((constraint, index) => (
                            <code key={index}>
                              <span>0{index + 1}</span>
                              <b style={{ fontWeight: 500 }}>{renderInline(constraint, `c${index}`)}</b>
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeChapter.note && (
                      <div className="intel-block">
                        <span className="intel-label"><BookOpen size={14} /> NOTE</span>
                        <ArenaRichText text={activeChapter.note} className="arena-prose" />
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "vectors" && (
                  <div className="intel-pane vector-list chapter-motion">
                    {examples.map((test, index) => (
                      <article className="vector-card" key={index}>
                        <div className="vector-number">EXAMPLE {String(index + 1).padStart(2, "0")}</div>
                        <div className="vector-io">
                          <div>
                            <span>INPUT</span>
                            <pre>{test.input || " "}</pre>
                          </div>
                          <div className="vector-out">
                            <span>OUTPUT</span>
                            <pre>{test.output || " "}</pre>
                          </div>
                        </div>
                        {test.explanation && <p>{test.explanation}</p>}
                      </article>
                    ))}
                  </div>
                )}

                {activeTab === "hint" && (
                  <div className="intel-pane hint-pane chapter-motion">
                    {activeChapter.hint ? (
                      <div className="hint-box">
                        <h4><HelpCircle size={14} /> STRATEGIC HINT</h4>
                        <ArenaRichText text={activeChapter.hint} className="arena-prose" />
                        <div className="hint-foot">
                          {progress.hintUsed
                            ? `Hint used · max reward ${formatXp(progress.maxEarnableXp)} XP`
                            : freeHints
                            ? "Practice mode · no penalty"
                            : "Unlocked after solving · no penalty"}
                        </div>
                      </div>
                    ) : freeHints ? (
                      <div className="hint-box">
                        <h4><Lock size={14} /> PRACTICE MODE</h4>
                        <p>This contest is over, so the hint is free — no XP is involved anymore.</p>
                        <button type="button" className="hint-btn" onClick={handleRevealHint} disabled={hintBusy || !isStudent}>
                          <HelpCircle size={14} /> {hintBusy ? "Revealing…" : "Show Hint"}
                        </button>
                      </div>
                    ) : !hintConfirm ? (
                      <div className="hint-box">
                        <h4><Lock size={14} /> LOCKED INTEL</h4>
                        <p>
                          The hint reveals the key observation — about half of the solution — without giving away the code.
                        </p>
                        <button
                          type="button"
                          className="hint-btn"
                          onClick={() => setHintConfirm(true)}
                          disabled={!canSubmit}
                        >
                          <HelpCircle size={14} /> Show Hint (−25% XP)
                        </button>
                        {!isStudent ? (
                          <div className="hint-foot">Admin preview — only students can reveal hints.</div>
                        ) : (
                          !canSubmit && <div className="hint-foot">Hints are for registered contenders during the live contest.</div>
                        )}
                      </div>
                    ) : (
                      <div className="hint-box" role="alert">
                        <h4><AlertTriangle size={14} /> THIS COSTS 25% OF THIS SECTOR'S XP</h4>
                        <p>
                          Your maximum reward drops from <b>{formatXp(activeChapter.xp)} XP</b> to{" "}
                          <b>{formatXp(xpAfterHint(activeChapter.xp))} XP</b>. It is recorded on your account and can't
                          be undone — but you are never charged twice for the same sector.
                        </p>
                        <div className="hint-actions">
                          <button type="button" className="hint-btn" onClick={handleRevealHint} disabled={hintBusy}>
                            <HelpCircle size={14} /> {hintBusy ? "Revealing…" : "Reveal hint"}
                          </button>
                          <button type="button" className="hint-ghost" onClick={() => setHintConfirm(false)} disabled={hintBusy}>
                            Keep it hidden
                          </button>
                        </div>
                      </div>
                    )}
                    {hintError && <div className="hint-foot" style={{ color: "#fb7185" }}>{hintError}</div>}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mission-status arena-status-bar">
            <div>
              <Clock size={15} />
              <span>LIMIT <b>{activeChapter?.timeLimit || "—"}</b></span>
              <span className="status-slash">//</span>
              <span>USED <b>{formatArenaTime(chapterSeconds)}</b></span>
            </div>
            <div className={isChapterCompleted ? "status-safe" : hintPenalised ? "status-danger" : "status-safe"}>
              <Zap size={15} />
              <span>
                {isChapterCompleted ? (
                  `EARNED ${formatXp(progress.earnedXp)} XP`
                ) : hintPenalised ? (
                  <>
                    MAX {formatXp(progress.maxEarnableXp)} XP
                    <span className="xp-strike">{formatXp(activeSummary?.xp)}</span>
                  </>
                ) : (
                  `REWARD ${formatXp(activeSummary?.xp)} XP`
                )}
              </span>
            </div>
          </div>
        </section>

        <section className="ide-panel arena-glass arena-reveal chapter-motion">
          <div className="ide-header">
            <div className="ide-file-meta">
              <span className="ide-mark"><Code2 size={16} /></span>
              <div>
                <strong>solution.{langMeta.file}</strong>
                <small>STDIN → STDOUT // AUTOSAVE ENABLED</small>
              </div>
            </div>
            <div className="ide-tools">
              <label className="language-select">
                <Cpu size={13} />
                <select value={selectedLang} onChange={(e) => handleLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={handleCopyCode} title="Copy code">
                <Copy size={14} /> {copiedCode ? "Copied" : "Copy"}
              </button>
              <button type="button" onClick={handleResetCode} title="Reset code" disabled={!activeChapter}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>
          </div>

          <div className="editor-stage">
            <div className="editor-gutter" aria-hidden="true">
              {Array.from({ length: Math.max(12, code.split("\n").length) }).slice(0, 200).map((_, index) => (
                <span key={index}>{index + 1}</span>
              ))}
            </div>
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              spellCheck="false"
              aria-label="Solution code editor"
              placeholder="// Read the input from stdin and print the answer…"
              disabled={!activeChapter}
            />
            <div className="editor-beam" aria-hidden="true" />
          </div>

          <div className="arena-terminal-window">
            <div className="terminal-header">
              <div>
                <span className="terminal-prompt">›_</span>
                <span>EXECUTION CONSOLE</span>
              </div>
              <span className={`engine-state ${isRunning ? "is-running" : ""}`}>
                <i />
                {busy === "submit" ? "JUDGING" : busy === "run" ? "EXECUTING" : "JUDGE READY"}
              </span>
            </div>
            <div className="terminal-body">
              {terminalLogs.length === 0 ? (
                <div className="terminal-empty">
                  <span>$</span> Run executes your code on the examples. Submit judges it and claims the XP.
                </div>
              ) : (
                terminalLogs.map((log, index) => (
                  <div key={index} className={`terminal-line log-${log.type}`} style={{ whiteSpace: "pre-wrap" }}>
                    <span className="terminal-line-no">{String(index + 1).padStart(2, "0")}</span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
              {busy && (
                <div className="terminal-line log-info">
                  <span className="terminal-line-no">··</span>
                  <span>{busy === "submit" ? "Running your code on the examples and the hidden tests…" : "Compiling and running…"}</span>
                </div>
              )}
            </div>
          </div>

          <div className="ide-action-bar">
            <div className="submission-state">
              {isChapterCompleted ? (
                <>
                  <CheckCircle2 size={15} />
                  <span><b>VERIFIED</b> +{formatXp(progress.earnedXp)} XP earned.</span>
                </>
              ) : !isStudent ? (
                <>
                  <ShieldAlert size={15} />
                  <span>Admin preview — only students can run and submit.</span>
                </>
              ) : !canSubmit ? (
                <>
                  <ShieldAlert size={15} />
                  <span>Practice mode — <b>Run</b> works, submissions are closed.</span>
                </>
              ) : (
                <>
                  <Flame size={15} />
                  <span>Solve to earn <b>{formatXp(progress.maxEarnableXp ?? activeSummary?.xp)} XP</b>.</span>
                </>
              )}
            </div>
            <div className="action-buttons">
              <button
                type="button"
                disabled={isRunning || !isStudent || !activeChapter || !code.trim()}
                onClick={() => handleExecute(false)}
                className="test-button"
              >
                <Play size={14} />
                {busy === "run" ? "Running…" : "Run Tests"}
              </button>
              <button
                type="button"
                disabled={isRunning || !canSubmit || !activeChapter || !code.trim()}
                onClick={() => handleExecute(true)}
                className={`submit-button run-pulse ${isChapterCompleted ? "is-complete" : ""}`}
              >
                {busy === "submit" ? <Cpu className="spin-icon" size={15} /> : isChapterCompleted ? <Crown size={15} /> : <Send size={15} />}
                <span>{busy === "submit" ? "Judging…" : isChapterCompleted ? "Re-Submit" : "Submit & Unlock"}</span>
                <i />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="arena-footer arena-reveal">
        <span><i /> JUDGE: JUDGE0 / WANDBOX</span>
        <span>NODE: CODELAND-SUNDAY-ARENA</span>
        <span>XP: SERVER-VERIFIED</span>
      </footer>

      {zoomed && activeChapter?.imageUrl && (
        <div className="arena-lightbox" role="dialog" aria-modal="true" onClick={() => setZoomed(false)}>
          <img src={activeChapter.imageUrl} alt={activeChapter.imageAlt || activeChapter.title} />
        </div>
      )}
    </>
  );
}
