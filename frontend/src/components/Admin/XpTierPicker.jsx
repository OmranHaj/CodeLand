import { Zap } from "lucide-react";
import { ARENA_TIER_LABELS, ARENA_XP_TIERS } from "../../services/arenaProblemService";

/** Segmented picker restricted to the six allowed XP values. */
export default function XpTierPicker({ value, onChange, disabled = false, compact = false, id }) {
  return (
    <div
      className={`arena-xp-picker ${compact ? "compact" : ""}`}
      role="radiogroup"
      aria-label="Problem XP"
      id={id}
    >
      {ARENA_XP_TIERS.map((xp, idx) => (
        <button
          key={xp}
          type="button"
          role="radio"
          aria-checked={Number(value) === xp}
          className={Number(value) === xp ? "active" : ""}
          onClick={() => onChange(xp)}
          disabled={disabled}
          title={`${xp} XP · ${ARENA_TIER_LABELS[idx]}`}
        >
          <span className="arena-xp-value">
            {!compact && <Zap size={11} />}
            {xp}
          </span>
          {!compact && <span className="arena-xp-tier">{ARENA_TIER_LABELS[idx]}</span>}
        </button>
      ))}
    </div>
  );
}
