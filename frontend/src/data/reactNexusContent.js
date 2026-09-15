/* ====================================================== */
/* REACT NEXUS CONTENT */
/* ====================================================== */

export const REACT_NEXUS_CONTENT = {
  id: "react-nexus",

  slug: "react-nexus",

  title: "React Nexus",

  subtitle: "Build powerful interfaces",

  description:
    "Learn components, props, state, events, lists, conditional rendering, forms, effects, and reusable UI patterns with React.",

  version: 1,

  status: "published",

  accent: "#61dafb",

  secondaryAccent: "#8b6cff",

  estimatedMinutes: 290,

  execution: {
    mode: "backend-runner",

    enabled: false,

    language: "jsx",
  },

  /* ==================================================== */
  /* LESSONS */
  /* ==================================================== */

  lessons: [
    /* ================================================== */
    /* LESSON 1 */
    /* ================================================== */

    {
      id: "react-intro",

      slug: "react-intro",

      order: 1,

      title: "Welcome to React",

      subtitle: "Build interfaces with components",

      description:
        "Discover how React helps us build modern websites from reusable pieces.",

      difficulty: "beginner",

      xp: 90,

      estimatedMinutes: 15,

      status: "published",

      blocks: [
        {
          id: "react-intro-text",

          type: "text",

          title: "Think in components",

          content:
            "React lets us build interfaces using reusable pieces called components. A page can be made from headers, cards, buttons, forms, and many other components.",
        },

        {
          id: "react-intro-tip",

          type: "tip",

          content:
            "A React component is usually a JavaScript function that returns JSX.",
        },

        {
          id: "react-intro-example",

          type: "code",

          language: "jsx",

          code: `function Welcome() {
  return <h1>Hello React!</h1>;
}`,
        },
      ],

      mission: {
        title: "Create your first component",

        instructions:
          "Create a component named Welcome that returns an h1 with the text Hello React!.",

        starterCode: `function Welcome() {
  return (
    <h1>
      
    </h1>
  );
}`,

        validation: {
          type: "reactComponentExists",

          componentName: "Welcome",

          expectedText: "Hello React!",
        },

        hints: [
          "React components usually start with a capital letter.",

          "Return JSX from the function.",

          'Put "Hello React!" inside the h1.',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 2 */
    /* ================================================== */

    {
      id: "react-jsx",

      slug: "react-jsx",

      order: 2,

      title: "JSX",

      subtitle: "Write HTML-like code inside JavaScript",

      description:
        "Learn how JSX lets React describe what should appear on the screen.",

      difficulty: "beginner",

      xp: 100,

      estimatedMinutes: 18,

      status: "published",

      blocks: [
        {
          id: "jsx-text",

          type: "text",

          title: "JavaScript meets markup",

          content:
            "JSX looks similar to HTML, but it lives inside JavaScript. JSX lets you combine markup and JavaScript expressions together.",
        },

        {
          id: "jsx-example",

          type: "code",

          language: "jsx",

          code: `const name = "Maya";

function Greeting() {
  return (
    <h2>Hello {name}</h2>
  );
}`,
        },
      ],

      mission: {
        title: "Use a JavaScript value",

        instructions:
          "Create a variable called name and show it inside an h2 using JSX braces.",

        starterCode: `const name = "Alex";

function Greeting() {
  return (
    <h2>
      
    </h2>
  );
}`,

        validation: {
          type: "jsxExpressionExists",

          variable: "name",
        },

        hints: [
          "JavaScript values inside JSX use curly braces.",

          "Use {name}.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 3 */
    /* ================================================== */

    {
      id: "react-components",

      slug: "react-components",

      order: 3,

      title: "Components",

      subtitle: "Break interfaces into reusable pieces",

      description:
        "Create smaller React components and combine them into a larger interface.",

      difficulty: "beginner",

      xp: 110,

      estimatedMinutes: 20,

      status: "published",

      blocks: [
        {
          id: "components-text",

          type: "text",

          title: "Small pieces build big apps",

          content:
            "Components help keep your interface organized. One component can be reused many times throughout an application.",
        },

        {
          id: "components-example",

          type: "code",

          language: "jsx",

          code: `function Badge() {
  return <span>Explorer</span>;
}

function Profile() {
  return (
    <div>
      <h2>Alex</h2>
      <Badge />
    </div>
  );
}`,
        },
      ],

      mission: {
        title: "Build a reusable badge",

        instructions:
          "Create a Badge component and render it inside the Profile component.",

        starterCode: `function Badge() {
  return (
    <span>
      Explorer
    </span>
  );
}

function Profile() {
  return (
    <div>
      <h2>Alex</h2>
      
    </div>
  );
}`,

        validation: {
          type: "componentRendered",

          componentName: "Badge",

          parentComponent: "Profile",
        },

        hints: [
          "Components are used like custom HTML tags.",

          "Render <Badge /> inside Profile.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 4 */
    /* ================================================== */

    {
      id: "react-props",

      slug: "react-props",

      order: 4,

      title: "Props",

      subtitle: "Pass information into components",

      description:
        "Use props to make the same component display different data.",

      difficulty: "beginner",

      xp: 120,

      estimatedMinutes: 22,

      status: "published",

      blocks: [
        {
          id: "props-text",

          type: "text",

          title: "Make components flexible",

          content:
            "Props are values passed from one component to another. They let reusable components display different information.",
        },

        {
          id: "props-example",

          type: "code",

          language: "jsx",

          code: `function PlayerCard({ name }) {
  return <h2>{name}</h2>;
}

function App() {
  return (
    <PlayerCard name="Lina" />
  );
}`,
        },
      ],

      mission: {
        title: "Pass a player name",

        instructions:
          "Make PlayerCard receive a name prop and display it inside an h2.",

        starterCode: `function PlayerCard({ name }) {
  return (
    <h2>
      
    </h2>
  );
}

function App() {
  return (
    <PlayerCard name="Lina" />
  );
}`,

        validation: {
          type: "propRendered",

          componentName: "PlayerCard",

          propName: "name",
        },

        hints: [
          "The name prop is already available.",

          "Use {name} inside the h2.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 5 */
    /* ================================================== */

    {
      id: "react-state",

      slug: "react-state",

      order: 5,

      title: "State",

      subtitle: "Let components remember things",

      description:
        "Learn how useState stores values that can change while your app is running.",

      difficulty: "beginner",

      xp: 140,

      estimatedMinutes: 26,

      status: "published",

      blocks: [
        {
          id: "state-text",

          type: "text",

          title: "Components can remember",

          content:
            "State lets a React component remember changing information such as scores, counters, selected items, and form values.",
        },

        {
          id: "state-example",

          type: "code",

          language: "jsx",

          code: `import { useState } from "react";

function Counter() {
  const [count, setCount] =
    useState(0);

  return (
    <button>
      {count}
    </button>
  );
}`,
        },
      ],

      mission: {
        title: "Create a score state",

        instructions: "Create a state value named score starting at 0.",

        starterCode: `import { useState } from "react";

function ScoreBoard() {
  const [
    score,
    setScore,
  ] = useState();

  return (
    <h2>
      {score}
    </h2>
  );
}`,

        validation: {
          type: "useStateInitialValue",

          stateName: "score",

          expectedValue: 0,
        },

        hints: ["useState needs an initial value.", "Start the score at 0."],
      },
    },

    /* ================================================== */
    /* LESSON 6 */
    /* ================================================== */

    {
      id: "react-events",

      slug: "react-events",

      order: 6,

      title: "Events",

      subtitle: "React to clicks",

      description: "Connect buttons and user actions to JavaScript functions.",

      difficulty: "beginner",

      xp: 150,

      estimatedMinutes: 24,

      status: "published",

      blocks: [
        {
          id: "react-events-text",

          type: "text",

          title: "Make your UI respond",

          content:
            "React uses event props such as onClick to run functions when users interact with the interface.",
        },

        {
          id: "react-events-example",

          type: "code",

          language: "jsx",

          code: `function Button() {
  function handleClick() {
    console.log("Clicked!");
  }

  return (
    <button onClick={handleClick}>
      Click me
    </button>
  );
}`,
        },
      ],

      mission: {
        title: "Connect the button",

        instructions:
          "Add the handleClick function to the button using onClick.",

        starterCode: `function ActionButton() {
  function handleClick() {
    console.log("Activated!");
  }

  return (
    <button>
      Activate
    </button>
  );
}`,

        validation: {
          type: "reactEventHandler",

          event: "onClick",

          handler: "handleClick",
        },

        hints: [
          "React click events use onClick.",

          "Pass the function without calling it.",

          "Use onClick={handleClick}.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 7 */
    /* ================================================== */

    {
      id: "react-conditional-rendering",

      slug: "react-conditional-rendering",

      order: 7,

      title: "Conditional Rendering",

      subtitle: "Show different UI when things change",

      description: "Render different content depending on application state.",

      difficulty: "beginner",

      xp: 160,

      estimatedMinutes: 24,

      status: "published",

      blocks: [
        {
          id: "conditional-text",

          type: "text",

          title: "The UI can make decisions",

          content:
            "React can display different elements depending on conditions. This is useful for login states, loading screens, locked levels, and more.",
        },

        {
          id: "conditional-example",

          type: "code",

          language: "jsx",

          code: `function Status({
  online,
}) {
  return (
    <p>
      {online
        ? "Online"
        : "Offline"}
    </p>
  );
}`,
        },
      ],

      mission: {
        title: "Show the player status",

        instructions:
          'Show "Online" when online is true and "Offline" otherwise.',

        starterCode: `function Status({ online }) {
  return (
    <p>
      
    </p>
  );
}`,

        validation: {
          type: "conditionalRender",

          condition: "online",

          trueText: "Online",

          falseText: "Offline",
        },

        hints: [
          "A ternary works well here.",

          'Use online ? "Online" : "Offline".',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 8 */
    /* ================================================== */

    {
      id: "react-lists",

      slug: "react-lists",

      order: 8,

      title: "Rendering Lists",

      subtitle: "Turn arrays into UI",

      description: "Use map to render collections of data as React elements.",

      difficulty: "beginner",

      xp: 170,

      estimatedMinutes: 26,

      status: "published",

      blocks: [
        {
          id: "lists-text",

          type: "text",

          title: "Data becomes interface",

          content:
            "React commonly uses the map method to transform arrays into lists of JSX elements.",
        },

        {
          id: "lists-example",

          type: "code",

          language: "jsx",

          code: `const skills = [
  "HTML",
  "CSS",
  "JavaScript",
];

function Skills() {
  return (
    <ul>
      {skills.map((skill) => (
        <li key={skill}>
          {skill}
        </li>
      ))}
    </ul>
  );
}`,
        },
      ],

      mission: {
        title: "Render every project",

        instructions: "Use map to render every project inside an li element.",

        starterCode: `const projects = [
  "Portfolio",
  "Quiz",
  "Game",
];

function Projects() {
  return (
    <ul>
      
    </ul>
  );
}`,

        validation: {
          type: "arrayMapRender",

          arrayName: "projects",

          element: "li",
        },

        hints: [
          "Use projects.map(...).",

          "Return an li for every project.",

          "Remember the key prop.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 9 */
    /* ================================================== */

    {
      id: "react-forms",

      slug: "react-forms",

      order: 9,

      title: "Forms",

      subtitle: "Capture user input",

      description: "Learn how React manages input values and form state.",

      difficulty: "beginner",

      xp: 180,

      estimatedMinutes: 28,

      status: "published",

      blocks: [
        {
          id: "forms-text",

          type: "text",

          title: "Inputs connected to state",

          content:
            "React forms often store input values in state. The value prop controls the input, while onChange updates the state.",
        },

        {
          id: "forms-example",

          type: "code",

          language: "jsx",

          code: `import { useState } from "react";

function NameForm() {
  const [name, setName] =
    useState("");

  return (
    <input
      value={name}
      onChange={(event) =>
        setName(
          event.target.value
        )
      }
    />
  );
}`,
        },
      ],

      mission: {
        title: "Control the username input",

        instructions:
          "Connect the username state to the input using value and onChange.",

        starterCode: `import { useState } from "react";

function UsernameForm() {
  const [
    username,
    setUsername,
  ] = useState("");

  return (
    <input
      
    />
  );
}`,

        validation: {
          type: "controlledInput",

          stateName: "username",

          setterName: "setUsername",
        },

        hints: [
          "Set value={username}.",

          "Use onChange to call setUsername.",

          "Read event.target.value.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 10 */
    /* ================================================== */

    {
      id: "react-effects",

      slug: "react-effects",

      order: 10,

      title: "Effects",

      subtitle: "Run code when components change",

      description: "Use useEffect for actions that happen after rendering.",

      difficulty: "beginner",

      xp: 190,

      estimatedMinutes: 28,

      status: "published",

      blocks: [
        {
          id: "effects-text",

          type: "text",

          title: "React to lifecycle changes",

          content:
            "useEffect lets components perform work after rendering. It is commonly used for fetching data, timers, subscriptions, and syncing with external systems.",
        },

        {
          id: "effects-example",

          type: "code",

          language: "jsx",

          code: `import {
  useEffect,
} from "react";

function App() {
  useEffect(() => {
    console.log(
      "Component ready"
    );
  }, []);

  return <h1>Hello</h1>;
}`,
        },
      ],

      mission: {
        title: "Run an effect once",

        instructions:
          'Use useEffect to print "Nexus ready" once when the component loads.',

        starterCode: `import {
  useEffect,
} from "react";

function Nexus() {
  

  return (
    <h1>
      React Nexus
    </h1>
  );
}`,

        validation: {
          type: "useEffectExists",

          expectedOutput: "Nexus ready",

          dependencyCount: 0,
        },

        hints: [
          "Call useEffect inside the component.",

          "Use an empty dependency array.",

          'Print "Nexus ready".',
        ],
      },
    },

    /* ================================================== */
    /* LESSON 11 */
    /* ================================================== */

    {
      id: "react-component-composition",

      slug: "react-component-composition",

      order: 11,

      title: "Component Composition",

      subtitle: "Build bigger interfaces from smaller pieces",

      description:
        "Combine multiple reusable components to create complete sections of an application.",

      difficulty: "beginner",

      xp: 210,

      estimatedMinutes: 30,

      status: "published",

      blocks: [
        {
          id: "composition-text",

          type: "text",

          title: "Components working together",

          content:
            "Good React interfaces are built by combining small focused components instead of placing everything inside one giant component.",
        },

        {
          id: "composition-example",

          type: "code",

          language: "jsx",

          code: `function Avatar() {
  return <div>🤖</div>;
}

function PlayerInfo() {
  return <h2>Explorer</h2>;
}

function Profile() {
  return (
    <section>
      <Avatar />
      <PlayerInfo />
    </section>
  );
}`,
        },
      ],

      mission: {
        title: "Compose the profile",

        instructions:
          "Render both Avatar and PlayerInfo inside the Profile component.",

        starterCode: `function Avatar() {
  return <div>🤖</div>;
}

function PlayerInfo() {
  return (
    <h2>Explorer</h2>
  );
}

function Profile() {
  return (
    <section>
      
    </section>
  );
}`,

        validation: {
          type: "multipleComponentsRendered",

          parentComponent: "Profile",

          components: ["Avatar", "PlayerInfo"],
        },

        hints: [
          "Use both components inside the section.",

          "Render <Avatar /> and <PlayerInfo />.",
        ],
      },
    },

    /* ================================================== */
    /* LESSON 12 */
    /* ================================================== */

    {
      id: "react-reusable-ui",

      slug: "react-reusable-ui",

      order: 12,

      title: "Reusable UI",

      subtitle: "Build flexible components",

      description:
        "Combine props, state, events, and composition to create reusable interface components.",

      difficulty: "beginner",

      xp: 230,

      estimatedMinutes: 32,

      status: "published",

      blocks: [
        {
          id: "reusable-text",

          type: "text",

          title: "Build once. Reuse everywhere.",

          content:
            "Reusable components accept data and behavior through props so the same design can work in many different places.",
        },

        {
          id: "reusable-example",

          type: "code",

          language: "jsx",

          code: `function ActionButton({
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
    >
      {label}
    </button>
  );
}`,
        },
      ],

      mission: {
        title: "Create a reusable button",

        instructions:
          "Make ActionButton display its label prop and use its onClick prop.",

        starterCode: `function ActionButton({
  label,
  onClick,
}) {
  return (
    <button>
      
    </button>
  );
}`,

        validation: {
          type: "reusableComponent",

          componentName: "ActionButton",

          requiredProps: ["label", "onClick"],
        },

        hints: [
          "Use {label} inside the button.",

          "Add onClick={onClick} to the button.",
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
      id: "react-profile-card",

      slug: "react-profile-card",

      order: 1,

      title: "Profile Card",

      subtitle: "Components and props",

      description:
        "Create a reusable profile card that displays player information using props.",

      difficulty: "beginner",

      xp: 250,

      estimatedMinutes: 28,

      status: "published",

      starterCode: `function ProfileCard({
  name,
  level,
}) {
  return (
    <article>
      
    </article>
  );
}

function App() {
  return (
    <ProfileCard
      name="Maya"
      level={5}
    />
  );
}`,

      validation: [
        {
          type: "propRendered",

          componentName: "ProfileCard",

          propName: "name",
        },

        {
          type: "propRendered",

          componentName: "ProfileCard",

          propName: "level",
        },
      ],

      hints: ["Show both name and level.", "Use JSX braces for props."],
    },

    /* ================================================== */
    /* CHALLENGE 2 */
    /* ================================================== */

    {
      id: "react-counter",

      slug: "react-counter",

      order: 2,

      title: "Power Counter",

      subtitle: "State and events",

      description:
        "Create a counter that increases whenever the player presses a button.",

      difficulty: "beginner",

      xp: 280,

      estimatedMinutes: 30,

      status: "published",

      starterCode: `import {
  useState,
} from "react";

function PowerCounter() {
  const [
    power,
    setPower,
  ] = useState(0);

  return (
    <div>
      <h2>
        {power}
      </h2>

      <button>
        Power Up
      </button>
    </div>
  );
}`,

      validation: [
        {
          type: "useStateInitialValue",

          stateName: "power",

          expectedValue: 0,
        },

        {
          type: "stateIncrementEvent",

          stateName: "power",

          setterName: "setPower",

          event: "onClick",
        },
      ],

      hints: ["Connect the button with onClick.", "Increase power by 1."],
    },

    /* ================================================== */
    /* CHALLENGE 3 */
    /* ================================================== */

    {
      id: "react-level-status",

      slug: "react-level-status",

      order: 3,

      title: "Level Status",

      subtitle: "Conditional rendering",

      description:
        "Display different interface messages depending on whether a level is unlocked.",

      difficulty: "beginner",

      xp: 300,

      estimatedMinutes: 28,

      status: "published",

      starterCode: `function LevelStatus({
  unlocked,
}) {
  return (
    <div>
      
    </div>
  );
}`,

      validation: [
        {
          type: "conditionalRender",

          condition: "unlocked",

          trueText: "Level Ready",

          falseText: "Level Locked",
        },
      ],

      hints: [
        "Use a ternary expression.",

        "Show a different message for each state.",
      ],
    },

    /* ================================================== */
    /* CHALLENGE 4 */
    /* ================================================== */

    {
      id: "react-skill-list",

      slug: "react-skill-list",

      order: 4,

      title: "Skill List",

      subtitle: "Arrays and rendering",

      description: "Render a list of coding skills from an array.",

      difficulty: "beginner",

      xp: 320,

      estimatedMinutes: 30,

      status: "published",

      starterCode: `const skills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
];

function SkillList() {
  return (
    <ul>
      
    </ul>
  );
}`,

      validation: [
        {
          type: "arrayMapRender",

          arrayName: "skills",

          element: "li",
        },
      ],

      hints: ["Use skills.map(...).", "Each skill should become an li."],
    },

    /* ================================================== */
    /* CHALLENGE 5 */
    /* ================================================== */

    {
      id: "react-signup-form",

      slug: "react-signup-form",

      order: 5,

      title: "Explorer Form",

      subtitle: "Controlled inputs",

      description: "Build a controlled input that stores the explorer's name.",

      difficulty: "beginner",

      xp: 350,

      estimatedMinutes: 32,

      status: "published",

      starterCode: `import {
  useState,
} from "react";

function ExplorerForm() {
  const [
    name,
    setName,
  ] = useState("");

  return (
    <input
      placeholder="Explorer name"
    />
  );
}`,

      validation: [
        {
          type: "controlledInput",

          stateName: "name",

          setterName: "setName",
        },
      ],

      hints: ["Use value={name}.", "Use onChange to update name."],
    },

    /* ================================================== */
    /* CHALLENGE 6 */
    /* ================================================== */

    {
      id: "react-mission-dashboard",

      slug: "react-mission-dashboard",

      order: 6,

      title: "Mission Dashboard",

      subtitle: "Combine React concepts",

      description:
        "Combine components, props, lists, and conditional rendering into a small dashboard.",

      difficulty: "beginner",

      xp: 420,

      estimatedMinutes: 38,

      status: "published",

      starterCode: `const missions = [
  "HTML Base",
  "CSS Styling",
  "JavaScript Core",
];

function Mission({
  name,
}) {
  return (
    <li>
      {name}
    </li>
  );
}

function Dashboard() {
  return (
    <section>
      <h1>
        My Missions
      </h1>

      <ul>
        
      </ul>
    </section>
  );
}`,

      validation: [
        {
          type: "arrayComponentMap",

          arrayName: "missions",

          componentName: "Mission",
        },

        {
          type: "propRendered",

          componentName: "Mission",

          propName: "name",
        },
      ],

      hints: [
        "Map through missions.",

        "Render a Mission component for each item.",

        "Pass the mission as the name prop.",
      ],
    },

    /* ================================================== */
    /* FINAL CHALLENGE */
    /* ================================================== */

    {
      id: "react-final-project",

      slug: "react-final-project",

      order: 7,

      title: "Nexus Control Panel",

      subtitle: "React Nexus final challenge",

      description:
        "Build an interactive control panel using components, props, state, events, lists, and conditional rendering.",

      difficulty: "beginner",

      xp: 600,

      estimatedMinutes: 55,

      status: "published",

      starterCode: `import {
  useState,
} from "react";

const systems = [
  "Navigation",
  "Energy",
  "Communications",
];

function SystemItem({
  name,
}) {
  return (
    <li>
      {name}
    </li>
  );
}

function NexusPanel() {
  const [
    active,
    setActive,
  ] = useState(false);

  return (
    <main>
      <h1>
        Nexus Control
      </h1>

      <p>
        {active
          ? "System Online"
          : "System Offline"}
      </p>

      <button>
        Toggle System
      </button>

      <ul>
        
      </ul>
    </main>
  );
}`,

      validation: [
        {
          type: "useStateInitialValue",

          stateName: "active",

          expectedValue: false,
        },

        {
          type: "stateToggleEvent",

          stateName: "active",

          setterName: "setActive",

          event: "onClick",
        },

        {
          type: "conditionalRender",

          condition: "active",

          trueText: "System Online",

          falseText: "System Offline",
        },

        {
          type: "arrayComponentMap",

          arrayName: "systems",

          componentName: "SystemItem",
        },
      ],

      hints: [
        "Use the button to toggle active.",

        "Use setActive(!active) or the callback form.",

        "Map through systems.",

        "Render a SystemItem for every system.",
      ],
    },
  ],
};

export default REACT_NEXUS_CONTENT;
