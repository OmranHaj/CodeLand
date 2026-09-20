import { useLayoutEffect, useRef } from "react";
import {
  CheckCircle2,
  CircleHelp,
  Gauge,
  ListChecks,
  MousePointerClick,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import gsap from "gsap";

import styles from "./ProjectShowcaseAnimations.module.css";

function ProjectQuizEngineAnimation({
  question = "Which language styles a webpage?",
  answers = ["HTML", "CSS", "JavaScript"],
  correctAnswer = "CSS",
  score = 1,
  total = 1,
}) {
  const rootRef = useRef(null);
  const timelineRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    const context = gsap.context(() => {
      const requirements = root.querySelectorAll("[data-project-requirement]");

      const wires = root.querySelectorAll("[data-project-wire]");

      const signal = root.querySelector("[data-project-signal]");

      const target = root.querySelector("[data-project-target]");

      const targetItems = root.querySelectorAll("[data-target-item]");

      const finishBadge = root.querySelector("[data-project-finish]");

      gsap.set(requirements, {
        opacity: 0,
        x: -18,
        scale: 0.96,
      });

      gsap.set(wires, {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.set(signal, {
        opacity: 0,
        x: -24,
        scale: 0.9,
      });

      gsap.set(target, {
        opacity: 0,
        y: 20,
        scale: 0.95,
      });

      gsap.set(targetItems, {
        opacity: 0,
        y: 10,
      });

      gsap.set(finishBadge, {
        opacity: 0,
        scale: 0.8,
      });

      if (prefersReducedMotion) {
        gsap.set(requirements, {
          opacity: 1,
          x: 0,
          scale: 1,
        });

        gsap.set(wires, {
          scaleX: 1,
        });

        gsap.set(signal, {
          opacity: 1,
          x: 0,
          scale: 1,
        });

        gsap.set(target, {
          opacity: 1,
          y: 0,
          scale: 1,
        });

        gsap.set(targetItems, {
          opacity: 1,
          y: 0,
        });

        gsap.set(finishBadge, {
          opacity: 1,
          scale: 1,
        });

        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .to(requirements, {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.42,
          stagger: 0.15,
        })
        .to(
          wires,
          {
            scaleX: 1,
            duration: 0.34,
            stagger: 0.09,
          },
          "-=0.42",
        )
        .to(
          signal,
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.45,
            ease: "back.out(1.5)",
          },
          "-=0.12",
        )
        .to(
          target,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.58,
            ease: "back.out(1.2)",
          },
          "-=0.05",
        )
        .to(
          targetItems,
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
            stagger: 0.1,
          },
          "-=0.28",
        )
        .to(
          finishBadge,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.8)",
          },
          "-=0.04",
        );

      timelineRef.current = timeline;
    }, root);

    return () => {
      timelineRef.current?.kill();
      context.revert();
    };
  }, []);

  function replay() {
    timelineRef.current?.restart();
  }

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div className={styles.identity}>
          <div className={styles.identityIcon}>
            <CircleHelp size={17} />
          </div>

          <div>
            <span>PROJECT BLUEPRINT</span>
            <strong>What You Need To Build</strong>
          </div>
        </div>

        <button type="button" className={styles.replayButton} onClick={replay}>
          <RotateCcw size={13} />
          Replay
        </button>
      </div>

      <div className={styles.stage}>
        <div className={styles.gridBackground} />

        <div className={styles.profileFlow}>
          <div className={styles.componentColumn}>
            <div
              className={`${styles.projectNode} ${styles.primaryNode}`}
              data-project-requirement
            >
              <ListChecks size={17} />

              <div>
                <span>01 · QUESTION DATA</span>
                <strong>Reusable questions[]</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <CircleHelp size={16} />

              <div>
                <span>02 · QUESTION UI</span>
                <strong>Question + Answers</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <MousePointerClick size={16} />

              <div>
                <span>03 · ANSWER EVENTS</span>
                <strong>Handle answer click</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Zap size={16} />

              <div>
                <span>04 · QUIZ STATE</span>
                <strong>Question + Score</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Gauge size={16} />

              <div>
                <span>05 · PROGRESS</span>
                <strong>Current question status</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Trophy size={16} />

              <div>
                <span>06 · RESULT SCREEN</span>
                <strong>Score + Restart</strong>
              </div>
            </div>
          </div>

          <div className={styles.flowArrow}>
            <div className={styles.flowSignal} data-project-signal>
              <Zap size={13} />
              BUILD
            </div>

            <div className={styles.flowLine} />
          </div>

          <div className={styles.previewShell} data-project-target>
            <div className={styles.previewTop}>
              <div className={styles.previewDots}>
                <span />
                <span />
                <span />
              </div>

              <span>quiz-engine.codeland</span>
            </div>

            <div className={styles.creatorPreview}>
              <div className={styles.avatar}>
                <CircleHelp size={25} />
              </div>

              <span className={styles.previewEyebrow}>PROJECT TARGET</span>

              <h3>Quiz Engine</h3>

              <p>
                Build a complete restartable quiz with reliable scoring and
                clear progress.
              </p>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>QUESTION</span>
                  <strong>{question}</strong>
                </div>

                <CircleHelp size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>ANSWER OPTIONS</span>
                  <strong>{answers.join(" · ")}</strong>
                </div>

                <ListChecks size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>SCORING</span>
                  <strong>Correct: {correctAnswer}</strong>
                </div>

                <CheckCircle2 size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>STATE</span>
                  <strong>currentQuestion + score</strong>
                </div>

                <Zap size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>PROGRESS</span>
                  <strong>Question 1 of {total}</strong>
                </div>

                <Gauge size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>RESULT</span>
                  <strong>
                    Score {score} / {total}
                  </strong>
                </div>

                <Trophy size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>RESTART FLOW</span>
                  <strong>Reset quiz state</strong>
                </div>

                <RefreshCw size={16} />
              </div>

              <div
                data-project-finish
                style={{
                  width: "100%",
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 207, 90, 0.18)",
                  background: "rgba(255, 207, 90, 0.055)",
                  color: "#ffcf5a",
                  fontSize: 8,
                  fontWeight: 900,
                  letterSpacing: "0.08em",
                }}
              >
                <Sparkles size={13} />
                READY TO BUILD
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>DATA</span>
        <i />
        <span>EVENTS</span>
        <i />
        <span>STATE</span>
        <i />
        <span>PROGRESS</span>
        <i />
        <strong>RESULT</strong>
      </div>
    </section>
  );
}

export default ProjectQuizEngineAnimation;
