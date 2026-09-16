export const ANIMATION_TEMPLATES = [
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
