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

import JsIntroEngineAnimation from "./JsIntroEngineAnimation";
import JsVariableMemoryAnimation from "./JsVariableMemoryAnimation";
import JsDataTypeScannerAnimation from "./JsDataTypeScannerAnimation";
import JsConditionGateAnimation from "./JsConditionGateAnimation";
import JsLoopRunnerAnimation from "./JsLoopRunnerAnimation";
import JsFunctionEngineAnimation from "./JsFunctionEngineAnimation";
import JsArrayVaultAnimation from "./JsArrayVaultAnimation";
import JsObjectBuilderAnimation from "./JsObjectBuilderAnimation";
import JsEventPulseAnimation from "./JsEventPulseAnimation";
import JsDomRuntimeAnimation from "./JsDomRuntimeAnimation";

import ReactIntroNexusAnimation from "./ReactIntroNexusAnimation";
import ReactJsxTransformAnimation from "./ReactJsxTransformAnimation";
import ReactComponentTreeAnimation from "./ReactComponentTreeAnimation";
import ReactPropsFlowAnimation from "./ReactPropsFlowAnimation";
import ReactStateCoreAnimation from "./ReactStateCoreAnimation";
import ReactEventPulseAnimation from "./ReactEventPulseAnimation";
import ReactConditionalBranchAnimation from "./ReactConditionalBranchAnimation";
import ReactListMapAnimation from "./ReactListMapAnimation";
import ReactFormControlAnimation from "./ReactFormControlAnimation";
import ReactEffectSyncAnimation from "./ReactEffectSyncAnimation";
import ReactCompositionNexusAnimation from "./ReactCompositionNexusAnimation";
import ReactReusableUiAnimation from "./ReactReusableUiAnimation";

import ProjectCreatorProfileAnimation from "./ProjectCreatorProfileAnimation";
import ProjectQuizEngineAnimation from "./ProjectQuizEngineAnimation";
import ProjectMissionDashboardAnimation from "./ProjectMissionDashboardAnimation";
import ProjectProductLaunchAnimation from "./ProjectProductLaunchAnimation";
import ProjectExplorerHubAnimation from "./ProjectExplorerHubAnimation";
import ProjectFinalPortfolioAnimation from "./ProjectFinalPortfolioAnimation";

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

  /* ==================================================== */
  /* JAVASCRIPT */
  /* ==================================================== */

  "js-intro-engine": JsIntroEngineAnimation,
  "js-variable-memory": JsVariableMemoryAnimation,
  "js-data-type-scanner": JsDataTypeScannerAnimation,
  "js-condition-gate": JsConditionGateAnimation,
  "js-loop-runner": JsLoopRunnerAnimation,
  "js-function-engine": JsFunctionEngineAnimation,
  "js-array-vault": JsArrayVaultAnimation,
  "js-object-builder": JsObjectBuilderAnimation,
  "js-event-pulse": JsEventPulseAnimation,
  "js-dom-runtime": JsDomRuntimeAnimation,

  /* ==================================================== */
  /* REACT */
  /* ==================================================== */

  "react-intro-nexus": ReactIntroNexusAnimation,
  "react-jsx-transform": ReactJsxTransformAnimation,
  "react-component-tree": ReactComponentTreeAnimation,
  "react-props-flow": ReactPropsFlowAnimation,
  "react-state-core": ReactStateCoreAnimation,
  "react-event-pulse": ReactEventPulseAnimation,
  "react-conditional-branch": ReactConditionalBranchAnimation,
  "react-list-map": ReactListMapAnimation,
  "react-form-control": ReactFormControlAnimation,
  "react-effect-sync": ReactEffectSyncAnimation,
  "react-composition-nexus": ReactCompositionNexusAnimation,
  "react-reusable-ui": ReactReusableUiAnimation,

  /* ==================================================== */
  /* PROJECT SHOWCASE */
  /* ==================================================== */

  "project-creator-profile": ProjectCreatorProfileAnimation,
  "project-quiz-engine": ProjectQuizEngineAnimation,
  "project-mission-dashboard": ProjectMissionDashboardAnimation,
  "project-product-launch": ProjectProductLaunchAnimation,
  "project-explorer-hub": ProjectExplorerHubAnimation,
  "project-final-portfolio": ProjectFinalPortfolioAnimation,
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
