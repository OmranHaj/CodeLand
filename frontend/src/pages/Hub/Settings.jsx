import { useState, useEffect, useMemo, useRef, useLayoutEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";
import {
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Flame,
  Mail,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles as SparklesIcon,
  Target,
  Trophy,
  Type,
  UserRound,
  Users,
  Volume2,
  Zap,
} from "lucide-react";
import gsap from "gsap";
import HubLayout from "../../components/Hub/HubLayout";
import {
  getParentInviteCode,
  getProfile,
  getSummary,
  getUser,
  userKey,
  writeStored,
} from "../../services/learningHub";
import soundEngine from "../../services/soundEngine";
import { apiRequest } from "../../services/api";

const AVATAR_THEMES = [
  { id: "violet", name: "Void Violet", color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.45)" },
  { id: "cyan", name: "Cyber Cyan", color: "#06b6d4", glow: "rgba(6, 182, 212, 0.45)" },
  { id: "emerald", name: "Matrix Emerald", color: "#10b981", glow: "rgba(16, 185, 129, 0.45)" },
  { id: "amber", name: "Solar Amber", color: "#f59e0b", glow: "rgba(245, 158, 11, 0.45)" },
  { id: "rose", name: "Neon Rose", color: "#f43f5e", glow: "rgba(244, 63, 94, 0.45)" },
  { id: "indigo", name: "Quantum Indigo", color: "#6366f1", glow: "rgba(99, 102, 241, 0.45)" },
];

const GOAL_OPTIONS = [
  {
    goal: 1,
    title: "Casual Scout",
    xp: "+25 XP / day",
    badge: "LIGHT",
    desc: "1 challenge per day to keep neural pathways fresh.",
    icon: Compass,
  },
  {
    goal: 3,
    title: "Steady Pioneer",
    xp: "+75 XP / day",
    badge: "RECOMMENDED",
    desc: "3 challenges daily to master algorithms at a steady pace.",
    icon: Target,
  },
  {
    goal: 6,
    title: "Cyber Master",
    xp: "+150 XP / day",
    badge: "INTENSE",
    desc: "6 challenges daily for rapid skill acceleration & arena domination.",
    icon: Flame,
  },
];

/**
 * 3D Holographic Passport Badge (React Three Fiber)
 */
function PassportHolo3D({ themeColor = "#8b5cf6", reducedMotion = false }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const outerRingRef = useRef();

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.75;
      meshRef.current.rotation.x += delta * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.55;
      ringRef.current.rotation.x += delta * 0.25;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y += delta * 0.45;
    }
  });

  return (
    <group>
      <Float
        speed={reducedMotion ? 0 : 2}
        rotationIntensity={reducedMotion ? 0 : 0.7}
        floatIntensity={reducedMotion ? 0 : 0.5}
      >
        {/* Core Crystal */}
        <mesh ref={meshRef}>
          <octahedronGeometry args={[0.88, 0]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={0.65}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>

        {/* Wireframe Cage */}
        <mesh>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial
            color={themeColor}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Orbital Ring 1 */}
        <mesh ref={ringRef}>
          <torusGeometry args={[1.45, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Orbital Ring 2 */}
        <mesh ref={outerRingRef} rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[1.75, 0.02, 16, 64]} />
          <meshStandardMaterial
            color={themeColor}
            emissive={themeColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>

        <Sparkles
          count={reducedMotion ? 12 : 45}
          scale={3}
          size={2.5}
          speed={reducedMotion ? 0.2 : 0.8}
          color={themeColor}
        />
      </Float>
    </group>
  );
}

export default function Settings() {
  const [user, setUser] = useState(getUser);
  const summary = useMemo(() => getSummary(user), [user]);
  const containerRef = useRef(null);

  const [form, setForm] = useState(() => {
    const p = getProfile(getUser());
    return {
      name: p.name || "",
      goal: p.goal || 3,
      reducedMotion: p.reducedMotion === true,
      avatarTheme: p.avatarTheme || "violet",
      fontSize: p.fontSize || "standard",
      soundEffects: p.soundEffects !== false,
    };
  });

  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync user profile from auth if token exists
  useEffect(() => {
    async function syncUser() {
      const token = localStorage.getItem("codeland_token");
      if (token) {
        try {
          const profile = await apiRequest("/auth/me");
          if (profile) {
            const rawRole = (profile.role || "").toLowerCase();
            const updated = {
              ...getUser(),
              ...profile,
              role: rawRole === "child" ? "student" : rawRole,
              parentCode: profile.parentCode,
              inviteCode: profile.parentCode || profile.inviteCode,
              fullName: profile.name || profile.fullName,
            };
            writeStored("codeland_current_user", updated);
            setUser(updated);
          }
        } catch {
          // Keep offline state
        }
      }
    }
    syncUser();

    const handleUpdate = () => setUser(getUser());
    window.addEventListener("codeland:update", handleUpdate);
    return () => window.removeEventListener("codeland:update", handleUpdate);
  }, []);

  // GSAP 3D entrance animation
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hub-settings-card, .hub-passport-card",
        {
          opacity: 0,
          y: 35,
          scale: 0.96,
          transformPerspective: 1000,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.1,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const inviteCode =
    user?.role === "parent" || user?.role === "PARENT"
      ? user?.parentCode || user?.inviteCode || getParentInviteCode(user) || null
      : null;

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      soundEngine.playClick("cyber");
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      // clipboard fallback
    }
  };

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  };

  const currentTheme =
    AVATAR_THEMES.find((t) => t.id === form.avatarTheme) || AVATAR_THEMES[0];

  const handleThemeSelect = (themeId) => {
    update("avatarTheme", themeId);
    soundEngine.playClick("cyber");
  };

  const handleGoalSelect = (goalVal) => {
    update("goal", goalVal);
    soundEngine.playClick("tab");
  };

  const handleSoundToggle = () => {
    const next = !form.soundEffects;
    update("soundEffects", next);
    soundEngine.setSfxEnabled(next);
    if (next) {
      soundEngine.playSuccess();
    }
  };

  const handleMotionToggle = () => {
    const next = !form.reducedMotion;
    update("reducedMotion", next);
    soundEngine.playClick("toggle");
    document.documentElement.dataset.reducedMotion = String(next);
  };

  const handleFontSizeSelect = (size) => {
    update("fontSize", size);
    soundEngine.playClick("tab");
  };

  const save = (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setFailed(true);
      setMessage("Please enter a valid display name.");
      soundEngine.playError();
      return;
    }

    try {
      const updatedProfile = {
        ...form,
        name: form.name.trim(),
      };
      writeStored(`codeland_profile_${userKey(user)}`, updatedProfile);

      const currentUser = getUser();
      if (currentUser) {
        currentUser.fullName = form.name.trim();
        writeStored("codeland_current_user", currentUser);
      }

      document.documentElement.dataset.reducedMotion = String(
        form.reducedMotion
      );

      setFailed(false);
      setMessage("Preferences saved and synchronized across your neural core.");
      soundEngine.playLevelComplete();
    } catch {
      setFailed(true);
      setMessage("Unable to save preferences. Please enable browser storage.");
      soundEngine.playError();
    }
  };

  const rankTitle =
    user?.role === "parent"
      ? "Family Guardian & Observatory Lead"
      : summary.xp >= 300
      ? "Grand Architect · Level 4"
      : summary.xp >= 150
      ? "Cyber Operative · Level 2"
      : "Novice Explorer · Level 1";

  return (
    <HubLayout title="Settings & Customization">
      {/* PAGE HEADER */}
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <SettingsIcon size={13} /> SYSTEM CONFIGURATION & MATRIX PREFERENCES
          </span>
          <h1>Your space. Your pace.</h1>
          <p>
            Fine-tune your visual identity, 3D physics, soundscapes, and daily
            learning missions.
          </p>
        </div>
      </div>

      <div className="hub-settings-grid" ref={containerRef}>
        {/* ================================================= */}
        {/* LEFT COLUMN: FORM CONTROLS */}
        {/* ================================================= */}
        <form className="hub-settings-column" onSubmit={save}>
          {/* CARD 1: LEARNER IDENTITY */}
          <div className="hub-settings-card">
            <div className="hub-card-header">
              <div
                className="hub-card-icon"
                style={{
                  background: `${currentTheme.color}22`,
                  borderColor: `${currentTheme.color}55`,
                  color: currentTheme.color,
                }}
              >
                <UserRound size={20} />
              </div>
              <div className="hub-card-title-group">
                <h2>Learner Identity</h2>
                <p>Personalize your name and holographic color aura.</p>
              </div>
            </div>

            {/* Display Name */}
            <div className="hub-field-group">
              <label>
                <span>Display Name</span>
                <span className="hub-field-badge">Public Signature</span>
              </label>
              <div className="hub-input-wrap">
                <span className="hub-input-icon">
                  <UserRound size={16} />
                </span>
                <input
                  type="text"
                  className="hub-text-input"
                  value={form.name}
                  maxLength={40}
                  autoComplete="nickname"
                  required
                  placeholder="Enter your explorer moniker..."
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
            </div>

            {/* Account Email (Read-only) */}
            <div className="hub-field-group">
              <label>
                <span>Linked Account Email</span>
                <span className="hub-field-badge">Verified ID</span>
              </label>
              <div className="hub-input-wrap">
                <span className="hub-input-icon">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  className="hub-text-input read-only"
                  value={user?.email || "guest-explorer@codeland.edu"}
                  readOnly
                />
              </div>
              <p className="hub-field-helper">
                Security credentials and recovery channels are managed by your
                provider.
              </p>
            </div>

            {/* Avatar Hologram Color Palette */}
            <div className="hub-avatar-palette">
              <div className="hub-palette-label">
                <strong>Holographic Aura</strong>
                <span>{currentTheme.name}</span>
              </div>
              <div className="hub-palette-chips" role="radiogroup">
                {AVATAR_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    className={`hub-avatar-chip ${
                      form.avatarTheme === theme.id ? "active" : ""
                    }`}
                    style={{
                      background: theme.color,
                      color: theme.color,
                    }}
                    onClick={() => handleThemeSelect(theme.id)}
                    title={theme.name}
                    aria-label={`Select ${theme.name} aura`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2: MISSION CALIBRATION (GOALS) */}
          <div className="hub-settings-card">
            <div className="hub-card-header">
              <div
                className="hub-card-icon"
                style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  borderColor: "rgba(56, 189, 248, 0.35)",
                  color: "#38bdf8",
                }}
              >
                <Target size={20} />
              </div>
              <div className="hub-card-title-group">
                <h2>Mission Calibration</h2>
                <p>Select your daily coding rhythm and challenge targets.</p>
              </div>
            </div>

            <div className="hub-goal-grid">
              {GOAL_OPTIONS.map((item) => {
                const GoalIcon = item.icon;
                const isSelected = form.goal === item.goal;
                return (
                  <button
                    key={item.goal}
                    type="button"
                    className={`hub-goal-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleGoalSelect(item.goal)}
                  >
                    <div className="hub-goal-header">
                      <div className="hub-goal-icon">
                        <GoalIcon size={18} />
                      </div>
                      <span className="hub-goal-badge">{item.badge}</span>
                    </div>
                    <strong className="hub-goal-title">{item.title}</strong>
                    <span className="hub-goal-xp">{item.xp}</span>
                    <p className="hub-goal-desc">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 3: SENSORY & DYNAMICS CONTROLS */}
          <div className="hub-settings-card">
            <div className="hub-card-header">
              <div
                className="hub-card-icon"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  borderColor: "rgba(245, 158, 11, 0.35)",
                  color: "#f59e0b",
                }}
              >
                <SparklesIcon size={20} />
              </div>
              <div className="hub-card-title-group">
                <h2>Sensory &amp; Interface Dynamics</h2>
                <p>Fine-tune 3D physics, audio feedback, and code typography.</p>
              </div>
            </div>

            {/* Reduce Motion */}
            <div className="hub-setting-row">
              <div className="hub-setting-info">
                <strong>Reduce Motion Effects</strong>
                <span>
                  Diminish 3D tilt rotations, floating orbital physics, and
                  bursts.
                </span>
              </div>
              <button
                type="button"
                className={`hub-switch ${form.reducedMotion ? "active" : ""}`}
                role="switch"
                aria-checked={form.reducedMotion}
                onClick={handleMotionToggle}
              >
                <span className="hub-switch-thumb" />
              </button>
            </div>

            {/* Cyber Sound & FX */}
            <div className="hub-setting-row">
              <div className="hub-setting-info">
                <strong
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Volume2 size={15} color="#c4b5fd" /> Cyber Sound &amp; FX
                </strong>
                <span>
                  Play futuristic audio cues on clicks, algorithms, and challenge
                  completions.
                </span>
              </div>
              <button
                type="button"
                className={`hub-switch ${form.soundEffects ? "active" : ""}`}
                role="switch"
                aria-checked={form.soundEffects}
                onClick={handleSoundToggle}
              >
                <span className="hub-switch-thumb" />
              </button>
            </div>

            {/* Code Font Size */}
            <div className="hub-setting-row">
              <div className="hub-setting-info">
                <strong
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Type size={15} color="#38bdf8" /> Editor Scale
                </strong>
                <span>Adjust the typography scale inside playground labs.</span>
              </div>
              <div className="hub-font-size-group">
                {["compact", "standard", "large"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`hub-font-btn ${
                      form.fontSize === size ? "active" : ""
                    }`}
                    onClick={() => handleFontSizeSelect(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAMILY CODE BEACON (PARENT ONLY) */}
          {user?.role === "parent" && inviteCode && (
            <div className="hub-family-card">
              <div className="hub-family-header">
                <Users size={22} color="#a78bfa" />
                <div>
                  <strong style={{ fontSize: "15px", color: "#f8fafc" }}>
                    Family Observatory Passcode
                  </strong>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#94a3b8",
                      margin: "2px 0 0",
                    }}
                  >
                    Provide this token to your children during registration to link
                    them to your Family Dashboard.
                  </p>
                </div>
              </div>

              <div className="hub-family-code-box">
                <code>{inviteCode}</code>
                <button
                  type="button"
                  className="hub-copy-btn"
                  onClick={handleCopyInviteCode}
                >
                  {copiedCode ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                </button>
              </div>
            </div>
          )}

          {/* SAVE BUTTON BAR */}
          <div className="hub-save-bar">
            <button className="hub-save-btn" type="submit">
              <Check size={16} /> Save Preferences
            </button>
            {message && (
              <span
                className={`hub-save-msg ${failed ? "error" : "success"}`}
                role="status"
              >
                {failed ? <SparklesIcon size={14} /> : <CheckCircle2 size={14} />}
                {message}
              </span>
            )}
          </div>
        </form>

        {/* ================================================= */}
        {/* RIGHT COLUMN: HOLOGRAPHIC CITIZEN CARD (3D FIBER) */}
        {/* ================================================= */}
        <aside className="hub-settings-column">
          <div
            className="hub-passport-card"
            style={{
              "--passport-glow": currentTheme.glow,
            }}
          >
            <div className="hub-passport-top-badge">
              <ShieldCheck size={13} />
              <span>AUTHENTICATED CITIZEN</span>
            </div>

            {/* 3D REACT THREE FIBER ROTATING HOLOGRAM */}
            <div
              className="hub-passport-avatar-wrap"
              style={{
                width: "160px",
                height: "160px",
                margin: "0 auto 12px",
              }}
            >
              <Canvas
                camera={{ position: [0, 0, 4.2], fov: 45 }}
                gl={{
                  alpha: true,
                  antialias: true,
                  powerPreference: "high-performance",
                }}
                dpr={[1, 1.5]}
              >
                <ambientLight intensity={1.5} />
                <directionalLight position={[3, 3, 3]} intensity={2.2} />
                <directionalLight position={[-3, -2, -2]} intensity={1.0} />
                <Suspense fallback={null}>
                  <PassportHolo3D
                    themeColor={currentTheme.color}
                    reducedMotion={form.reducedMotion}
                  />
                </Suspense>
                <OrbitControls
                  enableZoom={false}
                  enablePan={false}
                  autoRotate={!form.reducedMotion}
                  autoRotateSpeed={1.5}
                />
              </Canvas>
              <span className="hub-passport-beacon" />
            </div>

            {/* Explorer Moniker & Clearance */}
            <h3 className="hub-passport-name">{form.name || "Explorer"}</h3>
            <div className="hub-passport-rank">{rankTitle}</div>

            <p className="hub-passport-quote">
              {user?.role === "parent"
                ? "“Guiding the next generation of digital creators and cyber architects.”"
                : "“Curiosity fuels syntax. Code builds galaxies.”"}
            </p>

            {/* Quick Stats Grid */}
            <div className="hub-passport-stats">
              <div className="hub-passport-stat">
                <strong>{summary.xp || 0}</strong>
                <span>TOTAL XP</span>
              </div>
              <div className="hub-passport-stat">
                <strong>{summary.lessons || 0}</strong>
                <span>LESSONS</span>
              </div>
              <div className="hub-passport-stat">
                <strong>{summary.challenges || 0}</strong>
                <span>CHALLENGES</span>
              </div>
            </div>

            <div className="hub-passport-footer">
              <span>
                <CheckCircle2 size={13} /> ENCRYPTED NEURAL PROFILE
              </span>
            </div>
          </div>
        </aside>
      </div>
    </HubLayout>
  );
}
