/* ====================================================== */
/* HTML FOUNDATIONS CONTENT */
/* ====================================================== */

export const HTML_FOUNDATIONS_CONTENT = {
  id: "html-foundations",

  slug: "html-foundations",

  title: "HTML Foundations",

  subtitle: "Build the structure",

  description:
    "Learn how real web pages are structured using semantic HTML, elements, links, images, forms, and more.",

  version: 2,

  status: "published",

  accent: "#ff7048",

  estimatedMinutes: 90,

  /* ==================================================== */
  /* LESSONS */
  /* ==================================================== */

  lessons: [
    {
      id: "html-intro",

      slug: "html-intro",

      order: 1,

      title: "Welcome to HTML",

      subtitle: "Discover how websites are built",

      description:
        "Learn what HTML is, what it does, and how browsers turn HTML into web pages.",

      difficulty: "beginner",

      xp: 50,

      estimatedMinutes: 8,

      status: "published",

      blocks: [
        {
          id: "intro-story",

          type: "text",

          title: "Every website needs a structure",

          content:
            "HTML gives a website its structure. Think of it like the skeleton of a building: it tells the browser what each part of the page is.",
        },

        {
          id: "intro-animation",

          type: "animation",

          template: "html-browser-render",

          props: {
            heading: "Hello CodeLand!",
            paragraph: "This is my first web page.",
          },
        },

        {
          id: "intro-tip",

          type: "tip",

          content: "HTML stands for HyperText Markup Language.",
        },

        {
          id: "intro-example",

          type: "code",

          language: "html",

          code: `<h1>Hello CodeLand!</h1>

<p>This is my first web page.</p>`,
        },

        {
          id: "intro-interactive",

          type: "interactive",

          title: "Try it yourself",

          instructions: "Change the heading so it says My First Website.",

          starterCode: `<h1>Hello CodeLand!</h1>

<p>This is my first web page.</p>`,

          validation: {
            type: "htmlContainsText",

            selector: "h1",

            expectedText: "My First Website",
          },

          hints: [
            "Look at the text between <h1> and </h1>.",
            "Replace Hello CodeLand! with My First Website.",
          ],
        },
      ],
    },

    {
      id: "html-elements",

      slug: "html-elements",

      order: 2,

      title: "HTML Elements",

      subtitle: "Meet the building blocks",

      description:
        "Learn how opening tags, closing tags, and content combine to create HTML elements.",

      difficulty: "beginner",

      xp: 60,

      estimatedMinutes: 12,

      status: "published",

      blocks: [
        {
          id: "elements-explanation",

          type: "text",

          title: "What is an element?",

          content:
            "Most HTML elements have an opening tag, some content, and a closing tag.",
        },

        {
          id: "elements-animation",

          type: "animation",

          template: "html-element",

          props: {
            tag: "h1",
            text: "My Website",
          },
        },

        {
          id: "elements-example",

          type: "code",

          language: "html",

          code: `<h1>My Website</h1>

<p>I am learning HTML.</p>

<button>Explore</button>`,
        },

        {
          id: "elements-interactive",

          type: "interactive",

          title: "Create a paragraph",

          instructions: "Add a paragraph containing the text I love coding.",

          starterCode: `<h1>My Website</h1>`,

          validation: {
            type: "htmlContainsText",

            selector: "p",

            expectedText: "I love coding",
          },

          hints: ["Paragraphs use the <p> tag.", "Try: <p>I love coding</p>"],
        },
      ],
    },

    {
      id: "html-page-structure",

      slug: "html-page-structure",

      order: 3,

      title: "Page Structure",

      subtitle: "Build a real document",

      description:
        "Learn about html, head, title, and body and how they create a complete webpage.",

      difficulty: "beginner",

      xp: 70,

      estimatedMinutes: 15,

      status: "published",

      blocks: [
        {
          id: "structure-explanation",

          type: "text",

          title: "The webpage blueprint",

          content:
            "A complete HTML document has a predictable structure. The head stores page information while the body contains what visitors see.",
        },

        {
          id: "structure-animation",

          type: "animation",

          template: "html-document-structure",

          props: {
            title: "My Website",
            heading: "Welcome!",
          },
        },

        {
          id: "structure-code",

          type: "code",

          language: "html",

          code: `<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>

  <body>
    <h1>Welcome!</h1>
  </body>
</html>`,
        },

        {
          id: "structure-interactive",

          type: "interactive",

          title: "Complete the page",

          instructions:
            "Add an h1 inside the body with the text Welcome to CodeLand.",

          starterCode: `<!DOCTYPE html>
<html>
  <head>
    <title>CodeLand</title>
  </head>

  <body>

  </body>
</html>`,

          validation: {
            type: "htmlContainsText",

            selector: "h1",

            expectedText: "Welcome to CodeLand",
          },

          hints: ["The heading belongs inside <body>.", "Use an <h1> element."],
        },
      ],
    },

    {
      id: "html-links-images",

      slug: "html-links-images",

      order: 4,

      title: "Links & Images",

      subtitle: "Connect the web",

      description:
        "Learn how links connect pages and how images bring visual content into a website.",

      difficulty: "beginner",

      xp: 80,

      estimatedMinutes: 15,

      status: "published",

      blocks: [
        {
          id: "links-text",

          type: "text",

          title: "The web is connected",

          content:
            "Anchor elements create links. Image elements display images using their src attribute.",
        },

        {
          id: "links-animation",

          type: "animation",

          template: "html-links-images",

          props: {
            linkText: "Visit Website",
            href: "example.com",
            imageAlt: "A random example",
          },
        },

        {
          id: "links-code",

          type: "code",

          language: "html",

          code: `<a href="https://example.com">
  Visit Website
</a>

<img
  src="https://picsum.photos/300/180"
  alt="A random example"
/>`,
        },

        {
          id: "links-interactive",

          type: "interactive",

          title: "Create a link",

          instructions: "Create a link that displays Explore CodeLand.",

          starterCode: `<h1>My Links</h1>`,

          validation: {
            type: "htmlElementExists",

            selector: "a",
          },

          hints: [
            "Links use the <a> element.",
            'Example: <a href="#">Explore CodeLand</a>',
          ],
        },
      ],
    },

    {
      id: "html-lists",

      slug: "html-lists",

      order: 5,

      title: "Lists",

      subtitle: "Organize information",

      description:
        "Use ordered and unordered lists to organize related pieces of information.",

      difficulty: "beginner",

      xp: 80,

      estimatedMinutes: 12,

      status: "published",

      blocks: [
        {
          id: "lists-text",

          type: "text",

          title: "Organized content",

          content:
            "Unordered lists use ul while ordered lists use ol. Each item is placed inside an li element.",
        },

        {
          id: "lists-animation",

          type: "animation",

          template: "html-list-builder",

          props: {
            items: ["HTML", "CSS", "JavaScript"],
          },
        },

        {
          id: "lists-code",

          type: "code",

          language: "html",

          code: `<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>`,
        },

        {
          id: "lists-interactive",

          type: "interactive",

          title: "Build your skills list",

          instructions: "Create a list containing HTML, CSS, and JavaScript.",

          starterCode: `<h1>My Skills</h1>`,

          validation: {
            type: "htmlMinimumElements",

            selector: "li",

            minimum: 3,
          },

          hints: [
            "Start with <ul>.",
            "Every item goes inside an <li> element.",
          ],
        },
      ],
    },

    {
      id: "html-forms",

      slug: "html-forms",

      order: 6,

      title: "Forms",

      subtitle: "Let users interact",

      description:
        "Learn how forms, inputs, labels, and buttons collect information from users.",

      difficulty: "beginner",

      xp: 100,

      estimatedMinutes: 18,

      status: "published",

      blocks: [
        {
          id: "forms-text",

          type: "text",

          title: "Websites can listen",

          content:
            "Forms allow visitors to enter information. Inputs collect data and buttons let users submit or trigger actions.",
        },

        {
          id: "forms-animation",

          type: "animation",

          template: "html-form-flow",

          props: {
            label: "Your name",
            placeholder: "Enter your name",
            sampleValue: "Alex",
            buttonText: "Join",
          },
        },

        {
          id: "forms-code",

          type: "code",

          language: "html",

          code: `<form>
  <label>Your name</label>

  <input
    type="text"
    placeholder="Enter your name"
  />

  <button type="submit">
    Join
  </button>
</form>`,
        },

        {
          id: "forms-interactive",

          type: "interactive",

          title: "Create a signup form",

          instructions: "Add one input and one button inside the form.",

          starterCode: `<form>

</form>`,

          validation: {
            type: "htmlMultipleElementsExist",

            selectors: ["input", "button"],
          },

          hints: [
            "Use <input /> for the field.",
            "Use <button>Join</button> for the button.",
          ],
        },
      ],
    },
  ],

  /* ==================================================== */
  /* CHALLENGES */
  /* ==================================================== */

  challenges: [
    {
      id: "html-profile-card",

      slug: "html-profile-card",

      order: 1,

      title: "Build a Profile Card",

      subtitle: "Create your first mini webpage",

      description:
        "Build a simple profile containing a name, description, image, and link.",

      difficulty: "beginner",

      xp: 120,

      estimatedMinutes: 15,

      status: "published",

      starterCode: `<div>
  
</div>`,

      requirements: [
        {
          id: "profile-heading",

          text: "Add a heading with your name.",

          validation: {
            type: "htmlElementExists",

            selector: "h1",
          },
        },

        {
          id: "profile-description",

          text: "Add a short description.",

          validation: {
            type: "htmlElementExists",

            selector: "p",
          },
        },

        {
          id: "profile-image",

          text: "Add an image.",

          validation: {
            type: "htmlElementExists",

            selector: "img",
          },
        },

        {
          id: "profile-link",

          text: "Add a link.",

          validation: {
            type: "htmlElementExists",

            selector: "a",
          },
        },
      ],

      hints: [
        "Start with the heading and paragraph.",
        "Then add img and a elements.",
      ],
    },

    {
      id: "html-favorite-things",

      slug: "html-favorite-things",

      order: 2,

      title: "Favorite Things",

      subtitle: "Build a structured list",

      description:
        "Create a webpage that introduces some of your favorite things.",

      difficulty: "beginner",

      xp: 140,

      estimatedMinutes: 15,

      status: "published",

      starterCode: `<h1>My Favorite Things</h1>`,

      requirements: [
        {
          id: "favorite-list",

          text: "Add a list.",

          validation: {
            type: "htmlElementExists",

            selector: "ul",
          },
        },

        {
          id: "favorite-items",

          text: "Add at least three list items.",

          validation: {
            type: "htmlMinimumElements",

            selector: "li",

            minimum: 3,
          },
        },
      ],

      hints: ["Use a ul element.", "Put each favorite thing inside an li."],
    },

    {
      id: "html-final-page",

      slug: "html-final-page",

      order: 3,

      title: "Launch Your First Page",

      subtitle: "HTML Foundations final challenge",

      description:
        "Combine everything you learned and build a complete webpage from scratch.",

      difficulty: "beginner",

      xp: 250,

      estimatedMinutes: 25,

      status: "published",

      starterCode: `<!DOCTYPE html>
<html>
  <head>
    <title>My CodeLand Project</title>
  </head>

  <body>

  </body>
</html>`,

      requirements: [
        {
          id: "final-heading",

          text: "Add a main heading.",

          validation: {
            type: "htmlElementExists",

            selector: "h1",
          },
        },

        {
          id: "final-paragraph",

          text: "Add a paragraph.",

          validation: {
            type: "htmlElementExists",

            selector: "p",
          },
        },

        {
          id: "final-image",

          text: "Add an image.",

          validation: {
            type: "htmlElementExists",

            selector: "img",
          },
        },

        {
          id: "final-link",

          text: "Add a link.",

          validation: {
            type: "htmlElementExists",

            selector: "a",
          },
        },

        {
          id: "final-list",

          text: "Add a list with at least three items.",

          validation: {
            type: "htmlMinimumElements",

            selector: "li",

            minimum: 3,
          },
        },
      ],

      hints: [
        "Build one part at a time.",
        "Use everything you learned in the previous lessons.",
      ],
    },
    {
      id: "html-headings-paragraphs",

      slug: "html-headings-paragraphs",

      order: 7,

      title: "Headings & Paragraphs",

      subtitle: "Give your page a clear voice",

      description:
        "Learn how headings introduce important ideas and paragraphs organize normal text on a webpage.",

      difficulty: "beginner",

      xp: 90,

      estimatedMinutes: 12,

      status: "published",

      blocks: [
        {
          id: "headings-paragraphs-text",

          type: "text",

          title: "Pages need titles and readable text",

          content:
            "HTML headings help visitors understand what a section is about. Paragraph elements are used for normal blocks of readable text.",
        },

        {
          id: "headings-paragraphs-animation",

          type: "animation",

          template: "html-element",

          props: {
            tag: "p",
            text: "I am learning HTML!",
          },
        },

        {
          id: "headings-paragraphs-tip",

          type: "tip",

          content:
            "HTML provides headings from h1 to h6. The h1 usually represents the main heading of the page.",
        },

        {
          id: "headings-paragraphs-code",

          type: "code",

          language: "html",

          code: `<h1>Welcome to CodeLand</h1>

<h2>My Coding Journey</h2>

<p>I am learning HTML!</p>`,
        },

        {
          id: "headings-paragraphs-interactive",

          type: "interactive",

          title: "Create your introduction",

          instructions:
            "Add an h2 element containing the text My First Section.",

          starterCode: `<h1>My Website</h1>

<p>I am learning HTML!</p>`,

          validation: {
            type: "htmlContainsText",

            selector: "h2",

            expectedText: "My First Section",
          },

          hints: [
            "Use an opening <h2> tag and a closing </h2> tag.",
            "Try: <h2>My First Section</h2>",
          ],
        },
      ],
    },
  ],
};
