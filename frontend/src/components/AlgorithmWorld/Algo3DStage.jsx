import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ====================================================== */
/* 1. 3D ARRAY & VECTOR STAGE                             */
/* ====================================================== */
export function Array3DStage({ lesson, stepData, accent = "#10b981" }) {
  const data = lesson.demoData || [12, 28, 45, 67, 89, 94];
  const activeIdx = stepData?.activeIdx ?? 0;
  const droneRef = useRef();

  useFrame((_, delta) => {
    if (droneRef.current) {
      const targetX = (activeIdx - 2.5) * 1.35;
      droneRef.current.position.x = THREE.MathUtils.lerp(
        droneRef.current.position.x,
        targetX,
        delta * 6
      );
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Overhead Laser Scanning Drone */}
      <group ref={droneRef} position={[(activeIdx - 2.5) * 1.35, 2.8, 0]}>
        <Float speed={3} rotationIntensity={0.2} floatIntensity={0.2}>
          <mesh>
            <octahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive={accent}
              emissiveIntensity={2.5}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.03, 16, 32]} />
            <meshBasicMaterial color={accent} />
          </mesh>
          {/* Vertical Downward Targeting Laser */}
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 2.2, 12]} />
            <meshBasicMaterial color={accent} transparent opacity={0.65} />
          </mesh>
        </Float>
      </group>

      {/* 3D Contiguous Memory Track */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[8.6, 0.12, 1.8]} />
        <meshStandardMaterial color="#050a14" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[8.4, 0.02, 1.6]} />
        <meshBasicMaterial color={accent} wireframe />
      </mesh>

      {/* 6 Memory Blocks */}
      {data.map((val, idx) => {
        const isActive = activeIdx === idx;
        const posX = (idx - 2.5) * 1.35;
        const address = `0x7F${(idx * 4).toString(16).padStart(2, "0").toUpperCase()}`;

        return (
          <group key={idx} position={[posX, isActive ? 0.35 : 0, 0]}>
            {/* Outer Translucent Memory Shell */}
            <mesh>
              <boxGeometry args={[1.05, 1.05, 1.05]} />
              <meshPhysicalMaterial
                color={isActive ? accent : "#0a1324"}
                emissive={isActive ? accent : "#050b18"}
                emissiveIntensity={isActive ? 1.6 : 0.2}
                roughness={0.15}
                metalness={0.8}
                transparent
                opacity={0.92}
                clearcoat={1}
              />
            </mesh>

            {/* Glowing Wireframe Outer Accent */}
            <mesh>
              <boxGeometry args={[1.08, 1.08, 1.08]} />
              <meshBasicMaterial
                color={isActive ? "#ffffff" : accent}
                wireframe
                transparent
                opacity={isActive ? 0.9 : 0.3}
              />
            </mesh>

            {/* In-Memory Value Badge */}
            <Html position={[0, 0.05, 0.58]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: isActive ? "#ffffff" : "#cbd5e1",
                  textShadow: isActive ? `0 0 14px ${accent}` : "none",
                  userSelect: "none",
                }}
              >
                {val}
              </div>
            </Html>

            {/* Top Laser Target Marker if Active */}
            {isActive && (
              <Html position={[0, 0.95, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: accent,
                    color: "#022c22",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    letterSpacing: "1px",
                    boxShadow: `0 0 14px ${accent}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  ACCESS O(1)
                </div>
              </Html>
            )}

            {/* Bottom Hardware Address & Index Readout */}
            <Html position={[0, -0.9, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", whiteSpace: "nowrap", userSelect: "none" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: isActive ? accent : "#64748b" }}>
                  [{idx}]
                </div>
                <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#475569" }}>
                  {address}
                </div>
              </div>
            </Html>

            {isActive && (
              <pointLight color={accent} intensity={2.8} distance={3.5} position={[0, 0.8, 0]} />
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 2. 3D TWO POINTERS STAGE                               */
/* ====================================================== */
export function TwoPointers3DStage({ lesson, stepData }) {
  const data = lesson.demoData || [2, 7, 11, 15, 19, 23];
  const left = stepData?.left ?? 0;
  const right = stepData?.right ?? 5;
  const isMatch = stepData?.state === "match";

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Track Base */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[8.6, 0.12, 1.8]} />
        <meshStandardMaterial color="#050a14" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Floating 3D Comparison Bridge HUD */}
      <Html position={[0, 2.6, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
        <div
          style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: isMatch ? "rgba(16, 185, 129, 0.3)" : "rgba(15, 23, 42, 0.85)",
            border: `1.5px solid ${isMatch ? "#10b981" : "rgba(255, 255, 255, 0.15)"}`,
            boxShadow: `0 0 20px ${isMatch ? "#10b981" : "rgba(0,0,0,0.5)"}`,
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 800,
            whiteSpace: "nowrap",
            backdropFilter: "blur(8px)",
            textAlign: "center",
          }}
        >
          <span style={{ color: "#06b6d4" }}>L: {data[left]}</span>
          <span style={{ margin: "0 6px", opacity: 0.6 }}>+</span>
          <span style={{ color: "#f59e0b" }}>R: {data[right]}</span>
          <span style={{ margin: "0 6px", opacity: 0.6 }}>=</span>
          <span style={{ color: isMatch ? "#34d399" : "#ffffff" }}>
            {data[left] + data[right]}
          </span>
          <span style={{ margin: "0 8px", opacity: 0.4 }}>|</span>
          <span style={{ fontSize: "11px", color: isMatch ? "#34d399" : "#94a3b8" }}>
            Target: {lesson.targetSum || 26} {isMatch ? "✓ MATCH!" : ""}
          </span>
        </div>
      </Html>

      {/* 6 Sorted Pedestals */}
      {data.map((val, idx) => {
        const isL = left === idx;
        const isR = right === idx;
        const posX = (idx - 2.5) * 1.35;
        const isP = isL || isR;
        const color = isMatch && isP ? "#10b981" : isL ? "#06b6d4" : isR ? "#f59e0b" : "#1e293b";

        return (
          <group key={idx} position={[posX, isP ? 0.3 : 0, 0]}>
            <mesh>
              <boxGeometry args={[1.05, 1.05, 1.05]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isP ? 1.8 : 0.15}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Inner Wireframe */}
            <mesh>
              <boxGeometry args={[1.08, 1.08, 1.08]} />
              <meshBasicMaterial color="#ffffff" wireframe transparent opacity={isP ? 0.8 : 0.2} />
            </mesh>

            {/* Value Display */}
            <Html position={[0, 0.05, 0.58]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", userSelect: "none" }}>
                {val}
              </div>
            </Html>

            {/* Pointer Hover Drones */}
            {isL && (
              <Html position={[0, 1.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "#06b6d4",
                    color: "#083344",
                    fontSize: "11px",
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    boxShadow: "0 0 14px #06b6d4",
                    whiteSpace: "nowrap",
                  }}
                >
                  LEFT [L]
                </div>
              </Html>
            )}

            {isR && (
              <Html position={[0, 1.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "#f59e0b",
                    color: "#451a03",
                    fontSize: "11px",
                    fontWeight: 900,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    boxShadow: "0 0 14px #f59e0b",
                    whiteSpace: "nowrap",
                  }}
                >
                  RIGHT [R]
                </div>
              </Html>
            )}

            {/* Index Label */}
            <Html position={[0, -0.85, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: isP ? color : "#64748b" }}>
                [{idx}]
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 3. 3D LINKED LIST STAGE                                */
/* ====================================================== */
export function LinkedList3DStage({ lesson, stepData, accent = "#06b6d4" }) {
  const data = lesson.demoData || [10, 20, 30, 40];
  const isReverse = lesson.visualizerType === "linked-list-reverse";

  return (
    <group position={[0, 0, 0]}>
      {data.map((val, idx) => {
        const posX = (idx - 1.5) * 2.2;
        const isCurrent =
          stepData.activeIdx === idx ||
          stepData.curr === val ||
          stepData.curr === idx + 1;
        const isPrev = stepData.prev === val || stepData.prev === idx + 1;

        return (
          <group key={idx} position={[posX, isCurrent ? 0.35 : 0, 0]}>
            {/* 3D Node Crystal Sphere */}
            <mesh>
              <sphereGeometry args={[0.55, 32, 32]} />
              <meshPhysicalMaterial
                color={isCurrent ? accent : isPrev ? "#f59e0b" : "#0f172a"}
                emissive={isCurrent ? accent : isPrev ? "#f59e0b" : "#06b6d4"}
                emissiveIntensity={isCurrent ? 2.0 : isPrev ? 1.5 : 0.3}
                roughness={0.15}
                metalness={0.85}
                clearcoat={1}
              />
            </mesh>

            {/* Surrounding Orbital Neon Ring */}
            <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
              <torusGeometry args={[0.75, 0.03, 16, 40]} />
              <meshBasicMaterial color={isCurrent ? "#ffffff" : accent} />
            </mesh>

            {/* Value Display */}
            <Html position={[0, 0, 0.65]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "19px", fontWeight: 900, color: "#ffffff", userSelect: "none" }}>
                {val}
              </div>
            </Html>

            {/* Status Pointer Badges */}
            {isCurrent && (
              <Html position={[0, 1.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: accent,
                    color: "#083344",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    boxShadow: `0 0 12px ${accent}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  curr
                </div>
              </Html>
            )}

            {isPrev && (
              <Html position={[0, 1.1, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "#f59e0b",
                    color: "#451a03",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    boxShadow: "0 0 12px #f59e0b",
                    whiteSpace: "nowrap",
                  }}
                >
                  prev
                </div>
              </Html>
            )}

            {/* Connecting Laser Beam to Next Node */}
            {idx < data.length - 1 && (
              <group position={[1.1, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 1.1, 16]} />
                  <meshBasicMaterial color={accent} transparent opacity={0.75} />
                </mesh>
                {/* Arrow Head */}
                <mesh
                  position={[isReverse && isPrev ? -0.4 : 0.4, 0, 0]}
                  rotation={[0, 0, isReverse && isPrev ? Math.PI / 2 : -Math.PI / 2]}
                >
                  <coneGeometry args={[0.12, 0.25, 16]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 4. 3D STACK & QUEUE STAGE                              */
/* ====================================================== */
export function StackQueue3DStage({ lesson, stepData }) {
  const isStack = lesson.visualizerType === "stack";
  const items = isStack ? stepData?.stack || [] : stepData?.queue || [];
  const accent = "#8b5cf6";

  if (isStack) {
    return (
      <group position={[0, -0.8, 0]}>
        {/* Transparent Cylindrical Glass Vacuum Tube */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 3.8, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#8b5cf6"
            roughness={0.1}
            transmission={0.85}
            transparent
            opacity={0.35}
            metalness={0.2}
          />
        </mesh>

        {/* Outer Wireframe Rings */}
        {[0, 1.0, 2.0, 3.0].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.22, 0.03, 16, 40]} />
            <meshBasicMaterial color={accent} />
          </mesh>
        ))}

        {/* Stack Items (Wafers dropping in) */}
        {items.map((item, idx) => (
          <group key={idx} position={[0, 0.35 + idx * 0.75, 0]}>
            <mesh>
              <cylinderGeometry args={[0.95, 0.95, 0.35, 32]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={1.8}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <Html position={[0, 0, 0.96]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#ffffff", userSelect: "none" }}>
                {item}
              </div>
            </Html>
            {idx === items.length - 1 && (
              <Html position={[1.4, 0, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "#a78bfa",
                    color: "#2e1065",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  TOP
                </div>
              </Html>
            )}
          </group>
        ))}

        {items.length === 0 && (
          <Html position={[0, 1.5, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px", fontWeight: 700 }}>
              EMPTY BUFFER
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Queue Horizontal Conveyor
  return (
    <group position={[0, 0, 0]}>
      {/* Conveyor Rail */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[6.5, 0.15, 1.4]} />
        <meshStandardMaterial color="#0b1329" roughness={0.2} metalness={0.85} />
      </mesh>

      {items.map((item, idx) => {
        const posX = (idx - items.length / 2) * 1.4;
        return (
          <group key={idx} position={[posX, 0.2, 0]}>
            <mesh>
              <boxGeometry args={[1.1, 0.6, 0.9]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.6} />
            </mesh>
            <Html position={[0, 0, 0.5]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <span style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>{item}</span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 5. 3D BINARY SEARCH STAGE                              */
/* ====================================================== */
export function BinarySearch3DStage({ lesson, stepData }) {
  const data = lesson.demoData || [3, 9, 14, 22, 38, 51, 64, 77, 85, 99];
  const { low, high, mid } = stepData;
  const target = lesson.target || 64;

  return (
    <group position={[0, 0, 0]}>
      {data.map((val, idx) => {
        const inRange = low !== undefined && high !== undefined && idx >= low && idx <= high;
        const isMid = mid === idx;
        const isFound = isMid && val === target;
        const posX = (idx - 4.5) * 1.05;

        return (
          <group key={idx} position={[posX, isMid ? 0.5 : inRange ? 0 : -0.4, 0]}>
            {/* Prisms */}
            <mesh>
              <boxGeometry args={[0.82, isMid ? 1.6 : 1.1, 0.82]} />
              <meshStandardMaterial
                color={isFound ? "#10b981" : isMid ? "#f59e0b" : inRange ? "#0284c7" : "#0f172a"}
                emissive={isFound ? "#10b981" : isMid ? "#f59e0b" : inRange ? "#0369a1" : "#000000"}
                emissiveIntensity={isFound ? 2.5 : isMid ? 2.0 : inRange ? 0.5 : 0}
                roughness={0.2}
                metalness={0.8}
                wireframe={!inRange}
              />
            </mesh>

            {/* Value Label */}
            <Html position={[0, 0, 0.46]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 900,
                  color: inRange ? "#ffffff" : "#475569",
                  userSelect: "none",
                }}
              >
                {val}
              </div>
            </Html>

            {/* Mid Laser Beam */}
            {isMid && (
              <mesh position={[0, 2.2, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 3.2, 12]} />
                <meshBasicMaterial color="#f59e0b" transparent opacity={0.7} />
              </mesh>
            )}

            {isMid && (
              <Html position={[0, 1.4, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "#f59e0b",
                    color: "#451a03",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  MID [{idx}]
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 6. 3D BINARY SEARCH TREE (BST) STAGE                   */
/* ====================================================== */
export function BinaryTree3DStage({ stepData }) {
  const currentVal = stepData?.current;

  // Tree nodes topology
  const nodes = [
    { val: 50, pos: [0, 2.0, 0] },
    { val: 30, pos: [-2.4, 0.6, 0] },
    { val: 70, pos: [2.4, 0.6, 0] },
    { val: 20, pos: [-3.4, -0.8, 0] },
    { val: 40, pos: [-1.4, -0.8, 0] },
    { val: 60, pos: [1.4, -0.8, 0] }, // target
    { val: 80, pos: [3.4, -0.8, 0] },
  ];

  const branches = [
    { start: [0, 2.0, 0], end: [-2.4, 0.6, 0] },
    { start: [0, 2.0, 0], end: [2.4, 0.6, 0] },
    { start: [-2.4, 0.6, 0], end: [-3.4, -0.8, 0] },
    { start: [-2.4, 0.6, 0], end: [-1.4, -0.8, 0] },
    { start: [2.4, 0.6, 0], end: [1.4, -0.8, 0] },
    { start: [2.4, 0.6, 0], end: [3.4, -0.8, 0] },
  ];

  return (
    <group position={[0, -0.3, 0]}>
      {/* 3D Branches */}
      {branches.map((b, i) => {
        const start = new THREE.Vector3(...b.start);
        const end = new THREE.Vector3(...b.end);
        const mid = start.clone().lerp(end, 0.5);
        const length = start.distanceTo(end);

        const curve = new THREE.LineCurve3(start, end);
        const geom = new THREE.TubeGeometry(curve, 12, 0.05, 8, false);

        return (
          <mesh key={i} geometry={geom}>
            <meshBasicMaterial color="#14b8a6" transparent opacity={0.45} />
          </mesh>
        );
      })}

      {/* 3D Tree Nodes */}
      {nodes.map((node) => {
        const isCurrent = currentVal === node.val;
        const isTarget = node.val === 60 && isCurrent;

        return (
          <group key={node.val} position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.48, 28, 28]} />
              <meshStandardMaterial
                color={isTarget ? "#10b981" : isCurrent ? "#14b8a6" : "#0a1525"}
                emissive={isTarget ? "#10b981" : isCurrent ? "#14b8a6" : "#0d9488"}
                emissiveIntensity={isCurrent ? 2.5 : 0.3}
                roughness={0.15}
                metalness={0.8}
              />
            </mesh>

            {/* Orbiting Ring on Active Node */}
            {isCurrent && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[0.7, 0.03, 16, 32]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}

            <Html position={[0, 0, 0.55]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#ffffff", userSelect: "none" }}>
                {node.val}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 7. 3D HASH TABLE STAGE                                 */
/* ====================================================== */
export function HashTable3DStage({ stepData }) {
  const buckets = [0, 1, 2, 3, 4];
  const targetBucket = stepData?.bucket;

  return (
    <group position={[0, 0, 0]}>
      {/* Central Holographic Hash Engine */}
      <Float speed={2.5} rotationIntensity={0.3} floatIntensity={0.2}>
        <group position={[0, 1.8, 0]}>
          <mesh>
            <octahedronGeometry args={[0.45, 0]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.5} />
          </mesh>
          <Html position={[0, 0.8, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 900,
                color: "#ec4899",
                background: "rgba(236, 72, 153, 0.15)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid #ec4899",
                whiteSpace: "nowrap",
              }}
            >
              HASH ENGINE: h(key) % 5
            </div>
          </Html>
        </group>
      </Float>

      {/* 5 Buckets arranged linearly */}
      {buckets.map((b) => {
        const isTarget = targetBucket === b;
        const posX = (b - 2) * 1.5;

        return (
          <group key={b} position={[posX, isTarget ? 0.3 : 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
              <meshStandardMaterial
                color={isTarget ? "#ec4899" : "#0d1427"}
                emissive={isTarget ? "#ec4899" : "#be185d"}
                emissiveIntensity={isTarget ? 2.0 : 0.2}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            <Html position={[0, 0, 0.65]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>[{b}]</div>
                <div style={{ fontSize: "9px", color: isTarget ? "#fbcfe8" : "#64748b" }}>
                  {b === 4 ? "user:neo" : b === 2 ? "user:trinity" : "Empty"}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 8. 3D GRAPH BFS STAGE                                  */
/* ====================================================== */
export function GraphBFS3DStage({ stepData }) {
  const visited = stepData?.visited || [];
  const current = stepData?.current;

  const nodes = [
    { id: "A", pos: [0, 1.8, 0] },
    { id: "B", pos: [-2.0, 0.4, 0.4] },
    { id: "C", pos: [2.0, 0.4, -0.4] },
    { id: "D", pos: [-2.4, -1.2, -0.2] },
    { id: "E", pos: [2.4, -1.2, 0.2] },
  ];

  const edges = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
    { from: "C", to: "E" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Edges */}
      {edges.map((edge, i) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        const start = new THREE.Vector3(...fromNode.pos);
        const end = new THREE.Vector3(...toNode.pos);
        const geom = new THREE.TubeGeometry(new THREE.LineCurve3(start, end), 12, 0.04, 8, false);

        return (
          <mesh key={i} geometry={geom}>
            <meshBasicMaterial color="#6366f1" transparent opacity={0.5} />
          </mesh>
        );
      })}

      {/* 3D Vertices */}
      {nodes.map((node) => {
        const isCurr = current === node.id;
        const isVis = visited.includes(node.id);

        return (
          <group key={node.id} position={node.pos}>
            <mesh>
              <sphereGeometry args={[0.5, 28, 28]} />
              <meshStandardMaterial
                color={isCurr ? "#6366f1" : isVis ? "#4338ca" : "#0c132c"}
                emissive={isCurr ? "#818cf8" : isVis ? "#4f46e5" : "#1e1b4b"}
                emissiveIntensity={isCurr ? 2.5 : isVis ? 1.4 : 0.2}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {isCurr && (
              <mesh rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[0.72, 0.03, 16, 32]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            )}

            <Html position={[0, 0, 0.58]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", userSelect: "none" }}>
                {node.id}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 9. 3D DYNAMIC PROGRAMMING STAGE                        */
/* ====================================================== */
export function DynamicProgramming3DStage({ stepData }) {
  const currentI = stepData?.i ?? 0;
  const vals = [0, 1, 1, 2, 3, 5];

  return (
    <group position={[0, 0, 0]}>
      {vals.map((val, idx) => {
        const isFilled = idx <= currentI;
        const isCurr = idx === currentI;
        const posX = (idx - 2.5) * 1.4;
        const height = isFilled ? Math.max(val * 0.45, 0.35) : 0.2;

        return (
          <group key={idx} position={[posX, height / 2 - 0.5, 0]}>
            <mesh>
              <boxGeometry args={[1.05, height, 1.05]} />
              <meshStandardMaterial
                color={isCurr ? "#f43f5e" : isFilled ? "#e11d48" : "#0d1427"}
                emissive={isCurr ? "#fb7185" : isFilled ? "#be123c" : "#000000"}
                emissiveIntensity={isCurr ? 2.5 : isFilled ? 1.2 : 0.1}
                roughness={0.2}
                metalness={0.8}
                wireframe={!isFilled}
              />
            </mesh>

            <Html position={[0, height / 2 + 0.45, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: isCurr ? "#f43f5e" : "#fda4af" }}>
                  DP[{idx}]
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#fff" }}>
                  {isFilled ? val : "?"}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* MAIN ROUTING STAGE DISPATCHER                          */
/* ====================================================== */
export default function Algo3DStage({ lesson, stepData, accent }) {
  const type = lesson?.visualizerType;

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 15, 10]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-10, 10, -5]} intensity={0.8} color={accent} />
      <pointLight position={[0, 4, 3]} intensity={2.0} color="#ffffff" distance={15} />

      {/* Cyberpunk Dust Particles */}
      <Sparkles count={55} scale={[12, 6, 8]} size={2.5} speed={0.4} color={accent} opacity={0.6} />

      {/* Reflection Floor Grid */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial color="#02040a" roughness={0.3} metalness={0.92} />
      </mesh>

      {/* Dynamic Sub-Stage Selector */}
      {type === "array" && <Array3DStage lesson={lesson} stepData={stepData} accent={accent} />}
      {type === "two-pointers" && <TwoPointers3DStage lesson={lesson} stepData={stepData} />}
      {(type === "linked-list" || type === "linked-list-reverse") && (
        <LinkedList3DStage lesson={lesson} stepData={stepData} accent={accent} />
      )}
      {(type === "stack" || type === "queue") && (
        <StackQueue3DStage lesson={lesson} stepData={stepData} />
      )}
      {type === "binary-search" && (
        <BinarySearch3DStage lesson={lesson} stepData={stepData} />
      )}
      {type === "binary-tree" && <BinaryTree3DStage stepData={stepData} />}
      {type === "hash-table" && <HashTable3DStage stepData={stepData} />}
      {type === "graph-bfs" && <GraphBFS3DStage stepData={stepData} />}
      {type === "dp-table" && <DynamicProgramming3DStage stepData={stepData} />}
    </>
  );
}
