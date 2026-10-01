import { Code2, Terminal, Cpu, ArrowRight } from "lucide-react";
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
      icon: <Cpu size={30} />,
      title: "C++ Development",
      description:
        "Build powerful programs through logic, memory, and object-oriented design.",
      level: "Beginner",
    },
    /*
    // MOCK DATA: Commented out because Python is not in the database
    {
      icon: <Terminal size={30} />,
      title: "Python Programming",
      description:
        "Start with programming logic, problem solving, and fun Python projects.",
      level: "Beginner",
    },
    */
    {
      icon: <Terminal size={30} />,
      title: "Algorithm & Data Structures",
      description:
        "Master data structures, algorithms, search trees, and visual algorithmic problem solving.",
      level: "Intermediate",
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

              <Link
                to={
                  path.title === "Algorithm & Data Structures"
                    ? "/courses?path=Algorithms"
                    : path.title === "C++ Development"
                    ? "/courses?path=C%2B%2B"
                    : "/courses?path=Web"
                }
                className={styles.pathButton}
              >
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
