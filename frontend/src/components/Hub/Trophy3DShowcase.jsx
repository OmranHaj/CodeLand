import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";

/**
 * 3D Trophy & Crest Model.
 * Dynamically shifts material and particle effects based on the inspected badge.
 */
function TrophyModel({ badge }) {
  const crestRef = useRef();
  const cageRef = useRef();
  const haloRef = useRef();
  const ringRef = useRef();

  const isUnlocked = badge ? badge.current >= badge.target : false;
  const isProgress = badge && !isUnlocked && badge.current > 0;

  const theme = isUnlocked
    ? {
        primary: "#fbbf24",
        secondary: "#f59e0b",
        glow: "#fde047",
        metalness: 0.95,
        roughness: 0.1,
        emissiveIntensity: 0.5,
        sparkleCount: 80,
      }
    : isProgress
    ? {
        primary: "#38bdf8",
        secondary: "#8b5cf6",
        glow: "#06b6d4",
        metalness: 0.85,
        roughness: 0.2,
        emissiveIntensity: 0.4,
        sparkleCount: 45,
      }
    : {
        primary: "#64748b",
        secondary: "#334155",
        glow: "#475569",
        metalness: 0.5,
        roughness: 0.45,
        emissiveIntensity: 0.15,
        sparkleCount: 20,
      };

  useFrame((_, delta) => {
    if (crestRef.current) {
      crestRef.current.rotation.y += delta * 0.45;
      crestRef.current.rotation.x += delta * 0.18;
    }
    if (cageRef.current) {
      cageRef.current.rotation.y -= delta * 0.3;
      cageRef.current.rotation.z += delta * 0.15;
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += delta * 0.5;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.35;
      ringRef.current.rotation.y -= delta * 0.25;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.1}>
        {/* Central 3D Faceted Gem Crest */}
        <mesh ref={crestRef} scale={1.25}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={theme.primary}
            emissive={theme.secondary}
            emissiveIntensity={theme.emissiveIntensity}
            metalness={theme.metalness}
            roughness={theme.roughness}
            flatShading
          />
        </mesh>

        {/* Outer Geometric Wireframe Cage */}
        <mesh ref={cageRef} scale={1.75}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            wireframe
            metalness={0.9}
            roughness={0.2}
            emissive={theme.glow}
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Floating Halo Ring */}
        <mesh ref={haloRef} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.3, 0.04, 16, 64]} />
          <meshStandardMaterial
            color={theme.primary}
            emissive={theme.primary}
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Secondary Perpendicular Ring */}
        <mesh ref={ringRef} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.6, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={theme.glow}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Trophy Pedestal Base */}
        <mesh position={[0, -2.1, 0]}>
          <cylinderGeometry args={[1.2, 1.6, 0.4, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.8}
            roughness={0.3}
            emissive={theme.secondary}
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>

      {/* Dynamic Point Light */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.8}
        color={theme.primary}
        distance={7}
      />

      {/* Particles Sparkles */}
      <Sparkles
        count={theme.sparkleCount}
        scale={6.5}
        size={3.5}
        speed={isUnlocked ? 1.4 : 0.5}
        opacity={0.8}
        color={theme.primary}
      />
    </group>
  );
}

export default function Trophy3DShowcase({ badge, totalEarned = 0, totalBadges = 6 }) {
  const isUnlocked = badge ? badge.current >= badge.target : false;

  return (
    <div className="hub-trophy-stage-container">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(30, 27, 75, 0.8) 0%, rgba(6, 9, 20, 0.95) 80%)",
          borderRadius: "20px",
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 6, 4]} intensity={1.5} />
        <directionalLight position={[-2, -4, -3]} intensity={0.8} color="#38bdf8" />

        <TrophyModel badge={badge} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>

      {/* 3D Interactive Inspection HUD */}
      <div className="hub-trophy-stage-hud">
        <div className="hub-trophy-hud-info">
          <span className={`hub-trophy-badge-pill ${isUnlocked ? "unlocked" : "locked"}`}>
            {isUnlocked ? "✦ UNLOCKED" : "LOCKED"}
          </span>
          <h3>{badge ? badge.title : "Hall of Achievements"}</h3>
          <p>{badge ? badge.description : "Select any achievement card to inspect it in 3D."}</p>
        </div>

        <div className="hub-trophy-hud-stats">
          <strong>{totalEarned} / {totalBadges}</strong>
          <small>Trophies Claimed</small>
        </div>
      </div>
    </div>
  );
}
