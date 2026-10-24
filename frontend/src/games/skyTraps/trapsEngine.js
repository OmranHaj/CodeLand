/**
 * Sky Traps engine: a wave of 5 falling traps built from a seed, the code environment each trap
 * gives the student, and the judge that decides whether a line of code destroyed it.
 * Pure JavaScript so it runs in tests and (later) on the server; the same seed rebuilds the same wave.
 */

import { createRandom } from "../random.js";

/** Seconds a trap takes to land on a computer; phones get MOBILE_TIME_MULTIPLIER × this. */
export const TRAP_SECONDS = [40, 35, 30, 30, 45];

/** Hits the base can take before the wave restarts. */
export const SHIELDS = 3;

const CODE_WORDS = ["TRAP", "MINE", "VIRUS", "ROGUE", "BLAST", "STORM", "SPARK"];

/** The five traps of a wave. Values change with the seed so answers cannot be memorised. */
export function generateWave(seed) {
  const rand = createRandom(seed);
  const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

  const probeId = int(100, 999);
  const numbers = [int(2, 9), int(2, 9), int(2, 9)];
  const word = CODE_WORDS[int(0, CODE_WORDS.length - 1)];
  const cageId = int(10, 99);

  // Boss swarm: 5 traps with different ids; 2–3 armed, at least one not armed.
  const ids = [];
  while (ids.length < 5) {
    const id = int(1, 40);
    if (!ids.includes(id)) ids.push(id);
  }
  let armed;
  do {
    armed = ids.map(() => rand() < 0.5);
  } while (armed.filter(Boolean).length < 2 || armed.filter(Boolean).length > 3);
  const swarm = ids.map((id, i) => ({ id, armed: armed[i] }));

  return [
    {
      n: 1,
      kind: "destroy",
      title: "Probe Mine",
      prompt: `Destroy this trap. Its ID is ${probeId}.`,
      context: {},
      hint: "Call destroy() and put the trap's ID inside the brackets.",
      expected: { id: probeId },
    },
    {
      n: 2,
      kind: "charge",
      title: "Cluster Bomb",
      prompt: "Charge the shield with the sum of the numbers in this trap.",
      context: { numbers },
      hint: "Add the numbers together and pass the total to shield.charge(...).",
      expected: { sum: numbers.reduce((a, b) => a + b, 0) },
    },
    {
      n: 3,
      kind: "lowercase",
      title: "Code Word",
      prompt: "This trap only opens with its code word in lowercase letters. Turn word into lowercase.",
      context: { word },
      hint: "Strings have a .toLowerCase() method.",
      expected: { text: word.toLowerCase() },
    },
    {
      n: 4,
      kind: "shielded",
      title: "Shielded Cage",
      prompt: "This trap has a shield. Turn the shield off (set it to false), then destroy the trap by its id.",
      context: { trap: { id: cageId, shield: true } },
      hint: "Two steps on one line, separated by a semicolon: first change trap.shield, then call destroy().",
      expected: { id: cageId },
    },
    {
      n: 5,
      kind: "boss",
      title: "Boss Swarm",
      prompt: "A whole swarm! Destroy only the armed traps (armed: true) and leave the others alone.",
      context: { traps: swarm },
      hint: "Use traps.filter(...) to keep the armed ones, then .forEach(...) to call destroy() on each id.",
      expected: { ids: swarm.filter((t) => t.armed).map((t) => t.id) },
    },
  ].map((trap, i) => ({ ...trap, seconds: TRAP_SECONDS[i] }));
}

/** What the student can use: destroy(), shield.charge() and the trap's own variables. */
function setupFor(trap) {
  const variables = Object.entries(trap.context)
    .map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`)
    .join("\n");
  return `const __log = { destroyed: [], charged: [] };
function destroy(target) {
  const id = target !== null && typeof target === "object" ? target.id : target;
  // For the shielded cage, remember whether its shield was down at the moment of the shot.
  __log.destroyed.push({ id, shieldUp: typeof trap !== "undefined" && trap !== null ? trap.shield !== false : false });
}
const shield = Object.freeze({ charge(amount) { __log.charged.push(amount); } });
${variables}`;
}

/**
 * Sandbox jobs for one answer. "expression" captures the value of a single expression (needed for
 * the code word); if the answer is several statements it is a syntax error there and the
 * "statements" job runs it instead.
 */
export function buildTrapJobs(trap, input) {
  const setup = setupFor(trap);
  return {
    expression: { setup, code: `const __value = (\n${input}\n);`, finish: "{ value: __value, log: __log }" },
    statements: { setup, code: input, finish: "{ value: undefined, log: __log }" },
  };
}

/**
 * Runs one answer and judges it. `run(job)` executes a sandbox job and resolves with
 * { ok, result } or { ok: false, error } (the sandbox Worker in the game, a direct call in tests).
 */
export async function checkTrapAnswer(trap, input, run) {
  const jobs = buildTrapJobs(trap, input);
  let res = await run(jobs.expression);
  if (!res.ok && /^SyntaxError/.test(res.error || "")) res = await run(jobs.statements);
  return judgeTrap(trap, res.ok ? res.result : { error: res.error });
}

const same = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Did this answer destroy the trap? Returns { ok, message } written for the student. */
export function judgeTrap(trap, outcome) {
  if (!outcome || outcome.error) {
    return { ok: false, message: outcome?.error || "Your code could not run." };
  }
  const { value, log } = outcome;
  const destroyed = (log?.destroyed || []).map((d) => d.id);

  switch (trap.kind) {
    case "destroy": {
      if (!destroyed.length) return { ok: false, message: "Nothing was fired. Call destroy() to hit the trap." };
      if (destroyed.every((id) => id === trap.expected.id)) return { ok: true, message: "Direct hit!" };
      return { ok: false, message: `destroy(${JSON.stringify(destroyed[0])}) missed. Check the trap's ID.` };
    }
    case "charge": {
      const charged = log?.charged || [];
      if (!charged.length) return { ok: false, message: "The shield was not charged. Call shield.charge(...) with the total." };
      if (charged[charged.length - 1] === trap.expected.sum) return { ok: true, message: "Shield charged!" };
      return { ok: false, message: `The shield got ${JSON.stringify(charged[charged.length - 1])}, but the trap needs exactly the sum of its numbers.` };
    }
    case "lowercase": {
      if (value === trap.expected.text) return { ok: true, message: "Code word accepted!" };
      if (typeof value === "string" && value.toLowerCase() === trap.expected.text) {
        return { ok: false, message: "Close! Every letter has to be lowercase." };
      }
      return { ok: false, message: "Write an expression that gives the code word in lowercase letters." };
    }
    case "shielded": {
      const shot = (log?.destroyed || []).find((d) => d.id === trap.expected.id);
      if (shot && !shot.shieldUp) return { ok: true, message: "Shield down, trap destroyed!" };
      if (shot) return { ok: false, message: "The shield blocked the shot! Turn trap.shield off first." };
      if (destroyed.length) return { ok: false, message: "That missed. Destroy the trap using its id." };
      return { ok: false, message: "Turn the shield off, then call destroy() on the trap's id." };
    }
    case "boss": {
      const wrong = destroyed.filter((id) => !trap.expected.ids.includes(id));
      if (wrong.length) return { ok: false, message: `Trap ${wrong[0]} was not armed. Only destroy the armed ones.` };
      const unique = [...new Set(destroyed)];
      if (same(unique, trap.expected.ids)) return { ok: true, message: "The whole swarm is down!" };
      if (!destroyed.length) return { ok: false, message: "Nothing was fired. Destroy every armed trap." };
      return { ok: false, message: `Armed traps are still falling: ${trap.expected.ids.filter((id) => !unique.includes(id)).join(", ")}.` };
    }
    default:
      return { ok: false, message: "Unknown trap." };
  }
}
