import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Bomb, Flame, FlaskConical, Lightbulb, Loader2, Play, RotateCcw, Scissors, Smartphone, Timer, Trophy } from "lucide-react";
import { runInSandbox } from "../sandbox/runInSandbox";
import { isPhoneLike, MOBILE_TIME_MULTIPLIER, prefersReducedMotion } from "../motion";
import { newSeed } from "../random";
import { userKey } from "../../services/learningHub";
import CodeEditor from "../CodeEditor";
import RewardClaim from "../RewardClaim";
import { BombRenderer, DANGER_SECONDS } from "./bombRenderer";
import { BOMB_SECONDS, checkBomb, formatCall, formatValue, generateBombs } from "./bombEngine";
import styles from "./BombDefuser.module.css";

const progressKey = () => `codeland_game_bomb-defuser_${userKey()}`;

function readCompleted() {
  try {
    return Boolean(JSON.parse(localStorage.getItem(progressKey()))?.completed);
  } catch {
    return false;
  }
}

/** One sandbox run: the student's function on every test case. */
const runJob = (job) => runInSandbox(job, { timeoutMs: 2000 });

const clockText = (ms) => {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export default function BombDefuserGame() {
  const canvasRef = useRef(null);
  const arenaRef = useRef(null);
  const rendererRef = useRef(null);
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const multiplier = useMemo(() => (isPhoneLike() ? MOBILE_TIME_MULTIPLIER : 1), []);

  const [seed, setSeed] = useState(newSeed);
  const bombs = useMemo(() => generateBombs(seed), [seed]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("intro"); // intro | briefing | ticking | checking | defusing | exploded | complete
  const [code, setCode] = useState(() => bombs[0].starter);
  const [feedback, setFeedback] = useState(null);
  const [msLeft, setMsLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(readCompleted);
  const [claimProof, setClaimProof] = useState(null);
  // { seed, code } of each defused bomb, re-checked by the server. Each bomb keeps its own seed
  // because Retry gives the current bomb new values.
  const proofsRef = useRef([]);

  // The renderer calls back from its animation loop, so it reads the latest phase through a ref.
  const live = useRef({});
  useLayoutEffect(() => {
    live.current = { phase };
  }, [phase]);

  const bomb = bombs[index];
  const durationMs = (b) => b.seconds * multiplier * 1000;

  const brief = useCallback(
    (i, list) => {
      const next = list[i];
      rendererRef.current?.show(next.seconds * multiplier * 1000);
      setMsLeft(next.seconds * multiplier * 1000);
      setIndex(i);
      setCode(next.starter);
      setShowHint(false);
      setPhase("briefing");
    },
    [multiplier],
  );

  const shake = useCallback(() => {
    if (reducedMotion || !arenaRef.current) return;
    gsap.fromTo(
      arenaRef.current,
      { x: 0, y: 0, rotation: 0 },
      {
        x: "random(-26, 26)",
        y: "random(-20, 20)",
        rotation: "random(-1.5, 1.5)",
        duration: 0.045,
        repeat: 17,
        yoyo: true,
        ease: "none",
        clearProps: "x,y,rotation",
      },
    );
  }, [reducedMotion]);

  const handleTimeout = useCallback(() => {
    shake();
    setFeedback({ ok: false, message: "Time ran out and the bomb exploded." });
    setPhase("exploded");
  }, [shake]);

  const handleTimeoutRef = useRef(handleTimeout);
  useLayoutEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  useEffect(() => {
    const renderer = new BombRenderer(canvasRef.current, {
      reducedMotion,
      onTimeout: () => handleTimeoutRef.current(),
      onTick: (ms) => {
        // Re-render once per displayed second, not every frame.
        const s = Math.ceil(ms / 1000);
        setMsLeft((prev) => (Math.ceil(prev / 1000) === s ? prev : ms));
      },
    });
    rendererRef.current = renderer;
    renderer.show(BOMB_SECONDS[0] * multiplier * 1000);
    const observer = new ResizeObserver(() => renderer.resize());
    observer.observe(canvasRef.current);
    return () => {
      observer.disconnect();
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [reducedMotion, multiplier]);

  const start = () => {
    setFeedback(null);
    setClaimProof(null);
    proofsRef.current = [];
    if (phase === "complete") {
      const fresh = newSeed();
      setSeed(fresh);
      brief(0, generateBombs(fresh));
      return;
    }
    brief(0, bombs);
  };

  /** After an explosion: the same bomb number again, with new values and the starting code. */
  const retry = () => {
    const fresh = newSeed();
    const list = generateBombs(fresh);
    setSeed(fresh);
    setFeedback(null);
    brief(index, list);
  };

  const lightFuse = () => {
    rendererRef.current?.arm(durationMs(bomb));
    setFeedback(null);
    setPhase("ticking");
  };

  const defuse = async () => {
    if (phase !== "ticking") return;
    setPhase("checking");
    const verdict = await checkBomb(bomb, code, runJob);
    // The bomb may have exploded while the code was being checked.
    if (live.current.phase !== "checking") return;
    setFeedback(verdict);
    if (!verdict.ok) {
      setPhase("ticking");
      return;
    }
    proofsRef.current[index] = { seed, code };
    setPhase("defusing");
    await rendererRef.current?.defuse();
    if (live.current.phase !== "defusing") return;
    if (index + 1 < bombs.length) {
      brief(index + 1, bombs);
      return;
    }
    setPhase("complete");
    setCompletedBefore(true);
    setClaimProof({ bombs: [...proofsRef.current] });
    try {
      localStorage.setItem(progressKey(), JSON.stringify({ completed: true }));
    } catch {
      // Progress is also recorded by the server once rewards are connected.
    }
  };

  const timed = ["ticking", "checking", "defusing"].includes(phase);
  const danger = timed && phase !== "defusing" && msLeft / 1000 <= DANGER_SECONDS;
  const editable = phase === "ticking" || phase === "checking";

  return (
    <div className={styles.game}>
      <section className={styles.arena} ref={arenaRef} aria-label="Bomb">
        <canvas ref={canvasRef} className={styles.canvas} />

        <div className={styles.hud}>
          <span>
            <Bomb size={14} /> Bomb {index + 1} / {bombs.length}
          </span>
          {phase !== "intro" && phase !== "complete" && (
            <span className={danger ? styles.timerDanger : phase === "defusing" ? styles.timerSafe : ""} aria-label="Time left">
              <Timer size={14} /> {clockText(msLeft)}
            </span>
          )}
        </div>

        {phase === "intro" && (
          <div className={styles.overlay}>
            <h2>Defuse the Bomb</h2>
            <p>
              Three bombs, three timers. Each bomb opens only when you write a JavaScript function called{" "}
              <code>defuse</code> that gives the right answer, for the example and for hidden tests too.
            </p>
            <p className={styles.small}>Read the task first: the timer starts only when you light the fuse.</p>
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

        {phase === "briefing" && (
          <div className={`${styles.overlay} ${styles.overlaySoft}`}>
            {index > 0 && feedback?.ok && <p className={styles.defusedNote}>Bomb {index} defused!</p>}
            <h2>
              Bomb {bomb.n}: {bomb.title}
            </h2>
            <p>{bomb.prompt}</p>
            <p className={styles.small}>
              <Timer size={13} /> You will have {Math.round(bomb.seconds * multiplier)} seconds.
            </p>
            <button type="button" className={styles.danger} onClick={lightFuse}>
              <Flame size={16} /> Light the fuse
            </button>
          </div>
        )}

        {phase === "exploded" && (
          <div className={`${styles.overlay} ${styles.overlayLate}`} role="alertdialog" aria-label="The bomb exploded">
            <h2>BOOM!</h2>
            <p>The timer reached 00:00. Try bomb {bomb.n} again with new values.</p>
            <button type="button" className={styles.primary} onClick={retry}>
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        )}

        {phase === "complete" && (
          <div className={`${styles.overlay} ${styles.overlayWin}`}>
            <Trophy size={34} />
            <h2>All three bombs defused!</h2>
            <p>Every function passed its hidden tests in time.</p>
            {claimProof && <RewardClaim gameId="bomb-defuser" proof={claimProof} />}
            <button type="button" className={styles.primary} onClick={start}>
              <RotateCcw size={16} /> Play new bombs
            </button>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.taskCard}>
          <span className={styles.taskNumber}>
            Bomb {bomb.n} · {bomb.title}
          </span>
          <p className={styles.prompt}>{bomb.prompt}</p>
          <p className={styles.example}>
            <FlaskConical size={14} />
            <span>
              Example: <code>{formatCall(bomb.example.args)}</code> → <code>{formatValue(bomb.example.expected)}</code>
            </span>
          </p>
          <p className={styles.small}>+ {bomb.hidden.length} hidden tests with other values.</p>
        </div>

        <div className={styles.editor}>
          <CodeEditor value={code} onChange={setCode} label="Defuse code" readOnly={!editable} />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.defuseButton} onClick={defuse} disabled={phase !== "ticking"}>
            {phase === "checking" ? <Loader2 size={16} className={styles.spin} /> : <Scissors size={16} />}
            {phase === "checking" ? "Testing…" : "Defuse"}
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => setShowHint((v) => !v)}>
            <Lightbulb size={15} /> {showHint ? "Hide hint" : "Hint"}
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => setCode(bomb.starter)}
            disabled={!editable}
            title="Reset the code for this bomb"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {showHint && <p className={styles.hint}>{bomb.hint}</p>}

        {feedback && phase !== "briefing" && (
          <p className={`${styles.feedback} ${feedback.ok ? styles.feedbackOk : styles.feedbackBad}`} role="status">
            {feedback.message}
          </p>
        )}
      </section>
    </div>
  );
}

