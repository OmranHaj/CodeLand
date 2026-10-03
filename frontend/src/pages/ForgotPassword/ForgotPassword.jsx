import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, Sparkles, HelpCircle } from "lucide-react";
import { requestPasswordReset } from "../../services/authService";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "submitting" | "sent" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await requestPasswordReset(trimmedEmail);
      setStatus("sent");
    } catch (err) {
      // If server returned rate limit or explicit error message
      setErrorMessage(err.message || "Unable to send reset email. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.card}>
        <Link to="/login" className={styles.backButton}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        {status === "sent" ? (
          <div className={styles.successCard}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={32} />
            </div>

            <h1 className={styles.successTitle}>Check your inbox</h1>
            <p className={styles.successText}>
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
              Please check your spam or promotions folder if you don't see it in a few minutes.
            </p>

            <Link to="/login" className={styles.primaryAction}>
              Return to Login
            </Link>

            <div>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                }}
              >
                Request another link
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.iconBadge}>
              <Mail size={28} />
            </div>

            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.subtitle}>
              Enter your registered email and we'll send you a secure password reset link.
            </p>

            {errorMessage && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.fieldGroup}>
                <label htmlFor="reset-email" className={styles.label}>
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.inputIcon} />
                  <input
                    id="reset-email"
                    type="email"
                    className={styles.input}
                    placeholder="learner@codeland.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "submitting"}
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={status === "submitting"}
                id="send-reset-link-btn"
              >
                {status === "submitting" ? (
                  <>
                    <span className={styles.spinner} />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.childNotice}>
              <HelpCircle size={20} style={{ flexShrink: 0, marginTop: 1, color: "#818cf8" }} />
              <div>
                <strong>Need help accessing a student account?</strong>
                <br />
                Please ask your parent or contact support for assistance.
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
