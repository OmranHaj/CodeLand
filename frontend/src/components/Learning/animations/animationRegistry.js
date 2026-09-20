import HtmlBrowserRenderAnimation from "./HtmlBrowserRenderAnimation";
import HtmlElementAnimation from "./HtmlElementAnimation";
import HtmlDocumentStructureAnimation from "./HtmlDocumentStructureAnimation";
import HtmlLinksImagesAnimation from "./HtmlLinksImagesAnimation";
import HtmlListBuilderAnimation from "./HtmlListBuilderAnimation";
import HtmlFormFlowAnimation from "./HtmlFormFlowAnimation";

import CssIntroTransformationAnimation from "./CssIntroTransformationAnimation";
import CssColorReactorAnimation from "./CssColorReactorAnimation";
import CssTypographyLabAnimation from "./CssTypographyLabAnimation";
import CssBoxModelAnimation from "./CssBoxModelAnimation";
import CssFlexboxLayoutAnimation from "./CssFlexboxLayoutAnimation";
import CssGridBuilderAnimation from "./CssGridBuilderAnimation";
import CssResponsiveViewportAnimation from "./CssResponsiveViewportAnimation";
import CssMotionTimelineAnimation from "./CssMotionTimelineAnimation";

import { ANIMATION_TEMPLATES_BY_ID } from "./animationTemplates";

/* ====================================================== */
/* REACT COMPONENT REGISTRY */
/* ====================================================== */

export const ANIMATION_COMPONENTS = {
  /* ==================================================== */
  /* HTML */
  /* ==================================================== */

  "html-browser-render": HtmlBrowserRenderAnimation,

  "html-element": HtmlElementAnimation,

  "html-document-structure": HtmlDocumentStructureAnimation,

  "html-links-images": HtmlLinksImagesAnimation,

  "html-list-builder": HtmlListBuilderAnimation,

  "html-form-flow": HtmlFormFlowAnimation,

  /* ==================================================== */
  /* CSS */
  /* ==================================================== */

  "css-intro-transformation": CssIntroTransformationAnimation,

  "css-color-reactor": CssColorReactorAnimation,

  "css-typography-lab": CssTypographyLabAnimation,

  "css-box-model": CssBoxModelAnimation,

  "css-flexbox-layout": CssFlexboxLayoutAnimation,

  "css-grid-builder": CssGridBuilderAnimation,

  "css-responsive-viewport": CssResponsiveViewportAnimation,

  "css-motion-timeline": CssMotionTimelineAnimation,
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
    console.warn(
      `[CodeLand] Animation template is not fully registered: ${templateId}`,
    );

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
