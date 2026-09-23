import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * 3D Animated Cybernetic Core for Practice Arena.
 * Reacts to challenge states: 'idle', 'selected', 'correct', 'wrong'.
 */
function CyberCore({ state = "idle" }) {
  const crystalRef = useRef();
  const wireframeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const coreLightRef = useRef();

  // Dynamic theme colors and speeds based on interaction state
  const config = useMemo(() => {
    switch (state) {
      case "correct":
        return {
          primary: "#fbbf24",
          secondary: "#10b981",
          speedMult: 2.2,
          emissiveIntensity: 1.0,
          sparkleCount: 90,
          sparkleSpeed: 1.8,
        };
      case "wrong":
        return {
          primary: "#f43f5e",
          secondary: "#fb7185",
          speedMult: 0.6,
          emissiveIntensity: 0.8,
          sparkleCount: 30,
          sparkleSpeed: 0.4,
        };
      case "selected":
        return {
          primary: "#a855f7",
          secondary: "#38bdf8",
          speedMult: 1.5,
          emissiveIntensity: 0.7,
          sparkleCount: 65,
          sparkleSpeed: 1.0,
        };
      default: // idle
        return {
          primary: "#06b6d4",
          secondary: "#8b5cf6",
          speedMult: 1.0,
          emissiveIntensity: 0.45,
          sparkleCount: 50,
          sparkleSpeed: 0.6,
        };
    }
  }, [state]);

  useFrame((_, delta) => {
    const mult = config.speedMult;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5 * mult;
      crystalRef.current.rotation.x += delta * 0.25 * mult;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.35 * mult;
      wireframeRef.current.rotation.z += delta * 0.2 * mult;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.6 * mult;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x += delta * 0.45 * mult;
      ring2Ref.current.rotation.y -= delta * 0.3 * mult;
    }
  });

  return (
    <group>
      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.2}>
        {/* Inner Solid Crystal Core */}
        <mesh ref={crystalRef} scale={1.2}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={config.primary}
            emissive={config.primary}
            emissiveIntensity={config.emissiveIntensity}
            roughness={0.12}
            metalness={0.88}
            flatShading
          />
        </mesh>

        {/* Outer Wireframe Cage */}
        <mesh ref={wireframeRef} scale={1.65}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            wireframe
            roughness={0.2}
            metalness={0.9}
            emissive={config.secondary}
            emissiveIntensity={0.65}
          />
        </mesh>

        {/* Inner Orbital Ring 1 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.2, 0.04, 16, 64]} />
          <meshStandardMaterial
            color={config.primary}
            emissive={config.primary}
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Outer Orbital Ring 2 */}
        <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.55, 0.03, 16, 64]} />
          <meshStandardMaterial
            color={config.secondary}
            emissive={config.secondary}
            emissiveIntensity={0.7}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Point lights reflecting dynamic core color */}
      <pointLight
        ref={coreLightRef}
        position={[0, 0, 0]}
        intensity={2.5}
        color={config.primary}
        distance={6}
      />

      {/* Floating Stardust Particles */}
      <Sparkles
        count={config.sparkleCount}
        scale={6.5}
        size={3.8}
        speed={config.sparkleSpeed}
        opacity={0.75}
        color={config.primary}
      />
    </group>
  );
}

export default function Arena3DStage({
  state = "idle",
  title = "Cyber Arena Core",
  subtitle = "Interactive Matrix",
}) {
  return (
    <div className="hub-3d-stage-container">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(14, 22, 45, 0.8) 0%, rgba(6, 9, 20, 0.95) 75%)",
          borderRadius: "20px",
        }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[0, 5, 4]} intensity={1.2} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
        <pointLight position={[-5, -5, -3]} intensity={1.2} color="#06b6d4" />

        <CyberCore state={state} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>

      {/* Holographic HUD Badge */}
      <div className="hub-3d-stage-hud">
        <span className={`hub-3d-stage-dot status-${state}`} />
        <strong>{title}</strong>
        <span>·</span>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}
