import { useEffect, useRef, useState } from "react";

import Navbar from "../../components/Navbar/Navbar";
import Robot from "../../components/Robot/Robot";
import WhyCodeLand from "../../components/WhyCodeLand/WhyCodeLand";
import LearningPaths from "../../components/LearningPaths/LearningPaths";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Footer from "../../components/Footer/Footer";
import Reveal from "../../components/Reveal/Reveal";

import { Link } from "react-router-dom";

import styles from "./Home.module.css";

function Home() {
  /*
    هاد العنصر رح يكون مكان الروبوت الأصلي
    جوّا الـ Hero.
  */
  const robotAnchorRef = useRef(null);

  /*
    موقع وحجم الروبوت الحالي حسب الـ scroll.
  */
  const [robotStyle, setRobotStyle] = useState(null);

  useEffect(() => {
    let frameId = null;

    const updateRobotPosition = () => {
      const anchor = robotAnchorRef.current;

      if (!anchor) return;

      /*
        مكان الـ Anchor الحالي بالنسبة للشاشة.

        بما إن الـ Anchor موجود بشكل طبيعي
        داخل الـ Hero، رح يطلع لفوق مع الصفحة
        لما نعمل scroll.
      */
      const rect = anchor.getBoundingClientRect();

      /*
        قديش Scroll بدنا حتى الروبوت
        يوصل بشكل كامل للزاوية.

        إذا بدك الحركة أطول وأبطأ:
        زيد 1.15 مثلاً لـ 1.4

        إذا بدك أسرع:
        خليه 0.8
      */
      const travelDistance = window.innerHeight * 1.15;

      /*
        progress دائماً بين 0 و 1
      */
      const progress = Math.min(
        Math.max(window.scrollY / travelDistance, 0),
        1,
      );

      /*
        الحجم النهائي للروبوت
        لما يوصل للزاوية.
      */
      const isMobile = window.innerWidth <= 700;

      const finalWidth = isMobile ? 145 : 210;

      const finalHeight = isMobile ? 170 : 240;

      /*
        المسافة النهائية عن طرف الشاشة.
      */
      const finalRight = isMobile ? 8 : 18;

      const finalBottom = isMobile ? 8 : 14;

      /*
        تحويل right / bottom
        إلى left / top.
      */
      const finalLeft = window.innerWidth - finalWidth - finalRight;

      const finalTop = window.innerHeight - finalHeight - finalBottom;

      /*
        المكان الطبيعي للروبوت الحالي.

        لو ما كان عم يتحول للزاوية،
        كان لازم يكون بنفس مكان الـ Anchor.
      */
      const startLeft = rect.left;
      const startTop = rect.top;
      const startWidth = rect.width;
      const startHeight = rect.height;

      /*
        interpolation

        progress = 0
        → مكانه الأصلي

        progress = 0.5
        → نص الطريق

        progress = 1
        → الزاوية
      */

      const left = startLeft + (finalLeft - startLeft) * progress;

      const top = startTop + (finalTop - startTop) * progress;

      const width = startWidth + (finalWidth - startWidth) * progress;

      const height = startHeight + (finalHeight - startHeight) * progress;

      setRobotStyle({
        left,
        top,
        width,
        height,
        progress,
      });
    };

    const requestUpdate = () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(updateRobotPosition);
    };

    /*
      أول مرة الصفحة تفتح.
    */
    requestUpdate();

    window.addEventListener("scroll", requestUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);

      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <main className={styles.home}>
      <Navbar />

      {/* ================================= */}
      {/* HERO */}
      {/* ================================= */}

      <section className={styles.hero} id="home">
        {/* Floating Programming Icons */}

        <div className={styles.floatingIcons}>
          <span className={styles.icon1}>{"</>"}</span>

          <span className={styles.icon2}>{"{}"}</span>

          <span className={styles.icon3}>JS</span>

          <span className={styles.icon4}>PY</span>

          <span className={styles.icon5}>{"()"}</span>

          <span className={styles.icon6}>01</span>

          <span className={styles.icon7}>{"<>"}</span>

          <span className={styles.icon8}>CSS</span>

          <span className={styles.icon9}>{"=>"}</span>

          <span className={styles.icon10}>#</span>
        </div>

        <div className={styles.container}>
          {/* ================================= */}
          {/* LEFT CONTENT */}
          {/* ================================= */}

          <div className={styles.content}>
            <span className={styles.badge}>
              Interactive Coding for Young Minds
            </span>

            <h1 className={styles.title}>
              Learn to Code.
              <span> Build Your Future.</span>
            </h1>

            <p className={styles.description}>
              CodeLand makes programming fun, interactive, and practical through
              challenges, real projects, and smart learning experiences.
            </p>

            <div className={styles.actions}>
              <Link to="/register" className={styles.primaryButton}>
                <span>🚀</span>
                Start Learning
              </Link>

              <Link to="/courses" className={styles.secondaryButton}>
                <span>🧭</span>
                Explore Courses
              </Link>
            </div>

            {/* Stats */}

            <div className={styles.stats}>
              <div>
                <strong>10+</strong>
                <span>Courses</span>
              </div>

              <div>
                <strong>50+</strong>
                <span>Challenges</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Interactive</span>
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* ROBOT AREA */}
          {/* ================================= */}

          <div className={styles.robotArea}>
            {/*
              الـ glow بيضل هون دائماً.
              ما بيتحرك مع الروبوت.
            */}

            <div className={styles.glow}></div>

            {/*
              هاد بس مكان مرجعي.

              ما فيه Robot فعلي.
              الروبوت الحقيقي تحت منفصل.
            */}

            <div ref={robotAnchorRef} className={styles.robotAnchor}></div>
          </div>
        </div>

        {/* ================================= */}
        {/* MOVING ROBOT */}
        {/* ================================= */}

        {robotStyle && (
          <div
            className={styles.robotMover}
            style={{
              left: `${robotStyle.left}px`,
              top: `${robotStyle.top}px`,
              width: `${robotStyle.width}px`,
              height: `${robotStyle.height}px`,
            }}
          >
            <Robot />
          </div>
        )}
      </section>

      {/* ================================= */}
      {/* WHY CODELAND */}
      {/* ================================= */}

      <Reveal direction="up">
        <WhyCodeLand />
      </Reveal>

      {/* ================================= */}
      {/* LEARNING PATHS */}
      {/* ================================= */}

      <Reveal direction="up">
        <LearningPaths />
      </Reveal>

      {/* ================================= */}
      {/* HOW IT WORKS */}
      {/* ================================= */}

      <Reveal direction="up">
        <HowItWorks />
      </Reveal>

      {/* ================================= */}
      {/* FOOTER */}
      {/* ================================= */}

      <Footer />
    </main>
  );
}

export default Home;
