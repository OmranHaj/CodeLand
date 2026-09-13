import { Bot, Mail } from "lucide-react";

import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <a href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Bot size={22} />
              </div>

              <span className={styles.logoText}>
                Code<span>Land</span>
              </span>
            </a>

            <p>
              Interactive coding experiences designed to help young learners
              build real skills and create with confidence.
            </p>
          </div>

          {/* Explore */}
          <div className={styles.linksGroup}>
            <h4>Explore</h4>

            <a href="#home">Home</a>
            <a href="#courses">Courses</a>
            <a href="#challenges">Challenges</a>
            <a href="#about">About</a>
          </div>

          {/* Account */}
          <div className={styles.linksGroup}>
            <h4>Account</h4>

            <a href="#">Log In</a>
            <a href="#">Register</a>
          </div>

          {/* Contact */}
          <div className={styles.linksGroup}>
            <h4>Contact</h4>

            <a href="mailto:hello@codeland.com">
              <Mail size={16} />
              ba32397@gmail.com
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 CodeLand. All rights reserved.</p>

          <div className={styles.socials}>
            {/* GitHub */}
            <a href="#" aria-label="GitHub">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.51 2.87 8.33 6.84 9.68.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.36 9.36 0 0 1 12 7.13a9.3 9.3 0 0 1 2.5.35c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
              </svg>
            </a>

            {/* Instagram */}
            <a href="#" aria-label="Instagram">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M5.34 3.5A2.34 2.34 0 1 1 5.34 8.18 2.34 2.34 0 0 1 5.34 3.5ZM3.32 9.96h4.04V21H3.32V9.96ZM9.65 9.96h3.87v1.51h.05c.54-1.02 1.86-2.1 3.83-2.1 4.1 0 4.86 2.7 4.86 6.21V21h-4.04v-4.8c0-1.14-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54V21h-4.04V9.96Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
