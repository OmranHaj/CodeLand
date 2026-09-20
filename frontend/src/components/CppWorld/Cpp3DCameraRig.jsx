import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

export default function Cpp3DCameraRig({
  type,
  currentPhase = 0,
  cameraMode = "cinematic", // 'cinematic' | 'orbit' | 'top'
}) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const [orbitActive, setOrbitActive] = useState(false);

  // GSAP animation proxy object
  const animState = useRef({
    camX: 0,
    camY: 3.8,
    camZ: 8.2,
    lookX: 0,
    lookY: 0.5,
    lookZ: 0,
  });

  const tweenRef = useRef(null);

  // Calculate target camera and lookAt based on C++ concept type, phase, and cameraMode
  const getCameraTargets = () => {
    if (cameraMode === "top") {
      return {
        cam: [0, 11, 0.01],
        look: [0, 0, 0],
      };
    }

    if (cameraMode === "orbit") {
      return {
        cam: [camera.position.x, camera.position.y, camera.position.z],
        look: [0, 0.5, 0],
      };
    }

    // Cinematic Auto-Director Mode: follows the active component in the pipeline
    switch (type) {
      case "cpp-intro": {
        // Phases: 0: Source Code, 1: Lexer, 2: Parser, 3: Compiler Core, 4: Linker, 5: Runtime Output
        const positions = [
          { cam: [-3.2, 3.2, 6.5], look: [-2.6, 0.5, 0] }, // Source Code
          { cam: [-1.4, 3.2, 6.2], look: [-0.9, 0.5, 0] }, // Lexer/AST
          { cam: [0, 3.5, 6.5], look: [0, 0.5, 0] },       // Compiler Core
          { cam: [1.4, 3.2, 6.2], look: [0.9, 0.5, 0] },  // Linker
          { cam: [3.2, 3.2, 6.5], look: [2.6, 0.5, 0] },   // Executable / Output
          { cam: [0, 4.2, 8.5], look: [0, 0.5, 0] },       // Overview Complete
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      case "cpp-program-flow": {
        // Phases: 0: #include Library, 1: main() Entry, 2: Statement Execution, 3: return 0
        const positions = [
          { cam: [-2.8, 3.0, 6.2], look: [-2.2, 0.5, 0] }, // Library
          { cam: [-0.8, 3.2, 6.2], look: [-0.5, 0.5, 0] }, // main() entry
          { cam: [1.0, 3.2, 6.2], look: [0.8, 0.5, 0] },  // Statements
          { cam: [2.8, 3.0, 6.2], look: [2.2, 0.5, 0] },   // return 0
          { cam: [0, 3.8, 7.8], look: [0, 0.5, 0] },
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      case "cpp-main-function": {
        // Phases: 0: CPU Reset, 1: Call main(), 2: Stack Frame, 3: EIP Instruction, 4: Exit Code
        const positions = [
          { cam: [-2.5, 3.2, 6.2], look: [-1.8, 0.5, 0] },
          { cam: [0, 3.4, 6.5], look: [0, 0.5, 0] },
          { cam: [1.5, 3.2, 6.2], look: [1.2, 0.5, 0] },
          { cam: [2.6, 3.2, 6.2], look: [2.2, 0.5, 0] },
          { cam: [0, 4.0, 8.0], look: [0, 0.5, 0] },
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      case "cpp-output": {
        // Phases: 0: Memory String, 1: Operator <<, 2: Buffer Queue, 3: Terminal Flush
        const positions = [
          { cam: [-2.8, 3.0, 6.2], look: [-2.2, 0.5, 0] },
          { cam: [-0.6, 3.2, 6.2], look: [-0.4, 0.5, 0] },
          { cam: [1.0, 3.2, 6.2], look: [0.8, 0.5, 0] },
          { cam: [2.8, 3.0, 6.2], look: [2.2, 0.5, 0] },
          { cam: [0, 3.8, 7.8], look: [0, 0.5, 0] },
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      case "cpp-comments": {
        // Phases: 0: Token Stream, 1: Comment Scan, 2: Comment Bypassed, 3: Clean Machine Code
        const positions = [
          { cam: [-2.2, 3.0, 6.2], look: [-1.8, 0.5, 0] },
          { cam: [0, 3.5, 6.2], look: [0, 0.5, 0] },
          { cam: [1.8, 3.0, 6.2], look: [1.5, 0.5, 0] },
          { cam: [0, 3.8, 7.5], look: [0, 0.5, 0] },
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      case "cpp-semicolon": {
        // Phases: 0: Missing Terminator, 1: Syntax Scanner Alarm, 2: Semicolon Placed, 3: Build Success
        const positions = [
          { cam: [-1.8, 3.2, 6.2], look: [-1.2, 0.5, 0] },
          { cam: [0, 3.4, 6.2], look: [0, 0.5, 0] },
          { cam: [1.6, 3.2, 6.2], look: [1.2, 0.5, 0] },
          { cam: [0, 3.8, 7.8], look: [0, 0.5, 0] },
        ];
        return positions[Math.min(currentPhase, positions.length - 1)];
      }

      default:
        return {
          cam: [0, 3.8, 7.8],
          look: [0, 0.5, 0],
        };
    }
  };

  // Trigger GSAP transition on phase or cameraMode change
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
  }, [currentPhase, cameraMode, type, camera]);

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
