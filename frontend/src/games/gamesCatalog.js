import { Bomb, Bot, Radar } from "lucide-react";

/**
 * How each game looks on the hub. Unlock XP, reward XP and badges come from the server (GET /games);
 * this only adds presentation.
 */
export const GAME_PRESENTATION = {
  "robot-maze": {
    icon: Bot,
    accent: "#3b82f6",
    tagline: "Guide a robot through glowing 3D mazes with your own code.",
    skills: ["Sequences", "while loops", "if / else"],
    stages: "3 mazes",
    badge: "Maze Runner",
  },
  "sky-traps": {
    icon: Radar,
    accent: "#10b981",
    tagline: "Traps are falling from the sky. Write the right line before they land.",
    skills: ["Functions", "Arrays", "Strings", "Objects"],
    stages: "5 traps",
    badge: "Sky Defender",
  },
  "bomb-defuser": {
    icon: Bomb,
    accent: "#ef4444",
    tagline: "Crack the cipher and return the code before the timer hits 00:00.",
    skills: ["Functions", "Array methods", "Debugging"],
    stages: "3 bombs",
    badge: "Bomb Defuser",
  },
};
