/* ====================================================== */
/* JAVASCRIPT CORE CONTENT */
/* ====================================================== */

export const JAVASCRIPT_CORE_CONTENT = {
  id: "javascript-core",
  slug: "javascript-core",

  title: "JavaScript Core",

  subtitle: "Bring your pages to life",

  description:
    "Learn variables, conditions, loops, functions, arrays, objects, events, and DOM basics while building interactive web experiences.",

  version: 1,

  status: "published",

  accent: "#ffd84d",

  secondaryAccent: "#ff9f43",

  estimatedMinutes: 220,

  execution: {
    mode: "backend-runner",
    enabled: false,
    language: "javascript",
  },

  /* ==================================================== */
  /* LESSONS */
  /* ==================================================== */

  lessons: [
    /* ================================================== */
    /* LESSON 1 */
    /* ================================================== */

    {
      id: "js-intro",

      slug: "js-intro",

      order: 1,

      title: "Welcome to JavaScript",

      subtitle: "Make websites interactive",

      description:
        "Discover what JavaScript does and write your first lines of code.",

      difficulty: "beginner",

      xp: 70,

      estimatedMinutes: 12,

      status: "published",

      blocks: [
        {
          id: "js-intro-story",

          type: "text",

          title: "HTML builds. CSS styles. JavaScript acts.",

          content:
            "JavaScript adds behavior to websites. It can react to clicks, update content, calculate values, validate forms, and much more.",
        },

        {
          id: "js-intro-tip",

          type: "tip",

          content:
            "JavaScript runs inside browsers and can also run on servers.",
        },

        {
          id: "js-intro-example",

          type: "code",

          language: "javascript",

          code: `console.log("Hello CodeLand!");`,
        },
      ],

      mission: {
        title: "Your first JavaScript line",

        instructions:
          'Write a console.log statement that prints "Hello CodeLand!".',

        starterCode: `console.log("");`,

        validation: {
          type: "consoleOutputEquals",
          expectedOutput: ["Hello CodeLand!"],
        },

        mockConsole: ["> Hello CodeLand!"],

        hints: [
          "Use console.log(...).",
          "Put the text inside quotes.",
          'Try: console.log("Hello CodeLand!");',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 2 */
    /* ================================================== */

    {
      id: "js-variables",

      slug: "js-variables",

      order: 2,

      title: "Variables",

      subtitle: "Store information in code",

      description:
        "Learn how const and let help you store values and reuse them later.",

      difficulty: "beginner",

      xp: 80,

      estimatedMinutes: 16,

      status: "published",

      blocks: [
        {
          id: "variables-text",

          type: "text",

          title: "Give data a name",

          content:
            "Variables let us store information such as names, scores, colors, and ages. Use const when a value should not be reassigned and let when it may change.",
        },

        {
          id: "variables-example",

          type: "code",

          language: "javascript",

          code: `const name = "Maya";
let score = 10;

console.log(name);
console.log(score);`,
        },
      ],

      mission: {
        title: "Create a score",

        instructions:
          "Create a variable named score with the value 10, then print it.",

        starterCode: `const score = 0;

console.log(score);`,

        validation: {
          type: "variableEquals",
          variable: "score",
          expectedValue: 10,
        },

        mockConsole: ["> 10"],

        hints: [
          "Use const or let.",
          "The variable must be named score.",
          "Set score to 10.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 3 */
    /* ================================================== */

    {
      id: "js-data-types",

      slug: "js-data-types",

      order: 3,

      title: "Data Types",

      subtitle: "Understand the values you work with",

      description:
        "Learn strings, numbers, booleans, and how JavaScript treats different kinds of data.",

      difficulty: "beginner",

      xp: 90,

      estimatedMinutes: 16,

      status: "published",

      blocks: [
        {
          id: "types-text",

          type: "text",

          title: "Not all values are the same",

          content:
            "JavaScript values have types. Common beginner types include strings for text, numbers for math, and booleans for true or false states.",
        },

        {
          id: "types-example",

          type: "code",

          language: "javascript",

          code: `const username = "Sam";
const level = 3;
const isReady = true;`,
        },
      ],

      mission: {
        title: "Create three values",

        instructions:
          "Create a string called username, a number called level, and a boolean called isReady.",

        starterCode: `const username = "";
const level = 0;
const isReady = false;`,

        validation: {
          type: "variablesHaveTypes",

          variables: [
            {
              name: "username",
              expectedType: "string",
            },

            {
              name: "level",
              expectedType: "number",
            },

            {
              name: "isReady",
              expectedType: "boolean",
            },
          ],
        },

        mockConsole: [],

        hints: [
          "Strings use quotes.",
          "Numbers do not need quotes.",
          "Booleans are true or false.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 4 */
    /* ================================================== */

    {
      id: "js-conditions",

      slug: "js-conditions",

      order: 4,

      title: "Conditions",

      subtitle: "Let your code make decisions",

      description:
        "Use if and else to make JavaScript choose what should happen.",

      difficulty: "beginner",

      xp: 100,

      estimatedMinutes: 20,

      status: "published",

      blocks: [
        {
          id: "conditions-text",

          type: "text",

          title: "If this, then that",

          content:
            "Conditions let your code react differently depending on whether something is true or false.",
        },

        {
          id: "conditions-example",

          type: "code",

          language: "javascript",

          code: `const score = 12;

if (score >= 10) {
  console.log("Level complete!");
} else {
  console.log("Keep going!");
}`,
        },
      ],

      mission: {
        title: "Check the score",

        instructions:
          'If score is 10 or more, print "Level complete!". Otherwise print "Keep going!".',

        starterCode: `const score = 12;

if (score >= 10) {
  
} else {
  
}`,

        validation: {
          type: "consoleOutputEquals",
          expectedOutput: ["Level complete!"],
        },

        mockConsole: ["> Level complete!"],

        hints: [
          "Use console.log inside each block.",
          'The success text is "Level complete!".',
          'The else text is "Keep going!".',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 5 */
    /* ================================================== */

    {
      id: "js-loops",

      slug: "js-loops",

      order: 5,

      title: "Loops",

      subtitle: "Repeat work without repeating code",

      description: "Use loops to repeat an action several times.",

      difficulty: "beginner",

      xp: 110,

      estimatedMinutes: 22,

      status: "published",

      blocks: [
        {
          id: "loops-text",

          type: "text",

          title: "Repeat with purpose",

          content:
            "Loops help when the same action needs to happen many times. A for loop is one of the most common loop patterns.",
        },

        {
          id: "loops-example",

          type: "code",

          language: "javascript",

          code: `for (let i = 1; i <= 3; i++) {
  console.log(i);
}`,
        },
      ],

      mission: {
        title: "Print 1 to 5",

        instructions: "Use a loop to print the numbers 1 through 5.",

        starterCode: `for (let i = 1; i <= 5; i++) {
  
}`,

        validation: {
          type: "consoleOutputEquals",

          expectedOutput: ["1", "2", "3", "4", "5"],
        },

        mockConsole: ["> 1", "> 2", "> 3", "> 4", "> 5"],

        hints: [
          "Start i at 1.",
          "Keep looping while i <= 5.",
          "Print i inside the loop.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 6 */
    /* ================================================== */

    {
      id: "js-functions",

      slug: "js-functions",

      order: 6,

      title: "Functions",

      subtitle: "Package logic into reusable actions",

      description:
        "Create functions that can receive information and return results.",

      difficulty: "beginner",

      xp: 120,

      estimatedMinutes: 24,

      status: "published",

      blocks: [
        {
          id: "functions-text",

          type: "text",

          title: "Write it once. Use it again.",

          content:
            "Functions group reusable logic together. They can receive parameters and return new values.",
        },

        {
          id: "functions-example",

          type: "code",

          language: "javascript",

          code: `function greet(name) {
  return "Hello " + name;
}

console.log(greet("Ava"));`,
        },
      ],

      mission: {
        title: "Create a greet function",

        instructions:
          'Create a function named greet that returns "Hello " plus the provided name.',

        starterCode: `function greet(name) {
  
}

console.log(greet("CodeLand"));`,

        validation: {
          type: "functionTest",

          functionName: "greet",

          tests: [
            {
              args: ["CodeLand"],
              expectedValue: "Hello CodeLand",
            },
          ],
        },

        mockConsole: ["> Hello CodeLand"],

        hints: [
          "Use return inside the function.",
          "Use the name parameter.",
          'Return "Hello " + name.',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 7 */
    /* ================================================== */

    {
      id: "js-arrays",

      slug: "js-arrays",

      order: 7,

      title: "Arrays",

      subtitle: "Keep multiple values together",

      description: "Learn how arrays store lists of related values.",

      difficulty: "beginner",

      xp: 130,

      estimatedMinutes: 22,

      status: "published",

      blocks: [
        {
          id: "arrays-text",

          type: "text",

          title: "One variable. Many values.",

          content:
            "Arrays are useful when you want to store a collection such as colors, names, scores, or projects.",
        },

        {
          id: "arrays-example",

          type: "code",

          language: "javascript",

          code: `const colors = ["red", "blue", "green"];

console.log(colors[0]);`,
        },
      ],

      mission: {
        title: "Build a color list",

        instructions:
          'Create an array called colors containing "red", "blue", and "green".',

        starterCode: `const colors = [];

console.log(colors);`,

        validation: {
          type: "arrayEquals",

          variable: "colors",

          expectedValue: ["red", "blue", "green"],
        },

        mockConsole: ['> ["red", "blue", "green"]'],

        hints: [
          "Arrays use square brackets.",
          "Separate values with commas.",
          'Use "red", "blue", and "green".',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 8 */
    /* ================================================== */

    {
      id: "js-objects",

      slug: "js-objects",

      order: 8,

      title: "Objects",

      subtitle: "Describe things with properties",

      description: "Use objects to group related information about one thing.",

      difficulty: "beginner",

      xp: 140,

      estimatedMinutes: 24,

      status: "published",

      blocks: [
        {
          id: "objects-text",

          type: "text",

          title: "Data with meaning",

          content:
            "Objects organize related values using property names. They are useful for representing users, projects, products, and much more.",
        },

        {
          id: "objects-example",

          type: "code",

          language: "javascript",

          code: `const player = {
  name: "Alex",
  level: 5,
  online: true,
};`,
        },
      ],

      mission: {
        title: "Create a player object",

        instructions:
          "Create a player object with name, level, and online properties.",

        starterCode: `const player = {
  
};

console.log(player);`,

        validation: {
          type: "objectHasProperties",

          variable: "player",

          properties: ["name", "level", "online"],
        },

        mockConsole: ["> { name: ..., level: ..., online: ... }"],

        hints: [
          "Objects use curly braces.",
          "Each property needs a name and value.",
          "Add name, level, and online.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 9 */
    /* ================================================== */

    {
      id: "js-events",

      slug: "js-events",

      order: 9,

      title: "Events",

      subtitle: "React to what users do",

      description:
        "Learn how clicks and other events make web pages interactive.",

      difficulty: "beginner",

      xp: 150,

      estimatedMinutes: 24,

      status: "published",

      blocks: [
        {
          id: "events-text",

          type: "text",

          title: "Listen for interaction",

          content:
            "Events let JavaScript respond when a user clicks, types, submits a form, moves the mouse, and more.",
        },

        {
          id: "events-example",

          type: "code",

          language: "javascript",

          code: `button.addEventListener("click", () => {
  console.log("Button clicked!");
});`,
        },
      ],

      mission: {
        title: "Add a click listener",

        instructions:
          "Add a click event listener to the button and print a message when it is clicked.",

        starterHtml: `<button id="magicButton">
  Click me
</button>`,

        starterCode: `const button =
  document.querySelector("#magicButton");

// Add your event listener here
`,

        validation: {
          type: "domEventListenerExists",

          selector: "#magicButton",

          event: "click",
        },

        mockConsole: ["> Button clicked!"],

        hints: [
          "Use addEventListener.",
          'The event name is "click".',
          "Pass a callback function as the second argument.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 10 */
    /* ================================================== */

    {
      id: "js-dom",

      slug: "js-dom",

      order: 10,

      title: "DOM Basics",

      subtitle: "Change the page with JavaScript",

      description: "Use JavaScript to find elements and update what users see.",

      difficulty: "beginner",

      xp: 170,

      estimatedMinutes: 28,

      status: "published",

      blocks: [
        {
          id: "dom-text",

          type: "text",

          title: "JavaScript meets HTML",

          content:
            "The DOM lets JavaScript work with the HTML page. You can select elements, change text, update classes, and respond to interaction.",
        },

        {
          id: "dom-example",

          type: "code",

          language: "javascript",

          code: `const title =
  document.querySelector("#title");

title.textContent =
  "Welcome to CodeLand";`,
        },
      ],

      mission: {
        title: "Change the message",

        instructions:
          'Select #message and change its text to "JavaScript is working!".',

        starterHtml: `<h2 id="message">
  Waiting for JavaScript...
</h2>`,

        starterCode: `const message =
  document.querySelector("#message");

// Change the text here
`,

        validation: {
          type: "domTextEquals",

          selector: "#message",

          expectedText: "JavaScript is working!",
        },

        mockConsole: [],

        hints: [
          'Select the element with document.querySelector("#message").',
          "Use textContent.",
          'Set it to "JavaScript is working!".',
        ],
      },
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
      id: "js-score-calculator",

      slug: "js-score-calculator",

      order: 1,

      title: "Score Calculator",

      subtitle: "Use variables and math",

      description:
        "Calculate a player's final score using JavaScript variables.",

      difficulty: "beginner",

      xp: 180,

      estimatedMinutes: 22,

      status: "published",

      starterCode: `const baseScore = 50;
const bonus = 25;

// Create finalScore

console.log(finalScore);`,

      validation: [
        {
          type: "variableEquals",

          variable: "finalScore",

          expectedValue: 75,
        },
      ],

      mockConsole: ["> 75"],

      hints: ["Add baseScore and bonus.", "Store the result in finalScore."],
    },

    /* ================================================== */
    /* CHALLENGE 2 */
    /* ================================================== */

    {
      id: "js-access-check",

      slug: "js-access-check",

      order: 2,

      title: "Access Check",

      subtitle: "Use conditions",

      description: "Decide whether a player can enter a level.",

      difficulty: "beginner",

      xp: 200,

      estimatedMinutes: 24,

      status: "published",

      starterCode: `const playerLevel = 5;

// If level is 5 or more:
// print "Access granted"
// otherwise:
// print "Level locked"
`,

      validation: [
        {
          type: "consoleOutputEquals",

          expectedOutput: ["Access granted"],
        },
      ],

      mockConsole: ["> Access granted"],

      hints: ["Use an if / else statement.", "Check playerLevel >= 5."],
    },

    /* ================================================== */
    /* CHALLENGE 3 */
    /* ================================================== */

    {
      id: "js-level-loop",

      slug: "js-level-loop",

      order: 3,

      title: "Level Loop",

      subtitle: "Practice loops",

      description: "Use a loop to print a sequence of unlocked levels.",

      difficulty: "beginner",

      xp: 220,

      estimatedMinutes: 26,

      status: "published",

      starterCode: `// Print:
// Level 1
// Level 2
// Level 3
// Level 4
`,

      validation: [
        {
          type: "consoleOutputEquals",

          expectedOutput: ["Level 1", "Level 2", "Level 3", "Level 4"],
        },
      ],

      mockConsole: ["> Level 1", "> Level 2", "> Level 3", "> Level 4"],

      hints: ["Use a for loop.", 'Print "Level " + i.'],
    },

    /* ================================================== */
    /* CHALLENGE 4 */
    /* ================================================== */

    {
      id: "js-team-function",

      slug: "js-team-function",

      order: 4,

      title: "Team Greeting",

      subtitle: "Practice functions",

      description:
        "Build a reusable function that creates a greeting for any coder.",

      difficulty: "beginner",

      xp: 240,

      estimatedMinutes: 28,

      status: "published",

      starterCode: `function welcomeCoder(name) {
  
}

console.log(
  welcomeCoder("Lina")
);`,

      validation: [
        {
          type: "functionTest",

          functionName: "welcomeCoder",

          tests: [
            {
              args: ["Lina"],
              expectedValue: "Welcome Lina!",
            },

            {
              args: ["Omar"],
              expectedValue: "Welcome Omar!",
            },
          ],
        },
      ],

      mockConsole: ["> Welcome Lina!"],

      hints: ["Use the name parameter.", 'Return "Welcome " + name + "!".'],
    },

    /* ================================================== */
    /* CHALLENGE 5 */
    /* ================================================== */

    {
      id: "js-project-list",

      slug: "js-project-list",

      order: 5,

      title: "Project List",

      subtitle: "Use arrays and loops together",

      description: "Store project names in an array and print each one.",

      difficulty: "beginner",

      xp: 280,

      estimatedMinutes: 30,

      status: "published",

      starterCode: `const projects = [
  "Portfolio",
  "Game",
  "Quiz"
];

// Print every project
`,

      validation: [
        {
          type: "consoleOutputEquals",

          expectedOutput: ["Portfolio", "Game", "Quiz"],
        },
      ],

      mockConsole: ["> Portfolio", "> Game", "> Quiz"],

      hints: ["Loop through the projects array.", "Print the current item."],
    },

    /* ================================================== */
    /* FINAL CHALLENGE */
    /* ================================================== */

    {
      id: "js-final-interactive-card",

      slug: "js-final-interactive-card",

      order: 6,

      title: "Interactive Card Mission",

      subtitle: "JavaScript Core final challenge",

      description:
        "Use DOM selection, events, variables, and conditions to make an interactive card.",

      difficulty: "beginner",

      xp: 450,

      estimatedMinutes: 45,

      status: "published",

      starterHtml: `<section class="card">
  <h2 id="title">
    CodeLand Explorer
  </h2>

  <p id="status">
    Not activated
  </p>

  <button id="activateButton">
    Activate
  </button>
</section>`,

      starterCode: `const button =
  document.querySelector("#activateButton");

const status =
  document.querySelector("#status");

// Make the button interactive
`,

      validation: [
        {
          type: "domEventListenerExists",

          selector: "#activateButton",

          event: "click",
        },

        {
          type: "domTextEqualsAfterEvent",

          eventSelector: "#activateButton",

          event: "click",

          targetSelector: "#status",

          expectedText: "Activated!",
        },
      ],

      mockConsole: [],

      hints: [
        "Add a click listener to the button.",
        "Inside the listener, change status.textContent.",
        'Set the text to "Activated!".',
      ],
    },
  ],
};

export default JAVASCRIPT_CORE_CONTENT;
