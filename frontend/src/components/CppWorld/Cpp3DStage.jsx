import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ====================================================== */
/* 1. SYNTAX CORE STAGES                                  */
/* ====================================================== */

export function CppCompilerPipeline3D({ phase = 0 }) {
  const compilerRef = useRef();
  useFrame((_, delta) => {
    if (compilerRef.current) {
      compilerRef.current.rotation.y += delta * 0.75;
      compilerRef.current.rotation.x += delta * 0.35;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Source Code Hologram */}
      <group position={[-2.8, phase === 0 ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 2.0, 0.15]} />
          <meshPhysicalMaterial
            color={phase >= 0 ? "#0284c7" : "#0f172a"}
            emissive={phase >= 0 ? "#0284c7" : "#000000"}
            emissiveIntensity={phase === 0 ? 1.8 : 0.4}
            roughness={0.1}
            transmission={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Html position={[0, 0, 0.12]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8" }}>main.cpp</div>
            <div style={{ fontSize: "8px", fontFamily: "monospace", color: "#e2e8f0", marginTop: "4px" }}>
              #include &lt;iostream&gt;<br />int main() &#123;<br />&nbsp;&nbsp;std::cout...<br />&#125;
            </div>
          </div>
        </Html>
      </group>

      <mesh position={[-1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 16]} />
        <meshBasicMaterial color={phase >= 1 ? "#38bdf8" : "#334155"} transparent opacity={0.7} />
      </mesh>

      {/* Compiler Core */}
      <group position={[0, phase === 2 || phase === 3 ? 0.4 : 0, 0]}>
        <mesh ref={compilerRef}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color={phase >= 2 ? "#10b981" : "#1e293b"}
            emissive={phase >= 2 ? "#10b981" : "#0f172a"}
            emissiveIntensity={phase === 2 || phase === 3 ? 2.5 : 0.4}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[1.25, 0.03, 16, 40]} />
          <meshBasicMaterial color={phase >= 2 ? "#34d399" : "#475569"} />
        </mesh>
      </group>

      <mesh position={[1.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 16]} />
        <meshBasicMaterial color={phase >= 4 ? "#10b981" : "#334155"} transparent opacity={0.7} />
      </mesh>

      {/* Output Terminal */}
      <group position={[2.8, phase >= 4 ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 2.0, 0.15]} />
          <meshPhysicalMaterial
            color={phase >= 4 ? "#8b5cf6" : "#0f172a"}
            emissive={phase >= 4 ? "#8b5cf6" : "#000000"}
            emissiveIntensity={phase >= 4 ? 1.8 : 0.3}
            roughness={0.15}
            transmission={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        <Html position={[0, 0, 0.12]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#a78bfa" }}>TERMINAL</div>
            <div style={{ fontSize: "10px", fontWeight: 900, color: phase >= 4 ? "#34d399" : "#64748b", marginTop: "10px" }}>
              {phase >= 4 ? "> Welcome to C++" : "Waiting..."}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 2. DATA CIRCUITS STAGES                                */
/* ====================================================== */

// Variables & Memory Slots
export function CppVariables3D({ phase = 0 }) {
  const vars = [
    { type: "int", name: "score", val: "250", bytes: "4 Bytes", addr: "0x7FFF00", color: "#10b981" },
    { type: "double", name: "energy", val: "87.5", bytes: "8 Bytes", addr: "0x7FFF04", color: "#06b6d4" },
    { type: "char", name: "rank", val: "'A'", bytes: "1 Byte", addr: "0x7FFF0C", color: "#f59e0b" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {vars.map((v, idx) => {
        const posX = (idx - 1) * 2.2;
        const isCurrent = phase === idx;

        return (
          <group key={idx} position={[posX, isCurrent ? 0.35 : 0, 0]}>
            <mesh>
              <boxGeometry args={[1.6, 1.6, 1.2]} />
              <meshPhysicalMaterial
                color={v.color}
                emissive={v.color}
                emissiveIntensity={isCurrent ? 2.0 : 0.4}
                roughness={0.15}
                metalness={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[1.64, 1.64, 1.24]} />
              <meshBasicMaterial color="#ffffff" wireframe transparent opacity={isCurrent ? 0.8 : 0.2} />
            </mesh>
            <Html position={[0, 0, 0.65]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#ffffff" }}>
                  {v.type} {v.name}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff", margin: "4px 0" }}>
                  {v.val}
                </div>
                <div style={{ fontSize: "8px", fontFamily: "monospace", color: "#cbd5e1" }}>
                  {v.addr} · {v.bytes}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Numeric Types Size Comparison (int 4B, float 4B, double 8B)
export function CppNumericTypes3D({ phase = 0 }) {
  const types = [
    { name: "int", bytes: 4, label: "4 Bytes (32-bit)", val: "1024", color: "#38bdf8", size: [1.2, 1.2, 1.2] },
    { name: "float", bytes: 4, label: "4 Bytes Decimal", val: "3.14f", color: "#818cf8", size: [1.2, 1.2, 1.2] },
    { name: "double", bytes: 8, label: "8 Bytes Precision", val: "3.14159265", color: "#34d399", size: [2.0, 1.4, 1.4] },
  ];

  return (
    <group position={[0, 0, 0]}>
      {types.map((t, idx) => {
        const posX = (idx - 1) * 2.5;
        const isCurrent = phase === idx;

        return (
          <group key={idx} position={[posX, isCurrent ? 0.35 : 0, 0]}>
            <mesh>
              <boxGeometry args={t.size} />
              <meshStandardMaterial
                color={t.color}
                emissive={t.color}
                emissiveIntensity={isCurrent ? 2.2 : 0.4}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <Html position={[0, 0, t.size[2] / 2 + 0.1]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#fff" }}>{t.name}</div>
                <div style={{ fontSize: "9px", color: "#e2e8f0" }}>{t.label}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#fff", marginTop: "4px" }}>{t.val}</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Constants Guard Shield (const int MAX_LEVEL = 99)
export function CppConstants3D({ phase = 0 }) {
  const isLocked = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Memory Value Box */}
      <group position={[-1.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.6, 1.2]} />
          <meshStandardMaterial
            color={isLocked ? "#f59e0b" : "#0284c7"}
            emissive={isLocked ? "#f59e0b" : "#0284c7"}
            emissiveIntensity={1.8}
          />
        </mesh>
        <Html position={[0, 0, 0.65]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>const int MAX_LEVEL</div>
            <div style={{ fontSize: "22px", fontWeight: 900, color: "#fff" }}>99</div>
            <div style={{ fontSize: "8px", color: "#fed7aa" }}>{isLocked ? "READ-ONLY" : "MUTABLE"}</div>
          </div>
        </Html>
      </group>

      {/* Floating 3D Security Shield Lock */}
      <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[1.4, 0, 0]}>
          <mesh>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color={isLocked ? "#f59e0b" : "#64748b"}
              emissive={isLocked ? "#d97706" : "#000000"}
              emissiveIntensity={isLocked ? 2.5 : 0}
              wireframe
            />
          </mesh>
          <Html position={[0, 0, 0.75]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 900,
                color: isLocked ? "#fbbf24" : "#94a3b8",
                background: "rgba(0,0,0,0.8)",
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${isLocked ? "#f59e0b" : "rgba(255,255,255,0.1)"}`,
                whiteSpace: "nowrap",
              }}
            >
              {isLocked ? "🔒 CONST LOCKED" : "UNLOCKED"}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}

// Input Stream (std::cin >> x)
export function CppInput3D({ phase = 0 }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Keyboard Input Stream Source */}
      <group position={[-2.4, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.4, 0.8]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1.5} />
        </mesh>
        <Html position={[0, 0, 0.45]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>USER KEYBOARD</div>
            <div style={{ fontSize: "16px", fontWeight: 900, color: "#ddd6fe" }}>std::cin</div>
          </div>
        </Html>
      </group>

      {/* Extraction Operator >> Pipe */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 2.0, 20, 1, true]} />
          <meshPhysicalMaterial color="#38bdf8" transmission={0.7} transparent opacity={0.5} />
        </mesh>
        <Html position={[0, 0.45, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "#38bdf8" }}>&gt;&gt;</div>
        </Html>
      </group>

      {/* Target Variable Box */}
      <group position={[2.4, phase >= 1 ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.4, 0.8]} />
          <meshStandardMaterial
            color={phase >= 1 ? "#10b981" : "#0f172a"}
            emissive={phase >= 1 ? "#10b981" : "#000000"}
            emissiveIntensity={phase >= 1 ? 1.8 : 0.2}
          />
        </mesh>
        <Html position={[0, 0, 0.45]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>VARIABLE</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: phase >= 1 ? "#34d399" : "#64748b" }}>
              {phase >= 1 ? "42" : "..."}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 3. LOGIC GATES STAGES                                  */
/* ====================================================== */

// if / else Conditional Branch Fork
export function CppLogicIf3D({ phase = 0 }) {
  const isTrue = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Central Condition Evaluator */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <octahedronGeometry args={[0.8, 0]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2.0} />
        </mesh>
        <Html position={[0, 0, 0.7]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>
            if (score &gt; 100)
          </div>
        </Html>
      </group>

      {/* TRUE Branch (Green) */}
      <group position={[1.8, 1.1, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.0, 0.5]} />
          <meshStandardMaterial
            color={isTrue ? "#10b981" : "#0f172a"}
            emissive={isTrue ? "#10b981" : "#000000"}
            emissiveIntensity={isTrue ? 2.2 : 0.2}
          />
        </mesh>
        <Html position={[0, 0, 0.3]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#fff", textAlign: "center" }}>
            TRUE BRANCH<br />std::cout &lt;&lt; "Winner!";
          </div>
        </Html>
      </group>

      {/* FALSE Branch (Amber) */}
      <group position={[1.8, -1.1, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.0, 0.5]} />
          <meshStandardMaterial
            color={!isTrue ? "#f59e0b" : "#0f172a"}
            emissive={!isTrue ? "#f59e0b" : "#000000"}
            emissiveIntensity={!isTrue ? 1.8 : 0.2}
          />
        </mesh>
        <Html position={[0, 0, 0.3]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#fff", textAlign: "center" }}>
            FALSE (else)<br />std::cout &lt;&lt; "Try Again";
          </div>
        </Html>
      </group>
    </group>
  );
}

// Loop Ring (for / while)
export function CppLoops3D({ phase = 0 }) {
  const loopRingRef = useRef();

  useFrame((_, delta) => {
    if (loopRingRef.current) {
      loopRingRef.current.rotation.z += delta * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Rotating Loop Track */}
      <group ref={loopRingRef}>
        <mesh>
          <torusGeometry args={[1.8, 0.08, 16, 64]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.0} />
        </mesh>
        {/* Orbital Step Beads */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2.5} />
          </mesh>
        ))}
      </group>

      {/* Central Loop HUD */}
      <Html position={[0, 0, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ textAlign: "center", userSelect: "none" }}>
          <div style={{ fontSize: "12px", fontWeight: 900, color: "#67e8f9" }}>for (int i=0; i&lt;5; i++)</div>
          <div style={{ fontSize: "16px", fontWeight: 900, color: "#fff", marginTop: "4px" }}>
            Cycle: {phase + 1} / 5
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* 4. FUNCTION ENGINE STAGES                              */
/* ====================================================== */

// Pass by Value vs Pass by Reference (&)
export function CppFunctions3D({ phase = 0, isRef = false }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Caller Variable */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 1.6, 1.0]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1.8} />
        </mesh>
        <Html position={[0, 0, 0.55]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#93c5fd" }}>CALLER SCOPE</div>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#fff" }}>int hp = 100;</div>
            <div style={{ fontSize: "8px", color: "#cbd5e1" }}>Addr: 0x7FFF10</div>
          </div>
        </Html>
      </group>

      {/* Connection Conduit: Copy or Alias Pointer */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 2.2, 16]} />
          <meshBasicMaterial color={isRef ? "#10b981" : "#f59e0b"} transparent opacity={0.8} />
        </mesh>
        <Html position={[0, 0.45, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 900,
              color: isRef ? "#34d399" : "#fbbf24",
              background: "rgba(0,0,0,0.8)",
              padding: "2px 8px",
              borderRadius: "4px",
              whiteSpace: "nowrap",
            }}
          >
            {isRef ? "PASS BY REF (&hp) · ALIAS" : "PASS BY VALUE · COPY"}
          </div>
        </Html>
      </group>

      {/* Callee Function Scope */}
      <group position={[2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.6, 1.6, 1.0]} />
          <meshStandardMaterial
            color={isRef ? "#10b981" : "#f59e0b"}
            emissive={isRef ? "#10b981" : "#f59e0b"}
            emissiveIntensity={1.8}
          />
        </mesh>
        <Html position={[0, 0, 0.55]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#fff" }}>FUNCTION SCOPE</div>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff" }}>
              {isRef ? "int& target" : "int copy"}
            </div>
            <div style={{ fontSize: "8px", color: "#cbd5e1" }}>
              {isRef ? "Shares 0x7FFF10" : "New Addr: 0x7FFF20"}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 5. MEMORY VAULT STAGES (Pointers & Dynamic Memory)     */
/* ====================================================== */

export function CppPointers3D({ phase = 0 }) {
  const isDereferenced = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Pointer Variable (Holds address 0x7FFF00) */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 1.4, 24]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2.0} roughness={0.2} />
        </mesh>
        <Html position={[0, 0, 0.85]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#c4b5fd" }}>POINTER int* ptr</div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#fff" }}>0x7FFF00</div>
          </div>
        </Html>
      </group>

      {/* Targeting Laser Beam */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 16]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} />
        </mesh>
        <Html position={[0, 0.45, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, color: "#c4b5fd" }}>
            {isDereferenced ? "DEREFERENCE *ptr" : "POINTS TO"}
          </div>
        </Html>
      </group>

      {/* 2. Target Variable (Memory Address 0x7FFF00) */}
      <group position={[2.2, isDereferenced ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 1.1]} />
          <meshStandardMaterial
            color={isDereferenced ? "#10b981" : "#0284c7"}
            emissive={isDereferenced ? "#10b981" : "#0284c7"}
            emissiveIntensity={isDereferenced ? 2.5 : 1.2}
          />
        </mesh>
        <Html position={[0, 0, 0.6]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "9px", color: "#93c5fd" }}>ADDR: 0x7FFF00</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#fff" }}>
              {isDereferenced ? "val = 99" : "val = 42"}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// Stack vs Heap Dynamic Memory
export function CppHeapStack3D({ phase = 0 }) {
  const isHeap = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Fast Automatic Stack */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, 2.2, 24, 1, true]} />
          <meshPhysicalMaterial color="#3b82f6" transmission={0.7} transparent opacity={0.4} />
        </mesh>
        <Html position={[0, 0, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#60a5fa" }}>CALL STACK</div>
            <div style={{ fontSize: "9px", color: "#cbd5e1" }}>Fast · Auto-Cleaned</div>
          </div>
        </Html>
      </group>

      {/* Dynamic Heap Memory */}
      <group position={[2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[2.0, 2.0, 1.4]} />
          <meshStandardMaterial
            color={isHeap ? "#10b981" : "#1e293b"}
            emissive={isHeap ? "#10b981" : "#0f172a"}
            emissiveIntensity={isHeap ? 2.0 : 0.2}
            wireframe
          />
        </mesh>
        <Html position={[0, 0, 0.75]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: isHeap ? "#34d399" : "#94a3b8" }}>
              HEAP MEMORY
            </div>
            <div style={{ fontSize: "9px", color: "#cbd5e1" }}>
              {isHeap ? "new int(100) · Explicit delete" : "Unallocated"}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 6. OBJECT FORGE STAGES (OOP Classes & Objects)         */
/* ====================================================== */

export function CppClasses3D({ phase = 0 }) {
  return (
    <group position={[0, 0, 0]}>
      {/* 3D Class Blueprint */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 2.0, 0.2]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.5} wireframe />
        </mesh>
        <Html position={[0, 0, 0.15]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#38bdf8" }}>CLASS BLUEPRINT</div>
            <div style={{ fontSize: "8px", fontFamily: "monospace", color: "#e2e8f0", marginTop: "4px" }}>
              class Player &#123;<br />
              &nbsp;&nbsp;public:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;int score;<br />
              &nbsp;&nbsp;&nbsp;&nbsp;void play();<br />
              &#125;;
            </div>
          </div>
        </Html>
      </group>

      {/* Forging Plasma Beam */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>

      {/* Forged Instance Object in Memory */}
      <group position={[2.2, phase >= 1 ? 0.35 : 0, 0]}>
        <mesh>
          <octahedronGeometry args={[0.9, 0]} />
          <meshPhysicalMaterial
            color={phase >= 1 ? "#10b981" : "#0f172a"}
            emissive={phase >= 1 ? "#10b981" : "#000000"}
            emissiveIntensity={phase >= 1 ? 2.2 : 0.2}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
        <Html position={[0, 0, 0.7]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 900, color: "#fff" }}>OBJECT INSTANCE</div>
            <div style={{ fontSize: "9px", color: "#a7f3d0" }}>Player p1;</div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 7. STL COMMAND STAGES (Vectors, Maps, Iterators)       */
/* ====================================================== */

export function CppStlVector3D({ phase = 0 }) {
  const capacity = 4;
  const elements = [10, 20, 30].slice(0, Math.min(phase + 1, 3));

  return (
    <group position={[0, 0, 0]}>
      {/* Vector Memory Track */}
      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[6.5, 0.1, 1.4]} />
        <meshStandardMaterial color="#0b1329" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Vector Slots */}
      {[0, 1, 2, 3].map((slotIdx) => {
        const val = elements[slotIdx];
        const hasVal = val !== undefined;
        const posX = (slotIdx - 1.5) * 1.4;

        return (
          <group key={slotIdx} position={[posX, hasVal ? 0.2 : 0, 0]}>
            <mesh>
              <boxGeometry args={[1.1, 0.9, 0.9]} />
              <meshStandardMaterial
                color={hasVal ? "#10b981" : "#0f172a"}
                emissive={hasVal ? "#10b981" : "#000000"}
                emissiveIntensity={hasVal ? 1.8 : 0.1}
                wireframe={!hasVal}
              />
            </mesh>
            <Html position={[0, 0, 0.5]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff" }}>
                  {hasVal ? val : `[${slotIdx}]`}
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      <Html position={[0, 1.4, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, color: "#34d399", background: "rgba(0,0,0,0.7)", padding: "4px 10px", borderRadius: "6px" }}>
          std::vector&lt;int&gt; · Size: {elements.length} | Capacity: {capacity}
        </div>
      </Html>
    </group>
  );
}

// STL Map / Tree associative key-value nodes
export function CppStlMap3D({ phase = 0 }) {
  const nodes = [
    { key: "\"alpha\"", val: "100", pos: [0, 1.0, 0], color: "#06b6d4" },
    { key: "\"beta\"", val: "200", pos: [-1.8, -0.6, 0], color: "#3b82f6" },
    { key: "\"gamma\"", val: "300", pos: [1.8, -0.6, 0], color: "#10b981" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Branch Conduits */}
      <mesh position={[-0.9, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.9, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 2.2, 16]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
      </mesh>

      {nodes.map((n, idx) => {
        const isCurrent = phase === idx;
        return (
          <group key={idx} position={[n.pos[0], n.pos[1] + (isCurrent ? 0.25 : 0), n.pos[2]]}>
            <mesh>
              <boxGeometry args={[1.5, 1.1, 0.8]} />
              <meshStandardMaterial
                color={n.color}
                emissive={n.color}
                emissiveIntensity={isCurrent ? 2.2 : 0.6}
                roughness={0.15}
                metalness={0.8}
              />
            </mesh>
            <Html position={[0, 0, 0.45]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>Key: {n.key}</div>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#fff", marginTop: "2px" }}>Value: {n.val}</div>
              </div>
            </Html>
          </group>
        );
      })}

      <Html position={[0, 1.9, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, color: "#67e8f9", background: "rgba(0,0,0,0.75)", padding: "4px 10px", borderRadius: "6px" }}>
          std::map&lt;string, int&gt; · Balanced Red-Black Search Tree O(log N)
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* 8. ARRAY MATRIX STAGES                                 */
/* ====================================================== */

export function CppArrayMatrix3D({ phase = 0, is2D = false }) {
  const items = [10, 25, 42, 68, 99];
  const activeIdx = phase % 5;

  return (
    <group position={[0, 0, 0]}>
      {/* Contiguous Memory Baseline */}
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[6.8, 0.1, 1.4]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {items.map((val, idx) => {
        const posX = (idx - 2) * 1.3;
        const isCurrent = idx === activeIdx;
        const hexAddr = `0x${(1000 + idx * 4).toString(16).toUpperCase()}`;

        return (
          <group key={idx} position={[posX, isCurrent ? 0.35 : 0, 0]}>
            <mesh>
              <boxGeometry args={[1.1, 1.1, 1.1]} />
              <meshPhysicalMaterial
                color={isCurrent ? "#06b6d4" : "#1e293b"}
                emissive={isCurrent ? "#06b6d4" : "#0f172a"}
                emissiveIntensity={isCurrent ? 2.2 : 0.25}
                roughness={0.15}
                metalness={0.8}
                transparent
                opacity={0.9}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[1.14, 1.14, 1.14]} />
              <meshBasicMaterial color="#ffffff" wireframe transparent opacity={isCurrent ? 0.8 : 0.15} />
            </mesh>
            <Html position={[0, 0, 0.6]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "9px", fontWeight: 800, color: isCurrent ? "#a5f3fc" : "#94a3b8" }}>
                  [{idx}]
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#fff", margin: "2px 0" }}>
                  {val}
                </div>
                <div style={{ fontSize: "7px", fontFamily: "monospace", color: "#94a3b8" }}>
                  {hexAddr}
                </div>
              </div>
            </Html>
          </group>
        );
      })}

      <Html position={[0, 1.35, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, color: "#38bdf8", background: "rgba(0,0,0,0.8)", padding: "4px 12px", borderRadius: "6px", border: "1px solid rgba(56,189,248,0.3)" }}>
          int arr[5] · Contiguous Memory · O(1) Index Access: base + (i * 4 bytes)
        </div>
      </Html>
    </group>
  );
}

/* ====================================================== */
/* 9. LOGIC SWITCH JUMP TABLE STAGE                       */
/* ====================================================== */

export function CppLogicSwitch3D({ phase = 0 }) {
  const selectedCase = phase % 3;
  const cases = [
    { label: "case 1: North", color: "#10b981", pos: [2.0, 1.0, 0] },
    { label: "case 2: East", color: "#3b82f6", pos: [2.0, 0, 0] },
    { label: "default: Rest", color: "#f59e0b", pos: [2.0, -1.0, 0] },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Central Switch Hub */}
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={2.0} />
        </mesh>
        <Html position={[0, 0, 0.75]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#c4b5fd" }}>JUMP TABLE</div>
            <div style={{ fontSize: "13px", fontWeight: 900, color: "#fff" }}>switch(val)</div>
          </div>
        </Html>
      </group>

      {/* Laser Routing Conduits to Cases */}
      {cases.map((c, idx) => {
        const isSelected = idx === selectedCase;
        return (
          <group key={idx}>
            <mesh position={[0, c.pos[1] * 0.5, 0]}>
              <boxGeometry args={[1.8, 0.04, 0.04]} />
              <meshBasicMaterial color={isSelected ? c.color : "#334155"} transparent opacity={isSelected ? 0.9 : 0.3} />
            </mesh>
            <group position={[c.pos[0], c.pos[1], c.pos[2]]}>
              <mesh>
                <boxGeometry args={[1.6, 0.7, 0.4]} />
                <meshStandardMaterial
                  color={isSelected ? c.color : "#0f172a"}
                  emissive={isSelected ? c.color : "#000000"}
                  emissiveIntensity={isSelected ? 2.0 : 0.2}
                />
              </mesh>
              <Html position={[0, 0, 0.25]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>
                  {c.label} {isSelected ? "✓" : ""}
                </div>
              </Html>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* 10. OBJECT INHERITANCE HIERARCHY STAGE                 */
/* ====================================================== */

export function CppInheritance3D({ phase = 0 }) {
  const isDerivedActive = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      {/* Base Class (Parent) */}
      <group position={[0, 1.2, 0]}>
        <mesh>
          <boxGeometry args={[2.8, 1.2, 0.5]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.6} />
        </mesh>
        <Html position={[0, 0, 0.3]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff" }}>BASE CLASS: Entity</div>
            <div style={{ fontSize: "9px", color: "#bae6fd" }}>int id; int x, y; · void move()</div>
          </div>
        </Html>
      </group>

      {/* Inheritance Plasma Conduit */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.0, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
      </mesh>
      <Html position={[0, 0.1, 0.2]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "9px", fontWeight: 900, color: "#38bdf8", background: "rgba(0,0,0,0.7)", padding: "2px 6px", borderRadius: "4px" }}>
          public inheritance
        </div>
      </Html>

      {/* Derived Class (Child) */}
      <group position={[0, -1.0, 0]}>
        <mesh>
          <boxGeometry args={[3.2, 1.4, 0.5]} />
          <meshStandardMaterial
            color={isDerivedActive ? "#10b981" : "#1e293b"}
            emissive={isDerivedActive ? "#10b981" : "#0f172a"}
            emissiveIntensity={isDerivedActive ? 2.0 : 0.3}
          />
        </mesh>
        <Html position={[0, 0, 0.3]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff" }}>DERIVED CLASS: Player</div>
            <div style={{ fontSize: "9px", color: "#a7f3d0" }}>
              Inherits Entity + int score; void attack();
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

/* ====================================================== */
/* 11. FINAL ARCHITECTURE CYBER SYSTEM STAGE              */
/* ====================================================== */

export function CppFinalSystem3D({ phase = 0 }) {
  const coreRef = useRef();

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
    }
  });

  const modules = [
    { name: "CPU CORE", pos: [-2.2, 1.1, 0], color: "#06b6d4" },
    { name: "MEMORY VAULT", pos: [2.2, 1.1, 0], color: "#8b5cf6" },
    { name: "STL ENGINE", pos: [-2.2, -1.1, 0], color: "#10b981" },
    { name: "LOGIC GATES", pos: [2.2, -1.1, 0], color: "#f59e0b" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* Central Cyber Kernel */}
      <group ref={coreRef} position={[0, 0, 0]}>
        <mesh>
          <dodecahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2.5} roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.5, 0.03, 16, 48]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      </group>

      <Html position={[0, 0, 0.1]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <div style={{ fontSize: "11px", fontWeight: 900, color: "#0284c7", background: "rgba(255,255,255,0.9)", padding: "2px 8px", borderRadius: "4px" }}>
          C++ CORE KERNEL
        </div>
      </Html>

      {/* Subsystems */}
      {modules.map((m, idx) => {
        const isCurrent = phase === idx;
        return (
          <group key={idx} position={[m.pos[0], m.pos[1], m.pos[2]]}>
            <mesh>
              <boxGeometry args={[1.6, 0.9, 0.5]} />
              <meshStandardMaterial
                color={m.color}
                emissive={m.color}
                emissiveIntensity={isCurrent ? 2.5 : 0.8}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <Html position={[0, 0, 0.3]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#fff" }}>{m.name}</div>
                <div style={{ fontSize: "8px", color: "#e2e8f0" }}>ONLINE ✓</div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ====================================================== */
/* MAIN ROUTER DISPATCHER                                 */
/* ====================================================== */
export default function Cpp3DStage({ type, phase = 0 }) {
  // Normalize type
  const t = type || "cpp-variables";

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[10, 14, 10]} intensity={1.4} color="#ffffff" />
      <directionalLight position={[-10, 8, -5]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 4, 3]} intensity={2.2} color="#ffffff" distance={15} />

      {/* Futuristic Cyber Particles */}
      <Sparkles count={45} scale={[12, 6, 8]} size={2.5} speed={0.4} color="#06b6d4" opacity={0.6} />

      {/* Obsidian Reflection Floor */}
      <mesh position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[26, 18]} />
        <meshStandardMaterial color="#02040b" roughness={0.25} metalness={0.92} />
      </mesh>

      {/* 1. Syntax Core */}
      {(t === "cpp-intro" || t === "cpp-syntax-welcome") && <CppCompilerPipeline3D phase={phase} />}
      {(t === "cpp-program-flow" || t === "cpp-syntax-first-program") && <CppProgramFlow3DStage phase={phase} />}
      {(t === "cpp-main-function" || t === "cpp-syntax-main") && <CppMainFunction3DStage phase={phase} />}
      {(t === "cpp-output" || t === "cpp-syntax-cout" || t === "cpp-syntax-output") && <CppOutput3DStage phase={phase} />}
      {(t === "cpp-comments" || t === "cpp-syntax-comments") && <CppComments3DStage phase={phase} />}
      {(t === "cpp-semicolon" || t === "cpp-syntax-statements" || t === "cpp-syntax-semicolon") && <CppSemicolon3DStage phase={phase} />}

      {/* 2. Data Circuits */}
      {(t === "cpp-data-variables" || t === "cpp-variables") && <CppVariables3D phase={phase} />}
      {(t === "cpp-data-numeric-types" || t === "cpp-numeric-types") && <CppNumericTypes3D phase={phase} />}
      {t === "cpp-data-constants" && <CppConstants3D phase={phase} />}
      {t === "cpp-data-input" && <CppInput3D phase={phase} />}
      {(t === "cpp-data-text" || t === "cpp-data-conversion" || t === "cpp-data-operators") && (
        <CppVariables3D phase={phase} />
      )}

      {/* 3. Logic Gates */}
      {(t === "cpp-logic-if" || t === "cpp-logic-if-else" || t === "cpp-logic-else" || t === "cpp-logic-else-if" || t === "cpp-logic-comparisons" || t === "cpp-logic-booleans") && (
        <CppLogicIf3D phase={phase} />
      )}
      {(t === "cpp-logic-switch" || t === "cpp-logic-operators") && <CppLogicSwitch3D phase={phase} />}
      {(t === "cpp-logic-loops" || t === "cpp-logic-while" || t === "cpp-logic-for" || t === "cpp-logic-break-continue") && (
        <CppLoops3D phase={phase} />
      )}

      {/* 4. Function Engine */}
      {(t === "cpp-functions-intro" || t === "cpp-functions-create" || t === "cpp-fn-declaration" || t === "cpp-functions-parameters" || t === "cpp-functions-multiple-parameters" || t === "cpp-fn-parameters" || t === "cpp-functions-return-values" || t === "cpp-fn-return" || t === "cpp-functions-scope" || t === "cpp-fn-scope") && (
        <CppFunctions3D phase={phase} isRef={false} />
      )}
      {(t === "cpp-functions-overloading" || t === "cpp-fn-pass-by-ref" || t === "cpp-fn-pass-by-value") && (
        <CppFunctions3D phase={phase} isRef={t === "cpp-fn-pass-by-ref"} />
      )}

      {/* 5. Array Matrix */}
      {(t.startsWith("cpp-arrays") || t.startsWith("cpp-arr")) && <CppArrayMatrix3D phase={phase} />}

      {/* 6. Memory Vault (Pointers & Heap/Stack) */}
      {(t === "cpp-memory-pointers" || t === "cpp-mem-pointers" || t === "cpp-memory-dereference" || t === "cpp-mem-dereference" || t === "cpp-memory-references" || t === "cpp-mem-references" || t === "cpp-memory-nullptr" || t === "cpp-mem-nullptr") && (
        <CppPointers3D phase={phase} />
      )}
      {(t === "cpp-memory-addresses" || t === "cpp-mem-addresses" || t === "cpp-memory-stack-heap" || t === "cpp-mem-heap-stack" || t === "cpp-memory-dynamic" || t === "cpp-memory-ownership") && (
        <CppHeapStack3D phase={phase} />
      )}

      {/* 7. Object Forge */}
      {(t === "cpp-oop-inheritance" || t === "cpp-oop-polymorphism") && <CppInheritance3D phase={phase} />}
      {(t.startsWith("cpp-oop") || t.includes("object") || t.includes("class")) && !t.includes("inheritance") && !t.includes("polymorphism") && (
        <CppClasses3D phase={phase} />
      )}

      {/* 8. STL Command */}
      {(t === "cpp-stl-map" || t === "cpp-stl-set") && <CppStlMap3D phase={phase} />}
      {(t.startsWith("cpp-stl") || t.includes("vector")) && t !== "cpp-stl-map" && t !== "cpp-stl-set" && (
        <CppStlVector3D phase={phase} />
      )}

      {/* 9. Final System */}
      {(t.startsWith("cpp-final")) && <CppFinalSystem3D phase={phase} />}
    </>
  );
}

function CppProgramFlow3DStage({ phase = 0 }) {
  const steps = [
    { title: "#include <iostream>", sub: "Library Header", pos: [-2.6, 0, 0], color: "#06b6d4" },
    { title: "int main()", sub: "Function Entry", pos: [-0.9, 0, 0], color: "#3b82f6" },
    { title: "std::cout << ...", sub: "Statements", pos: [0.9, 0, 0], color: "#10b981" },
    { title: "return 0;", sub: "Exit Code", pos: [2.6, 0, 0], color: "#8b5cf6" },
  ];

  return (
    <group position={[0, 0, 0]}>
      {[-1.75, 0, 1.75].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 16]} />
          <meshBasicMaterial color={phase > i ? "#34d399" : "#334155"} transparent opacity={0.75} />
        </mesh>
      ))}

      {steps.map((st, idx) => {
        const isCurrent = phase === idx;
        const isPassed = phase > idx;

        return (
          <group key={idx} position={[st.pos[0], isCurrent ? 0.35 : 0, 0]}>
            <mesh>
              <boxGeometry args={[1.35, 1.5, 0.4]} />
              <meshStandardMaterial
                color={isCurrent || isPassed ? st.color : "#0f172a"}
                emissive={isCurrent || isPassed ? st.color : "#000000"}
                emissiveIntensity={isCurrent ? 2.2 : isPassed ? 0.8 : 0.15}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <Html position={[0, 0, 0.24]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
              <div style={{ textAlign: "center", userSelect: "none" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#ffffff", whiteSpace: "nowrap" }}>
                  {st.title}
                </div>
                <div style={{ fontSize: "8px", color: isCurrent ? "#ffffff" : "#94a3b8", marginTop: "4px" }}>
                  {st.sub}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function CppMainFunction3DStage({ phase = 0 }) {
  return (
    <group position={[0, 0, 0]}>
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.8, 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <boxGeometry args={[1.2, 1.2, 0.05]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={phase >= 1 ? 2.5 : 0.6} />
        </mesh>
        <Html position={[0, 0, 0.25]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#fff" }}>CPU CORE</div>
            <div style={{ fontSize: "9px", color: "#93c5fd" }}>EIP: 0x0040100{phase}</div>
          </div>
        </Html>
      </group>

      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
      </mesh>

      <group position={[2.2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[1.1, 1.1, 2.4, 24, 1, true]} />
          <meshPhysicalMaterial color="#8b5cf6" roughness={0.1} transmission={0.8} transparent opacity={0.4} />
        </mesh>
        <group position={[0, phase >= 2 ? -0.3 : -0.7, 0]}>
          <mesh>
            <cylinderGeometry args={[0.9, 0.9, 0.4, 24]} />
            <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={phase >= 2 ? 2.0 : 0.4} />
          </mesh>
          <Html position={[0, 0, 0.92]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>
              main() Stack Frame
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}

function CppOutput3DStage({ phase = 0 }) {
  return (
    <group position={[0, 0, 0]}>
      <group position={[-2.6, phase === 0 ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 0.6]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={phase >= 0 ? 1.8 : 0.3} />
        </mesh>
        <Html position={[0, 0, 0.35]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff" }}>Memory Value</div>
            <div style={{ fontSize: "11px", fontWeight: 900, color: "#e0f2fe" }}>"Hello"</div>
          </div>
        </Html>
      </group>

      <group position={[0, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.18, 2.2, 24, 1, true]} />
          <meshPhysicalMaterial color="#10b981" transmission={0.7} transparent opacity={0.45} />
        </mesh>
        <Html position={[0, 0.5, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "#34d399", whiteSpace: "nowrap" }}>
            std::cout &lt;&lt;
          </div>
        </Html>
      </group>

      <group position={[2.6, phase >= 2 ? 0.35 : 0, 0]}>
        <mesh>
          <boxGeometry args={[1.5, 1.5, 0.2]} />
          <meshStandardMaterial color={phase >= 2 ? "#10b981" : "#0f172a"} emissive={phase >= 2 ? "#10b981" : "#000000"} emissiveIntensity={phase >= 2 ? 1.8 : 0.2} />
        </mesh>
        <Html position={[0, 0, 0.15]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ textAlign: "center", userSelect: "none" }}>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#6ee7b7" }}>CONSOLE</div>
            <div style={{ fontSize: "12px", fontWeight: 900, color: "#fff", marginTop: "6px" }}>
              {phase >= 2 ? "Hello" : "..."}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

function CppComments3DStage({ phase = 0 }) {
  return (
    <group position={[0, 0, 0]}>
      <group position={[-2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 0.4]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={1.4} />
        </mesh>
        <Html position={[0, 0, 0.25]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "9px", fontFamily: "monospace", color: "#fff", textAlign: "center" }}>
            // Dev Note<br />std::cout &lt;&lt; "Ready";
          </div>
        </Html>
      </group>

      <group position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 1.6, 20]} />
          <meshStandardMaterial color={phase >= 1 ? "#f59e0b" : "#334155"} emissive={phase >= 1 ? "#f59e0b" : "#000000"} emissiveIntensity={phase >= 1 ? 2.0 : 0.2} />
        </mesh>
        <Html position={[0, 1.2, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fbbf24", background: "rgba(0,0,0,0.7)", padding: "2px 6px", borderRadius: "4px" }}>
            {phase >= 1 ? "Comment Filtered Out ✓" : "Scanning..."}
          </div>
        </Html>
      </group>

      <group position={[2.2, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 0.4]} />
          <meshStandardMaterial color={phase >= 2 ? "#10b981" : "#0f172a"} emissive={phase >= 2 ? "#10b981" : "#000000"} emissiveIntensity={phase >= 2 ? 1.8 : 0.2} />
        </mesh>
        <Html position={[0, 0, 0.25]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#fff", textAlign: "center" }}>
            {phase >= 2 ? "Ready ✓" : "Pending..."}
          </div>
        </Html>
      </group>
    </group>
  );
}

function CppSemicolon3DStage({ phase = 0 }) {
  const hasError = phase === 0;
  const isFixed = phase >= 1;

  return (
    <group position={[0, 0, 0]}>
      <group position={[-1.8, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 1.3, 0.4]} />
          <meshStandardMaterial color={hasError ? "#e11d48" : "#10b981"} emissive={hasError ? "#e11d48" : "#10b981"} emissiveIntensity={1.8} />
        </mesh>
        <Html position={[0, 0, 0.25]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: "11px", fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>
            std::cout &lt;&lt; "Ready"{isFixed ? ";" : ""}
          </div>
        </Html>
      </group>

      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[1.4, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.55, 24, 24]} />
            <meshStandardMaterial color={isFixed ? "#10b981" : "#f59e0b"} emissive={isFixed ? "#10b981" : "#f59e0b"} emissiveIntensity={2.5} />
          </mesh>
          <Html position={[0, 0, 0.6]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff" }}>;</div>
          </Html>
          <Html position={[0, 1.1, 0]} center distanceFactor={11} style={{ pointerEvents: "none" }}>
            <div style={{ fontSize: "10px", fontWeight: 800, color: isFixed ? "#34d399" : "#fbbf24", background: "rgba(0,0,0,0.8)", padding: "3px 8px", borderRadius: "6px" }}>
              {isFixed ? "TERMINATOR LOCKED ✓" : "MISSING SEMICOLON ;"}
            </div>
          </Html>
        </group>
      </Float>
    </group>
  );
}
