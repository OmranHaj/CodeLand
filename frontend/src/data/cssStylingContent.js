/* ====================================================== */
/* CSS STYLING CONTENT */
/* ====================================================== */

export const CSS_STYLING_CONTENT = {
  id: "css-styling",

  slug: "css-styling",

  title: "CSS Styling",

  subtitle: "Make it beautiful",

  description:
    "Master colors, typography, spacing, layouts, responsive design, and animation to transform HTML into beautiful experiences.",

  version: 1,

  status: "published",

  accent: "#40c8ff",

  secondaryAccent: "#7666ff",

  estimatedMinutes: 150,

  /* ==================================================== */
  /* LESSONS */
  /* ==================================================== */

  lessons: [
    /* ================================================== */
    /* LESSON 1 */
    /* ================================================== */

    {
      id: "css-intro",

      slug: "css-intro",

      order: 1,

      title: "Welcome to CSS",

      subtitle: "Give your webpage a personality",

      description:
        "Discover how CSS transforms plain HTML into colorful and beautiful web experiences.",

      difficulty: "beginner",

      xp: 60,

      estimatedMinutes: 10,

      status: "published",

      blocks: [
        {
          id: "css-intro-story",

          type: "text",

          title: "HTML builds it. CSS styles it.",

          content:
            "HTML gives a webpage its structure, while CSS controls how that structure looks. CSS can change colors, fonts, spacing, sizes, layouts, and much more.",
        },

        {
          id: "css-intro-animation",

          type: "animation",

          template: "css-intro-transformation",

          props: {
            heading: "Hello CodeLand!",
            paragraph: "CSS makes websites beautiful.",
            accent: "#46dfff",
            background: "#10172a",
          },
        },

        {
          id: "css-intro-tip",

          type: "tip",

          content: "CSS stands for Cascading Style Sheets.",
        },

        {
          id: "css-intro-example",

          type: "code",

          language: "css",

          code: `h1 {
  color: blue;
}`,
        },

        {
          id: "css-intro-interactive",

          type: "interactive",

          title: "Color your first heading",

          instructions: "Change the heading color to blue.",

          starterHtml: `<h1>Hello CodeLand!</h1>

<p>CSS makes websites beautiful.</p>`,

          starterCss: `h1 {
  color: black;
}`,

          validation: [
            {
              type: "cssProperty",

              selector: "h1",

              property: "color",

              expectedValue: "blue",
            },
          ],

          hints: [
            "Select the h1 element in CSS.",
            "Use the color property.",
            "Try: color: blue;",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 2 */
    /* ================================================== */

    {
      id: "css-colors",

      slug: "css-colors",

      order: 2,

      title: "Colors",

      subtitle: "Bring your designs to life",

      description:
        "Learn how text colors and background colors create mood and visual hierarchy.",

      difficulty: "beginner",

      xp: 70,

      estimatedMinutes: 15,

      status: "published",

      blocks: [
        {
          id: "colors-explanation",

          type: "text",

          title: "A world of color",

          content:
            "CSS gives you many ways to work with color. You can use color names, HEX values, RGB values, and more.",
        },

        {
          id: "colors-animation",

          type: "animation",

          template: "css-color-reactor",

          props: {
            colorName: "cyan",
            hex: "#46dfff",
            rgb: "rgb(70, 223, 255)",
            background: "#10172a",
          },
        },

        {
          id: "colors-example",

          type: "code",

          language: "css",

          code: `body {
  background-color: #10172a;
}

h1 {
  color: #46dfff;
}

p {
  color: white;
}`,
        },

        {
          id: "colors-interactive",

          type: "interactive",

          title: "Create a dark hero section",

          instructions:
            "Give the card a dark background and make the heading white.",

          starterHtml: `<div class="card">
  <h1>Code Explorer</h1>
  <p>Welcome to my website.</p>
</div>`,

          starterCss: `.card {

}

.card h1 {

}`,

          validation: [
            {
              type: "cssPropertyExists",

              selector: ".card",

              property: "background-color",
            },

            {
              type: "cssProperty",

              selector: ".card h1",

              property: "color",

              expectedValue: "white",
            },
          ],

          hints: [
            "Use background-color on .card.",
            "Use color: white; on .card h1.",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 3 */
    /* ================================================== */

    {
      id: "css-typography",

      slug: "css-typography",

      order: 3,

      title: "Typography",

      subtitle: "Make your text speak",

      description:
        "Control font sizes, weights, alignment, and spacing to create readable interfaces.",

      difficulty: "beginner",

      xp: 80,

      estimatedMinutes: 16,

      status: "published",

      blocks: [
        {
          id: "typography-text",

          type: "text",

          title: "Text is part of the design",

          content:
            "Typography helps users understand what is most important. Large bold headings attract attention while smaller text supports the main message.",
        },

        {
          id: "typography-animation",

          type: "animation",

          template: "css-typography-lab",

          props: {
            heading: "Future Coder",
            paragraph: "Building amazing things with code.",
          },
        },

        {
          id: "typography-example",

          type: "code",

          language: "css",

          code: `h1 {
  font-size: 42px;
  font-weight: 800;
  text-align: center;
}

p {
  font-size: 16px;
  line-height: 1.6;
}`,
        },

        {
          id: "typography-interactive",

          type: "interactive",

          title: "Style the title",

          instructions: "Make the heading 40px, bold, and centered.",

          starterHtml: `<section>
  <h1>Future Coder</h1>
  <p>Building amazing things with code.</p>
</section>`,

          starterCss: `h1 {

}`,

          validation: [
            {
              type: "cssProperty",

              selector: "h1",

              property: "font-size",

              expectedValue: "40px",
            },

            {
              type: "cssPropertyExists",

              selector: "h1",

              property: "font-weight",
            },

            {
              type: "cssProperty",

              selector: "h1",

              property: "text-align",

              expectedValue: "center",
            },
          ],

          hints: [
            "Use font-size: 40px;",
            "Use font-weight to make the heading bold.",
            "Use text-align: center;",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 4 */
    /* ================================================== */

    {
      id: "css-spacing",

      slug: "css-spacing",

      order: 4,

      title: "Spacing & Box Model",

      subtitle: "Give everything room to breathe",

      description:
        "Learn margin, padding, borders, width, and the CSS box model.",

      difficulty: "beginner",

      xp: 90,

      estimatedMinutes: 18,

      status: "published",

      blocks: [
        {
          id: "spacing-text",

          type: "text",

          title: "Every element is a box",

          content:
            "CSS treats elements like boxes. Padding adds space inside the box while margin creates space outside it.",
        },

        {
          id: "spacing-animation",

          type: "animation",

          template: "css-box-model",

          props: {
            content: "My Project",
            padding: 24,
            margin: 20,
            border: 2,
          },
        },

        {
          id: "spacing-example",

          type: "code",

          language: "css",

          code: `.card {
  padding: 24px;
  margin: 20px;
  border: 1px solid #7666ff;
  border-radius: 16px;
}`,
        },

        {
          id: "spacing-interactive",

          type: "interactive",

          title: "Build a comfortable card",

          instructions: "Give the card 24px padding and a 16px border radius.",

          starterHtml: `<div class="card">
  <h2>My Project</h2>
  <p>A project built in CodeLand.</p>
</div>`,

          starterCss: `.card {
  background: #151b32;
  color: white;
}`,

          validation: [
            {
              type: "cssProperty",

              selector: ".card",

              property: "padding",

              expectedValue: "24px",
            },

            {
              type: "cssProperty",

              selector: ".card",

              property: "border-radius",

              expectedValue: "16px",
            },
          ],

          hints: [
            "Padding controls the space inside the card.",
            "Try padding: 24px;",
            "Use border-radius: 16px;",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 5 */
    /* ================================================== */

    {
      id: "css-flexbox",

      slug: "css-flexbox",

      order: 5,

      title: "Flexbox",

      subtitle: "Control your layout",

      description: "Use Flexbox to align, center, and arrange elements easily.",

      difficulty: "beginner",

      xp: 100,

      estimatedMinutes: 20,

      status: "published",

      blocks: [
        {
          id: "flexbox-text",

          type: "text",

          title: "Layout without the struggle",

          content:
            "Flexbox makes it easy to arrange elements in rows or columns and control how they align.",
        },

        {
          id: "flexbox-animation",

          type: "animation",

          template: "css-flexbox-layout",

          props: {
            items: ["Explore", "Build", "Create"],
          },
        },

        {
          id: "flexbox-example",

          type: "code",

          language: "css",

          code: `.container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}`,
        },

        {
          id: "flexbox-interactive",

          type: "interactive",

          title: "Center the buttons",

          instructions:
            "Turn the actions container into a flexbox and center its content.",

          starterHtml: `<div class="actions">
  <button>Explore</button>
  <button>Build</button>
</div>`,

          starterCss: `.actions {
  min-height: 200px;
}`,

          validation: [
            {
              type: "cssProperty",

              selector: ".actions",

              property: "display",

              expectedValue: "flex",
            },

            {
              type: "cssProperty",

              selector: ".actions",

              property: "justify-content",

              expectedValue: "center",
            },

            {
              type: "cssProperty",

              selector: ".actions",

              property: "align-items",

              expectedValue: "center",
            },
          ],

          hints: [
            "Start with display: flex;",
            "justify-content controls horizontal alignment.",
            "align-items controls vertical alignment.",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 6 */
    /* ================================================== */

    {
      id: "css-grid",

      slug: "css-grid",

      order: 6,

      title: "CSS Grid",

      subtitle: "Build powerful layouts",

      description: "Create multi-column layouts using CSS Grid.",

      difficulty: "beginner",

      xp: 110,

      estimatedMinutes: 20,

      status: "published",

      blocks: [
        {
          id: "grid-text",

          type: "text",

          title: "Rows and columns",

          content:
            "CSS Grid is designed for layouts that use rows and columns. It is especially useful for galleries, dashboards, and card layouts.",
        },

        {
          id: "grid-animation",

          type: "animation",

          template: "css-grid-builder",

          props: {
            columns: 3,

            items: [
              "Project 1",
              "Project 2",
              "Project 3",
              "Project 4",
              "Project 5",
              "Project 6",
            ],
          },
        },

        {
          id: "grid-example",

          type: "code",

          language: "css",

          code: `.projects {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
        },

        {
          id: "grid-interactive",

          type: "interactive",

          title: "Create a three-column gallery",

          instructions:
            "Turn the gallery into a grid with three equal columns.",

          starterHtml: `<div class="gallery">
  <div>Project 1</div>
  <div>Project 2</div>
  <div>Project 3</div>
</div>`,

          starterCss: `.gallery {

}`,

          validation: [
            {
              type: "cssProperty",

              selector: ".gallery",

              property: "display",

              expectedValue: "grid",
            },

            {
              type: "cssPropertyExists",

              selector: ".gallery",

              property: "grid-template-columns",
            },
          ],

          hints: [
            "Use display: grid;",
            "Try grid-template-columns: repeat(3, 1fr);",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 7 */
    /* ================================================== */

    {
      id: "css-responsive",

      slug: "css-responsive",

      order: 7,

      title: "Responsive Design",

      subtitle: "Make it work everywhere",

      description:
        "Learn how responsive layouts adapt to phones, tablets, and desktop screens.",

      difficulty: "beginner",

      xp: 120,

      estimatedMinutes: 22,

      status: "published",

      blocks: [
        {
          id: "responsive-text",

          type: "text",

          title: "One website. Every screen.",

          content:
            "Responsive design allows a website to adapt when the available screen size changes. Media queries are one of the tools used to create responsive experiences.",
        },

        {
          id: "responsive-animation",

          type: "animation",

          template: "css-responsive-viewport",

          props: {
            breakpoint: 700,
          },
        },

        {
          id: "responsive-example",

          type: "code",

          language: "css",

          code: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 700px) {
  .cards {
    grid-template-columns: 1fr;
  }
}`,
        },

        {
          id: "responsive-interactive",

          type: "interactive",

          title: "Make the page flexible",

          instructions:
            "Make the card width responsive by setting its width to 100% and max-width to 500px.",

          starterHtml: `<div class="card">
  <h2>Responsive Card</h2>
  <p>I can adapt to different screens.</p>
</div>`,

          starterCss: `.card {

}`,

          validation: [
            {
              type: "cssProperty",

              selector: ".card",

              property: "width",

              expectedValue: "100%",
            },

            {
              type: "cssProperty",

              selector: ".card",

              property: "max-width",

              expectedValue: "500px",
            },
          ],

          hints: [
            "Use width: 100%;",
            "Then limit the size with max-width: 500px;",
          ],
        },
      ],
    },

    /* ================================================== */
    /* LESSON 8 */
    /* ================================================== */

    {
      id: "css-transitions",

      slug: "css-transitions",

      order: 8,

      title: "Transitions & Motion",

      subtitle: "Make your interface feel alive",

      description:
        "Use transitions and hover states to add smooth interaction to your designs.",

      difficulty: "beginner",

      xp: 130,

      estimatedMinutes: 22,

      status: "published",

      blocks: [
        {
          id: "motion-text",

          type: "text",

          title: "Small motion, big difference",

          content:
            "Transitions allow CSS properties to change smoothly instead of instantly. They can make buttons and cards feel more polished.",
        },

        {
          id: "motion-animation",

          type: "animation",

          template: "css-motion-timeline",

          props: {
            label: "Launch Project",
            distance: 18,
            duration: 0.35,
          },
        },

        {
          id: "motion-example",

          type: "code",

          language: "css",

          code: `.button {
  transform: translateY(0);
  transition: transform 0.2s ease;
}

.button:hover {
  transform: translateY(-4px);
}`,
        },

        {
          id: "motion-interactive",

          type: "interactive",

          title: "Animate a button",

          instructions:
            "Add a transition to the button and move it upward when hovered.",

          starterHtml: `<button class="launch">
  Launch Project
</button>`,

          starterCss: `.launch {
  padding: 12px 20px;
}

.launch:hover {

}`,

          validation: [
            {
              type: "cssPropertyExists",

              selector: ".launch",

              property: "transition",
            },

            {
              type: "cssPropertyExists",

              selector: ".launch:hover",

              property: "transform",
            },
          ],

          hints: [
            "Add transition to .launch.",
            "Add transform inside .launch:hover.",
            "Try transform: translateY(-4px);",
          ],
        },
      ],
    },
  ],

  /* ==================================================== */
  /* CHALLENGES */
  /* ==================================================== */

  challenges: [
    /* ================================================== */
    /* CHALLENGE 1 */
    /* ================================================== */

    {
      id: "css-profile-card",

      slug: "css-profile-card",

      order: 1,

      title: "Style a Profile Card",

      subtitle: "Turn plain HTML into a polished component",

      description:
        "Use colors, spacing, typography, and borders to style a developer profile card.",

      difficulty: "beginner",

      xp: 160,

      estimatedMinutes: 20,

      status: "published",

      starterHtml: `<div class="profile">
  <h1>Alex</h1>

  <p>Future Web Developer</p>

  <button>View Projects</button>
</div>`,

      starterCss: `.profile {

}

.profile h1 {

}

.profile button {

}`,

      requirements: [
        {
          id: "profile-background",

          text: "Give the profile card a background color.",

          validation: {
            type: "cssPropertyExists",

            selector: ".profile",

            property: "background-color",
          },
        },

        {
          id: "profile-padding",

          text: "Add padding to the profile card.",

          validation: {
            type: "cssPropertyExists",

            selector: ".profile",

            property: "padding",
          },
        },

        {
          id: "profile-radius",

          text: "Round the card corners.",

          validation: {
            type: "cssPropertyExists",

            selector: ".profile",

            property: "border-radius",
          },
        },

        {
          id: "profile-title",

          text: "Style the heading color.",

          validation: {
            type: "cssPropertyExists",

            selector: ".profile h1",

            property: "color",
          },
        },
      ],

      hints: [
        "Start by styling the .profile container.",
        "Then style the heading and button.",
      ],
    },

    /* ================================================== */
    /* CHALLENGE 2 */
    /* ================================================== */

    {
      id: "css-feature-grid",

      slug: "css-feature-grid",

      order: 2,

      title: "Build a Feature Grid",

      subtitle: "Create a clean card layout",

      description:
        "Use CSS Grid to arrange feature cards in a professional layout.",

      difficulty: "beginner",

      xp: 180,

      estimatedMinutes: 25,

      status: "published",

      starterHtml: `<div class="features">
  <article>Learn</article>
  <article>Build</article>
  <article>Create</article>
</div>`,

      starterCss: `.features {

}

.features article {
  padding: 20px;
}`,

      requirements: [
        {
          id: "feature-grid-display",

          text: "Turn the features container into a grid.",

          validation: {
            type: "cssProperty",

            selector: ".features",

            property: "display",

            expectedValue: "grid",
          },
        },

        {
          id: "feature-grid-columns",

          text: "Create multiple grid columns.",

          validation: {
            type: "cssPropertyExists",

            selector: ".features",

            property: "grid-template-columns",
          },
        },

        {
          id: "feature-grid-gap",

          text: "Add space between the cards.",

          validation: {
            type: "cssPropertyExists",

            selector: ".features",

            property: "gap",
          },
        },
      ],

      hints: [
        "Start with display: grid;",
        "Use grid-template-columns.",
        "Use gap to separate the cards.",
      ],
    },

    /* ================================================== */
    /* CHALLENGE 3 */
    /* ================================================== */

    {
      id: "css-hero-section",

      slug: "css-hero-section",

      order: 3,

      title: "Design a Hero Section",

      subtitle: "Create a landing page hero",

      description:
        "Combine Flexbox, typography, colors, spacing, and buttons to create a polished hero section.",

      difficulty: "beginner",

      xp: 220,

      estimatedMinutes: 30,

      status: "published",

      starterHtml: `<section class="hero">
  <div>
    <h1>Build Your Future</h1>

    <p>
      Learn coding and create amazing things.
    </p>

    <button>Start Learning</button>
  </div>
</section>`,

      starterCss: `.hero {

}

.hero h1 {

}

.hero button {

}`,

      requirements: [
        {
          id: "hero-flex",

          text: "Use Flexbox on the hero section.",

          validation: {
            type: "cssProperty",

            selector: ".hero",

            property: "display",

            expectedValue: "flex",
          },
        },

        {
          id: "hero-align",

          text: "Center the hero content vertically.",

          validation: {
            type: "cssProperty",

            selector: ".hero",

            property: "align-items",

            expectedValue: "center",
          },
        },

        {
          id: "hero-heading",

          text: "Set a custom font size for the heading.",

          validation: {
            type: "cssPropertyExists",

            selector: ".hero h1",

            property: "font-size",
          },
        },

        {
          id: "hero-button",

          text: "Style the hero button background.",

          validation: {
            type: "cssPropertyExists",

            selector: ".hero button",

            property: "background",
          },
        },
      ],

      hints: [
        "Begin with the .hero container.",
        "Then style the heading.",
        "Finish with the call-to-action button.",
      ],
    },

    /* ================================================== */
    /* FINAL CHALLENGE */
    /* ================================================== */

    {
      id: "css-final-project",

      slug: "css-final-project",

      order: 4,

      title: "CSS Design Mission",

      subtitle: "CSS Styling final challenge",

      description:
        "Use everything you learned to transform a plain webpage into a polished interface.",

      difficulty: "beginner",

      xp: 350,

      estimatedMinutes: 40,

      status: "published",

      starterHtml: `<main class="page">
  <section class="hero">
    <h1>My CodeLand Project</h1>

    <p>
      Built with HTML and CSS.
    </p>

    <button>Explore</button>
  </section>

  <section class="projects">
    <article>Project One</article>
    <article>Project Two</article>
    <article>Project Three</article>
  </section>
</main>`,

      starterCss: `.page {

}

.hero {

}

.hero h1 {

}

.hero button {

}

.projects {

}

.projects article {

}`,

      requirements: [
        {
          id: "final-background",

          text: "Add a background color to the page.",

          validation: {
            type: "cssPropertyExists",

            selector: ".page",

            property: "background-color",
          },
        },

        {
          id: "final-hero-spacing",

          text: "Add padding to the hero.",

          validation: {
            type: "cssPropertyExists",

            selector: ".hero",

            property: "padding",
          },
        },

        {
          id: "final-heading-size",

          text: "Change the hero heading size.",

          validation: {
            type: "cssPropertyExists",

            selector: ".hero h1",

            property: "font-size",
          },
        },

        {
          id: "final-button",

          text: "Style the button background.",

          validation: {
            type: "cssPropertyExists",

            selector: ".hero button",

            property: "background",
          },
        },

        {
          id: "final-project-grid",

          text: "Turn the projects section into a grid.",

          validation: {
            type: "cssProperty",

            selector: ".projects",

            property: "display",

            expectedValue: "grid",
          },
        },

        {
          id: "final-project-gap",

          text: "Add space between projects.",

          validation: {
            type: "cssPropertyExists",

            selector: ".projects",

            property: "gap",
          },
        },

        {
          id: "final-project-card",

          text: "Add padding to the project cards.",

          validation: {
            type: "cssPropertyExists",

            selector: ".projects article",

            property: "padding",
          },
        },
      ],

      hints: [
        "Work section by section.",
        "Start with the page and hero.",
        "Then style the button.",
        "Finish by building the projects grid.",
      ],
    },
  ],
};

export default CSS_STYLING_CONTENT;
