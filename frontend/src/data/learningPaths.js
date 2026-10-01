import { Code2, Cpu, TerminalSquare } from "lucide-react";

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
    id: "cpp-developer",
    title: "C++ Developer",
    eyebrow: "SYSTEMS · LOGIC · PERFORMANCE",
    description: "Build a strong foundation in C++, from your first program to object-oriented design and complete systems.",
    icon: Cpu,
    accent: "#2f8cff",
    secondaryAccent: "#7be7ff",
    difficulty: "Beginner to Advanced",
    estimatedJourney: "9 Worlds",
    skills: ["C++", "Logic", "Memory", "OOP", "STL"],
    worldTitle: "C++ Core",
    worldDescription: "Discover a world of logic, memory and powerful systems.",
    route: "/student/cpp-world",
  },

  {
    // MOCK DATA: Commented out mock id python-explorer to match PostgreSQL database track
    // id: "python-explorer",
    id: "algorithm-master",

    title: "Algorithm & Data Structures",

    eyebrow: "ALGORITHMS · DATA STRUCTURES",

    description:
      "Master fundamental and advanced algorithms, data structures, trees, graphs, sorting, and dynamic programming through interactive 3D visualizations.",

    icon: TerminalSquare,

    accent: "#10b981",

    secondaryAccent: "#f59e0b",

    difficulty: "Beginner to Advanced",

    estimatedJourney: "8 Sectors",

    skills: [
      "Arrays & Lists",
      "Stacks & Queues",
      "Sorting & Searching",
      "Trees & Graphs",
      "Dynamic Programming",
    ],

    worldTitle: "The Quantum Citadel",

    worldDescription:
      "An ultra-luxurious quantum cyber realm of algorithmic structures, floating node networks, and real-time visualizers.",

    route: "/student/python-world",
  },
];

export function getLearningPathById(pathId) {
  return learningPaths.find(
    (path) =>
      path.id === pathId ||
      (pathId === "python-explorer" && path.id === "algorithm-master")
  );
}
