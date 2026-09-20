import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ====================================================== */
/* LUXURY THEME PALETTE                                   */
/* ====================================================== */
const OBSIDIAN_BASE = "#060b17";
const OBSIDIAN_DARK = "#02040a";

/* ====================================================== */
/* EPIC QUANTUM HYPER-CORE MONOLITH                      */
/* ====================================================== */
function QuantumHyperCore() {
  const innerRef = useRef();
  const cage1Ref = useRef();
  const cage2Ref = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const ring4Ref = useRef();

  useFrame((_, delta) => {
    if (innerRef.current) {
      innerRef.current.rotation.y += delta * 0.45;
      innerRef.current.rotation.x += delta * 0.2;
    }
    if (cage1Ref.current) {
      cage1Ref.current.rotation.y -= delta * 0.25;
      cage1Ref.current.rotation.z += delta * 0.15;
    }
    if (cage2Ref.current) {
      cage2Ref.current.rotation.x += delta * 0.3;
      cage2Ref.current.rotation.y += delta * 0.2;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.4;
    if (ring2Ref.current) ring2Ref.current.rotation.x -= delta * 0.35;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.5;
    if (ring4Ref.current) ring4Ref.current.rotation.z -= delta * 0.25;
  });

  return (
    <group position={[0, 4.0, -4.5]}>
      {/* Central Pulsing Polyhedron */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshPhysicalMaterial
          color="#10b981"
          emissive="#059669"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          reflectivity={0.9}
        />
      </mesh>

      {/* Inner Wireframe Shield */}
      <mesh ref={cage1Ref}>
        <dodecahedronGeometry args={[2.5, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#d97706"
          emissiveIntensity={1.8}
          wireframe={true}
        />
      </mesh>

      {/* Outer Geodesic Shield */}
      <mesh ref={cage2Ref}>
        <octahedronGeometry args={[3.2, 1]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#10b981"
          emissiveIntensity={1.2}
          wireframe={true}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Concentric Orbital Rings */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.6, 0.05, 16, 90]} />
        <meshBasicMaterial color="#34d399" />
      </mesh>

      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[4.2, 0.04, 16, 90]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>

      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <torusGeometry args={[4.8, 0.04, 16, 90]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>

      <mesh ref={ring4Ref} rotation={[0, Math.PI / 3, Math.PI / 4]}>
        <torusGeometry args={[5.4, 0.03, 16, 90]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>

      {/* Vertical Dual Laser Pillars */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.35, 12, 16]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.06, 0.25, 8, 16]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
      </mesh>

      {/* Core Dynamic Lights */}
      <pointLight color="#10b981" intensity={4.5} distance={18} />
      <pointLight color="#f59e0b" intensity={3.5} distance={14} position={[0, 2, 0]} />
      <pointLight color="#8b5cf6" intensity={3.0} distance={16} position={[0, -2, 0]} />
    </group>
  );
}

/* ====================================================== */
/* SECTOR SPECIFIC 3D HOLOGRAPHIC ARTIFACTS               */
/* ====================================================== */
function SectorHologram({ code, accent }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.65;
    }
  });

  if (code === "ARR") {
    // Array: 4 glowing contiguous memory cubes
    return (
      <group ref={meshRef} position={[0, 1.4, 0]}>
        {[-0.7, -0.23, 0.23, 0.7].map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.34, 0.34, 0.34]} />
              <meshStandardMaterial
                color={accent}
                emissive={accent}
                emissiveIntensity={1.8}
                roughness={0.15}
                metalness={0.9}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[0.36, 0.36, 0.36]} />
              <meshBasicMaterial color="#ffffff" wireframe={true} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (code === "LST") {
    // Linked list: 3 crystalline spheres with laser connectors
    return (
      <group ref={meshRef} position={[0, 1.4, 0]}>
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <sphereGeometry args={[0.22, 20, 20]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={2.0}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        ))}
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (code === "STK") {
    // Stack: vertical ascending glowing wafers
    return (
      <group ref={meshRef} position={[0, 1.1, 0]}>
        {[0, 0.28, 0.56, 0.84].map((y, i) => (
          <mesh key={i} position={[0, y, 0]}>
            <cylinderGeometry args={[0.42 - i * 0.03, 0.42 - i * 0.03, 0.1, 20]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.4 + i * 0.3}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    );
  }

  if (code === "SRT") {
    // Sorting: Equalizer bars
    return (
      <group ref={meshRef} position={[0, 1.1, 0]}>
        {[0.35, 0.7, 1.05, 1.4, 0.8].map((h, i) => (
          <mesh key={i} position={[(i - 2) * 0.24, h / 2, 0]}>
            <boxGeometry args={[0.16, h, 0.16]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.8}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    );
  }

  if (code === "TRE") {
    // Tree: Root octahedron and children
    return (
      <group ref={meshRef} position={[0, 1.4, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[-0.5, -0.25, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[0.5, -0.25, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} />
        </mesh>
        {/* Branch struts */}
        <mesh position={[-0.25, 0.12, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.25, 0.12, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.03, 0.03, 0.65, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (code === "HSH") {
    // Hash Table: Honeycomb cluster
    return (
      <group ref={meshRef} position={[0, 1.4, 0]}>
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45]}>
            <cylinderGeometry args={[0.18, 0.18, 0.45, 6]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.5} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }

  if (code === "GRP") {
    // Graph: Constellation of 4 interconnected vertices
    return (
      <group ref={meshRef} position={[0, 1.4, 0]}>
        {[
          [0, 0.5, 0],
          [-0.45, -0.25, 0.35],
          [0.45, -0.25, 0.35],
          [0, -0.25, -0.45],
        ].map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.0} />
          </mesh>
        ))}
      </group>
    );
  }

  // Dynamic Programming: Stepped Pyramid
  return (
    <group ref={meshRef} position={[0, 1.0, 0]}>
      {[0.9, 0.62, 0.35].map((size, i) => (
        <mesh key={i} position={[0, i * 0.25, 0]}>
          <boxGeometry args={[size, 0.18, size]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.4 + i * 0.4}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* FLOATING SECTOR ISLAND WITH PARTICLE FOUNTAINS         */
/* ====================================================== */
function SectorIsland({ sector, isSelected, isCompleted, onSelect }) {
  const islandRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (islandRef.current) {
      const targetY = sector.position[1] + (hovered || isSelected ? 0.5 : 0);
      islandRef.current.position.y = THREE.MathUtils.lerp(
        islandRef.current.position.y,
        targetY,
        0.1
      );
    }
  });

  return (
    <group
      ref={islandRef}
      position={sector.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(sector);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <Float speed={2.2} rotationIntensity={0.25} floatIntensity={0.3}>
        {/* 3D Hologram Artifact */}
        <SectorHologram code={sector.code} accent={sector.accent} />

        {/* Floating Sector 3D Badge */}
        <Html position={[0, 2.5, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <div
            style={{
              padding: "5px 12px",
              borderRadius: "20px",
              background: isSelected
                ? `linear-gradient(135deg, ${sector.accent}ee, #0b1526f0)`
                : "rgba(6, 11, 23, 0.9)",
              border: `1.5px solid ${isSelected ? "#ffffff" : sector.accent}`,
              boxShadow: `0 0 20px ${isSelected ? sector.accent : "rgba(0,0,0,0.6)"}`,
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "1px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backdropFilter: "blur(8px)",
              transform: isSelected || hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isCompleted ? "#34d399" : sector.accent,
                boxShadow: `0 0 10px ${sector.accent}`,
              }}
            />
            <span>{sector.code}</span>
            <span style={{ opacity: 0.6, fontSize: "10px" }}>{sector.order}</span>
          </div>
        </Html>
      </Float>

      {/* Vertical Particle Fountain on Island */}
      <Sparkles
        count={25}
        scale={[2.2, 3.5, 2.2]}
        size={2.5}
        speed={0.8}
        color={sector.accent}
        position={[0, 1.2, 0]}
      />

      {/* Obsidian Pedestal Top Plate */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[1.6, 1.75, 0.16, 6]} />
        <meshStandardMaterial
          color={OBSIDIAN_BASE}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Glowing Energy Edge Trim */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.78, 1.78, 0.09, 6]} />
        <meshBasicMaterial
          color={isSelected ? "#ffffff" : sector.accent}
          transparent
          opacity={hovered || isSelected ? 1.0 : 0.75}
        />
      </mesh>

      {/* Obsidian Pedestal Lower Body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[1.75, 1.3, 1.1, 6]} />
        <meshStandardMaterial
          color={OBSIDIAN_DARK}
          roughness={0.25}
          metalness={0.85}
        />
      </mesh>

      {/* Base Beacon Point Light */}
      <pointLight
        color={sector.accent}
        intensity={isSelected ? 3.5 : hovered ? 2.5 : 1.4}
        distance={7}
        position={[0, 0.9, 0]}
      />
    </group>
  );
}

/* ====================================================== */
/* BIOLUMINESCENT LASER CONDUITS                          */
/* ====================================================== */
function EnergyConduits({ sectors }) {
  const curves = useMemo(() => {
    if (!sectors || sectors.length < 2) return [];
    return sectors.slice(0, -1).map((sec, idx) => {
      const next = sectors[idx + 1];
      const start = new THREE.Vector3(...sec.position);
      const end = new THREE.Vector3(...next.position);
      const mid = start.clone().lerp(end, 0.5);
      mid.y += 0.9 + idx * 0.1;
      return {
        curve: new THREE.QuadraticBezierCurve3(start, mid, end),
        accent: sec.accent,
      };
    });
  }, [sectors]);

  return (
    <group>
      {curves.map((item, i) => {
        const points = item.curve.getPoints(35);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial
              color={item.accent}
              transparent
              opacity={0.45}
              linewidth={2}
            />
          </line>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* MAIN 3D ALGORITHM WORLD SCENE                          */
/* ====================================================== */
export default function AlgorithmWorldScene({
  sectors,
  selectedSectorId,
  completedSectorIds = [],
  onSelectSector,
}) {
  return (
    <>
      {/* Luxury Cinematic Ambient & Directional Lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[12, 22, 16]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-16, 14, -12]} intensity={1.0} color="#8b5cf6" />
      <directionalLight position={[0, -10, 12]} intensity={0.4} color="#10b981" />

      {/* Volumetric Cosmic Starfield & Quantum Dust */}
      <Sparkles count={150} scale={[34, 22, 34]} size={2.8} speed={0.45} color="#10b981" opacity={0.65} />
      <Sparkles count={100} scale={[28, 18, 28]} size={3.2} speed={0.35} color="#f59e0b" opacity={0.55} />
      <Sparkles count={80} scale={[38, 26, 38]} size={2.2} speed={0.5} color="#8b5cf6" opacity={0.45} />
      <Sparkles count={70} scale={[25, 20, 25]} size={2.5} speed={0.4} color="#06b6d4" opacity={0.5} />

      {/* Central Quantum Hyper-Core Monolith */}
      <QuantumHyperCore />

      {/* Connecting Energy Highways */}
      <EnergyConduits sectors={sectors} />

      {/* 8 Floating Sector Citadels */}
      {sectors.map((sec) => (
        <SectorIsland
          key={sec.id}
          sector={sec}
          isSelected={selectedSectorId === sec.id}
          isCompleted={completedSectorIds.includes(sec.id)}
          onSelect={onSelectSector}
        />
      ))}

      {/* Dark Obsidian Foundation Floor */}
      <mesh position={[0, -1.2, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[24, 64]} />
        <meshStandardMaterial
          color="#02040b"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* Concentric Foundation Neon Rings */}
      <mesh position={[0, -1.18, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 8.1, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -1.18, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14, 14.1, 64]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, -1.18, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[20, 20.1, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.2} />
      </mesh>
    </>
  );
}
