import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Bot,
  House,
  BookOpen,
  Trophy,
  Info,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";

import styles from "./Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Bot size={24} />
          </div>

          <span className={styles.logoText}>
            Code<span>Land</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          <a href="#home">
            <House size={17} />
            <span>Home</span>
          </a>

          <a href="#why-codeland">
            <Info size={17} />
            <span>Why CodeLand</span>
          </a>

          <a href="#courses">
            <BookOpen size={17} />
            <span>Courses</span>
          </a>

          <a href="#how-it-works">
            <Trophy size={17} />
            <span>How It Works</span>
          </a>
        </nav>

        {/* Desktop Auth */}
        <div className={styles.actions}>
          <Link to="/login" className={styles.loginButton}>
            <LogIn size={17} />
            <span>Log In</span>
          </Link>

          <Link to="/register" className={styles.registerButton}>
            <UserPlus size={17} />
            <span>Register</span>
          </Link>
        </div>

        {/* Burger Button */}
        <button
          className={styles.burgerButton}
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <nav className={styles.mobileLinks}>
          <a href="#home" onClick={closeMenu}>
            <House size={19} />
            <span>Home</span>
          </a>

          <a href="#why-codeland" onClick={closeMenu}>
            <Info size={19} />
            <span>Why CodeLand</span>
          </a>

          <a href="#courses" onClick={closeMenu}>
            <BookOpen size={19} />
            <span>Courses</span>
          </a>

          <a href="#how-it-works" onClick={closeMenu}>
            <Trophy size={19} />
            <span>How It Works</span>
          </a>
        </nav>

        <div className={styles.mobileActions}>
          <Link to="/login" className={styles.loginButton} onClick={closeMenu}>
            <LogIn size={17} />
            <span>Log In</span>
          </Link>

          <Link
            to="/register"
            className={styles.registerButton}
            onClick={closeMenu}
          >
            <UserPlus size={17} />
            <span>Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
