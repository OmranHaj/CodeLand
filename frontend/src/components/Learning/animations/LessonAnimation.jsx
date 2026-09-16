import { getAnimationDefinition } from "./animationRegistry";

function LessonAnimation({ animation }) {
  if (!animation?.template) {
    return null;
  }

  const definition = getAnimationDefinition(animation.template);

  if (!definition) {
    console.warn(
      `[CodeLand] Unknown animation template: ${animation.template}`,
    );

    return null;
  }

  const AnimationComponent = definition.component;

  const props = {
    ...definition.defaultProps,
    ...(animation.props || {}),
  };

  return (
    <div data-animation-template={definition.id}>
      <AnimationComponent {...props} />
    </div>
  );
}

export default LessonAnimation;
