import { useLayoutEffect, useRef } from "react";
import {
  Accessibility,
  Contact,
  FolderKanban,
  LayoutTemplate,
  MonitorSmartphone,
  RotateCcw,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import gsap from "gsap";

import styles from "./ProjectShowcaseAnimations.module.css";

function ProjectFinalPortfolioAnimation({
  creatorName = "Alex",
  projects = [
    "Creator Profile",
    "Quiz Engine",
    "Mission Dashboard",
    "Product Launch",
    "Explorer Hub",
  ],
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
            stagger: 0.09,
          },
          "-=0.28",
        )
        .to(
          finishBadge,
          {
            opacity: 1,
            scale: 1,
            duration: 0.42,
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
            <Trophy size={17} />
          </div>

          <div>
            <span>FINAL PROJECT BLUEPRINT</span>
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
              <UserRound size={17} />

              <div>
                <span>01 · PERSONAL INTRO</span>
                <strong>Name + Story + Role</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <FolderKanban size={16} />

              <div>
                <span>02 · PROJECT SHOWCASE</span>
                <strong>Your strongest work</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <LayoutTemplate size={16} />

              <div>
                <span>03 · REUSABLE SYSTEM</span>
                <strong>ProjectCard + Sections</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <MonitorSmartphone size={16} />

              <div>
                <span>04 · RESPONSIVE DESIGN</span>
                <strong>Mobile → Desktop</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Accessibility size={16} />

              <div>
                <span>05 · ACCESSIBILITY</span>
                <strong>Focus + Contrast + Motion</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Contact size={16} />

              <div>
                <span>06 · CONTACT ACTION</span>
                <strong>Clear next step</strong>
              </div>
            </div>
          </div>

          <div className={styles.flowArrow}>
            <div className={styles.flowSignal} data-project-signal>
              <Trophy size={13} />
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

              <span>portfolio.codeland</span>
            </div>

            <div className={styles.creatorPreview}>
              <div className={styles.avatar}>
                <Trophy size={25} />
              </div>

              <span className={styles.previewEyebrow}>
                FINAL PROJECT TARGET
              </span>

              <h3>Portfolio Command Center</h3>

              <p>
                Build a professional portfolio that introduces {creatorName},
                proves your frontend skills, and presents your strongest work.
              </p>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>IDENTITY</span>
                  <strong>{creatorName} · Frontend Creator</strong>
                </div>

                <UserRound size={16} />
              </div>

              {projects.map((project) => (
                <div
                  key={project}
                  className={styles.projectPreviewCard}
                  data-target-item
                >
                  <div>
                    <span>PROJECT</span>
                    <strong>{project}</strong>
                  </div>

                  <FolderKanban size={16} />
                </div>
              ))}

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>RESPONSIVE</span>
                  <strong>Mobile + Tablet + Desktop</strong>
                </div>

                <MonitorSmartphone size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>QUALITY PASS</span>
                  <strong>Accessibility + Content + Visual QA</strong>
                </div>

                <Accessibility size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>FINAL ACTION</span>
                  <strong>Contact / Explore Work</strong>
                </div>

                <Contact size={16} />
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
                READY FOR THE FINAL BUILD
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span>STORY</span>
        <i />
        <span>PROJECTS</span>
        <i />
        <span>RESPONSIVE</span>
        <i />
        <span>QUALITY</span>
        <i />
        <strong>PORTFOLIO</strong>
      </div>
    </section>
  );
}

export default ProjectFinalPortfolioAnimation;
