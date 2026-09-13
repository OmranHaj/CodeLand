import Navbar from "../../components/Navbar/Navbar";
import styles from "./Home.module.css";
import Robot from "../../components/Robot/Robot";
import WhyCodeLand from "../../components/WhyCodeLand/WhyCodeLand";
import LearningPaths from "../../components/LearningPaths/LearningPaths";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Footer from "../../components/Footer/Footer";
function Home() {
  return (
    <main className={styles.home}>
      <Navbar />

      <section className={styles.hero} id="home">
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
              <button className={styles.primaryButton}>
                <span>🚀</span>
                Start Learning
              </button>

              <button className={styles.secondaryButton}>
                <span>🧭</span>
                Explore Courses
              </button>
            </div>

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

          <div className={styles.robotArea}>
            <div className={styles.glow}></div>
            <div className={styles.robotViewer}>{/* <Robot /> */}</div>
          </div>
        </div>
      </section>
      <WhyCodeLand />
      <LearningPaths />
      <HowItWorks />
      <Footer />
    </main>
  );
}

export default Home;
