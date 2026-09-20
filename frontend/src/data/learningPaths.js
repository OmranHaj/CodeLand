import { Code2, Gamepad2, TerminalSquare } from "lucide-react";

export const learningPaths = [
  {
    id: "web-creator",

    title: "Web Creator",

    eyebrow: "BUILD THE WEB",

    description:
      "Create beautiful websites, interactive experiences, and modern applications from the ground up.",

    icon: Code2,

    accent: "#7c5cff",

    secondaryAccent: "#35c2ff",

    difficulty: "Beginner Friendly",

    estimatedJourney: "5 Worlds",

    skills: ["HTML", "CSS", "JavaScript", "React", "Real Projects"],

    worldTitle: "The Web Realm",

    worldDescription:
      "A futuristic digital city where every district unlocks a new web development power.",

    route: "/student/world",
  },

  {
    id: "game-maker",

    title: "Game Maker",

    eyebrow: "CREATE & PLAY",

    description:
      "Learn programming by building interactive games, mechanics, challenges, and playable worlds.",

    icon: Gamepad2,

    accent: "#ff6b9d",

    secondaryAccent: "#ffb347",

    difficulty: "Beginner Friendly",

    estimatedJourney: "5 Worlds",

    skills: [
      "Logic",
      "JavaScript",
      "Game Mechanics",
      "Canvas",
      "Game Projects",
    ],

    worldTitle: "The Game Frontier",

    worldDescription:
      "An adventurous world filled with arenas, machines, challenges, and interactive missions.",

    route: "/student/world",
  },

  {
    id: "python-explorer",

    title: "Python Explorer",

    eyebrow: "EXPLORE CODE",

    description:
      "Master programming fundamentals, problem solving, data, and automation through Python.",

    icon: TerminalSquare,

    accent: "#36d399",

    secondaryAccent: "#3b82f6",

    difficulty: "Beginner Friendly",

    estimatedJourney: "5 Worlds",

    skills: ["Programming", "Python", "Logic", "Data", "Python Projects"],

    worldTitle: "The Python Nexus",

    worldDescription:
      "A mysterious technological research world powered by logic, data, and automation.",

    route: "/student/world",
  },
];

export function getLearningPathById(pathId) {
  return learningPaths.find((path) => path.id === pathId);
}
