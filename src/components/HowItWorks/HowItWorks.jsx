import { Compass, Bot, Rocket, ArrowRight } from "lucide-react";

import styles from "./HowItWorks.module.css";

function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <Compass size={28} />,
      title: "Choose Your Path",
      description:
        "Pick the learning path that matches your interests and start at your own pace.",
    },
    {
      number: "02",
      icon: <Bot size={28} />,
      title: "Learn Interactively",
      description:
        "Practice through challenges, guided activities, and interactive experiences.",
    },
    {
      number: "03",
      icon: <Rocket size={28} />,
      title: "Build Something Real",
      description:
        "Turn what you learn into real projects and grow your confidence with every step.",
    },
  ];

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.badge}>How It Works</span>

          <h2>
            Your Journey Starts
            <span> Here.</span>
          </h2>

          <p>
            Three simple steps to go from curious beginner to confident creator.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div className={styles.stepWrapper} key={step.number}>
              <article className={styles.card}>
                <span className={styles.number}>{step.number}</span>

                <div className={styles.icon}>{step.icon}</div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>

              {index < steps.length - 1 && (
                <div className={styles.arrow}>
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
