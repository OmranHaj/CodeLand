import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import loginVisual from "../../assets/images/login-visual.png";

import {
  Bot,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaDiscord } from "react-icons/fa";

import { loginUser } from "../../services/authService";

import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();

  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      console.log("Login success:", data);

      // Later we can change this to /dashboard
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={`${styles.loginCard} ${isSwapped ? styles.swapped : ""}`}>
        {/* LEFT SIDE */}
        <div className={styles.formSide}>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Bot size={24} />
            </div>

            <span className={styles.logoText}>
              Code<span>Land</span>
            </span>
          </Link>

          <div className={styles.heading}>
            <h1>Welcome Back!</h1>

            <p>Log in to continue your coding journey.</p>
          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            onFocusCapture={() => setIsSwapped(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsSwapped(false);
              }
            }}
          >
            {/* Email */}
            <div className={styles.field}>
              <label htmlFor="email">Email</label>

              <div className={styles.inputWrapper}>
                <Mail size={19} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label htmlFor="password">Password</label>

              <div className={styles.inputWrapper}>
                <LockKeyhole size={19} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember / Forgot */}
            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <a href="#forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </a>
            </div>

            {/* Error */}
            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* Login Button */}
            <button
              type="submit"
              className={styles.loginButton}
              disabled={loading}
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          {/* Social */}
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              aria-label="Continue with Google"
            >
              <FcGoogle size={24} />
              <span>Google</span>
            </button>

            <button
              type="button"
              className={styles.socialButton}
              aria-label="Continue with GitHub"
            >
              <FaGithub size={23} />
              <span>GitHub</span>
            </button>

            <button
              type="button"
              className={styles.socialButton}
              aria-label="Continue with Discord"
            >
              <FaDiscord size={24} />
              <span>Discord</span>
            </button>
          </div>

          {/* Register */}
          <p className={styles.registerText}>
            Don't have an account?
            <Link to="/register">Create Account</Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className={styles.visualSide}>
          <img src={loginVisual} alt="CodeLand coding world" />

          <div className={styles.imageOverlay}></div>

          <div className={styles.visualContent}>
            <span className={styles.visualBadge}>CODELAND</span>

            <h2>
              More Than Just
              <span> Code.</span>
            </h2>

            <p>Learn. Build. Create. Grow.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
