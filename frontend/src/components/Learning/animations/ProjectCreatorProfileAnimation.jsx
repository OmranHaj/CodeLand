import { useLayoutEffect, useRef } from "react";

import {
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Image,
  MonitorSmartphone,
  MousePointerClick,
  RotateCcw,
  Sparkles,
  UserRound,
} from "lucide-react";

import gsap from "gsap";

import styles from "./ProjectShowcaseAnimations.module.css";

function ProjectCreatorProfileAnimation({
  creatorName = "Alex",
  role = "Frontend Explorer",
  skills = ["HTML", "CSS", "JavaScript", "React"],
  projectName = "CodeLand Dashboard",
}) {
  const rootRef = useRef(null);

  const timelineRef = useRef(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    const context = gsap.context(() => {
      const frame = root.querySelector("[data-demo-frame]");

      const avatar = root.querySelector("[data-demo-avatar]");

      const identity = root.querySelector("[data-demo-identity]");

      const skillItems = root.querySelectorAll("[data-demo-skill]");

      const project = root.querySelector("[data-demo-project]");

      const action = root.querySelector("[data-demo-action]");

      const device = root.querySelector("[data-demo-device]");

      const requirements = root.querySelectorAll("[data-demo-requirement]");

      gsap.set(frame, {
        opacity: 0,
        y: 18,
        scale: 0.96,
      });

      gsap.set(avatar, {
        opacity: 0,
        scale: 0.5,
        rotation: -10,
      });

      gsap.set(identity, {
        opacity: 0,
        y: 10,
      });

      gsap.set(skillItems, {
        opacity: 0,
        y: 8,
        scale: 0.92,
      });

      gsap.set(project, {
        opacity: 0,
        y: 14,
        scale: 0.95,
      });

      gsap.set(action, {
        opacity: 0,
        y: 10,
      });

      gsap.set(device, {
        opacity: 0,
        scale: 0.8,
      });

      gsap.set(requirements, {
        opacity: 0,
        x: 12,
      });

      if (reducedMotion) {
        gsap.set(
          [
            frame,
            avatar,
            identity,
            skillItems,
            project,
            action,
            device,
            requirements,
          ],
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
          },
        );

        return;
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .to(frame, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
        })
        .to(
          avatar,
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.45,
            ease: "back.out(1.8)",
          },
          "-=0.18",
        )
        .to(
          identity,
          {
            opacity: 1,
            y: 0,
            duration: 0.35,
          },
          "-=0.18",
        )
        .to(skillItems, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
          stagger: 0.08,
        })
        .to(
          project,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.25)",
          },
          "-=0.05",
        )
        .to(
          action,
          {
            opacity: 1,
            y: 0,
            duration: 0.32,
          },
          "-=0.12",
        )
        .to(
          device,
          {
            opacity: 1,
            scale: 1,
            duration: 0.38,
            ease: "back.out(1.6)",
          },
          "-=0.05",
        )
        .to(
          requirements,
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.1,
          },
          "-=0.18",
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

  const requirementItems = [
    {
      icon: UserRound,
      label: "Profile",
      text: "Name, role and avatar",
    },

    {
      icon: BadgeCheck,
      label: "Skills",
      text: "Reusable skill badges",
    },

    {
      icon: BriefcaseBusiness,
      label: "Projects",
      text: "Reusable project cards",
    },

    {
      icon: MousePointerClick,
      label: "Action",
      text: "Clear primary CTA",
    },

    {
      icon: MonitorSmartphone,
      label: "Responsive",
      text: "Desktop and mobile",
    },
  ];

  return (
    <section ref={rootRef} className={styles.animation}>
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className={styles.topBar}>
        <div className={styles.identity}>
          <div className={styles.identityIcon}>
            <UserRound size={17} />
          </div>

          <div>
            <span>PROJECT DEMO</span>

            <strong>Creator Profile</strong>
          </div>
        </div>

        <button type="button" className={styles.replayButton} onClick={replay}>
          <RotateCcw size={13} />
          Replay
        </button>
      </div>

      {/* ================================================== */}
      {/* DEMO */}
      {/* ================================================== */}

      <div
        className={styles.stage}
        style={{
          padding: "28px 20px",
        }}
      >
        <div className={styles.gridBackground} />

        <div
          style={{
            position: "relative",

            zIndex: 2,

            display: "flex",

            flexWrap: "wrap",

            alignItems: "center",

            justifyContent: "center",

            gap: 24,

            width: "100%",
          }}
        >
          {/* ============================================== */}
          {/* MINI WEBSITE */}
          {/* ============================================== */}

          <div
            className={styles.previewShell}
            data-demo-frame
            style={{
              width: "min(430px, 100%)",

              flex: "1 1 360px",
            }}
          >
            <div className={styles.previewTop}>
              <div className={styles.previewDots}>
                <span />
                <span />
                <span />
              </div>

              <span>creator-profile.app</span>
            </div>

            <div
              className={styles.creatorPreview}
              style={{
                padding: "25px 22px",
              }}
            >
              {/* AVATAR */}

              <div className={styles.avatar} data-demo-avatar>
                {creatorName.slice(0, 1).toUpperCase()}
              </div>

              {/* NAME */}

              <div
                data-demo-identity
                style={{
                  textAlign: "center",
                }}
              >
                <span className={styles.previewEyebrow}>CREATOR PROFILE</span>

                <h3
                  style={{
                    marginBottom: 4,
                  }}
                >
                  {creatorName}
                </h3>

                <p
                  style={{
                    margin: "0 0 4px",
                  }}
                >
                  {role}
                </p>
              </div>

              {/* SKILLS */}

              <div
                className={styles.skillRow}
                style={{
                  marginTop: 10,
                }}
              >
                {skills.map((skill) => (
                  <span key={skill} data-demo-skill>
                    {skill}
                  </span>
                ))}
              </div>

              {/* FEATURED PROJECT */}

              <div
                className={styles.projectPreviewCard}
                data-demo-project
                style={{
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    gap: 9,
                  }}
                >
                  <div
                    style={{
                      display: "grid",

                      placeItems: "center",

                      width: 31,
                      height: 31,

                      borderRadius: 8,

                      color: "#ffcf5a",

                      background: "rgba(255,207,90,0.08)",
                    }}
                  >
                    <Image size={15} />
                  </div>

                  <div>
                    <span>FEATURED PROJECT</span>

                    <strong>{projectName}</strong>
                  </div>
                </div>

                <BriefcaseBusiness size={16} />
              </div>

              {/* CTA */}

              <button
                type="button"
                data-demo-action
                style={{
                  marginTop: 14,
                }}
              >
                View Projects
              </button>

              {/* RESPONSIVE HINT */}

              <div
                data-demo-device
                style={{
                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  gap: 6,

                  marginTop: 12,

                  color: "#6ee7ff",

                  fontSize: 7,

                  fontWeight: 900,

                  letterSpacing: "0.08em",
                }}
              >
                <MonitorSmartphone size={13} />
                RESPONSIVE DESKTOP → MOBILE
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* REQUIREMENT HINTS */}
          {/* ============================================== */}

          <div
            style={{
              flex: "0 1 230px",

              display: "grid",

              gap: 7,

              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",

                alignItems: "center",

                gap: 7,

                marginBottom: 3,

                color: "#ffcf5a",

                fontSize: 7,

                fontWeight: 900,

                letterSpacing: "0.1em",
              }}
            >
              <Sparkles size={13} />
              INCLUDE THESE
            </div>

            {requirementItems.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                data-demo-requirement
                style={{
                  display: "grid",

                  gridTemplateColumns: "31px 1fr",

                  gap: 9,

                  alignItems: "center",

                  padding: "9px 10px",

                  border: "1px solid rgba(255,255,255,0.07)",

                  borderRadius: 10,

                  background: "rgba(255,255,255,0.018)",
                }}
              >
                <div
                  style={{
                    display: "grid",

                    placeItems: "center",

                    width: 31,
                    height: 31,

                    borderRadius: 8,

                    color: "#ffcf5a",

                    background: "rgba(255,207,90,0.055)",
                  }}
                >
                  <Icon size={14} />
                </div>

                <div
                  style={{
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: "block",

                      color: "#e8ebf2",

                      fontSize: 8,
                    }}
                  >
                    {label}
                  </strong>

                  <span
                    style={{
                      display: "block",

                      marginTop: 2,

                      color: "#7f879a",

                      fontSize: 7,

                      lineHeight: 1.4,
                    }}
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}

            <div
              data-demo-requirement
              style={{
                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                gap: 6,

                marginTop: 2,

                padding: "9px 10px",

                border: "1px solid rgba(116,230,170,0.13)",

                borderRadius: 10,

                color: "#74e6aa",

                background: "rgba(116,230,170,0.035)",

                fontSize: 7,

                fontWeight: 900,

                letterSpacing: "0.08em",
              }}
            >
              <CheckCircle2 size={13} />
              THAT'S THE PROJECT
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* FOOTER */}
      {/* ================================================== */}

      <div className={styles.footer}>
        <span>PROFILE</span>

        <i />

        <span>SKILLS</span>

        <i />

        <span>PROJECTS</span>

        <i />

        <span>CTA</span>

        <i />

        <strong>RESPONSIVE</strong>
      </div>
    </section>
  );
}

export default ProjectCreatorProfileAnimation;
