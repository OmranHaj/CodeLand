import { useEffect, useMemo, useRef, useState } from "react";

import { Html, Sparkles, useCursor } from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";
import gsap from "gsap";

import { CheckCircle2, LockKeyhole, Trophy } from "lucide-react";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

const CYAN = "#46dfff";
const VIOLET = "#9d72ff";
const GOLD = "#ffd66b";
const WHITE = "#effcff";
const DARK = "#11172d";

const COMPLETED = "#6df2b3";
/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function seededRandom(seed) {
  const value = Math.sin(seed * 713.91) * 43758.5453;

  return value - Math.floor(value);
}

/* ====================================================== */
/* UNDERSIDE */
/* ====================================================== */

function ShowcaseUnderside({ radius }) {
  const shards = useMemo(() => {
    return Array.from({
      length: 17,
    }).map((_, index) => {
      const angle = seededRandom(index * 6.17 + 4) * Math.PI * 2;

      const distance = radius * (0.12 + seededRandom(index * 8.21 + 2) * 0.66);

      const height = 1.8 + seededRandom(index * 4.81 + 5) * 3.6;

      const width = 0.34 + seededRandom(index * 7.77 + 1) * 0.58;

      return {
        position: [
          Math.cos(angle) * distance,

          -1.05 - height / 2,

          Math.sin(angle) * distance,
        ],

        scale: [width, height, width],

        rotation: seededRandom(index * 10.1 + 8) * Math.PI,
      };
    });
  }, [radius]);

  return (
    <group>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          position={shard.position}
          rotation={[0, shard.rotation, Math.PI]}
          scale={shard.scale}
          castShadow
        >
          <coneGeometry args={[0.8, 1, 6]} />

          <meshStandardMaterial
            color={index % 2 === 0 ? "#14182b" : "#0c1121"}
            roughness={0.9}
            metalness={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* PROJECT SCREEN */
/* ====================================================== */

function ProjectScreen({
  position,
  rotation = [0, 0, 0],
  title,
  accent,
  delay = 0,
  locked,
}) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const time = clock.elapsedTime + delay;

    ref.current.position.y = position[1] + Math.sin(time * 1.15) * 0.08;

    ref.current.rotation.y = rotation[1] + Math.sin(time * 0.42) * 0.025;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.22, 0.8, 0.08]} />

        <meshStandardMaterial
          color="#101831"
          emissive={accent}
          emissiveIntensity={locked ? 0.05 : 0.18}
          metalness={0.78}
          roughness={0.2}
          transparent
          opacity={locked ? 0.68 : 0.96}
        />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.12, 0.7]} />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={locked ? 0.025 : 0.075}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.085]}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "5px 9px",
            borderRadius: "7px",
            border: `1px solid ${accent}55`,
            background: "rgba(7,11,28,.84)",
            color: locked ? "#6f7892" : "#effcff",
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: ".35px",
            whiteSpace: "nowrap",
            boxShadow: `0 0 22px ${accent}22`,
          }}
        >
          {title}
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* ACHIEVEMENT ORB */
/* ====================================================== */

function AchievementOrb({ position, color, delay = 0, locked }) {
  const rootRef = useRef(null);

  const ringRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime + delay;

    if (rootRef.current) {
      rootRef.current.position.y = position[1] + Math.sin(time * 1.6) * 0.07;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.75;
    }
  });

  return (
    <group ref={rootRef} position={position}>
      <mesh>
        <dodecahedronGeometry args={[0.18, 0]} />

        <meshStandardMaterial
          color={locked ? "#555a74" : WHITE}
          emissive={color}
          emissiveIntensity={locked ? 0.5 : 3.8}
          roughness={0.1}
          metalness={0.18}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.015, 8, 48]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={locked ? 0.15 : 0.68}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight color={color} intensity={locked ? 0.2 : 1.4} distance={3} />
    </group>
  );
}

/* ====================================================== */
/* SHOWCASE CRYSTAL */
/* ====================================================== */

function ShowcaseCrystal({ locked }) {
  const crystalRef = useRef(null);

  const haloOneRef = useRef(null);

  const haloTwoRef = useRef(null);

  const baseRingRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.3;

      crystalRef.current.position.y = Math.sin(time * 1.5) * 0.1;

      const pulse = 1 + Math.sin(time * 2.4) * 0.045;

      crystalRef.current.scale.setScalar(pulse);
    }

    if (haloOneRef.current) {
      haloOneRef.current.rotation.z = time * 0.32;
    }

    if (haloTwoRef.current) {
      haloTwoRef.current.rotation.z = -time * 0.22;
    }

    if (baseRingRef.current) {
      baseRingRef.current.rotation.z = time * 0.08;
    }
  });

  return (
    <group position={[0, 2.18, -0.1]}>
      {/* TROPHY PLATFORM */}

      <mesh castShadow position={[0, -1.2, 0]}>
        <cylinderGeometry args={[1.15, 1.5, 0.38, 32]} />

        <meshStandardMaterial
          color={DARK}
          emissive={GOLD}
          emissiveIntensity={locked ? 0.03 : 0.12}
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>

      <mesh
        ref={baseRingRef}
        position={[0, -0.98, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[1, 0.035, 8, 72]} />

        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={locked ? 0.14 : 0.65}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* FINAL CRYSTAL */}

      <group ref={crystalRef}>
        <mesh>
          <octahedronGeometry args={[0.78, 0]} />

          <meshStandardMaterial
            color={locked ? "#596079" : WHITE}
            emissive={locked ? "#55506d" : VIOLET}
            emissiveIntensity={locked ? 0.65 : 5}
            roughness={0.06}
            metalness={0.14}
          />
        </mesh>

        <mesh scale={[0.58, 1.18, 0.58]}>
          <octahedronGeometry args={[0.78, 0]} />

          <meshBasicMaterial
            color={CYAN}
            transparent
            opacity={locked ? 0.05 : 0.17}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* HALOS */}

      <mesh ref={haloOneRef} rotation={[Math.PI / 2.5, 0.25, 0]}>
        <torusGeometry args={[1.28, 0.035, 10, 96]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={locked ? 0.12 : 0.72}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={haloTwoRef} rotation={[Math.PI / 2.8, -0.45, 0]}>
        <torusGeometry args={[1, 0.025, 10, 90]} />

        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={locked ? 0.1 : 0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.82]}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: "1px solid rgba(255,214,107,.35)",
            background: "rgba(11,11,22,.82)",
            color: locked ? "#78705a" : GOLD,
            boxShadow: "0 0 28px rgba(255,214,107,.2)",
          }}
        >
          <Trophy size={17} />
        </div>
      </Html>

      <pointLight color={CYAN} intensity={locked ? 0.45 : 4} distance={9} />

      <pointLight
        color={GOLD}
        position={[0, 0.5, 0.8]}
        intensity={locked ? 0.3 : 2.7}
        distance={8}
      />
    </group>
  );
}

/* ====================================================== */
/* PROJECT SHOWCASE ISLAND */
/* ====================================================== */

function ProjectShowcaseIsland({ level, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);

  const rimRef = useRef(null);

  const innerRimRef = useRef(null);

  const [hovered, setHovered] = useState(false);

  const locked = level.status === "locked";
  const completed = level.status === "completed";

  useCursor(hovered, locked ? "not-allowed" : "pointer", "auto");

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const scale = hovered && !locked ? 1.035 : selected ? 1.02 : 1;

    gsap.to(rootRef.current.scale, {
      x: scale,
      y: scale,
      z: scale,
      duration: 0.45,
      ease: "power3.out",
    });
  }, [hovered, selected, locked]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (rimRef.current) {
      rimRef.current.rotation.z = time * 0.055;
    }

    if (innerRimRef.current) {
      innerRimRef.current.rotation.z = -time * 0.035;
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();

    if (locked) {
      onLocked(level);
      return;
    }

    onSelect(level);
  };

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
      {/* HIT AREA */}

      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[level.radius, level.radius, 5.8, 20]} />

        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ISLAND BODY */}

      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[level.radius, level.radius * 0.86, 0.9, 22]} />

        <meshStandardMaterial
          color="#171d35"
          roughness={0.86}
          metalness={0.12}
        />
      </mesh>

      {/* SHOWCASE FLOOR */}

      <mesh position={[0, 0.52, 0]} receiveShadow>
        <cylinderGeometry
          args={[level.radius * 0.95, level.radius * 0.98, 0.17, 26]}
        />

        <meshStandardMaterial
          color={locked ? "#15182a" : "#203342"}
          emissive={CYAN}
          emissiveIntensity={locked ? 0.015 : 0.055}
          roughness={0.76}
        />
      </mesh>

      <ShowcaseUnderside radius={level.radius} />

      {/* DUAL FINAL RIMS */}

      <mesh ref={rimRef} position={[0, 0.64, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[level.radius * 0.82, selected ? 0.075 : 0.04, 8, 96]}
        />

        <meshStandardMaterial
          color={completed ? COMPLETED : CYAN}
          emissive={completed ? COMPLETED : VIOLET}
          emissiveIntensity={selected ? 7 : locked ? 0.65 : completed ? 2.5 : 4}
          transparent
          opacity={locked ? 0.3 : 0.92}
        />
      </mesh>

      <mesh
        ref={innerRimRef}
        position={[0, 0.68, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[level.radius * 0.67, 0.02, 8, 90]} />

        <meshBasicMaterial
          color={GOLD}
          transparent
          opacity={locked ? 0.08 : 0.38}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* CENTRAL TROPHY */}

      <ShowcaseCrystal locked={locked} />

      {/* PROJECT SCREENS */}

      <ProjectScreen
        position={[-1.65, 2, 0.45]}
        rotation={[0, 0.32, 0]}
        title="Web Project"
        accent={CYAN}
        delay={0.2}
        locked={locked}
      />

      <ProjectScreen
        position={[1.65, 2.05, 0.45]}
        rotation={[0, -0.32, 0]}
        title="Game Project"
        accent={VIOLET}
        delay={1.4}
        locked={locked}
      />

      <ProjectScreen
        position={[0, 2.9, -1.45]}
        rotation={[0, 0, 0]}
        title="Final Build"
        accent={GOLD}
        delay={2.6}
        locked={locked}
      />

      {/* ACHIEVEMENT ORBS */}

      <AchievementOrb
        position={[-1.65, 0.95, 1.25]}
        color={GOLD}
        delay={0}
        locked={locked}
      />

      <AchievementOrb
        position={[1.65, 0.95, 1.25]}
        color={CYAN}
        delay={1.2}
        locked={locked}
      />

      <AchievementOrb
        position={[-1.8, 0.9, -0.9]}
        color={VIOLET}
        delay={2.2}
        locked={locked}
      />

      <AchievementOrb
        position={[1.8, 0.9, -0.9]}
        color={GOLD}
        delay={3.2}
        locked={locked}
      />

      {/* SHOWCASE PARTICLES */}

      <Sparkles
        count={72}
        scale={[level.radius * 1.7, 4.8, level.radius * 1.7]}
        size={2.2}
        speed={locked ? 0.1 : 0.28}
        opacity={locked ? 0.18 : 0.56}
        color={CYAN}
      />

      <Sparkles
        count={36}
        scale={[level.radius * 1.35, 4, level.radius * 1.35]}
        size={1.8}
        speed={locked ? 0.07 : 0.18}
        opacity={locked ? 0.1 : 0.4}
        color={GOLD}
      />

      {/* LOCK FIELD */}

      {locked && (
        <>
          <mesh position={[0, 2.45, 0]}>
            <sphereGeometry args={[level.radius * 0.92, 30, 22]} />

            <meshBasicMaterial
              color={VIOLET}
              wireframe
              transparent
              opacity={0.042}
            />
          </mesh>

          <Html
            transform
            center
            distanceFactor={7}
            position={[0, 4.35, 0.15]}
            style={{
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                display: "grid",
                placeItems: "center",
                borderRadius: "11px",
                border: "1px solid rgba(157,114,255,.3)",
                background: "rgba(7,10,28,.86)",
                color: "#8c80d2",
                boxShadow: "0 14px 38px rgba(0,0,0,.3)",
              }}
            >
              <LockKeyhole size={16} />
            </div>
          </Html>
        </>
      )}

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
            position={[0, 4.9, 0.25]}
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

      {/* LABEL */}

      <Html
        position={[0, 5.95, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          className={`${styles.levelLabel} ${
            locked ? styles.levelLabelLocked : ""
          }`}
          style={{
            "--level-accent": level.accent,
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

          <h3>{level.title}</h3>

          <p>{level.subtitle}</p>
        </div>
      </Html>

      <pointLight
        position={[0, 3, 0.8]}
        color={CYAN}
        intensity={locked ? 0.45 : 3.4}
        distance={11}
      />

      <pointLight
        position={[0, 2.4, -1.4]}
        color={GOLD}
        intensity={locked ? 0.25 : 2}
        distance={9}
      />
    </group>
  );
}

export default ProjectShowcaseIsland;
