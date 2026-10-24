import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import { LASER, WALL } from "./mazeEngine";

const COLORS = {
  background: "#090d16",
  floor: "#111a2e",
  wall: "#141c2f",
  wallGlow: "#2563eb",
  exit: "#10b981",
  laser: "#ef4444",
  robot: "#cbd5e1",
  eye: "#3b82f6",
};

/** Robot rotation for a direction index (0 north, 1 east, 2 south, 3 west); the model faces -z. */
const yawFor = (dir) => -dir * (Math.PI / 2);

function useTileToWorld(maze) {
  return useMemo(() => {
    const ox = maze.width / 2 - 0.5;
    const oz = maze.height / 2 - 0.5;
    return (x, y) => [x - ox, 0, y - oz];
  }, [maze.width, maze.height]);
}

/** Floor tiles and walls, each drawn with one instanced mesh so big mazes stay fast. */
function MazeGeometry({ maze }) {
  const toWorld = useTileToWorld(maze);
  const floorRef = useRef();
  const wallRef = useRef();
  const glowRef = useRef();

  const { floors, walls } = useMemo(() => {
    const f = [];
    const w = [];
    maze.tiles.forEach((t, i) => {
      const x = i % maze.width;
      const y = Math.floor(i / maze.width);
      (t === WALL ? w : f).push([x, y]);
    });
    return { floors: f, walls: w };
  }, [maze]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    floors.forEach(([x, y], i) => {
      const [wx, , wz] = toWorld(x, y);
      floorRef.current.setMatrixAt(i, m.makeTranslation(wx, -0.04, wz));
    });
    walls.forEach(([x, y], i) => {
      const [wx, , wz] = toWorld(x, y);
      wallRef.current.setMatrixAt(i, m.makeTranslation(wx, 0.4, wz));
      glowRef.current.setMatrixAt(i, m.makeTranslation(wx, 0.81, wz));
    });
    for (const ref of [floorRef, wallRef, glowRef]) ref.current.instanceMatrix.needsUpdate = true;
  }, [floors, walls, toWorld]);

  return (
    <>
      <instancedMesh ref={floorRef} args={[null, null, floors.length]} receiveShadow>
        <boxGeometry args={[0.96, 0.08, 0.96]} />
        <meshStandardMaterial color={COLORS.floor} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={wallRef} args={[null, null, walls.length]} castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={COLORS.wall} roughness={0.6} metalness={0.2} />
      </instancedMesh>
      {/* An inset glowing panel on each wall top: dark seams between walls read as a neon grid. */}
      <instancedMesh ref={glowRef} args={[null, null, walls.length]}>
        <boxGeometry args={[0.82, 0.02, 0.82]} />
        <meshStandardMaterial color={COLORS.wallGlow} emissive={COLORS.wallGlow} emissiveIntensity={0.55} toneMapped={false} />
      </instancedMesh>
    </>
  );
}

function ExitPortal({ maze }) {
  const toWorld = useTileToWorld(maze);
  const ring = useRef();
  const [x, , z] = toWorld(maze.exit.x, maze.exit.y);
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 1.4;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh ref={ring} position={[0, 0.55, 0]}>
        <torusGeometry args={[0.36, 0.05, 12, 40]} />
        <meshStandardMaterial color={COLORS.exit} emissive={COLORS.exit} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 24, 1, true]} />
        <meshBasicMaterial color={COLORS.exit} transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <pointLight color={COLORS.exit} intensity={2} distance={3} position={[0, 0.6, 0]} />
    </group>
  );
}

function Lasers({ maze }) {
  const toWorld = useTileToWorld(maze);
  const group = useRef();
  const lasers = useMemo(() => {
    const list = [];
    maze.tiles.forEach((t, i) => {
      if (t !== LASER) return;
      const x = i % maze.width;
      const y = Math.floor(i / maze.width);
      // Corridor running north–south has walls east and west, so the beam spans east–west.
      const acrossX = maze.tiles[y * maze.width + x - 1] === WALL;
      list.push({ x, y, acrossX });
    });
    return list;
  }, [maze]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const flicker = 0.75 + Math.sin(clock.elapsedTime * 18) * 0.25;
    group.current.children.forEach((beam) => {
      beam.material.emissiveIntensity = 3.5 * flicker;
    });
  });

  return (
    <group ref={group}>
      {lasers.map(({ x, y, acrossX }) => {
        const [wx, , wz] = toWorld(x, y);
        return (
          <mesh key={`${x},${y}`} position={[wx, 0.32, wz]} rotation={[0, acrossX ? 0 : Math.PI / 2, 0]}>
            <boxGeometry args={[1, 0.09, 0.09]} />
            <meshStandardMaterial color={COLORS.laser} emissive={COLORS.laser} emissiveIntensity={3.5} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function RobotModel({ robotRef, eyeRef }) {
  return (
    <group ref={robotRef}>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.44, 0.34, 0.36]} />
          <meshStandardMaterial color={COLORS.robot} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[0.34, 0.24, 0.3]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.25} />
        </mesh>
        <mesh ref={eyeRef} position={[0, 0.59, -0.16]}>
          <boxGeometry args={[0.24, 0.07, 0.02]} />
          <meshStandardMaterial color={COLORS.eye} emissive={COLORS.eye} emissiveIntensity={4} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.87, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color={COLORS.eye} emissive={COLORS.eye} emissiveIntensity={3} toneMapped={false} />
        </mesh>
        {[-0.17, 0.17].map((wx) => (
          <mesh key={wx} position={[wx, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 16]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Frames the whole maze from above at an angle; works for 5×5 corridors up to 19×19 mazes. */
function CameraRig({ maze }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    // Distance at which the maze (plus a margin) fits both the vertical and horizontal field of view.
    const halfSpan = (Math.max(maze.width, maze.height) / 2) * 1.28; // margin: the near row looks wider in perspective
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanH = tanV * (size.width / size.height);
    const distance = halfSpan / Math.min(tanV, tanH) + 1.5;
    // Look down at ~55° so walls keep some depth.
    camera.position.set(0, distance * 0.82, distance * 0.57);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, maze.width, maze.height, size.width, size.height]);
  return null;
}

/**
 * Plays the robot's recorded run (move / turn / jump / crash / zap) with GSAP.
 * playback: { actions, status, key } — a new key restarts the animation from the start.
 */
function RobotPlayer({ maze, playback, speed, skipSignal, reducedMotion, onDone }) {
  const toWorld = useTileToWorld(maze);
  const robotRef = useRef();
  const eyeRef = useRef();
  const timelineRef = useRef(null);
  const { camera } = useThree();

  // Idle position at the start tile.
  useLayoutEffect(() => {
    const robot = robotRef.current;
    if (!robot) return;
    timelineRef.current?.kill();
    const [x, , z] = toWorld(maze.start.x, maze.start.y);
    robot.position.set(x, 0, z);
    robot.rotation.set(0, yawFor(maze.start.dir), 0);
    robot.scale.set(1, 1, 1);
  }, [maze, toWorld, playback?.key]);

  useEffect(() => {
    const robot = robotRef.current;
    if (!playback || !robot) return undefined;

    const actions = playback.actions || [];
    const step = Math.min(0.34, Math.max(0.06, 16 / Math.max(actions.length, 1)));
    const tl = gsap.timeline({ paused: true, onComplete: () => onDone?.(playback.status) });
    let yaw = yawFor(maze.start.dir);
    let current = { ...maze.start };
    const eye = eyeRef.current?.material;

    for (const action of actions) {
      if (action.t === "turn") {
        const diff = ((action.dir - current.dir + 4) % 4 === 1 ? -1 : 1) * (Math.PI / 2);
        yaw += diff;
        current = { ...current, dir: action.dir };
        tl.to(robot.rotation, { y: yaw, duration: step * 0.8, ease: "power2.inOut" });
      } else if (action.t === "move") {
        const [x, , z] = toWorld(action.x, action.y);
        tl.to(robot.position, { x, z, duration: step, ease: "power1.inOut" });
        current = { ...current, x: action.x, y: action.y };
      } else if (action.t === "jump") {
        const [x, , z] = toWorld(action.x, action.y);
        const jumpTime = step * 2.4;
        tl.to(robot.position, { x, z, duration: jumpTime, ease: "none" }, ">");
        if (!reducedMotion) {
          tl.to(robot.position, { y: 0.9, duration: jumpTime / 2, ease: "power2.out", yoyo: true, repeat: 1 }, "<");
          // 360° somersault around the robot's own sideways axis.
          tl.fromTo(robot.rotation, { x: 0 }, { x: -Math.PI * 2, duration: jumpTime, ease: "power1.inOut" }, "<");
          tl.set(robot.rotation, { x: 0 });
        }
        current = { ...current, x: action.x, y: action.y };
      } else if (action.t === "crash" || action.t === "zap") {
        const [tx, , tz] = toWorld(action.x, action.y);
        const [cx, , cz] = toWorld(current.x, current.y);
        const flash = action.t === "zap" ? "#ef4444" : "#f59e0b";
        if (action.t === "crash") {
          tl.to(robot.position, { x: cx + (tx - cx) * 0.35, z: cz + (tz - cz) * 0.35, duration: step * 0.5, yoyo: true, repeat: 1 });
        } else {
          tl.to(robot.position, { x: tx, z: tz, duration: step });
        }
        if (eye) {
          tl.to(eye.emissive, { r: new THREE.Color(flash).r, g: new THREE.Color(flash).g, b: new THREE.Color(flash).b, duration: 0.08 }, "<");
          tl.to(eye, { emissiveIntensity: 9, duration: 0.08, yoyo: true, repeat: 5 }, "<");
        }
        if (!reducedMotion) {
          tl.to(camera.position, { x: "+=0.25", duration: 0.05, yoyo: true, repeat: 7 }, "<");
          if (action.t === "zap") tl.to(robot.scale, { y: 0.4, duration: 0.3, ease: "power2.in" });
        }
      }
    }

    if (playback.status === "exit") {
      tl.to(robot.position, { y: 0.7, duration: reducedMotion ? 0.2 : 0.8, ease: "power2.out" });
      if (!reducedMotion) tl.to(robot.rotation, { y: `+=${Math.PI * 2}`, duration: 0.8, ease: "power2.inOut" }, "<");
    }

    timelineRef.current = tl;
    tl.timeScale(speed).play(0);
    return () => {
      tl.kill();
      if (eye) {
        eye.emissive.set(COLORS.eye);
        eye.emissiveIntensity = 4;
      }
    };
    // Re-run only when a new run arrives (speed changes are applied below).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback?.key]);

  useEffect(() => {
    timelineRef.current?.timeScale(speed);
  }, [speed]);

  useEffect(() => {
    if (skipSignal && timelineRef.current) timelineRef.current.progress(1);
  }, [skipSignal]);

  useFrame(({ clock }) => {
    // Gentle hover while idle.
    if (robotRef.current && !timelineRef.current?.isActive()) {
      robotRef.current.children[0].position.y = 0.05 + Math.sin(clock.elapsedTime * 2.4) * 0.03;
    }
  });

  return <RobotModel robotRef={robotRef} eyeRef={eyeRef} />;
}

export default function MazeScene({ maze, playback, speed = 1, skipSignal = 0, reducedMotion = false, onDone }) {
  return (
    <Canvas shadows dpr={[1, 1.5]} camera={{ fov: 45, near: 0.1, far: 200 }} gl={{ antialias: true }}>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, 18, 60]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 12, 8]} intensity={1.3} castShadow shadow-mapSize={[1024, 1024]} />
      <CameraRig maze={maze} />
      <MazeGeometry maze={maze} />
      <ExitPortal maze={maze} />
      <Lasers maze={maze} />
      <RobotPlayer
        maze={maze}
        playback={playback}
        speed={speed}
        skipSignal={skipSignal}
        reducedMotion={reducedMotion}
        onDone={onDone}
      />
      <OrbitControls enablePan={false} minPolarAngle={0.2} maxPolarAngle={1.25} enableDamping />
      {!reducedMotion && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.1} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
