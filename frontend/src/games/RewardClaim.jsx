import { useCallback, useEffect, useState } from "react";
import { Award, CheckCircle2, Loader2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { completeGame } from "../services/gamesService";
import { GAME_PRESENTATION } from "./gamesCatalog";
import styles from "./RewardClaim.module.css";

// One request per proof, even when React runs the effect twice in development.
const pending = new WeakMap();

function claim(gameId, proof) {
  if (!pending.has(proof)) {
    const request = completeGame(gameId, proof).catch((error) => {
      // A failed request may be retried with the same proof.
      pending.delete(proof);
      throw error;
    });
    pending.set(proof, request);
  }
  return pending.get(proof);
}

/**
 * Shown when a game is finished: the server re-checks the student's code and, the first time it
 * passes, awards the game's XP and badge.
 */
export default function RewardClaim({ gameId, proof }) {
  const [state, setState] = useState({ status: "checking" });
  const badge = GAME_PRESENTATION[gameId]?.badge;

  const send = useCallback(() => {
    let active = true;
    claim(gameId, proof)
      .then((res) => {
        if (!active) return;
        if (!res?.verified) setState({ status: "refused", message: res?.message });
        else if (res.alreadyCompleted) setState({ status: "already" });
        else if (res.preview) setState({ status: "preview", message: res.message });
        else {
          setState({ status: "earned", xp: res.xpAwarded });
          window.dispatchEvent(new Event("codeland:update"));
        }
      })
      .catch((error) => active && setState({ status: "error", message: error?.message }));
    return () => {
      active = false;
    };
  }, [gameId, proof]);

  useEffect(() => send(), [send]);

  const retry = () => {
    setState({ status: "checking" });
    send();
  };

  return (
    <div className={`${styles.claim} ${styles[state.status]}`} role="status" aria-live="polite">
      {state.status === "checking" && (
        <p>
          <Loader2 size={16} className={styles.spin} /> Checking your code on the server…
        </p>
      )}
      {state.status === "earned" && (
        <>
          <p className={styles.xp}>
            <ShieldCheck size={18} /> Verified! +{state.xp} XP
          </p>
          {badge && (
            <p>
              <Award size={16} /> Badge unlocked: <strong>{badge}</strong>
            </p>
          )}
        </>
      )}
      {state.status === "already" && (
        <p>
          <CheckCircle2 size={16} /> Verified. You already earned the XP and badge for this game.
        </p>
      )}
      {state.status === "preview" && (
        <p>
          <CheckCircle2 size={16} /> {state.message}
        </p>
      )}
      {state.status === "refused" && (
        <p>
          <XCircle size={16} /> The server could not confirm your solution: {state.message}
        </p>
      )}
      {state.status === "error" && (
        <>
          <p>
            <XCircle size={16} /> {state.message || "Your reward could not be checked."}
          </p>
          <button type="button" className={styles.retry} onClick={retry}>
            <RotateCcw size={14} /> Try again
          </button>
        </>
      )}
    </div>
  );
}
