import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Crosshair, Heart, Lightbulb, Loader2, Play, RotateCcw, Smartphone, Timer, Trophy } from "lucide-react";
import { runInSandbox } from "../sandbox/runInSandbox";
import { isPhoneLike, MOBILE_TIME_MULTIPLIER, prefersReducedMotion } from "../motion";
import { newSeed } from "../random";
import { userKey } from "../../services/learningHub";
import RewardClaim from "../RewardClaim";
import { SkyRenderer } from "./skyRenderer";
import { checkTrapAnswer, generateWave, SHIELDS } from "./trapsEngine";
import styles from "./SkyTraps.module.css";

const progressKey = () => `codeland_game_sky-traps_${userKey()}`;

function readCompleted() {
  try {
    return Boolean(JSON.parse(localStorage.getItem(progressKey()))?.completed);
  } catch {
    return false;
  }
}

/** One sandbox run of a trap answer (short timeout: answers are single lines). */
const runJob = (job) => runInSandbox(job, { timeoutMs: 1500 });

/** A JavaScript literal as a student would write it: { id: 27, armed: false } rather than JSON. */
function toLiteral(value) {
  if (Array.isArray(value)) return `[${value.map(toLiteral).join(", ")}]`;
  if (value !== null && typeof value === "object") {
    return `{ ${Object.entries(value).map(([k, v]) => `${k}: ${toLiteral(v)}`).join(", ")} }`;
  }
  return JSON.stringify(value);
}

/** `const traps = [...]` with one object per line, so the swarm is easy to read. */
function formatVariable(name, value) {
  if (Array.isArray(value) && value.length && typeof value[0] === "object") {
    return `const ${name} = [\n${value.map((v) => `  ${toLiteral(v)}`).join(",\n")}\n];`;
  }
  return `const ${name} = ${toLiteral(value)};`;
}

export default function SkyTrapsGame() {
  const canvasRef = useRef(null);
  const arenaRef = useRef(null);
  const inputRef = useRef(null);
  const rendererRef = useRef(null);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const multiplier = useMemo(() => (isPhoneLike() ? MOBILE_TIME_MULTIPLIER : 1), []);

  const [seed, setSeed] = useState(newSeed);
  const wave = useMemo(() => generateWave(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [shields, setShields] = useState(SHIELDS);
  const [phase, setPhase] = useState("intro"); // intro | falling | checking | firing | landed | gameover | complete
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(readCompleted);
  const [claimProof, setClaimProof] = useState(null);
  const answersRef = useRef([]); // the line that destroyed each trap, re-checked by the server

  // The renderer calls back from its animation loop, so it reads the latest values through refs.
  const live = useRef({});
  useLayoutEffect(() => {
    live.current = { index, shields, phase, wave };
  }, [index, shields, phase, wave]);

  const trap = wave[index];

  const dropTrap = useCallback(
    (i, currentWave) => {
      const t = currentWave[i];
      rendererRef.current?.dropTrap(t, t.seconds * multiplier * 1000);
      setIndex(i);
      setPhase("falling");
      setInput("");
      setFeedback(null);
      setShowHint(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    [multiplier],
  );

  const shake = useCallback(() => {
    if (reducedMotion || !arenaRef.current) return;
    gsap.fromTo(
      arenaRef.current,
      { x: 0, y: 0 },
      { x: "random(-16, 16)", y: "random(-12, 12)", duration: 0.05, repeat: 11, yoyo: true, clearProps: "x,y" },
    );
  }, [reducedMotion]);

  const handleLand = useCallback(() => {
    const { shields: current, index: i, wave: w } = live.current;
    const left = current - 1;
    rendererRef.current?.impact(left);
    shake();
    setShields(left);
    setFeedback({ ok: false, message: "The trap hit the base!" });
    if (left <= 0) {
      setPhase("gameover");
      return;
    }
    setPhase("landed");
    setTimeout(() => {
      if (live.current.phase !== "landed") return;
      dropTrap(i, w);
      // Keep explaining what happened while the same trap falls again.
      setFeedback({
        ok: false,
        message: `The trap hit the base! You lost a shield (${left} left). It is falling again, try once more.`,
      });
    }, 1600);
  }, [dropTrap, shake]);

  const handleLandRef = useRef(handleLand);
  useLayoutEffect(() => {
    handleLandRef.current = handleLand;
  }, [handleLand]);

  useEffect(() => {
    const renderer = new SkyRenderer(canvasRef.current, {
      reducedMotion,
      onLand: () => handleLandRef.current(),
      onTick: (ms) => {
        const s = Math.ceil(ms / 1000);
        setSecondsLeft((prev) => (prev === s ? prev : s));
      },
    });
    rendererRef.current = renderer;
    const observer = new ResizeObserver(() => renderer.resize());
    observer.observe(canvasRef.current);
    return () => {
      observer.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [reducedMotion]);

  const start = () => {
    const fresh = phase === "gameover" || phase === "complete" ? newSeed() : seed;
    const freshWave = fresh === seed ? wave : generateWave(fresh);
    setSeed(fresh);
    setClaimProof(null);
    answersRef.current = [];
    setShields(SHIELDS);
    rendererRef.current?.setShields(SHIELDS);
    dropTrap(0, freshWave);
  };

  const fire = async () => {
    if (phase !== "falling" || !input.trim()) return;
    setPhase("checking");
    const verdict = await checkTrapAnswer(trap, input, runJob);
    // The trap may have landed while the answer was being checked.
    if (live.current.phase !== "checking") return;
    if (!verdict.ok) {
      setFeedback(verdict);
      setPhase("falling");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }
    setFeedback(verdict);
    answersRef.current[index] = input;
    setPhase("firing");
    await rendererRef.current?.shoot();
    if (index + 1 < wave.length) {
      dropTrap(index + 1, wave);
    } else {
      setPhase("complete");
      setCompletedBefore(true);
      setClaimProof({ seed, answers: [...answersRef.current] });
      try {
        localStorage.setItem(progressKey(), JSON.stringify({ completed: true }));
      } catch {
        // Progress is also recorded by the server once rewards are connected.
      }
    }
  };

  const playing = ["falling", "checking", "firing", "landed"].includes(phase);

  return (
    <div className={styles.game}>
      <section className={styles.arena} ref={arenaRef} aria-label="Sky">
        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.hud}>
          <span>
            <Crosshair size={14} /> Trap {Math.min(index + 1, wave.length)} / {wave.length}
          </span>
          <span className={styles.hearts} aria-label={`${shields} shields left`}>
            {Array.from({ length: SHIELDS }, (_, i) => (
              <Heart key={i} size={15} className={i < shields ? styles.heartOn : styles.heartOff} />
            ))}
          </span>
          {playing && (
            <span className={secondsLeft <= 8 ? styles.timerDanger : ""}>
              <Timer size={14} /> {secondsLeft}s
            </span>
          )}
        </div>

        {phase === "intro" && (
          <div className={styles.overlay}>
            <h2>Sky Traps</h2>
            <p>
              Five traps will fall from the sky, each one faster than the last. Read what each trap needs, type one line of
              JavaScript and press <kbd>Enter</kbd> to fire before it hits the ground.
            </p>
            <p className={styles.small}>Your base has 3 shields. Lose them all and the wave starts again.</p>
            {multiplier > 1 && (
              <p className={styles.small}>
                <Smartphone size={13} /> Phone mode: you get {multiplier}× more time.
              </p>
            )}
            <button type="button" className={styles.primary} onClick={start}>
              <Play size={16} /> {completedBefore ? "Play again" : "Start"}
            </button>
          </div>
        )}

        {phase === "gameover" && (
          <div className={styles.overlay}>
            <h2>Base destroyed!</h2>
            <p>All three shields are gone. A new wave of traps is ready.</p>
            <button type="button" className={styles.primary} onClick={start}>
              <RotateCcw size={16} /> Try a new wave
            </button>
          </div>
        )}

        {phase === "complete" && (
          <div className={`${styles.overlay} ${styles.overlayWin}`}>
            <Trophy size={34} />
            <h2>You finished Sky Traps!</h2>
            <p>Every trap was destroyed before it landed.</p>
            {claimProof && <RewardClaim gameId="sky-traps" proof={claimProof} />}
            <button type="button" className={styles.primary} onClick={start}>
              <RotateCcw size={16} /> Play a new wave
            </button>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.trapCard}>
          <span className={styles.trapNumber}>
            Trap {trap.n} · {trap.title}
          </span>
          <p className={styles.prompt}>{trap.prompt}</p>
          {Object.keys(trap.context).length > 0 && (
            <pre className={styles.variables}>
              {Object.entries(trap.context)
                .map(([name, value]) => formatVariable(name, value))
                .join("\n")}
            </pre>
          )}
          <p className={styles.tools}>
            You can use: <code>destroy(id)</code> <code>shield.charge(amount)</code>
            {Object.keys(trap.context).map((name) => (
              <code key={name}>{name}</code>
            ))}
          </p>
        </div>

        <form
          className={styles.fireRow}
          onSubmit={(e) => {
            e.preventDefault();
            fire();
          }}
        >
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={phase === "intro" ? "Press Start first" : "Type your line of code…"}
            aria-label="Your line of code"
            disabled={!playing}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit" className={styles.fire} disabled={phase !== "falling" || !input.trim()}>
            {phase === "checking" ? <Loader2 size={16} className={styles.spin} /> : <Crosshair size={16} />}
            Fire
          </button>
        </form>

        {feedback && (
          <p className={`${styles.feedback} ${feedback.ok ? styles.feedbackOk : styles.feedbackBad}`} role="status">
            {feedback.message}
          </p>
        )}

        <button type="button" className={styles.hintButton} onClick={() => setShowHint((v) => !v)}>
          <Lightbulb size={14} /> {showHint ? "Hide hint" : "Hint"}
        </button>
        {showHint && <p className={styles.hint}>{trap.hint}</p>}
      </section>
    </div>
  );
}
