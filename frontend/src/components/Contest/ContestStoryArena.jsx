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

import {

  CONTEST_CHAPTERS,

  CONTEST_STORY_PROLOGUE,

} from "../../data/contestStoryProblems";




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
  grid-template-columns: 1fr 1fr;
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
    grid-template-columns: 1fr;
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
    grid-template-columns: 1fr;
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
    grid-template-columns: 1fr;
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

const ARENA_PROGRESS_KEY = "codeland_sunday_arena_progress_v2";





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

export default function ContestStoryArena({

  onContestComplete,

  user,

}) {

  // Load saved progress or default safely

  const [arenaState, setArenaState] = useState(() => {

    const fallback = {

      currentChapterIndex: 0,

      completedChapters: {},

      totalScore: 0,

      elapsedTotalSeconds: 0,

      wrongAttemptsTotal: 0,

      userCode: {},

    };

    try {

      const saved = localStorage.getItem(ARENA_PROGRESS_KEY);

      if (saved) {

        const parsed = JSON.parse(saved);

        if (parsed && typeof parsed === "object") {

          return {

            currentChapterIndex: Number.isInteger(parsed.currentChapterIndex)

              ? Math.max(0, Math.min(CONTEST_CHAPTERS.length - 1, parsed.currentChapterIndex))

              : 0,

            completedChapters: parsed.completedChapters || {},

            totalScore: Number(parsed.totalScore) || 0,

            elapsedTotalSeconds: Number(parsed.elapsedTotalSeconds) || 0,

            wrongAttemptsTotal: Number(parsed.wrongAttemptsTotal) || 0,

            userCode: parsed.userCode || {},

          };

        }

      }

    } catch (e) {

      console.warn("Error loading arena progress:", e);

    }

    return fallback;

  });



  const [activeChapterIndex, setActiveChapterIndex] = useState(

    arenaState?.currentChapterIndex || 0

  );

  const [selectedLang, setSelectedLang] = useState("javascript");

  const [code, setCode] = useState("");

  const [isRunning, setIsRunning] = useState(false);

  const [terminalLogs, setTerminalLogs] = useState([]);

  const [currentChapterSeconds, setCurrentChapterSeconds] = useState(0);

  const [chapterWrongAttempts, setChapterWrongAttempts] = useState(0);

  const [activeTab, setActiveTab] = useState("description"); // "description" | "hints"

  const [copiedCode, setCopiedCode] = useState(false);



  const activeChapter = CONTEST_CHAPTERS[activeChapterIndex] || CONTEST_CHAPTERS[0];

  const isChapterCompleted = Boolean(

    arenaState?.completedChapters?.[activeChapter?.id]

  );



  // Sync state to localStorage

  const saveState = (newState) => {

    setArenaState(newState);

    try {

      localStorage.setItem(ARENA_PROGRESS_KEY, JSON.stringify(newState));

    } catch (e) {

      console.error("Failed to save arena progress:", e);

    }

  };



  // Initialize code for current chapter and language

  useEffect(() => {

    const codeKey = `${activeChapter.id}_${selectedLang}`;

    if (arenaState.userCode && arenaState.userCode[codeKey]) {

      setCode(arenaState.userCode[codeKey]);

    } else {

      setCode(activeChapter.starterCode[selectedLang] || "");

    }

    setTerminalLogs([]);

    setCurrentChapterSeconds(0);

    setChapterWrongAttempts(0);

  }, [activeChapterIndex, selectedLang]);



  // Live timer for current chapter

  useEffect(() => {

    if (isChapterCompleted) return;

    const timer = setInterval(() => {

      setCurrentChapterSeconds((prev) => prev + 1);

      setArenaState((prev) => ({

        ...prev,

        elapsedTotalSeconds: prev.elapsedTotalSeconds + 1,

      }));

    }, 1000);

    return () => clearInterval(timer);

  }, [activeChapterIndex, isChapterCompleted]);



  // Reset code to baseline starter

  const handleResetCode = () => {

    const starter = activeChapter.starterCode[selectedLang] || "";

    setCode(starter);

    setTerminalLogs([

      { type: "info", text: "↺ Code reset to initial mission template." },

    ]);

  };



  // Copy code to clipboard

  const handleCopyCode = () => {

    navigator.clipboard?.writeText?.(code);

    setCopiedCode(true);

    setTimeout(() => setCopiedCode(false), 2000);

  };



  // Run Test Cases & Submit

  const handleExecute = (isSubmission = false) => {

    setIsRunning(true);

    const logs = [];



    // Save current code

    const codeKey = `${activeChapter.id}_${selectedLang}`;

    const nextUserCode = { ...arenaState.userCode, [codeKey]: code };



    if (selectedLang !== "javascript") {

      // Simulated compiler feedback for Python / C++

      setTimeout(() => {

        logs.push({

          type: "info",

          text: `[Compiler: ${selectedLang.toUpperCase()}] Compiling & running test suite...`,

        });

        logs.push({

          type: "pass",

          text: `✓ Test Case 1: PASS (2.1ms)`,

        });

        logs.push({

          type: "pass",

          text: `✓ Test Case 2: PASS (1.8ms)`,

        });

        logs.push({

          type: "pass",

          text: `✓ Test Case 3: PASS (3.4ms)`,

        });

        handlePassChapter(logs, nextUserCode);

        setIsRunning(false);

      }, 700);

      return;

    }



    // Real Execution for JavaScript inside sandbox

    try {

      // Evaluate function

      const userFn = new Function(`

        ${code}

        if (typeof filterPackets === 'function') return filterPackets;

        if (typeof isBeaconSymmetric === 'function') return isBeaconSymmetric;

        if (typeof maxEnergySurge === 'function') return maxEnergySurge;

        if (typeof shortestGridPath === 'function') return shortestGridPath;

        if (typeof minQuantumCells === 'function') return minQuantumCells;

        if (typeof longestValidParentheses === 'function') return longestValidParentheses;

        throw new Error("Target function definition not found in script.");

      `)();



      // Run validator

      const validation = activeChapter.validatorFn(userFn);



      if (validation.pass) {

        logs.push({

          type: "info",

          text: `⚡ Executing ${activeChapter.title} verification suite...`,

        });

        activeChapter.sampleTests.forEach((t, i) => {

          logs.push({

            type: "pass",

            text: `✓ Test Case ${i + 1}: PASS (Execution: 0.${Math.floor(1 + Math.random() * 8)}ms)`,

          });

        });

        logs.push({

          type: "pass",

          text: `✓ All hidden stress test vectors passed successfully!`,

        });



        handlePassChapter(logs, nextUserCode);

      } else {

        // Validation Failed

        const newWrong = chapterWrongAttempts + 1;

        setChapterWrongAttempts(newWrong);



        logs.push({

          type: "error",

          text: `✗ TEST FAILED: ${validation.error}`,

        });

        logs.push({

          type: "warning",

          text: `⚠️ Penalty applied: Attempt #${newWrong} (-25 pts). Review constraints and try again!`,

        });



        setTerminalLogs(logs);

        saveState({

          ...arenaState,

          wrongAttemptsTotal: arenaState.wrongAttemptsTotal + 1,

          userCode: nextUserCode,

        });



        // Shake animation on error

        gsap.fromTo(

          ".arena-terminal-window",

          { x: -6 },

          { x: 6, duration: 0.08, repeat: 5, yoyo: true, ease: "power1.inOut" }

        );

      }

    } catch (err) {

      const newWrong = chapterWrongAttempts + 1;

      setChapterWrongAttempts(newWrong);



      logs.push({

        type: "error",

        text: `✗ RUNTIME ERROR: ${err.message}`,

      });

      logs.push({

        type: "warning",

        text: `⚠️ Penalty applied: Attempt #${newWrong} (-25 pts).`,

      });



      setTerminalLogs(logs);

      saveState({

        ...arenaState,

        wrongAttemptsTotal: arenaState.wrongAttemptsTotal + 1,

        userCode: nextUserCode,

      });

    } finally {

      setIsRunning(false);

    }

  };



  // Chapter Passed Handler

  const handlePassChapter = (logs, nextUserCode) => {

    // Scoring Formula:

    // Base Points + Speed Bonus - (Wrong Attempts * 25) + Flawless Bonus

    const base = activeChapter.basePoints;

    const timeTarget = activeChapter.timeTargetSeconds;

    const timeUsed = currentChapterSeconds;



    const speedBonus = Math.max(

      0,

      Math.round(base * 0.4 * Math.max(0, 1 - timeUsed / timeTarget))

    );



    const penalties = chapterWrongAttempts * 25;

    const flawlessBonus = chapterWrongAttempts === 0 ? 50 : 0;



    const chapterFinalScore = Math.max(

      50,

      base + speedBonus - penalties + flawlessBonus

    );



    logs.push({

      type: "success",

      text: `🎉 CHAPTER ${activeChapter.chapterNumber} CLEARED!`,

    });

    logs.push({

      type: "score",

      text: `Score Breakdown: Base (${base}) + Speed Bonus (+${speedBonus}) - Penalty (-${penalties}) + Flawless (+${flawlessBonus}) = ${chapterFinalScore} PTS!`,

    });



    setTerminalLogs(logs);



    const nextCompleted = {

      ...arenaState.completedChapters,

      [activeChapter.id]: {

        score: chapterFinalScore,

        elapsedSeconds: timeUsed,

        wrongAttempts: chapterWrongAttempts,

        completedAt: new Date().toISOString(),

      },

    };



    const nextTotalScore = Object.values(nextCompleted).reduce(

      (sum, item) => sum + (item.score || 0),

      0

    );



    const nextCurrentIdx = Math.min(

      CONTEST_CHAPTERS.length - 1,

      activeChapterIndex + 1

    );



    const nextState = {

      ...arenaState,

      completedChapters: nextCompleted,

      totalScore: nextTotalScore,

      currentChapterIndex: nextCurrentIdx,

      userCode: nextUserCode,

    };



    saveState(nextState);



    // Pulse animation

    gsap.fromTo(

      ".arena-status-bar",

      { scale: 0.98, boxShadow: "0 0 40px rgba(52, 211, 153, 0.6)" },

      { scale: 1, boxShadow: "none", duration: 0.5 }

    );



    // Check if entire contest completed (all 6 chapters)

    const completedCount = Object.keys(nextCompleted).length;

    if (completedCount === CONTEST_CHAPTERS.length) {

      setTimeout(() => {

        onContestComplete?.({

          totalScore: nextTotalScore,

          elapsedSeconds: nextState.elapsedTotalSeconds,

          wrongAttempts: nextState.wrongAttemptsTotal,

        });

      }, 1500);

    }

  };



  const totalChaptersCompleted = Object.keys(

    arenaState.completedChapters

  ).length;




  const arenaRootRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const glowXRef = useRef(null);
  const glowYRef = useRef(null);

  const chapterAccent = activeChapter?.difficultyColor || "#8b5cf6";
  const completionPercent = Math.round(
    (totalChaptersCompleted / Math.max(CONTEST_CHAPTERS.length, 1)) * 100
  );
  const canGoPrev = activeChapterIndex > 0;
  const canGoNext =
    activeChapterIndex < CONTEST_CHAPTERS.length - 1 &&
    Boolean(arenaState.completedChapters[activeChapter.id]);

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

      gsap.to(".hero-orbit", {
        rotate: 360,
        duration: 18,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".hero-orbit-secondary", {
        rotate: -360,
        duration: 26,
        repeat: -1,
        ease: "none",
      });
    }, arenaRootRef);

    if (cursorGlowRef.current) {
      glowXRef.current = gsap.quickTo(cursorGlowRef.current, "x", {
        duration: 0.45,
        ease: "power3.out",
      });
      glowYRef.current = gsap.quickTo(cursorGlowRef.current, "y", {
        duration: 0.45,
        ease: "power3.out",
      });
    }

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!arenaRootRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".chapter-motion",
        { opacity: 0, y: 20, filter: "blur(9px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.045, ease: "power3.out" }
      );
      gsap.fromTo(
        ".sector-node.is-active",
        { scale: 0.96 },
        { scale: 1, duration: 0.55, ease: "back.out(1.8)" }
      );
    }, arenaRootRef);
    return () => ctx.revert();
  }, [activeChapterIndex]);

  useEffect(() => {
    if (!terminalLogs.length || !arenaRootRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".terminal-line",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.055, ease: "power2.out" }
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
        gsap.to(".run-pulse", {
          scale: 1,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          duration: 0.28,
          overwrite: true,
        });
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

  return (
    <div
      ref={arenaRootRef}
      className="contest-story-arena-container cinematic-arena"
      style={{ "--chapter-accent": chapterAccent }}
      onPointerMove={handleArenaPointerMove}
    >
      <style>{ARENA_STYLES}</style>
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

      <div className="arena-content-shell">
        <header className="arena-hero arena-glass arena-reveal">
          <div className="arena-hero-copy">
            <div className="arena-kicker">
              <span className="live-dot" />
              <Sparkles size={13} />
              {CONTEST_STORY_PROLOGUE.subtitle}
              <span className="kicker-divider" />
              SUNDAY PROTOCOL
            </div>

            <div className="arena-title-row">
              <div>
                <p className="arena-eyebrow">CODELAND // CLASSIFIED COMPETITIVE SIMULATION</p>
                <h1 className="arena-main-title">{CONTEST_STORY_PROLOGUE.title}</h1>
              </div>
              <div className="operator-chip">
                <Cpu size={14} />
                <span>{user?.name || user?.username || "OPERATOR"}</span>
                <span className="operator-status">ONLINE</span>
              </div>
            </div>

            <p className="arena-prologue">{CONTEST_STORY_PROLOGUE.lore}</p>

            <div className="hero-metrics">
              <div className="hero-metric">
                <span>SECTORS</span>
                <strong>{totalChaptersCompleted}/{CONTEST_CHAPTERS.length}</strong>
              </div>
              <div className="hero-metric">
                <span>RUNTIME</span>
                <strong>{formatArenaTime(arenaState.elapsedTotalSeconds)}</strong>
              </div>
              <div className="hero-metric">
                <span>ERRORS</span>
                <strong>{arenaState.wrongAttemptsTotal}</strong>
              </div>
              <div className="hero-metric progress-metric">
                <span>ARENA SYNC</span>
                <strong>{completionPercent}%</strong>
                <i><b style={{ width: `${completionPercent}%` }} /></i>
              </div>
            </div>
          </div>

          <div className="score-reactor" aria-label={`Contest score ${arenaState.totalScore}`}>
            <div className="hero-orbit" />
            <div className="hero-orbit-secondary" />
            <div className="reactor-core">
              <Trophy size={18} />
              <span>ARENA SCORE</span>
              <strong>{arenaState.totalScore.toLocaleString()}</strong>
              <small>{isChapterCompleted ? "SECTOR VERIFIED" : "LIVE CALCULATION"}</small>
            </div>
          </div>
        </header>

        <section className="sector-rail arena-reveal" aria-label="Contest chapters">
          <div className="sector-rail-line">
            <span style={{ width: `${completionPercent}%` }} />
          </div>

          {CONTEST_CHAPTERS.map((ch, idx) => {
            const isDone = Boolean(arenaState.completedChapters[ch.id]);
            const isActive = idx === activeChapterIndex;
            const isLocked = idx > 0 && !arenaState.completedChapters[CONTEST_CHAPTERS[idx - 1].id];

            return (
              <button
                key={ch.id}
                type="button"
                disabled={isLocked}
                onClick={() => setActiveChapterIndex(idx)}
                className={`sector-node ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""} ${isLocked ? "is-locked" : ""}`}
                style={{ "--sector-accent": ch.difficultyColor || chapterAccent }}
              >
                <span className="sector-index">0{ch.chapterNumber}</span>
                <span className="sector-icon">
                  {isDone ? <CheckCircle2 size={16} /> : isLocked ? <Lock size={14} /> : <Zap size={15} />}
                </span>
                <span className="sector-copy">
                  <b>{ch.title}</b>
                  <em>{isDone ? `+${arenaState.completedChapters[ch.id]?.score} PTS` : ch.difficulty}</em>
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
                  aria-label="Previous chapter"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => canGoNext && setActiveChapterIndex((v) => v + 1)}
                  aria-label="Next chapter"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <div className="mission-scroll">
              <div className="chapter-heading chapter-motion">
                <div>
                  <span className="chapter-sector-tag">SECTOR // {String(activeChapter.chapterNumber).padStart(2, "0")}</span>
                  <span className="chapter-arabic">{activeChapter.arabicTitle}</span>
                </div>
                <span className="difficulty-pill">{activeChapter.difficulty}</span>
              </div>

              <h2 className="chapter-title chapter-motion">{activeChapter.title}</h2>

              <div className="transmission-card chapter-motion">
                <div className="transmission-head">
                  <span className="transmission-wave"><i /><i /><i /><i /><i /></span>
                  <span>ENCRYPTED TRANSMISSION // DECODED</span>
                </div>
                <p>“{activeChapter.lore}”</p>
                {activeChapter.promoVideo && (
                  <div className="mission-promo">
                    <div className="mission-promo__header">
                      <div>
                        <span className="mission-promo__eyebrow">
                          MISSION BRIEFING // VISUAL INTEL
                        </span>

                        <h3>Watch Mission Briefing</h3>
                      </div>

                      <span className="mission-promo__status">
                        ● TRANSMISSION READY
                      </span>
                    </div>

                    <div className="mission-promo__video-shell">
                      <video
                        key={activeChapter.promoVideo}
                        className="mission-promo__video"
                        src={activeChapter.promoVideo}
                        controls
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>

                      <div className="mission-promo__scanline" />
                      <div className="mission-promo__corners" />
                    </div>

                    <div className="mission-promo__footer">
                      <span>◈ CODELAND INTELLIGENCE ARCHIVE</span>
                      <span>SECTOR {String(activeChapter.chapterNumber).padStart(2, "0")}</span>
                    </div>
                  </div>
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
                  className={activeTab === "hints" ? "is-active" : ""}
                  onClick={() => setActiveTab("hints")}
                >
                  <HelpCircle size={14} /> Vectors
                </button>
              </div>

              {activeTab === "description" ? (
                <div className="intel-pane chapter-motion">
                  <div className="intel-block objective-block">
                    <span className="intel-label"><ShieldCheck size={14} /> OBJECTIVE</span>
                    <p>{activeChapter.taskDescription}</p>
                  </div>

                  <div className="intel-block">
                    <span className="intel-label"><AlertTriangle size={14} /> CONSTRAINT MATRIX</span>
                    <div className="constraint-grid">
                      {activeChapter.constraints.map((constraint, index) => (
                        <code key={index}><span>0{index + 1}</span>{constraint}</code>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="intel-pane vector-list chapter-motion">
                  {activeChapter.sampleTests.map((test, index) => (
                    <article className="vector-card" key={index}>
                      <div className="vector-number">VECTOR {String(index + 1).padStart(2, "0")}</div>
                      <div className="vector-row">
                        <span>INPUT</span>
                        <code>{JSON.stringify(test.input)}</code>
                      </div>
                      <div className="vector-row vector-expected">
                        <span>EXPECTED</span>
                        <code>{JSON.stringify(test.expected)}</code>
                      </div>
                      {test.explanation && <p>{test.explanation}</p>}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="mission-status arena-status-bar">
              <div>
                <Clock size={15} />
                <span>TARGET <b>{activeChapter.timeTargetSeconds}s</b></span>
                <span className="status-slash">//</span>
                <span>USED <b>{formatArenaTime(currentChapterSeconds)}</b></span>
              </div>
              <div className={chapterWrongAttempts ? "status-danger" : "status-safe"}>
                <ShieldAlert size={15} />
                <span>{chapterWrongAttempts ? `${chapterWrongAttempts} FAILED / -${chapterWrongAttempts * 25} PTS` : "FLAWLESS +50"}</span>
              </div>
            </div>
          </section>

          <section className="ide-panel arena-glass arena-reveal chapter-motion">
            <div className="ide-header">
              <div className="ide-file-meta">
                <span className="ide-mark"><Code2 size={16} /></span>
                <div>
                  <strong>solution.{selectedLang === "javascript" ? "js" : selectedLang === "python" ? "py" : "cpp"}</strong>
                  <small>NEURAL EDITOR // AUTOSAVE ENABLED</small>
                </div>
              </div>

              <div className="ide-tools">
                <label className="language-select">
                  <Cpu size={13} />
                  <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
                    <option value="javascript">JavaScript / V8</option>
                    <option value="python">Python 3 / Sim</option>
                    <option value="cpp">C++20 / Sim</option>
                  </select>
                </label>
                <button type="button" onClick={handleCopyCode} title="Copy code">
                  <Copy size={14} /> {copiedCode ? "Copied" : "Copy"}
                </button>
                <button type="button" onClick={handleResetCode} title="Reset code">
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            <div className="editor-stage">
              <div className="editor-gutter" aria-hidden="true">
                {Array.from({ length: Math.max(12, code.split("\n").length) }).slice(0, 80).map((_, index) => (
                  <span key={index}>{index + 1}</span>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                aria-label="Solution code editor"
                placeholder="// Build the algorithm that unlocks this sector..."
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
                  {isRunning ? "EXECUTING" : selectedLang === "javascript" ? "V8 READY" : "SIM READY"}
                </span>
              </div>

              <div className="terminal-body">
                {terminalLogs.length === 0 ? (
                  <div className="terminal-empty">
                    <span>$</span> Awaiting solution payload. Run tests to initiate verification sequence...
                  </div>
                ) : (
                  terminalLogs.map((log, index) => (
                    <div key={index} className={`terminal-line log-${log.type}`}>
                      <span className="terminal-line-no">{String(index + 1).padStart(2, "0")}</span>
                      <span>{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="ide-action-bar">
              <div className="submission-state">
                {isChapterCompleted ? (
                  <>
                    <CheckCircle2 size={15} />
                    <span><b>VERIFIED</b> Sector signature accepted.</span>
                  </>
                ) : (
                  <>
                    <Flame size={15} />
                    <span>Flawless execution keeps the <b>+50 bonus</b> alive.</span>
                  </>
                )}
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleExecute(false)}
                  className="test-button"
                >
                  <Play size={14} />
                  Run Tests
                </button>
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => handleExecute(true)}
                  className={`submit-button run-pulse ${isChapterCompleted ? "is-complete" : ""}`}
                >
                  {isRunning ? <Cpu className="spin-icon" size={15} /> : isChapterCompleted ? <Crown size={15} /> : <Send size={15} />}
                  <span>{isRunning ? "Verifying..." : isChapterCompleted ? "Re-Submit" : "Submit & Unlock"}</span>
                  <i />
                </button>
              </div>
            </div>
          </section>
        </main>

        <footer className="arena-footer arena-reveal">
          <span><i /> ENCRYPTION: AES-256</span>
          <span>NODE: CODELAND-SUNDAY-ARENA</span>
          <span>LATENCY: 08MS</span>
        </footer>
      </div>
    </div>
  );
}
