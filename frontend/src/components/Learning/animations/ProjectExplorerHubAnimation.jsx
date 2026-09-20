import { useLayoutEffect, useRef } from "react";
import {
  BarChart3,
  CheckCircle2,
  Filter,
  FormInput,
  ListTodo,
  PlusCircle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./ProjectShowcaseAnimations.module.css";

function ProjectExplorerHubAnimation({
  goals = [
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
  filter = "All",
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

  const completedGoals = goals.filter((goal) => goal.complete).length;

  return (
    <section ref={rootRef} className={styles.animation}>
      <div className={styles.topBar}>
        <div className={styles.identity}>
          <div className={styles.identityIcon}>
            <ListTodo size={17} />
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
              <FormInput size={17} />

              <div>
                <span>01 · GOAL FORM</span>
                <strong>Controlled inputs</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <PlusCircle size={16} />

              <div>
                <span>02 · CREATE GOALS</span>
                <strong>Add goal to state</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <CheckCircle2 size={16} />

              <div>
                <span>03 · COMPLETE GOALS</span>
                <strong>Toggle goal status</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Filter size={16} />

              <div>
                <span>04 · FILTERING</span>
                <strong>All / Active / Complete</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <BarChart3 size={16} />

              <div>
                <span>05 · DERIVED PROGRESS</span>
                <strong>Calculate completion</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <ListTodo size={16} />

              <div>
                <span>06 · REUSABLE UI</span>
                <strong>GoalList + GoalCard</strong>
              </div>
            </div>
          </div>

          <div className={styles.flowArrow}>
            <div className={styles.flowSignal} data-project-signal>
              <Sparkles size={13} />
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

              <span>explorer-hub.codeland</span>
            </div>

            <div className={styles.creatorPreview}>
              <div className={styles.avatar}>
                <ListTodo size={25} />
              </div>

              <span className={styles.previewEyebrow}>PROJECT TARGET</span>

              <h3>Explorer Hub</h3>

              <p>
                Build a complete mini product where users can create, complete,
                filter, and measure learning goals.
              </p>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>STATE</span>
                  <strong>goals[]</strong>
                </div>

                <ListTodo size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>FILTER</span>
                  <strong>{filter}</strong>
                </div>

                <Filter size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>PROGRESS</span>
                  <strong>
                    {completedGoals} / {goals.length} complete
                  </strong>
                </div>

                <BarChart3 size={16} />
              </div>

              {goals.map((goal) => (
                <div
                  key={goal.title}
                  className={styles.projectPreviewCard}
                  data-target-item
                >
                  <div>
                    <span>{goal.category}</span>

                    <strong>{goal.title}</strong>
                  </div>

                  {goal.complete ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <ListTodo size={16} />
                  )}
                </div>
              ))}

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
        <span>CREATE</span>
        <i />
        <span>STATE</span>
        <i />
        <span>FILTER</span>
        <i />
        <span>PROGRESS</span>
        <i />
        <strong>PRODUCT</strong>
      </div>
    </section>
  );
}

export default ProjectExplorerHubAnimation;
