import { useEffect, useMemo, useRef, useState } from "react";

import { Html, Sparkles, useCursor } from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";
import gsap from "gsap";

import { CheckCircle2, LockKeyhole } from "lucide-react";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

/* ====================================================== */
/* COLORS */
/* ====================================================== */

const ORANGE = "#ff7048";
const GOLD = "#ffb45f";
const CYAN = "#42d9ff";
const DARK = "#10182b";

const COMPLETED = "#6df2b3";
/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function seededRandom(seed) {
  const value = Math.sin(seed * 999.91) * 43758.5453;

  return value - Math.floor(value);
}

/* ====================================================== */
/* FLOATING ROCKS */
/* ====================================================== */

function IslandUnderside({ radius }) {
  const rocks = useMemo(() => {
    return Array.from({
      length: 22,
    }).map((_, index) => {
      const angle = seededRandom(index * 4.7 + 2) * Math.PI * 2;

      const distance = radius * (0.15 + seededRandom(index * 8.2 + 6) * 0.72);

      const height = 1.7 + seededRandom(index * 2.8 + 10) * 3.8;

      const width = 0.35 + seededRandom(index * 3.3 + 20) * 0.65;

      return {
        position: [
          Math.cos(angle) * distance,

          -1.15 - height / 2,

          Math.sin(angle) * distance,
        ],

        scale: [width, height, width],

        rotation: seededRandom(index * 9.1 + 3) * Math.PI,
      };
    });
  }, [radius]);

  return (
    <group>
      {rocks.map((rock, index) => (
        <mesh
          key={index}
          castShadow
          receiveShadow
          position={rock.position}
          rotation={[0, rock.rotation, Math.PI]}
          scale={rock.scale}
        >
          <coneGeometry args={[0.8, 1, 6]} />

          <meshStandardMaterial
            color={index % 2 ? "#0c1221" : "#121a2d"}
            roughness={0.95}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* ENERGY CRYSTAL */
/* ====================================================== */

function Crystal({ position, scale = 1, color = CYAN }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.y = clock.elapsedTime * 0.35;

    ref.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 1.8 + position[0]) * 0.05;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <octahedronGeometry args={[0.28, 0]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3.5}
          roughness={0.08}
          metalness={0.25}
        />
      </mesh>

      <pointLight color={color} intensity={1.7} distance={3} />
    </group>
  );
}

/* ====================================================== */
/* FUTURE TREE */
/* ====================================================== */

function FutureTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.06, 0.11, 0.7, 7]} />

        <meshStandardMaterial color="#161420" roughness={0.92} />
      </mesh>

      <mesh castShadow position={[0, 0.82, 0]}>
        <icosahedronGeometry args={[0.4, 1]} />

        <meshStandardMaterial color="#17382f" roughness={0.8} />
      </mesh>

      <mesh castShadow position={[0.18, 0.9, 0.05]} scale={0.75}>
        <icosahedronGeometry args={[0.34, 1]} />

        <meshStandardMaterial color="#205244" roughness={0.78} />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* PATH LIGHT */
/* ====================================================== */

function PathLight({ position, index }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.material.opacity =
      0.5 + Math.sin(clock.elapsedTime * 2.4 - index * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.12, 0.18, 20]} />

      <meshBasicMaterial
        color={CYAN}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ====================================================== */
/* HTML HOLOGRAM */
/* ====================================================== */

function HtmlHologram() {
  const rootRef = useRef(null);

  useFrame(({ clock }) => {
    if (!rootRef.current) {
      return;
    }

    rootRef.current.position.y =
      3.5 + Math.sin(clock.elapsedTime * 1.25) * 0.12;

    rootRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.08;
  });

  return (
    <group ref={rootRef} position={[0, 3.5, -0.35]}>
      <mesh>
        <boxGeometry args={[1.8, 1.2, 0.05]} />

        <meshBasicMaterial
          color={ORANGE}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.05]}
        style={{
          pointerEvents: "none",
        }}
      >
        <div className={styles.htmlHologram}>
          <span>&lt;</span>
          HTML
          <span>/&gt;</span>
        </div>
      </Html>

      <pointLight color={ORANGE} intensity={3} distance={5} />
    </group>
  );
}

/* ====================================================== */
/* HTML DATA PANELS */
/* ====================================================== */

function CodePanel({ position, rotation = [0, 0, 0], delay = 0 }) {
  const panelRef = useRef(null);

  useFrame(({ clock }) => {
    if (!panelRef.current) {
      return;
    }

    panelRef.current.material.opacity =
      0.08 + Math.sin(clock.elapsedTime * 1.3 + delay) * 0.025;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh ref={panelRef}>
        <planeGeometry args={[1.25, 0.8]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0, -0.025]}>
        <planeGeometry args={[1.36, 0.91]} />

        <meshBasicMaterial
          color="#10223b"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[0.18, 0, -0.18].map((y, index) => (
        <mesh key={index} position={[-0.2 + index * 0.1, y, 0.015]}>
          <planeGeometry args={[0.55 - index * 0.1, 0.025]} />

          <meshBasicMaterial
            color={index === 0 ? ORANGE : CYAN}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* MAIN GATE */
/* ====================================================== */

function FoundationsGate() {
  const ringRef = useRef(null);

  const innerRef = useRef(null);

  const lightRef = useRef(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.45) * 0.06;
    }

    if (innerRef.current) {
      innerRef.current.rotation.z = -clock.elapsedTime * 0.12;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 5 + Math.sin(clock.elapsedTime * 2.2) * 1.2;
    }
  });

  return (
    <group position={[0, 0.7, -0.7]}>
      {/* LEFT PILLAR */}

      <mesh castShadow position={[-1.35, 1.65, 0]}>
        <boxGeometry args={[0.38, 3.3, 0.7]} />

        <meshStandardMaterial
          color={DARK}
          metalness={0.88}
          roughness={0.2}
          emissive={ORANGE}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* RIGHT PILLAR */}

      <mesh castShadow position={[1.35, 1.65, 0]}>
        <boxGeometry args={[0.38, 3.3, 0.7]} />

        <meshStandardMaterial
          color={DARK}
          metalness={0.88}
          roughness={0.2}
          emissive={ORANGE}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* PILLAR ENERGY */}

      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 1.65, 0.36]}>
          <planeGeometry args={[0.1, 2.55]} />

          <meshBasicMaterial color={ORANGE} transparent opacity={0.75} />
        </mesh>
      ))}

      {/* OUTER PORTAL */}

      <mesh ref={ringRef} position={[0, 2.15, 0]}>
        <torusGeometry args={[1.45, 0.11, 14, 100]} />

        <meshStandardMaterial
          color={ORANGE}
          emissive={ORANGE}
          emissiveIntensity={6}
          metalness={0.4}
          roughness={0.08}
        />
      </mesh>

      {/* INNER RING */}

      <mesh ref={innerRef} position={[0, 2.15, 0.01]}>
        <torusGeometry args={[1.12, 0.035, 12, 90]} />

        <meshBasicMaterial color={GOLD} transparent opacity={0.85} />
      </mesh>

      {/* PORTAL SURFACE */}

      <mesh position={[0, 2.15, 0.03]}>
        <circleGeometry args={[1.12, 64]} />

        <meshBasicMaterial
          color={ORANGE}
          transparent
          opacity={0.055}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 2, 1.2]}
        color={ORANGE}
        intensity={5}
        distance={9}
      />

      <Sparkles
        count={25}
        scale={[3, 3.8, 1.4]}
        position={[0, 2, 0]}
        size={3}
        speed={0.45}
        opacity={0.6}
        color={GOLD}
      />
    </group>
  );
}

/* ====================================================== */
/* PLATFORM */
/* ====================================================== */

function RobotPlatform() {
  const ringRef = useRef(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) {
      return;
    }

    ringRef.current.rotation.z = clock.elapsedTime * 0.15;
  });

  return (
    <group position={[0, 0.62, 2.05]}>
      <mesh>
        <cylinderGeometry args={[1.05, 1.15, 0.18, 48]} />

        <meshStandardMaterial
          color="#10182b"
          metalness={0.85}
          roughness={0.25}
        />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.84, 48]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight
        position={[0, 0.5, 0]}
        color={CYAN}
        intensity={2}
        distance={4}
      />
    </group>
  );
}

/* ====================================================== */
/* MAIN ISLAND */
/* ====================================================== */

function HTMLFoundationsIsland({ level, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);

  const [hovered, setHovered] = useState(false);

  const locked = level.status === "locked";
  const completed = level.status === "completed";

  useCursor(hovered, locked ? "not-allowed" : "pointer", "auto");

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const scale = hovered && !locked ? 1.025 : selected ? 1.015 : 1;

    gsap.to(rootRef.current.scale, {
      x: scale,
      y: scale,
      z: scale,

      duration: 0.5,

      ease: "power3.out",
    });
  }, [hovered, selected, locked]);

  const handleClick = (event) => {
    event.stopPropagation();

    if (locked) {
      onLocked(level);

      return;
    }

    onSelect(level);
  };

  const pathLights = useMemo(
    () =>
      Array.from({
        length: 7,
      }).map((_, index) => [0, 0.72, 2 - index * 0.43]),
    [],
  );

  return (
    <group
      ref={rootRef}
      position={level.position}
      onPointerOver={(event) => {
        event.stopPropagation();

        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* ================================================= */}
      {/* HIT AREA */}
      {/* ================================================= */}

      <mesh position={[0, 1, 0]}>
        <cylinderGeometry
          args={[level.radius * 1.05, level.radius * 1.05, 5, 18]}
        />

        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ================================================= */}
      {/* ISLAND BODY */}
      {/* ================================================= */}

      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[level.radius, level.radius * 0.86, 0.95, 22]}
        />

        <meshStandardMaterial
          color="#172237"
          roughness={0.9}
          metalness={0.07}
        />
      </mesh>

      {/* TERRAIN */}

      <mesh receiveShadow position={[0, 0.54, 0]}>
        <cylinderGeometry
          args={[level.radius * 0.96, level.radius * 0.98, 0.16, 28]}
        />

        <meshStandardMaterial
          color="#18372f"
          roughness={0.83}
          metalness={0.03}
        />
      </mesh>

      <IslandUnderside radius={level.radius} />

      {/* ================================================= */}
      {/* ORANGE EDGE */}
      {/* ================================================= */}

      <mesh position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[level.radius * 0.83, selected ? 0.07 : 0.04, 10, 90]}
        />

        <meshStandardMaterial
          color={completed ? COMPLETED : ORANGE}
          emissive={completed ? COMPLETED : ORANGE}
          emissiveIntensity={selected ? 7 : completed ? 2.4 : 3.6}
        />
      </mesh>

      {/* ================================================= */}
      {/* GATE */}
      {/* ================================================= */}

      <FoundationsGate />

      <HtmlHologram />

      <RobotPlatform />

      {/* ================================================= */}
      {/* ENTRY PATH */}
      {/* ================================================= */}

      {pathLights.map((position, index) => (
        <PathLight key={index} position={position} index={index} />
      ))}

      {/* ================================================= */}
      {/* CODE PANELS */}
      {/* ================================================= */}

      <CodePanel position={[-2, 1.65, 0.25]} rotation={[0, 0.5, 0]} />

      <CodePanel
        position={[2, 1.5, 0.05]}
        rotation={[0, -0.5, 0]}
        delay={1.5}
      />

      {/* ================================================= */}
      {/* VEGETATION */}
      {/* ================================================= */}

      <FutureTree position={[-2.2, 0.55, -1.6]} scale={1.15} />

      <FutureTree position={[2.15, 0.55, -1.75]} scale={0.95} />

      <FutureTree position={[-2.3, 0.55, 1.5]} scale={0.75} />

      <FutureTree position={[2.25, 0.55, 1.4]} scale={0.8} />

      {/* ================================================= */}
      {/* CRYSTALS */}
      {/* ================================================= */}

      <Crystal position={[-1.8, 0.84, 1.5]} color={CYAN} />

      <Crystal position={[1.8, 0.85, 1.4]} scale={0.8} color={ORANGE} />

      <Crystal position={[2.2, 0.82, -1.15]} scale={0.7} color={GOLD} />

      {/* ================================================= */}
      {/* AMBIENT PARTICLES */}
      {/* ================================================= */}

      <Sparkles
        count={35}
        position={[0, 2.3, 0]}
        scale={[6, 4, 6]}
        size={2.5}
        speed={0.25}
        opacity={0.35}
        color={ORANGE}
      />

      {completed && (
        <>
          <mesh position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[level.radius * 0.9, 0.025, 8, 96]} />

            <meshBasicMaterial
              color={COMPLETED}
              transparent
              opacity={0.72}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          <Html
            transform
            center
            distanceFactor={7}
            position={[0, 4.45, 0.25]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid rgba(109,242,179,.36)",
                background: "rgba(6,22,20,.82)",
                color: COMPLETED,
                fontFamily: "Arial, sans-serif",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: ".8px",
                boxShadow: "0 0 26px rgba(109,242,179,.18)",
                whiteSpace: "nowrap",
              }}
            >
              <CheckCircle2 size={13} />
              COMPLETED
            </div>
          </Html>
        </>
      )}

      {/* ================================================= */}
      {/* LABEL */}
      {/* ================================================= */}

      <Html
        position={[0, 5.8, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className={styles.levelLabel}
          style={{
            "--level-accent": ORANGE,
          }}
        >
          <div className={styles.levelLabelTop}>
            <span>{level.order}</span>

            {locked ? (
              <LockKeyhole size={11} />
            ) : completed ? (
              <strong
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  color: COMPLETED,
                }}
              >
                <CheckCircle2 size={11} />
                COMPLETED
              </strong>
            ) : (
              <strong>CURRENT</strong>
            )}
          </div>

          <h3>HTML Foundations</h3>

          <p>Build the structure</p>
        </div>
      </Html>

      {/* ================================================= */}
      {/* LIGHTING */}
      {/* ================================================= */}

      <pointLight
        position={[0, 3, 0]}
        color={ORANGE}
        intensity={3}
        distance={11}
      />

      <pointLight
        position={[0, 1.3, 2.2]}
        color={CYAN}
        intensity={2}
        distance={6}
      />
    </group>
  );
}

export default HTMLFoundationsIsland;
