/* ====================================================== */
/* PROJECT SHOWCASE CONTENT                               */
/* ====================================================== */

export const PROJECT_SHOWCASE_CONTENT = {
  id: "project-showcase",

  slug: "project-showcase",

  title: "Project Showcase",

  subtitle: "Build something that is yours",

  description:
    "Bring everything together and create a complete project using HTML, CSS, JavaScript, and the UI thinking you learned throughout the Web World.",

  version: 1,

  status: "published",

  accent: "#ff6bd6",

  secondaryAccent: "#7c6cff",

  estimatedMinutes: 120,

  /* ==================================================== */
  /* PROJECT WORKSPACE                                    */
  /* ==================================================== */

  execution: {
    mode: "backend-runner",

    enabled: false,

    language: "web-project",
  },

  workspace: {
    files: [
      {
        id: "html",
        name: "index.html",
        language: "html",
      },

      {
        id: "css",
        name: "styles.css",
        language: "css",
      },

      {
        id: "javascript",
        name: "script.js",
        language: "javascript",
      },
    ],

    previewEnabled: false,
  },

  /* ==================================================== */
  /* LESSONS                                              */
  /* ==================================================== */

  lessons: [
    {
      id: "project-planning",

      slug: "project-planning",

      order: 1,

      title: "Plan Your Project",

      subtitle: "Great projects start with a clear idea",

      description:
        "Before writing code, decide what you want to build and break the idea into smaller parts.",

      difficulty: "beginner",

      xp: 250,

      estimatedMinutes: 25,

      status: "published",

      blocks: [
        {
          id: "project-planning-intro",

          type: "text",

          title: "From idea to project",

          content:
            "You have learned how to structure pages with HTML, style them with CSS, add behavior with JavaScript, and think in reusable interface pieces. Now it is time to combine those skills into one complete experience.",
        },

        {
          id: "project-planning-tip",

          type: "tip",

          content:
            "Keep your first project focused. A small project that works well is stronger than a huge project that is unfinished.",
        },

        {
          id: "project-planning-steps",

          type: "text",

          title: "Your build plan",

          content:
            "Start with the page structure, then create the visual design, then add interaction. Test each part before moving to the next.",
        },
      ],

      mission: {
        title: "Choose your project",

        instructions:
          "Choose one project idea and write a short goal describing what the final experience should do.",

        starterCode: `Project Name:

My Goal:

Main Features:
1.
2.
3.
`,

        validation: {
          type: "projectPlanExists",

          requiredSections: ["Project Name", "My Goal", "Main Features"],
        },

        hints: [
          "Choose something you would actually enjoy showing someone.",

          "Your goal can be one or two sentences.",

          "Three clear features are enough to start.",
        ],
      },
    },
  ],

  /* ==================================================== */
  /* CHALLENGES                                           */
  /* ==================================================== */

  challenges: [
    {
      id: "final-web-project",

      slug: "final-web-project",

      order: 1,

      title: "Build Your Web Project",

      subtitle: "The Web World final challenge",

      description:
        "Create a complete responsive web project that combines structure, styling, and interaction.",

      difficulty: "beginner",

      xp: 1000,

      estimatedMinutes: 95,

      status: "published",

      projectBrief: {
        title: "Your Final Mission",

        description:
          "Build a polished interactive web experience that you would be proud to add to your CodeLand showcase.",

        ideas: [
          "Personal portfolio",
          "Mini quiz",
          "Interactive game",
          "Favorite movies page",
          "Travel explorer",
          "Study dashboard",
          "Product landing page",
        ],
      },

      requirements: [
        {
          id: "project-html",

          title: "Solid HTML Structure",

          description:
            "Use meaningful HTML elements to create a clear page structure.",

          validation: {
            type: "projectHtmlStructure",
          },
        },

        {
          id: "project-css",

          title: "Custom Styling",

          description:
            "Create your own colors, spacing, typography, and layout.",

          validation: {
            type: "projectCssExists",
          },
        },

        {
          id: "project-responsive",

          title: "Responsive Design",

          description: "Make sure the project works on different screen sizes.",

          validation: {
            type: "projectResponsiveCss",
          },
        },

        {
          id: "project-javascript",

          title: "JavaScript Interaction",

          description: "Include at least one meaningful interactive behavior.",

          validation: {
            type: "projectJavaScriptInteraction",
          },
        },

        {
          id: "project-quality",

          title: "Polished Experience",

          description:
            "Make the project feel complete with readable content and consistent design.",

          validation: {
            type: "projectQualityChecklist",
          },
        },
      ],

      starterFiles: {
        html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>My CodeLand Project</title>

    <link
      rel="stylesheet"
      href="styles.css"
    />
  </head>

  <body>
    <main>
      <h1>My Project</h1>

      <p>
        Start building something amazing.
      </p>
    </main>

    <script src="script.js"></script>
  </body>
</html>
`,

        css: `* {
  box-sizing: border-box;
}

body {
  margin: 0;

  min-height: 100vh;

  font-family:
    Arial,
    sans-serif;

  background: #0b1020;

  color: #ffffff;
}

main {
  width: min(
    100% - 32px,
    1100px
  );

  margin: 0 auto;

  padding: 64px 0;
}
`,

        javascript: `const projectName =
  "My CodeLand Project";

console.log(
  projectName
);
`,
      },

      validation: [
        {
          type: "projectHtmlStructure",
        },

        {
          type: "projectCssExists",
        },

        {
          type: "projectResponsiveCss",
        },

        {
          type: "projectJavaScriptInteraction",
        },
      ],

      hints: [
        "Build the HTML structure before worrying about every visual detail.",

        "Use Flexbox or Grid to organize your layout.",

        "Add one interaction first, then improve it.",

        "Test the project on both desktop and smaller screens.",

        "Keep your colors, spacing, and typography consistent.",
      ],
    },
  ],
};

export default PROJECT_SHOWCASE_CONTENT;
