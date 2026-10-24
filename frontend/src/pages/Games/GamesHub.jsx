import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Gamepad2, Loader2, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import LockShatter from "../../games/LockShatter";
import { GAME_PRESENTATION } from "../../games/gamesCatalog";
import { fetchGames } from "../../services/gamesService";
import { getUser, userKey } from "../../services/learningHub";
import styles from "./GamesHub.module.css";

const PREVIEW_STEPS = [0, 2000, 3000, 4000];

const seenKey = () => `codeland_games_unlocked_${userKey()}`;

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(seenKey())) || []);
  } catch {
    return new Set();
  }
}

function saveSeen(ids) {
  try {
    localStorage.setItem(seenKey(), JSON.stringify([...ids]));
  } catch {
    // Not remembering only means the unlock animation plays again.
  }
}

function GameCard({ game, celebrate, onCelebrated }) {
  const look = GAME_PRESENTATION[game.id] || {};
  const Icon = look.icon || Gamepad2;
  const [showLock, setShowLock] = useState(!game.unlocked || celebrate);
  const progress = Math.min(100, Math.round(((game.unlockXp - game.xpToUnlock) / game.unlockXp) * 100));

  const unlockedView = game.unlocked && !showLock;

  return (
    <article
      className={`${styles.card} ${unlockedView ? styles.cardUnlocked : styles.cardLocked}`}
      style={{ "--accent": look.accent || "#3b82f6" }}
      aria-label={`${game.title}${game.unlocked ? "" : " (locked)"}`}
    >
      <div className={styles.cardTop}>
        <span className={styles.gameIcon}>
          <Icon size={26} />
        </span>
        <span className={styles.threshold}>
          {game.completed ? (
            <>
              <CheckCircle2 size={13} /> Completed
            </>
          ) : (
            `Unlocks at ${game.unlockXp.toLocaleString()} XP`
          )}
        </span>
      </div>

      <h2>{game.title}</h2>
      <p className={styles.tagline}>{look.tagline}</p>

      <div className={styles.skills}>
        {(look.skills || []).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className={styles.reward}>
        <Trophy size={14} />
        <span>
          +{game.rewardXp} XP · <strong>{look.badge}</strong> badge · {look.stages}
        </span>
      </div>

      {unlockedView ? (
        <Link to={`/student/games/${game.id}`} className={styles.playButton}>
          {game.completed ? <RotateCcw size={16} /> : <Play size={16} />}
          {game.completed ? "Play again" : "Play"}
        </Link>
      ) : (
        <div className={styles.lockArea}>
          <div className={styles.progressHead}>
            <span>{game.unlocked ? "Unlocked!" : `${game.xpToUnlock.toLocaleString()} XP to go`}</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {showLock && (
        <LockShatter
          celebrate={celebrate}
          accent={look.accent || "#3b82f6"}
          className={styles.lockBadge}
          canvasClassName={styles.shatterCanvas}
          onDone={() => {
            setShowLock(false);
            onCelebrated(game.id);
          }}
        />
      )}
    </article>
  );
}

export default function GamesHub() {
  const user = getUser();
  const isAdmin = ["admin", "superadmin", "super_admin"].includes(String(user?.role || "").toLowerCase());
  const [previewXp, setPreviewXp] = useState(isAdmin ? 0 : undefined);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [seen, setSeen] = useState(readSeen);

  const load = useCallback(
    (xp) =>
      fetchGames(xp)
        .then((res) => {
          setData(res);
          setError("");
        })
        .catch((err) => setError(err?.message || "Could not load the games.")),
    [],
  );

  useEffect(() => {
    load(previewXp);
  }, [load, previewXp]);

  const handleCelebrated = (gameId) => {
    if (data?.preview) return; // admin previews do not remember anything
    setSeen((current) => {
      const next = new Set(current).add(gameId);
      saveSeen(next);
      return next;
    });
  };

  return (
    <HubLayout title="Code Games">
      <div className={styles.page}>
        <div className="hub-heading">
          <div>
            <span className="hub-eyebrow">
              <Gamepad2 size={13} /> CODE GAMES
            </span>
            <h1>Play with your code.</h1>
            <p>
              Earn XP in lessons and challenges to unlock each game. Finish a game to win bonus XP and
              its badge.
            </p>
          </div>
          {data && (
            <div className={styles.xpPill}>
              <Sparkles size={15} />
              <strong>{Math.floor(data.xp).toLocaleString()} XP</strong>
              {data.preview && <em>preview</em>}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className={styles.previewBar} role="group" aria-label="Preview as a student with">
            <span>Student view (admin only):</span>
            {PREVIEW_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                className={previewXp === step ? styles.previewActive : ""}
                onClick={() => setPreviewXp(step)}
              >
                {step.toLocaleString()} XP
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!data && !error ? (
          <div className={styles.loading}>
            <Loader2 size={20} className={styles.spin} /> Loading games…
          </div>
        ) : (
          data && (
            <div className={styles.grid}>
              {data.games.map((game) => (
                <GameCard
                  key={`${game.id}-${data.xp}`}
                  game={game}
                  celebrate={game.unlocked && (data.preview || !seen.has(game.id))}
                  onCelebrated={handleCelebrated}
                />
              ))}
            </div>
          )
        )}
      </div>
    </HubLayout>
  );
}
