import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  FastForward,
  Infinity as InfinityIcon,
  Lightbulb,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Shuffle,
  Trophy,
  XCircle,
} from "lucide-react";
import { runInSandbox } from "../sandbox/runInSandbox";
import CodeEditor from "../CodeEditor";
import RewardClaim from "../RewardClaim";
import { prefersReducedMotion } from "../motion";
import { userKey } from "../../services/learningHub";
import { buildMazeJob, generateMaze, MAZE_STAGES, newSeed, STAGE_HINTS, STARTER_CODE } from "./mazeEngine";
import styles from "./RobotMaze.module.css";

const MazeScene = lazy(() => import("./MazeScene"));
const EndlessMaze = lazy(() => import("./EndlessMaze"));

const SPEEDS = [1, 2, 4];

const COMMANDS = {
  1: ["bot.moveForward()", "bot.turnLeft()", "bot.turnRight()"],
  2: ["bot.moveForward()", "bot.turnLeft()", "bot.turnRight()", "bot.isPathClear('front' | 'left' | 'right')", "bot.reachedExit()"],
  3: [
    "bot.moveForward()",
    "bot.turnLeft()",
    "bot.turnRight()",
    "bot.jump()",
    "bot.isPathClear('front' | 'left' | 'right')",
    "bot.isLaserAhead()",
    "bot.reachedExit()",
  ],
};

const OUTCOME_TITLES = {
  exit: "The robot reached the exit!",
  crash: "Crash!",
  zapped: "Zapped by a laser!",
  limit: "The robot got stuck",
  stopped: "Not there yet",
};

const progressKey = () => `codeland_game_robot-maze_${userKey()}`;
const draftKey = (stage) => `codeland_game_robot-maze_code_${userKey()}_${stage}`;

function readProgress() {
  try {
    return { unlockedStage: 1, completed: false, proofs: {}, ...JSON.parse(localStorage.getItem(progressKey())) };
  } catch {
    return { unlockedStage: 1, completed: false, proofs: {} };
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    // Saving progress locally is a convenience; the game still works without it.
  }
}

/** Seeds for one attempt at a stage: the maze on screen plus the hidden ones. */
function freshSeeds(stage) {
  const config = MAZE_STAGES[stage - 1];
  return { shown: newSeed(), hidden: Array.from({ length: config.hiddenMazes }, () => newSeed()) };
}

export default function RobotMazeGame({ game }) {
  const [progress, setProgress] = useState(readProgress);
  const [mode, setMode] = useState("stages"); // stages | endless
  const [stage, setStage] = useState(() => Math.min(readProgress().unlockedStage, 3));
  const [seeds, setSeeds] = useState(() => freshSeeds(Math.min(readProgress().unlockedStage, 3)));
  const [code, setCode] = useState(() => localStorage.getItem(draftKey(stage)) ?? STARTER_CODE[stage]);
  const [phase, setPhase] = useState("idle"); // idle | running | playing | hidden | done
  const [playback, setPlayback] = useState(null);
  const [outcome, setOutcome] = useState(null); // { status, message, error?, hidden?: [{seed, status, message, actions}] }
  const [speed, setSpeed] = useState(1);
  const [skipSignal, setSkipSignal] = useState(0);
  const [shownSeed, setShownSeed] = useState(null); // a hidden maze the student chose to watch
  const [showHint, setShowHint] = useState(false);
  const [claimProof, setClaimProof] = useState(null); // sent to the server after stage 3
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);
  const runCounter = useRef(0); // a new playback key restarts the robot animation

  const config = MAZE_STAGES[stage - 1];
  const maze = useMemo(() => generateMaze(stage, shownSeed ?? seeds.shown), [stage, seeds.shown, shownSeed]);

  useEffect(() => {
    store(draftKey(stage), code);
  }, [stage, code]);

  const switchStage = (next) => {
    if (next > progress.unlockedStage || phase === "running" || phase === "hidden") return;
    setStage(next);
    setSeeds(freshSeeds(next));
    setCode(localStorage.getItem(draftKey(next)) ?? STARTER_CODE[next]);
    setPlayback(null);
    setOutcome(null);
    setShownSeed(null);
    setShowHint(false);
    setPhase("idle");
  };

  const newMaze = () => {
    setSeeds(freshSeeds(stage));
    setPlayback(null);
    setOutcome(null);
    setShownSeed(null);
    setPhase("idle");
  };

  /** entry is the stage's proof: the seeds it passed on and the code, re-checked by the server. */
  const completeStage = useCallback(
    (entry) => {
      const next = {
        unlockedStage: Math.max(progress.unlockedStage, Math.min(stage + 1, 3)),
        completed: progress.completed || stage === 3,
        proofs: { ...progress.proofs, [stage]: entry },
      };
      store(progressKey(), next);
      setProgress(next);
      if (stage === 3) setClaimProof({ stages: [1, 2, 3].map((s) => next.proofs[s]).filter(Boolean) });
    },
    [progress, stage],
  );

  const run = async () => {
    if (phase === "running" || phase === "hidden") return;
    setShownSeed(null);
    setOutcome(null);
    setPlayback(null);
    setClaimProof(null);
    setPhase("running");
    const shownMaze = generateMaze(stage, seeds.shown);
    const res = await runInSandbox(buildMazeJob(shownMaze, code));
    if (!res.ok) {
      setOutcome({ status: "error", message: res.error });
      setPhase("done");
      return;
    }
    setPlayback({ key: (runCounter.current += 1), actions: res.result.actions, status: res.result.status });
    setOutcome({ status: res.result.status, message: res.result.message, pending: true });
    setPhase("playing");
  };

  const handlePlaybackDone = useCallback(
    async (status) => {
      if (phase !== "playing") return;
      if (status !== "exit" || shownSeed !== null) {
        setOutcome((current) => current && { ...current, pending: false });
        setPhase("done");
        return;
      }
      if (config.hiddenMazes === 0) {
        setOutcome((current) => ({ ...current, pending: false, stageComplete: true }));
        completeStage({ stage, seeds: [seeds.shown], code });
        setPhase("done");
        return;
      }
      setPhase("hidden");
      const hidden = await Promise.all(
        seeds.hidden.map(async (seed) => {
          const res = await runInSandbox(buildMazeJob(generateMaze(stage, seed), code));
          return res.ok
            ? { seed, status: res.result.status, message: res.result.message }
            : { seed, status: "error", message: res.error };
        }),
      );
      const allPassed = hidden.every((h) => h.status === "exit");
      setOutcome((current) => ({ ...current, pending: false, hidden, stageComplete: allPassed }));
      if (allPassed) completeStage({ stage, seeds: [seeds.shown, ...seeds.hidden], code });
      setPhase("done");
    },
    [phase, shownSeed, config.hiddenMazes, seeds.shown, seeds.hidden, stage, code, completeStage],
  );

  /** Shows a hidden maze the code failed on, and replays the robot there. */
  const watchHidden = async (seed) => {
    setShownSeed(seed);
    setPhase("running");
    const res = await runInSandbox(buildMazeJob(generateMaze(stage, seed), code));
    if (res.ok) {
      setPlayback({ key: (runCounter.current += 1), actions: res.result.actions, status: res.result.status });
      setPhase("playing");
    } else {
      setPhase("done");
    }
  };

  const busy = phase === "running" || phase === "hidden";
  const status = outcome?.status;
  const success = outcome?.stageComplete;
  // Endless mode opens once the three stages are finished (the server also checks this).
  const endlessOpen = progress.completed || Boolean(game?.completed);

  if (mode === "endless") {
    return (
      <Suspense
        fallback={
          <div className={styles.sceneLoading}>
            <Loader2 size={22} className={styles.spin} /> Loading endless mode…
          </div>
        }
      >
        <EndlessMaze bestLevel={game?.bestLevel ?? 0} reducedMotion={reducedMotion} onBack={() => setMode("stages")} />
      </Suspense>
    );
  }

  return (
    <div className={styles.game}>
      <section className={styles.arena} aria-label="Maze">
        <Suspense
          fallback={
            <div className={styles.sceneLoading}>
              <Loader2 size={22} className={styles.spin} /> Building the maze…
            </div>
          }
        >
          <MazeScene
            maze={maze}
            playback={playback}
            speed={speed}
            skipSignal={skipSignal}
            reducedMotion={reducedMotion}
            onDone={handlePlaybackDone}
          />
        </Suspense>

        <div className={styles.arenaHud}>
          <span>
            Stage {stage} · {config.title}
            {shownSeed !== null && <em> · hidden maze</em>}
          </span>
          <div className={styles.speed} role="group" aria-label="Animation speed">
            {SPEEDS.map((s) => (
              <button key={s} type="button" className={speed === s ? styles.speedActive : ""} onClick={() => setSpeed(s)}>
                {s}×
              </button>
            ))}
            <button type="button" onClick={() => setSkipSignal((n) => n + 1)} disabled={phase !== "playing"} aria-label="Skip animation">
              <FastForward size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <nav className={styles.stages} aria-label="Stages">
          {MAZE_STAGES.map((s) => {
            const locked = s.stage > progress.unlockedStage;
            const done = s.stage < progress.unlockedStage || (s.stage === 3 && progress.completed);
            return (
              <button
                key={s.stage}
                type="button"
                className={`${styles.stageTab} ${stage === s.stage ? styles.stageActive : ""}`}
                onClick={() => switchStage(s.stage)}
                disabled={locked || busy}
                aria-current={stage === s.stage ? "step" : undefined}
              >
                {locked ? <Lock size={13} /> : done ? <CheckCircle2 size={13} /> : <span>{s.stage}</span>}
                {s.title}
              </button>
            );
          })}
          <button
            type="button"
            className={`${styles.stageTab} ${styles.endlessTab}`}
            onClick={() => setMode("endless")}
            disabled={!endlessOpen || busy}
            title={endlessOpen ? "Endless mode" : "Finish the three stages to unlock endless mode"}
          >
            {endlessOpen ? <InfinityIcon size={13} /> : <Lock size={13} />}
            Endless
          </button>
        </nav>

        <div className={styles.goal}>
          <strong>{config.goal}</strong>
          <span>Learn: {config.teaches}</span>
        </div>

        <details className={styles.commands}>
          <summary>Robot commands</summary>
          <ul>
            {COMMANDS[stage].map((c) => (
              <li key={c}>
                <code>{c}</code>
              </li>
            ))}
          </ul>
        </details>

        <div className={styles.editor}>
          <CodeEditor value={code} onChange={setCode} label="Robot code" />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.runButton} onClick={run} disabled={busy}>
            {busy ? <Loader2 size={16} className={styles.spin} /> : <Play size={16} />}
            {phase === "hidden" ? "Testing hidden mazes…" : busy ? "Running…" : "Run"}
          </button>
          <button type="button" className={styles.ghostButton} onClick={newMaze} disabled={busy}>
            <Shuffle size={15} /> New maze
          </button>
          <button type="button" className={styles.ghostButton} onClick={() => setShowHint((v) => !v)}>
            <Lightbulb size={15} /> Hint
          </button>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={() => setCode(STARTER_CODE[stage])}
            disabled={busy}
            title="Reset the code for this stage"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {showHint && <p className={styles.hint}>{STAGE_HINTS[stage]}</p>}

        {outcome && !outcome.pending && (
          <div
            className={`${styles.result} ${success ? styles.resultSuccess : status === "exit" ? styles.resultWarn : styles.resultFail}`}
            role="status"
          >
            <div className={styles.resultTitle}>
              {success ? <Trophy size={18} /> : status === "exit" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <strong>
                {success
                  ? stage === 3
                    ? "You finished Robot Maze!"
                    : `Stage ${stage} complete!`
                  : status === "error"
                    ? "Your code has an error"
                    : OUTCOME_TITLES[status] || "Done"}
              </strong>
            </div>
            <p>{outcome.message}</p>

            {outcome.hidden && (
              <ul className={styles.hiddenList}>
                {outcome.hidden.map((h, i) => (
                  <li key={h.seed} className={h.status === "exit" ? styles.hiddenPass : styles.hiddenFail}>
                    {h.status === "exit" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Hidden maze {i + 1}: {h.status === "exit" ? "solved" : h.message}
                    {h.status !== "exit" && h.status !== "error" && (
                      <button type="button" onClick={() => watchHidden(h.seed)} disabled={busy}>
                        <Eye size={13} /> Watch it
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {success && stage < 3 && (
              <button type="button" className={styles.nextButton} onClick={() => switchStage(stage + 1)}>
                Next stage <ChevronRight size={16} />
              </button>
            )}
            {success && stage === 3 && (
              <p className={styles.finishNote}>All three mazes solved. Try a new maze any time to practise.</p>
            )}
            {success && stage === 3 && claimProof && <RewardClaim gameId="robot-maze" proof={claimProof} />}
          </div>
        )}
      </section>
    </div>
  );
}
