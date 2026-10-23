import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Eye,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  Lock,
  LogIn,
  LogOut,
  MessageSquareText,
  ScrollText,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import ArenaRichText, { renderInline } from "./ArenaRichText";
import { formatXp, xpAfterHint } from "../../services/arenaProblemService";
import styles from "./ArenaProblemView.module.css";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Copy to clipboard">
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Section({ icon: Icon, title, kicker, children, index = 0, className = "" }) {
  return (
    <section className={`${styles.card} ${className}`} style={{ "--i": index }}>
      <header className={styles.cardHead}>
        <span className={styles.cardIcon}>
          <Icon size={16} />
        </span>
        <div>
          {kicker && <div className={styles.cardKicker}>{kicker}</div>}
          <h2 className={styles.cardTitle}>{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function Illustration({ problem, index, showEmpty }) {
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return undefined;
    const onKey = (e) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed]);

  if (!problem.imageUrl && !showEmpty) return null;

  const caption = problem.canBeExplainedByDiagrams
    ? "Step-by-step diagram · read the four panels left to right, top to bottom"
    : "Story illustration";

  return (
    <Section icon={ImageIcon} kicker="VISUAL BRIEFING" title="Illustration" index={index}>
      {problem.imageUrl ? (
        <figure className={styles.figure}>
          <button
            type="button"
            className={styles.figureBtn}
            onClick={() => setZoomed(true)}
            aria-label="Enlarge illustration"
          >
            <img src={problem.imageUrl} alt={problem.imageAlt || `Illustration for ${problem.title}`} loading="lazy" />
            <span className={styles.zoomHint}>
              <Eye size={13} /> Click to enlarge
            </span>
          </button>
          <figcaption>{caption}</figcaption>
        </figure>
      ) : (
        <div className={styles.emptyInline}>No illustration was generated for this problem.</div>
      )}

      {zoomed && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" onClick={() => setZoomed(false)}>
          <button type="button" className={styles.lightboxClose} aria-label="Close" onClick={() => setZoomed(false)}>
            <X size={20} />
          </button>
          <img src={problem.imageUrl} alt={problem.imageAlt || problem.title} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </Section>
  );
}

/**
 * Hint panel. In "student" mode the hint text only exists once the backend
 * returned it; revealing goes through a confirmation that states the cost.
 */
function HintPanel({ variant, problem, hint, index }) {
  const [confirming, setConfirming] = useState(false);
  const progress = problem.progress || {};

  if (variant === "admin") {
    return (
      <Section icon={Lightbulb} kicker="ADMIN PREVIEW · HIDDEN FROM STUDENTS UNTIL REVEALED" title="Hint" index={index} className={styles.hintCard}>
        <ArenaRichText text={problem.hint} className={styles.prose} />
        <p className={styles.hintFoot}>
          Students pay 25%: {formatXp(problem.xp)} XP → {formatXp(xpAfterHint(problem.xp))} XP.
        </p>
      </Section>
    );
  }

  const revealedText = hint?.text || problem.hint;

  if (revealedText) {
    return (
      <Section icon={Lightbulb} kicker="STRATEGIC HINT" title="Hint" index={index} className={`${styles.hintCard} ${styles.hintRevealed}`}>
        <ArenaRichText text={revealedText} className={styles.prose} />
        <p className={styles.hintFoot}>
          {progress.hintUsed
            ? `Hint used · maximum reward is now ${formatXp(progress.maxEarnableXp)} XP`
            : "Unlocked after solving · no penalty applied"}
        </p>
      </Section>
    );
  }

  return (
    <Section icon={Lock} kicker="LOCKED INTEL" title="Hint" index={index} className={styles.hintCard}>
      {!confirming ? (
        <div className={styles.hintLocked}>
          <p>
            Stuck? The hint reveals the key observation — about half of the solution — without giving away the code.
          </p>
          <button
            type="button"
            className={styles.hintBtn}
            onClick={() => setConfirming(true)}
            disabled={hint?.loading}
          >
            <Lightbulb size={15} /> Show Hint (−25% XP)
          </button>
        </div>
      ) : (
        <div className={styles.hintConfirm} role="alert">
          <div className={styles.hintWarnTitle}>
            <AlertTriangle size={16} /> This costs 25% of this problem's XP
          </div>
          <p>
            Your maximum reward drops from <strong>{formatXp(problem.xp)} XP</strong> to{" "}
            <strong>{formatXp(xpAfterHint(problem.xp))} XP</strong>. It is recorded on your account and can't be
            undone — but you will never be charged twice for this problem.
          </p>
          <div className={styles.hintConfirmActions}>
            <button
              type="button"
              className={styles.hintBtn}
              disabled={hint?.loading}
              onClick={async () => {
                const ok = await hint?.onReveal?.();
                if (ok !== false) setConfirming(false);
              }}
            >
              {hint?.loading ? <span className={styles.spinner} /> : <Lightbulb size={15} />}
              {hint?.loading ? "Revealing…" : "Reveal hint"}
            </button>
            <button type="button" className={styles.ghostBtn} onClick={() => setConfirming(false)} disabled={hint?.loading}>
              Keep it hidden
            </button>
          </div>
        </div>
      )}
      {hint?.error && <p className={styles.inlineError}>{hint.error}</p>}
    </Section>
  );
}

export default function ArenaProblemView({ problem, variant = "student", hint }) {
  if (!problem) return null;

  const accent = problem.difficultyColor || "#a855f7";
  const tier = (problem.difficultyIndex ?? 0) + 1;
  const progress = problem.progress || {};
  const constraints = Array.isArray(problem.constraints) ? problem.constraints : [];
  const examples = Array.isArray(problem.examples) ? problem.examples : [];
  const hintPenalised = variant === "student" && progress.hintUsed && !progress.solved;

  let i = 0;
  return (
    <article className={styles.view} style={{ "--tier": accent }}>
      {/* ===================== HEADER ===================== */}
      <header className={styles.header} style={{ "--i": i++ }}>
        <div className={styles.headerGlow} />
        <div className={styles.headerTop}>
          <span className={styles.kicker}>
            <Sparkles size={13} /> SUNDAY ARENA · TIER {String(tier).padStart(2, "0")}
          </span>
          {progress.solved && (
            <span className={styles.solvedPill}>
              <CheckCircle2 size={13} /> Solved · +{formatXp(progress.earnedXp)} XP
            </span>
          )}
        </div>

        <div className={styles.headerMain}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{problem.title}</h1>
            {problem.arabicTitle && (
              <p className={styles.arabicTitle} dir="rtl" lang="ar">
                {problem.arabicTitle}
              </p>
            )}
          </div>

          <div className={styles.xpBadge} aria-label={`${formatXp(problem.xp)} XP`}>
            <Zap size={18} />
            <div>
              {hintPenalised ? (
                <>
                  <span className={styles.xpValue}>{formatXp(progress.maxEarnableXp)}</span>
                  <span className={styles.xpStrike}>{formatXp(problem.xp)} XP</span>
                </>
              ) : (
                <span className={styles.xpValue}>{formatXp(problem.xp)}</span>
              )}
              <span className={styles.xpLabel}>{hintPenalised ? "MAX XP · HINT USED" : "XP REWARD"}</span>
            </div>
          </div>
        </div>

        <div className={styles.chips}>
          <span className={styles.chip} style={{ color: accent, borderColor: `${accent}66` }}>
            {problem.difficulty}
          </span>
          {problem.timeLimit && (
            <span className={styles.chip}>
              <Clock size={12} /> {problem.timeLimit}
            </span>
          )}
          {problem.memoryLimit && (
            <span className={styles.chip}>
              <Cpu size={12} /> {problem.memoryLimit}
            </span>
          )}
          {examples.length > 0 && (
            <span className={styles.chip}>
              <ListChecks size={12} /> {examples.length} example{examples.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </header>

      {/* ===================== STATEMENT ===================== */}
      <Section icon={ScrollText} kicker="MISSION BRIEF" title="Problem Statement" index={i++}>
        <ArenaRichText text={problem.statement} className={styles.prose} />
      </Section>

      <Illustration problem={problem} index={i++} showEmpty={variant === "admin"} />

      {/* ===================== INPUT / OUTPUT ===================== */}
      <div className={styles.ioGrid}>
        <Section icon={LogIn} kicker="STDIN" title="Input" index={i++}>
          <ArenaRichText text={problem.inputSpec} className={styles.prose} />
        </Section>
        <Section icon={LogOut} kicker="STDOUT" title="Output" index={i++}>
          <ArenaRichText text={problem.outputSpec} className={styles.prose} />
        </Section>
      </div>

      {/* ===================== CONSTRAINTS ===================== */}
      {constraints.length > 0 && (
        <Section icon={ListChecks} kicker="LIMITS" title="Constraints" index={i++}>
          <ul className={styles.constraints}>
            {constraints.map((c, idx) => (
              <li key={idx}>{renderInline(c, `c${idx}`)}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* ===================== EXAMPLES ===================== */}
      <Section icon={ListChecks} kicker="SAMPLE TESTS" title={examples.length > 1 ? "Examples" : "Example"} index={i++}>
        {examples.length === 0 ? (
          <div className={styles.emptyInline}>No examples available.</div>
        ) : (
          <div className={styles.examples}>
            {examples.map((ex, idx) => (
              <div key={idx} className={styles.example}>
                {examples.length > 1 && <div className={styles.exampleLabel}>Example {idx + 1}</div>}
                <div className={styles.exampleGrid}>
                  <div className={styles.codeBlock}>
                    <div className={styles.codeHead}>
                      <span>Input</span>
                      <CopyButton text={ex.input} />
                    </div>
                    <pre>{ex.input || " "}</pre>
                  </div>
                  <div className={styles.codeBlock}>
                    <div className={styles.codeHead}>
                      <span>Output</span>
                      <CopyButton text={ex.output} />
                    </div>
                    <pre>{ex.output || " "}</pre>
                  </div>
                </div>
                {ex.explanation && (
                  <ArenaRichText text={ex.explanation} className={`${styles.prose} ${styles.exampleNote}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ===================== NOTE ===================== */}
      {problem.note && (
        <Section icon={MessageSquareText} kicker="SETTER'S NOTE" title="Note" index={i++}>
          <ArenaRichText text={problem.note} className={styles.prose} />
        </Section>
      )}

      {/* ===================== HINT ===================== */}
      <HintPanel variant={variant} problem={problem} hint={hint} index={i++} />
    </article>
  );
}
