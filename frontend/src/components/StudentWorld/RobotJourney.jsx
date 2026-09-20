import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Sparkles, useAnimations, useGLTF } from "@react-three/drei";

import { useFrame, useThree } from "@react-three/fiber";

import * as THREE from "three";

/* ====================================================== */
/* ROBOT MODEL ORIENTATION */
/* ====================================================== */

/*
  Most GLB characters face -Z, so 0 is correct.

  If the robot MOVES correctly but visually faces backwards,
  change this to Math.PI.
*/
const ROBOT_FORWARD_OFFSET = 0;

/* ====================================================== */
/* JOURNEY TIMING */
/* ====================================================== */

const JOURNEY = {
  establishEnd: 0.5,
  turnEnd: 0.78,
  walkEnd: 1.95,
  chargeEnd: 2.85,
  centerEnd: 3.25,
  diveEnd: 3.85,
};

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(value) {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
}

function easeInCubic(value) {
  const t = clamp01(value);

  return t * t * t;
}

function lerpNumber(from, to, progress) {
  return THREE.MathUtils.lerp(from, to, progress);
}

function lerpVector(target, from, to, progress) {
  target.set(
    lerpNumber(from.x, to.x, progress),

    lerpNumber(from.y, to.y, progress),

    lerpNumber(from.z, to.z, progress),
  );
}

/* ====================================================== */
/* PORTAL ENERGY */
/* ====================================================== */

function PortalEnergy({ position, phase, accent, secondary }) {
  const rootRef = useRef(null);

  const ringOneRef = useRef(null);

  const ringTwoRef = useRef(null);

  const ringThreeRef = useRef(null);

  const coreRef = useRef(null);

  const surfaceRef = useRef(null);

  const shockwaveRef = useRef(null);

  const entryStartedRef = useRef(false);

  const isCharging = phase === "charging" || phase === "entering";

  const isEntering = phase === "entering";

  useEffect(() => {
    if (phase !== "entering") {
      entryStartedRef.current = false;

      return;
    }

    if (!shockwaveRef.current || entryStartedRef.current) {
      return;
    }

    entryStartedRef.current = true;

    shockwaveRef.current.scale.set(0.35, 0.35, 0.35);

    shockwaveRef.current.material.opacity = 1;
  }, [phase]);

  useFrame(({ clock }, delta) => {
    if (!rootRef.current) {
      return;
    }

    const time = clock.elapsedTime;

    const targetScale = isEntering ? 1.55 : isCharging ? 1 : 0.68;

    const scaleSpeed = isEntering ? 8 : 5;

    const nextScale = THREE.MathUtils.damp(
      rootRef.current.scale.x,
      targetScale,
      scaleSpeed,
      delta,
    );

    rootRef.current.scale.setScalar(nextScale);

    const rotationSpeed = isEntering ? 4.2 : isCharging ? 1.6 : 0.35;

    if (ringOneRef.current) {
      ringOneRef.current.rotation.z += delta * rotationSpeed;
    }

    if (ringTwoRef.current) {
      ringTwoRef.current.rotation.z -= delta * rotationSpeed * 1.35;
    }

    if (ringThreeRef.current) {
      ringThreeRef.current.rotation.z += delta * rotationSpeed * 0.7;

      ringThreeRef.current.rotation.x =
        Math.PI / 2 + Math.sin(time * 1.2) * 0.13;
    }

    if (coreRef.current) {
      const pulse =
        1 + Math.sin(time * (isEntering ? 11 : 5)) * (isEntering ? 0.18 : 0.08);

      coreRef.current.scale.setScalar(pulse);
    }

    if (surfaceRef.current) {
      surfaceRef.current.material.opacity = isEntering
        ? 0.42 + Math.sin(time * 12) * 0.1
        : isCharging
          ? 0.11 + Math.sin(time * 4) * 0.025
          : 0;
    }

    if (isEntering && shockwaveRef.current && entryStartedRef.current) {
      const currentScale = shockwaveRef.current.scale.x;

      const next = Math.min(3.6, currentScale + delta * 4.2);

      shockwaveRef.current.scale.setScalar(next);

      shockwaveRef.current.material.opacity = Math.max(
        0,
        shockwaveRef.current.material.opacity - delta * 1.6,
      );
    }
  });

  if (!isCharging) {
    return null;
  }

  return (
    <group ref={rootRef} position={position} scale={0.68}>
      {/* OUTER RING */}

      <mesh ref={ringOneRef}>
        <torusGeometry args={[1.18, 0.05, 8, 56]} />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={isEntering ? 1 : 0.82}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* SECOND RING */}

      <mesh ref={ringTwoRef} rotation={[0, 0, 0.72]}>
        <torusGeometry args={[0.96, 0.032, 8, 52]} />

        <meshBasicMaterial
          color={secondary}
          transparent
          opacity={isEntering ? 0.95 : 0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* DEPTH RING */}

      <mesh ref={ringThreeRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.78, 0.025, 8, 40]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isEntering ? 0.8 : 0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* SURFACE */}

      <mesh ref={surfaceRef} position={[0, 0, -0.01]}>
        <circleGeometry args={[0.91, 36]} />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* CORE */}

      <mesh ref={coreRef} position={[0, 0, 0.04]}>
        <circleGeometry args={[0.14, 18]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={isEntering ? 1 : 0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* SHOCKWAVE */}

      <mesh ref={shockwaveRef} position={[0, 0, 0.07]}>
        <ringGeometry args={[0.48, 0.57, 36]} />

        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <Sparkles
        count={isEntering ? 42 : 24}
        scale={[3.2, 3.2, 1.4]}
        size={isEntering ? 3.6 : 2.6}
        speed={isEntering ? 1.1 : 0.55}
        opacity={isEntering ? 0.9 : 0.62}
        color={secondary}
      />
    </group>
  );
}

/* ====================================================== */
/* ROBOT JOURNEY */
/* ====================================================== */

function RobotJourney({ level, active, onPhaseChange, onComplete }) {
  const { camera } = useThree();

  const robotRef = useRef(null);

  const robotVisualRef = useRef(null);

  const cameraTargetRef = useRef(new THREE.Vector3());

  const cameraStartRef = useRef(new THREE.Vector3());

  const elapsedRef = useRef(0);

  const completedRef = useRef(false);

  const phaseRef = useRef("idle");

  const walkingRef = useRef(false);

  const onCompleteRef = useRef(onComplete);

  const onPhaseChangeRef = useRef(onPhaseChange);

  const [portalPhase, setPortalPhase] = useState("idle");

  const { scene, animations } = useGLTF("/models/Robot.glb");

  const { actions, names } = useAnimations(animations, scene);

  /* ====================================================== */
  /* POSITIONS */
  /* ====================================================== */

  const islandX = level.position[0];

  const islandY = level.position[1];

  const islandZ = level.position[2];

  const journeyPoints = useMemo(() => {
    const startPosition = new THREE.Vector3(
      islandX,
      islandY + 1.66,
      islandZ + 2.05,
    );

    const stopPosition = new THREE.Vector3(
      islandX,
      islandY + 1.66,
      islandZ + 0.15,
    );

    const portalPosition = new THREE.Vector3(
      islandX,
      islandY + 2.85,
      islandZ - 0.7,
    );

    const establishCamera = new THREE.Vector3(
      islandX + 3.2,
      islandY + 3.9,
      islandZ + 6,
    );

    const followCamera = new THREE.Vector3(
      islandX + 1.5,
      islandY + 2.95,
      islandZ + 3,
    );

    const chargeCamera = new THREE.Vector3(
      islandX + 1,
      islandY + 3.05,
      islandZ + 2.45,
    );

    const centeredCamera = new THREE.Vector3(
      portalPosition.x,
      portalPosition.y,
      portalPosition.z + 2.15,
    );

    const diveCamera = new THREE.Vector3(
      portalPosition.x,
      portalPosition.y,
      portalPosition.z - 4.6,
    );

    const chargeLookFrom = new THREE.Vector3(
      stopPosition.x,
      stopPosition.y + 0.72,
      stopPosition.z - 0.35,
    );

    const targetYaw =
      Math.atan2(
        stopPosition.x - startPosition.x,
        stopPosition.z - startPosition.z,
      ) + ROBOT_FORWARD_OFFSET;

    return {
      startPosition,
      stopPosition,
      portalPosition,
      establishCamera,
      followCamera,
      chargeCamera,
      centeredCamera,
      diveCamera,
      chargeLookFrom,
      targetYaw,
    };
  }, [islandX, islandY, islandZ]);

  const {
    startPosition,
    stopPosition,
    portalPosition,
    establishCamera,
    followCamera,
    chargeCamera,
    centeredCamera,
    diveCamera,
    chargeLookFrom,
    targetYaw,
  } = journeyPoints;

  /* ====================================================== */
  /* CALLBACK REFS */
  /* ====================================================== */

  useEffect(() => {
    onCompleteRef.current = onComplete;

    onPhaseChangeRef.current = onPhaseChange;
  }, [onComplete, onPhaseChange]);

  /* ====================================================== */
  /* PHASE */
  /* ====================================================== */

  const setPhase = (nextPhase) => {
    if (phaseRef.current === nextPhase) {
      return;
    }

    phaseRef.current = nextPhase;

    setPortalPhase(nextPhase);

    onPhaseChangeRef.current?.(nextPhase);
  };

  /* ====================================================== */
  /* MODEL ANIMATIONS */
  /* ====================================================== */

  const stopOtherActions = (keep) => {
    Object.values(actions).forEach((action) => {
      if (action && action !== keep) {
        action.fadeOut(0.18);
      }
    });
  };

  const playIdle = () => {
    walkingRef.current = false;

    if (robotVisualRef.current) {
      robotVisualRef.current.position.y = 0;
      robotVisualRef.current.rotation.z = 0;
    }

    /*
      IMPORTANT:
      Do not use Wave / Hello / Greet as an idle fallback.
      If the GLB has an Idle clip, use it.
      Otherwise simply stop the current animation and keep
      the robot standing naturally.
    */
    const idleName = names.find((name) => /idle/i.test(name));

    if (!idleName) {
      Object.values(actions).forEach((action) => {
        action?.fadeOut(0.18);
      });

      return;
    }

    const idle = actions[idleName];

    if (!idle) {
      return;
    }

    stopOtherActions(idle);

    idle.reset();

    idle.setLoop(THREE.LoopRepeat, Infinity);

    idle.timeScale = 0.9;

    idle.fadeIn(0.25).play();
  };

  const playWalk = () => {
    walkingRef.current = true;

    /*
      Prefer the real Walk clip.
      This also matches names such as:
      "Walk", "02_Walk", "Robot_Walk", "Walking".
    */
    const walkName =
      names.find((name) => /walk/i.test(name)) ||
      names.find((name) => /run/i.test(name));

    const walk = actions[walkName];

    /*
      No matching animation is OK.
      The robot will still physically translate and use
      procedural bobbing below.
    */
    if (!walk) {
      return;
    }

    stopOtherActions(walk);

    walk.reset();

    walk.setLoop(THREE.LoopRepeat, Infinity);

    walk.timeScale = 1.45;

    walk.fadeIn(0.2).play();
  };

  useEffect(() => {
    if (!names.length) {
      return;
    }

    playIdle();

    return () => {
      Object.values(actions).forEach((action) => {
        action?.stop();
      });
    };
  }, [actions, names]);

  /* ====================================================== */
  /* PLACE ROBOT WHEN WORLD IS IDLE */
  /* ====================================================== */

  useLayoutEffect(() => {
    if (!robotRef.current || active) {
      return;
    }

    robotRef.current.position.copy(startPosition);

    robotRef.current.rotation.set(0, 0.45, 0);

    elapsedRef.current = 0;
    completedRef.current = false;

    phaseRef.current = "idle";

    setPortalPhase("idle");
  }, [active, islandX, islandY, islandZ]);

  /* ====================================================== */
  /* START JOURNEY */
  /* ====================================================== */

  useEffect(() => {
    if (!active || !robotRef.current) {
      return;
    }

    elapsedRef.current = 0;

    completedRef.current = false;

    cameraStartRef.current.copy(camera.position);

    robotRef.current.position.copy(startPosition);

    robotRef.current.rotation.set(0, 0.45, 0);

    cameraTargetRef.current.set(
      startPosition.x,
      startPosition.y + 0.6,
      startPosition.z,
    );

    camera.fov = 42;
    camera.updateProjectionMatrix();

    setPhase("approach");
  }, [active]);

  /* ====================================================== */
  /* FRAME-DRIVEN JOURNEY */
  /* ====================================================== */

  useFrame(({ clock }, delta) => {
    /* -------------------------------------------------- */
    /* Procedural walk / idle motion */
    /* -------------------------------------------------- */

    if (robotVisualRef.current && walkingRef.current) {
      const time = clock.elapsedTime;

      robotVisualRef.current.position.y =
        Math.abs(Math.sin(time * 10.5)) * 0.045;

      robotVisualRef.current.rotation.z = Math.sin(time * 10.5) * 0.025;
    }

    if (!active || !robotRef.current) {
      return;
    }

    /*
        Clamp delta so switching tabs / devtools does not make
        the robot teleport through the entire cinematic.
      */
    elapsedRef.current += Math.min(delta, 0.05);

    const time = elapsedRef.current;

    const robot = robotRef.current;

    /* -------------------------------------------------- */
    /* 1. ESTABLISHING SHOT */
    /* -------------------------------------------------- */

    if (time < JOURNEY.establishEnd) {
      setPhase("approach");

      const progress = smoothStep(time / JOURNEY.establishEnd);

      robot.position.copy(startPosition);

      lerpVector(
        camera.position,
        cameraStartRef.current,
        establishCamera,
        progress,
      );

      cameraTargetRef.current.set(
        startPosition.x,
        startPosition.y + 0.58,
        startPosition.z - progress * 0.15,
      );
    } else if (time < JOURNEY.turnEnd) {
      /* -------------------------------------------------- */
      /* 2. TURN */
      /* -------------------------------------------------- */
      setPhase("walking");

      const progress = smoothStep(
        (time - JOURNEY.establishEnd) /
          (JOURNEY.turnEnd - JOURNEY.establishEnd),
      );

      robot.position.copy(startPosition);

      robot.rotation.y = lerpNumber(0.45, targetYaw, progress);

      camera.position.copy(establishCamera);

      cameraTargetRef.current.set(
        startPosition.x,
        startPosition.y + 0.58,
        startPosition.z - 0.15,
      );

      if (progress > 0.65 && !walkingRef.current) {
        playWalk();
      }
    } else if (time < JOURNEY.walkEnd) {
      /* -------------------------------------------------- */
      /* 3. ACTUAL ROBOT WALK */
      /* -------------------------------------------------- */
      setPhase("walking");

      if (!walkingRef.current) {
        playWalk();
      }

      const rawProgress =
        (time - JOURNEY.turnEnd) / (JOURNEY.walkEnd - JOURNEY.turnEnd);

      /*
          Use linear travel so the feet do not visually slow down
          in the middle of the path.
        */
      const progress = clamp01(rawProgress);

      robot.position.set(
        lerpNumber(startPosition.x, stopPosition.x, progress),

        lerpNumber(startPosition.y, stopPosition.y, progress),

        lerpNumber(startPosition.z, stopPosition.z, progress),
      );

      /*
          Camera follows the robot while remaining offset
          to the right and above.
        */
      const cameraProgress = smoothStep(progress);

      lerpVector(
        camera.position,
        establishCamera,
        followCamera,
        cameraProgress,
      );

      cameraTargetRef.current.set(
        robot.position.x,
        robot.position.y + 0.62,
        robot.position.z - 0.18,
      );
    } else if (time < JOURNEY.chargeEnd) {
      /* -------------------------------------------------- */
      /* 4. PORTAL CHARGE */
      /* -------------------------------------------------- */
      setPhase("charging");

      if (walkingRef.current) {
        playIdle();
      }

      robot.position.copy(stopPosition);

      const progress = smoothStep(
        (time - JOURNEY.walkEnd) / (JOURNEY.chargeEnd - JOURNEY.walkEnd),
      );

      lerpVector(camera.position, followCamera, chargeCamera, progress);

      lerpVector(
        cameraTargetRef.current,
        chargeLookFrom,
        portalPosition,
        progress,
      );
    } else if (time < JOURNEY.centerEnd) {
      /* -------------------------------------------------- */
      /* 5. CENTER PORTAL */
      /* -------------------------------------------------- */
      setPhase("charging");

      const progress = smoothStep(
        (time - JOURNEY.chargeEnd) / (JOURNEY.centerEnd - JOURNEY.chargeEnd),
      );

      robot.position.copy(stopPosition);

      lerpVector(camera.position, chargeCamera, centeredCamera, progress);

      cameraTargetRef.current.copy(portalPosition);
    } else if (time < JOURNEY.diveEnd) {
      /* -------------------------------------------------- */
      /* 6. PORTAL DIVE */
      /* -------------------------------------------------- */
      setPhase("entering");

      const rawProgress =
        (time - JOURNEY.centerEnd) / (JOURNEY.diveEnd - JOURNEY.centerEnd);

      const progress = easeInCubic(rawProgress);

      robot.position.copy(stopPosition);

      lerpVector(camera.position, centeredCamera, diveCamera, progress);

      cameraTargetRef.current.set(
        portalPosition.x,
        portalPosition.y,
        lerpNumber(portalPosition.z, portalPosition.z - 5, progress),
      );

      camera.fov = lerpNumber(42, 70, progress);

      camera.updateProjectionMatrix();
    } else if (!completedRef.current) {
      /* -------------------------------------------------- */
      /* 7. COMPLETE */
      /* -------------------------------------------------- */
      completedRef.current = true;

      walkingRef.current = false;

      onCompleteRef.current?.();
    }

    camera.lookAt(cameraTargetRef.current);
  });

  /* ====================================================== */
  /* RENDER */
  /* ====================================================== */

  return (
    <Fragment>
      <group ref={robotRef}>
        <group ref={robotVisualRef}>
          <primitive
            object={scene}
            scale={0.5}
            position={[0, -1.02, 0]}
            rotation={[0, 0, 0]}
          />
        </group>

        {/* ROBOT FLOOR RING */}

        <mesh position={[0, -0.93, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.66, 24]} />

          <meshBasicMaterial
            color="#48d9ff"
            transparent
            opacity={0.38}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {(portalPhase === "charging" || portalPhase === "entering") && (
        <PortalEnergy
          position={portalPosition}
          phase={portalPhase}
          accent={level.accent}
          secondary="#45dcff"
        />
      )}
    </Fragment>
  );
}

useGLTF.preload("/models/Robot.glb");

export default RobotJourney;

// npm install @react-three/postprocessing postprocessing
