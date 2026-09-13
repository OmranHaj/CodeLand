import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import styles from "./Robot.module.css";

function RobotModel() {
  const { scene, animations } = useGLTF("/models/Robot.glb");

  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    console.log("Available animations:", names);

    const waveName = names.find((name) =>
      /01_wave|waving|hello|greet/i.test(name),
    );

    if (!waveName) {
      console.warn("Wave animation not found:", names);
      return;
    }

    const waveAction = actions[waveName];

    if (!waveAction) return;

    waveAction.reset();

    waveAction.setLoop(THREE.LoopOnce, 1);

    waveAction.clampWhenFinished = true;

    waveAction.fadeIn(0.2);
    waveAction.play();

    return () => {
      waveAction.fadeOut(0.2);
      waveAction.stop();
    };
  }, [actions, names]);

  return <primitive object={scene} scale={1} position={[0, -1.8, 0]} />;
}

useGLTF.preload("/models/robot.glb");

function Robot() {
  return (
    <div className={styles.robot}>
      <Canvas
        camera={{
          position: [0, 1, 5],
          fov: 45,
        }}
      >
        <ambientLight intensity={2} />

        <directionalLight position={[5, 5, 5]} intensity={2} />

        <directionalLight position={[-5, 3, 3]} intensity={1} />

        <Suspense fallback={null}>
          <RobotModel />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  );
}

export default Robot;
