import { useEffect, useRef, useState } from "react";
import { Html, Sparkles, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { CheckCircle2, LockKeyhole } from "lucide-react";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

const CYAN = "#40c8ff";
const PURPLE = "#8067ff";
const PINK = "#d267ff";
const DARK = "#10182b";

const COMPLETED = "#6df2b3";
function ColorOrb({ position, color, delay = 0 }) {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const time = clock.elapsedTime + delay;

    ref.current.position.y = position[1] + Math.sin(time * 1.6) * 0.08;

    ref.current.rotation.y = time * 0.45;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <icosahedronGeometry args={[0.2, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.7}
          roughness={0.15}
          metalness={0.25}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.015, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function GridPanel() {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.position.y = 2.05 + Math.sin(clock.elapsedTime * 1.2) * 0.06;
  });

  return (
    <group ref={ref} position={[-1.05, 2.05, 0.05]} rotation={[0, 0.2, 0]}>
      <mesh>
        <planeGeometry args={[1.15, 1.25, 5, 6]} />
        <meshBasicMaterial
          color={CYAN}
          wireframe
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.18, 1.28]} />
        <meshBasicMaterial
          color="#14233e"
          transparent
          opacity={0.62}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function TypographyPanel() {
  const ref = useRef(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.rotation.y = -0.18 + Math.sin(clock.elapsedTime * 0.6) * 0.025;
  });

  return (
    <group ref={ref} position={[1.05, 1.6, 0.1]}>
      <mesh>
        <boxGeometry args={[1.15, 0.92, 0.08]} />
        <meshStandardMaterial
          color="#101a35"
          emissive={PURPLE}
          emissiveIntensity={0.18}
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>

      {[
        { y: 0.24, width: 0.7, color: CYAN },
        { y: 0, width: 0.48, color: PINK },
        { y: -0.24, width: 0.82, color: PURPLE },
      ].map((line) => (
        <mesh key={line.y} position={[0, line.y, 0.05]}>
          <boxGeometry args={[line.width, 0.045, 0.018]} />
          <meshBasicMaterial color={line.color} />
        </mesh>
      ))}
    </group>
  );
}

function StyleGate({ locked }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    if (outerRef.current) {
      outerRef.current.rotation.z = time * 0.18;
    }

    if (innerRef.current) {
      innerRef.current.rotation.z = -time * 0.28;
    }
  });

  return (
    <group position={[0, 0.7, -0.5]}>
      <mesh position={[-0.82, 1.25, 0]}>
        <boxGeometry args={[0.18, 2.5, 0.38]} />
        <meshStandardMaterial
          color={DARK}
          metalness={0.85}
          roughness={0.22}
          emissive={PURPLE}
          emissiveIntensity={locked ? 0.08 : 0.28}
        />
      </mesh>

      <mesh position={[0.82, 1.25, 0]}>
        <boxGeometry args={[0.18, 2.5, 0.38]} />
        <meshStandardMaterial
          color={DARK}
          metalness={0.85}
          roughness={0.22}
          emissive={CYAN}
          emissiveIntensity={locked ? 0.08 : 0.28}
        />
      </mesh>

      <mesh ref={outerRef} position={[0, 1.45, 0.03]}>
        <torusGeometry args={[0.78, 0.055, 8, 40]} />
        <meshStandardMaterial
          color={PURPLE}
          emissive={PURPLE}
          emissiveIntensity={locked ? 0.5 : 4}
          transparent
          opacity={locked ? 0.35 : 0.95}
        />
      </mesh>

      <mesh ref={innerRef} position={[0, 1.45, 0.06]} scale={0.78}>
        <torusGeometry args={[0.78, 0.028, 8, 40]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={locked ? 0.25 : 0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Html
        transform
        center
        distanceFactor={5}
        position={[0, 1.45, 0.12]}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            padding: "5px 10px",
            borderRadius: "8px",
            border: "1px solid rgba(64,200,255,.35)",
            background: "rgba(7,13,30,.82)",
            color: locked ? "#78849d" : "#ffffff",
            fontFamily: "Arial, sans-serif",
            fontSize: "12px",
            fontWeight: 900,
            letterSpacing: "1px",
            boxShadow: "0 0 24px rgba(64,200,255,.18)",
            whiteSpace: "nowrap",
          }}
        >
          {"{ CSS }"}
        </div>
      </Html>
    </group>
  );
}

function CSSStylingIsland({ level, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);
  const ringRef = useRef(null);
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
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * 0.08;
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
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[level.radius, level.radius, 5, 20]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh castShadow receiveShadow>
        <cylinderGeometry
          args={[level.radius, level.radius * 0.88, 0.86, 18]}
        />
        <meshStandardMaterial
          color="#16233b"
          roughness={0.9}
          metalness={0.08}
        />
      </mesh>

      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry
          args={[level.radius * 0.95, level.radius * 0.98, 0.17, 20]}
        />
        <meshStandardMaterial
          color={locked ? "#111a2c" : "#183848"}
          roughness={0.78}
          emissive={PURPLE}
          emissiveIntensity={locked ? 0.015 : 0.06}
        />
      </mesh>

      <mesh
        ref={ringRef}
        position={[0, 0.62, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry
          args={[level.radius * 0.82, selected ? 0.07 : 0.04, 8, 56]}
        />
        <meshStandardMaterial
          color={completed ? COMPLETED : CYAN}
          emissive={completed ? COMPLETED : PURPLE}
          emissiveIntensity={
            selected ? 7 : locked ? 0.7 : completed ? 2.3 : 3.5
          }
          transparent
          opacity={locked ? 0.32 : 0.92}
        />
      </mesh>

      <StyleGate locked={locked} />
      <GridPanel />
      <TypographyPanel />

      <ColorOrb position={[-1.45, 0.92, 1]} color={CYAN} />
      <ColorOrb position={[-0.7, 0.82, 1.35]} color={PURPLE} delay={1.2} />
      <ColorOrb position={[1.35, 0.86, 1.05]} color={PINK} delay={2.1} />

      <Sparkles
        count={18}
        scale={[level.radius * 1.6, 3, level.radius * 1.6]}
        size={2.2}
        speed={0.22}
        opacity={locked ? 0.22 : 0.55}
        color={CYAN}
      />

      {locked && (
        <>
          <mesh position={[0, 2.1, 0]}>
            <sphereGeometry args={[level.radius * 0.9, 18, 12]} />
            <meshBasicMaterial
              color={PURPLE}
              wireframe
              transparent
              opacity={0.045}
            />
          </mesh>

          <Html
            transform
            center
            distanceFactor={7}
            position={[0, 3.05, 0.2]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                display: "grid",
                placeItems: "center",
                borderRadius: "10px",
                border: "1px solid rgba(128,103,255,.28)",
                background: "rgba(8,13,29,.82)",
                color: "#8c7cff",
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
            <torusGeometry args={[level.radius * 0.9, 0.025, 8, 56]} />

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
            position={[0, 3.65, 0.25]}
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

      <Html
        position={[0, 4.8, 0]}
        center
        distanceFactor={10}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`${styles.levelLabel} ${
            locked ? styles.levelLabelLocked : ""
          }`}
          style={{ "--level-accent": level.accent }}
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
    </group>
  );
}

export default CSSStylingIsland;
