import { Suspense, useEffect } from "react";

import { Canvas, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";

import * as THREE from "three";

/* ====================================================== */
/* ROBOT FRAMING */
/* ====================================================== */

const MODEL_POSITION = [0, -0.7, 0];
const MODEL_ROTATION = [0, 0, 0];
const MODEL_SCALE = 0.2;

const CAMERA_POSITION = [0, 0.18, 2.35];
const CAMERA_TARGET = [0, -0.18, 0];

/* ====================================================== */
/* CAMERA */
/* ====================================================== */

function RobotCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...CAMERA_POSITION);

    camera.lookAt(...CAMERA_TARGET);

    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

/* ====================================================== */
/* ROBOT MODEL */
/* ====================================================== */

function RobotModel({ reaction = "idle", reactionKey = 0 }) {
  const { scene, animations } = useGLTF("/models/Robot.glb");

  const { actions, names, mixer } = useAnimations(animations, scene);

  /* ==================================================== */
  /* ANIMATION HELPERS */
  /* ==================================================== */

  const findActionName = (exactName, fallbackRegex) => {
    const exact = names.find((name) => name === exactName);

    if (exact) {
      return exact;
    }

    return names.find((name) => fallbackRegex.test(name));
  };

  const findIdleAction = () => {
    /*
      Idle means Idle only.
      Never fall back to Wave / Hello / Greet.
    */

    const idleName =
      names.find((name) => name === "01_Idle") ||
      names.find((name) => /(^|[_ -])idle($|[_ -])/i.test(name));

    return idleName ? actions[idleName] : null;
  };

  const stopAllActions = () => {
    Object.values(actions).forEach((action) => {
      action?.stop();
    });
  };

  const fadeOutOtherActions = (activeAction) => {
    Object.values(actions).forEach((action) => {
      if (action && action !== activeAction) {
        action.fadeOut(0.16);
      }
    });
  };

  const playIdle = () => {
    const idle = findIdleAction();

    if (!idle) {
      stopAllActions();

      console.warn(
        '[CodeLand Robot] "01_Idle" was not found. Robot will remain still.',
        names,
      );

      return;
    }

    fadeOutOtherActions(idle);

    idle.reset();
    idle.enabled = true;
    idle.paused = false;
    idle.clampWhenFinished = false;

    idle.setLoop(THREE.LoopRepeat, Infinity);

    idle.fadeIn(0.22).play();
  };

  /* ==================================================== */
  /* DEFAULT STATE = IDLE */
  /* ==================================================== */

  useEffect(() => {
    if (!names.length) {
      return undefined;
    }

    playIdle();

    return () => {
      stopAllActions();
    };
  }, [actions, names]);

  /* ==================================================== */
  /* HAPPY / SAD */
  /* ==================================================== */

  useEffect(() => {
    if (!names.length) {
      return undefined;
    }

    if (reaction === "idle") {
      playIdle();

      return undefined;
    }

    let animationName = null;

    if (reaction === "happy") {
      animationName = findActionName("04_Happy", /happy/i);
    }

    if (reaction === "sad") {
      animationName = findActionName("05_Sad", /sad/i);
    }

    if (!animationName) {
      console.warn(
        `[CodeLand Robot] Missing animation for reaction: ${reaction}`,
        names,
      );

      playIdle();

      return undefined;
    }

    const action = actions[animationName];

    if (!action) {
      playIdle();

      return undefined;
    }

    fadeOutOtherActions(action);

    action.stop();
    action.reset();

    action.enabled = true;
    action.paused = false;
    action.clampWhenFinished = true;

    action.setLoop(THREE.LoopOnce, 1);

    action.fadeIn(0.14).play();

    const handleFinished = (event) => {
      if (event.action !== action) {
        return;
      }

      action.fadeOut(0.16);

      playIdle();
    };

    mixer.addEventListener("finished", handleFinished);

    return () => {
      mixer.removeEventListener("finished", handleFinished);
    };
  }, [reaction, reactionKey, actions, names, mixer]);

  /* ==================================================== */
  /* MODEL */
  /* ==================================================== */

  return (
    <group position={MODEL_POSITION} rotation={MODEL_ROTATION}>
      <primitive object={scene} scale={MODEL_SCALE} />
    </group>
  );
}

/* ====================================================== */
/* LESSON ROBOT */
/* ====================================================== */

function LessonRobot({ reaction = "idle", reactionKey = 0 }) {
  return (
    <Canvas
      camera={{
        position: CAMERA_POSITION,
        fov: 25,
        near: 0.1,
        far: 50,
      }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      dpr={[1, 1.5]}
    >
      <RobotCamera />

      <ambientLight intensity={2.3} />

      <hemisphereLight
        skyColor="#e7fbff"
        groundColor="#13152d"
        intensity={1.55}
      />

      <directionalLight
        position={[3.5, 5, 4.5]}
        color="#ffffff"
        intensity={3.8}
      />

      <spotLight
        position={[0, 4.5, 3.5]}
        color="#ffffff"
        intensity={3.5}
        angle={0.58}
        penumbra={0.75}
        distance={10}
      />

      <pointLight
        position={[-2.4, 2.4, 2.2]}
        color="#8067ff"
        intensity={5.4}
        distance={8}
      />

      <pointLight
        position={[2.5, 1.8, 2.6]}
        color="#46dfff"
        intensity={4.8}
        distance={8}
      />

      <pointLight
        position={[0, 1.1, 3]}
        color="#ffffff"
        intensity={3.1}
        distance={6}
      />

      <Suspense fallback={null}>
        <RobotModel reaction={reaction} reactionKey={reactionKey} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/Robot.glb");

export default LessonRobot;
