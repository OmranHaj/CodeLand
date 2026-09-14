import { useEffect, useMemo, useRef, useState } from "react";

import { Html, Sparkles, useCursor } from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";
import gsap from "gsap";

import { CheckCircle2, LockKeyhole } from "lucide-react";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

const VIOLET = "#8067ff";
const PURPLE = "#a06cff";
const CYAN = "#36d8ff";
const SKY = "#6ee7ff";
const WHITE = "#eafcff";
const DARK = "#0f1530";
const DARK_2 = "#141b39";

const COMPLETED = "#6df2b3";
/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function seededRandom(seed) {
  const value = Math.sin(seed * 923.17) * 43758.5453;

  return value - Math.floor(value);
}

/* ====================================================== */
/* ISLAND UNDERSIDE */
/* ====================================================== */

function NexusUnderside({ radius }) {
  const shards = useMemo(() => {
    return Array.from({
      length: 24,
    }).map((_, index) => {
      const angle = seededRandom(index * 4.13 + 7) * Math.PI * 2;

      const distance = radius * (0.12 + seededRandom(index * 8.34 + 11) * 0.7);

      const height = 2.2 + seededRandom(index * 5.72 + 3) * 5.2;

      const width = 0.36 + seededRandom(index * 9.91 + 1) * 0.7;

      return {
        position: [
          Math.cos(angle) * distance,

          -1.18 - height / 2,

          Math.sin(angle) * distance,
        ],

        scale: [width, height, width],

        rotation: seededRandom(index * 12.21 + 9) * Math.PI,
      };
    });
  }, [radius]);

  return (
    <group>
      {shards.map((shard, index) => (
        <mesh
          key={index}
          castShadow
          receiveShadow
          position={shard.position}
          rotation={[0, shard.rotation, Math.PI]}
          scale={shard.scale}
        >
          <coneGeometry args={[0.8, 1, 6]} />

          <meshStandardMaterial
            color={index % 2 === 0 ? "#11172f" : "#0b1026"}
            roughness={0.88}
            metalness={0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* DATA PULSE */
/* ====================================================== */

function DataLink({ from, to, locked, seed = 0 }) {
  const pulseRefs = useRef([]);

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);

    const end = new THREE.Vector3(...to);

    const middle = start.clone().lerp(end, 0.5);

    middle.y += 0.22 + seededRandom(seed + 4) * 0.42;

    return new THREE.CatmullRomCurve3([start, middle, end]);
  }, [from, to, seed]);

  useFrame(({ clock }) => {
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) {
        return;
      }

      const progress =
        (clock.elapsedTime * (locked ? 0.045 : 0.16) +
          index * 0.22 +
          seed * 0.035) %
        1;

      pulse.position.copy(curve.getPointAt(progress));
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 72, 0.018, 8, false]} />

        <meshBasicMaterial
          color={seed % 2 ? CYAN : VIOLET}
          transparent
          opacity={locked ? 0.08 : 0.36}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            pulseRefs.current[index] = element;
          }}
        >
          <sphereGeometry args={[0.045, 10, 10]} />

          <meshBasicMaterial
            color={index % 2 ? WHITE : SKY}
            transparent
            opacity={locked ? 0.15 : 0.95}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* COMPONENT CARD */
/* ====================================================== */

function ComponentCard({
  position,
  rotation = [0, 0, 0],
  label,
  accent,
  delay = 0,
  locked,
}) {
  const rootRef = useRef(null);

  useFrame(({ clock }) => {
    if (!rootRef.current) {
      return;
    }

    const time = clock.elapsedTime + delay;

    rootRef.current.position.y = position[1] + Math.sin(time * 1.25) * 0.09;

    rootRef.current.rotation.y = rotation[1] + Math.sin(time * 0.45) * 0.035;
  });

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[1.15, 0.72, 0.08]} />

        <meshStandardMaterial
          color="#101938"
          emissive={accent}
          emissiveIntensity={locked ? 0.07 : 0.22}
          metalness={0.78}
          roughness={0.2}
          transparent
          opacity={locked ? 0.7 : 0.96}
        />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[1.06, 0.63]} />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={locked ? 0.025 : 0.07}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.08]}
        style={{
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            padding: "5px 9px",
            borderRadius: "7px",
            border: `1px solid ${accent}55`,
            background: "rgba(6,10,28,.82)",
            color: locked ? "#69708f" : "#eafcff",
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: "10px",
            fontWeight: 900,
            letterSpacing: ".35px",
            boxShadow: `0 0 20px ${accent}22`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* NEXUS TOWER */
/* ====================================================== */

function NexusTower({ position, height, accent, delay = 0, locked }) {
  const crownRef = useRef(null);

  const ringRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime + delay;

    if (crownRef.current) {
      crownRef.current.position.y =
        height / 2 + 0.36 + Math.sin(time * 1.4) * 0.05;

      crownRef.current.rotation.y = time * 0.45;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.32;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.28, 0.42, height, 8]} />

        <meshStandardMaterial
          color={DARK_2}
          emissive={accent}
          emissiveIntensity={locked ? 0.035 : 0.15}
          metalness={0.92}
          roughness={0.17}
        />
      </mesh>

      <mesh position={[0, height * 0.38, 0.29]}>
        <planeGeometry args={[0.22, height * 0.55]} />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={locked ? 0.08 : 0.46}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <group ref={crownRef}>
        <mesh>
          <octahedronGeometry args={[0.25, 0]} />

          <meshStandardMaterial
            color={locked ? "#515675" : WHITE}
            emissive={accent}
            emissiveIntensity={locked ? 0.5 : 4}
            roughness={0.1}
            metalness={0.2}
          />
        </mesh>

        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.018, 8, 48]} />

          <meshBasicMaterial
            color={accent}
            transparent
            opacity={locked ? 0.16 : 0.72}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <pointLight
        position={[0, height * 0.72, 0.2]}
        color={accent}
        intensity={locked ? 0.18 : 1.6}
        distance={4.5}
      />
    </group>
  );
}

/* ====================================================== */
/* REACT CORE */
/* ====================================================== */

function ReactCore({ locked }) {
  const coreRef = useRef(null);

  const ringOneRef = useRef(null);

  const ringTwoRef = useRef(null);

  const ringThreeRef = useRef(null);

  const haloRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 2.8) * 0.045;

      coreRef.current.scale.setScalar(pulse);

      coreRef.current.rotation.y = time * 0.24;
    }

    if (ringOneRef.current) {
      ringOneRef.current.rotation.z = time * 0.36;
    }

    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.z = -time * 0.24;

      ringTwoRef.current.rotation.x =
        Math.PI / 2.7 + Math.sin(time * 0.45) * 0.08;
    }

    if (ringThreeRef.current) {
      ringThreeRef.current.rotation.y = time * 0.3;
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = -time * 0.08;
    }
  });

  return (
    <group position={[0, 3.65, 0]}>
      {/* CENTRAL SPIRE */}

      <mesh castShadow position={[0, -1.45, 0]}>
        <cylinderGeometry args={[0.7, 1.12, 3, 12]} />

        <meshStandardMaterial
          color={DARK}
          emissive={VIOLET}
          emissiveIntensity={locked ? 0.04 : 0.16}
          metalness={0.93}
          roughness={0.17}
        />
      </mesh>

      {/* CORE */}

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.58, 2]} />

        <meshStandardMaterial
          color={locked ? "#535b7f" : WHITE}
          emissive={locked ? "#4d477d" : VIOLET}
          emissiveIntensity={locked ? 0.65 : 5.5}
          roughness={0.07}
          metalness={0.12}
        />
      </mesh>

      {/* REACT-LIKE ORBITS */}

      <mesh ref={ringOneRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.045, 10, 110]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={locked ? 0.16 : 0.78}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ringTwoRef} rotation={[Math.PI / 2.7, 0.55, 0]}>
        <torusGeometry args={[1.28, 0.032, 10, 100]} />

        <meshBasicMaterial
          color={VIOLET}
          transparent
          opacity={locked ? 0.14 : 0.67}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={ringThreeRef} rotation={[0.4, 0, Math.PI / 2]}>
        <torusGeometry args={[0.96, 0.022, 10, 96]} />

        <meshBasicMaterial
          color={PURPLE}
          transparent
          opacity={locked ? 0.1 : 0.54}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* OUTER HALO */}

      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.35, 0.018, 8, 120]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={locked ? 0.05 : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.72]}
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
            borderRadius: "50%",
            border: "1px solid rgba(54,216,255,.4)",
            background: "rgba(6,10,28,.8)",
            color: locked ? "#68708f" : "#7fe9ff",
            fontSize: "19px",
            fontWeight: 900,
            boxShadow: "0 0 26px rgba(128,103,255,.25)",
          }}
        >
          ⚛
        </div>
      </Html>

      <pointLight color={VIOLET} intensity={locked ? 0.7 : 6.5} distance={13} />

      <pointLight
        position={[0, 0, 1.4]}
        color={CYAN}
        intensity={locked ? 0.35 : 3.2}
        distance={9}
      />
    </group>
  );
}

/* ====================================================== */
/* REACT NEXUS ISLAND */
/* ====================================================== */

function ReactNexusIsland({ level, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);

  const rimRef = useRef(null);

  const secondaryRimRef = useRef(null);

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

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (rimRef.current) {
      rimRef.current.rotation.z = time * 0.045;
    }

    if (secondaryRimRef.current) {
      secondaryRimRef.current.rotation.z = -time * 0.03;
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

  const towerA = [-2.35, 0.58, 0.35];

  const towerB = [2.35, 0.58, 0.35];

  const towerC = [-1.55, 0.58, -1.6];

  const towerD = [1.55, 0.58, -1.6];

  const nexusPoint = [0, 3.65, 0];

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

      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[level.radius, level.radius, 8, 22]} />

        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* MASSIVE ISLAND BODY */}

      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[level.radius, level.radius * 0.86, 0.95, 24]}
        />

        <meshStandardMaterial
          color="#141d38"
          roughness={0.86}
          metalness={0.12}
        />
      </mesh>

      {/* NEXUS SURFACE */}

      <mesh receiveShadow position={[0, 0.55, 0]}>
        <cylinderGeometry
          args={[level.radius * 0.95, level.radius * 0.98, 0.18, 28]}
        />

        <meshStandardMaterial
          color={locked ? "#11172d" : "#182b43"}
          emissive={VIOLET}
          emissiveIntensity={locked ? 0.015 : 0.06}
          roughness={0.76}
        />
      </mesh>

      <NexusUnderside radius={level.radius} />

      {/* DUAL ENERGY RIMS */}

      <mesh ref={rimRef} position={[0, 0.67, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[level.radius * 0.84, selected ? 0.08 : 0.045, 8, 120]}
        />

        <meshStandardMaterial
          color={completed ? COMPLETED : VIOLET}
          emissive={completed ? COMPLETED : VIOLET}
          emissiveIntensity={
            selected ? 7 : locked ? 0.65 : completed ? 2.6 : 4.2
          }
          transparent
          opacity={locked ? 0.28 : 0.92}
        />
      </mesh>

      <mesh
        ref={secondaryRimRef}
        position={[0, 0.7, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[level.radius * 0.7, 0.018, 8, 110]} />

        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={locked ? 0.08 : 0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* REACT CORE */}

      <ReactCore locked={locked} />

      {/* NEXUS TOWERS */}

      <NexusTower
        position={towerA}
        height={3.8}
        accent={CYAN}
        delay={0}
        locked={locked}
      />

      <NexusTower
        position={towerB}
        height={3.8}
        accent={VIOLET}
        delay={1.1}
        locked={locked}
      />

      <NexusTower
        position={towerC}
        height={4.8}
        accent={PURPLE}
        delay={2.2}
        locked={locked}
      />

      <NexusTower
        position={towerD}
        height={4.8}
        accent={CYAN}
        delay={3.3}
        locked={locked}
      />

      {/* DATA NETWORK */}

      <DataLink
        from={[towerA[0], 3.1, towerA[2]]}
        to={nexusPoint}
        locked={locked}
        seed={1}
      />

      <DataLink
        from={[towerB[0], 3.1, towerB[2]]}
        to={nexusPoint}
        locked={locked}
        seed={2}
      />

      <DataLink
        from={[towerC[0], 4.1, towerC[2]]}
        to={nexusPoint}
        locked={locked}
        seed={3}
      />

      <DataLink
        from={[towerD[0], 4.1, towerD[2]]}
        to={nexusPoint}
        locked={locked}
        seed={4}
      />

      {/* FLOATING COMPONENTS */}

      <ComponentCard
        position={[-2.45, 4.35, 1.3]}
        rotation={[0, 0.2, 0]}
        label="<Header />"
        accent={CYAN}
        delay={0.3}
        locked={locked}
      />

      <ComponentCard
        position={[2.45, 4.15, 1.2]}
        rotation={[0, -0.2, 0]}
        label="<Card />"
        accent={VIOLET}
        delay={1.4}
        locked={locked}
      />

      <ComponentCard
        position={[-2, 5.35, -1.15]}
        rotation={[0, 0.28, 0]}
        label="useState()"
        accent={PURPLE}
        delay={2.5}
        locked={locked}
      />

      <ComponentCard
        position={[2, 5.35, -1.15]}
        rotation={[0, -0.28, 0]}
        label="props"
        accent={CYAN}
        delay={3.6}
        locked={locked}
      />

      {/* NEXUS PARTICLES */}

      <Sparkles
        count={92}
        scale={[level.radius * 1.7, 7, level.radius * 1.7]}
        size={2.1}
        speed={locked ? 0.12 : 0.3}
        opacity={locked ? 0.2 : 0.58}
        color={CYAN}
      />

      <Sparkles
        count={54}
        scale={[level.radius * 1.35, 5.5, level.radius * 1.35]}
        size={1.9}
        speed={locked ? 0.08 : 0.22}
        opacity={locked ? 0.12 : 0.42}
        color={VIOLET}
      />

      {/* LOCK FIELD */}

      {locked && (
        <>
          <mesh position={[0, 3.25, 0]}>
            <sphereGeometry args={[level.radius * 0.92, 30, 22]} />

            <meshBasicMaterial
              color={VIOLET}
              wireframe
              transparent
              opacity={0.04}
            />
          </mesh>

          <Html
            transform
            center
            distanceFactor={7}
            position={[0, 6.05, 0.15]}
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
                border: "1px solid rgba(128,103,255,.3)",
                background: "rgba(7,10,28,.86)",
                color: "#8475d8",
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
            position={[0, 6.9, 0.25]}
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

      {/* LEVEL LABEL */}

      <Html
        position={[0, 8.05, 0]}
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
        position={[0, 5.2, 1]}
        color={VIOLET}
        intensity={locked ? 0.55 : 4}
        distance={15}
      />

      <pointLight
        position={[0, 4.5, -1.7]}
        color={CYAN}
        intensity={locked ? 0.35 : 3}
        distance={13}
      />
    </group>
  );
}

export default ReactNexusIsland;
