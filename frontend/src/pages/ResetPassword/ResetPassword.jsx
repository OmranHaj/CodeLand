import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { validatePasswordResetToken, resetPassword } from "../../services/authService";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract token from query params (?token=...)
  const params = new URLSearchParams(location.search);
  const token = params.get("token") || "";

  // Page States: "validating" | "invalid" | "editing" | "submitting" | "success"
  const [state, setState] = useState("validating");
  const [errorMessage, setErrorMessage] = useState("");

  // Form Fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // StrictMode safeguard to prevent duplicate token validation calls
  const validatedTokenRef = useRef("");

  useEffect(() => {
    if (!token || token.trim() === "") {
      setState("invalid");
      setErrorMessage("No password reset token was provided in the link.");
      return undefined;
    }

    if (validatedTokenRef.current === token) {
      return undefined;
    }
    validatedTokenRef.current = token;

    setState("validating");
    setErrorMessage("");

    let isMounted = true;

    validatePasswordResetToken(token)
      .then((res) => {
        if (!isMounted) return;
        if (res?.valid) {
          setState("editing");
        } else {
          setState("invalid");
          setErrorMessage(res?.message || "This reset link is invalid or has expired.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setState("invalid");
        setErrorMessage(err?.message || "This reset link is invalid or has expired.");
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setState("submitting");

    try {
      await resetPassword({
        token,
        password,
        confirmPassword,
      });
      setState("success");
    } catch (err) {
      setErrorMessage(err?.message || "Failed to update password. The link may have expired.");
      setState("editing");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.card}>
        {/* ================================================= */}
        {/* VALIDATING STATE */}
        {/* ================================================= */}
        {state === "validating" && (
          <div className={styles.validatingContainer}>
            <div className={styles.largeSpinner} />
            <h2 className={styles.title}>Verifying reset link</h2>
            <p className={styles.subtitle}>Please wait while we confirm your security credentials…</p>
          </div>
        )}

        {/* ================================================= */}
        {/* INVALID / EXPIRED STATE */}
        {/* ================================================= */}
        {state === "invalid" && (
          <div className={styles.invalidCard}>
            <div className={styles.invalidIconBadge}>
              <ShieldAlert size={32} />
            </div>

            <h1 className={styles.title}>Reset Link Expired or Invalid</h1>
            <p className={styles.subtitle}>
              {errorMessage || "This password reset link is invalid, has already been used, or has expired."}
            </p>

            <div className={styles.actionsColumn}>
              <Link to="/forgot-password" className={styles.primaryAction}>
                <span>Request a New Reset Link</span>
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className={styles.secondaryAction}>
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* SUCCESS STATE */}
        {/* ================================================= */}
        {state === "success" && (
          <div className={styles.successCard}>
            <div className={styles.successIconBadge}>
              <CheckCircle2 size={36} />
            </div>

            <h1 className={styles.title}>Password updated successfully ✓</h1>
            <p className={styles.subtitle}>
              Your new password is saved and ready to use. You can now log in to continue your adventure.
            </p>

            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => navigate("/login", { replace: true })}
            >
              <span>Continue to Login</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ================================================= */}
        {/* EDITING / SUBMITTING STATE */}
        {/* ================================================= */}
        {(state === "editing" || state === "submitting") && (
          <>
            <div className={styles.iconBadge}>
              <LockKeyhole size={28} />
            </div>

            <h1 className={styles.title}>Create a new password</h1>
            <p className={styles.subtitle}>
              Choose a strong password to protect your CodeLand account.
            </p>

            {errorMessage && (
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              {/* New Password */}
              <div className={styles.fieldGroup}>
                <label htmlFor="new-password" className={styles.label}>
                  New Password
                </label>
                <div className={styles.inputWrapper}>
                  <LockKeyhole size={18} className={styles.inputIcon} />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={state === "submitting"}
                    autoComplete="new-password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className={styles.hintText}>Minimum 8 characters</span>
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <label htmlFor="confirm-password" className={styles.label}>
                  Confirm New Password
                </label>
                <div className={styles.inputWrapper}>
                  <LockKeyhole size={18} className={styles.inputIcon} />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={state === "submitting"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className={styles.toggleEyeBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={state === "submitting"}
                id="save-new-password-btn"
              >
                {state === "submitting" ? (
                  <>
                    <span className={styles.spinner} />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
