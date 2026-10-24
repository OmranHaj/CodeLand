/** True when the student turned on "Reduce motion" in Settings or in their operating system. */
export function prefersReducedMotion() {
  return (
    document.documentElement.dataset.reducedMotion === "true" ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

/** Phones get more time in the timed games (typing code on a touch keyboard is slower). */
export const MOBILE_TIME_MULTIPLIER = 1.5;

export function isPhoneLike() {
  return window.matchMedia?.("(max-width: 767px) and (pointer: coarse)").matches === true;
}
