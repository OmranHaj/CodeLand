import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function CrystalCore({ color = "#10b981" }) {
  const crystalRef = useRef();
  const wireframeRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.45;
      crystalRef.current.rotation.x += delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * 0.3;
      wireframeRef.current.rotation.z += delta * 0.25;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x += delta * 0.4;
      ring2Ref.current.rotation.y -= delta * 0.3;
    }
  });

  return (
    <group>
      {/* Floating Center Crystal */}
      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
        {/* Inner Solid Crystal */}
        <mesh ref={crystalRef} scale={1.15}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={color}
            roughness={0.15}
            metalness={0.85}
            emissive={color}
            emissiveIntensity={0.4}
            flatShading
          />
        </mesh>

        {/* Outer Wireframe Geodesic Cage */}
        <mesh ref={wireframeRef} scale={1.6}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            wireframe
            roughness={0.2}
            metalness={0.9}
            emissive={color}
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Orbital Ring 1 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.2, 0.035, 16, 64]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Orbital Ring 2 (Perpendicular) */}
        <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[2.5, 0.025, 16, 64]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Floating Stardust Particles */}
      <Sparkles
        count={50}
        scale={6}
        size={3.5}
        speed={0.6}
        opacity={0.7}
        color={color}
      />
    </group>
  );
}

export default function ParentMasteryOrb({
  color = "#10b981",
  childName = "Explorer",
  rankTitle = "Master Algorithmist",
  level = 8
}) {
  return (
    <div style={{ position: "relative", width: "100%", height: "260px", overflow: "hidden", borderRadius: "16px" }}>
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        style={{ background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(8, 12, 25, 0.95) 75%)" }}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color={color} />
        <pointLight position={[-5, -5, -3]} intensity={1} color="#3b82f6" />
        <directionalLight position={[0, 4, 2]} intensity={1} />
        
        <CrystalCore color={color} />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.3}
        />
      </Canvas>

      {/* Interactive 3D Overlay Badge */}
      <div
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "5px 14px",
          borderRadius: "20px",
          background: "rgba(16, 22, 39, 0.75)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${color}40`,
          color: "#e2e8f0",
          fontSize: "11px",
          fontWeight: "600",
          pointerEvents: "none",
          whiteSpace: "nowrap"
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
        <span>Level {level} · {rankTitle}</span>
      </div>
    </div>
  );
}
