import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export default function Algo3DCameraRig({
  visualizerType,
  stepData,
  cameraMode = "cinematic", // 'cinematic' | 'orbit' | 'top'
}) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const [orbitActive, setOrbitActive] = useState(false);

  // GSAP animation proxy object
  const animState = useRef({
    camX: 0,
    camY: 4.5,
    camZ: 8.5,
    lookX: 0,
    lookY: 0.5,
    lookZ: 0,
  });

  const tweenRef = useRef(null);

  // Calculate target camera and lookAt based on algorithm type, stepData, and cameraMode
  const getCameraTargets = () => {
    if (cameraMode === "top") {
      return {
        cam: [0, 12, 0.01],
        look: [0, 0, 0],
      };
    }

    if (cameraMode === "orbit") {
      // In orbit mode, don't force a jump if controls already exist
      return {
        cam: [camera.position.x, camera.position.y, camera.position.z],
        look: [0, 0.5, 0],
      };
    }

    // Cinematic Auto-Director Mode
    switch (visualizerType) {
      case "array": {
        const activeIdx = stepData?.activeIdx ?? 0;
        const targetX = (activeIdx - 2.5) * 1.35;
        return {
          cam: [targetX * 0.4, 3.8, 7.2],
          look: [targetX * 0.5, 0.6, 0],
        };
      }

      case "two-pointers": {
        const left = stepData?.left ?? 0;
        const right = stepData?.right ?? 5;
        const midX = ((left + right) / 2 - 2.5) * 1.35;
        return {
          cam: [midX * 0.3, 3.6, 7.6],
          look: [midX * 0.4, 0.6, 0],
        };
      }

      case "linked-list":
      case "linked-list-reverse": {
        const activeIdx = stepData?.activeIdx ?? (stepData?.curr ? stepData.curr - 1 : 0);
        const targetX = (activeIdx - 1.5) * 2.2;
        return {
          cam: [targetX * 0.4, 3.2, 6.8],
          look: [targetX * 0.5, 0.5, 0],
        };
      }

      case "stack":
      case "queue": {
        return {
          cam: [0, 3.5, 7.0],
          look: [0, 1.2, 0],
        };
      }

      case "binary-search": {
        const mid = stepData?.mid ?? 4;
        const targetX = (mid - 4.5) * 1.1;
        return {
          cam: [targetX * 0.35, 4.2, 7.8],
          look: [targetX * 0.4, 0.8, 0],
        };
      }

      case "binary-tree": {
        const curr = stepData?.current;
        let lookX = 0;
        let lookY = 1.0;
        if (curr === 30 || curr === 20 || curr === 40) lookX = -1.8;
        if (curr === 70 || curr === 60 || curr === 80) lookX = 1.8;
        return {
          cam: [lookX * 0.5, 4.0, 7.8],
          look: [lookX * 0.5, lookY, 0],
        };
      }

      case "hash-table": {
        const bucket = stepData?.bucket ?? 2;
        const angle = (bucket / 5) * Math.PI * 2 - Math.PI / 2;
        const targetX = Math.cos(angle) * 1.5;
        return {
          cam: [targetX * 0.3, 4.2, 7.2],
          look: [0, 0.8, 0],
        };
      }

      case "graph-bfs": {
        const curr = stepData?.current;
        let posX = 0;
        if (curr === "B" || curr === "D") posX = -1.5;
        if (curr === "C" || curr === "E") posX = 1.5;
        return {
          cam: [posX * 0.4, 3.8, 7.5],
          look: [posX * 0.3, 0.8, 0],
        };
      }

      case "dp-table": {
        const i = stepData?.i ?? 0;
        const targetX = (i - 2.5) * 1.4;
        return {
          cam: [targetX * 0.4, 3.6, 6.8],
          look: [targetX * 0.5, 0.6, 0],
        };
      }

      default:
        return {
          cam: [0, 3.8, 7.8],
          look: [0, 0.5, 0],
        };
    }
  };

  // Trigger GSAP transition on stepData or cameraMode change
  useEffect(() => {
    if (cameraMode === "orbit") {
      setOrbitActive(true);
      return;
    }

    setOrbitActive(false);

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const { cam, look } = getCameraTargets();

    tweenRef.current = gsap.to(animState.current, {
      camX: cam[0],
      camY: cam[1],
      camZ: cam[2],
      lookX: look[0],
      lookY: look[1],
      lookZ: look[2],
      duration: 0.85,
      ease: "power2.out",
      onUpdate: () => {
        camera.position.set(
          animState.current.camX,
          animState.current.camY,
          animState.current.camZ
        );
        camera.lookAt(
          animState.current.lookX,
          animState.current.lookY,
          animState.current.lookZ
        );
        if (controlsRef.current) {
          controlsRef.current.target.set(
            animState.current.lookX,
            animState.current.lookY,
            animState.current.lookZ
          );
          controlsRef.current.update();
        }
      },
    });

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [stepData, cameraMode, visualizerType, camera]);

  useFrame(() => {
    if (cameraMode === "orbit" && controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={cameraMode === "orbit"}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.85}
      panSpeed={0.6}
      minDistance={3.5}
      maxDistance={22}
      maxPolarAngle={Math.PI / 2 + 0.05}
    />
  );
}
