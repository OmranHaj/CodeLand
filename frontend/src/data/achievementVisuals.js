import { Award, Bomb, BookOpen, Bot, Code2, Compass, Cpu, Flame, Radar, Rocket, ShieldCheck, Sparkles, Trophy, Zap } from "lucide-react";

// Icon and accent color for each achievement id (the badge image files in the database do not exist).
export const ACHIEVEMENT_ICONS = {
  "first-step": Sparkles,
  "curious-mind": BookOpen,
  "challenge-gladiator": Code2,
  "first-project": Rocket,
  "xp-explorer": Zap,
  "xp-1000": Trophy,
  "streak-3": Flame,
  "streak-7": Award,
  "web-creator-apprentice": Compass,
  "cpp-system-pioneer": ShieldCheck,
  "algorithm-mastermind": Cpu,
  "maze-runner": Bot,
  "sky-defender": Radar,
  "bomb-defuser": Bomb,
};

export const ACHIEVEMENT_ACCENTS = {
  "first-step": "#a855f7",
  "curious-mind": "#38bdf8",
  "challenge-gladiator": "#34d399",
  "first-project": "#f43f5e",
  "xp-explorer": "#fbbf24",
  "xp-1000": "#eab308",
  "streak-3": "#f97316",
  "streak-7": "#ec4899",
  "web-creator-apprentice": "#6366f1",
  "cpp-system-pioneer": "#06b6d4",
  "algorithm-mastermind": "#8b5cf6",
  "maze-runner": "#3b82f6",
  "sky-defender": "#10b981",
  "bomb-defuser": "#ef4444",
};
