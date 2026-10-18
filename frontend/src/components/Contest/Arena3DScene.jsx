import { useRef, useEffect, Component } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls, Stars, ContactShadows } from "@react-three/drei";
import { gsap } from "gsap";
import * as THREE from "three";

class CanvasErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("[Arena3DScene] WebGL fallback activated:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.fallback}>
          <div style={styles.fallbackTrophy}>🏆</div>
          <div style={styles.fallbackTitle}>CodeLand Grand Championship Trophy</div>
        </div>
      );
    }
    return this.props.children;
  }
}

const THEMES = {
  concluded: {
    primary: "#D6B36A", secondary: "#8C682F", glow: "#FFE8A3", core: "#FFF7DF",
    sparkle: "#FFE8A3", accent: "#E4C477", speed: 0.8, label: "CHAMPIONSHIP PODIUM HONORS",
  },
  podium: {
    primary: "#D6B36A", secondary: "#8C682F", glow: "#FFE8A3", core: "#FFF7DF",
    sparkle: "#FFE8A3", accent: "#E4C477", speed: 0.8, label: "CHAMPIONSHIP PODIUM HONORS",
  },
  live: {
    primary: "#49DCCB", secondary: "#126E70", glow: "#9BFFF1", core: "#E0FFFA",
    sparkle: "#8BFFF0", accent: "#67E8D8", speed: 1.2, label: "LIVE SUNDAY ARENA CORE",
  },
  registration: {
    primary: "#6DAA91", secondary: "#1E5A4B", glow: "#C8E6D5", core: "#F0FFF5",
    sparkle: "#B6E8D0", accent: "#A5D6BC", speed: 0.5, label: "3D GRAND TROPHY HOLOGRAM",
  },
};

function ChampionshipCrystal({ stage = "registration" }) {
  const trophyRef = useRef();
  const ringRef = useRef();
  const glowRingRef = useRef();
  const beamRef = useRef();
  const theme = THEMES[stage] || THEMES.registration;

  // A true sculpted cup trophy: flared bowl, twin handles, engraved star,
  // elegant stem and a layered championship pedestal.
  // One consistent champagne-gold trophy across all stages; stage colors
  // are reserved for the atmospheric accents so the whole design feels cohesive.
  const gold = new THREE.MeshPhysicalMaterial({
    color: "#D8B66C",
    emissive: "#7D5B24",
    emissiveIntensity: 0.24,
    metalness: 1,
    roughness: 0.17,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const darkGold = new THREE.MeshStandardMaterial({
    color: "#705126",
    metalness: 1,
    roughness: 0.2,
    emissive: "#3D2A12",
    emissiveIntensity: 0.08,
  });
  const brightGold = new THREE.MeshStandardMaterial({
    color: "#FFF0BD",
    emissive: "#E7C879",
    emissiveIntensity: 0.42,
    metalness: 1,
    roughness: 0.12,
  });

  const bowlProfile = [
    new THREE.Vector2(0.48, 0.05),
    new THREE.Vector2(0.58, 0.12),
    new THREE.Vector2(0.73, 0.32),
    new THREE.Vector2(0.88, 0.62),
    new THREE.Vector2(0.94, 0.91),
    new THREE.Vector2(0.91, 1.06),
    new THREE.Vector2(0.84, 1.12),
    new THREE.Vector2(0.78, 1.07),
    new THREE.Vector2(0.76, 0.91),
    new THREE.Vector2(0.68, 0.62),
    new THREE.Vector2(0.51, 0.34),
    new THREE.Vector2(0.30, 0.18),
    new THREE.Vector2(0.12, 0.13),
  ];
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? 0.235 : 0.105;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) starShape.moveTo(x, y);
    else starShape.lineTo(x, y);
  }
  starShape.closePath();
  const starGeometry = new THREE.ShapeGeometry(starShape);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (trophyRef.current) {
      trophyRef.current.rotation.y = Math.sin(t * 0.36) * 0.18;
      trophyRef.current.rotation.x = Math.sin(t * 0.5) * 0.025;
      trophyRef.current.position.y = Math.sin(t * 1.25) * 0.045;
    }
    if (ringRef.current) ringRef.current.rotation.y += delta * 0.18 * theme.speed;
    if (glowRingRef.current) glowRingRef.current.rotation.z -= delta * 0.13;
    if (beamRef.current) beamRef.current.material.opacity = 0.15 + (Math.sin(t * 1.7) + 1) * 0.065;
  });

  return (
    <group position={[0, -0.12, 0]}>
      <mesh ref={beamRef} position={[0, 0.2, -0.72]}>
        <cylinderGeometry args={[0.12, 0.68, 5.0, 32, 1, true]} />
        <meshBasicMaterial color={theme.glow} transparent opacity={0.15} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group ref={trophyRef}>
        {/* Cup bowl, polished lip and subtle inner gold surface */}
        <mesh geometry={new THREE.LatheGeometry(bowlProfile, 96)} material={gold} castShadow receiveShadow position={[0, 0.34, 0]} />
        <mesh position={[0, 1.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.875, 0.055, 16, 96]} />
          <primitive object={brightGold} attach="material" />
        </mesh>
        <mesh position={[0, 1.39, 0]}>
          <cylinderGeometry args={[0.83, 0.82, 0.055, 72]} />
          <primitive object={darkGold} attach="material" />
        </mesh>

        {/* Sculpted side handles */}
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.78, 1.03, 0]} rotation={[0, 0, side * -0.12]}>
            <mesh rotation={[Math.PI / 2, 0, side * 0.12]} scale={[0.72, 1.08, 1]} castShadow>
              <torusGeometry args={[0.38, 0.095, 20, 64, Math.PI * 1.62]} />
              <primitive object={gold} attach="material" />
            </mesh>
            <mesh position={[-side * 0.12, -0.31, 0]}>
              <sphereGeometry args={[0.105, 20, 20]} />
              <primitive object={brightGold} attach="material" />
            </mesh>
          </group>
        ))}

        {/* Star medallion facing the camera */}
        <mesh geometry={starGeometry} position={[0, 1.02, 0.845]} scale={1.08}>
          <meshStandardMaterial color="#FFF0BD" emissive="#E7C879" emissiveIntensity={0.55} metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.43, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.33, 0.27, 48]} />
          <primitive object={darkGold} attach="material" />
        </mesh>
        <mesh position={[0, -0.1, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 0.82, 48]} />
          <primitive object={gold} attach="material" />
        </mesh>
        <mesh position={[0, -0.53, 0]}>
          <torusGeometry args={[0.22, 0.045, 12, 64]} />
          <primitive object={brightGold} attach="material" />
        </mesh>
        <mesh position={[0, -0.72, 0]} castShadow>
          <cylinderGeometry args={[0.52, 0.66, 0.22, 64]} />
          <primitive object={gold} attach="material" />
        </mesh>
        <mesh position={[0, -0.91, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.77, 0.18, 64]} />
          <primitive object={darkGold} attach="material" />
        </mesh>
        <mesh position={[0, -1.015, 0]}>
          <torusGeometry args={[0.69, 0.035, 12, 72]} />
          <primitive object={brightGold} attach="material" />
        </mesh>
      </group>

      {/* Fine orbital accents frame the cup without hiding its silhouette */}
      <mesh ref={ringRef} rotation={[0.92, 0.2, 0.28]}>
        <torusGeometry args={[1.55, 0.018, 10, 128]} />
        <meshStandardMaterial color={theme.glow} emissive={theme.glow} emissiveIntensity={0.8} metalness={0.9} roughness={0.18} transparent opacity={0.72} />
      </mesh>
      <mesh ref={glowRingRef} rotation={[1.2, 0.2, -0.38]}>
        <torusGeometry args={[1.82, 0.012, 8, 128]} />
        <meshBasicMaterial color={theme.primary} transparent opacity={0.56} />
      </mesh>

      {/* Premium multi-tier display plinth */}
      <mesh position={[0, -1.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.23, 1.42, 0.24, 64]} />
        <meshStandardMaterial color="#111A25" metalness={0.96} roughness={0.2} />
      </mesh>
      <mesh position={[0, -1.405, 0]}>
        <torusGeometry args={[1.24, 0.035, 12, 96]} />
        <meshBasicMaterial color={theme.glow} />
      </mesh>
      <mesh position={[0, -1.72, 0]}>
        <cylinderGeometry args={[1.4, 1.52, 0.13, 64]} />
        <meshStandardMaterial color="#070D15" metalness={0.92} roughness={0.24} />
      </mesh>
      <mesh position={[0, -1.79, 0]}>
        <torusGeometry args={[1.43, 0.018, 8, 96]} />
        <meshBasicMaterial color={theme.primary} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function SceneFloor({ color }) {
  const gridRef = useRef();
  useFrame(({ clock }) => {
    if (gridRef.current) gridRef.current.position.z = (clock.getElapsedTime() * 0.08) % 1;
  });
  return (
    <group position={[0, -2.28, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#070b18" transparent opacity={0.62} />
      </mesh>
      <gridHelper ref={gridRef} args={[30, 38, color, "#18213a"]} position={[0, 0, -3]} />
    </group>
  );
}

export default function Arena3DScene({ stage = "registration", className = "" }) {
  const rootRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const scanRef = useRef(null);
  const theme = THEMES[stage] || THEMES.registration;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(root.querySelectorAll(".arena-enter"),
        { opacity: 0, y: 14, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.12, ease: "power3.out", clearProps: "filter" }
      );
      gsap.to(root.querySelector(".arena-aura"), {
        opacity: 0.72, scale: 1.08, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut",
      });
      if (badgeRef.current) {
        gsap.fromTo(badgeRef.current, { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, delay: 0.25, ease: "power2.out" });
      }
      if (titleRef.current) {
        gsap.fromTo(titleRef.current, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, delay: 0.4, ease: "power2.out" });
      }
      if (scanRef.current) {
        gsap.fromTo(scanRef.current, { yPercent: -120, opacity: 0 }, {
          yPercent: 420, opacity: 0.7, duration: 4.8, repeat: -1, ease: "none", repeatDelay: 1.1,
        });
      }
    }, root);
    return () => ctx.revert();
  }, [stage]);

  return (
    <div
      ref={rootRef}
      className={`arena-3d-container ${className}`}
      style={{ ...styles.container, "--arena-accent": theme.accent }}
    >
      <div className="arena-aura" aria-hidden="true" style={styles.aura} />
      <div aria-hidden="true" style={styles.topLine} />
      <div aria-hidden="true" ref={scanRef} style={styles.scanLine} />
      <div aria-hidden="true" style={styles.cornerTL} />
      <div aria-hidden="true" style={styles.cornerBR} />

      <CanvasErrorBoundary>
        <Canvas
          dpr={[1, 1.7]}
          camera={{ position: [0, 0.45, 6.9], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.38;
          }}
        >
          <color attach="background" args={["#060A12"]} />
          <fog attach="fog" args={["#060A12", 8, 19]} />
          <ambientLight intensity={0.9} />
          <hemisphereLight args={["#fff1d6", "#16202b", 1.05]} />
          <directionalLight position={[0, 4, 5]} intensity={1.7} color="#FFF8E8" />
          <directionalLight position={[-4, 2, 3]} intensity={1.25} color="#FFE4A8" />
          <pointLight position={[4, 5, 4]} intensity={3.6} color="#FFF1D6" />
          <pointLight position={[-4, 1, -2]} intensity={3.1} color={theme.primary} />
          <pointLight position={[0, -1, 4]} intensity={2.3} color={theme.glow} />
          <pointLight position={[0, 2, -3]} intensity={2.2} color="#FFE7B0" />
          <spotLight position={[0, 7, 3]} angle={0.58} penumbra={0.8} intensity={3.8} color={theme.glow} />
          <Stars radius={45} depth={24} count={850} factor={2.2} saturation={0.35} fade speed={0.35} />
          <Float speed={1.3} rotationIntensity={0.12} floatIntensity={0.24}>
            <ChampionshipCrystal stage={stage} />
          </Float>
          <Sparkles count={110} scale={[7, 5.5, 5]} size={2.6} speed={0.32} noise={0.22} color={theme.sparkle} />
          <SceneFloor color={theme.primary} />
          <ContactShadows position={[0, -2.25, 0]} opacity={0.42} scale={7} blur={2.6} far={4.5} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            rotateSpeed={0.55}
            minAzimuthAngle={-0.45}
            maxAzimuthAngle={0.45}
            maxPolarAngle={Math.PI / 2 + 0.12}
            minPolarAngle={Math.PI / 2 - 0.38}
          />
        </Canvas>
      </CanvasErrorBoundary>

      <div ref={badgeRef} className="arena-enter" style={styles.badge}>
        <span style={{ ...styles.statusDot, background: theme.accent, boxShadow: `0 0 14px ${theme.accent}` }} />
        <span>{theme.label}</span>
      </div>

      <div className="arena-enter" style={styles.sideLabel}>
        <span style={styles.sideKicker}>CODELAND / ARENA</span>
        <span style={styles.sideRule} />
        <span style={styles.sideSmall}>ELITE COMPETITION SYSTEM</span>
      </div>

      <div className="arena-enter" style={styles.bottomHUD}>
        <div style={styles.hudLeft}>
          <span style={styles.hudIcon}>✦</span>
          <div>
            <div style={styles.hudTitle}>GRAND CHAMPIONSHIP</div>
            <div style={styles.hudSubtitle}>A new challenge. A new legacy.</div>
          </div>
        </div>
        <div style={styles.hudRight}>
          <span style={{ ...styles.hudLiveDot, background: theme.accent }} />
          <span ref={titleRef} style={styles.hudMode}>{stage === "live" ? "ARENA LIVE" : stage === "concluded" || stage === "podium" ? "HONORS MODE" : "SYSTEM READY"}</span>
        </div>
      </div>

      <div style={styles.dragHint}>
        <span style={styles.dragGlyph}>↔</span> DRAG TO INSPECT
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "relative", width: "100%", height: "min(460px, 72vw)", minHeight: "340px",
    borderRadius: "26px", overflow: "hidden", isolation: "isolate", background: "#060A12",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 28px 80px -34px rgba(0,0,0,.9), inset 0 0 55px rgba(165,214,188,.06)",
  },
  fallback: { width: "100%", height: "100%", minHeight: "340px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", color: "#f8fafc", background: "radial-gradient(circle at 50% 42%, #1B302B, #060A12 72%)" },
  fallbackTrophy: { width: "84px", height: "84px", borderRadius: "26px", display: "grid", placeItems: "center", fontSize: "40px", background: "linear-gradient(145deg, rgba(228,196,119,.22), rgba(109,170,145,.13))", border: "1px solid rgba(228,196,119,.4)", boxShadow: "0 0 60px rgba(228,196,119,.16)" },
  fallbackTitle: { color: "#F4DFA8", fontWeight: 800, fontSize: "15px", letterSpacing: ".04em", textAlign: "center" },
  aura: { position: "absolute", zIndex: 0, width: "48%", aspectRatio: "1", left: "26%", top: "5%", borderRadius: "50%", background: "radial-gradient(circle, var(--arena-accent), transparent 68%)", opacity: 0.36, filter: "blur(34px)", pointerEvents: "none" },
  topLine: { position: "absolute", zIndex: 3, top: 0, left: "8%", right: "8%", height: "1px", background: "linear-gradient(90deg, transparent, var(--arena-accent), transparent)", opacity: 0.8, pointerEvents: "none" },
  scanLine: { position: "absolute", zIndex: 2, top: "-30%", left: 0, right: 0, height: "18%", background: "linear-gradient(180deg, transparent, rgba(228,196,119,.025), rgba(165,214,188,.09), transparent)", borderBottom: "1px solid rgba(228,196,119,.13)", pointerEvents: "none" },
  cornerTL: { position: "absolute", zIndex: 3, top: 13, left: 13, width: 28, height: 28, borderTop: "1px solid rgba(196,181,253,.65)", borderLeft: "1px solid rgba(196,181,253,.65)", borderTopLeftRadius: 9, pointerEvents: "none" },
  cornerBR: { position: "absolute", zIndex: 3, right: 13, bottom: 13, width: 28, height: 28, borderBottom: "1px solid rgba(196,181,253,.55)", borderRight: "1px solid rgba(196,181,253,.55)", borderBottomRightRadius: 9, pointerEvents: "none" },
  badge: { position: "absolute", zIndex: 5, top: 22, left: 24, display: "inline-flex", alignItems: "center", gap: 10, maxWidth: "calc(100% - 48px)", padding: "9px 14px", borderRadius: 999, background: "rgba(10,15,31,.72)", backdropFilter: "blur(18px)", border: "1px solid rgba(255,255,255,.12)", color: "#f8fafc", fontSize: 10, fontWeight: 800, letterSpacing: ".13em", boxShadow: "0 8px 28px rgba(0,0,0,.2)" },
  statusDot: { width: 7, height: 7, flex: "0 0 auto", borderRadius: "50%" },
  sideLabel: { position: "absolute", zIndex: 4, right: 24, top: "35%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 7, color: "rgba(226,232,240,.66)", pointerEvents: "none" },
  sideKicker: { fontSize: 9, fontWeight: 800, letterSpacing: ".22em" },
  sideRule: { width: 44, height: 1, background: "linear-gradient(90deg, transparent, var(--arena-accent))" },
  sideSmall: { fontSize: 7, letterSpacing: ".18em", writingMode: "vertical-rl", marginTop: 3, opacity: 0.75 },
  bottomHUD: { position: "absolute", zIndex: 5, left: 22, right: 22, bottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "15px 17px", borderRadius: 17, background: "linear-gradient(110deg, rgba(7,11,24,.9), rgba(15,23,42,.66))", border: "1px solid rgba(148,163,184,.18)", backdropFilter: "blur(18px)", boxShadow: "0 12px 40px rgba(0,0,0,.22)" },
  hudLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  hudIcon: { display: "grid", placeItems: "center", width: 34, height: 34, flex: "0 0 auto", borderRadius: 11, color: "var(--arena-accent)", fontSize: 19, background: "rgba(148,163,184,.08)", border: "1px solid rgba(148,163,184,.15)" },
  hudTitle: { color: "#f8fafc", fontSize: 11, fontWeight: 900, letterSpacing: ".12em" },
  hudSubtitle: { color: "#94a3b8", fontSize: 10, marginTop: 4 },
  hudRight: { display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto", paddingLeft: 12, borderLeft: "1px solid rgba(148,163,184,.18)" },
  hudLiveDot: { width: 6, height: 6, borderRadius: "50%", boxShadow: "0 0 12px currentColor" },
  hudMode: { color: "#cbd5e1", fontSize: 9, fontWeight: 800, letterSpacing: ".13em", whiteSpace: "nowrap" },
  dragHint: { position: "absolute", zIndex: 5, right: 24, bottom: 105, display: "flex", alignItems: "center", gap: 6, color: "rgba(203,213,225,.65)", fontSize: 8, fontWeight: 800, letterSpacing: ".17em", pointerEvents: "none" },
  dragGlyph: { color: "var(--arena-accent)", fontSize: 16 },
};
