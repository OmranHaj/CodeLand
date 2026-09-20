import { useLayoutEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import gsap from "gsap";

import {
  Bot,
  Code2,
  Cpu,
  Terminal,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
} from "lucide-react";

import { learningPaths } from "../../data/learningPaths";

import styles from "./ChoosePath.module.css";

/* ====================================================== */
/* PATH ICONS */
/* ====================================================== */

const pathIcons = {
  "web-creator": Code2,
  "cpp-developer": Cpu,
  "python-explorer": Terminal,
};

/* ====================================================== */
/* C++ PATH */
/* ====================================================== */

const CPP_PATH = {
  id: "cpp-developer",

  eyebrow: "SYSTEMS · LOGIC · PERFORMANCE",

  title: "C++ Developer",

  description:
    "Master C++ from the fundamentals to object-oriented programming, data structures, the STL, and real high-performance projects.",

  skills: ["C++ Basics", "OOP", "STL"],

  estimatedJourney: "8 LEVELS",

  worldTitle: "C++ Core",

  worldDescription:
    "Enter a machine-powered world of logic, memory, algorithms, classes, and powerful systems built from the ground up.",

  difficulty: "BEGINNER → ADVANCED",

  accent: "#2f8cff",

  secondaryAccent: "#7be7ff",
};

const displayPaths = learningPaths.map((path, index) =>
  index === 1
    ? {
        ...path,
        ...CPP_PATH,
      }
    : path,
);

function getPathRoute(pathId) {
  if (pathId === "cpp-developer") {
    return "/student/cpp-world";
  }

  return "/student/world";
}

/* ====================================================== */
/* CURRENT USER */
/* ====================================================== */

function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem("codeland_current_user");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

/* ====================================================== */
/* COMPONENT */
/* ====================================================== */

function ChoosePath() {
  const navigate = useNavigate();

  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const guideRef = useRef(null);

  const cardsWrapperRef = useRef(null);

  const cardRefs = useRef([]);

  const selectionRef = useRef(null);

  const cursorAuraRef = useRef(null);

  const glowOneRef = useRef(null);

  const glowTwoRef = useRef(null);

  const starsRef = useRef(null);

  const portalOverlayRef = useRef(null);

  const portalRef = useRef(null);

  const portalContentRef = useRef(null);

  const [selectedPath, setSelectedPath] = useState(null);

  const [entering, setEntering] = useState(false);

  const currentUser = getCurrentUser();

  /* ====================================================== */
  /* PAGE INTRO */
  /* ====================================================== */

  useLayoutEffect(() => {
    if (!pageRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter(Boolean);

      gsap.set([headerRef.current, guideRef.current], {
        opacity: 0,
      });

      gsap.set(heroRef.current?.children || [], {
        opacity: 0,
        y: 40,
      });

      gsap.set(cards, {
        opacity: 0,
        y: 80,
        rotateX: 10,
        scale: 0.96,
        transformPerspective: 1200,
      });

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .fromTo(
          headerRef.current,
          {
            y: -24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
        )

        .to(
          heroRef.current?.children || [],
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
          },
          "-=0.35",
        )

        .fromTo(
          guideRef.current,
          {
            y: 20,
            opacity: 0,
            scale: 0.96,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
          },
          "-=0.4",
        )

        .to(
          cards,
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            scale: 1,
            duration: 1,
            stagger: 0.12,
            ease: "power4.out",
          },
          "-=0.28",
        );
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, []);

  /* ====================================================== */
  /* MOUSE PARALLAX */
  /* ====================================================== */

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (!page) {
      return;
    }

    const cursorAura = cursorAuraRef.current;

    const glowOne = glowOneRef.current;

    const glowTwo = glowTwoRef.current;

    const stars = starsRef.current;

    const cursorX = cursorAura
      ? gsap.quickTo(cursorAura, "x", {
          duration: 0.7,
          ease: "power3.out",
        })
      : null;

    const cursorY = cursorAura
      ? gsap.quickTo(cursorAura, "y", {
          duration: 0.7,
          ease: "power3.out",
        })
      : null;

    const handleMouseMove = (event) => {
      const normalizedX = event.clientX / window.innerWidth - 0.5;

      const normalizedY = event.clientY / window.innerHeight - 0.5;

      cursorX?.(event.clientX);

      cursorY?.(event.clientY);

      gsap.to(glowOne, {
        x: normalizedX * 55,
        y: normalizedY * 35,
        duration: 1.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(glowTwo, {
        x: normalizedX * -65,
        y: normalizedY * -45,
        duration: 2.2,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(stars, {
        x: normalizedX * 14,
        y: normalizedY * 10,
        duration: 2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* ====================================================== */
  /* SELECT PATH ANIMATION */
  /* ====================================================== */

  useLayoutEffect(() => {
    if (!selectedPath) {
      return;
    }

    const cards = cardRefs.current.filter(Boolean);

    cards.forEach((card, index) => {
      const path = displayPaths[index];

      const isSelected = path?.id === selectedPath.id;

      gsap.to(card, {
        y: isSelected ? -12 : 0,

        scale: isSelected ? 1.025 : 0.975,

        opacity: isSelected ? 1 : 0.48,

        duration: 0.55,

        ease: "power3.out",

        overwrite: "auto",
      });

      const visual = card.querySelector("[data-card-visual]");

      if (visual) {
        gsap.to(visual, {
          scale: isSelected ? 1.08 : 1,

          duration: 0.7,

          ease: "power3.out",
        });
      }
    });

    if (selectionRef.current) {
      gsap.fromTo(
        selectionRef.current,
        {
          opacity: 0,
          y: 28,
          scale: 0.985,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power4.out",
        },
      );
    }
  }, [selectedPath]);

  /* ====================================================== */
  /* CARD TILT */
  /* ====================================================== */

  const handleCardMove = (event, index) => {
    if (entering) {
      return;
    }

    if (window.innerWidth < 850) {
      return;
    }

    const card = cardRefs.current[index];

    if (!card) {
      return;
    }

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;

    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;

    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 4;

    const rotateX = ((centerY - y) / centerY) * 4;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      transformOrigin: "center center",
      duration: 0.35,
      ease: "power2.out",
      overwrite: "auto",
    });

    const glow = card.querySelector("[data-pointer-glow]");

    if (glow) {
      gsap.to(glow, {
        x: x - rect.width / 2,

        y: y - rect.height / 2,

        opacity: 1,

        duration: 0.3,

        ease: "power2.out",
      });
    }
  };

  const handleCardLeave = (index) => {
    const card = cardRefs.current[index];

    if (!card) {
      return;
    }

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.5)",
      overwrite: "auto",
    });

    const glow = card.querySelector("[data-pointer-glow]");

    if (glow) {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.35,
      });
    }
  };

  /* ====================================================== */
  /* SELECT PATH */
  /* ====================================================== */

  const handleSelectPath = (path) => {
    if (entering) {
      return;
    }

    setSelectedPath(path);
  };

  /* ====================================================== */
  /* ENTER WORLD */
  /* ====================================================== */

  const handleEnterWorld = () => {
    if (!selectedPath || entering) {
      return;
    }

    if (!currentUser?.id) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const storageKey = `codeland_active_path_${currentUser.id}`;

    localStorage.setItem(storageKey, selectedPath.id);

    localStorage.setItem("codeland_last_active_path", selectedPath.id);

    setEntering(true);

    const cards = cardRefs.current.filter(Boolean);

    const overlay = portalOverlayRef.current;

    const portal = portalRef.current;

    const portalContent = portalContentRef.current;

    gsap.set(overlay, {
      visibility: "visible",
      pointerEvents: "auto",
    });

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.inOut",
      },

      onComplete: () => {
        navigate(getPathRoute(selectedPath.id), {
          replace: true,

          state: {
            pathId: selectedPath.id,
          },
        });
      },
    });

    timeline
      .to([headerRef.current, heroRef.current, guideRef.current], {
        opacity: 0,
        y: -24,
        duration: 0.45,
        stagger: 0.04,
      })

      .to(
        cards,
        {
          opacity: 0,
          scale: 0.88,
          y: 70,
          duration: 0.55,
          stagger: 0.055,
          ease: "power3.in",
        },
        "-=0.35",
      )

      .to(
        selectionRef.current,
        {
          opacity: 0,
          y: 35,
          scale: 0.95,
          duration: 0.4,
        },
        "-=0.5",
      )

      .to(
        overlay,
        {
          opacity: 1,
          duration: 0.35,
        },
        "-=0.2",
      )

      .fromTo(
        portal,
        {
          scale: 0.15,
          opacity: 0,
          rotate: -35,
        },
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.7,
          ease: "back.out(1.8)",
        },
      )

      .fromTo(
        portalContent,
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        },
        "-=0.3",
      )

      .to(
        portal,
        {
          scale: 26,
          rotate: 100,
          duration: 1.25,
          ease: "power4.in",
        },
        "+=0.2",
      )

      .to(
        portalContent,
        {
          opacity: 0,
          scale: 1.1,
          duration: 0.3,
        },
        "-=0.55",
      );
  };

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <main
      ref={pageRef}
      className={`${styles.page} ${entering ? styles.entering : ""}`}
      style={{
        "--active-accent": selectedPath?.accent || "#7c5cff",

        "--active-secondary": selectedPath?.secondaryAccent || "#35c2ff",
      }}
    >
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className={styles.backgroundBase} />

      <div className={styles.backgroundGrid} />

      <div ref={starsRef} className={styles.stars} />

      <div ref={glowOneRef} className={styles.backgroundGlowOne} />

      <div ref={glowTwoRef} className={styles.backgroundGlowTwo} />

      <div className={styles.horizonGlow} />

      <div ref={cursorAuraRef} className={styles.cursorAura} />

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header ref={headerRef} className={styles.topBar}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => navigate("/")}
        >
          <span className={styles.logoIcon}>
            <Bot size={21} />
          </span>

          <span className={styles.logoText}>
            Code
            <strong>Land</strong>
          </span>
        </button>

        <div className={styles.headerCenter}>
          <span />

          <p>SELECT YOUR FIRST JOURNEY</p>

          <span />
        </div>

        <div className={styles.studentInfo}>
          <div>
            <span>PLAYER</span>

            <strong>{currentUser?.email?.split("@")[0] || "Student"}</strong>
          </div>

          <div className={styles.studentAvatar}>
            {currentUser?.email?.charAt(0)?.toUpperCase() || "S"}
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <section className={styles.content}>
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <div ref={heroRef} className={styles.hero}>
          <div className={styles.eyebrow}>
            <Sparkles size={13} />
            YOUR ADVENTURE STARTS HERE
          </div>

          <h1>
            Choose your
            <br />
            <span>coding destiny.</span>
          </h1>

          <p>
            Three worlds are waiting. Every journey teaches you to think, create
            and build differently.
          </p>
        </div>

        {/* ================================================= */}
        {/* GUIDE */}
        {/* ================================================= */}

        <div ref={guideRef} className={styles.robotMessage}>
          <div className={styles.guidePulse} />

          <div className={styles.robotBubbleIcon}>
            <Bot size={20} />
          </div>

          <div className={styles.guideText}>
            <span>CODELAND GUIDE</span>

            <p>Pick the world that excites you most.</p>
          </div>

          <div className={styles.guideStatus}>ONLINE</div>
        </div>

        {/* ================================================= */}
        {/* PATH CARDS */}
        {/* ================================================= */}

        <div ref={cardsWrapperRef} className={styles.pathsGrid}>
          {displayPaths.map((path, index) => {
            const Icon = pathIcons[path.id] || Code2;

            const isSelected = selectedPath?.id === path.id;

            return (
              <button
                ref={(element) => {
                  cardRefs.current[index] = element;
                }}
                key={path.id}
                type="button"
                className={`${styles.pathCard} ${
                  isSelected ? styles.selected : ""
                } ${path.id === "cpp-developer" ? styles.cppPathCard : ""}`}
                style={{
                  "--accent": path.accent || "#7c5cff",

                  "--secondary": path.secondaryAccent || "#35c2ff",
                }}
                onClick={() => handleSelectPath(path)}
                onMouseMove={(event) => handleCardMove(event, index)}
                onMouseLeave={() => handleCardLeave(index)}
                aria-pressed={isSelected}
              >
                {/* POINTER LIGHT */}

                <div data-pointer-glow className={styles.pointerGlow} />

                {/* DECORATION */}

                <div className={styles.cardNoise} />

                <div className={styles.cardGrid} />

                <div className={styles.cardTopGlow} />

                {/* TOP */}

                <div className={styles.cardTop}>
                  <span className={styles.pathNumber}>0{index + 1}</span>

                  <span className={styles.availability}>
                    <span />
                    AVAILABLE
                  </span>
                </div>

                {/* WORLD VISUAL */}

                <div data-card-visual className={styles.cardVisual}>
                  <div className={styles.visualHalo} />

                  <div className={styles.orbitRingOne} />

                  <div className={styles.orbitRingTwo} />

                  <div className={styles.visualNodeOne} />

                  <div className={styles.visualNodeTwo} />

                  <div className={styles.visualCore}>
                    {path.id === "cpp-developer" ? (
                      <span className={styles.cppMonogram}>C++</span>
                    ) : (
                      <Icon size={34} />
                    )}
                  </div>
                </div>

                {/* TEXT */}

                <span className={styles.pathEyebrow}>{path.eyebrow}</span>

                <h2>{path.title}</h2>

                <p className={styles.pathDescription}>{path.description}</p>

                {/* SKILLS */}

                <div className={styles.skills}>
                  {Array.isArray(path.skills) &&
                    path.skills
                      .slice(0, 3)
                      .map((skill) => <span key={skill}>{skill}</span>)}
                </div>

                {/* FOOTER */}

                <div className={styles.cardFooter}>
                  <div>
                    <small>JOURNEY</small>

                    <strong>{path.estimatedJourney}</strong>
                  </div>

                  <div className={styles.enterCircle}>
                    {isSelected ? (
                      <Check size={18} />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ================================================= */}
        {/* WORLD PREVIEW */}
        {/* ================================================= */}

        <div
          ref={selectionRef}
          className={`${styles.selectionPanel} ${
            selectedPath ? styles.selectionVisible : ""
          }`}
        >
          {selectedPath && (
            <>
              <div className={styles.selectionOrb}>
                <div className={styles.selectionRingOne} />

                <div className={styles.selectionRingTwo} />

                <div className={styles.worldOrb}>
                  <Globe size={33} />
                </div>
              </div>

              <div className={styles.selectionCopy}>
                <span>JOURNEY SELECTED</span>

                <h3>{selectedPath.worldTitle}</h3>

                <p>{selectedPath.worldDescription}</p>
              </div>

              <div className={styles.selectionMeta}>
                <div>
                  <span>DIFFICULTY</span>

                  <strong>{selectedPath.difficulty}</strong>
                </div>

                <div>
                  <span>WORLD SIZE</span>

                  <strong>{selectedPath.estimatedJourney}</strong>
                </div>
              </div>

              <button
                type="button"
                className={styles.enterButton}
                disabled={entering}
                onClick={handleEnterWorld}
              >
                <span>Enter World</span>

                <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </section>

      {/* ================================================= */}
      {/* PORTAL TRANSITION */}
      {/* ================================================= */}

      <div ref={portalOverlayRef} className={styles.portalOverlay}>
        <div className={styles.portalBackdrop} />

        <div ref={portalRef} className={styles.portal}>
          <div className={styles.portalOuter} />

          <div className={styles.portalMiddle} />

          <div className={styles.portalInner} />

          <div className={styles.portalCore} />
        </div>

        <div ref={portalContentRef} className={styles.portalContent}>
          <Bot size={27} />

          <span>ENTERING</span>

          <h2>{selectedPath?.worldTitle || "CodeLand"}</h2>

          <p>
            {selectedPath?.id === "cpp-developer"
              ? "INITIALIZING C++ CORE"
              : "INITIALIZING WORLD"}
          </p>
        </div>
      </div>
    </main>
  );
}

export default ChoosePath;
