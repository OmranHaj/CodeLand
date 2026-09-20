import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ALGO_WORLD_CAMERA } from "../../data/algorithmWorldLevels";

export default function AlgoCameraRig({ selectedSector, overviewMode, disabled = false }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const [orbitActive, setOrbitActive] = useState(false);

  // GSAP tweenable state proxy
  const animState = useRef({
    camX: ALGO_WORLD_CAMERA.overviewPosition[0],
    camY: ALGO_WORLD_CAMERA.overviewPosition[1],
    camZ: ALGO_WORLD_CAMERA.overviewPosition[2],
    lookX: ALGO_WORLD_CAMERA.overviewTarget[0],
    lookY: ALGO_WORLD_CAMERA.overviewTarget[1],
    lookZ: ALGO_WORLD_CAMERA.overviewTarget[2],
  });

  const tweenRef = useRef(null);

  useEffect(() => {
    setOrbitActive(false);
    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    let targetCam = ALGO_WORLD_CAMERA.overviewPosition;
    let targetLook = ALGO_WORLD_CAMERA.overviewTarget;

    if (!overviewMode && selectedSector) {
      targetCam = selectedSector.cameraPosition || ALGO_WORLD_CAMERA.overviewPosition;
      targetLook = selectedSector.cameraTarget || selectedSector.position;
    }

    // High-end GSAP cinematic camera transition
    tweenRef.current = gsap.to(animState.current, {
      camX: targetCam[0],
      camY: targetCam[1],
      camZ: targetCam[2],
      lookX: targetLook[0],
      lookY: targetLook[1],
      lookZ: targetLook[2],
      duration: overviewMode ? 1.6 : 1.3,
      ease: "power3.inOut",
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
      onComplete: () => {
        if (overviewMode && !disabled) {
          setOrbitActive(true);
        }
      },
    });

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [selectedSector, overviewMode, disabled, camera]);

  useFrame(() => {
    if (overviewMode && orbitActive && controlsRef.current && !disabled) {
      // Keep camera bounded within luxury bounds
      controlsRef.current.target.x = THREE.MathUtils.clamp(controlsRef.current.target.x, -12, 12);
      controlsRef.current.target.y = THREE.MathUtils.clamp(controlsRef.current.target.y, 0.5, 8);
      controlsRef.current.target.z = THREE.MathUtils.clamp(controlsRef.current.target.z, -18, 5);
      camera.position.y = Math.max(camera.position.y, 2.0);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={overviewMode && orbitActive && !disabled}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      panSpeed={0.6}
      minDistance={10}
      maxDistance={38}
      minPolarAngle={0.35}
      maxPolarAngle={1.45}
      target={ALGO_WORLD_CAMERA.overviewTarget}
    />
  );
}
