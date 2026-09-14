import { useEffect, useMemo, useRef, useState } from "react";

import { Html, Sparkles, useCursor } from "@react-three/drei";

import { useFrame } from "@react-three/fiber";

import * as THREE from "three";
import gsap from "gsap";

import { CheckCircle2, LockKeyhole } from "lucide-react";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

const YELLOW = "#ffd34e";
const ORANGE = "#ff873c";
const ELECTRIC = "#ffb347";
const WHITE_HOT = "#fff7cf";
const DARK = "#111522";
const DARK_METAL = "#161c2b";

const COMPLETED = "#6df2b3";
/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function seededRandom(seed) {
  const value = Math.sin(seed * 812.37) * 43758.5453;
  return value - Math.floor(value);
}

/* ====================================================== */
/* ISLAND UNDERSIDE */
/* ====================================================== */

function ReactorUnderside({ radius }) {
  const spikes = useMemo(() => {
    return Array.from({ length: 19 }).map((_, index) => {
      const angle = seededRandom(index * 5.7 + 2) * Math.PI * 2;

      const distance = radius * (0.14 + seededRandom(index * 7.9 + 6) * 0.66);

      const height = 1.9 + seededRandom(index * 4.2 + 11) * 3.8;

      const width = 0.35 + seededRandom(index * 9.3 + 3) * 0.6;

      return {
        position: [
          Math.cos(angle) * distance,
          -1.08 - height / 2,
          Math.sin(angle) * distance,
        ],
        scale: [width, height, width],
        rotation: seededRandom(index * 12.6 + 4) * Math.PI,
      };
    });
  }, [radius]);

  return (
    <group>
      {spikes.map((spike, index) => (
        <mesh
          key={index}
          castShadow
          receiveShadow
          position={spike.position}
          rotation={[0, spike.rotation, Math.PI]}
          scale={spike.scale}
        >
          <coneGeometry args={[0.8, 1, 6]} />

          <meshStandardMaterial
            color={index % 2 === 0 ? "#121725" : "#0c111d"}
            roughness={0.9}
            metalness={0.16}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* LOGIC GLYPH */
/* ====================================================== */

function LogicGlyph({ text, position, color = YELLOW, delay = 0, scale = 1 }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = clock.elapsedTime + delay;

    ref.current.position.y = position[1] + Math.sin(time * 1.35) * 0.08;

    ref.current.rotation.y = Math.sin(time * 0.55) * 0.08;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <planeGeometry args={[0.92, 0.54]} />

        <meshStandardMaterial
          color="#141a28"
          emissive={color}
          emissiveIntensity={0.14}
          metalness={0.72}
          roughness={0.24}
          transparent
          opacity={0.94}
        />
      </mesh>

      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.88, 0.5]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.06]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            minWidth: "48px",
            padding: "5px 9px",
            borderRadius: "7px",
            border: `1px solid ${color}55`,
            background: "rgba(8,10,18,.78)",
            color,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: ".5px",
            textAlign: "center",
            boxShadow: `0 0 22px ${color}22`,
            whiteSpace: "nowrap",
          }}
        >
          {text}
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* ELECTRIC NODE */
/* ====================================================== */

function ElectricNode({ position, delay = 0, locked }) {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
  const coreRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime + delay;

    if (rootRef.current) {
      rootRef.current.position.y = position[1] + Math.sin(time * 1.8) * 0.055;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.8;
    }

    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3.4) * 0.08;

      coreRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={rootRef} position={position}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.18, 2]} />

        <meshStandardMaterial
          color={locked ? "#5f5735" : WHITE_HOT}
          emissive={locked ? "#6f5a22" : ORANGE}
          emissiveIntensity={locked ? 0.6 : 4}
          roughness={0.15}
          metalness={0.18}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.33, 0.018, 8, 48]} />

        <meshBasicMaterial
          color={YELLOW}
          transparent
          opacity={locked ? 0.24 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight
        color={ORANGE}
        intensity={locked ? 0.35 : 1.8}
        distance={3.3}
      />
    </group>
  );
}

/* ====================================================== */
/* ENERGY CONDUIT */
/* ====================================================== */

function EnergyConduit({ from, to, locked, seed = 0 }) {
  const pulseRefs = useRef([]);

  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const middle = start.clone().lerp(end, 0.5);

    middle.y += 0.13 + seededRandom(seed + 4) * 0.22;

    return new THREE.CatmullRomCurve3([start, middle, end]);
  }, [from, to, seed]);

  useFrame(({ clock }) => {
    pulseRefs.current.forEach((pulse, index) => {
      if (!pulse) return;

      const progress =
        (clock.elapsedTime * (locked ? 0.06 : 0.18) +
          index * 0.33 +
          seed * 0.03) %
        1;

      pulse.position.copy(curve.getPointAt(progress));
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 48, 0.025, 8, false]} />

        <meshBasicMaterial
          color={ORANGE}
          transparent
          opacity={locked ? 0.14 : 0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {Array.from({ length: 3 }).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            pulseRefs.current[index] = element;
          }}
        >
          <sphereGeometry args={[0.055, 12, 12]} />

          <meshBasicMaterial
            color={WHITE_HOT}
            transparent
            opacity={locked ? 0.25 : 0.95}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* REACTOR CORE */
/* ====================================================== */

function ReactorCore({ locked }) {
  const coreRef = useRef(null);
  const outerRingRef = useRef(null);
  const middleRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 3.2) * 0.05;

      coreRef.current.scale.setScalar(pulse);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = time * 0.22;
      outerRingRef.current.rotation.y = Math.sin(time * 0.4) * 0.13;
    }

    if (middleRingRef.current) {
      middleRingRef.current.rotation.z = -time * 0.38;
      middleRingRef.current.rotation.x =
        Math.PI / 2.6 + Math.sin(time * 0.55) * 0.08;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group position={[0, 1.72, -0.2]}>
      {/* REACTOR BASE */}

      <mesh castShadow position={[0, -0.78, 0]}>
        <cylinderGeometry args={[1.12, 1.38, 0.42, 24]} />

        <meshStandardMaterial
          color={DARK_METAL}
          emissive={ORANGE}
          emissiveIntensity={locked ? 0.04 : 0.16}
          metalness={0.88}
          roughness={0.22}
        />
      </mesh>

      <mesh castShadow position={[0, -0.47, 0]}>
        <cylinderGeometry args={[0.78, 1.02, 0.28, 20]} />

        <meshStandardMaterial
          color="#1b2231"
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>

      {/* CORE */}

      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.53, 2]} />

        <meshStandardMaterial
          color={locked ? "#625c42" : WHITE_HOT}
          emissive={locked ? "#725623" : ORANGE}
          emissiveIntensity={locked ? 0.6 : 5.5}
          metalness={0.14}
          roughness={0.08}
        />
      </mesh>

      {/* OUTER LOGIC RING */}

      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.045, 10, 96]} />

        <meshBasicMaterial
          color={YELLOW}
          transparent
          opacity={locked ? 0.18 : 0.75}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* MIDDLE RING */}

      <mesh ref={middleRingRef} rotation={[Math.PI / 2.6, 0.35, 0]}>
        <torusGeometry args={[0.94, 0.03, 10, 90]} />

        <meshBasicMaterial
          color={ORANGE}
          transparent
          opacity={locked ? 0.16 : 0.68}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* INNER RING */}

      <mesh ref={innerRingRef} rotation={[0.35, 0, Math.PI / 2]}>
        <torusGeometry args={[0.7, 0.022, 10, 80]} />

        <meshBasicMaterial
          color={WHITE_HOT}
          transparent
          opacity={locked ? 0.1 : 0.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* JS BADGE */}

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 0, 0.62]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            display: "grid",
            placeItems: "center",
            borderRadius: "8px",
            border: "1px solid rgba(255,211,78,.35)",
            background: "rgba(12,11,8,.82)",
            color: locked ? "#8b8054" : YELLOW,
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: "13px",
            fontWeight: 950,
            boxShadow: "0 0 24px rgba(255,135,60,.22)",
          }}
        >
          JS
        </div>
      </Html>

      <pointLight color={ORANGE} intensity={locked ? 0.65 : 6} distance={10} />
    </group>
  );
}

/* ====================================================== */
/* JAVASCRIPT CORE ISLAND */
/* ====================================================== */

function JavaScriptCoreIsland({ level, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);
  const rimRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const locked = level.status === "locked";
  const completed = level.status === "completed";

  useCursor(hovered, locked ? "not-allowed" : "pointer", "auto");

  useEffect(() => {
    if (!rootRef.current) return;

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
    if (rimRef.current) {
      rimRef.current.rotation.z = clock.elapsedTime * 0.075;
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

  const nodeA = [-1.55, 0.9, 1.0];
  const nodeB = [1.45, 0.92, 1.08];
  const nodeC = [-1.45, 0.86, -1.05];
  const nodeD = [1.6, 0.9, -0.88];
  const core = [0, 1.72, -0.2];

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

      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[level.radius, level.radius, 5.2, 20]} />

        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ISLAND BODY */}

      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[level.radius, level.radius * 0.87, 0.88, 20]}
        />

        <meshStandardMaterial
          color="#211c19"
          roughness={0.88}
          metalness={0.12}
        />
      </mesh>

      {/* REACTOR FLOOR */}

      <mesh receiveShadow position={[0, 0.51, 0]}>
        <cylinderGeometry
          args={[level.radius * 0.95, level.radius * 0.98, 0.17, 26]}
        />

        <meshStandardMaterial
          color={locked ? "#19191d" : "#2b281b"}
          emissive={ORANGE}
          emissiveIntensity={locked ? 0.02 : 0.08}
          roughness={0.78}
        />
      </mesh>

      <ReactorUnderside radius={level.radius} />

      {/* OUTER POWER RIM */}

      <mesh ref={rimRef} position={[0, 0.63, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[level.radius * 0.82, selected ? 0.075 : 0.04, 8, 96]}
        />

        <meshStandardMaterial
          color={completed ? COMPLETED : YELLOW}
          emissive={completed ? COMPLETED : ORANGE}
          emissiveIntensity={selected ? 7 : locked ? 0.7 : completed ? 2.5 : 4}
          transparent
          opacity={locked ? 0.3 : 0.92}
        />
      </mesh>

      {/* CENTRAL REACTOR */}

      <ReactorCore locked={locked} />

      {/* ELECTRIC NODES */}

      <ElectricNode position={nodeA} delay={0} locked={locked} />

      <ElectricNode position={nodeB} delay={1.1} locked={locked} />

      <ElectricNode position={nodeC} delay={2.2} locked={locked} />

      <ElectricNode position={nodeD} delay={3.3} locked={locked} />

      {/* CONDUITS */}

      <EnergyConduit from={nodeA} to={core} locked={locked} seed={1} />

      <EnergyConduit from={nodeB} to={core} locked={locked} seed={2} />

      <EnergyConduit from={nodeC} to={core} locked={locked} seed={3} />

      <EnergyConduit from={nodeD} to={core} locked={locked} seed={4} />

      {/* LOGIC PANELS */}

      <LogicGlyph
        text="() =>"
        position={[-1.2, 2.45, 0.05]}
        color={YELLOW}
        delay={0.4}
      />

      <LogicGlyph
        text="{ }"
        position={[1.22, 2.3, 0.1]}
        color={ORANGE}
        delay={1.8}
      />

      <LogicGlyph
        text="if ( )"
        position={[0.05, 2.78, -0.85]}
        color={ELECTRIC}
        delay={2.7}
        scale={0.92}
      />

      {/* ELECTRIC PARTICLES */}

      <Sparkles
        count={58}
        scale={[level.radius * 1.7, 3.4, level.radius * 1.7]}
        size={2.3}
        speed={locked ? 0.14 : 0.38}
        opacity={locked ? 0.22 : 0.62}
        color={YELLOW}
      />

      {/* LOCK FIELD */}

      {locked && (
        <>
          <mesh position={[0, 2.15, 0]}>
            <sphereGeometry args={[level.radius * 0.9, 28, 20]} />

            <meshBasicMaterial
              color={ORANGE}
              wireframe
              transparent
              opacity={0.042}
            />
          </mesh>

          <Html
            transform
            center
            distanceFactor={7}
            position={[0, 3.18, 0.18]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
                border: "1px solid rgba(255,135,60,.28)",
                background: "rgba(16,12,8,.84)",
                color: "#b79248",
                boxShadow: "0 12px 35px rgba(0,0,0,.28)",
              }}
            >
              <LockKeyhole size={15} />
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
            position={[0, 3.82, 0.25]}
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
        position={[0, 5.05, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
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
        position={[0, 2.7, 0.5]}
        color={YELLOW}
        intensity={locked ? 0.55 : 3.4}
        distance={11}
      />

      <pointLight
        position={[0, 1.4, -1.6]}
        color={ORANGE}
        intensity={locked ? 0.35 : 2.4}
        distance={9}
      />
    </group>
  );
}

export default JavaScriptCoreIsland;
