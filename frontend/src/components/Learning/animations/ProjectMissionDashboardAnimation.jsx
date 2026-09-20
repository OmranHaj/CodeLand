import { useLayoutEffect, useRef } from "react";
import {
  BarChart3,
  CheckCircle2,
  Filter,
  LayoutDashboard,
  ListFilter,
  MousePointerClick,
  RotateCcw,
  SearchX,
  Sparkles,
} from "lucide-react";
import gsap from "gsap";

import styles from "./ProjectShowcaseAnimations.module.css";

function ProjectMissionDashboardAnimation({
  missions = [
    {
      title: "HTML Foundations",
      status: "Complete",
      progress: 100,
    },
    {
      title: "CSS Styling",
      status: "Active",
      progress: 72,
    },
    {
      title: "React Nexus",
      status: "Locked",
      progress: 0,
    },
  ],
  activeFilter = "All",
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
            <LayoutDashboard size={17} />
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
              <LayoutDashboard size={17} />

              <div>
                <span>01 · MISSION DATA</span>
                <strong>Reusable missions[]</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <BarChart3 size={16} />

              <div>
                <span>02 · DASHBOARD UI</span>
                <strong>Metrics + Mission Cards</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <Filter size={16} />

              <div>
                <span>03 · FILTER STATE</span>
                <strong>Filter by mission status</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <ListFilter size={16} />

              <div>
                <span>04 · DERIVED DATA</span>
                <strong>filteredMissions</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <MousePointerClick size={16} />

              <div>
                <span>05 · SELECTION</span>
                <strong>Inspect a mission</strong>
              </div>
            </div>

            <div className={styles.projectWire} data-project-wire />

            <div className={styles.projectNode} data-project-requirement>
              <SearchX size={16} />

              <div>
                <span>06 · EMPTY STATES</span>
                <strong>Handle no results</strong>
              </div>
            </div>
          </div>

          <div className={styles.flowArrow}>
            <div className={styles.flowSignal} data-project-signal>
              <Filter size={13} />
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

              <span>mission-dashboard.codeland</span>
            </div>

            <div className={styles.creatorPreview}>
              <div className={styles.avatar}>
                <LayoutDashboard size={25} />
              </div>

              <span className={styles.previewEyebrow}>PROJECT TARGET</span>

              <h3>Mission Dashboard</h3>

              <p>
                Build a responsive data-driven dashboard with filters,
                selection, progress, and stable empty states.
              </p>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>DATA SOURCE</span>
                  <strong>missions[]</strong>
                </div>

                <LayoutDashboard size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>ACTIVE FILTER</span>
                  <strong>{activeFilter}</strong>
                </div>

                <Filter size={16} />
              </div>

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>VISIBLE COUNT</span>
                  <strong>{missions.length} missions</strong>
                </div>

                <BarChart3 size={16} />
              </div>

              {missions.map((mission) => (
                <div
                  key={mission.title}
                  className={styles.projectPreviewCard}
                  data-target-item
                >
                  <div>
                    <span>{mission.status}</span>

                    <strong>
                      {mission.title} · {mission.progress}%
                    </strong>
                  </div>

                  {mission.progress === 100 ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <LayoutDashboard size={16} />
                  )}
                </div>
              ))}

              <div className={styles.projectPreviewCard} data-target-item>
                <div>
                  <span>EMPTY STATE</span>
                  <strong>No matching missions</strong>
                </div>

                <SearchX size={16} />
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
        <span>FILTER</span>
        <i />
        <span>DERIVED UI</span>
        <i />
        <span>SELECTION</span>
        <i />
        <strong>DASHBOARD</strong>
      </div>
    </section>
  );
}

export default ProjectMissionDashboardAnimation;
