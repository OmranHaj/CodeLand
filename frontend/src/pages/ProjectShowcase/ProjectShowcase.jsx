import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Eye,
  FileCode2,
  Palette,
  Play,
  Rocket,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import { getLevelContent } from "../../services/learningContentService";
import {
  completeWebWorldLevel,
  updateWebWorldLevelProgress,
} from "../../data/webWorldLevels";

import ProjectPreviewFrame from "../../components/Learning/ProjectPreviewFrame";
import LessonAnimation from "../../components/Learning/animations/LessonAnimation";
import LessonRobot from "../../components/Learning/LessonRobot";
import styles from "./ProjectShowcase.module.css";

const LEVEL_ID = "project-showcase";

const STORAGE_KEY = "codeland-project-showcase-simple-v1";

function getCurrentUser() {
  try {
    const storedUser = window.localStorage.getItem("codeland_current_user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function createEmptyProgress() {
  return {
    drafts: {},
    styleDrafts: {},
    completed: {},
  };
}

function loadStoredProgress() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createEmptyProgress();
    }

    const parsed = JSON.parse(saved);

    return {
      drafts: parsed?.drafts || {},
      styleDrafts: parsed?.styleDrafts || {},
      completed: parsed?.completed || {},
    };
  } catch {
    return createEmptyProgress();
  }
}

function isCreatorProfileProject(unit) {
  return (
    unit?.id === "showcase-creator-profile" ||
    unit?.animation?.template === "project-creator-profile" ||
    String(unit?.title || "").toLowerCase() === "creator profile"
  );
}

function isQuizEngineProject(unit) {
  return (
    unit?.id === "showcase-quiz-engine" ||
    unit?.id === "quiz-engine" ||
    unit?.animation?.template === "project-quiz-engine" ||
    String(unit?.title || "").toLowerCase() === "quiz engine"
  );
}

function validateCreatorProfile(code = "", css = "") {
  const source = String(code || "");
  const stylesSource = String(css || "");

  const hasAvatar =
    /<img\b/i.test(source) ||
    /avatar/i.test(source) ||
    /profile[-_ ]?image/i.test(source);

  const hasIdentityHeading =
    /<h[12]\b/i.test(source) ||
    /className\s*=\s*["'][^"']*(name|identity|profile-title)/i.test(source);

  const hasRole =
    /\brole\b/i.test(source) ||
    /frontend|developer|designer|explorer|engineer/i.test(source);

  const hasSkillBadgeDefinition =
    /function\s+SkillBadge\s*\(/.test(source) ||
    /const\s+SkillBadge\s*=/.test(source);

  const skillBadgeUses = source.match(/<SkillBadge\b/g) || [];

  const hasProjectCardDefinition =
    /function\s+ProjectCard\s*\(/.test(source) ||
    /const\s+ProjectCard\s*=/.test(source);

  const projectCardUses = source.match(/<ProjectCard\b/g) || [];

  const hasActionElement = /<(button|a)\b/i.test(source);
  const hasActionIntent =
    /view\s+projects?|explore|contact|see\s+projects?|projects?/i.test(
      source,
    ) || /onClick\s*=|href\s*=/i.test(source);

  const hasResponsiveRule = /@media\s*\(/i.test(stylesSource);

  const checks = [
    {
      id: "identity",
      label: "Profile Identity",
      hint: "Add a name/heading, role, and avatar or profile image.",
      passed: hasAvatar && hasIdentityHeading && hasRole,
    },
    {
      id: "skills",
      label: "Reusable SkillBadge",
      hint: "Render SkillBadge at least once for your skills.",
      passed: hasSkillBadgeDefinition && skillBadgeUses.length > 0,
    },
    {
      id: "projects",
      label: "Reusable ProjectCard",
      hint: "Create ProjectCard and render at least one project card.",
      passed: hasProjectCardDefinition && projectCardUses.length > 0,
    },
    {
      id: "cta",
      label: "Clear CTA",
      hint: "Add a button or link for projects, contact, or another clear action.",
      passed: hasActionElement && hasActionIntent,
    },
    {
      id: "responsive",
      label: "Responsive UI",
      hint: "Add at least one @media rule in the CSS tab.",
      passed: hasResponsiveRule,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function validateQuizEngine(code = "") {
  const source = String(code || "");

  const hasQuestion =
    /\bquestion\b/i.test(source) &&
    (/<h[1-4]\b/i.test(source) ||
      /<p\b/i.test(source) ||
      /\{[^}]*question[^}]*\}/i.test(source));

  const hasAnswerData =
    /\b(answers?|options?|choices?)\b/i.test(source) &&
    (/\[[\s\S]*?[,][\s\S]*?\]/.test(source) || /\.map\s*\(/.test(source));

  const hasAnswerUi =
    /<button\b/i.test(source) ||
    /<input[^>]+type\s*=\s*["']radio["']/i.test(source) ||
    /\.map\s*\([^)]*=>[\s\S]*<(button|label)\b/i.test(source);

  const hasSelectionState =
    /(useState|React\.useState)\s*\(/.test(source) &&
    /\b(selected|answer|choice|option|currentAnswer)\b/i.test(source);

  const hasCorrectFeedback = /\bcorrect\b/i.test(source);
  const hasIncorrectFeedback = /\b(incorrect|wrong|try again)\b/i.test(source);
  const hasFeedbackLogic =
    /\?[^:]+:/.test(source) || /if\s*\(/.test(source) || /&&/.test(source);

  const hasScore =
    /\bscore\b/i.test(source) &&
    ((/(useState|React\.useState)\s*\(/.test(source) &&
      /setScore/i.test(source)) ||
      /score\s*[:=]/i.test(source));

  const hasRestartHandler =
    /\b(restart|reset|playAgain|startOver)\b/i.test(source) &&
    (/onClick\s*=/.test(source) ||
      /function\s+(restart|reset|playAgain|startOver)/i.test(source));

  const checks = [
    {
      id: "question",
      label: "Question UI",
      hint: "Show the current question clearly in the quiz interface.",
      passed: hasQuestion,
    },
    {
      id: "answers",
      label: "Answer Options",
      hint: "Add answer/options data and render clickable choices.",
      passed: hasAnswerData && hasAnswerUi,
    },
    {
      id: "selection",
      label: "Answer State",
      hint: "Use React state to track the selected answer or choice.",
      passed: hasSelectionState,
    },
    {
      id: "feedback",
      label: "Correct / Incorrect Feedback",
      hint: "Show clear correct and incorrect feedback after an answer.",
      passed: hasCorrectFeedback && hasIncorrectFeedback && hasFeedbackLogic,
    },
    {
      id: "score",
      label: "Score Tracking",
      hint: "Track and display the player's score.",
      passed: hasScore,
    },
    {
      id: "restart",
      label: "Restart Quiz",
      hint: "Add a Restart, Reset, or Play Again action.",
      passed: hasRestartHandler,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    projectName: "Quiz Engine",
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function isMissionDashboardProject(unit) {
  return (
    unit?.id === "showcase-mission-dashboard" ||
    unit?.animation?.template === "project-mission-dashboard" ||
    String(unit?.title || "").toLowerCase() === "mission dashboard"
  );
}

function isProductLaunchProject(unit) {
  return (
    unit?.id === "showcase-launch-page" ||
    unit?.animation?.template === "project-product-launch" ||
    String(unit?.title || "").toLowerCase() === "product launch"
  );
}

function isExplorerHubProject(unit) {
  return (
    unit?.id === "showcase-explorer-hub" ||
    unit?.animation?.template === "project-explorer-hub" ||
    String(unit?.title || "").toLowerCase() === "explorer hub"
  );
}

function isFinalPortfolioProject(unit) {
  const title = String(unit?.title || "").toLowerCase();

  return (
    unit?.id === "showcase-final-portfolio" ||
    unit?.animation?.template === "project-final-portfolio" ||
    title === "portfolio command center" ||
    title === "final portfolio"
  );
}

function validateMissionDashboard(code = "", css = "") {
  const source = String(code || "");
  const stylesSource = String(css || "");

  const hasMissionData =
    /\bmissions\b/i.test(source) &&
    (/\[[\s\S]*?\]/.test(source) || /\btitle\b[\s\S]*\bstatus\b/i.test(source));

  const hasMissionCard =
    /function\s+MissionCard\s*\(/.test(source) ||
    /const\s+MissionCard\s*=/.test(source) ||
    /<MissionCard\b/.test(source) ||
    /\.map\s*\([^)]*=>[\s\S]*<(article|div|li)\b/i.test(source);

  const hasFilterState =
    /\b(filter|statusFilter|activeFilter)\b/i.test(source) &&
    (/(useState|React\.useState)\s*\(/.test(source) ||
      /\.filter\s*\(/.test(source));

  const hasFilterLogic =
    /\.filter\s*\(/.test(source) ||
    /\bfiltered(Missions|Items|Data)?\b/i.test(source);

  const hasProgress =
    /\bprogress\b/i.test(source) &&
    (/%/.test(source) ||
      /<progress\b/i.test(source) ||
      /style\s*=/.test(source));

  const hasCount =
    /\.length\b/.test(source) &&
    /\b(count|missions?|results?|visible)\b/i.test(source);

  const hasEmptyState =
    /\b(no missions|no results|nothing found|empty state|no matching|0 missions)\b/i.test(
      source,
    ) ||
    (/\.length\s*(===|==|<=)\s*0/.test(source) && /\?/.test(source));

  const hasResponsiveRule = /@media\s*\(/i.test(stylesSource);

  const checks = [
    {
      id: "missions",
      label: "Mission Data + Cards",
      hint: "Render mission data as reusable cards or mapped mission items.",
      passed: hasMissionData && hasMissionCard,
    },
    {
      id: "filters",
      label: "Status Filtering",
      hint: "Add filter state and use it to filter the missions array.",
      passed: hasFilterState && hasFilterLogic,
    },
    {
      id: "progress",
      label: "Mission Progress",
      hint: "Show each mission's progress with a percentage, bar, or progress element.",
      passed: hasProgress,
    },
    {
      id: "count",
      label: "Dynamic Mission Count",
      hint: "Show a count derived from the currently visible mission data.",
      passed: hasCount,
    },
    {
      id: "empty",
      label: "Empty State",
      hint: "Show a clear message when a filter returns no missions.",
      passed: hasEmptyState,
    },
    {
      id: "responsive",
      label: "Responsive Dashboard",
      hint: "Add at least one @media rule for the dashboard layout.",
      passed: hasResponsiveRule,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    projectName: "Mission Dashboard",
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function validateProductLaunch(code = "", css = "") {
  const source = String(code || "");
  const stylesSource = String(css || "");

  const sectionCount = (source.match(/<section\b/g) || []).length;

  const hasHero =
    /\bhero\b/i.test(source) ||
    /className\s*=\s*["'][^"']*hero/i.test(source) ||
    (/<h1\b/i.test(source) && sectionCount >= 1);

  const hasFeatures =
    /\b(features?|benefits?)\b/i.test(source) ||
    /FeatureCard/.test(source) ||
    (sectionCount >= 2 && /\.map\s*\(/.test(source));

  const hasReusableFeature =
    /function\s+FeatureCard\s*\(/.test(source) ||
    /const\s+FeatureCard\s*=/.test(source) ||
    /<FeatureCard\b/.test(source) ||
    /\.map\s*\(/.test(source);

  const hasCta =
    /<(button|a)\b/i.test(source) &&
    /\b(get started|start|join|try|launch|explore|learn more|sign up|cta)\b/i.test(
      source,
    );

  const hasResponsiveRule = /@media\s*\(/i.test(stylesSource);

  const hasLayoutSystem =
    /display\s*:\s*(grid|flex)/i.test(stylesSource) ||
    /grid-template-columns|flex-wrap/i.test(stylesSource);

  const hasInteraction =
    /:hover|:focus|:focus-visible/i.test(stylesSource) ||
    /onClick\s*=|onMouseEnter\s*=/i.test(source);

  const hasReducedMotion =
    /prefers-reduced-motion/i.test(stylesSource) ||
    !/animation\s*:|transition\s*:|@keyframes/i.test(stylesSource);

  const checks = [
    {
      id: "hero",
      label: "Launch Hero",
      hint: "Add a hero section with a clear headline and product message.",
      passed: hasHero,
    },
    {
      id: "features",
      label: "Feature / Benefit Section",
      hint: "Explain product value with features or benefits.",
      passed: hasFeatures,
    },
    {
      id: "components",
      label: "Reusable Feature UI",
      hint: "Use a FeatureCard component or render repeated features from data.",
      passed: hasReusableFeature,
    },
    {
      id: "cta",
      label: "Clear CTA",
      hint: "Add a clear launch action such as Get Started, Try, Join, or Explore.",
      passed: hasCta,
    },
    {
      id: "responsive",
      label: "Responsive Layout",
      hint: "Use Grid/Flex and at least one @media rule for smaller screens.",
      passed: hasResponsiveRule && hasLayoutSystem,
    },
    {
      id: "interaction",
      label: "Accessible Interaction",
      hint: "Add hover/focus feedback and respect reduced motion when motion is used.",
      passed: hasInteraction && hasReducedMotion,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    projectName: "Product Launch",
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function validateExplorerHub(code = "") {
  const source = String(code || "");

  const hasGoalsState =
    /\bgoals\b/i.test(source) && /(useState|React\.useState)\s*\(/.test(source);

  const hasControlledInput =
    /<(input|textarea)\b/i.test(source) &&
    /value\s*=/.test(source) &&
    /onChange\s*=/.test(source);

  const hasAddGoal =
    /\b(addGoal|handleAdd|createGoal|submitGoal|newGoal)\b/i.test(source) &&
    (/setGoals\s*\(/.test(source) || /onSubmit\s*=|onClick\s*=/.test(source));

  const hasCompleteGoal =
    /\b(toggle|complete|completed|done)\b/i.test(source) &&
    /setGoals\s*\(/.test(source);

  const hasFilter =
    /\b(filter|activeFilter|statusFilter)\b/i.test(source) &&
    (/\.filter\s*\(/.test(source) || /setFilter\s*\(/.test(source));

  const hasGoalList = /\.map\s*\(/.test(source) && /\bgoal\b/i.test(source);

  const hasProgress =
    /\b(progress|completedCount|completion|percent|percentage)\b/i.test(
      source,
    ) &&
    (/\.length\b/.test(source) || /%/.test(source));

  const hasEmptyState =
    /\b(no goals|add your first goal|nothing here|empty state|no matching goals)\b/i.test(
      source,
    ) ||
    (/goals\.length\s*(===|==|<=)\s*0/.test(source) && /\?/.test(source));

  const checks = [
    {
      id: "state",
      label: "Goal State",
      hint: "Keep goals in React state as the single source of truth.",
      passed: hasGoalsState,
    },
    {
      id: "form",
      label: "Controlled Goal Form",
      hint: "Use a controlled input with value and onChange.",
      passed: hasControlledInput,
    },
    {
      id: "add",
      label: "Add Goal",
      hint: "Create an add/submit handler that updates the goals state.",
      passed: hasAddGoal,
    },
    {
      id: "complete",
      label: "Complete Goal",
      hint: "Add a handler that toggles or updates a goal's completed state.",
      passed: hasCompleteGoal,
    },
    {
      id: "filter",
      label: "Filter Goals",
      hint: "Add filter state or filtering logic for goal status.",
      passed: hasFilter,
    },
    {
      id: "list",
      label: "Goal List",
      hint: "Render goals from data with map instead of hard-coded cards.",
      passed: hasGoalList,
    },
    {
      id: "progress",
      label: "Derived Progress",
      hint: "Calculate progress from the current goals and completed goals.",
      passed: hasProgress,
    },
    {
      id: "empty",
      label: "Empty State",
      hint: "Show a useful empty state when there are no goals to display.",
      passed: hasEmptyState,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    projectName: "Explorer Hub",
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function validateFinalPortfolio(code = "", css = "") {
  const source = String(code || "");
  const stylesSource = String(css || "");

  const hasIntro =
    /\b(about|intro|introduction|hello|hi,?|i am|i'm|my name)\b/i.test(
      source,
    ) || /<(h1|header)\b/i.test(source);

  const hasProjects =
    /\bprojects?\b/i.test(source) &&
    (/<section\b/i.test(source) ||
      /ProjectCard/.test(source) ||
      /\.map\s*\(/.test(source));

  const hasReusableProjectCard =
    /function\s+ProjectCard\s*\(/.test(source) ||
    /const\s+ProjectCard\s*=/.test(source) ||
    /<ProjectCard\b/.test(source) ||
    (/\bprojects?\b/i.test(source) && /\.map\s*\(/.test(source));

  const hasSkills =
    /\bskills?\b/i.test(source) &&
    (/<section\b/i.test(source) || /\.map\s*\(/.test(source));

  const hasContact =
    /\b(contact|email|message|get in touch|let'?s talk)\b/i.test(source) &&
    (/<(a|button|form)\b/i.test(source) || /mailto:/i.test(source));

  const hasNavigation = /<(nav|header)\b/i.test(source) && /<a\b/i.test(source);

  const hasResponsiveRule = /@media\s*\(/i.test(stylesSource);

  const hasFocusState = /:focus|:focus-visible/i.test(stylesSource);

  const checks = [
    {
      id: "intro",
      label: "Personal Introduction",
      hint: "Introduce yourself clearly in the hero or about area.",
      passed: hasIntro,
    },
    {
      id: "projects",
      label: "Projects Showcase",
      hint: "Add a section that presents your selected projects.",
      passed: hasProjects,
    },
    {
      id: "project-card",
      label: "Reusable Project UI",
      hint: "Use ProjectCard or render project cards from a projects array.",
      passed: hasReusableProjectCard,
    },
    {
      id: "skills",
      label: "Skills Section",
      hint: "Show the frontend skills you want visitors to notice.",
      passed: hasSkills,
    },
    {
      id: "contact",
      label: "Contact Action",
      hint: "Give visitors a clear contact link, button, or form.",
      passed: hasContact,
    },
    {
      id: "navigation",
      label: "Portfolio Navigation",
      hint: "Add simple navigation so visitors can reach key sections.",
      passed: hasNavigation,
    },
    {
      id: "responsive",
      label: "Responsive Portfolio",
      hint: "Add at least one @media rule for mobile/tablet layouts.",
      passed: hasResponsiveRule,
    },
    {
      id: "accessibility",
      label: "Keyboard Focus",
      hint: "Add :focus or :focus-visible styles for interactive elements.",
      passed: hasFocusState,
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;

  return {
    projectName: "Portfolio Command Center",
    checks,
    passedCount,
    total: checks.length,
    passed: passedCount === checks.length,
  };
}

function supportsProjectValidation(unit) {
  return (
    isCreatorProfileProject(unit) ||
    isQuizEngineProject(unit) ||
    isMissionDashboardProject(unit) ||
    isProductLaunchProject(unit) ||
    isExplorerHubProject(unit) ||
    isFinalPortfolioProject(unit)
  );
}

function validateProject(unit, code = "", css = "") {
  if (isCreatorProfileProject(unit)) {
    return {
      projectName: "Creator Profile",
      ...validateCreatorProfile(code, css),
    };
  }

  if (isQuizEngineProject(unit)) {
    return validateQuizEngine(code);
  }

  if (isMissionDashboardProject(unit)) {
    return validateMissionDashboard(code, css);
  }

  if (isProductLaunchProject(unit)) {
    return validateProductLaunch(code, css);
  }

  if (isExplorerHubProject(unit)) {
    return validateExplorerHub(code);
  }

  if (isFinalPortfolioProject(unit)) {
    return validateFinalPortfolio(code, css);
  }

  return null;
}

function ProjectRobotCoach({ reaction, activeComplete, message, anchorRef }) {
  return (
    <div
      className={`${styles.robotCoach} ${
        reaction === "happy"
          ? styles.robotCoachHappy
          : reaction === "sad"
            ? styles.robotCoachSad
            : ""
      }`}
    >
      <div className={styles.robotStage}>
        <div
          ref={anchorRef}
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />

        <div className={styles.robotFloor} />
      </div>

      <div className={styles.robotCoachText}>
        <span>{activeComplete ? "PROJECT COMPLETE" : "PROJECT BUDDY"}</span>
        <strong>{message}</strong>
      </div>
    </div>
  );
}

function ProjectShowcase() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = currentUser?.id || currentUser?.email || "guest";

  const [completionDismissed, setCompletionDismissed] = useState(false);

  const [content, setContent] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeUnitId, setActiveUnitId] = useState(null);

  const [progress, setProgress] = useState(loadStoredProgress);

  const [labTab, setLabTab] = useState("code");

  const [previewRunKey, setPreviewRunKey] = useState(0);

  const [previewStatus, setPreviewStatus] = useState({
    state: "idle",
    message: "Preview not run yet",
  });
  const [robotReaction, setRobotReaction] = useState({
    type: "idle",
    key: 0,
  });

  const [runPassed, setRunPassed] = useState(false);
  const [projectCheck, setProjectCheck] = useState(null);
  const [hasRunAttempted, setHasRunAttempted] = useState(false);
  const [projectCheckNeedsRun, setProjectCheckNeedsRun] = useState(false);
  const [projectCheckCollapsed, setProjectCheckCollapsed] = useState(false);

  const [xpToast, setXpToast] = useState(null);

  /* ====================================================== */
  /* MOVING ROBOT - SAME IDEA AS HOME */
  /* ====================================================== */

  const robotAnchorRef = useRef(null);
  const runRequestedRef = useRef(false);
  const [robotStyle, setRobotStyle] = useState(null);

  useEffect(() => {
    let frameId = null;

    const updateRobotPosition = () => {
      const anchor = robotAnchorRef.current;

      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();

      // Same scroll-driven interpolation used on Home.
      // Increase this value if you want the trip to the corner to be slower.
      const travelDistance = window.innerHeight * 1.15;

      const progress = Math.min(
        Math.max(window.scrollY / travelDistance, 0),
        1,
      );

      const isMobile = window.innerWidth <= 700;

      // Project pages use a slightly smaller final robot than Home
      // so it does not cover the editor while the student is coding.
      const finalWidth = isMobile ? 135 : 190;
      const finalHeight = isMobile ? 155 : 215;

      const finalRight = isMobile ? 8 : 18;
      const finalBottom = isMobile ? 8 : 14;

      const finalLeft = window.innerWidth - finalWidth - finalRight;
      const finalTop = window.innerHeight - finalHeight - finalBottom;

      const startLeft = rect.left;
      const startTop = rect.top;
      const startWidth = rect.width;
      const startHeight = rect.height;

      const left = startLeft + (finalLeft - startLeft) * progress;
      const top = startTop + (finalTop - startTop) * progress;
      const width = startWidth + (finalWidth - startWidth) * progress;
      const height = startHeight + (finalHeight - startHeight) * progress;

      setRobotStyle({
        left,
        top,
        width,
        height,
        progress,
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(updateRobotPosition);
    };

    requestUpdate();

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [loading, activeUnitId]);

  function triggerRobotReaction(type) {
    setRobotReaction((current) => ({
      type,
      key: current.key + 1,
    }));
  }

  /* ====================================================== */
  /* LOAD CONTENT */
  /* ====================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      try {
        setLoading(true);

        setError("");

        const data = await getLevelContent(LEVEL_ID);

        if (cancelled) {
          return;
        }

        setContent(data);

        const firstProject = data?.lessons?.[0] || data?.challenges?.[0];

        if (firstProject) {
          setActiveUnitId(firstProject.id);
        }
      } catch (loadError) {
        console.error(loadError);

        if (!cancelled) {
          setError("Project Showcase could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ====================================================== */
  /* SAVE PROGRESS */
  /* ====================================================== */

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore local storage failures.
    }
  }, [progress]);

  /* ====================================================== */
  /* PROJECTS */
  /* ====================================================== */

  const units = useMemo(() => {
    if (!content) {
      return [];
    }

    const projects = (content.lessons || []).map((project) => ({
      ...project,
      isFinal: false,
    }));

    const finalProjects = (content.challenges || []).map((project) => ({
      ...project,
      isFinal: true,
    }));

    return [...projects, ...finalProjects];
  }, [content]);

  const activeUnit = useMemo(() => {
    return units.find((unit) => unit.id === activeUnitId) || units[0] || null;
  }, [units, activeUnitId]);

  const activeIndex = useMemo(() => {
    if (!activeUnit) {
      return 0;
    }

    return Math.max(
      units.findIndex((unit) => unit.id === activeUnit.id),
      0,
    );
  }, [units, activeUnit]);

  const completedCount = units.filter(
    (unit) => progress.completed[unit.id],
  ).length;

  const overallProgress =
    units.length > 0 ? Math.round((completedCount / units.length) * 100) : 0;

  const showcaseComplete = units.length > 0 && completedCount === units.length;
  const showCompletion = showcaseComplete && !completionDismissed;

  const earnedXp = units.reduce((total, unit) => {
    if (!progress.completed[unit.id]) {
      return total;
    }

    return total + (Number(unit.xp) || 0);
  }, 0);

  const activeDraft = activeUnit
    ? (progress.drafts[activeUnit.id] ?? activeUnit.starterCode ?? "")
    : "";

  const activeStyleDraft = activeUnit
    ? (progress.styleDrafts[activeUnit.id] ?? "")
    : "";

  const activeComplete = activeUnit
    ? Boolean(progress.completed[activeUnit.id])
    : false;

  const hasProjectValidation = supportsProjectValidation(activeUnit);
  const canCompleteProject = activeComplete || runPassed;
  const projectCheckPercent = projectCheck
    ? Math.round((projectCheck.passedCount / projectCheck.total) * 100)
    : 0;
  const firstFailedCheckId =
    projectCheck?.checks.find((check) => !check.passed)?.id || null;

  const nextUnit = units[activeIndex + 1] || null;
  const robotMessage = activeComplete
    ? `${activeUnit?.title || "Project"} complete! Nice work.`
    : projectCheckNeedsRun
      ? "Your code changed. Run again to refresh the project check."
      : robotReaction.type === "happy"
        ? projectCheck
          ? `Perfect! ${projectCheck.passedCount}/${projectCheck.total} requirements passed.`
          : "Nice! Your project is running."
        : robotReaction.type === "sad"
          ? projectCheck
            ? `${projectCheck.passedCount}/${projectCheck.total} requirements passed. Fix the missing pieces.`
            : "Something needs a fix. Check your code and try again."
          : "Build it one piece at a time. I'm here with you.";

  /* ====================================================== */
  /* SYNC WEB WORLD PROGRESS */
  /* ====================================================== */

  useEffect(() => {
    if (!units.length) {
      return;
    }

    if (overallProgress >= 100) {
      completeWebWorldLevel(userId, LEVEL_ID);
      return;
    }

    updateWebWorldLevelProgress(userId, LEVEL_ID, overallProgress);
  }, [userId, units.length, overallProgress]);

  useEffect(() => {
    if (!showCompletion) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [showCompletion]);

  /* ====================================================== */
  /* ACTIONS */
  /* ====================================================== */

  function selectUnit(unit) {
    setActiveUnitId(unit.id);

    setLabTab("code");
    runRequestedRef.current = false;
    setRunPassed(false);
    setProjectCheck(null);
    setHasRunAttempted(false);
    setProjectCheckNeedsRun(false);
    setProjectCheckCollapsed(false);
    setRobotReaction((current) => ({
      type: "idle",
      key: current.key + 1,
    }));
    setPreviewStatus({
      state: "idle",
      message: "Preview not run yet",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function updateDraft(value) {
    if (!activeUnit) {
      return;
    }

    setRunPassed(false);
    setProjectCheckNeedsRun(Boolean(projectCheck));
    setPreviewStatus({
      state: "idle",
      message: hasRunAttempted
        ? "Code changed - run again"
        : "Preview not run yet",
    });

    setProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: value,
      },
    }));
  }

  function updateStyleDraft(value) {
    if (!activeUnit) {
      return;
    }

    setRunPassed(false);
    setProjectCheckNeedsRun(Boolean(projectCheck));
    setPreviewStatus({
      state: "idle",
      message: hasRunAttempted
        ? "Styles changed - run again"
        : "Preview not run yet",
    });

    setProgress((current) => ({
      ...current,

      styleDrafts: {
        ...current.styleDrafts,

        [activeUnit.id]: value,
      },
    }));
  }

  function resetDraft() {
    if (!activeUnit) {
      return;
    }

    setRunPassed(false);
    setProjectCheckNeedsRun(Boolean(projectCheck));
    setPreviewStatus({
      state: "idle",
      message: hasRunAttempted
        ? "Code reset - run again"
        : "Preview not run yet",
    });

    setProgress((current) => ({
      ...current,

      drafts: {
        ...current.drafts,

        [activeUnit.id]: activeUnit.starterCode || "",
      },
    }));
  }

  function resetStyleDraft() {
    if (!activeUnit) {
      return;
    }

    setRunPassed(false);
    setProjectCheckNeedsRun(Boolean(projectCheck));
    setPreviewStatus({
      state: "idle",
      message: hasRunAttempted
        ? "Styles reset - run again"
        : "Preview not run yet",
    });

    setProgress((current) => ({
      ...current,

      styleDrafts: {
        ...current.styleDrafts,

        [activeUnit.id]: "",
      },
    }));
  }

  function runPreview() {
    // A fresh run must pass before the project can be completed.
    runRequestedRef.current = true;
    setHasRunAttempted(true);
    setRunPassed(false);
    setProjectCheckNeedsRun(false);
    setProjectCheckCollapsed(false);
    setProjectCheck(null);

    setPreviewStatus({
      state: "idle",
      message: "Running preview...",
    });

    setPreviewRunKey((current) => current + 1);
    setLabTab("preview");
  }

  function handlePreviewStatusChange(status) {
    const nextStatus = status || {
      state: "idle",
      message: "Preview status unavailable",
    };

    setPreviewStatus(nextStatus);

    // Ignore preview status changes unless they belong to a Run click.
    if (!runRequestedRef.current) {
      return;
    }

    const rawState =
      nextStatus?.state ?? nextStatus?.type ?? nextStatus?.status ?? "";

    const normalizedState = String(rawState).toLowerCase();
    const normalizedMessage = String(
      nextStatus?.message ?? nextStatus?.error ?? "",
    ).toLowerCase();

    const hasError =
      normalizedState === "error" ||
      normalizedState === "failed" ||
      normalizedState === "failure" ||
      normalizedMessage.includes("error") ||
      normalizedMessage.includes("failed") ||
      normalizedMessage.includes("exception");

    if (hasError) {
      runRequestedRef.current = false;
      setRunPassed(false);
      triggerRobotReaction("sad");
      return;
    }

    if (normalizedState === "success") {
      runRequestedRef.current = false;

      const validation = validateProject(
        activeUnit,
        activeDraft,
        activeStyleDraft,
      );

      if (validation) {
        setProjectCheckNeedsRun(false);
        setProjectCheck(validation);

        if (validation.passed) {
          setRunPassed(true);
          setPreviewStatus({
            state: "success",
            message: `${validation.passedCount}/${validation.total} requirements passed`,
          });
          triggerRobotReaction("happy");
          return;
        }

        setRunPassed(false);
        setPreviewStatus({
          state: "error",
          message: `${validation.passedCount}/${validation.total} requirements passed`,
        });
        triggerRobotReaction("sad");
        return;
      }

      setRunPassed(true);
      triggerRobotReaction("happy");
    }
  }

  function completeProject() {
    if (!activeUnit || activeComplete || !runPassed) {
      return;
    }

    const reward = Number(activeUnit.xp) || 0;

    setCompletionDismissed(false);

    setProgress((current) => ({
      ...current,

      completed: {
        ...current.completed,
        [activeUnit.id]: true,
      },
    }));

    setXpToast({
      amount: reward,
      title: activeUnit.title,
      key: Date.now(),
    });

    window.setTimeout(() => {
      setXpToast(null);
    }, 2200);

    // Robot mood is still controlled only by Run.
  }

  function goToNextProject() {
    if (!nextUnit) {
      return;
    }

    selectUnit(nextUnit);
  }

  /* ====================================================== */
  /* STATES */
  /* ====================================================== */

  if (loading) {
    return (
      <main className={styles.stateScreen}>
        <div className={styles.loader} />

        <span>LOADING PROJECT SHOWCASE</span>
      </main>
    );
  }

  if (error || !content || !activeUnit) {
    return (
      <main className={styles.stateScreen}>
        <Rocket size={29} />

        <h1>Project Showcase unavailable</h1>

        <p>{error || "No projects are available."}</p>

        <button type="button" onClick={() => navigate("/student/world")}>
          Return to Web World
        </button>
      </main>
    );
  }

  if (showCompletion) {
    const celebrationParticles = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      left: `${4 + ((index * 17) % 92)}%`,
      delay: `${(index % 10) * 90}ms`,
      duration: `${2200 + (index % 6) * 180}ms`,
      drift: `${((index % 7) - 3) * 34}px`,
      spin: `${160 + (index % 5) * 95}deg`,
    }));

    return (
      <main className={`${styles.page} ${styles.completionPage}`}>
        <div className={styles.backgroundGrid} />
        <div className={styles.glowOne} />
        <div className={styles.glowTwo} />

        <div className={styles.celebrationLayer} aria-hidden="true">
          {celebrationParticles.map((particle) => (
            <span
              key={particle.id}
              className={styles.celebrationParticle}
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                "--particle-drift": particle.drift,
                "--particle-spin": particle.spin,
              }}
            />
          ))}
        </div>

        <section className={styles.completionCard}>
          <div className={styles.completionTrophy}>
            <Trophy size={38} />
          </div>

          <span className={styles.completionEyebrow}>
            <Sparkles size={13} />
            WEB WORLD MILESTONE
          </span>

          <h1>Project Showcase Complete</h1>

          <p>
            You finished every project in the showcase. Your Project Showcase
            level is now marked complete in Web World.
          </p>

          <div className={styles.completionStats}>
            <div>
              <strong>{units.length}</strong>
              <span>PROJECTS</span>
            </div>

            <div className={styles.completionXp}>
              <strong>{earnedXp}</strong>
              <span>XP EARNED</span>
            </div>

            <div>
              <strong>100%</strong>
              <span>LEVEL PROGRESS</span>
            </div>
          </div>

          <div className={styles.completionProjectStrip}>
            {units.map((unit) => (
              <div key={unit.id}>
                <CheckCircle2 size={13} />
                <span>{unit.title}</span>
              </div>
            ))}
          </div>

          <div className={styles.completionActions}>
            <button
              type="button"
              className={styles.completionPrimaryButton}
              onClick={() => navigate("/student/world")}
            >
              <ArrowLeft size={16} />
              Return to Web World
            </button>

            <button
              type="button"
              className={styles.completionSecondaryButton}
              onClick={() => setCompletionDismissed(true)}
            >
              Review Projects
            </button>
          </div>
        </section>
      </main>
    );
  }

  /* ====================================================== */
  /* PAGE */
  /* ====================================================== */

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGrid} />

      <div className={styles.glowOne} />

      <div className={styles.glowTwo} />

      <style>{`
        @keyframes projectXpPop {
          0% {
            opacity: 0;
            transform: translateY(-14px) scale(.92);
          }

          55% {
            opacity: 1;
            transform: translateY(2px) scale(1.04);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {xpToast && (
        <div
          key={xpToast.key}
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 82,
            right: 22,
            zIndex: 1400,
            minWidth: 230,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid rgba(255, 207, 90, .28)",
            borderRadius: 16,
            background:
              "linear-gradient(145deg, rgba(255,207,90,.11), rgba(13,15,27,.96) 48%)",
            boxShadow:
              "0 18px 48px rgba(0,0,0,.34), 0 0 30px rgba(255,207,90,.08)",
            backdropFilter: "blur(16px)",
            animation: "projectXpPop 420ms cubic-bezier(.2,.9,.25,1.15)",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              flex: "0 0 auto",
              display: "grid",
              placeItems: "center",
              borderRadius: 13,
              color: "#ffcf5a",
              background: "rgba(255,207,90,.09)",
              border: "1px solid rgba(255,207,90,.22)",
            }}
          >
            <Trophy size={20} />
          </div>

          <div style={{ minWidth: 0 }}>
            <span
              style={{
                display: "block",
                marginBottom: 3,
                color: "#8f98ad",
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: ".12em",
              }}
            >
              PROJECT COMPLETE
            </span>

            <strong
              style={{
                display: "block",
                color: "#ffffff",
                fontSize: 13,
                lineHeight: 1.25,
              }}
            >
              +{xpToast.amount} XP
            </strong>

            <small
              style={{
                display: "block",
                marginTop: 3,
                overflow: "hidden",
                color: "#a9b0c2",
                fontSize: 9,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {xpToast.title}
            </small>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* TOP BAR */}
      {/* ================================================== */}

      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/student/world")}
        >
          <ArrowLeft size={17} />

          <span>Web World</span>
        </button>

        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Rocket size={18} />
          </div>

          <div>
            <span>CODELAND</span>

            <strong>PROJECT SHOWCASE</strong>
          </div>
        </div>

        <div className={styles.topProgress}>
          <div>
            <span>PROJECTS COMPLETE</span>

            <strong>
              {completedCount}/{units.length}
            </strong>

            <small
              style={{
                display: "block",
                marginTop: 3,
                color: "#ffcf5a",
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: ".08em",
              }}
            >
              {earnedXp} XP EARNED
            </small>
          </div>

          <div className={styles.progressTrack}>
            <span
              style={{
                width: `${overallProgress}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* MOVING ROBOT */}
      {/* ================================================== */}

      {robotStyle && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            zIndex: 900,
            pointerEvents: "none",
            background: "transparent",
            border: "none",
            boxShadow: "none",
            overflow: "visible",
            willChange: "left, top, width, height",
            left: `${robotStyle.left}px`,
            top: `${robotStyle.top}px`,
            width: `${robotStyle.width}px`,
            height: `${robotStyle.height}px`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <LessonRobot
              reaction={robotReaction.type}
              reactionKey={robotReaction.key}
            />
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* PAGE LAYOUT */}
      {/* ================================================== */}

      <section className={styles.workspace}>
        {/* ================================================ */}
        {/* PROJECT NAVIGATION */}
        {/* ================================================ */}

        <aside className={styles.projectRail}>
          <div className={styles.railHeader}>
            <span>YOUR PROJECTS</span>

            <strong>Build one project at a time.</strong>
          </div>

          <div className={styles.projectList}>
            {units.map((unit, index) => {
              const active = unit.id === activeUnit.id;

              const complete = Boolean(progress.completed[unit.id]);

              return (
                <button
                  key={unit.id}
                  type="button"
                  className={`${styles.projectButton} ${
                    active ? styles.projectButtonActive : ""
                  } ${unit.isFinal ? styles.projectButtonFinal : ""}`}
                  onClick={() => selectUnit(unit)}
                >
                  <div className={styles.projectNumber}>
                    {complete ? (
                      <Check size={14} />
                    ) : unit.isFinal ? (
                      <Trophy size={14} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className={styles.projectButtonCopy}>
                    <span>{unit.badge}</span>

                    <strong>{unit.title}</strong>

                    <small>{unit.estimatedMinutes} min</small>
                  </div>

                  <ArrowRight size={14} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* ================================================ */}
        {/* PROJECT */}
        {/* ================================================ */}

        <div className={styles.projectMain}>
          {/* ============================================== */}
          {/* PROJECT HEADER */}
          {/* ============================================== */}

          <section className={styles.projectHeader}>
            <div className={styles.projectHeaderCopy}>
              <div className={styles.projectEyebrow}>
                <span>PROJECT {String(activeIndex + 1).padStart(2, "0")}</span>

                <i />

                <span>{activeUnit.badge}</span>

                {activeUnit.isFinal && (
                  <>
                    <i />

                    <span className={styles.finalText}>FINAL BUILD</span>
                  </>
                )}
              </div>

              <h1>{activeUnit.title}</h1>

              <h2>{activeUnit.subtitle}</h2>

              <p>{activeUnit.description}</p>

              <div className={styles.projectMeta}>
                <span>
                  <Sparkles size={13} />+{activeUnit.xp} XP
                </span>

                <span>
                  <Clock3 size={13} />
                  {activeUnit.estimatedMinutes} min
                </span>

                <span>
                  <Target size={13} />
                  {activeUnit.difficulty || "advanced"}
                </span>
              </div>
            </div>

            <ProjectRobotCoach
              reaction={robotReaction.type}
              activeComplete={activeComplete}
              message={robotMessage}
              anchorRef={robotAnchorRef}
            />
          </section>

          {/* ============================================== */}
          {/* BRIEF */}
          {/* ============================================== */}

          <section className={styles.briefCard}>
            <div className={styles.sectionHeading}>
              <Target size={16} />

              <div>
                <span>YOUR MISSION</span>

                <strong>What are we building?</strong>
              </div>
            </div>

            <p>{activeUnit.brief}</p>

            {activeUnit.successDefinition && (
              <div className={styles.successBox}>
                <CheckCircle2 size={15} />

                <div>
                  <span>PROJECT GOAL</span>

                  <strong>{activeUnit.successDefinition}</strong>
                </div>
              </div>
            )}
          </section>

          {/* ============================================== */}
          {/* MINI PROJECT DEMO */}
          {/* ============================================== */}

          {activeUnit.animation && (
            <section className={styles.demoSection}>
              <div className={styles.sectionHeading}>
                <Sparkles size={16} />

                <div>
                  <span>PROJECT DEMO</span>

                  <strong>See what you're building</strong>
                </div>
              </div>

              <p className={styles.sectionIntro}>
                Watch the small demo first. It shows the main pieces your
                project should include.
              </p>

              <LessonAnimation
                key={activeUnit.id}
                animation={activeUnit.animation}
              />
            </section>
          )}

          {/* ============================================== */}
          {/* WHAT YOU WILL BUILD */}
          {/* ============================================== */}

          <section className={styles.requirementsSection}>
            <div className={styles.sectionHeading}>
              <CheckCircle2 size={16} />

              <div>
                <span>WHAT YOU'LL BUILD</span>

                <strong>Core project requirements</strong>
              </div>
            </div>

            <div className={styles.requirementGrid}>
              {(activeUnit.outcomes || []).map((outcome, index) => (
                <article key={outcome} className={styles.requirementCard}>
                  <div>{String(index + 1).padStart(2, "0")}</div>

                  <p>{outcome}</p>
                </article>
              ))}
            </div>

            <div className={styles.skillRow}>
              {(activeUnit.skills || []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          {/* ============================================== */}
          {/* BUILD LAB */}
          {/* ============================================== */}

          <section className={styles.buildLab}>
            <div className={styles.buildLabHeader}>
              <div>
                <Code2 size={17} />

                <div>
                  <span>BUILD YOUR PROJECT</span>

                  <strong>Project Lab</strong>
                </div>
              </div>

              <div className={styles.buildActions}>
                <span
                  className={`${styles.previewStatus} ${
                    previewStatus.state === "success"
                      ? styles.previewStatusSuccess
                      : ""
                  } ${
                    previewStatus.state === "error"
                      ? styles.previewStatusError
                      : ""
                  }`}
                >
                  {previewStatus.message}
                </span>

                <button
                  type="button"
                  className={styles.runButton}
                  onClick={runPreview}
                >
                  <Play size={13} />
                  {hasRunAttempted ? "Run Again" : "Run"}
                </button>
              </div>
            </div>

            <div className={styles.labTabs}>
              <button
                type="button"
                className={`${styles.labTab} ${
                  labTab === "code" ? styles.labTabActive : ""
                }`}
                onClick={() => setLabTab("code")}
              >
                <FileCode2 size={13} />
                JSX
              </button>

              <button
                type="button"
                className={`${styles.labTab} ${
                  labTab === "styles" ? styles.labTabActive : ""
                }`}
                onClick={() => setLabTab("styles")}
              >
                <Palette size={13} />
                CSS
              </button>

              <button
                type="button"
                className={`${styles.labTab} ${
                  labTab === "preview" ? styles.labTabActive : ""
                }`}
                onClick={() => setLabTab("preview")}
              >
                <Eye size={13} />
                Preview
              </button>
            </div>

            {labTab === "code" && (
              <div className={styles.editorArea}>
                <div className={styles.editorToolbar}>
                  <div>
                    <span>JSX DRAFT</span>

                    <strong>Auto-saved</strong>
                  </div>

                  <button
                    type="button"
                    className={styles.resetButton}
                    onClick={resetDraft}
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>

                <textarea
                  className={styles.editor}
                  value={activeDraft}
                  onChange={(event) => updateDraft(event.target.value)}
                  spellCheck="false"
                  aria-label={`${activeUnit.title} JSX`}
                />
              </div>
            )}

            {labTab === "styles" && (
              <div className={styles.editorArea}>
                <div className={styles.editorToolbar}>
                  <div>
                    <span>CSS DRAFT</span>

                    <strong>Auto-saved</strong>
                  </div>

                  <button
                    type="button"
                    className={styles.resetButton}
                    onClick={resetStyleDraft}
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                </div>

                <textarea
                  className={`${styles.editor} ${styles.cssEditor}`}
                  value={activeStyleDraft}
                  onChange={(event) => updateStyleDraft(event.target.value)}
                  spellCheck="false"
                  placeholder={`/* Style ${activeUnit.title} here */`}
                  aria-label={`${activeUnit.title} CSS`}
                />
              </div>
            )}

            {labTab === "preview" && (
              <div className={styles.previewPanel}>
                <ProjectPreviewFrame
                  key={`${activeUnit.id}:${previewRunKey}`}
                  code={activeDraft}
                  css={activeStyleDraft}
                  runKey={previewRunKey}
                  title={`${activeUnit.title} preview`}
                  onStatusChange={handlePreviewStatusChange}
                />
              </div>
            )}

            {hasProjectValidation && projectCheck && (
              <section
                className={`${styles.projectCheckPanel} ${
                  projectCheckNeedsRun
                    ? styles.projectCheckNeedsRun
                    : projectCheck.passed
                      ? styles.projectCheckPassed
                      : styles.projectCheckFailed
                } ${projectCheckCollapsed ? styles.projectCheckCollapsed : ""}`}
                aria-label={`${projectCheck.projectName} project check`}
              >
                <div className={styles.projectCheckHeader}>
                  <div className={styles.projectCheckHeading}>
                    <span>PROJECT CHECK</span>
                    <strong>{projectCheck.projectName} requirements</strong>
                    <small>
                      {projectCheckNeedsRun
                        ? "Your code changed. Run again to refresh these results."
                        : projectCheck.passed
                          ? "Everything required by this project is in place."
                          : "Fix the highlighted requirement first, then run again."}
                    </small>
                  </div>

                  <div className={styles.projectCheckScore}>
                    <strong>
                      {projectCheck.passedCount}/{projectCheck.total}
                    </strong>
                    <span>
                      {projectCheckNeedsRun
                        ? "NEEDS RUN"
                        : projectCheck.passed
                          ? "READY"
                          : "PASSED"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={styles.projectCheckToggle}
                    onClick={() =>
                      setProjectCheckCollapsed((current) => !current)
                    }
                    aria-expanded={!projectCheckCollapsed}
                  >
                    <ArrowRight
                      size={13}
                      className={
                        projectCheckCollapsed
                          ? ""
                          : styles.projectCheckToggleOpen
                      }
                    />
                    {projectCheckCollapsed ? "Show checks" : "Hide checks"}
                  </button>
                </div>

                <div className={styles.projectCheckProgress}>
                  <span style={{ width: `${projectCheckPercent}%` }} />
                </div>

                <div className={styles.projectCheckBody}>
                  <div className={styles.projectCheckList}>
                    {projectCheck.checks.map((check) => {
                      const firstFailure =
                        !check.passed && check.id === firstFailedCheckId;

                      return (
                        <div
                          key={check.id}
                          className={`${styles.projectCheckItem} ${
                            check.passed
                              ? styles.projectCheckItemPassed
                              : styles.projectCheckItemFailed
                          } ${
                            firstFailure
                              ? styles.projectCheckItemPrimaryFailure
                              : ""
                          }`}
                        >
                          <div className={styles.projectCheckIcon}>
                            {check.passed ? (
                              <Check size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}
                          </div>

                          <div className={styles.projectCheckCopy}>
                            <strong>{check.label}</strong>
                            {!check.passed && <span>{check.hint}</span>}
                          </div>

                          <small>{check.passed ? "PASSED" : "FIX"}</small>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.projectCheckFooter}>
                    <div>
                      <Sparkles size={13} />
                      <span>
                        {projectCheckNeedsRun
                          ? "Results are out of date because the code changed."
                          : projectCheck.passed
                            ? "Project Check passed. You can complete this project."
                            : `${projectCheck.total - projectCheck.passedCount} requirement${
                                projectCheck.total -
                                  projectCheck.passedCount ===
                                1
                                  ? ""
                                  : "s"
                              } left.`}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={styles.projectCheckRunButton}
                      onClick={runPreview}
                    >
                      <Play size={13} />
                      Run Again
                    </button>
                  </div>
                </div>
              </section>
            )}
          </section>

          {/* ============================================== */}
          {/* COMPLETE */}
          {/* ============================================== */}

          <section className={styles.completeSection}>
            <div>
              <span>PROJECT CHECKPOINT</span>

              <h3>
                {activeComplete
                  ? `${activeUnit.title} complete!`
                  : runPassed
                    ? "Your project passed!"
                    : projectCheckNeedsRun
                      ? "Project check needs a new Run"
                      : projectCheck
                        ? `${projectCheck.passedCount}/${projectCheck.total} requirements passed`
                        : "Run your project first"}
              </h3>

              <p>
                {activeComplete
                  ? "Nice work. You can revisit this project anytime or continue to the next build."
                  : runPassed
                    ? `The preview and project check passed. Complete the project to earn ${Number(activeUnit.xp) || 0} XP.`
                    : projectCheckNeedsRun
                      ? "Your code changed after the last check. Run the project again to refresh validation."
                      : projectCheck
                        ? `Fix the missing ${projectCheck.projectName} requirements, then press Run again.`
                        : "Complete Project unlocks only after a successful Run."}
              </p>
            </div>

            <div className={styles.completeActions}>
              <button
                type="button"
                className={`${styles.completeButton} ${
                  activeComplete ? styles.completeButtonDone : ""
                }`}
                onClick={completeProject}
                disabled={!canCompleteProject || activeComplete}
                aria-disabled={!canCompleteProject || activeComplete}
                title={
                  activeComplete
                    ? "Project already completed"
                    : runPassed
                      ? "Mark project as complete"
                      : "Run the project successfully first"
                }
                style={
                  !canCompleteProject || activeComplete
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : undefined
                }
              >
                {activeComplete ? (
                  <>
                    <Check size={16} />
                    Project Complete
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Complete Project
                  </>
                )}
              </button>

              {activeComplete && nextUnit && (
                <button
                  type="button"
                  className={styles.nextButton}
                  onClick={goToNextProject}
                >
                  Next Project
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default ProjectShowcase;
