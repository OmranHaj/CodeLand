import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
import { getHomeRoute, startPreview } from "../../services/learningHub";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ====================================================== */
  /* DATA COMING FROM REGISTER */
  /* ====================================================== */

  const registeredEmail = location.state?.email || "";

  const registrationMessage =
    location.state?.message ||
    (location.state?.from ? "Please log in to access this page." : "");

  /* ====================================================== */
  /* FORM */
  /* ====================================================== */

  const [email, setEmail] = useState(registeredEmail);

  const [password, setPassword] = useState("");

  /* ====================================================== */
  /* FORM STATES */
  /* ====================================================== */

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState(registrationMessage);

  /* ====================================================== */
  /* UI STATES */
  /* ====================================================== */

  const [showPassword, setShowPassword] = useState(false);

  const [isSwapped, setIsSwapped] = useState(false);

  /* ====================================================== */
  /* LOGIN */
  /* ====================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");

      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email: normalizedEmail,
        password,
      });

      const role = data?.user?.role;
      localStorage.setItem("codeland_current_user", JSON.stringify(data.user));
      const fromPath = location.state?.from?.pathname;

      /*
        Parent account
      */

      if (role === "parent") {
        const target =
          fromPath && !fromPath.startsWith("/student")
            ? fromPath
            : "/parent/dashboard";

        navigate(target, {
          replace: true,
        });

        return;
      }

      /*
        Student account
      */

      if (role === "student") {
        if (fromPath && !fromPath.startsWith("/parent")) {
          navigate(fromPath, {
            replace: true,
          });

          return;
        }

        const activePath = localStorage.getItem(
          `codeland_active_path_${data.user.id}`,
        );

        if (activePath) {
          navigate("/student/dashboard", {
            replace: true,
          });

          return;
        }

        navigate("/student/choose-path", {
          replace: true,
        });

        return;
      }

      /*
        Unknown role
      */

      throw new Error("Unable to determine your account type.");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />

      <div className={styles.glowTwo} />

      <div className={`${styles.loginCard} ${isSwapped ? styles.swapped : ""}`}>
        {/* ================================================= */}
        {/* FORM SIDE */}
        {/* ================================================= */}

        <div className={styles.formSide}>
          <Link to="/" className={styles.backButton}>
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          {/* LOGO */}

          <Link to={getHomeRoute()} className={styles.logo}>
            <div className={styles.logoIcon}>
              <Bot size={24} />
            </div>

            <span className={styles.logoText}>
              Code
              <span>Land</span>
            </span>
          </Link>

          {/* HEADING */}

          <div className={styles.heading}>
            <h1>Welcome Back!</h1>

            <p>Log in to continue your coding journey.</p>
          </div>

          {/* FORM */}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            onFocusCapture={() => {
              if (window.innerWidth > 1100) {
                setIsSwapped(true);
              }
            }}
            onBlurCapture={(e) => {
              if (
                window.innerWidth > 1100 &&
                !e.currentTarget.contains(e.relatedTarget)
              ) {
                setIsSwapped(false);
              }
            }}
          >
            {/* REGISTER SUCCESS */}

            {successMessage && (
              <div className={styles.successMessage} role="status">
                {successMessage}
              </div>
            )}

            {/* EMAIL */}

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
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

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
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setError("");
                  }}
                  required
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  disabled={loading}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* OPTIONS */}

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" disabled={loading} />

                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            {/* ERROR */}

            {error && (
              <div className={styles.errorMessage} role="alert">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}

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

          {/* ================================================= */}
          {/* DIVIDER */}
          {/* ================================================= */}

          <div className={styles.divider}>
            <span />

            <p>social sign-in · coming soon</p>

            <span />
          </div>

          {/* ================================================= */}
          {/* SOCIAL */}
          {/* ================================================= */}

          <button type="button" className="auth-preview-button" onClick={() => { try { startPreview(); navigate("/student/dashboard"); } catch { setError("Please allow browser storage to start a preview."); } }}>Explore the student preview <ArrowRight size={16} /></button>
          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              aria-label="Google sign-in is not connected yet" disabled title="Social sign-in is not connected yet"
            >
              <FcGoogle size={24} />

              <span>Google</span>
            </button>

            <button
              type="button"
              className={styles.socialButton}
              aria-label="GitHub sign-in is not connected yet" disabled title="Social sign-in is not connected yet"
            >
              <FaGithub size={23} />

              <span>GitHub</span>
            </button>

            <button
              type="button"
              className={styles.socialButton}
              aria-label="Discord sign-in is not connected yet" disabled title="Social sign-in is not connected yet"
            >
              <FaDiscord size={24} />

              <span>Discord</span>
            </button>
          </div>

          {/* ================================================= */}
          {/* REGISTER */}
          {/* ================================================= */}

          <p className={styles.registerText}>
            Don't have an account?
            <Link to="/register">Create Account</Link>
          </p>
        </div>

        {/* ================================================= */}
        {/* VISUAL SIDE */}
        {/* ================================================= */}

        <div className={styles.visualSide}>
          <img src={loginVisual} alt="CodeLand coding world" />

          <div className={styles.imageOverlay} />

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
