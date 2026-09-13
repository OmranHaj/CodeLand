import { Gamepad2, Bot, Code2, Trophy } from "lucide-react";

import styles from "./WhyCodeLand.module.css";

function WhyCodeLand() {
  const features = [
    {
      icon: <Gamepad2 size={28} />,
      title: "Learn Through Play",
      description:
        "Turn coding into an interactive experience with challenges, activities, and hands-on practice.",
    },
    {
      icon: <Bot size={28} />,
      title: "Your Coding Companion",
      description:
        "Learn alongside an interactive robot that makes the experience more engaging and fun.",
    },
    {
      icon: <Code2 size={28} />,
      title: "Build Real Projects",
      description:
        "Apply what you learn by creating projects that turn coding concepts into real results.",
    },
    {
      icon: <Trophy size={28} />,
      title: "Grow Step by Step",
      description:
        "Complete challenges, track your progress, and build confidence as your skills improve.",
    },
  ];

  return (
    <section className={styles.section} id="why-codeland">
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.badge}>Why CodeLand?</span>

          <h2>
            Coding That Feels
            <span> Different.</span>
          </h2>

          <p>
            CodeLand is built to make programming easier to understand, more
            interactive, and more exciting for young learners.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <article className={styles.card} key={feature.title}>
              <div className={styles.icon}>{feature.icon}</div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyCodeLand;
