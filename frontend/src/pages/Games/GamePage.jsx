import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Construction, Gamepad2, Loader2, Lock } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { GAME_PRESENTATION } from "../../games/gamesCatalog";
import { fetchGame } from "../../services/gamesService";
import styles from "./GamesHub.module.css";

// Each game loads only when opened (the 3D maze pulls in three.js).
const PLAYABLE = {
  "robot-maze": lazy(() => import("../../games/robotMaze/RobotMazeGame")),
  "sky-traps": lazy(() => import("../../games/skyTraps/SkyTrapsGame")),
  "bomb-defuser": lazy(() => import("../../games/bombDefuser/BombDefuserGame")),
};

/**
 * One game. The server decides whether it is unlocked, so opening a locked game by URL only shows
 * how much XP is still missing.
 */
export default function GamePage() {
  const { gameId } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let active = true;
    fetchGame(gameId)
      .then((game) => active && setState({ game }))
      .catch((err) => active && setState({ error: err?.message || "This game is not available." }));
    return () => {
      active = false;
    };
  }, [gameId]);

  const look = GAME_PRESENTATION[gameId] || {};
  const Icon = look.icon || Gamepad2;
  const Game = PLAYABLE[gameId];

  return (
    <HubLayout title={state.game?.title || "Code Games"}>
      <div className={styles.page}>
        <Link to="/student/games" className={styles.backLink}>
          <ArrowLeft size={15} /> All games
        </Link>

        {state.loading && (
          <div className={styles.loading}>
            <Loader2 size={20} className={styles.spin} /> Loading…
          </div>
        )}

        {state.error && (
          <div className={`${styles.card} ${styles.notice}`} style={{ "--accent": "#fbbf24" }} role="alert">
            <span className={styles.gameIcon}>
              <Lock size={24} />
            </span>
            <h2>Locked</h2>
            <p className={styles.tagline}>{state.error}</p>
            <Link to="/student/dashboard" className={styles.playButton}>
              Earn XP in lessons
            </Link>
          </div>
        )}

        {state.game && Game && (
          <Suspense
            fallback={
              <div className={styles.loading}>
                <Loader2 size={20} className={styles.spin} /> Loading the game…
              </div>
            }
          >
            <Game game={state.game} />
          </Suspense>
        )}

        {state.game && !Game && (
          <div className={`${styles.card} ${styles.notice}`} style={{ "--accent": look.accent || "#3b82f6" }}>
            <span className={styles.gameIcon}>
              <Icon size={26} />
            </span>
            <h2>{state.game.title}</h2>
            <p className={styles.tagline}>{look.tagline}</p>
            <div className={styles.reward}>
              <Construction size={14} />
              <span>This game is being built and will be playable soon.</span>
            </div>
          </div>
        )}
      </div>
    </HubLayout>
  );
}
