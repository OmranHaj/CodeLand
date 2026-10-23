import { Fragment } from "react";

/**
 * Renders generator prose safely (no HTML injection): paragraphs, "- " bullet
 * lists, `inline code`, **bold**, and light math notation such as
 * "1 <= n <= 10^5" or "$1 \le n \le 10^{5}$" -> "1 ≤ n ≤ 10⁵".
 */

const MATH_REPLACEMENTS = [
  [/\\leq?\b/g, "≤"],
  [/\\geq?\b/g, "≥"],
  [/\\neq?\b/g, "≠"],
  [/\\times\b/g, "×"],
  [/\\cdot\b/g, "·"],
  [/\\(?:ldots|dots)\b/g, "…"],
  [/<=/g, "≤"],
  [/>=/g, "≥"],
  [/!=/g, "≠"],
];

export function normalizeMath(text = "") {
  let out = String(text).replace(/\$([^$\n]+)\$/g, "$1");
  for (const [pattern, replacement] of MATH_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

const SUPERSCRIPT = /([A-Za-z0-9)\]])\^(?:\{([^}]+)\}|(-?[A-Za-z0-9]+))/g;

function renderMath(text, keyPrefix) {
  const normalized = normalizeMath(text);
  const parts = [];
  let last = 0;
  let match;
  SUPERSCRIPT.lastIndex = 0;
  while ((match = SUPERSCRIPT.exec(normalized))) {
    parts.push(normalized.slice(last, match.index + 1));
    parts.push(<sup key={`${keyPrefix}-sup-${match.index}`}>{match[2] ?? match[3]}</sup>);
    last = match.index + match[0].length;
  }
  parts.push(normalized.slice(last));
  return parts;
}

export function renderInline(text = "", keyPrefix = "t") {
  return String(text)
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((segment, i) => {
      const key = `${keyPrefix}-${i}`;
      if (segment.startsWith("`") && segment.endsWith("`")) {
        return <code key={key}>{segment.slice(1, -1)}</code>;
      }
      if (segment.startsWith("**") && segment.endsWith("**")) {
        return <strong key={key}>{renderMath(segment.slice(2, -2), key)}</strong>;
      }
      return <Fragment key={key}>{renderMath(segment, key)}</Fragment>;
    });
}

export default function ArenaRichText({ text, className }) {
  if (!text || !String(text).trim()) return null;

  const blocks = String(text).replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((line) => /^\s*[-*•]\s+/.test(line));
        if (isList) {
          return (
            <ul key={bi}>
              {lines.map((line, li) => (
                <li key={li}>{renderInline(line.replace(/^\s*[-*•]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
