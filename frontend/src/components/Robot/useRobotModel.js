import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export const ROBOT_MODEL_URL = "/models/Robot.glb";

/**
 * The robot model for one place on the page. useGLTF caches a single scene for the whole app, and a
 * three.js object can only sit in one scene: when the student moved from a page with the robot (home,
 * world map, C++ world) to a lesson, the old page's 3D scene tore down late and took the shared robot
 * with it, so it was missing until a reload. Every robot now gets its own copy; SkeletonUtils keeps
 * the animation skeleton linked, and geometry and textures stay shared (no extra download).
 */
export function useRobotModel() {
  const { scene, animations } = useGLTF(ROBOT_MODEL_URL);
  const robot = useMemo(() => clone(scene), [scene]);
  return { scene: robot, animations };
}
