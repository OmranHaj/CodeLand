import { useEffect, useMemo, useRef, useState } from "react";
import HTMLFoundationsIsland from "./HTMLFoundationsIsland";
import CSSStylingIsland from "./CSSStylingIsland";
import JavaScriptCoreIsland from "./JavaScriptCoreIsland";
import ReactNexusIsland from "./ReactNexusIsland";
import ProjectShowcaseIsland from "./ProjectShowcaseIsland";
import RobotJourney from "./RobotJourney";
import {
  Html,
  OrbitControls,
  Sparkles,
  Stars,
  useCursor,
} from "@react-three/drei";

import { useFrame, useThree } from "@react-three/fiber";

import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";

import * as THREE from "three";
import gsap from "gsap";

import { LockKeyhole } from "lucide-react";

import { WEB_WORLD_CAMERA } from "../../data/webWorldLevels";

import styles from "../../pages/StudentWorld/StudentWorld.module.css";

/* ====================================================== */
/* SEEDED RANDOM */
/* ====================================================== */

function seededRandom(seed) {
  const value = Math.sin(seed * 999.91) * 43758.5453;

  return value - Math.floor(value);
}

/* ====================================================== */
/* SKY */
/* ====================================================== */

function WorldSky() {
  const vertexShader = `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition =
        modelMatrix *
        vec4(position, 1.0);

      vWorldPosition =
        worldPosition.xyz;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vWorldPosition;

    void main() {
      float height =
        normalize(
          vWorldPosition
        ).y * 0.5 + 0.5;

      vec3 bottomColor =
        vec3(
          0.012,
          0.018,
          0.055
        );

      vec3 middleColor =
        vec3(
          0.035,
          0.04,
          0.14
        );

      vec3 topColor =
        vec3(
          0.008,
          0.012,
          0.035
        );

      vec3 color =
        mix(
          bottomColor,
          middleColor,
          smoothstep(
            0.15,
            0.55,
            height
          )
        );

      color =
        mix(
          color,
          topColor,
          smoothstep(
            0.6,
            1.0,
            height
          )
        );

      gl_FragColor =
        vec4(color, 1.0);
    }
  `;

  return (
    <mesh scale={75}>
      <sphereGeometry args={[1, 20, 20]} />

      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ====================================================== */
/* ATMOSPHERE */
/* ====================================================== */

function Atmosphere() {
  return (
    <>
      <WorldSky />

      <fog attach="fog" args={["#080b1d", 20, 55]} />

      <Stars
        radius={70}
        depth={45}
        count={1100}
        factor={3.2}
        saturation={0.15}
        fade
        speed={0.18}
      />

      <Sparkles
        count={60}
        scale={[45, 22, 45]}
        size={2.4}
        speed={0.12}
        opacity={0.46}
        color="#8c76ff"
      />

      <ambientLight intensity={0.82} />

      <hemisphereLight intensity={1.4} color="#91a9ff" groundColor="#050712" />

      <directionalLight
        castShadow
        intensity={1.8}
        position={[-10, 16, 12]}
        color="#e6ecff"
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <pointLight
        position={[0, 12, -8]}
        color="#755cff"
        intensity={3.5}
        distance={28}
      />
    </>
  );
}

/* ====================================================== */
/* ROCK UNDERSIDE */
/* ====================================================== */

function IslandUnderside({ radius, seed }) {
  const rocks = useMemo(() => {
    return Array.from({
      length: 15,
    }).map((_, index) => {
      const a = seededRandom(seed + index * 2.1) * Math.PI * 2;

      const distance =
        radius * (0.15 + seededRandom(seed + index * 3.14) * 0.62);

      const size = 0.42 + seededRandom(seed + index * 4.73) * 0.72;

      const height = 1.8 + seededRandom(seed + index * 7.13) * 3.4;

      return {
        position: [
          Math.cos(a) * distance,

          -1.1 - height / 2,

          Math.sin(a) * distance,
        ],

        scale: [size, height, size],

        rotation: seededRandom(seed + index * 10.4) * Math.PI,
      };
    });
  }, [radius, seed]);

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
            color={index % 2 === 0 ? "#11182a" : "#0b1120"}
            roughness={0.92}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* TREE */
/* ====================================================== */

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.6, 7]} />

        <meshStandardMaterial color="#171323" roughness={0.9} />
      </mesh>

      <mesh castShadow position={[0, 0.78, 0]}>
        <icosahedronGeometry args={[0.38, 1]} />

        <meshStandardMaterial color="#163630" roughness={0.8} />
      </mesh>

      <mesh castShadow position={[0.14, 0.88, 0]} scale={0.7}>
        <icosahedronGeometry args={[0.35, 1]} />

        <meshStandardMaterial color="#1e4a3e" roughness={0.8} />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* CRYSTALS */
/* ====================================================== */

function CrystalCluster({ position, accent }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} scale={[0.22, 0.65, 0.22]}>
        <octahedronGeometry args={[0.5, 0]} />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={2.7}
          roughness={0.15}
          metalness={0.3}
        />
      </mesh>

      <mesh position={[0.3, 0.18, 0.08]} scale={[0.14, 0.42, 0.14]}>
        <octahedronGeometry args={[0.5, 0]} />

        <meshStandardMaterial
          color="#54ddff"
          emissive="#54ddff"
          emissiveIntensity={2}
        />
      </mesh>

      <pointLight color={accent} intensity={1.6} distance={3} />
    </group>
  );
}

/* ====================================================== */
/* VEGETATION */
/* ====================================================== */

function IslandDecor({ radius, accent, seed }) {
  const trees = useMemo(() => {
    return Array.from({
      length: 7,
    }).map((_, index) => {
      const angle = seededRandom(seed + index * 5.31) * Math.PI * 2;

      const distance =
        radius * (0.58 + seededRandom(seed + index * 4.17) * 0.2);

      return {
        position: [
          Math.cos(angle) * distance,
          0.55,
          Math.sin(angle) * distance,
        ],

        scale: 0.65 + seededRandom(seed + index * 8.9) * 0.65,
      };
    });
  }, [radius, seed]);

  return (
    <>
      {trees.map((tree, index) => (
        <Tree key={index} position={tree.position} scale={tree.scale} />
      ))}

      <CrystalCluster
        position={[radius * 0.58, 0.55, radius * 0.28]}
        accent={accent}
      />

      <CrystalCluster
        position={[-radius * 0.48, 0.55, -radius * 0.5]}
        accent={accent}
      />
    </>
  );
}

/* ====================================================== */
/* ENERGY BRIDGE */
/* ====================================================== */

function EnergyBridge({ from, to, active = false }) {
  const particleRefs = useRef([]);

  const curve = useMemo(() => {
    const start = new THREE.Vector3(from[0], from[1] + 0.8, from[2]);

    const end = new THREE.Vector3(to[0], to[1] + 0.8, to[2]);

    const middle = start.clone().lerp(end, 0.5);

    middle.y += 0.5 + start.distanceTo(end) * 0.035;

    return new THREE.CatmullRomCurve3([start, middle, end]);
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!active) {
      return;
    }

    particleRefs.current.forEach((particle, index) => {
      if (!particle) {
        return;
      }

      const progress = (clock.elapsedTime * 0.07 + index * 0.27) % 1;

      particle.position.copy(curve.getPointAt(progress));
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 48, 0.17, 6, false]} />

        <meshStandardMaterial
          color="#11192e"
          metalness={0.78}
          roughness={0.35}
        />
      </mesh>

      <mesh>
        <tubeGeometry args={[curve, 48, 0.035, 6, false]} />

        <meshStandardMaterial
          color={active ? "#54dfff" : "#675bd6"}
          emissive={active ? "#54dfff" : "#675bd6"}
          emissiveIntensity={active ? 6 : 1.4}
          transparent
          opacity={active ? 0.95 : 0.25}
        />
      </mesh>

      {Array.from({
        length: active ? 2 : 0,
      }).map((_, index) => (
        <mesh
          key={index}
          ref={(element) => {
            particleRefs.current[index] = element;
          }}
        >
          <sphereGeometry args={[0.08, 12, 12]} />

          <meshBasicMaterial
            color={active ? "#ffffff" : "#8175ff"}
            transparent
            opacity={active ? 0.95 : 0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ====================================================== */
/* WATERFALL */
/* ====================================================== */

function Waterfall({ position, width = 1.5, height = 4 }) {
  return (
    <group position={position}>
      {[0, 1].map((index) => (
        <mesh
          key={index}
          position={[(index - 1) * width * 0.18, -height / 2, -index * 0.015]}
        >
          <planeGeometry args={[width * 0.5, height]} />

          <meshBasicMaterial
            color="#65d5ff"
            transparent
            opacity={0.08 + index * 0.025}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      <group position={[0, -height, 0]}>
        <Sparkles
          count={8}
          scale={[width * 2, 0.7, 1.5]}
          size={2.6}
          speed={0.22}
          opacity={0.28}
          color="#9eeeff"
        />
      </group>
    </group>
  );
}

/* ====================================================== */
/* START GATE */
/* ====================================================== */

function StartGateway({ accent }) {
  const ringRef = useRef(null);

  const lightRef = useRef(null);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.07;
    }

    if (lightRef.current) {
      lightRef.current.intensity = 3.5 + Math.sin(clock.elapsedTime * 2) * 0.9;
    }
  });

  return (
    <group position={[-0.1, 0.7, 1.6]} rotation={[0, Math.PI, 0]}>
      <mesh position={[-0.85, 1.25, 0]}>
        <boxGeometry args={[0.25, 2.5, 0.5]} />

        <meshStandardMaterial
          color="#11192b"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[0.85, 1.25, 0]}>
        <boxGeometry args={[0.25, 2.5, 0.5]} />

        <meshStandardMaterial
          color="#11192b"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>

      <mesh ref={ringRef} position={[0, 2.15, 0]}>
        <torusGeometry args={[0.88, 0.1, 12, 64, Math.PI]} />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={5}
        />
      </mesh>

      <mesh position={[0, 1.2, 0]}>
        <planeGeometry args={[1.45, 2.2]} />

        <meshBasicMaterial
          color="#46d8ff"
          transparent
          opacity={0.055}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 1.3, 0.7]}
        color="#45d7ff"
        intensity={4}
        distance={6}
      />
    </group>
  );
}

/* ====================================================== */
/* BASIC LANDMARK */
/* ====================================================== */

function BasicLandmark({ level }) {
  const floatRef = useRef(null);

  useFrame(({ clock }) => {
    if (!floatRef.current) {
      return;
    }

    floatRef.current.position.y =
      2.7 + Math.sin(clock.elapsedTime * 1.15 + Number(level.order)) * 0.08;

    floatRef.current.rotation.y += 0.003;
  });

  return (
    <group>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.35, 1.6, 0.45, 28]} />

        <meshStandardMaterial
          color="#10192d"
          metalness={0.85}
          roughness={0.24}
        />
      </mesh>

      <mesh castShadow position={[0, 2.15, 0]}>
        <boxGeometry args={[1.5, 1.6, 1.15]} />

        <meshStandardMaterial
          color="#11192c"
          emissive={level.accent}
          emissiveIntensity={level.status === "locked" ? 0.12 : 0.55}
          metalness={0.82}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 2.15, 0.59]}>
        <planeGeometry args={[1, 1.05]} />

        <meshBasicMaterial
          color={level.accent}
          transparent
          opacity={level.status === "locked" ? 0.18 : 0.85}
        />
      </mesh>

      <group ref={floatRef}>
        <Html transform center distanceFactor={5} position={[0, 0, 0.65]}>
          <div
            className={styles.monumentBadge}
            style={{
              "--badge-accent": level.accent,
            }}
          >
            {level.code}
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* REACT NEXUS */
/* ====================================================== */

function ReactNexus({ level }) {
  const ringOne = useRef(null);

  const ringTwo = useRef(null);

  const coreRef = useRef(null);

  useFrame(({ clock }) => {
    if (ringOne.current) {
      ringOne.current.rotation.z = clock.elapsedTime * 0.12;
    }

    if (ringTwo.current) {
      ringTwo.current.rotation.z = -clock.elapsedTime * 0.08;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(
        1 + Math.sin(clock.elapsedTime * 2) * 0.07,
      );
    }
  });

  return (
    <group>
      {/* CENTRAL CITADEL */}

      <mesh castShadow position={[0, 3, 0]}>
        <cylinderGeometry args={[1.45, 1.9, 5.2, 16]} />

        <meshStandardMaterial
          color="#101631"
          emissive="#604cff"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.18}
        />
      </mesh>

      {/* TOWERS */}

      {[
        [-2.4, 2.8, 0.4],
        [2.4, 2.8, 0.4],
        [-1.55, 3.8, -0.6],
        [1.55, 3.8, -0.6],
      ].map((position, index) => (
        <mesh key={index} castShadow position={position}>
          <boxGeometry
            args={[index < 2 ? 0.55 : 0.45, index < 2 ? 5 : 6.8, 0.75]}
          />

          <meshStandardMaterial
            color="#101a38"
            emissive={index % 2 ? level.accent : level.secondaryAccent}
            emissiveIntensity={0.14}
            metalness={0.9}
            roughness={0.18}
          />
        </mesh>
      ))}

      {/* CORE */}

      <mesh ref={coreRef} position={[0, 4.25, 1]}>
        <icosahedronGeometry args={[0.55, 2]} />

        <meshStandardMaterial
          color="#6be5ff"
          emissive="#695cff"
          emissiveIntensity={5}
          metalness={0.2}
          roughness={0.08}
        />
      </mesh>

      {/* RINGS */}

      <mesh ref={ringOne} position={[0, 4.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.2, 0.055, 10, 100]} />

        <meshBasicMaterial color="#715cff" transparent opacity={0.72} />
      </mesh>

      <mesh
        ref={ringTwo}
        position={[0, 4.3, 0]}
        rotation={[Math.PI / 2.4, 0.5, 0]}
      >
        <torusGeometry args={[2.55, 0.035, 10, 100]} />

        <meshBasicMaterial color="#3bd8ff" transparent opacity={0.65} />
      </mesh>

      <pointLight
        position={[0, 5, 2]}
        color="#7863ff"
        intensity={6}
        distance={13}
      />
    </group>
  );
}

/* ====================================================== */
/* PROJECT CRYSTAL */
/* ====================================================== */

function ProjectLandmark({ level }) {
  const crystalRef = useRef(null);

  useFrame(({ clock }) => {
    if (!crystalRef.current) {
      return;
    }

    crystalRef.current.rotation.y = clock.elapsedTime * 0.3;

    crystalRef.current.position.y =
      3.1 + Math.sin(clock.elapsedTime * 1.4) * 0.2;
  });

  return (
    <group>
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[1.4, 1.75, 0.5, 32]} />

        <meshStandardMaterial
          color="#11192d"
          metalness={0.85}
          roughness={0.23}
        />
      </mesh>

      <mesh ref={crystalRef}>
        <octahedronGeometry args={[1, 0]} />

        <meshStandardMaterial
          color={level.secondaryAccent}
          emissive={level.accent}
          emissiveIntensity={3}
          metalness={0.25}
          roughness={0.08}
        />
      </mesh>

      <pointLight
        position={[0, 3, 0]}
        color={level.accent}
        intensity={4}
        distance={9}
      />
    </group>
  );
}

/* ====================================================== */
/* LANDMARK */
/* ====================================================== */

function LevelLandmark({ level }) {
  if (level.id === "react-nexus") {
    return <ReactNexus level={level} />;
  }

  if (level.id === "project-showcase") {
    return <ProjectLandmark level={level} />;
  }

  return <BasicLandmark level={level} />;
}

/* ====================================================== */
/* FLOATING ISLAND */
/* ====================================================== */

function FloatingIsland({ level, index, selected, onSelect, onLocked }) {
  const rootRef = useRef(null);

  const [hovered, setHovered] = useState(false);

  const locked = level.status === "locked";

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

      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[level.radius, level.radius, 4.5, 16]} />

        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* ISLAND TOP */}

      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry
          args={[level.radius, level.radius * 0.88, 0.85, 18]}
        />

        <meshStandardMaterial
          color="#172238"
          roughness={0.9}
          metalness={0.08}
        />
      </mesh>

      {/* GRASS */}

      <mesh receiveShadow position={[0, 0.49, 0]}>
        <cylinderGeometry
          args={[level.radius * 0.95, level.radius * 0.98, 0.16, 22]}
        />

        <meshStandardMaterial
          color={locked ? "#11192a" : "#17342f"}
          roughness={0.82}
        />
      </mesh>

      <IslandUnderside radius={level.radius} seed={20 + index * 31} />

      <IslandDecor
        radius={level.radius}
        accent={level.accent}
        seed={100 + index * 43}
      />

      {/* ENERGY RIM */}

      <mesh position={[0, 0.61, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry
          args={[level.radius * 0.82, selected ? 0.07 : 0.035, 8, 72]}
        />

        <meshStandardMaterial
          color={level.accent}
          emissive={level.accent}
          emissiveIntensity={selected ? 7 : locked ? 0.5 : 3}
          transparent
          opacity={locked ? 0.24 : 0.9}
        />
      </mesh>

      {/* LANDMARK */}

      <LevelLandmark level={level} />

      {/* START GATE */}

      {level.status === "current" && <StartGateway accent="#42d8ff" />}

      {/* LOCK SHIELD */}

      {locked && (
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[level.radius * 0.87, 24, 18]} />

          <meshBasicMaterial
            color="#7765ff"
            wireframe
            transparent
            opacity={0.035}
          />
        </mesh>
      )}

      {/* LABEL */}

      <Html
        position={[0, level.id === "react-nexus" ? 7.5 : 4.65, 0]}
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

            {locked ? <LockKeyhole size={11} /> : <strong>CURRENT</strong>}
          </div>

          <h3>{level.title}</h3>

          <p>{level.subtitle}</p>
        </div>
      </Html>

      <pointLight
        position={[0, 2.8, 0]}
        color={level.accent}
        intensity={locked ? 0.3 : 2.3}
        distance={9}
      />
    </group>
  );
}

/* ====================================================== */
/* BACKGROUND FLOATING ROCKS */
/* ====================================================== */

function FloatingWorldDecor() {
  const positions = useMemo(
    () => [
      [-12, 5, -10],
      [-9, 8, -20],
      [10, 7, -17],
      [13, 4, -5],
      [-14, 3, -2],
      [5, 11, -25],
      [-5, 12, -28],
      [16, 9, -19],
      [-16, 8, -22],
    ],
    [],
  );

  return (
    <>
      {positions.map((position, index) => (
        <mesh
          key={index}
          position={position}
          rotation={[index * 0.23, index * 0.61, index * 0.12]}
          scale={0.6 + (index % 3) * 0.34}
        >
          <octahedronGeometry args={[0.8, 0]} />

          <meshStandardMaterial
            color="#10172a"
            roughness={0.95}
            metalness={0.08}
          />
        </mesh>
      ))}
    </>
  );
}

/* ====================================================== */
/* CAMERA */
/* ====================================================== */

function CameraDirector({ selectedLevel, disabled = false }) {
  const { camera } = useThree();

  const controlsRef = useRef(null);

  useEffect(() => {
    gsap.killTweensOf(camera.position);

    if (controlsRef.current) {
      gsap.killTweensOf(controlsRef.current.target);
    }

    if (disabled) {
      return;
    }

    const destination = selectedLevel
      ? selectedLevel.cameraPosition
      : WEB_WORLD_CAMERA.position;

    const target = selectedLevel
      ? selectedLevel.cameraTarget
      : WEB_WORLD_CAMERA.target;

    gsap.to(camera.position, {
      x: destination[0],
      y: destination[1],
      z: destination[2],

      duration: 1.75,

      ease: "power3.inOut",
    });

    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: target[0],
        y: target[1],
        z: target[2],

        duration: 1.75,

        ease: "power3.inOut",

        onUpdate: () => {
          controlsRef.current?.update();
        },
      });
    }
  }, [selectedLevel, camera, disabled]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!disabled}
      enableDamping
      dampingFactor={0.055}
      enablePan={false}
      enableZoom={!selectedLevel && !disabled}
      enableRotate={!selectedLevel && !disabled}
      minDistance={13}
      maxDistance={24}
      minPolarAngle={Math.PI / 4.4}
      maxPolarAngle={Math.PI / 2.2}
      target={WEB_WORLD_CAMERA.target}
    />
  );
}

/* ====================================================== */
/* POST PROCESSING */
/* ====================================================== */

function WorldEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.75}
        luminanceSmoothing={0.3}
        mipmapBlur
      />

      <Vignette eskil={false} offset={0.2} darkness={0.64} />
    </EffectComposer>
  );
}

/* ====================================================== */
/* WEB WORLD SCENE */
/* ====================================================== */

function WebWorldScene({
  levels = [],
  currentLevelId,
  journeyLevelId,
  selectedLevel,
  onSelect,
  onLocked,
  journeyActive,
  onJourneyPhase,
  onJourneyComplete,
}) {
  /* ==================================================== */
  /* LEVEL REFERENCES */
  /* ==================================================== */

  const html =
    levels.find((level) => level.id === "html-foundations") || levels[0];

  const css = levels.find((level) => level.id === "css-styling") || levels[1];

  const javascript =
    levels.find((level) => level.id === "javascript-core") || levels[2];

  const react = levels.find((level) => level.id === "react-nexus") || levels[3];

  const project =
    levels.find((level) => level.id === "project-showcase") || levels[4];

  /* ==================================================== */
  /* CURRENT LEVEL */
  /* ==================================================== */

  const currentLevel =
    levels.find((level) => level.id === currentLevelId) ||
    levels.find((level) => level.status === "current") ||
    html;

  /* ==================================================== */
  /* JOURNEY LEVEL */
  /* ==================================================== */

  const journeyLevel =
    levels.find((level) => level.id === journeyLevelId) || currentLevel || html;

  /* ==================================================== */
  /* SAFETY */
  /* ==================================================== */

  if (!html || !css || !javascript || !react || !project) {
    return null;
  }

  const isUnlocked = (levelId) => {
    const level = levels.find((item) => item.id === levelId);

    return Boolean(level && level.status !== "locked");
  };

  /* ==================================================== */
  /* RENDER */
  /* ==================================================== */

  return (
    <>
      <Atmosphere />

      {/* =============================================== */}
      {/* PATH NETWORK */}
      {/* =============================================== */}

      <EnergyBridge
        from={html.position}
        to={css.position}
        active={isUnlocked("css-styling")}
      />

      <EnergyBridge
        from={css.position}
        to={javascript.position}
        active={isUnlocked("javascript-core")}
      />

      <EnergyBridge
        from={css.position}
        to={react.position}
        active={isUnlocked("react-nexus")}
      />

      <EnergyBridge
        from={javascript.position}
        to={react.position}
        active={isUnlocked("react-nexus")}
      />

      <EnergyBridge
        from={react.position}
        to={project.position}
        active={isUnlocked("project-showcase")}
      />

      {/* =============================================== */}
      {/* LEVEL ISLANDS */}
      {/* =============================================== */}

      {levels.map((level, index) => {
        const isSelected = selectedLevel?.id === level.id;

        if (level.id === "html-foundations") {
          return (
            <HTMLFoundationsIsland
              key={level.id}
              level={level}
              selected={isSelected}
              onSelect={onSelect}
              onLocked={onLocked}
            />
          );
        }

        if (level.id === "css-styling") {
          return (
            <CSSStylingIsland
              key={level.id}
              level={level}
              selected={isSelected}
              onSelect={onSelect}
              onLocked={onLocked}
            />
          );
        }

        if (level.id === "javascript-core") {
          return (
            <JavaScriptCoreIsland
              key={level.id}
              level={level}
              selected={isSelected}
              onSelect={onSelect}
              onLocked={onLocked}
            />
          );
        }

        if (level.id === "react-nexus") {
          return (
            <ReactNexusIsland
              key={level.id}
              level={level}
              selected={isSelected}
              onSelect={onSelect}
              onLocked={onLocked}
            />
          );
        }

        if (level.id === "project-showcase") {
          return (
            <ProjectShowcaseIsland
              key={level.id}
              level={level}
              selected={isSelected}
              onSelect={onSelect}
              onLocked={onLocked}
            />
          );
        }

        return (
          <FloatingIsland
            key={level.id}
            level={level}
            index={index}
            selected={isSelected}
            onSelect={onSelect}
            onLocked={onLocked}
          />
        );
      })}

      {/* =============================================== */}
      {/* WATERFALLS */}
      {/* =============================================== */}

      <Waterfall position={[-7, -1.1, 4.45]} width={1.5} height={5} />

      <Waterfall position={[-2.2, -0.1, -1.2]} width={1.3} height={5.8} />

      <Waterfall position={[0.5, 1.6, -6.65]} width={2} height={7} />

      <Waterfall position={[8.2, 1.1, -6.15]} width={1.15} height={5.5} />

      {/* =============================================== */}
      {/* PLAYER */}
      {/* =============================================== */}

      <RobotJourney
        level={journeyLevel}
        active={journeyActive}
        onPhaseChange={onJourneyPhase}
        onComplete={onJourneyComplete}
      />

      {/* =============================================== */}
      {/* DECOR */}
      {/* =============================================== */}

      <FloatingWorldDecor />

      {/* =============================================== */}
      {/* CAMERA */}
      {/* =============================================== */}

      <CameraDirector selectedLevel={selectedLevel} disabled={journeyActive} />

      {/* =============================================== */}
      {/* CINEMATIC EFFECTS */}
      {/* =============================================== */}

      <WorldEffects />
    </>
  );
}

export default WebWorldScene;
