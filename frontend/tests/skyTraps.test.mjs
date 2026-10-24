import test from "node:test";
import assert from "node:assert/strict";

const { generateWave, checkTrapAnswer, TRAP_SECONDS } = await import("../src/games/skyTraps/trapsEngine.js");
const { evaluateStudentCode, describeError } = await import("../src/games/sandbox/evaluate.js");

/** The game's own flow (expression first, statements on a SyntaxError), with a direct runner. */
const answer = (trap, input) =>
  checkTrapAnswer(trap, input, async (job) => {
    try {
      return { ok: true, result: evaluateStudentCode(job) };
    } catch (error) {
      return { ok: false, error: describeError(error) };
    }
  });

const accepted = async (trap, input) => (await answer(trap, input)).ok;
const feedback = async (trap, input) => (await answer(trap, input)).message;

const wave = generateWave(4242);
const [probe, cluster, word, cage, boss] = wave;

test("a wave has 5 traps with the agreed times", () => {
  assert.deepEqual(wave.map((t) => t.kind), ["destroy", "charge", "lowercase", "shielded", "boss"]);
  assert.deepEqual(wave.map((t) => t.seconds), TRAP_SECONDS);
  assert.deepEqual(TRAP_SECONDS, [40, 35, 30, 30, 45]);
});

test("the same seed rebuilds the same wave; another seed changes the answers", () => {
  assert.deepEqual(generateWave(4242), wave);
  const other = generateWave(99);
  assert.notDeepEqual(other.map((t) => t.expected), wave.map((t) => t.expected));
});

test("the boss swarm always has 2–3 armed traps and at least one that is not", () => {
  for (let seed = 1; seed <= 300; seed++) {
    const swarm = generateWave(seed)[4].context.traps;
    const armed = swarm.filter((t) => t.armed).length;
    assert.ok(armed >= 2 && armed <= 3, `seed ${seed}: ${armed} armed`);
    assert.equal(new Set(swarm.map((t) => t.id)).size, 5);
  }
});

test("trap 1: destroy(<id>)", async () => {
  assert.equal(await accepted(probe, `destroy(${probe.expected.id})`), true);
  assert.match(await feedback(probe, "destroy(1)"), /missed/);
  assert.match(await feedback(probe, `${probe.expected.id}`), /Call destroy/);
});

test("trap 2: any correct way to charge the shield with the sum is accepted", async () => {
  const { numbers } = cluster.context;
  assert.equal(await accepted(cluster, `shield.charge(${numbers.join(" + ")})`), true);
  assert.equal(await accepted(cluster, "shield.charge(numbers.reduce((a, b) => a + b, 0))"), true);
  assert.equal(await accepted(cluster, `shield.charge(${cluster.expected.sum})`), true);
  assert.match(await feedback(cluster, "shield.charge(1)"), /exactly the sum/);
});

test("trap 3: the code word in lowercase, however it is written", async () => {
  assert.equal(await accepted(word, "word.toLowerCase()"), true);
  assert.equal(await accepted(word, `"${word.context.word}".toLowerCase()`), true);
  assert.match(await feedback(word, "word"), /lowercase/);
});

test("trap 4: the shield must be turned off before the shot", async () => {
  assert.equal(await accepted(cage, "trap.shield = false; destroy(trap.id)"), true);
  assert.equal(await accepted(cage, "trap.shield = false; destroy(trap)"), true);
  assert.match(await feedback(cage, "destroy(trap.id); trap.shield = false"), /blocked/);
  assert.match(await feedback(cage, "destroy(trap.id)"), /blocked/);
});

test("trap 5: destroy exactly the armed traps", async () => {
  assert.equal(await accepted(boss, "traps.filter(t => t.armed).forEach(t => destroy(t.id))"), true);
  assert.equal(await accepted(boss, "for (const t of traps) { if (t.armed) destroy(t.id); }"), true);
  const unarmed = boss.context.traps.find((t) => !t.armed).id;
  assert.match(await feedback(boss, "traps.forEach(t => destroy(t.id))"), new RegExp(`Trap ${unarmed} was not armed`));
  assert.match(await feedback(boss, `destroy(${boss.expected.ids[0]})`), /still falling/);
});

test("errors in the student's line come back as messages", async () => {
  assert.match(await feedback(probe, "destroy("), /SyntaxError/);
  assert.match(await feedback(probe, "boom()"), /ReferenceError/);
});

test("the student cannot replace shield.charge", async () => {
  assert.match(await feedback(cluster, `shield.charge = () => 0; shield.charge(${cluster.expected.sum})`), /TypeError|read only/);
});
