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

    // نبحث عن Animation التلويح
    const waveName = names.find((name) =>
      /01_wave|wave|waving|hello|greet/i.test(name),
    );

    if (!waveName) {
      console.warn("Wave animation not found:", names);

      return;
    }

    const waveAction = actions[waveName];

    if (!waveAction) return;

    // نرجع الحركة لأول Frame
    waveAction.reset();

    // نخلي التلويح يتكرر دائماً
    waveAction.setLoop(THREE.LoopRepeat, Infinity);

    // ما يوقف على آخر Frame
    waveAction.clampWhenFinished = false;

    // سرعة التلويح
    waveAction.timeScale = 0.85;

    // دخول ناعم للحركة
    waveAction.fadeIn(0.35).play();

    return () => {
      waveAction.fadeOut(0.2);
      waveAction.stop();
    };
  }, [actions, names]);

  return <primitive object={scene} scale={1.3} position={[0, -2.5, 0]} />;
}

/*
  Preload للموديل
*/
useGLTF.preload("/models/Robot.glb");

function Robot() {
  return (
    <div className={styles.robot}>
      <Canvas
        camera={{
          position: [0, 0.75, 6.7],
          fov: 46,
          near: 0.1,
          far: 100,
        }}
      >
        {/* إضاءة عامة */}
        <ambientLight intensity={2} />

        {/* إضاءة رئيسية */}
        <directionalLight position={[5, 5, 5]} intensity={2} />

        {/* إضاءة من الجهة الثانية */}
        <directionalLight position={[-5, 3, 3]} intensity={1} />

        {/* إضاءة خفيفة من الخلف */}
        <directionalLight position={[0, 2, -4]} intensity={0.6} />

        <Suspense fallback={null}>
          <RobotModel />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
    </div>
  );
}

export default Robot;
