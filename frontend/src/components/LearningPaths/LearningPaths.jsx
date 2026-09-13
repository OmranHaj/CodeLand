import { Code2, Terminal, Gamepad2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./LearningPaths.module.css";

function LearningPaths() {
  const paths = [
    {
      icon: <Code2 size={30} />,
      title: "Web Development",
      description:
        "Learn HTML, CSS, and JavaScript by building real interactive websites.",
      level: "Beginner",
    },
    {
      icon: <Terminal size={30} />,
      title: "Python Programming",
      description:
        "Start with programming logic, problem solving, and fun Python projects.",
      level: "Beginner",
    },
    {
      icon: <Gamepad2 size={30} />,
      title: "Game Development",
      description:
        "Learn coding concepts by creating simple games and interactive experiences.",
      level: "Beginner",
    },
  ];

  return (
    <section className={styles.section} id="courses">
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.badge}>Learning Paths</span>

          <h2>
            Choose Your
            <span> Path.</span>
          </h2>

          <p>
            Start with what excites you most and build your coding skills step
            by step through practical projects.
          </p>
        </div>

        <div className={styles.grid}>
          {paths.map((path) => (
            <article className={styles.card} key={path.title}>
              <div className={styles.cardTop}>
                <div className={styles.icon}>{path.icon}</div>

                <span className={styles.level}>{path.level}</span>
              </div>

              <h3>{path.title}</h3>

              <p>{path.description}</p>

              <Link to="/login" className={styles.pathButton}>
                Explore Path
                <ArrowRight size={17} />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LearningPaths;
