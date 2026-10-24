import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FastForward,
  Heart,
  Infinity as InfinityIcon,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Save,
  Trophy,
  XCircle,
} from "lucide-react";
import { runInSandbox } from "../sandbox/runInSandbox";
import CodeEditor from "../CodeEditor";
import { MAX_ENDLESS_CODES } from "../verify/verifyGame";
import { userKey } from "../../services/learningHub";
import { submitEndlessRun } from "../../services/gamesService";
import {
  buildMazeJob,
  ENDLESS_HINT,
  ENDLESS_INTRO,
  ENDLESS_LIVES,
  ENDLESS_LOOPS_FROM,
  ENDLESS_STARTER,
  endlessLevelConfig,
  generateEndlessMaze,
  newSeed,
} from "./mazeEngine";
import styles from "./RobotMaze.module.css";

const MazeScene = lazy(() => import("./MazeScene"));

const SPEEDS = [1, 2, 4];

const COMMANDS = [
  "bot.moveForward()",
  "bot.turnLeft()",
  "bot.turnRight()",
  "bot.jump()",
  "bot.isPathClear('front' | 'left' | 'right')",
  "bot.isLaserAhead()",
  "bot.reachedExit()",
  "bot.position()  →  { x, y, dir }",
];

const FAIL_TITLES = {
  crash: "Crash!",
  zapped: "Zapped by a laser!",
  limit: "The robot got stuck",
  stopped: "Not there yet",
};

const draftKey = () => `codeland_game_robot-maze_code_${userKey()}_endless`;
const stage3Key = () => `codeland_game_robot-maze_code_${userKey()}_3`;

/** The student's endless draft, or their stage 3 code under the endless instructions. */
function initialCode() {
  try {
    const draft = localStorage.getItem(draftKey());
    if (draft) return draft;
    const stage3 = localStorage.getItem(stage3Key());
    return stage3 ? `${ENDLESS_INTRO}\n${stage3}` : ENDLESS_STARTER;
  } catch {
    return ENDLESS_STARTER;
  }
}

/**
 * The proof the server replays: each distinct program once, and per cleared level its seed and
 * which program cleared it. If a run used too many different programs, only the levels up to
 * that point are sent.
 */
function buildProof(cleared) {
  const codes = [];
  const levels = [];
  for (const entry of cleared) {
    let index = codes.indexOf(entry.code);
    if (index < 0) {
      if (codes.length === MAX_ENDLESS_CODES) break;
      index = codes.push(entry.code) - 1;
    }
    levels.push({ seed: entry.seed, code: index });
  }
  return { codes, levels };
}

/**
 * Endless Robot Maze: level after level of new mazes. A failed level costs one of three lives and
 * brings a new maze of the same level. The number of levels cleared in a run is the score; the
 * server replays a better run before saving it as the record.
 */
export default function EndlessMaze({ bestLevel = 0, reducedMotion, onBack }) {
  const [code, setCodeState] = useState(initialCode);
  const [level, setLevel] = useState(1);
  const [seed, setSeed] = useState(newSeed);
  const [lives, setLives] = useState(ENDLESS_LIVES);
  const [phase, setPhase] = useState("idle"); // idle | running | playing | cleared | done | over
  const [playback, setPlayback] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [speed, setSpeed] = useState(2);
  const [skipSignal, setSkipSignal] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [best, setBest] = useState(bestLevel);
  const [record, setRecord] = useState(null); // { status: checking | saved | kept | refused | error, message }
  const [cleared, setCleared] = useState([]); // { seed, code } of each level cleared in this run
  const runCounter = useRef(0);

  const maze = useMemo(() => generateEndlessMaze(level, seed), [level, seed]);
  const config = endlessLevelConfig(level);

  const setCode = (next) => {
    setCodeState(next);
    try {
      localStorage.setItem(draftKey(), next);
    } catch {
      // The draft is a convenience; the game works without it.
    }
  };

  const saveRecord = useCallback(async (run) => {
    const proof = buildProof(run);
    if (!proof.levels.length) return;
    setRecord({ status: "checking" });
    try {
      const res = await submitEndlessRun(proof);
      if (Number.isFinite(res?.bestLevel)) setBest(res.bestLevel);
      if (!res?.verified) setRecord({ status: res?.bestLevel >= proof.levels.length ? "kept" : "refused", message: res?.message });
      else setRecord({ status: res.saved ? "saved" : "kept", message: res.message });
    } catch (error) {
      setRecord({ status: "error", message: error?.message || "Your record could not be saved." });
    }
  }, []);

  const run = async () => {
    if (phase === "running" || phase === "playing" || phase === "over") return;
    setOutcome(null);
    setPlayback(null);
    setPhase("running");
    const res = await runInSandbox(buildMazeJob(maze, code));
    if (!res.ok) {
      // The program did not start or never ended: fix it, no life is lost.
      setOutcome({ kind: "error", title: "Your code has an error", message: res.error });
      setPhase("done");
      return;
    }
    setPlayback({ key: (runCounter.current += 1), actions: res.result.actions, status: res.result.status, message: res.result.message });
    setPhase("playing");
  };

  const handlePlaybackDone = useCallback(
    (status) => {
      if (phase !== "playing") return;
      if (status === "exit") {
        setCleared((list) => [...list, { seed, code }]);
        setOutcome({ kind: "success", title: `Level ${level} cleared!`, message: level + 1 === ENDLESS_LOOPS_FROM ? "Watch out: from the next level the mazes have loops." : "" });
        setPhase("cleared");
        return;
      }
      const left = lives - 1;
      setLives(left);
      const title = FAIL_TITLES[status] || "The robot did not make it";
      if (left > 0) {
        setOutcome({
          kind: "fail",
          title,
          message: `${playback?.message || ""} You have ${left} ${left === 1 ? "life" : "lives"} left. Here is a new level ${level} maze.`,
        });
        setSeed(newSeed());
        setPhase("done");
        return;
      }
      setOutcome({ kind: "over", title: "Run over", message: `${playback?.message || ""} You cleared ${level - 1} ${level - 1 === 1 ? "level" : "levels"}.` });
      setPhase("over");
      if (cleared.length > best) saveRecord(cleared);
    },
    [phase, seed, code, level, lives, playback, best, cleared, saveRecord],
  );

  const nextLevel = () => {
    setLevel((n) => n + 1);
    setSeed(newSeed());
    setOutcome(null);
    setPlayback(null);
    setPhase("idle");
  };

  const newRun = () => {
    setCleared([]);
    setLevel(1);
    setSeed(newSeed());
    setLives(ENDLESS_LIVES);
    setOutcome(null);
    setPlayback(null);
    setRecord(null);
    setPhase("idle");
  };

  const busy = phase === "running" || phase === "playing";
  const canSave = cleared.length > best && !busy && record?.status !== "checking" && phase !== "over";

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
            <InfinityIcon size={14} /> Level {level}
            <span className={styles.lives} aria-label={`${lives} lives left`}>
              {Array.from({ length: ENDLESS_LIVES }, (_, i) => (
                <Heart key={i} size={13} className={i < lives ? styles.lifeOn : styles.lifeOff} />
              ))}
            </span>
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
        <div className={styles.endlessHeader}>
          <button type="button" className={styles.ghostButton} onClick={onBack} disabled={busy}>
            <ArrowLeft size={15} /> Stages
          </button>
          <span className={styles.bestBadge}>
            <Trophy size={14} /> Record: {best ? `level ${best}` : "none yet"}
          </span>
        </div>

        <div className={styles.goal}>
          <strong>
            Endless mode · Level {level}: {config.cells}×{config.cells} maze, {config.lasers} lasers
            {config.loops ? ", with loops" : ""}.
          </strong>
          <span>How many levels can your code clear in one run? Every failed level costs a life.</span>
        </div>

        <details className={styles.commands}>
          <summary>Robot commands</summary>
          <ul>
            {COMMANDS.map((c) => (
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
          {phase === "cleared" ? (
            <button type="button" className={styles.runButton} onClick={nextLevel}>
              Level {level + 1} <ChevronRight size={16} />
            </button>
          ) : phase === "over" ? (
            <button type="button" className={styles.runButton} onClick={newRun}>
              <RotateCcw size={16} /> New run
            </button>
          ) : (
            <button type="button" className={styles.runButton} onClick={run} disabled={busy}>
              {busy ? <Loader2 size={16} className={styles.spin} /> : <Play size={16} />}
              {busy ? "Running…" : "Run"}
            </button>
          )}
          <button type="button" className={styles.ghostButton} onClick={() => setShowHint((v) => !v)}>
            <Lightbulb size={15} /> Hint
          </button>
          {canSave && (
            <button type="button" className={styles.ghostButton} onClick={() => saveRecord(cleared)}>
              <Save size={15} /> Save record ({cleared.length})
            </button>
          )}
        </div>

        {showHint && <p className={styles.hint}>{ENDLESS_HINT}</p>}

        {outcome && (
          <div
            className={`${styles.result} ${outcome.kind === "success" ? styles.resultSuccess : outcome.kind === "error" ? styles.resultWarn : styles.resultFail}`}
            role="status"
          >
            <div className={styles.resultTitle}>
              {outcome.kind === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <strong>{outcome.title}</strong>
            </div>
            {outcome.message && <p>{outcome.message.trim()}</p>}
          </div>
        )}

        {record && (
          <p className={`${styles.record} ${record.status === "saved" ? styles.recordSaved : record.status === "checking" || record.status === "kept" ? "" : styles.recordBad}`} role="status">
            {record.status === "checking" ? (
              <>
                <Loader2 size={14} className={styles.spin} /> Checking your run on the server…
              </>
            ) : (
              record.message
            )}
            {record.status === "error" && (
              <button type="button" onClick={() => saveRecord(cleared)}>
                Try again
              </button>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
