import { useEffect } from "react";
import { getUser } from "../services/learningHub";
import {
  createActiveTimeCounter,
  isStudentUser,
  isTrackedPath,
  REPORT_EVERY_SECONDS,
  reportStudyTime,
} from "../services/studyTimeTracker";

const INPUT_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart"];

/**
 * Counts a signed-in student's real time on lesson and challenge pages: only while the tab is
 * visible and focused and the student has used mouse, keyboard, scroll or touch recently.
 */
export default function useStudyTimeTracker(pathname) {
  const tracked = isTrackedPath(pathname);

  useEffect(() => {
    if (!tracked || !isStudentUser(getUser()) || !localStorage.getItem("codeland_token")) {
      return undefined;
    }

    const counter = createActiveTimeCounter();
    const flush = (keepalive) => {
      const seconds = counter.take();
      if (seconds > 0) reportStudyTime(seconds, { keepalive });
    };

    const onInput = () => counter.interact();
    // Capture phase so scrolling inside panels and editors counts too.
    INPUT_EVENTS.forEach((type) => window.addEventListener(type, onInput, { passive: true, capture: true }));

    const timer = setInterval(() => {
      const inUse = document.visibilityState === "visible" && document.hasFocus();
      if (counter.tick(inUse) >= REPORT_EVERY_SECONDS) flush(false);
    }, 1000);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    const onPageHide = () => flush(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(timer);
      INPUT_EVENTS.forEach((type) => window.removeEventListener(type, onInput, { capture: true }));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      flush(true);
    };
  }, [tracked]);
}
