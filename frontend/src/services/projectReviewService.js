import { transform } from "@babel/standalone";

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function normalizeSource(value = "") {
  return String(value || "").trim();
}

function test(source, pattern) {
  return pattern.test(source);
}

function testAny(source, patterns = []) {
  return patterns.some((pattern) => test(source, pattern));
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function createCheck({ id, label, passed, hint = "", type = "project" }) {
  return {
    id,
    label,
    passed: Boolean(passed),
    hint,
    type,
  };
}

/* ====================================================== */
/* JSX COMPILATION */
/* ====================================================== */

function checkCompilation(code) {
  if (!code.trim()) {
    return createCheck({
      id: "compile",
      label: "JSX contains build code",
      passed: false,
      hint: "Add your project code before running the review.",
      type: "system",
    });
  }

  try {
    transform(code, {
      filename: "CodeLandProjectReview.jsx",
      sourceType: "module",
      presets: [
        ["env", { modules: "commonjs" }],
        ["react", { runtime: "classic" }],
      ],
    });

    return createCheck({
      id: "compile",
      label: "JSX compiles successfully",
      passed: true,
      type: "system",
    });
  } catch (error) {
    return createCheck({
      id: "compile",
      label: "JSX compiles successfully",
      passed: false,
      hint:
        error?.message?.split("\n")?.[0] ||
        "Fix the JSX syntax error and review again.",
      type: "system",
    });
  }
}

/* ====================================================== */
/* GENERAL CHECKS */
/* ====================================================== */

function getGeneralChecks(code, previewStatus) {
  return [
    checkCompilation(code),

    createCheck({
      id: "default-export",
      label: "Project has a default export",
      passed: test(code, /export\s+default\s+[A-Za-z_$][\w$]*/),
      hint: "Export the main project component with export default.",
      type: "system",
    }),

    createCheck({
      id: "preview",
      label: "Latest preview rendered successfully",
      passed: previewStatus?.state === "success",
      hint:
        previewStatus?.state === "error"
          ? previewStatus.message
          : "Run the project preview successfully before the final review.",
      type: "system",
    }),
  ];
}

/* ====================================================== */
/* CREATOR PROFILE */
/* ====================================================== */

function reviewCreatorProfile(code, css) {
  return [
    createCheck({
      id: "profile-identity",
      label: "Profile identity is rendered",
      passed: testAny(code, [
        /ProfileHeader/,
        /creatorName/i,
        /Frontend\s+Explorer/i,
        /<h1[\s>]/i,
      ]),
      hint: "Render a clear creator name, role, or ProfileHeader.",
    }),

    createCheck({
      id: "skill-component",
      label: "Skills use reusable UI",
      passed:
        test(code, /function\s+SkillBadge/) ||
        test(code, /const\s+SkillBadge\s*=/) ||
        test(code, /<SkillBadge[\s>]/),
      hint: "Create and use a reusable SkillBadge component.",
    }),

    createCheck({
      id: "project-card",
      label: "Project preview is componentized",
      passed:
        test(code, /function\s+ProjectCard/) ||
        test(code, /const\s+ProjectCard\s*=/) ||
        test(code, /<ProjectCard[\s>]/),
      hint: "Create a reusable ProjectCard for featured work.",
    }),

    createCheck({
      id: "profile-cta",
      label: "Primary action exists",
      passed: testAny(code, [/<button[\s>]/i, /<a[\s>]/i, /View\s+Projects/i]),
      hint: "Add a clear primary CTA such as View Projects.",
    }),

    createCheck({
      id: "profile-responsive",
      label: "Responsive styling is present",
      passed: testAny(css, [
        /@media/i,
        /clamp\s*\(/i,
        /minmax\s*\(/i,
        /auto-fit/i,
        /auto-fill/i,
      ]),
      hint: "Add responsive CSS with a media query or fluid layout rules.",
    }),
  ];
}

/* ====================================================== */
/* QUIZ ENGINE */
/* ====================================================== */

function reviewQuizEngine(code) {
  return [
    createCheck({
      id: "quiz-data",
      label: "Questions are data-driven",
      passed: test(code, /\bquestions\s*=\s*\[/) && test(code, /question\s*:/),
      hint: "Store quiz questions inside a reusable questions array.",
    }),

    createCheck({
      id: "quiz-question-state",
      label: "Current question is stored in state",
      passed: testAny(code, [
        /useState\s*\([^)]*\).*currentQuestion/is,
        /\[\s*currentQuestion\s*,\s*setCurrentQuestion\s*\]\s*=\s*useState/i,
        /\[\s*questionIndex\s*,\s*setQuestionIndex\s*\]\s*=\s*useState/i,
      ]),
      hint: "Use state to track the current question or question index.",
    }),

    createCheck({
      id: "quiz-score",
      label: "Quiz score is stored in state",
      passed: test(code, /\[\s*score\s*,\s*setScore\s*\]\s*=\s*useState/i),
      hint: "Create score state with useState.",
    }),

    createCheck({
      id: "quiz-events",
      label: "Answers trigger quiz logic",
      passed:
        test(code, /onClick\s*=/) &&
        testAny(code, [
          /handleAnswer/i,
          /selectAnswer/i,
          /answerQuestion/i,
          /setScore/i,
        ]),
      hint: "Connect answer buttons to an answer handler.",
    }),

    createCheck({
      id: "quiz-result",
      label: "Result or completion UI exists",
      passed: testAny(code, [
        /result/i,
        /quizComplete/i,
        /completed/i,
        /finalScore/i,
        /score\s*\}/i,
      ]),
      hint: "Render a final result screen when the quiz ends.",
    }),

    createCheck({
      id: "quiz-restart",
      label: "Quiz can restart",
      passed: testAny(code, [
        /restart/i,
        /resetQuiz/i,
        /setScore\s*\(\s*0\s*\)/,
      ]),
      hint: "Add a restart action that resets quiz state.",
    }),
  ];
}

/* ====================================================== */
/* MISSION DASHBOARD */
/* ====================================================== */

function reviewMissionDashboard(code) {
  return [
    createCheck({
      id: "mission-data",
      label: "Mission data is structured",
      passed: test(code, /\bmissions\s*=\s*\[/) && test(code, /status\s*:/),
      hint: "Represent missions with a reusable missions array.",
    }),

    createCheck({
      id: "mission-map",
      label: "Mission cards are rendered from data",
      passed: test(code, /\.map\s*\(/),
      hint: "Render mission UI by mapping the missions array.",
    }),

    createCheck({
      id: "mission-filter-state",
      label: "Dashboard has filter state",
      passed: testAny(code, [
        /\[\s*filter\s*,\s*setFilter\s*\]\s*=\s*useState/i,
        /\[\s*activeFilter\s*,\s*setActiveFilter\s*\]\s*=\s*useState/i,
      ]),
      hint: "Track the selected mission filter with state.",
    }),

    createCheck({
      id: "mission-filter",
      label: "Filtered missions are derived from state",
      passed: test(code, /\.filter\s*\(/),
      hint: "Use filter() to derive the visible mission list.",
    }),

    createCheck({
      id: "mission-selection",
      label: "Mission selection or interaction exists",
      passed: testAny(code, [
        /selectedMission/i,
        /setSelectedMission/i,
        /onClick\s*=/i,
      ]),
      hint: "Allow the user to select or inspect a mission.",
    }),

    createCheck({
      id: "mission-empty",
      label: "Empty results are handled",
      passed: testAny(code, [
        /\.length\s*===\s*0/,
        /No\s+missions/i,
        /No\s+results/i,
        /empty/i,
      ]),
      hint: "Render an empty state when no missions match the filter.",
    }),
  ];
}

/* ====================================================== */
/* PRODUCT LAUNCH */
/* ====================================================== */

function reviewProductLaunch(code, css) {
  return [
    createCheck({
      id: "launch-sections",
      label: "Landing page has multiple sections",
      passed: countMatches(code, /<section[\s>]/gi) >= 2,
      hint: "Build the product story using multiple page sections.",
    }),

    createCheck({
      id: "launch-cta",
      label: "Primary CTA exists",
      passed: testAny(code, [
        /<button[\s>]/i,
        /<a[\s>]/i,
        /Start/i,
        /Launch/i,
        /Get\s+Started/i,
      ]),
      hint: "Add a clear primary call to action.",
    }),

    createCheck({
      id: "launch-components",
      label: "Reusable components are present",
      passed:
        countMatches(code, /function\s+[A-Z][A-Za-z0-9_$]*\s*\(/g) >= 2 ||
        countMatches(code, /const\s+[A-Z][A-Za-z0-9_$]*\s*=/g) >= 2,
      hint: "Extract repeated landing-page UI into components.",
    }),

    createCheck({
      id: "launch-responsive",
      label: "Responsive CSS is present",
      passed: testAny(css, [
        /@media/i,
        /clamp\s*\(/i,
        /minmax\s*\(/i,
        /auto-fit/i,
      ]),
      hint: "Add responsive rules for smaller viewports.",
    }),

    createCheck({
      id: "launch-motion",
      label: "Purposeful motion is included",
      passed: testAny(css, [
        /transition\s*:/i,
        /animation\s*:/i,
        /@keyframes/i,
        /transform\s*:/i,
      ]),
      hint: "Add subtle transition or animation feedback.",
    }),

    createCheck({
      id: "launch-focus",
      label: "Interactive focus styling exists",
      passed: testAny(css, [/:focus-visible/i, /:focus/i]),
      hint: "Add visible keyboard focus styles.",
    }),
  ];
}

/* ====================================================== */
/* EXPLORER HUB */
/* ====================================================== */

function reviewExplorerHub(code) {
  return [
    createCheck({
      id: "hub-goals-state",
      label: "Goals are stored in state",
      passed: test(code, /\[\s*goals\s*,\s*setGoals\s*\]\s*=\s*useState/i),
      hint: "Store the goal collection in React state.",
    }),

    createCheck({
      id: "hub-form",
      label: "Goal creation form exists",
      passed:
        testAny(code, [/<form[\s>]/i, /onSubmit\s*=/i]) &&
        testAny(code, [/<input[\s>]/i, /GoalForm/i]),
      hint: "Create a controlled form for adding goals.",
    }),

    createCheck({
      id: "hub-create",
      label: "New goals update state",
      passed: test(code, /setGoals\s*\(/i),
      hint: "Use setGoals when the user creates a goal.",
    }),

    createCheck({
      id: "hub-toggle",
      label: "Goals can be completed",
      passed: testAny(code, [
        /toggle/i,
        /completeGoal/i,
        /completed\s*:/i,
        /setGoals\s*\([^)]*map/is,
      ]),
      hint: "Add logic for toggling goal completion.",
    }),

    createCheck({
      id: "hub-filter",
      label: "Goal filtering exists",
      passed: test(code, /\.filter\s*\(/),
      hint: "Derive visible goals with filter().",
    }),

    createCheck({
      id: "hub-progress",
      label: "Progress is derived from current data",
      passed: testAny(code, [
        /completedGoals/i,
        /progress/i,
        /\.filter\s*\([^)]*complete/is,
        /\.filter\s*\([^)]*completed/is,
      ]),
      hint: "Calculate completion progress from the current goals.",
    }),

    createCheck({
      id: "hub-list",
      label: "Goals render from data",
      passed: test(code, /\.map\s*\(/),
      hint: "Render reusable goal cards by mapping goal data.",
    }),
  ];
}

/* ====================================================== */
/* FINAL PORTFOLIO */
/* ====================================================== */

function reviewFinalPortfolio(code, css) {
  return [
    createCheck({
      id: "portfolio-structure",
      label: "Portfolio contains primary sections",
      passed: countMatches(code, /<section[\s>]/gi) >= 3,
      hint: "Include several primary sections such as Hero, Projects, Skills, About, and Contact.",
    }),

    createCheck({
      id: "portfolio-projects",
      label: "Projects are showcased",
      passed: testAny(code, [
        /projects\s*=\s*\[/i,
        /\.map\s*\(/,
        /ProjectCard/i,
      ]),
      hint: "Present project data through reusable project UI.",
    }),

    createCheck({
      id: "portfolio-components",
      label: "Reusable component system exists",
      passed:
        testAny(code, [/ProjectCard/, /SectionHeading/, /ActionButton/]) ||
        countMatches(code, /function\s+[A-Z][A-Za-z0-9_$]*\s*\(/g) >= 2,
      hint: "Extract repeated portfolio patterns into reusable components.",
    }),

    createCheck({
      id: "portfolio-contact",
      label: "Contact action exists",
      passed: testAny(code, [
        /mailto:/i,
        /contact/i,
        /<a[\s>]/i,
        /<button[\s>]/i,
      ]),
      hint: "Give visitors a clear way to contact or connect with you.",
    }),

    createCheck({
      id: "portfolio-responsive",
      label: "Portfolio has responsive styling",
      passed: testAny(css, [
        /@media/i,
        /clamp\s*\(/i,
        /minmax\s*\(/i,
        /auto-fit/i,
      ]),
      hint: "Add responsive styling for mobile and desktop.",
    }),

    createCheck({
      id: "portfolio-focus",
      label: "Accessibility focus styling exists",
      passed: testAny(css, [/:focus-visible/i, /:focus/i]),
      hint: "Add clearly visible keyboard focus states.",
    }),
  ];
}

/* ====================================================== */
/* PROJECT REVIEW MAP */
/* ====================================================== */

const PROJECT_REVIEWERS = {
  "showcase-creator-profile": reviewCreatorProfile,

  "showcase-quiz-engine": reviewQuizEngine,

  "showcase-mission-dashboard": reviewMissionDashboard,

  "showcase-launch-page": reviewProductLaunch,

  "showcase-explorer-hub": reviewExplorerHub,

  "showcase-final-portfolio": reviewFinalPortfolio,
};

/* ====================================================== */
/* PUBLIC API */
/* ====================================================== */

export function reviewProjectBuild({
  projectId,
  code = "",
  css = "",
  previewStatus = null,
}) {
  const normalizedCode = normalizeSource(code);
  const normalizedCss = normalizeSource(css);

  const generalChecks = getGeneralChecks(normalizedCode, previewStatus);

  const reviewer = PROJECT_REVIEWERS[projectId];

  const projectChecks = reviewer ? reviewer(normalizedCode, normalizedCss) : [];

  const checks = [...generalChecks, ...projectChecks];

  const passed = checks.filter((check) => check.passed).length;

  const total = checks.length;

  const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    projectId,

    passed,

    total,

    percentage,

    ready: total > 0 && passed === total,

    checks,

    reviewedAt: Date.now(),
  };
}

export default reviewProjectBuild;
