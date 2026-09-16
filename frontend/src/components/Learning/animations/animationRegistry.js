import HtmlBrowserRenderAnimation from "./HtmlBrowserRenderAnimation";
import HtmlElementAnimation from "./HtmlElementAnimation";
import HtmlDocumentStructureAnimation from "./HtmlDocumentStructureAnimation";
import HtmlLinksImagesAnimation from "./HtmlLinksImagesAnimation";
import HtmlListBuilderAnimation from "./HtmlListBuilderAnimation";
import HtmlFormFlowAnimation from "./HtmlFormFlowAnimation";

import { ANIMATION_TEMPLATES_BY_ID } from "./animationTemplates";

/* ====================================================== */
/* REACT COMPONENT REGISTRY */
/* ====================================================== */

export const ANIMATION_COMPONENTS = {
  "html-browser-render": HtmlBrowserRenderAnimation,

  "html-element": HtmlElementAnimation,

  "html-document-structure": HtmlDocumentStructureAnimation,

  "html-links-images": HtmlLinksImagesAnimation,

  "html-list-builder": HtmlListBuilderAnimation,

  "html-form-flow": HtmlFormFlowAnimation,
};

/* ====================================================== */
/* DEFINITION */
/* ====================================================== */

export function getAnimationDefinition(templateId) {
  if (!templateId) {
    return null;
  }

  const metadata = ANIMATION_TEMPLATES_BY_ID[templateId];

  const component = ANIMATION_COMPONENTS[templateId];

  if (!metadata || !component) {
    return null;
  }

  return {
    ...metadata,

    component,
  };
}

/* ====================================================== */
/* VALID TEMPLATE */
/* ====================================================== */

export function hasAnimationTemplate(templateId) {
  return Boolean(
    ANIMATION_TEMPLATES_BY_ID[templateId] && ANIMATION_COMPONENTS[templateId],
  );
}
