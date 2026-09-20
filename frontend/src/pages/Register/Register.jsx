import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import registerVisual from "../../assets/images/register-visual.png";
import parentRegisterVisual from "../../assets/images/parent-register-visual.png";
import studentRegisterVisual from "../../assets/images/student-register-visual.png";

import {
  Bot,
  UserPlus,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  registerParent,
  verifyParentCode,
  registerStudent,
} from "../../services/authService";

import styles from "./Register.module.css";

function Register() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("");
  const [step, setStep] = useState("choose");

  /* ====================================================== */
  /* PARENT */
  /* ====================================================== */

  const [parentForm, setParentForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [parentError, setParentError] = useState("");
  const [parentLoading, setParentLoading] = useState(false);

  const [showParentPassword, setShowParentPassword] = useState(false);
  const [showParentConfirmPassword, setShowParentConfirmPassword] =
    useState(false);

  /* ====================================================== */
  /* STUDENT CODE */
  /* ====================================================== */

  const [studentCode, setStudentCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  /* ====================================================== */
  /* STUDENT */
  /* ====================================================== */

  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [studentError, setStudentError] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);

  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [showStudentConfirmPassword, setShowStudentConfirmPassword] =
    useState(false);

  /* ====================================================== */
  /* ACCOUNT TYPE */
  /* ====================================================== */

  const handleContinue = () => {
    if (!accountType) return;

    if (accountType === "parent") {
      setStep("parent");
    }

    if (accountType === "student") {
      setStep("studentCode");
    }
  };

  /* ====================================================== */
  /* PARENT FORM CHANGE */
  /* ====================================================== */

  const handleParentChange = (e) => {
    const { name, value } = e.target;

    setParentForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setParentError("");
  };

  /* ====================================================== */
  /* CREATE PARENT */
  /* ====================================================== */

  const handleParentSubmit = async (e) => {
    e.preventDefault();

    setParentError("");

    if (
      !parentForm.fullName.trim() ||
      !parentForm.email.trim() ||
      !parentForm.password ||
      !parentForm.confirmPassword
    ) {
      setParentError("Please complete all fields.");
      return;
    }

    if (parentForm.password.length < 8) {
      setParentError("Password must be at least 8 characters.");
      return;
    }

    if (parentForm.password !== parentForm.confirmPassword) {
      setParentError("Passwords do not match.");
      return;
    }

    setParentLoading(true);

    const normalizedEmail = parentForm.email.trim().toLowerCase();

    try {
      await registerParent({
        fullName: parentForm.fullName.trim(),
        email: normalizedEmail,
        password: parentForm.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          accountType: "parent",
          email: normalizedEmail,
          message: "Parent account created successfully. Please log in.",
        },
      });
    } catch (error) {
      setParentError(error.message || "Unable to create your account.");
    } finally {
      setParentLoading(false);
    }
  };

  /* ====================================================== */
  /* VERIFY PARENT CODE */
  /* ====================================================== */

  const handleParentCodeSubmit = async (e) => {
    e.preventDefault();

    setCodeError("");

    const normalizedCode = studentCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCodeError("Please enter your parent code.");
      return;
    }

    setCheckingCode(true);

    try {
      const data = await verifyParentCode(normalizedCode);

      if (data?.valid === false) {
        throw new Error("Invalid parent code.");
      }

      setStudentCode(data?.code || normalizedCode);
      setStep("student");
    } catch (error) {
      setCodeError(error.message || "Unable to verify parent code.");
    } finally {
      setCheckingCode(false);
    }
  };

  /* ====================================================== */
  /* STUDENT FORM CHANGE */
  /* ====================================================== */

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setStudentError("");
  };

  /* ====================================================== */
  /* CREATE STUDENT */
  /* ====================================================== */

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    setStudentError("");

    if (
      !studentForm.email.trim() ||
      !studentForm.password ||
      !studentForm.confirmPassword
    ) {
      setStudentError("Please complete all fields.");
      return;
    }

    if (studentForm.password.length < 8) {
      setStudentError("Password must be at least 8 characters.");
      return;
    }

    if (studentForm.password !== studentForm.confirmPassword) {
      setStudentError("Passwords do not match.");
      return;
    }

    setStudentLoading(true);

    const normalizedEmail = studentForm.email.trim().toLowerCase();

    try {
      await registerStudent({
        parentCode: studentCode.trim().toUpperCase(),
        email: normalizedEmail,
        password: studentForm.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          accountType: "student",
          email: normalizedEmail,
          message: "Student account created successfully. Please log in.",
        },
      });
    } catch (error) {
      setStudentError(error.message || "Unable to create your account.");
    } finally {
      setStudentLoading(false);
    }
  };

  /* ====================================================== */
  /* VISUAL IMAGE */
  /* ====================================================== */

  const getVisualImage = () => {
    if (step === "parent") {
      return parentRegisterVisual;
    }

    if (step === "studentCode" || step === "student") {
      return studentRegisterVisual;
    }

    return registerVisual;
  };

  const getVisualAlt = () => {
    if (step === "parent") {
      return "Parent supporting a child learning coding";
    }

    if (step === "studentCode" || step === "student") {
      return "Student studying and learning with CodeLand";
    }

    return "Student learning coding with CodeLand";
  };

  return (
    <main className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.registerCard}>
        {/* ================================================= */}
        {/* LEFT VISUAL */}
        {/* ================================================= */}

        <div className={styles.visualSide}>
          <img src={getVisualImage()} alt={getVisualAlt()} />

          <div className={styles.imageOverlay} />

          <div className={styles.visualText}>
            {/* PARENT */}

            {step === "parent" && (
              <>
                <h2 className={styles.visualTitle}>
                  Guide Their
                  <br />
                  Learning
                  <br />
                  <span>Journey.</span>
                </h2>

                <p className={styles.visualDescription}>
                  Support their curiosity, track their progress,
                  <br />
                  and grow together.
                </p>
              </>
            )}

            {/* STUDENT */}

            {(step === "studentCode" || step === "student") && (
              <>
                <h2 className={styles.visualTitle}>
                  Learn Today
                  <br />
                  Build
                  <br />
                  <span>Tomorrow.</span>
                </h2>

                <p className={styles.visualDescription}>
                  A brighter future starts
                  <br />
                  with the right tools.
                </p>
              </>
            )}

            {/* DEFAULT */}

            {step === "choose" && (
              <>
                <h2 className={styles.visualTitle}>
                  A Brighter
                  <br />
                  Future Through
                  <br />
                  <span>Coding</span>
                </h2>

                <p className={styles.visualDescription}>
                  Helping kids learn, create, and grow
                  <br />
                  with technology.
                </p>
              </>
            )}
          </div>
        </div>

        {/* ================================================= */}
        {/* RIGHT SIDE */}
        {/* ================================================= */}

        <div className={styles.formSide}>
          {/* TOP BAR */}

          <div className={styles.topBar}>
            <Link to="/" className={styles.backButton}>
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Bot size={21} />
              </div>

              <span className={styles.logoText}>
                Code<span>Land</span>
              </span>
            </Link>
          </div>

          {/* ================================================= */}
          {/* CHOOSE ACCOUNT */}
          {/* ================================================= */}

          {step === "choose" && (
            <div className={styles.stepContent}>
              <div className={styles.heading}>
                <span className={styles.badge}>Join CodeLand</span>

                <h1>
                  Create Your
                  <span> Account.</span>
                </h1>

                <p>Choose the type of account you want to create.</p>
              </div>

              <div className={styles.accountTypes}>
                {/* PARENT */}

                <button
                  type="button"
                  className={`${styles.accountCard} ${
                    accountType === "parent" ? styles.selected : ""
                  }`}
                  onClick={() => setAccountType("parent")}
                >
                  {accountType === "parent" && (
                    <div className={styles.check}>
                      <Check size={14} />
                    </div>
                  )}

                  <div className={styles.accountIcon}>
                    <UserPlus size={24} />
                  </div>

                  <h2>Parent Account</h2>

                  <p>
                    Create a parent account and manage your child's learning
                    journey.
                  </p>

                  <span className={styles.accountLabel}>I'm a Parent</span>
                </button>

                {/* STUDENT */}

                <button
                  type="button"
                  className={`${styles.accountCard} ${
                    accountType === "student" ? styles.selected : ""
                  }`}
                  onClick={() => setAccountType("student")}
                >
                  {accountType === "student" && (
                    <div className={styles.check}>
                      <Check size={14} />
                    </div>
                  )}

                  <div className={styles.accountIcon}>
                    <BookOpen size={24} />
                  </div>

                  <h2>Student Account</h2>

                  <p>Join CodeLand using your parent's invitation code.</p>

                  <span className={styles.accountLabel}>I'm a Student</span>
                </button>
              </div>

              <button
                type="button"
                className={styles.continueButton}
                disabled={!accountType}
                onClick={handleContinue}
              >
                Continue
                <ArrowRight size={17} />
              </button>

              <p className={styles.loginText}>
                Already have an account?
                <Link to="/login">Log In</Link>
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* PARENT REGISTER */}
          {/* ================================================= */}

          {step === "parent" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
                disabled={parentLoading}
                onClick={() => {
                  setStep("choose");
                  setParentError("");
                }}
              >
                <ArrowLeft size={15} />
                Change account type
              </button>

              <div className={styles.parentHeading}>
                <span className={styles.badge}>Parent Account</span>

                <h1>Create Parent Account</h1>

                <p>
                  Create your account first. Your child will connect later using
                  your invitation code.
                </p>
              </div>

              <form
                className={styles.registerForm}
                onSubmit={handleParentSubmit}
              >
                {/* FULL NAME */}

                <div className={styles.field}>
                  <label htmlFor="fullName">Full Name</label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    value={parentForm.fullName}
                    onChange={handleParentChange}
                    disabled={parentLoading}
                    required
                  />
                </div>

                {/* EMAIL */}

                <div className={styles.field}>
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={parentForm.email}
                    onChange={handleParentChange}
                    disabled={parentLoading}
                    required
                  />
                </div>

                {/* PASSWORDS */}

                <div className={styles.passwordRow}>
                  {/* PASSWORD */}

                  <div className={styles.field}>
                    <label htmlFor="password">Password</label>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="password"
                        name="password"
                        type={showParentPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="new-password"
                        value={parentForm.password}
                        onChange={handleParentChange}
                        minLength={8}
                        disabled={parentLoading}
                        required
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        disabled={parentLoading}
                        onClick={() => setShowParentPassword((prev) => !prev)}
                        aria-label={
                          showParentPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showParentPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className={styles.field}>
                    <label htmlFor="confirmPassword">Confirm Password</label>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showParentConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        value={parentForm.confirmPassword}
                        onChange={handleParentChange}
                        minLength={8}
                        disabled={parentLoading}
                        required
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        disabled={parentLoading}
                        onClick={() =>
                          setShowParentConfirmPassword((prev) => !prev)
                        }
                        aria-label={
                          showParentConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showParentConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERROR */}

                {parentError && (
                  <div className={styles.errorMessage} role="alert">
                    {parentError}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={parentLoading}
                >
                  {parentLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create Parent Account
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <p className={styles.loginText}>
                Already have an account?
                <Link to="/login">Log In</Link>
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* STUDENT PARENT CODE */}
          {/* ================================================= */}

          {step === "studentCode" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
                disabled={checkingCode}
                onClick={() => {
                  setStep("choose");
                  setStudentCode("");
                  setCodeError("");
                }}
              >
                <ArrowLeft size={15} />
                Change account type
              </button>

              <div className={styles.parentHeading}>
                <span className={styles.badge}>Student Account</span>

                <h1>Enter Parent Code</h1>

                <p>
                  Ask your parent for their CodeLand invitation code to connect
                  your account.
                </p>
              </div>

              <form
                className={styles.registerForm}
                onSubmit={handleParentCodeSubmit}
              >
                <div className={styles.field}>
                  <label htmlFor="parentCode">Parent Code</label>

                  <input
                    id="parentCode"
                    type="text"
                    placeholder="Example: CL-1234"
                    autoComplete="off"
                    value={studentCode}
                    disabled={checkingCode}
                    onChange={(e) => {
                      setStudentCode(e.target.value.toUpperCase());
                      setCodeError("");
                    }}
                    required
                  />
                </div>

                <p className={styles.codeHint}>
                  This code is provided by your parent.
                </p>

                {codeError && (
                  <div className={styles.errorMessage} role="alert">
                    {codeError}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={checkingCode}
                >
                  {checkingCode ? (
                    "Checking code..."
                  ) : (
                    <>
                      Continue
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <p className={styles.loginText}>
                Already have an account?
                <Link to="/login">Log In</Link>
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* STUDENT REGISTER */}
          {/* ================================================= */}

          {step === "student" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
                disabled={studentLoading}
                onClick={() => {
                  setStep("studentCode");
                  setStudentError("");
                }}
              >
                <ArrowLeft size={15} />
                Back to Parent Code
              </button>

              <div className={styles.parentHeading}>
                <span className={styles.badge}>Student Account</span>

                <h1>Create Student Account</h1>

                <p>
                  Your parent code is verified. Now create your personal
                  CodeLand account.
                </p>
              </div>

              {/* VERIFIED CODE */}

              <div className={styles.verifiedCode}>
                <div className={styles.verifiedIcon}>
                  <Check size={16} />
                </div>

                <div className={styles.verifiedInfo}>
                  <span>Parent connected</span>
                  <strong>{studentCode}</strong>
                </div>
              </div>

              {/* STUDENT FORM */}

              <form
                className={styles.registerForm}
                onSubmit={handleStudentSubmit}
              >
                {/* EMAIL */}

                <div className={styles.field}>
                  <label htmlFor="studentEmail">Email</label>

                  <input
                    id="studentEmail"
                    name="email"
                    type="email"
                    placeholder="student@example.com"
                    autoComplete="email"
                    value={studentForm.email}
                    onChange={handleStudentChange}
                    disabled={studentLoading}
                    required
                  />
                </div>

                {/* PASSWORDS */}

                <div className={styles.passwordRow}>
                  {/* PASSWORD */}

                  <div className={styles.field}>
                    <label htmlFor="studentPassword">Password</label>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="studentPassword"
                        name="password"
                        type={showStudentPassword ? "text" : "password"}
                        placeholder="Password"
                        autoComplete="new-password"
                        value={studentForm.password}
                        onChange={handleStudentChange}
                        minLength={8}
                        disabled={studentLoading}
                        required
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        disabled={studentLoading}
                        onClick={() => setShowStudentPassword((prev) => !prev)}
                        aria-label={
                          showStudentPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showStudentPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div className={styles.field}>
                    <label htmlFor="studentConfirmPassword">
                      Confirm Password
                    </label>

                    <div className={styles.passwordInputWrapper}>
                      <input
                        id="studentConfirmPassword"
                        name="confirmPassword"
                        type={showStudentConfirmPassword ? "text" : "password"}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        value={studentForm.confirmPassword}
                        onChange={handleStudentChange}
                        minLength={8}
                        disabled={studentLoading}
                        required
                      />

                      <button
                        type="button"
                        className={styles.passwordToggle}
                        disabled={studentLoading}
                        onClick={() =>
                          setShowStudentConfirmPassword((prev) => !prev)
                        }
                        aria-label={
                          showStudentConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showStudentConfirmPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ERROR */}

                {studentError && (
                  <div className={styles.errorMessage} role="alert">
                    {studentError}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={studentLoading}
                >
                  {studentLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Create Student Account
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <p className={styles.loginText}>
                Already have an account?
                <Link to="/login">Log In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Register;
