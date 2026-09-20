export const ANIMATION_TEMPLATES = [
  /* ====================================================== */
  /* HTML */
  /* ====================================================== */

  {
    id: "html-browser-render",
    label: "Browser Render",
    category: "html",
    description:
      "Shows how HTML code is read by the browser and rendered as a visible webpage.",
    defaultProps: {
      heading: "Hello CodeLand!",
      paragraph: "This is my first web page.",
    },
    fields: [
      {
        name: "heading",
        label: "Heading",
        type: "text",
        placeholder: "Hello CodeLand!",
        required: true,
      },
      {
        name: "paragraph",
        label: "Paragraph",
        type: "text",
        placeholder: "This is my first web page.",
        required: true,
      },
    ],
  },

  {
    id: "html-element",
    label: "HTML Element",
    category: "html",
    description:
      "Explains the opening tag, content, closing tag, and browser result of an HTML element.",
    defaultProps: {
      tag: "h1",
      text: "My Website",
    },
    fields: [
      {
        name: "tag",
        label: "HTML Tag",
        type: "select",
        required: true,
        options: [
          {
            label: "Heading 1",
            value: "h1",
          },
          {
            label: "Heading 2",
            value: "h2",
          },
          {
            label: "Heading 3",
            value: "h3",
          },
          {
            label: "Heading 4",
            value: "h4",
          },
          {
            label: "Heading 5",
            value: "h5",
          },
          {
            label: "Heading 6",
            value: "h6",
          },
          {
            label: "Paragraph",
            value: "p",
          },
          {
            label: "Button",
            value: "button",
          },
          {
            label: "Div",
            value: "div",
          },
          {
            label: "Span",
            value: "span",
          },
        ],
      },
      {
        name: "text",
        label: "Element Content",
        type: "text",
        placeholder: "My Website",
        required: true,
      },
    ],
  },

  {
    id: "html-document-structure",
    label: "Document Structure",
    category: "html",
    description:
      "Visualizes DOCTYPE, html, head, body, title, and visible page content.",
    defaultProps: {
      title: "My Website",
      heading: "Welcome!",
    },
    fields: [
      {
        name: "title",
        label: "Page Title",
        type: "text",
        placeholder: "My Website",
        required: true,
      },
      {
        name: "heading",
        label: "Page Heading",
        type: "text",
        placeholder: "Welcome!",
        required: true,
      },
    ],
  },

  {
    id: "html-links-images",
    label: "Links & Images",
    category: "html",
    description:
      "Shows how href connects pages and how src loads image content.",
    defaultProps: {
      linkText: "Visit Website",
      href: "example.com",
      imageAlt: "A random example",
    },
    fields: [
      {
        name: "linkText",
        label: "Link Text",
        type: "text",
        placeholder: "Visit Website",
        required: true,
      },
      {
        name: "href",
        label: "Destination",
        type: "text",
        placeholder: "example.com",
        required: true,
      },
      {
        name: "imageAlt",
        label: "Image Alt Text",
        type: "text",
        placeholder: "A random example",
        required: true,
      },
    ],
  },

  {
    id: "html-list-builder",
    label: "List Builder",
    category: "html",
    description:
      "Builds an unordered list and shows each li item appearing inside it.",
    defaultProps: {
      items: ["HTML", "CSS", "JavaScript"],
    },
    fields: [
      {
        name: "items",
        label: "List Items",
        type: "string-list",
        minimum: 1,
        maximum: 6,
        required: true,
        placeholder: "Add list item",
      },
    ],
  },

  {
    id: "html-form-flow",
    label: "Form Flow",
    category: "html",
    description:
      "Shows how labels, inputs, values, buttons, and form submission work together.",
    defaultProps: {
      label: "Your name",
      placeholder: "Enter your name",
      sampleValue: "Alex",
      buttonText: "Join",
    },
    fields: [
      {
        name: "label",
        label: "Input Label",
        type: "text",
        placeholder: "Your name",
        required: true,
      },
      {
        name: "placeholder",
        label: "Placeholder",
        type: "text",
        placeholder: "Enter your name",
        required: true,
      },
      {
        name: "sampleValue",
        label: "Example User Value",
        type: "text",
        placeholder: "Alex",
        required: true,
      },
      {
        name: "buttonText",
        label: "Button Text",
        type: "text",
        placeholder: "Join",
        required: true,
      },
    ],
  },

  /* ====================================================== */
  /* CSS */
  /* ====================================================== */

  {
    id: "css-intro-transformation",
    label: "CSS Transformation",
    category: "css",
    description:
      "Shows how CSS transforms plain HTML into a styled visual interface.",
    defaultProps: {
      heading: "Hello CodeLand!",
      paragraph: "CSS makes websites beautiful.",
      accent: "#46dfff",
      background: "#10172a",
    },
    fields: [
      {
        name: "heading",
        label: "Heading",
        type: "text",
        placeholder: "Hello CodeLand!",
        required: true,
      },
      {
        name: "paragraph",
        label: "Paragraph",
        type: "text",
        placeholder: "CSS makes websites beautiful.",
        required: true,
      },
      {
        name: "accent",
        label: "Accent Color",
        type: "text",
        placeholder: "#46dfff",
        required: true,
      },
      {
        name: "background",
        label: "Background Color",
        type: "text",
        placeholder: "#10172a",
        required: true,
      },
    ],
  },

  {
    id: "css-color-reactor",
    label: "Color Reactor",
    category: "css",
    description:
      "Visualizes CSS color names, HEX values, RGB values, and how colors are applied to an interface.",
    defaultProps: {
      colorName: "cyan",
      hex: "#46dfff",
      rgb: "rgb(70, 223, 255)",
      background: "#10172a",
    },
    fields: [
      {
        name: "colorName",
        label: "Color Name",
        type: "text",
        placeholder: "cyan",
        required: true,
      },
      {
        name: "hex",
        label: "HEX Color",
        type: "text",
        placeholder: "#46dfff",
        required: true,
      },
      {
        name: "rgb",
        label: "RGB Color",
        type: "text",
        placeholder: "rgb(70, 223, 255)",
        required: true,
      },
      {
        name: "background",
        label: "Background",
        type: "text",
        placeholder: "#10172a",
        required: true,
      },
    ],
  },

  {
    id: "css-typography-lab",
    label: "Typography Lab",
    category: "css",
    description:
      "Shows how font size, font weight, alignment, and line height create visual hierarchy.",
    defaultProps: {
      heading: "Future Coder",
      paragraph: "Building amazing things with code.",
    },
    fields: [
      {
        name: "heading",
        label: "Heading",
        type: "text",
        placeholder: "Future Coder",
        required: true,
      },
      {
        name: "paragraph",
        label: "Paragraph",
        type: "text",
        placeholder: "Building amazing things with code.",
        required: true,
      },
    ],
  },

  {
    id: "css-box-model",
    label: "Box Model Scanner",
    category: "css",
    description:
      "Explains content, padding, border, and margin by visually expanding each box-model layer.",
    defaultProps: {
      content: "My Project",
      padding: 24,
      margin: 20,
      border: 2,
    },
    fields: [
      {
        name: "content",
        label: "Content",
        type: "text",
        placeholder: "My Project",
        required: true,
      },
      {
        name: "padding",
        label: "Padding",
        type: "number",
        required: true,
      },
      {
        name: "margin",
        label: "Margin",
        type: "number",
        required: true,
      },
      {
        name: "border",
        label: "Border",
        type: "number",
        required: true,
      },
    ],
  },

  {
    id: "css-flexbox-layout",
    label: "Flexbox Layout Engine",
    category: "css",
    description:
      "Shows elements becoming a flex container and demonstrates alignment, centering, and gap.",
    defaultProps: {
      items: ["Explore", "Build", "Create"],
    },
    fields: [
      {
        name: "items",
        label: "Flex Items",
        type: "string-list",
        minimum: 2,
        maximum: 6,
        required: true,
        placeholder: "Add flex item",
      },
    ],
  },

  {
    id: "css-grid-builder",
    label: "Grid Builder",
    category: "css",
    description:
      "Constructs CSS Grid tracks and shows cards snapping into rows and columns.",
    defaultProps: {
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
    fields: [
      {
        name: "columns",
        label: "Columns",
        type: "number",
        required: true,
      },
      {
        name: "items",
        label: "Grid Items",
        type: "string-list",
        minimum: 1,
        maximum: 9,
        required: true,
        placeholder: "Add grid item",
      },
    ],
  },

  {
    id: "css-responsive-viewport",
    label: "Responsive Viewport",
    category: "css",
    description:
      "Shrinks a simulated browser viewport and shows a media query reflowing the layout.",
    defaultProps: {
      breakpoint: 700,
    },
    fields: [
      {
        name: "breakpoint",
        label: "Breakpoint",
        type: "number",
        required: true,
      },
    ],
  },

  {
    id: "css-motion-timeline",
    label: "Motion Timeline",
    category: "css",
    description:
      "Compares instant state changes with smooth CSS transitions and visualizes duration and easing.",
    defaultProps: {
      label: "Launch Project",
      distance: 18,
      duration: 0.35,
    },
    fields: [
      {
        name: "label",
        label: "Button Label",
        type: "text",
        placeholder: "Launch Project",
        required: true,
      },
      {
        name: "distance",
        label: "Movement Distance",
        type: "number",
        required: true,
      },
      {
        name: "duration",
        label: "Transition Duration",
        type: "number",
        required: true,
      },
    ],
  },

  /* ====================================================== */
  /* JAVASCRIPT */
  /* ====================================================== */

  {
    id: "js-intro-engine",
    label: "JavaScript Runtime",
    category: "javascript",
    description:
      "Shows how a user action enters the JavaScript runtime, executes logic, updates the DOM, and changes the visible page.",
    defaultProps: {
      buttonText: "Activate",
      initialMessage: "Waiting for JavaScript...",
      updatedMessage: "JavaScript is working!",
      eventName: "click",
    },
    fields: [
      {
        name: "buttonText",
        label: "Button Text",
        type: "text",
        placeholder: "Activate",
        required: true,
      },
      {
        name: "initialMessage",
        label: "Initial Message",
        type: "text",
        placeholder: "Waiting for JavaScript...",
        required: true,
      },
      {
        name: "updatedMessage",
        label: "Updated Message",
        type: "text",
        placeholder: "JavaScript is working!",
        required: true,
      },
      {
        name: "eventName",
        label: "Event Name",
        type: "text",
        placeholder: "click",
        required: true,
      },
    ],
  },

  {
    id: "js-variable-memory",
    label: "Variable Memory",
    category: "javascript",
    description:
      "Visualizes a JavaScript variable storing a value and then being updated in memory.",
    defaultProps: {
      variableName: "score",
      initialValue: 10,
      updatedValue: 25,
      declaration: "let",
    },
    fields: [
      {
        name: "variableName",
        label: "Variable Name",
        type: "text",
        placeholder: "score",
        required: true,
      },
      {
        name: "initialValue",
        label: "Initial Value",
        type: "number",
        required: true,
      },
      {
        name: "updatedValue",
        label: "Updated Value",
        type: "number",
        required: true,
      },
      {
        name: "declaration",
        label: "Declaration",
        type: "select",
        required: true,
        options: [
          {
            label: "let",
            value: "let",
          },
          {
            label: "const",
            value: "const",
          },
        ],
      },
    ],
  },

  {
    id: "js-data-type-scanner",
    label: "Data Type Scanner",
    category: "javascript",
    description:
      "Scans JavaScript values and identifies strings, numbers, and booleans.",
    defaultProps: {
      stringValue: "CodeLand",
      numberValue: 42,
      booleanValue: true,
    },
    fields: [
      {
        name: "stringValue",
        label: "String Value",
        type: "text",
        placeholder: "CodeLand",
        required: true,
      },
      {
        name: "numberValue",
        label: "Number Value",
        type: "number",
        required: true,
      },
      {
        name: "booleanValue",
        label: "Boolean Value",
        type: "boolean",
        required: true,
      },
    ],
  },

  {
    id: "js-condition-gate",
    label: "Condition Gate",
    category: "javascript",
    description:
      "Visualizes an if condition comparing values and choosing the correct execution path.",
    defaultProps: {
      score: 12,
      threshold: 10,
      successText: "Level complete!",
      failText: "Keep going!",
    },
    fields: [
      {
        name: "score",
        label: "Score",
        type: "number",
        required: true,
      },
      {
        name: "threshold",
        label: "Threshold",
        type: "number",
        required: true,
      },
      {
        name: "successText",
        label: "Success Text",
        type: "text",
        placeholder: "Level complete!",
        required: true,
      },
      {
        name: "failText",
        label: "Fail Text",
        type: "text",
        placeholder: "Keep going!",
        required: true,
      },
    ],
  },

  {
    id: "js-loop-runner",
    label: "Loop Runner",
    category: "javascript",
    description:
      "Shows a JavaScript loop moving through repeated iterations and updating its counter.",
    defaultProps: {
      start: 1,
      end: 5,
      variableName: "i",
    },
    fields: [
      {
        name: "start",
        label: "Start",
        type: "number",
        required: true,
      },
      {
        name: "end",
        label: "End",
        type: "number",
        required: true,
      },
      {
        name: "variableName",
        label: "Counter Variable",
        type: "text",
        placeholder: "i",
        required: true,
      },
    ],
  },

  {
    id: "js-function-engine",
    label: "Function Engine",
    category: "javascript",
    description:
      "Visualizes an argument entering a JavaScript function, being processed, and producing a returned value.",
    defaultProps: {
      functionName: "greet",
      parameterName: "name",
      argumentValue: "CodeLand",
      returnedValue: "Hello CodeLand",
    },
    fields: [
      {
        name: "functionName",
        label: "Function Name",
        type: "text",
        placeholder: "greet",
        required: true,
      },
      {
        name: "parameterName",
        label: "Parameter Name",
        type: "text",
        placeholder: "name",
        required: true,
      },
      {
        name: "argumentValue",
        label: "Argument Value",
        type: "text",
        placeholder: "CodeLand",
        required: true,
      },
      {
        name: "returnedValue",
        label: "Returned Value",
        type: "text",
        placeholder: "Hello CodeLand",
        required: true,
      },
    ],
  },

  {
    id: "js-array-vault",
    label: "Array Vault",
    category: "javascript",
    description:
      "Visualizes an array as indexed storage slots and highlights how JavaScript accesses a value by index.",
    defaultProps: {
      arrayName: "colors",
      items: ["red", "blue", "green"],
      selectedIndex: 0,
    },
    fields: [
      {
        name: "arrayName",
        label: "Array Name",
        type: "text",
        placeholder: "colors",
        required: true,
      },
      {
        name: "items",
        label: "Array Items",
        type: "string-list",
        minimum: 1,
        maximum: 8,
        required: true,
        placeholder: "Add array item",
      },
      {
        name: "selectedIndex",
        label: "Selected Index",
        type: "number",
        required: true,
      },
    ],
  },

  {
    id: "js-object-builder",
    label: "Object Builder",
    category: "javascript",
    description:
      "Visualizes a JavaScript object as a collection of named properties and highlights property access.",
    defaultProps: {
      objectName: "player",
      properties: {
        name: "Alex",
        level: 5,
        online: true,
      },
      selectedProperty: "level",
    },
    fields: [
      {
        name: "objectName",
        label: "Object Name",
        type: "text",
        placeholder: "player",
        required: true,
      },
      {
        name: "selectedProperty",
        label: "Selected Property",
        type: "text",
        placeholder: "level",
        required: true,
      },
    ],
  },

  {
    id: "js-event-pulse",
    label: "Event Pulse",
    category: "javascript",
    description:
      "Shows a browser event firing, reaching an event listener, and triggering JavaScript logic.",
    defaultProps: {
      eventName: "click",
      buttonLabel: "Launch",
      message: "Button clicked!",
    },
    fields: [
      {
        name: "eventName",
        label: "Event Name",
        type: "text",
        placeholder: "click",
        required: true,
      },
      {
        name: "buttonLabel",
        label: "Button Label",
        type: "text",
        placeholder: "Launch",
        required: true,
      },
      {
        name: "message",
        label: "Result Message",
        type: "text",
        placeholder: "Button clicked!",
        required: true,
      },
    ],
  },

  {
    id: "js-dom-runtime",
    label: "DOM Runtime",
    category: "javascript",
    description:
      "Shows JavaScript selecting a DOM element and updating the content displayed in the browser.",
    defaultProps: {
      selector: "#message",
      initialText: "Waiting for JavaScript...",
      updatedText: "JavaScript is working!",
    },
    fields: [
      {
        name: "selector",
        label: "Selector",
        type: "text",
        placeholder: "#message",
        required: true,
      },
      {
        name: "initialText",
        label: "Initial Text",
        type: "text",
        placeholder: "Waiting for JavaScript...",
        required: true,
      },
      {
        name: "updatedText",
        label: "Updated Text",
        type: "text",
        placeholder: "JavaScript is working!",
        required: true,
      },
    ],
  },

  /* ====================================================== */
  /* REACT */
  /* ====================================================== */

  {
    id: "react-intro-nexus",
    label: "React Nexus Introduction",
    category: "react",
    description:
      "Shows how React breaks a large interface into reusable components and composes them into a complete application.",
    defaultProps: {
      appName: "CodeLand App",
      components: ["Header", "ProfileCard", "ActionButton"],
      reusableComponent: "ActionButton",
    },
    fields: [
      {
        name: "appName",
        label: "App Name",
        type: "text",
        required: true,
      },
      {
        name: "components",
        label: "Components",
        type: "string-list",
        minimum: 1,
        maximum: 5,
        required: true,
      },
      {
        name: "reusableComponent",
        label: "Reusable Component",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-jsx-transform",
    label: "JSX Transformation",
    category: "react",
    description:
      "Shows JavaScript values entering JSX and React turning JSX into visible interface output.",
    defaultProps: {
      variableName: "name",
      variableValue: "Maya",
      element: "h2",
    },
    fields: [
      {
        name: "variableName",
        label: "Variable",
        type: "text",
        required: true,
      },
      {
        name: "variableValue",
        label: "Value",
        type: "text",
        required: true,
      },
      {
        name: "element",
        label: "Element",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-component-tree",
    label: "Component Tree",
    category: "react",
    description:
      "Shows a parent component being divided into smaller reusable child components.",
    defaultProps: {
      rootComponent: "Profile",
      childComponents: ["Avatar", "PlayerInfo", "Badge"],
      repeatedComponent: "Badge",
    },
    fields: [
      {
        name: "rootComponent",
        label: "Root Component",
        type: "text",
        required: true,
      },
      {
        name: "childComponents",
        label: "Child Components",
        type: "string-list",
        minimum: 1,
        maximum: 5,
        required: true,
      },
      {
        name: "repeatedComponent",
        label: "Reusable Component",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-props-flow",
    label: "Props Flow",
    category: "react",
    description:
      "Visualizes one-way data flow from a parent component into a child through props.",
    defaultProps: {
      parentName: "App",
      childName: "PlayerCard",
      propName: "name",
      propValue: "Lina",
    },
    fields: [
      {
        name: "parentName",
        label: "Parent Component",
        type: "text",
        required: true,
      },
      {
        name: "childName",
        label: "Child Component",
        type: "text",
        required: true,
      },
      {
        name: "propName",
        label: "Prop Name",
        type: "text",
        required: true,
      },
      {
        name: "propValue",
        label: "Prop Value",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-state-core",
    label: "State Core",
    category: "react",
    description:
      "Shows useState storing data, a setter updating it, and React re-rendering the interface.",
    defaultProps: {
      stateName: "count",
      setterName: "setCount",
      initialValue: 0,
      updatedValue: 1,
    },
    fields: [
      {
        name: "stateName",
        label: "State Name",
        type: "text",
        required: true,
      },
      {
        name: "setterName",
        label: "Setter Name",
        type: "text",
        required: true,
      },
      {
        name: "initialValue",
        label: "Initial Value",
        type: "number",
        required: true,
      },
      {
        name: "updatedValue",
        label: "Updated Value",
        type: "number",
        required: true,
      },
    ],
  },

  {
    id: "react-event-pulse",
    label: "React Event Pulse",
    category: "react",
    description:
      "Shows a user interaction firing a React event and executing its event handler.",
    defaultProps: {
      eventName: "onClick",
      handlerName: "handleClick",
      buttonLabel: "Activate",
      resultMessage: "Activated!",
    },
    fields: [
      {
        name: "eventName",
        label: "Event",
        type: "text",
        required: true,
      },
      {
        name: "handlerName",
        label: "Handler",
        type: "text",
        required: true,
      },
      {
        name: "buttonLabel",
        label: "Button Label",
        type: "text",
        required: true,
      },
      {
        name: "resultMessage",
        label: "Result Message",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-conditional-branch",
    label: "Conditional Branch",
    category: "react",
    description:
      "Visualizes React evaluating a condition and rendering one of two UI branches.",
    defaultProps: {
      conditionName: "online",
      conditionValue: true,
      trueText: "Online",
      falseText: "Offline",
    },
    fields: [
      {
        name: "conditionName",
        label: "Condition",
        type: "text",
        required: true,
      },
      {
        name: "conditionValue",
        label: "Condition Value",
        type: "boolean",
        required: true,
      },
      {
        name: "trueText",
        label: "True Text",
        type: "text",
        required: true,
      },
      {
        name: "falseText",
        label: "False Text",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-list-map",
    label: "List Map",
    category: "react",
    description:
      "Shows an array moving through map and becoming a collection of rendered JSX elements.",
    defaultProps: {
      arrayName: "skills",
      items: ["HTML", "CSS", "JavaScript", "React"],
      element: "li",
    },
    fields: [
      {
        name: "arrayName",
        label: "Array Name",
        type: "text",
        required: true,
      },
      {
        name: "items",
        label: "Items",
        type: "string-list",
        minimum: 1,
        maximum: 8,
        required: true,
      },
      {
        name: "element",
        label: "Element",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-form-control",
    label: "Controlled Form",
    category: "react",
    description:
      "Shows a controlled React input synchronizing user input with component state.",
    defaultProps: {
      stateName: "username",
      setterName: "setUsername",
      initialValue: "",
      typedValue: "Alex",
      placeholder: "Explorer name",
    },
    fields: [
      {
        name: "stateName",
        label: "State Name",
        type: "text",
        required: true,
      },
      {
        name: "setterName",
        label: "Setter Name",
        type: "text",
        required: true,
      },
      {
        name: "initialValue",
        label: "Initial Value",
        type: "text",
      },
      {
        name: "typedValue",
        label: "Typed Value",
        type: "text",
        required: true,
      },
      {
        name: "placeholder",
        label: "Placeholder",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-effect-sync",
    label: "Effect Sync",
    category: "react",
    description:
      "Shows rendering, commit, useEffect execution, and synchronization with an external system.",
    defaultProps: {
      componentName: "App",
      effectMessage: "Component ready",
      dependencyLabel: "[]",
    },
    fields: [
      {
        name: "componentName",
        label: "Component",
        type: "text",
        required: true,
      },
      {
        name: "effectMessage",
        label: "Effect Message",
        type: "text",
        required: true,
      },
      {
        name: "dependencyLabel",
        label: "Dependencies",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "react-composition-nexus",
    label: "Component Composition",
    category: "react",
    description:
      "Shows multiple focused components being composed into one complete parent interface.",
    defaultProps: {
      parentComponent: "Profile",
      components: ["Avatar", "PlayerInfo"],
    },
    fields: [
      {
        name: "parentComponent",
        label: "Parent Component",
        type: "text",
        required: true,
      },
      {
        name: "components",
        label: "Child Components",
        type: "string-list",
        minimum: 1,
        maximum: 6,
        required: true,
      },
    ],
  },

  {
    id: "react-reusable-ui",
    label: "Reusable UI",
    category: "react",
    description:
      "Shows one reusable component accepting data and behavior through props to create multiple interface instances.",
    defaultProps: {
      componentName: "ActionButton",
      labelProp: "label",
      actionProp: "onClick",
      instances: ["Explore", "Continue", "Launch"],
    },
    fields: [
      {
        name: "componentName",
        label: "Component",
        type: "text",
        required: true,
      },
      {
        name: "labelProp",
        label: "Label Prop",
        type: "text",
        required: true,
      },
      {
        name: "actionProp",
        label: "Action Prop",
        type: "text",
        required: true,
      },
      {
        name: "instances",
        label: "Instances",
        type: "string-list",
        minimum: 1,
        maximum: 6,
        required: true,
      },
    ],
  },
  /* ====================================================== */
  /* PROJECT SHOWCASE */
  /* ====================================================== */

  {
    id: "project-creator-profile",
    label: "Creator Profile Assembly",
    category: "project",
    description:
      "Shows reusable React components assembling into a polished creator profile interface.",
    defaultProps: {
      creatorName: "Alex",
      role: "Frontend Explorer",
      skills: ["HTML", "CSS", "JavaScript", "React"],
      projectName: "CodeLand Dashboard",
    },
    fields: [
      {
        name: "creatorName",
        label: "Creator Name",
        type: "text",
        placeholder: "Alex",
        required: true,
      },
      {
        name: "role",
        label: "Creator Role",
        type: "text",
        placeholder: "Frontend Explorer",
        required: true,
      },
      {
        name: "skills",
        label: "Skills",
        type: "string-list",
        minimum: 1,
        maximum: 6,
        required: true,
        placeholder: "Add skill",
      },
      {
        name: "projectName",
        label: "Featured Project",
        type: "text",
        placeholder: "CodeLand Dashboard",
        required: true,
      },
    ],
  },

  {
    id: "project-quiz-engine",
    label: "Quiz Engine Flow",
    category: "project",
    description:
      "Visualizes quiz data moving through events, state, scoring logic, and the final result interface.",
    defaultProps: {
      question: "Which language styles a webpage?",
      answers: ["HTML", "CSS", "JavaScript"],
      correctAnswer: "CSS",
      score: 1,
      total: 1,
    },
    fields: [
      {
        name: "question",
        label: "Question",
        type: "text",
        required: true,
      },
      {
        name: "answers",
        label: "Answers",
        type: "string-list",
        minimum: 2,
        maximum: 6,
        required: true,
      },
      {
        name: "correctAnswer",
        label: "Correct Answer",
        type: "text",
        required: true,
      },
      {
        name: "score",
        label: "Score",
        type: "number",
        required: true,
      },
      {
        name: "total",
        label: "Total",
        type: "number",
        required: true,
      },
    ],
  },

  {
    id: "project-mission-dashboard",
    label: "Mission Dashboard System",
    category: "project",
    description:
      "Shows mission data moving through filter state and derived data before becoming a dashboard interface.",
    defaultProps: {
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
    fields: [
      {
        name: "activeFilter",
        label: "Active Filter",
        type: "text",
        required: true,
      },
    ],
  },

  {
    id: "project-product-launch",
    label: "Product Launch System",
    category: "project",
    description:
      "Shows product sections assembling into a complete responsive visual launch experience.",
    defaultProps: {
      productName: "Nova",
      headline: "Build faster. Launch smarter.",
      sections: ["Hero", "Features", "Proof", "CTA"],
    },
    fields: [
      {
        name: "productName",
        label: "Product Name",
        type: "text",
        placeholder: "Nova",
        required: true,
      },
      {
        name: "headline",
        label: "Headline",
        type: "text",
        placeholder: "Build faster. Launch smarter.",
        required: true,
      },
      {
        name: "sections",
        label: "Page Sections",
        type: "string-list",
        minimum: 2,
        maximum: 8,
        required: true,
        placeholder: "Add section",
      },
    ],
  },

  {
    id: "project-explorer-hub",
    label: "Explorer Hub Product Flow",
    category: "project",
    description:
      "Visualizes goals, filtering, derived state, and reusable UI working together as a complete mini product.",
    defaultProps: {
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
    fields: [
      {
        name: "filter",
        label: "Goal Filter",
        type: "text",
        placeholder: "All",
        required: true,
      },
    ],
  },

  {
    id: "project-final-portfolio",
    label: "Portfolio Command Center",
    category: "project",
    description:
      "Brings completed projects together into a final portfolio and visualizes the final CodeLand deployment.",
    defaultProps: {
      creatorName: "Alex",
      projects: [
        "Creator Profile",
        "Quiz Engine",
        "Mission Dashboard",
        "Product Launch",
        "Explorer Hub",
      ],
    },
    fields: [
      {
        name: "creatorName",
        label: "Creator Name",
        type: "text",
        placeholder: "Alex",
        required: true,
      },
      {
        name: "projects",
        label: "Projects",
        type: "string-list",
        minimum: 1,
        maximum: 8,
        required: true,
        placeholder: "Add project",
      },
    ],
  },
];

/* ====================================================== */
/* LOOKUP */
/* ====================================================== */

export const ANIMATION_TEMPLATES_BY_ID = Object.fromEntries(
  ANIMATION_TEMPLATES.map((template) => [template.id, template]),
);

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

export function getAnimationTemplate(templateId) {
  if (!templateId) {
    return null;
  }

  return ANIMATION_TEMPLATES_BY_ID[templateId] || null;
}

export function getAnimationTemplatesByCategory(category) {
  if (!category) {
    return ANIMATION_TEMPLATES;
  }

  return ANIMATION_TEMPLATES.filter(
    (template) => template.category === category,
  );
}

export function createAnimationConfig(templateId, props = {}) {
  const template = getAnimationTemplate(templateId);

  if (!template) {
    return null;
  }

  return {
    type: "animation",
    template: template.id,
    props: {
      ...template.defaultProps,
      ...props,
    },
  };
}

export default ANIMATION_TEMPLATES;
