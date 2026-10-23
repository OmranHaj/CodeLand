"""
Builds and validates the hidden tests of a Sunday Arena problem.

Expected outputs are never taken from the language model: they are computed by
running the problem's reference solution. Two independent checks guard that
solution before anything is saved:

  1. it must reproduce every visible example exactly;
  2. an independent brute-force solution must agree with it on every input
     marked as small (check_brute=True).

Used by backend/prisma/seed-arena.js (via stdin/stdout JSON) and, later, by
generate_contest.py (import build_tests).

NOTE: solutions run as local Python subprocesses with a timeout. They come from
our own generator / seed and are reviewed by an admin before publishing; this
is not a sandbox for untrusted student code (students run on Judge0).
"""

import json
import os
import subprocess
import sys
import tempfile

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8")

RESULT_PREFIX = "__ARENA_TESTS__"
SMALL_TIMEOUT = 10
LARGE_TIMEOUT = 30


def normalize(text):
    """Same comparison as JudgeService.normalizeOutput: ignore trailing spaces and blank edges."""
    return "\n".join(line.rstrip() for line in (text or "").replace("\r\n", "\n").split("\n")).strip()


def run_solution(path, stdin, timeout):
    """Runs a Python solution file. Returns (stdout, error_message_or_None)."""
    try:
        proc = subprocess.run(
            [sys.executable, "-I", path],
            input=stdin,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=timeout,
        )
    except subprocess.TimeoutExpired:
        return "", f"timed out after {timeout}s"
    if proc.returncode != 0:
        return proc.stdout, (proc.stderr.strip().splitlines() or ["runtime error"])[-1][:300]
    return proc.stdout, None


def build_tests(reference, brute, examples, inputs):
    """
    reference / brute: Python source code (stdin -> stdout).
    examples: [{"input", "output"}] — the visible examples.
    inputs:   [{"input", "kind": "edge"|"large", "check_brute": bool}]
    Returns {"status": "validated"|"failed", "error": str|None, "tests": [...]}.
    """
    with tempfile.TemporaryDirectory() as tmp:
        ref_path = os.path.join(tmp, "reference.py")
        brute_path = os.path.join(tmp, "brute.py")
        with open(ref_path, "w", encoding="utf-8") as f:
            f.write(reference)
        if brute:
            with open(brute_path, "w", encoding="utf-8") as f:
                f.write(brute)

        def fail(message):
            return {"status": "failed", "error": message, "tests": []}

        # 1. The reference must reproduce every visible example.
        for i, ex in enumerate(examples):
            out, err = run_solution(ref_path, ex["input"], SMALL_TIMEOUT)
            if err:
                return fail(f"Reference solution crashed on example {i + 1}: {err}")
            if normalize(out) != normalize(ex["output"]):
                return fail(
                    f"Example {i + 1} disagrees with the reference solution: "
                    f"example says {normalize(ex['output'])!r}, reference prints {normalize(out)!r}"
                )

        # 2. Brute force must agree on examples and every small input.
        if brute:
            small = [ex["input"] for ex in examples] + [t["input"] for t in inputs if t.get("check_brute")]
            for i, stdin in enumerate(small):
                ref_out, ref_err = run_solution(ref_path, stdin, SMALL_TIMEOUT)
                brute_out, brute_err = run_solution(brute_path, stdin, SMALL_TIMEOUT)
                if ref_err or brute_err:
                    return fail(f"Cross-check input {i + 1} failed to run: {ref_err or brute_err}")
                if normalize(ref_out) != normalize(brute_out):
                    preview = stdin if len(stdin) < 200 else stdin[:200] + "…"
                    return fail(
                        f"Reference and brute-force disagree on {preview!r}: "
                        f"{normalize(ref_out)!r} vs {normalize(brute_out)!r}"
                    )

        # 3. Expected outputs for every hidden test come from the reference.
        tests = []
        for i, t in enumerate(inputs):
            timeout = LARGE_TIMEOUT if t.get("kind") == "large" else SMALL_TIMEOUT
            out, err = run_solution(ref_path, t["input"], timeout)
            if err:
                return fail(f"Reference solution failed on hidden test {i + 1}: {err}")
            tests.append({"kind": t.get("kind", "edge"), "input": t["input"], "expectedOutput": normalize(out)})

        if not tests:
            return fail("No hidden test inputs were provided.")
        return {"status": "validated", "error": None, "tests": tests}


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    try:
        result = build_tests(
            payload["reference"],
            payload.get("brute"),
            payload.get("examples", []),
            payload.get("inputs", []),
        )
    except Exception as exc:  # pragma: no cover - defensive
        result = {"status": "failed", "error": f"{type(exc).__name__}: {exc}", "tests": []}
    print(RESULT_PREFIX + json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
