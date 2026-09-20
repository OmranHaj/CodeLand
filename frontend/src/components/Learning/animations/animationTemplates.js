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
