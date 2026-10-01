import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Check if WebGL context can be created
 */
function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Kinetic Holographic Sculpture
 */
function SculptureMesh({ reducedMotion }) {
  const groupRef = useRef();
  const cageRef = useRef();
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  // Floating particles around the core
  const particles = useMemo(() => {
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    if (reducedMotion) return;

    const time = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    if (groupRef.current) {
      // Gentle pointer parallax tracking with smooth damping
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        x * 0.5 + time * 0.15,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -y * 0.4,
        0.05
      );
    }

    if (cageRef.current) {
      cageRef.current.rotation.y = time * 0.18;
      cageRef.current.rotation.z = time * 0.1;
    }

    if (coreRef.current) {
      coreRef.current.rotation.x = -time * 0.22;
      coreRef.current.rotation.y = -time * 0.28;
      const scale = 1 + Math.sin(time * 2) * 0.04;
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = 0.8 + Math.sin(time * 0.6) * 0.1;
      ring1Ref.current.rotation.z = time * 0.35;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = 1.1 + Math.cos(time * 0.5) * 0.1;
      ring2Ref.current.rotation.x = -time * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={1.15}>
      {/* Outer Geometric Wireframe Cage */}
      <mesh ref={cageRef}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshStandardMaterial
          wireframe
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Second inner crystalline polyhedron */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.82, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.7}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Inner glowing core crystal */}
      <mesh>
        <dodecahedronGeometry args={[0.42, 0]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Orbiting data rings */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.9, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#8b5cf6"
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.75, 0.015, 16, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* Ambient constellation points */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          color="#c4b5fd"
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

/**
 * Premium Static Fallback for Reduced-Motion or when WebGL is unavailable
 */
function StaticSculptureFallback() {
  return (
    <div
      className="admin-sculpture-fallback"
      aria-hidden="true"
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 200 200"
        width="150"
        height="150"
        style={{ filter: "drop-shadow(0 0 16px rgba(139, 92, 246, 0.5))" }}
      >
        <defs>
          <linearGradient id="sculptureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Orbital Ellipses */}
        <ellipse
          cx="100"
          cy="100"
          rx="82"
          ry="38"
          fill="none"
          stroke="url(#sculptureGrad)"
          strokeWidth="1.5"
          transform="rotate(-25 100 100)"
          strokeDasharray="4 3"
        />
        <ellipse
          cx="100"
          cy="100"
          rx="72"
          ry="32"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          transform="rotate(35 100 100)"
          opacity="0.8"
        />
        {/* Faceted Outer Polygon */}
        <polygon
          points="100,32 155,68 155,132 100,168 45,132 45,68"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1.75"
        />
        <polygon
          points="100,52 138,78 138,122 100,148 62,122 62,78"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="1.5"
          opacity="0.9"
        />
        {/* Core Glow */}
        <circle cx="100" cy="100" r="28" fill="url(#coreGlow)" />
        <circle cx="100" cy="100" r="10" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * Main 3D Sculpture Component with WebGL detection & Reduced Motion handling
 */
export default function AdminSculpture3D({ className = "", style = {} }) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!hasWebGL) {
    return <StaticSculptureFallback />;
  }

  return (
    <div
      className={`admin-sculpture-container ${className}`}
      style={{
        position: "relative",
        width: 170,
        height: 170,
        pointerEvents: "auto",
        ...style,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-3, -3, 2]} intensity={2.2} color="#8b5cf6" />
        <pointLight position={[3, -2, -2]} intensity={2.5} color="#06b6d4" />
        <SculptureMesh reducedMotion={prefersReducedMotion} />
      </Canvas>
    </div>
  );
}
