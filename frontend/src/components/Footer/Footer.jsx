import { Link } from "react-router-dom";
import { Bot, Mail } from "lucide-react";
import { getHomeRoute } from "../../services/learningHub";

import styles from "./Footer.module.css";

function Footer() {
  const homeRoute = getHomeRoute();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to={homeRoute} className={styles.logo}>
              <div className={styles.logoIcon}>
                <Bot size={22} />
              </div>

              <span className={styles.logoText}>
                Code<span>Land</span>
              </span>
            </Link>

            <p>
              Interactive coding experiences designed to help young learners
              build real skills and create with confidence.
            </p>
          </div>

          {/* Explore */}
          <div className={styles.linksGroup}>
            <h4>Explore</h4>

            <a href="/#home">Home</a>
            <a href="/courses">Courses</a>
            <a href="/challenges">Challenges</a>
            <a href="/help">About</a>
          </div>

          {/* Account */}
          <div className={styles.linksGroup}>
            <h4>Account</h4>

            <a href="/login">Log In</a>
            <a href="/register">Register</a>
          </div>

          {/* Contact */}
          <div className={styles.linksGroup}>
            <h4>Contact</h4>

            <a href="mailto:ba32397@gmail.com">
              <Mail size={16} />
              ba32397@gmail.com
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 CodeLand. All rights reserved.</p>

          <div className={styles.socials}><a href="/help">Help & support</a><a href="/parent/dashboard">For parents</a></div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
