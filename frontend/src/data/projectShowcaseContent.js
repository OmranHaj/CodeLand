/* ====================================================== */
/* PROJECT SHOWCASE CONTENT */
/* ====================================================== */

export const PROJECT_SHOWCASE_CONTENT = {
  id: "project-showcase",

  slug: "project-showcase",

  title: "Project Showcase",

  subtitle: "Build. Polish. Ship.",

  description:
    "Turn everything you learned in HTML, CSS, JavaScript, and React into polished real-world projects.",

  version: 1,

  status: "published",

  accent: "#ffcf5a",

  secondaryAccent: "#ff6f91",

  estimatedMinutes: 430,

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "jsx",
  },

  studio: {
    label: "CAPSTONE STUDIO",

    headline: "You are not following tutorials anymore.",

    description:
      "Every mission starts with a product brief and ends with something you can proudly ship.",

    level: "advanced-capstone",

    rules: [
      "Every build phase has deliverables and quality gates.",
      "A phase is ready only when every required check is complete.",
      "Your code draft is saved locally while you work.",
      "Shipping a project requires a complete readiness pass.",
    ],

    workflow: [
      {
        id: "brief",
        label: "Brief",
        status: "PLANNING",
        description: "Understand the product, audience, and success criteria.",
      },
      {
        id: "architecture",
        label: "Architecture",
        status: "PLANNING",
        description:
          "Plan components, data, and state ownership before building.",
      },
      {
        id: "build",
        label: "Build",
        status: "BUILDING",
        description: "Create the interface structure and core product surface.",
      },
      {
        id: "behavior",
        label: "Behavior",
        status: "BUILDING",
        description:
          "Connect interaction, state, events, and application logic.",
      },
      {
        id: "polish",
        label: "Polish",
        status: "TESTING",
        description:
          "Review responsiveness, accessibility, feedback, and visual quality.",
      },
      {
        id: "ship",
        label: "Ship",
        status: "READY TO SHIP",
        description:
          "Run the final review and prepare the project for presentation.",
      },
    ],

    phases: ["Brief", "Architecture", "Build", "Behavior", "Polish", "Ship"],
  },

  /* ==================================================== */
  /* PROJECT MISSIONS */
  /* ==================================================== */

  lessons: [
    /* ================================================== */
    /* PROJECT 1 */
    /* ================================================== */

    {
      id: "showcase-creator-profile",

      slug: "showcase-creator-profile",

      order: 1,

      kind: "project",

      title: "Creator Profile",

      subtitle: "Build a polished personal interface",

      description:
        "Design and build a responsive creator profile using semantic structure, reusable React components, and refined visual hierarchy.",

      difficulty: "advanced",

      xp: 350,

      estimatedMinutes: 55,

      status: "published",

      badge: "INTERFACE",

      animation: {
        id: "creator-profile-signature",
        type: "animation",
        template: "project-creator-profile",
        props: {
          creatorName: "Alex",
          role: "Frontend Explorer",
          skills: ["HTML", "CSS", "JavaScript", "React"],
          projectName: "CodeLand Dashboard",
        },
      },

      skills: [
        "Semantic HTML",
        "Responsive CSS",
        "React Components",
        "Props",
        "Composition",
      ],

      brief:
        "A young creator needs a profile page that introduces who they are, what they build, and the technologies they use. The interface must feel polished on both desktop and mobile.",

      successDefinition:
        "Ship a responsive profile that feels intentionally designed, uses reusable components, and remains clear across desktop and mobile.",

      outcomes: [
        "Break a complete design into reusable components.",
        "Create a strong responsive layout.",
        "Use props to keep repeated UI flexible.",
        "Polish spacing, hierarchy, and interaction states.",
      ],

      phases: [
        {
          id: "brief",

          title: "Understand the Brief",

          goal: "Identify the information hierarchy before writing any components.",

          deliverables: [
            "Profile identity",
            "Skills section",
            "Project preview",
            "Primary action",
          ],

          checkpoints: [
            "The most important content is obvious.",
            "The page has one clear primary action.",
          ],
        },

        {
          id: "architecture",

          title: "Plan the Components",

          goal: "Split the interface into small focused React components.",

          deliverables: [
            "ProfileHeader",
            "SkillBadge",
            "ProjectCard",
            "ActionButton",
          ],

          checkpoints: [
            "Repeated UI is componentized.",
            "Props are used instead of duplicated markup.",
          ],
        },

        {
          id: "build",

          title: "Build the Interface",

          goal: "Create the complete structure and responsive layout.",

          deliverables: ["Desktop layout", "Mobile layout", "Reusable cards"],

          checkpoints: [
            "No horizontal overflow.",
            "Content remains readable on small screens.",
          ],
        },

        {
          id: "behavior",

          title: "Add Interaction",

          goal: "Add useful interaction without distracting from the content.",

          deliverables: [
            "Interactive project cards",
            "Working CTA",
            "Hover and focus states",
          ],

          checkpoints: [
            "Interactive elements communicate their state.",
            "Keyboard focus is visible.",
          ],
        },

        {
          id: "polish",

          title: "Polish the Experience",

          goal: "Refine typography, spacing, motion, and accessibility.",

          deliverables: [
            "Consistent spacing",
            "Responsive typography",
            "Subtle motion",
          ],

          checkpoints: [
            "Motion supports understanding.",
            "Contrast remains readable.",
          ],
        },

        {
          id: "ship",

          title: "Ship",

          goal: "Perform a final quality pass and prepare the project for presentation.",

          deliverables: [
            "Finished profile",
            "Clean component structure",
            "Presentation-ready result",
          ],

          checkpoints: [
            "No placeholder content remains.",
            "The interface works at multiple viewport sizes.",
          ],
        },
      ],

      starterCode: `function SkillBadge({ children }) {
  return (
    <span>
      {children}
    </span>
  );
}

function CreatorProfile() {
  return (
    <main>
      {/* Build your profile */}
    </main>
  );
}

export default CreatorProfile;`,
    },

    /* ================================================== */
    /* PROJECT 2 */
    /* ================================================== */

    {
      id: "showcase-quiz-engine",

      slug: "showcase-quiz-engine",

      order: 2,

      kind: "project",

      title: "Quiz Engine",

      subtitle: "Turn data into an interactive experience",

      description:
        "Build a complete quiz experience with state, events, progress, conditional rendering, and reusable question data.",

      difficulty: "advanced",

      xp: 420,

      estimatedMinutes: 65,

      status: "published",

      badge: "INTERACTION",

      animation: {
        id: "quiz-engine-signature",
        type: "animation",
        template: "project-quiz-engine",
        props: {
          question: "Which language styles a webpage?",
          answers: ["HTML", "CSS", "JavaScript"],
          correctAnswer: "CSS",
          score: 1,
          total: 1,
        },
      },

      skills: [
        "State",
        "Events",
        "Arrays",
        "Conditional Rendering",
        "Derived UI",
      ],

      brief:
        "Create a quiz experience that presents one question at a time, tracks answers, shows progress, calculates a score, and displays a final result.",

      successDefinition:
        "Ship a restartable quiz flow with reliable scoring, clear progress, and reusable data-driven questions.",

      outcomes: [
        "Model application data using arrays and objects.",
        "Manage multiple pieces of React state.",
        "Derive interface output from state.",
        "Handle complete user flows instead of isolated clicks.",
      ],

      phases: [
        {
          id: "brief",
          title: "Define the Experience",
          goal: "Understand the complete flow from the first question to the final result.",
          deliverables: ["Question flow", "Answer flow", "Score screen"],
          checkpoints: [
            "The user always knows what to do next.",
            "The end state is clearly defined.",
          ],
        },

        {
          id: "architecture",
          title: "Model the Data",
          goal: "Create reusable question objects instead of hard-coded screens.",
          deliverables: [
            "questions array",
            "Question component",
            "AnswerButton component",
          ],
          checkpoints: [
            "Adding a question does not require new page markup.",
            "Answers are rendered from data.",
          ],
        },

        {
          id: "build",
          title: "Build the Quiz UI",
          goal: "Create the question, answer, and progress interfaces.",
          deliverables: [
            "Question card",
            "Answer options",
            "Progress indicator",
          ],
          checkpoints: [
            "Every question fits the same layout.",
            "The current question is visually clear.",
          ],
        },

        {
          id: "behavior",
          title: "Create the Logic",
          goal: "Connect answers to state, scoring, and navigation.",
          deliverables: [
            "Current question state",
            "Score state",
            "Answer handler",
          ],
          checkpoints: [
            "A click advances exactly once.",
            "Score updates only for correct answers.",
          ],
        },

        {
          id: "polish",
          title: "Design Feedback",
          goal: "Make correct, incorrect, loading, and completion states understandable.",
          deliverables: [
            "Answer feedback",
            "Completion transition",
            "Restart action",
          ],
          checkpoints: [
            "Feedback is immediate.",
            "Restart returns the app to a clean state.",
          ],
        },

        {
          id: "ship",
          title: "Ship",
          goal: "Test the complete journey and remove edge-case bugs.",
          deliverables: [
            "Finished quiz",
            "Restartable flow",
            "Stable score system",
          ],
          checkpoints: [
            "The last question transitions correctly.",
            "The quiz can be completed repeatedly.",
          ],
        },
      ],

      starterCode: `const questions = [
  {
    question: "Which language styles a webpage?",
    answers: ["HTML", "CSS", "JavaScript"],
    correct: "CSS",
  },
];

function QuizApp() {
  return (
    <main>
      {/* Build the quiz engine */}
    </main>
  );
}

export default QuizApp;`,
    },

    /* ================================================== */
    /* PROJECT 3 */
    /* ================================================== */

    {
      id: "showcase-mission-dashboard",

      slug: "showcase-mission-dashboard",

      order: 3,

      kind: "project",

      title: "Mission Dashboard",

      subtitle: "Design a data-driven application",

      description:
        "Build a dashboard that renders missions from data and lets the user filter, inspect, and track their status.",

      difficulty: "advanced",

      xp: 480,

      estimatedMinutes: 70,

      status: "published",

      badge: "DATA UI",

      animation: {
        id: "mission-dashboard-signature",
        type: "animation",
        template: "project-mission-dashboard",
        props: {
          activeFilter: "All",
          missions: [
            {
              title: "HTML Foundations",
              status: "Complete",
              progress: 100,
            },
            {
              title: "CSS Styling",
              status: "Active",
              progress: 72,
            },
            {
              title: "React Nexus",
              status: "Locked",
              progress: 0,
            },
          ],
        },
      },

      skills: [
        "Array Mapping",
        "Filtering",
        "Reusable Components",
        "State",
        "Conditional UI",
      ],

      brief:
        "Build a mission control dashboard where users can browse missions, filter by status, and inspect progress without navigating away from the experience.",

      successDefinition:
        "Ship a responsive dashboard where filters, counts, selection, and empty states always agree with the underlying mission data.",

      outcomes: [
        "Turn structured data into reusable interface sections.",
        "Build filtering from application state.",
        "Create reusable cards with multiple visual states.",
        "Design empty states and selected states.",
      ],

      phases: [
        {
          id: "brief",
          title: "Understand the Dashboard",
          goal: "Define what information a user needs to scan quickly.",
          deliverables: ["Mission title", "Status", "Progress", "Difficulty"],
          checkpoints: [
            "Cards are easy to scan.",
            "Status is understandable without opening a mission.",
          ],
        },

        {
          id: "architecture",
          title: "Design the Data Model",
          goal: "Represent missions with consistent objects.",
          deliverables: ["missions array", "MissionCard", "FilterBar"],
          checkpoints: [
            "Every mission uses the same data shape.",
            "Filters do not depend on hard-coded cards.",
          ],
        },

        {
          id: "build",
          title: "Build the Dashboard",
          goal: "Create the responsive dashboard and mission grid.",
          deliverables: ["Header metrics", "Filter controls", "Mission grid"],
          checkpoints: [
            "The grid adapts to the viewport.",
            "Cards retain a consistent rhythm.",
          ],
        },

        {
          id: "behavior",
          title: "Connect Filters",
          goal: "Use state to filter and select mission data.",
          deliverables: [
            "Status filter",
            "Selected mission",
            "Dynamic mission count",
          ],
          checkpoints: [
            "Filters update immediately.",
            "The visible count matches the rendered cards.",
          ],
        },

        {
          id: "polish",
          title: "Handle Every State",
          goal: "Design active, locked, complete, and empty states.",
          deliverables: [
            "Empty result state",
            "Progress treatment",
            "Selection feedback",
          ],
          checkpoints: [
            "Empty filters do not create a broken screen.",
            "State changes are visually obvious.",
          ],
        },

        {
          id: "ship",
          title: "Ship",
          goal: "Run a complete interaction and responsive QA pass.",
          deliverables: [
            "Finished dashboard",
            "Responsive filters",
            "Stable state flow",
          ],
          checkpoints: [
            "All filters behave predictably.",
            "No state produces broken layout.",
          ],
        },
      ],

      starterCode: `const missions = [
  {
    id: 1,
    title: "HTML Foundations",
    status: "complete",
    progress: 100,
  },
];

function MissionDashboard() {
  return (
    <main>
      {/* Build the dashboard */}
    </main>
  );
}

export default MissionDashboard;`,
    },

    /* ================================================== */
    /* PROJECT 4 */
    /* ================================================== */

    {
      id: "showcase-launch-page",

      slug: "showcase-launch-page",

      order: 4,

      kind: "project",

      title: "Product Launch",

      subtitle: "Create a premium responsive landing experience",

      description:
        "Build a polished launch page with responsive sections, reusable components, accessible interactions, and purposeful motion.",

      difficulty: "advanced",

      xp: 520,

      estimatedMinutes: 75,

      status: "published",

      badge: "VISUAL SYSTEM",

      animation: {
        id: "product-launch-signature",
        type: "animation",
        template: "project-product-launch",
        props: {
          productName: "Nova",
          headline: "Build faster. Launch smarter.",
          sections: ["Hero", "Features", "Proof", "CTA"],
        },
      },

      skills: [
        "Responsive Design",
        "Component Systems",
        "CSS Grid",
        "Flexbox",
        "Motion",
        "Accessibility",
      ],

      brief:
        "A new digital product needs a launch page that explains its value immediately and feels premium across phones, tablets, and desktops.",

      successDefinition:
        "Ship a presentation-ready launch experience with a coherent design system, strong responsive behavior, and accessible purposeful motion.",

      outcomes: [
        "Build a complete visual system instead of disconnected sections.",
        "Create fluid responsive layouts.",
        "Use motion to guide attention.",
        "Apply accessibility and usability checks.",
      ],

      phases: [
        {
          id: "brief",
          title: "Define the Story",
          goal: "Plan the order in which the page communicates value.",
          deliverables: ["Hero", "Benefits", "Feature section", "Final CTA"],
          checkpoints: [
            "The hero communicates one clear message.",
            "Sections follow a logical story.",
          ],
        },

        {
          id: "architecture",
          title: "Build the Design System",
          goal: "Create reusable primitives for typography, buttons, cards, and sections.",
          deliverables: ["Button", "SectionHeading", "FeatureCard"],
          checkpoints: [
            "Repeated styles are reusable.",
            "Components share consistent spacing.",
          ],
        },

        {
          id: "build",
          title: "Create the Responsive Page",
          goal: "Build every section and establish responsive behavior.",
          deliverables: ["Hero layout", "Feature grid", "Responsive sections"],
          checkpoints: [
            "The layout works without fixed desktop assumptions.",
            "No content becomes cramped on mobile.",
          ],
        },

        {
          id: "behavior",
          title: "Add Purposeful Motion",
          goal: "Use interaction and motion only where it improves understanding.",
          deliverables: ["Hover states", "Section reveals", "CTA interaction"],
          checkpoints: [
            "Motion is subtle.",
            "Reduced-motion users still get a complete experience.",
          ],
        },

        {
          id: "polish",
          title: "Run the Quality Pass",
          goal: "Refine visual rhythm, readability, focus states, and contrast.",
          deliverables: [
            "Typography pass",
            "Accessibility pass",
            "Spacing pass",
          ],
          checkpoints: [
            "Keyboard navigation remains usable.",
            "Text remains readable over every background.",
          ],
        },

        {
          id: "ship",
          title: "Launch",
          goal: "Prepare a presentation-ready final product.",
          deliverables: [
            "Final landing page",
            "Mobile version",
            "Desktop version",
          ],
          checkpoints: [
            "Every section feels intentional.",
            "The page is ready to demo.",
          ],
        },
      ],

      starterCode: `function ProductLaunch() {
  return (
    <main>
      <section>
        {/* Build the hero */}
      </section>

      <section>
        {/* Build the product story */}
      </section>
    </main>
  );
}

export default ProductLaunch;`,
    },

    /* ================================================== */
    /* PROJECT 5 */
    /* ================================================== */

    {
      id: "showcase-explorer-hub",

      slug: "showcase-explorer-hub",

      order: 5,

      kind: "project",

      title: "Explorer Hub",

      subtitle: "Build a small product, not just a page",

      description:
        "Combine forms, state, derived data, components, events, lists, and reusable UI into a cohesive mini application.",

      difficulty: "advanced",

      xp: 650,

      estimatedMinutes: 85,

      status: "published",

      badge: "PRODUCT APP",

      animation: {
        id: "explorer-hub-signature",
        type: "animation",
        template: "project-explorer-hub",
        props: {
          filter: "All",
          goals: [
            {
              title: "Build Portfolio",
              category: "Code",
              complete: true,
            },
            {
              title: "Learn React",
              category: "Learn",
              complete: false,
            },
            {
              title: "Ship Project",
              category: "Build",
              complete: false,
            },
          ],
        },
      },

      skills: [
        "State Architecture",
        "Controlled Forms",
        "Derived Data",
        "Component Composition",
        "Reusable UI",
      ],

      brief:
        "Build a personal learning hub where users can add goals, track their status, filter them, and see their overall progress.",

      successDefinition:
        "Ship a cohesive mini product where creating, completing, filtering, and measuring goals all work from one predictable state model.",

      outcomes: [
        "Think about state ownership before building.",
        "Connect controlled forms to application data.",
        "Build reusable components around real product behavior.",
        "Create a complete create-update-filter experience.",
      ],

      phases: [
        {
          id: "brief",
          title: "Map the Product",
          goal: "Define the actions the user can perform and the states the app can enter.",
          deliverables: [
            "Create goal",
            "Complete goal",
            "Filter goals",
            "Progress summary",
          ],
          checkpoints: [
            "Every feature has a clear user action.",
            "Application states are documented.",
          ],
        },

        {
          id: "architecture",
          title: "Plan State Ownership",
          goal: "Decide where data lives and which components receive it through props.",
          deliverables: ["App state", "GoalForm", "GoalList", "GoalCard"],
          checkpoints: [
            "Shared state has one clear owner.",
            "Child components receive only what they need.",
          ],
        },

        {
          id: "build",
          title: "Build the Product Shell",
          goal: "Create the form, metrics, filters, and goal list.",
          deliverables: ["Dashboard shell", "Goal form", "Goal cards"],
          checkpoints: [
            "All major product sections are represented.",
            "Layout remains usable with many goals.",
          ],
        },

        {
          id: "behavior",
          title: "Connect the Product Logic",
          goal: "Implement creation, completion, filtering, and derived progress.",
          deliverables: [
            "Add goal handler",
            "Toggle complete handler",
            "Filter state",
            "Progress calculation",
          ],
          checkpoints: [
            "State updates are immutable.",
            "Progress is calculated from current data.",
          ],
        },

        {
          id: "polish",
          title: "Design Product States",
          goal: "Handle empty, active, complete, and filtered states beautifully.",
          deliverables: ["Empty state", "Completed styling", "Filter feedback"],
          checkpoints: [
            "The app never feels visually broken.",
            "Important state changes are obvious.",
          ],
        },

        {
          id: "ship",
          title: "Ship the Product",
          goal: "Test the full product lifecycle and prepare it for the final showcase.",
          deliverables: [
            "Finished mini app",
            "Stable interactions",
            "Presentation-ready UI",
          ],
          checkpoints: [
            "Create, update, and filter all work together.",
            "No feature depends on placeholder logic.",
          ],
        },
      ],

      starterCode: `import { useState } from "react";

function ExplorerHub() {
  const [goals, setGoals] = useState([]);

  return (
    <main>
      {/* Build your product */}
    </main>
  );
}

export default ExplorerHub;`,
    },
  ],

  /* ==================================================== */
  /* FINAL CAPSTONE */
  /* ==================================================== */

  challenges: [
    {
      id: "showcase-final-portfolio",

      slug: "showcase-final-portfolio",

      order: 1,

      kind: "final-capstone",

      title: "Portfolio Command Center",

      subtitle: "Your final CodeLand build",

      description:
        "Design and build a personal portfolio that presents your strongest projects as a complete polished product.",

      difficulty: "capstone",

      xp: 1200,

      estimatedMinutes: 110,

      status: "published",

      badge: "FINAL BUILD",

      animation: {
        id: "final-portfolio-signature",
        type: "animation",
        template: "project-final-portfolio",
        props: {
          creatorName: "Alex",
          projects: [
            "Creator Profile",
            "Quiz Engine",
            "Mission Dashboard",
            "Product Launch",
            "Explorer Hub",
          ],
        },
      },

      skills: [
        "Product Planning",
        "React Architecture",
        "Responsive Design",
        "Reusable UI",
        "Interaction Design",
        "Accessibility",
        "Presentation",
      ],

      brief:
        "Create a portfolio that introduces you, presents selected projects, communicates your skills, and gives visitors a clear way to explore your work.",

      successDefinition:
        "Ship a portfolio that clearly communicates who you are, proves your strongest frontend skills, and presents your work with professional visual and interaction quality.",

      outcomes: [
        "Plan and execute a complete frontend product independently.",
        "Create a reusable component architecture.",
        "Present multiple finished projects clearly.",
        "Ship an interface worthy of your CodeLand journey.",
      ],

      phases: [
        {
          id: "brief",
          title: "Choose Your Story",
          goal: "Decide what your portfolio should communicate about you.",
          deliverables: [
            "Personal introduction",
            "Selected projects",
            "Skills",
            "Contact action",
          ],
          checkpoints: [
            "The portfolio has a clear audience.",
            "Only strong work is included.",
          ],
        },

        {
          id: "architecture",
          title: "Design the System",
          goal: "Plan the page structure and reusable component system.",
          deliverables: [
            "Navigation",
            "ProjectCard",
            "SectionHeading",
            "ActionButton",
          ],
          checkpoints: [
            "Repeated UI is reusable.",
            "Page structure is understandable before styling.",
          ],
        },

        {
          id: "build",
          title: "Build the Portfolio",
          goal: "Create all primary sections and responsive layouts.",
          deliverables: ["Hero", "Projects", "Skills", "About", "Contact"],
          checkpoints: [
            "All sections work on mobile.",
            "Project content is easy to scan.",
          ],
        },

        {
          id: "behavior",
          title: "Add Experience",
          goal: "Add navigation, interaction, and purposeful motion.",
          deliverables: [
            "Navigation behavior",
            "Project interactions",
            "Motion system",
          ],
          checkpoints: [
            "Interactions are predictable.",
            "Motion does not block content.",
          ],
        },

        {
          id: "polish",
          title: "Portfolio Review",
          goal: "Perform a professional visual and accessibility review.",
          deliverables: [
            "Responsive QA",
            "Accessibility QA",
            "Content QA",
            "Visual QA",
          ],
          checkpoints: [
            "No unfinished copy remains.",
            "Focus states are visible.",
            "Spacing is consistent.",
          ],
        },

        {
          id: "ship",
          title: "Launch Your Work",
          goal: "Finalize the project and prepare it for presentation.",
          deliverables: [
            "Finished portfolio",
            "Project showcase",
            "Final presentation",
          ],
          checkpoints: [
            "The project is demo-ready.",
            "The result represents your strongest work.",
          ],
        },
      ],

      starterCode: `function Portfolio() {
  return (
    <main>
      <section>
        {/* Introduce yourself */}
      </section>

      <section>
        {/* Showcase your projects */}
      </section>

      <section>
        {/* Show your skills */}
      </section>
    </main>
  );
}

export default Portfolio;`,
    },
  ],
};

export default PROJECT_SHOWCASE_CONTENT;
