import { useState } from "react";
import { Link } from "react-router-dom";

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
} from "lucide-react";

import styles from "./Register.module.css";

function Register() {
  const [accountType, setAccountType] = useState("");
  const [step, setStep] = useState("choose");

  // =========================================
  // PARENT FORM
  // =========================================

  const [parentForm, setParentForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================
  // STUDENT PARENT CODE
  // =========================================

  const [studentCode, setStudentCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // =========================================
  // STUDENT FORM
  // =========================================

  const [studentForm, setStudentForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [studentError, setStudentError] = useState("");

  // =========================================
  // CHOOSE ACCOUNT TYPE
  // =========================================

  const handleContinue = () => {
    if (!accountType) return;

    if (accountType === "parent") {
      setStep("parent");
    }

    if (accountType === "student") {
      setStep("studentCode");
    }
  };

  // =========================================
  // CHECK PARENT CODE
  // =========================================

  const handleParentCodeSubmit = async (e) => {
    e.preventDefault();

    setCodeError("");

    if (!studentCode.trim()) {
      setCodeError("Please enter your parent code.");
      return;
    }

    setCheckingCode(true);

    // Temporary mock backend delay
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Temporary test code
    if (studentCode.trim().toUpperCase() !== "CL-1234") {
      setCodeError("Invalid parent code. Please check the code and try again.");

      setCheckingCode(false);
      return;
    }

    setCheckingCode(false);

    console.log("Parent code valid:", studentCode);

    setStep("student");
  };

  // =========================================
  // PARENT FORM CHANGE
  // =========================================

  const handleParentChange = (e) => {
    const { name, value } = e.target;

    setParentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // PARENT SUBMIT
  // =========================================

  const handleParentSubmit = (e) => {
    e.preventDefault();

    if (parentForm.password !== parentForm.confirmPassword) {
      console.log("Parent passwords do not match.");
      return;
    }

    console.log("Parent account:", parentForm);
  };

  // =========================================
  // STUDENT FORM CHANGE
  // =========================================

  const handleStudentChange = (e) => {
    const { name, value } = e.target;

    setStudentForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setStudentError("");
  };

  // =========================================
  // STUDENT SUBMIT
  // =========================================

  const handleStudentSubmit = (e) => {
    e.preventDefault();

    setStudentError("");

    if (studentForm.password.length < 8) {
      setStudentError("Password must be at least 8 characters.");
      return;
    }

    if (studentForm.password !== studentForm.confirmPassword) {
      setStudentError("Passwords do not match.");
      return;
    }

    const studentData = {
      parentCode: studentCode,
      email: studentForm.email,
      password: studentForm.password,
    };

    console.log("Student account:", studentData);
  };

  // =========================================
  // VISUAL IMAGE
  // =========================================

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
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.registerCard}>
        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div className={styles.visualSide}>
          <img src={getVisualImage()} alt={getVisualAlt()} />

          <div className={styles.imageOverlay}></div>

          {/* ================================= */}
          {/* TEXT OVER IMAGE */}
          {/* ================================= */}

          <div className={styles.visualText}>
            {/* PARENT VISUAL TEXT */}

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

            {/* STUDENT VISUAL TEXT */}

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

            {/* DEFAULT VISUAL TEXT */}

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

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

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

          {/* ================================= */}
          {/* STEP 1 - CHOOSE ACCOUNT */}
          {/* ================================= */}

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
                {/* Parent */}

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

                {/* Student */}

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

          {/* ================================= */}
          {/* STEP 2 - PARENT */}
          {/* ================================= */}

          {step === "parent" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
                onClick={() => setStep("choose")}
              >
                <ArrowLeft size={15} />
                Change account type
              </button>

              <div className={styles.parentHeading}>
                <span className={styles.badge}>Parent Account</span>

                <h1>Create Parent Account</h1>

                <p>
                  Create your account first. Your child will be able to connect
                  later using your invitation code.
                </p>
              </div>

              <form
                className={styles.registerForm}
                onSubmit={handleParentSubmit}
              >
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
                    required
                  />
                </div>

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
                    required
                  />
                </div>

                <div className={styles.passwordRow}>
                  <div className={styles.field}>
                    <label htmlFor="password">Password</label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={parentForm.password}
                      onChange={handleParentChange}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="confirmPassword">Confirm Password</label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={parentForm.confirmPassword}
                      onChange={handleParentChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.createButton}>
                  Create Parent Account
                  <ArrowRight size={17} />
                </button>
              </form>

              <p className={styles.loginText}>
                Already have an account?
                <Link to="/login">Log In</Link>
              </p>
            </div>
          )}

          {/* ================================= */}
          {/* STEP 2 - STUDENT PARENT CODE */}
          {/* ================================= */}

          {step === "studentCode" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
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
                  your student account.
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
                  <div className={styles.errorMessage}>{codeError}</div>
                )}

                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={checkingCode}
                >
                  {checkingCode ? (
                    <span>Checking code...</span>
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

          {/* ================================= */}
          {/* STEP 3 - STUDENT ACCOUNT */}
          {/* ================================= */}

          {step === "student" && (
            <div className={styles.stepContent}>
              <button
                type="button"
                className={styles.changeTypeButton}
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

              {/* Verified Parent */}

              <div className={styles.verifiedCode}>
                <div className={styles.verifiedIcon}>
                  <Check size={16} />
                </div>

                <div className={styles.verifiedInfo}>
                  <span>Parent connected</span>

                  <strong>{studentCode}</strong>
                </div>
              </div>

              {/* Student Form */}

              <form
                className={styles.registerForm}
                onSubmit={handleStudentSubmit}
              >
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
                    required
                  />
                </div>

                <div className={styles.passwordRow}>
                  <div className={styles.field}>
                    <label htmlFor="studentPassword">Password</label>

                    <input
                      id="studentPassword"
                      name="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={studentForm.password}
                      onChange={handleStudentChange}
                      minLength={8}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="studentConfirmPassword">
                      Confirm Password
                    </label>

                    <input
                      id="studentConfirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={studentForm.confirmPassword}
                      onChange={handleStudentChange}
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                {studentError && (
                  <div className={styles.errorMessage}>{studentError}</div>
                )}

                <button type="submit" className={styles.createButton}>
                  Create Student Account
                  <ArrowRight size={17} />
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
