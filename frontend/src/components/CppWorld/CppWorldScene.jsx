import { useEffect, useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

import {
  Float,
  Html,
  Line,
  Sparkles,
  useAnimations,
  useGLTF,
} from "@react-three/drei";

import * as THREE from "three";

/* ====================================================== */
/* CONSTANTS */
/* ====================================================== */

const STATUS_COLORS = {
  completed: "#63f2b1",
  current: "#6ee7ff",
  available: "#2f8cff",
};

const STATUS_SECONDARY = {
  completed: "#b8ffe0",
  current: "#5b74ff",
  available: "#6ee7ff",
};

const FLOOR_COLOR = "#050b15";
const METAL_MID = "#0d1b2e";
const METAL_LIGHT = "#152a43";
const ROBOT_YAW_OFFSET = Math.PI;

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function getLevelColor(level) {
  if (level.status === "completed") {
    return STATUS_COLORS.completed;
  }

  if (level.status === "current") {
    return level.accent || STATUS_COLORS.current;
  }

  return level.accent || STATUS_COLORS.available;
}

function getLevelSecondary(level) {
  if (level.status === "completed") {
    return STATUS_SECONDARY.completed;
  }

  if (level.status === "current") {
    return level.secondaryAccent || STATUS_SECONDARY.current;
  }

  return level.secondaryAccent || STATUS_SECONDARY.available;
}

function getEmissiveIntensity(level) {
  if (level.status === "completed") {
    return 2.15;
  }

  if (level.status === "current") {
    return 2.7;
  }

  return 1.1;
}

function buildEnergyRoutes(levels) {
  if (!Array.isArray(levels) || levels.length < 2) {
    return [];
  }

  return levels.slice(0, -1).map((level, index) => {
    const nextLevel = levels[index + 1];

    const from = new THREE.Vector3(...level.position);
    const to = new THREE.Vector3(...nextLevel.position);

    from.y += 0.04;
    to.y += 0.04;

    const midpoint = from.clone().lerp(to, 0.5);
    midpoint.y += 0.65 + index * 0.035;

    const curve = new THREE.QuadraticBezierCurve3(from, midpoint, to);

    return {
      id: `${level.id}-${nextLevel.id}`,
      curve,
      completed:
        level.status === "completed" && nextLevel.status === "completed",
      color:
        level.status === "completed"
          ? "#63f2b1"
          : level.secondaryAccent || "#4fcfff",
    };
  });
}

function buildTowerPositions() {
  return [
    [-11.5, -0.9, 1.2],
    [11.5, -0.9, 1.2],
    [-13.4, -0.9, -8],
    [13.4, -0.9, -8],
    [-10.2, -0.9, -17.5],
    [10.2, -0.9, -17.5],
    [-6.4, -0.9, -25],
    [6.4, -0.9, -25],
  ];
}

function buildRobotRouteCurve() {
  const points = [
    new THREE.Vector3(-10.8, -1.1, 5.1),
    new THREE.Vector3(-14.1, -1.05, -2.1),
    new THREE.Vector3(-13.2, -1.05, -11.7),
    new THREE.Vector3(-9.1, -1.02, -20.2),
    new THREE.Vector3(-1.7, -1.02, -24.6),
    new THREE.Vector3(7.2, -1.02, -21.1),
    new THREE.Vector3(12.9, -1.02, -13.2),
    new THREE.Vector3(13.9, -1.05, -3.3),
    new THREE.Vector3(9.6, -1.08, 4.5),
    new THREE.Vector3(1.8, -1.02, 7.1),
    new THREE.Vector3(-6.4, -1.03, 6.5),
  ];

  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.18);
}

/* ====================================================== */
/* CENTRAL MEGA REACTOR */
/* ====================================================== */

function CentralReactor() {
  const coreRef = useRef(null);
  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);
  const ringThreeRef = useRef(null);
  const ringFourRef = useRef(null);
  const beamRef = useRef(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (coreRef.current) {
      const pulse = 1 + Math.sin(elapsed * 2.2) * 0.055;
      coreRef.current.scale.setScalar(pulse);
      coreRef.current.rotation.y += delta * 0.22;
      coreRef.current.rotation.x += delta * 0.045;
    }

    if (ringOneRef.current) {
      ringOneRef.current.rotation.z += delta * 0.22;
      ringOneRef.current.rotation.x += delta * 0.025;
    }

    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.z -= delta * 0.16;
      ringTwoRef.current.rotation.y += delta * 0.04;
    }

    if (ringThreeRef.current) {
      ringThreeRef.current.rotation.y += delta * 0.11;
      ringThreeRef.current.rotation.z += delta * 0.055;
    }

    if (ringFourRef.current) {
      ringFourRef.current.rotation.x -= delta * 0.045;
      ringFourRef.current.rotation.y += delta * 0.065;
    }

    if (beamRef.current?.material) {
      beamRef.current.material.opacity = 0.16 + Math.sin(elapsed * 3.1) * 0.045;
    }
  });

  return (
    <group position={[0, -1.1, -3.65]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[5.7, 6.5, 0.72, 12]} />
        <meshStandardMaterial
          color="#050c17"
          metalness={0.94}
          roughness={0.29}
        />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[4.65, 5.15, 0.32, 12]} />
        <meshStandardMaterial
          color="#0a1930"
          emissive="#0a2d55"
          emissiveIntensity={0.34}
          metalness={0.91}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.55, 4.18, 12]} />
        <meshBasicMaterial
          color="#2f8cff"
          transparent
          opacity={0.22}
          toneMapped={false}
        />
      </mesh>

      <group position={[0, 1.95, 0]}>
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[1.45, 2.1, 2.2, 10]} />
          <meshStandardMaterial
            color="#0a1527"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>

        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[1.1, 1.42, 1.8, 10]} />
          <meshStandardMaterial
            color="#10233d"
            emissive="#123f72"
            emissiveIntensity={0.36}
            metalness={0.88}
            roughness={0.17}
          />
        </mesh>

        <mesh ref={coreRef} position={[0, 0.7, 0]}>
          <icosahedronGeometry args={[1.15, 2]} />
          <meshStandardMaterial
            color="#b7f8ff"
            emissive="#2f8cff"
            emissiveIntensity={4.6}
            metalness={0.25}
            roughness={0.055}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[0, 0.7, 0]} scale={1.43}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshBasicMaterial
            color="#6ee7ff"
            transparent
            opacity={0.11}
            wireframe
            toneMapped={false}
          />
        </mesh>

        <mesh ref={beamRef} position={[0, 7.2, 0]}>
          <cylinderGeometry args={[0.27, 0.62, 13, 16, 1, true]} />
          <meshBasicMaterial
            color="#55dfff"
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={ringOneRef}
          position={[0, 0.7, 0]}
          rotation={[Math.PI / 2.7, 0, 0]}
        >
          <torusGeometry args={[2.15, 0.055, 12, 80]} />
          <meshBasicMaterial
            color="#6ee7ff"
            transparent
            opacity={0.78}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={ringTwoRef}
          position={[0, 0.7, 0]}
          rotation={[Math.PI / 2, Math.PI / 4, 0]}
        >
          <torusGeometry args={[2.85, 0.042, 10, 84]} />
          <meshBasicMaterial
            color="#5b74ff"
            transparent
            opacity={0.58}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={ringThreeRef}
          position={[0, 0.7, 0]}
          rotation={[0.42, 0.2, 0]}
        >
          <torusGeometry args={[3.55, 0.033, 8, 88]} />
          <meshBasicMaterial
            color="#2f8cff"
            transparent
            opacity={0.36}
            toneMapped={false}
          />
        </mesh>

        <mesh
          ref={ringFourRef}
          position={[0, 0.7, 0]}
          rotation={[1.18, 0.65, 0.4]}
        >
          <torusGeometry args={[4.15, 0.02, 8, 88]} />
          <meshBasicMaterial
            color="#8cf5ff"
            transparent
            opacity={0.19}
            toneMapped={false}
          />
        </mesh>

        <Sparkles
          count={34}
          scale={[8, 5.5, 8]}
          size={2.5}
          speed={0.33}
          opacity={0.62}
          color="#6ee7ff"
          noise={1.1}
        />
      </group>

      <ReactorArms />
    </group>
  );
}

/* ====================================================== */
/* REACTOR MECHANICAL ARMS */
/* ====================================================== */

function ReactorArms() {
  const groupRef = useRef(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.028;
    }
  });

  const arms = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        angle: (Math.PI * 2 * index) / 6,
      })),
    [],
  );

  return (
    <group ref={groupRef} position={[0, 0.95, 0]}>
      {arms.map(({ angle }, index) => (
        <group key={`reactor-arm-${index}`} rotation={[0, angle, 0]}>
          <mesh position={[3.95, 0.15, 0]}>
            <boxGeometry args={[2.55, 0.28, 0.48]} />
            <meshStandardMaterial
              color="#0b1728"
              metalness={0.95}
              roughness={0.23}
            />
          </mesh>

          <mesh position={[5.1, 0.5, 0]}>
            <cylinderGeometry args={[0.25, 0.36, 1.1, 8]} />
            <meshStandardMaterial
              color="#132842"
              emissive="#123d6a"
              emissiveIntensity={0.25}
              metalness={0.88}
              roughness={0.22}
            />
          </mesh>

          <mesh position={[5.1, 1.08, 0]}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshBasicMaterial color="#6ee7ff" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ====================================================== */
/* ENERGY HIGHWAY */
/* ====================================================== */

function EnergyHighway({ curve, color, completed, index }) {
  const pulseOneRef = useRef(null);
  const pulseTwoRef = useRef(null);
  const pulseThreeRef = useRef(null);

  const points = useMemo(() => curve.getPoints(32), [curve]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const refs = [pulseOneRef, pulseTwoRef, pulseThreeRef];

    refs.forEach((ref, pulseIndex) => {
      if (!ref.current) {
        return;
      }

      const offset = pulseIndex / refs.length + index * 0.07;
      const t = (time * 0.115 + offset) % 1;
      const position = curve.getPointAt(t);

      ref.current.position.copy(position);
    });
  });

  const highwayColor = completed ? "#63f2b1" : color;

  return (
    <group>
      <Line
        points={points}
        color="#0c1a2e"
        lineWidth={7}
        transparent
        opacity={0.9}
      />
      <Line
        points={points}
        color="#15375a"
        lineWidth={3.8}
        transparent
        opacity={0.8}
      />

      <mesh>
        <tubeGeometry args={[curve, 36, 0.055, 7, false]} />
        <meshBasicMaterial
          color={highwayColor}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>

      {[pulseOneRef, pulseTwoRef, pulseThreeRef].map((ref, pulseIndex) => (
        <mesh key={`energy-pulse-${pulseIndex}`} ref={ref}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshBasicMaterial
            color={highwayColor}
            transparent
            opacity={0.95}
            toneMapped={false}
          />
        </mesh>
      ))}

      {points
        .filter((_, pointIndex) => pointIndex % 8 === 0)
        .map((point, pointIndex) => (
          <mesh key={`junction-${pointIndex}`} position={point}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial
              color="#b9f7ff"
              transparent
              opacity={0.62}
              toneMapped={false}
            />
          </mesh>
        ))}
    </group>
  );
}

/* ====================================================== */
/* ROBOT ORBIT RAIL */
/* ====================================================== */

function RobotOrbitRail({ curve }) {
  const points = useMemo(() => curve.getPoints(120), [curve]);

  return (
    <group>
      <Line
        points={points}
        color="#09192d"
        lineWidth={3.2}
        transparent
        opacity={0.45}
      />
      <Line
        points={points}
        color="#2a72b8"
        lineWidth={1.15}
        transparent
        opacity={0.22}
      />

      {points
        .filter((_, index) => index % 15 === 0)
        .map((point, index) => (
          <mesh key={`robot-rail-node-${index}`} position={point}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial
              color="#6ee7ff"
              transparent
              opacity={0.3}
              toneMapped={false}
            />
          </mesh>
        ))}
    </group>
  );
}

/* ====================================================== */
/* ORBITING ROBOT */
/* ====================================================== */

function OrbitingRobot({ curve }) {
  const carrierRef = useRef(null);
  const glowRef = useRef(null);
  const droneRingRef = useRef(null);

  const { scene, animations } = useGLTF("/models/Robot.glb");
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (!names.length) {
      return undefined;
    }

    const walkName =
      names.find((name) => name === "02_Walk") ||
      names.find((name) => /(^|[_ -])walk($|[_ -])/i.test(name));

    const idleName =
      names.find((name) => name === "01_Idle") ||
      names.find((name) => /(^|[_ -])idle($|[_ -])/i.test(name));

    const clipName = walkName || idleName;

    if (!clipName) {
      return undefined;
    }

    const action = actions[clipName];

    if (!action) {
      return undefined;
    }

    Object.values(actions).forEach((currentAction) => {
      currentAction?.stop();
    });

    action.reset();
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.clampWhenFinished = false;
    action.timeScale = walkName ? 1.0 : 1;
    action.fadeIn(0.28).play();

    return () => {
      action.fadeOut(0.2);
      action.stop();
    };
  }, [actions, names]);

  useFrame((state, delta) => {
    if (!carrierRef.current) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    const t = 1 - ((elapsed * 0.035) % 1);

    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    carrierRef.current.position.copy(point);
    carrierRef.current.position.y += 0.12 + Math.sin(elapsed * 3.2) * 0.015;

    const targetYaw = Math.atan2(tangent.x, tangent.z) + ROBOT_YAW_OFFSET;

    carrierRef.current.rotation.y = THREE.MathUtils.damp(
      carrierRef.current.rotation.y,
      targetYaw,
      5.2,
      delta,
    );

    if (glowRef.current?.material) {
      glowRef.current.material.opacity = 0.16 + Math.sin(elapsed * 5.2) * 0.045;
    }

    if (droneRingRef.current) {
      droneRingRef.current.rotation.z += delta * 0.95;
    }
  });

  return (
    <group ref={carrierRef}>
      <mesh
        ref={glowRef}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.45, 1.05, 40]} />
        <meshBasicMaterial
          color="#5ccfff"
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial
          color="#6ee7ff"
          transparent
          opacity={0.08}
          toneMapped={false}
        />
      </mesh>

      <group position={[0, 0.5, 0]}>
        <mesh ref={droneRingRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.05, 0.03, 8, 50]} />
          <meshBasicMaterial
            color="#8067ff"
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.76, 0.02, 8, 50]} />
          <meshBasicMaterial
            color="#6ee7ff"
            transparent
            opacity={0.8}
            toneMapped={false}
          />
        </mesh>
      </group>

      <group position={[0, 0.1, 0]}>
        <primitive
          object={scene}
          scale={1.24}
          position={[0, -1.22, 0]}
          rotation={[0, 0, 0]}
        />
      </group>

      <Sparkles
        count={8}
        scale={[1.7, 1.8, 1.7]}
        position={[0, 0.8, 0]}
        size={1.5}
        speed={0.3}
        opacity={0.55}
        color="#8ae7ff"
        noise={0.9}
      />
    </group>
  );
}

/* ====================================================== */
/* MECHANICAL SECTOR PLATFORM */
/* ====================================================== */

function SectorPlatform({ level, selected, current }) {
  const color = getLevelColor(level);
  const secondary = getLevelSecondary(level);
  const scale = selected ? 1.09 : current ? 1.04 : 1;

  return (
    <group scale={scale}>
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[2.55, 2.85, 0.82, 8]} />
        <meshStandardMaterial
          color="#050b14"
          metalness={0.96}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[2.25, 2.48, 0.18, 8]} />
        <meshStandardMaterial
          color={METAL_MID}
          emissive={color}
          emissiveIntensity={selected ? 0.42 : 0.22}
          metalness={0.91}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.35, 1.9, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.62 : current ? 0.44 : 0.28}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.08, 2.14, 8]} />
        <meshBasicMaterial
          color={secondary}
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {Array.from({ length: 4 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 4 + Math.PI / 4;

        return (
          <group
            key={`support-${index}`}
            position={[Math.cos(angle) * 1.85, -0.15, Math.sin(angle) * 1.85]}
          >
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.28, 1.05, 0.28]} />
              <meshStandardMaterial
                color={METAL_LIGHT}
                metalness={0.9}
                roughness={0.21}
              />
            </mesh>

            <mesh position={[0, 0.98, 0]}>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshBasicMaterial color={secondary} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* SECTOR GATE */
/* ====================================================== */

function SectorGate({ level, selected, current }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const leftDoorRef = useRef(null);
  const rightDoorRef = useRef(null);

  const color = getLevelColor(level);
  const secondary = getLevelSecondary(level);

  useFrame((state, delta) => {
    const speed = selected ? 0.45 : current ? 0.24 : 0.09;

    if (outerRef.current) {
      outerRef.current.rotation.z += delta * speed;
    }

    if (innerRef.current) {
      innerRef.current.rotation.z -= delta * speed * 0.72;
    }

    const doorTarget = selected ? 0.72 : 0.18;

    if (leftDoorRef.current) {
      leftDoorRef.current.position.x = THREE.MathUtils.damp(
        leftDoorRef.current.position.x,
        -doorTarget,
        5.8,
        delta,
      );
    }

    if (rightDoorRef.current) {
      rightDoorRef.current.position.x = THREE.MathUtils.damp(
        rightDoorRef.current.position.x,
        doorTarget,
        5.8,
        delta,
      );
    }

    if (selected && outerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.02;
      outerRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={[0, 1.65, 0]}>
      <mesh ref={outerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.28, 0.11, 12, 48]} />
        <meshStandardMaterial
          color="#14243c"
          emissive={color}
          emissiveIntensity={selected ? 0.85 : 0.34}
          metalness={0.88}
          roughness={0.16}
        />
      </mesh>

      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.94, 0.035, 8, 44]} />
        <meshBasicMaterial
          color={secondary}
          transparent
          opacity={selected ? 0.88 : 0.4}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={leftDoorRef} position={[-0.18, 0, 0]}>
        <boxGeometry args={[0.62, 1.65, 0.08]} />
        <meshStandardMaterial
          color="#0c1728"
          emissive={color}
          emissiveIntensity={0.14}
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={rightDoorRef} position={[0.18, 0, 0]}>
        <boxGeometry args={[0.62, 1.65, 0.08]} />
        <meshStandardMaterial
          color="#0c1728"
          emissive={color}
          emissiveIntensity={0.14}
          metalness={0.94}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0, -0.08]}>
        <circleGeometry args={[0.86, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.13 : 0.045}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* SECTOR CORE */
/* ====================================================== */

function SectorCore({ level, selected, current }) {
  const coreRef = useRef(null);
  const haloRef = useRef(null);

  const color = getLevelColor(level);
  const secondary = getLevelSecondary(level);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y +=
        delta * (selected ? 0.6 : current ? 0.34 : 0.13);

      const pulseAmount = selected ? 0.09 : current ? 0.055 : 0.022;
      const pulse =
        1 +
        Math.sin(state.clock.elapsedTime * 2.25 + Number(level.order || 0)) *
          pulseAmount;

      coreRef.current.scale.setScalar(pulse);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z -= delta * (selected ? 0.32 : 0.11);
    }
  });

  return (
    <group position={[0, 1.62, 0.15]}>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.44, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={getEmissiveIntensity(level)}
          metalness={0.33}
          roughness={0.08}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.66, 0.018, 8, 36]} />
        <meshBasicMaterial
          color={secondary}
          transparent
          opacity={selected ? 0.92 : 0.46}
          toneMapped={false}
        />
      </mesh>

      {(selected || current) && (
        <Sparkles
          count={selected ? 13 : 8}
          scale={[2.8, 2.6, 2.8]}
          size={2}
          speed={0.22}
          opacity={0.65}
          color={secondary}
          noise={0.8}
        />
      )}
    </group>
  );
}

/* ====================================================== */
/* HOLOGRAM LABEL */
/* ====================================================== */

function SectorHologram({ level, selected, current }) {
  const color = getLevelColor(level);

  return (
    <group position={[0, 3.7, 0]}>
      <mesh>
        <planeGeometry args={[2.85, 0.8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.09 : current ? 0.055 : 0.028}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <Html
        center
        distanceFactor={10.5}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
          transform: "translateY(-2px)",
        }}
      >
        <div
          style={{
            minWidth: "170px",
            padding: "7px 10px",
            border: `1px solid ${color}55`,
            borderRadius: "7px",
            background:
              "linear-gradient(180deg, rgba(5,13,25,.82), rgba(3,9,18,.68))",
            boxShadow: selected ? `0 0 24px ${color}44` : `0 0 14px ${color}22`,
            backdropFilter: "blur(8px)",
            textAlign: "center",
            fontFamily:
              '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
            color: "#dff8ff",
            letterSpacing: "0.08em",
          }}
        >
          <div
            style={{
              marginBottom: "2px",
              color,
              fontSize: "8px",
              fontWeight: 900,
              opacity: 0.85,
            }}
          >
            {level.sector}
          </div>

          <div
            style={{
              fontSize: "10px",
              fontWeight: 900,
              textTransform: "uppercase",
            }}
          >
            {level.title}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* STATUS BEACONS */
/* ====================================================== */

function StatusBeacons({ level, selected }) {
  const color = getLevelColor(level);

  return (
    <group position={[0, 0.15, 0]}>
      {[
        [1.88, 0, 0],
        [-1.88, 0, 0],
        [0, 0, 1.88],
        [0, 0, -1.88],
      ].map((position, index) => (
        <group key={`${level.id}-beacon-${index}`} position={position}>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.06, 0.11, 0.62, 8]} />
            <meshStandardMaterial
              color="#111d30"
              metalness={0.92}
              roughness={0.24}
            />
          </mesh>

          <mesh position={[0, 0.68, 0]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={selected ? 1 : 0.74}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ====================================================== */
/* FINAL SYSTEM FORTRESS */
/* ====================================================== */

function FinalFortress({ level, selected, current }) {
  const crownRef = useRef(null);
  const color = getLevelColor(level);
  const secondary = getLevelSecondary(level);

  useFrame((_, delta) => {
    if (crownRef.current) {
      crownRef.current.rotation.y += delta * (selected ? 0.18 : 0.065);
    }
  });

  return (
    <group>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[3.8, 4.6, 1.2, 8]} />
        <meshStandardMaterial
          color="#07100f"
          emissive="#12392d"
          emissiveIntensity={0.24}
          metalness={0.93}
          roughness={0.22}
        />
      </mesh>

      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[1.35, 2.45, 3.3, 8]} />
        <meshStandardMaterial
          color="#0b1c1a"
          emissive="#165c43"
          emissiveIntensity={0.35}
          metalness={0.9}
          roughness={0.17}
        />
      </mesh>

      {[-2.45, 2.45].map((x) => (
        <group key={`fortress-wing-${x}`} position={[x, 0.2, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 2.4, 2.2]} />
            <meshStandardMaterial
              color="#0b1717"
              metalness={0.92}
              roughness={0.22}
            />
          </mesh>

          <mesh position={[0, 0.3, 1.13]}>
            <planeGeometry args={[0.52, 1.25]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.42}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <group ref={crownRef} position={[0, 3.1, 0]}>
        <mesh>
          <torusGeometry args={[2.05, 0.08, 10, 64]} />
          <meshBasicMaterial
            color={secondary}
            transparent
            opacity={0.72}
            toneMapped={false}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.32, 0.04, 8, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.58}
            toneMapped={false}
          />
        </mesh>
      </group>

      <mesh position={[0, 3.1, 0]}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#d7fff0"
          emissive={color}
          emissiveIntensity={selected ? 5 : 3.2}
          metalness={0.2}
          roughness={0.06}
          toneMapped={false}
        />
      </mesh>

      <SectorHologram level={level} selected={selected} current={current} />
    </group>
  );
}

/* ====================================================== */
/* SECTOR NODE */
/* ====================================================== */

function SectorNode({ level, selectedLevelId, currentLevelId, onSelectLevel }) {
  const motionRef = useRef(null);
  const hoverRef = useRef(false);

  const selected = selectedLevelId === level.id;
  const current = currentLevelId === level.id;
  const isFinal = level.id === "cpp-final-system";

  useFrame((state, delta) => {
    if (!motionRef.current) {
      return;
    }

    const hoverY = hoverRef.current ? 0.16 : 0;
    const selectedY = selected ? 0.09 : 0;

    motionRef.current.position.y = THREE.MathUtils.damp(
      motionRef.current.position.y,
      hoverY + selectedY,
      7,
      delta,
    );

    const targetRotation =
      current || selected
        ? Math.sin(state.clock.elapsedTime * 0.42) * 0.012
        : 0;

    motionRef.current.rotation.y = THREE.MathUtils.damp(
      motionRef.current.rotation.y,
      targetRotation,
      6,
      delta,
    );
  });

  const handleClick = (event) => {
    event.stopPropagation();
    onSelectLevel?.(level);
  };

  return (
    <group
      position={level.position}
      onClick={handleClick}
      onPointerEnter={(event) => {
        event.stopPropagation();
        hoverRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
        document.body.style.cursor = "default";
      }}
    >
      <group ref={motionRef}>
        {isFinal ? (
          <FinalFortress level={level} selected={selected} current={current} />
        ) : (
          <>
            <SectorPlatform
              level={level}
              selected={selected}
              current={current}
            />
            <SectorGate level={level} selected={selected} current={current} />
            <SectorCore level={level} selected={selected} current={current} />
            <StatusBeacons level={level} selected={selected} />
            <SectorHologram
              level={level}
              selected={selected}
              current={current}
            />
          </>
        )}

        <SelectedSectorBeam level={level} selected={selected} />

        {selected && (
          <Float speed={1.15} rotationIntensity={0} floatIntensity={0.22}>
            <mesh position={[0, 4.45, 0]}>
              <octahedronGeometry args={[0.12, 0]} />
              <meshBasicMaterial
                color={getLevelSecondary(level)}
                toneMapped={false}
              />
            </mesh>
          </Float>
        )}
      </group>
    </group>
  );
}

/* ====================================================== */
/* INDUSTRIAL FLOOR */
/* ====================================================== */

function ReactorFloor() {
  const radialLines = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 12;

        return [
          [0, 0.02, 0],
          [Math.cos(angle) * 27, 0.02, Math.sin(angle) * 27],
        ];
      }),
    [],
  );

  return (
    <group position={[0, -1.5, -8.8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[30, 72]} />
        <meshStandardMaterial
          color={FLOOR_COLOR}
          metalness={0.86}
          roughness={0.6}
        />
      </mesh>

      <gridHelper
        args={[58, 58, "#173553", "#0b1d31"]}
        position={[0, 0.025, 0]}
      />

      {[7.4, 12.8, 18.4, 24].map((radius, index) => (
        <mesh
          key={`floor-ring-${radius}`}
          position={[0, 0.03 + index * 0.002, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[radius, radius + 0.07, 96]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? "#2b5e8e" : "#27405f"}
            transparent
            opacity={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {radialLines.map((points, index) => (
        <Line
          key={`radial-${index}`}
          points={points}
          color="#193d60"
          lineWidth={0.7}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

/* ====================================================== */
/* INDUSTRIAL TOWERS */
/* ====================================================== */

function IndustrialTower({ position, index }) {
  const topRef = useRef(null);

  useFrame((state) => {
    if (!topRef.current?.material) {
      return;
    }

    topRef.current.material.opacity =
      0.38 + Math.sin(state.clock.elapsedTime * 1.8 + index) * 0.18;
  });

  const height = 4.2 + (index % 3) * 1.2;

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.95, height, 0.95]} />
        <meshStandardMaterial
          color="#091321"
          metalness={0.93}
          roughness={0.28}
        />
      </mesh>

      <mesh position={[0, height * 0.72, 0.51]}>
        <planeGeometry args={[0.36, 1.3]} />
        <meshBasicMaterial
          color={index % 2 === 0 ? "#2f8cff" : "#6ee7ff"}
          transparent
          opacity={0.2}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={topRef} position={[0, height + 0.25, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial
          color="#6ee7ff"
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function IndustrialBackdrop() {
  const ringRef = useRef(null);
  const towers = useMemo(() => buildTowerPositions(), []);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.015;
    }
  });

  return (
    <>
      {towers.map((position, index) => (
        <IndustrialTower
          key={`tower-${index}`}
          position={position}
          index={index}
        />
      ))}

      <group position={[0, 7.2, -30]}>
        <mesh ref={ringRef}>
          <torusGeometry args={[12.2, 0.16, 10, 96]} />
          <meshStandardMaterial
            color="#11243f"
            emissive="#102b4b"
            emissiveIntensity={0.34}
            metalness={0.9}
            roughness={0.19}
          />
        </mesh>

        <mesh>
          <torusGeometry args={[9.2, 0.05, 8, 96]} />
          <meshBasicMaterial
            color="#2f8cff"
            transparent
            opacity={0.19}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <circleGeometry args={[7.6, 64]} />
          <meshBasicMaterial color="#06101d" transparent opacity={0.84} />
        </mesh>

        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[5.2, 5.28, 72]} />
          <meshBasicMaterial
            color="#6ee7ff"
            transparent
            opacity={0.12}
            toneMapped={false}
          />
        </mesh>
      </group>
    </>
  );
}

/* ====================================================== */
/* SCAN BEAMS */
/* ====================================================== */

function ScanBeams() {
  const beamOneRef = useRef(null);
  const beamTwoRef = useRef(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;

    if (beamOneRef.current) {
      beamOneRef.current.rotation.y = elapsed * 0.09;
    }

    if (beamTwoRef.current) {
      beamTwoRef.current.rotation.y = -elapsed * 0.065 + 1.2;
    }
  });

  const beamMaterial = {
    color: "#56cfff",
    transparent: true,
    opacity: 0.035,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  };

  return (
    <group position={[0, 1.2, -7]}>
      <mesh ref={beamOneRef}>
        <coneGeometry args={[6.5, 22, 32, 1, true]} />
        <meshBasicMaterial {...beamMaterial} />
      </mesh>

      <mesh ref={beamTwoRef}>
        <coneGeometry args={[8.8, 25, 32, 1, true]} />
        <meshBasicMaterial {...beamMaterial} color="#7566ff" opacity={0.022} />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* ATMOSPHERE */
/* ====================================================== */

function Atmosphere() {
  return (
    <>
      <fog attach="fog" args={["#02050b", 20, 61]} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={["#4d9eff", "#010307", 0.48]} />
      <directionalLight
        position={[4, 14, 9]}
        intensity={1.15}
        color="#d8f7ff"
      />
      <pointLight
        position={[0, 4, -4]}
        intensity={7}
        distance={20}
        color="#2f8cff"
      />
      <pointLight
        position={[0, 7, -21]}
        intensity={5.5}
        distance={18}
        color="#61f2b5"
      />

      <Sparkles
        count={64}
        scale={[31, 17, 44]}
        position={[0, 5, -10]}
        size={1.2}
        speed={0.075}
        opacity={0.22}
        color="#7bdcff"
        noise={1.3}
      />

      <Sparkles
        count={30}
        scale={[22, 10, 34]}
        position={[0, 8, -14]}
        size={2}
        speed={0.035}
        opacity={0.12}
        color="#7566ff"
        noise={1.1}
      />
    </>
  );
}

/* ====================================================== */
/* ORBITAL CROWN */
/* ====================================================== */

function OrbitalCrown() {
  const ringARef = useRef(null);
  const ringBRef = useRef(null);
  const ringCRef = useRef(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;

    if (ringARef.current) {
      ringARef.current.rotation.z += delta * 0.025;
      ringARef.current.rotation.x = 0.18 + Math.sin(elapsed * 0.25) * 0.025;
    }

    if (ringBRef.current) {
      ringBRef.current.rotation.z -= delta * 0.018;
      ringBRef.current.rotation.y = 0.28 + Math.sin(elapsed * 0.2) * 0.03;
    }

    if (ringCRef.current) {
      ringCRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group position={[0, 8.5, -12]}>
      <mesh ref={ringARef} rotation={[0.18, 0.3, 0]}>
        <torusGeometry args={[15.5, 0.05, 8, 120]} />
        <meshBasicMaterial
          color="#2f8cff"
          transparent
          opacity={0.16}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ringBRef} rotation={[0.42, -0.25, 0]}>
        <torusGeometry args={[12.2, 0.035, 8, 120]} />
        <meshBasicMaterial
          color="#6ee7ff"
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ringCRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[8.4, 0.025, 8, 96]} />
        <meshBasicMaterial
          color="#7a63ff"
          transparent
          opacity={0.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* REACTOR DRONES */
/* ====================================================== */

function ReactorDrone({ radius, speed, phase, height, color }) {
  const groupRef = useRef(null);
  const ringRef = useRef(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    const angle = elapsed * speed + phase;

    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.z = Math.sin(angle) * radius - 4;
      groupRef.current.position.y =
        height + Math.sin(elapsed * 1.6 + phase) * 0.18;
      groupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.4;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color="#d9fbff"
          emissive={color}
          emissiveIntensity={2.6}
          metalness={0.35}
          roughness={0.08}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.024, 8, 36]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.65}
          toneMapped={false}
        />
      </mesh>

      <pointLight color={color} intensity={2.4} distance={4.5} />
    </group>
  );
}

function ReactorDrones() {
  return (
    <>
      <ReactorDrone
        radius={7.8}
        speed={0.16}
        phase={0}
        height={4.4}
        color="#6ee7ff"
      />
      <ReactorDrone
        radius={9.7}
        speed={-0.11}
        phase={1.8}
        height={6.1}
        color="#7c66ff"
      />
      <ReactorDrone
        radius={11.2}
        speed={0.09}
        phase={3.5}
        height={3.6}
        color="#63f2b1"
      />
    </>
  );
}

/* ====================================================== */
/* FLOOR ENERGY SWEEP */
/* ====================================================== */

function FloorEnergySweep() {
  const sweepRef = useRef(null);

  useFrame((state) => {
    if (!sweepRef.current?.material) {
      return;
    }

    const elapsed = state.clock.elapsedTime;
    sweepRef.current.rotation.z = elapsed * 0.15;
    sweepRef.current.material.opacity = 0.12 + Math.sin(elapsed * 1.8) * 0.035;
  });

  return (
    <group position={[0, -1.42, -8.8]}>
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.5, 26, 96, 1, 0, Math.PI / 7]} />
        <meshBasicMaterial
          color="#4cbcff"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ====================================================== */
/* SELECTED SECTOR BEAM */
/* ====================================================== */

function SelectedSectorBeam({ level, selected }) {
  const beamRef = useRef(null);

  useFrame((state) => {
    if (!selected || !beamRef.current?.material) {
      return;
    }

    beamRef.current.material.opacity =
      0.09 + Math.sin(state.clock.elapsedTime * 3.4) * 0.025;
  });

  if (!selected) {
    return null;
  }

  const color = getLevelColor(level);

  return (
    <group position={[0, 5.4, 0]}>
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.42, 1.35, 10.5, 18, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <Sparkles
        count={12}
        scale={[2.2, 7.5, 2.2]}
        size={1.8}
        speed={0.24}
        opacity={0.5}
        color={color}
        noise={0.9}
      />
    </group>
  );
}

/* ====================================================== */
/* MAIN SCENE */
/* ====================================================== */

function CppWorldScene({
  levels = [],
  currentLevelId = null,
  selectedLevelId = null,
  onSelectLevel,
}) {
  const routes = useMemo(() => buildEnergyRoutes(levels), [levels]);
  const robotCurve = useMemo(() => buildRobotRouteCurve(), []);

  return (
    <>
      <color attach="background" args={["#02050b"]} />

      <Atmosphere />
      <ReactorFloor />
      <FloorEnergySweep />
      <IndustrialBackdrop />
      <OrbitalCrown />
      <ScanBeams />
      <CentralReactor />
      <ReactorDrones />

      {routes.map((route, index) => (
        <EnergyHighway
          key={route.id}
          curve={route.curve}
          color={route.color}
          completed={route.completed}
          index={index}
        />
      ))}

      <RobotOrbitRail curve={robotCurve} />
      <OrbitingRobot curve={robotCurve} />

      {levels.map((level) => (
        <SectorNode
          key={level.id}
          level={level}
          selectedLevelId={selectedLevelId}
          currentLevelId={currentLevelId}
          onSelectLevel={onSelectLevel}
        />
      ))}
    </>
  );
}

useGLTF.preload("/models/Robot.glb");

export default CppWorldScene;
