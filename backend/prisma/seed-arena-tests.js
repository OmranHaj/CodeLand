/**
 * Hidden tests for the seeded Sunday Arena problems (same order as
 * PROBLEMS in seed-arena.js).
 *
 * For each problem:
 *  - reference:  fast Python solution — computes every expected output;
 *  - brute:      independent slow solution — must agree on inputs marked
 *                check_brute (small ones), so a wrong reference is caught;
 *  - inputs():   hidden test inputs (edge cases + generated large cases).
 *
 * Expected outputs are computed by ai/arena_tests.py, never written by hand.
 */

/** Deterministic PRNG so the generated tests are identical on every seed run. */
function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)) };
}

const edge = (input, checkBrute = true) => ({ input, kind: 'edge', check_brute: checkBrute });
const large = (input) => ({ input, kind: 'large', check_brute: false });
const list = (r, n, lo, hi) => Array.from({ length: n }, () => r.int(lo, hi));

export const ARENA_TEST_SPECS = [
  // ---------------------------------------------------------------- A. Beacon Fuel
  {
    reference: `t, b = map(int, input().split())
print(t // b)
`,
    brute: `t, b = map(int, input().split())
nights = 0
while t >= b:
    t -= b
    nights += 1
print(nights)
`,
    inputs() {
      const r = rng(1);
      return [
        edge('1 1'),
        edge('9 10'),
        edge('13 4'),
        edge('100 10'),
        edge('1 1000000000'),
        edge(`${r.int(1, 5000)} ${r.int(1, 50)}`),
        edge('1000000000 1', false),
        edge('1000000000 999999999', false),
        edge('999999999 1000000000', false),
        edge(`${r.int(1, 1e9)} ${r.int(1, 1e5)}`, false),
      ];
    },
  },

  // ---------------------------------------------------------------- B. Lens Inventory
  {
    reference: `import sys
data = sys.stdin.read().split()
n = int(data[0])
a = sorted(map(int, data[1:1 + n]))
print(" ".join(map(str, a)))
print(len(set(a)))
`,
    brute: `import sys
data = sys.stdin.read().split()
n = int(data[0])
a = list(map(int, data[1:1 + n]))
for i in range(n):
    for j in range(n - 1 - i):
        if a[j] > a[j + 1]:
            a[j], a[j + 1] = a[j + 1], a[j]
distinct = sum(1 for i in range(n) if i == 0 or a[i] != a[i - 1])
print(" ".join(map(str, a)))
print(distinct)
`,
    inputs() {
      const r = rng(2);
      const many = (n, lo, hi) => `${n}\n${list(r, n, lo, hi).join(' ')}`;
      return [
        edge('1\n5'),
        edge('2\n2 1'),
        edge('5\n3 3 3 3 3'),
        edge('6\n10 9 8 7 6 5'),
        edge('4\n1000000000 1 1000000000 1'),
        edge('7\n4 1 3 1 2 4 4'),
        edge(many(30, 1, 10)),
        edge(many(40, 1, 1e9)),
        large(many(20000, 1, 1e9)),
        large(many(20000, 1, 50)),
      ];
    },
  },

  // ---------------------------------------------------------------- C. Supply Boat
  {
    reference: `import sys
d = sys.stdin.read().split()
n, c = int(d[0]), int(d[1])
w = sorted(map(int, d[2:2 + n]))
i, j, trips = 0, n - 1, 0
while i <= j:
    if i < j and w[i] + w[j] <= c:
        i += 1
    j -= 1
    trips += 1
print(trips)
`,
    // Exact search over all pairings (bitmask DP) — only for small n.
    brute: `import sys
from functools import lru_cache
d = sys.stdin.read().split()
n, c = int(d[0]), int(d[1])
w = list(map(int, d[2:2 + n]))
full = (1 << n) - 1

@lru_cache(maxsize=None)
def best(mask):
    if mask == full:
        return 0
    i = next(k for k in range(n) if not (mask >> k) & 1)
    res = 1 + best(mask | (1 << i))
    for j in range(i + 1, n):
        if not (mask >> j) & 1 and w[i] + w[j] <= c:
            res = min(res, 1 + best(mask | (1 << i) | (1 << j)))
    return res

print(best(0))
`,
    inputs() {
      const r = rng(3);
      const randomSmall = () => {
        const n = r.int(1, 10);
        const c = r.int(5, 30);
        return edge(`${n} ${c}\n${list(r, n, 1, c).join(' ')}`);
      };
      const big = (n, c) => large(`${n} ${c}\n${list(r, n, 1, c).join(' ')}`);
      return [
        edge('1 5\n5'),
        edge('2 10\n5 5'),
        edge('2 9\n5 5'),
        edge('6 7\n1 6 2 5 3 4'),
        edge('4 100\n100 100 100 100'),
        edge('8 10\n9 1 8 2 7 3 6 4'),
        randomSmall(),
        randomSmall(),
        big(20000, 1e9),
        big(20000, 100),
      ];
    },
  },

  // ---------------------------------------------------------------- D. Signal Range
  {
    reference: `import sys, bisect
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1])
towers = sorted(map(int, d[2:2 + n]))
ships = list(map(int, d[2 + n:2 + n + m]))
best = 0
for x in ships:
    k = bisect.bisect_left(towers, x)
    options = []
    if k < n:
        options.append(towers[k] - x)
    if k > 0:
        options.append(x - towers[k - 1])
    best = max(best, min(options))
print(best)
`,
    brute: `import sys
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1])
towers = list(map(int, d[2:2 + n]))
ships = list(map(int, d[2 + n:2 + n + m]))
print(max(min(abs(s - t) for t in towers) for s in ships))
`,
    inputs() {
      const r = rng(4);
      const randomCase = (n, m, lim, kind) => {
        const text = `${n} ${m}\n${list(r, n, -lim, lim).join(' ')}\n${list(r, m, -lim, lim).join(' ')}`;
        return kind === 'large' ? large(text) : edge(text);
      };
      return [
        edge('1 1\n0\n0'),
        edge('2 2\n5 5\n5 5'),
        edge('3 4\n10 -10 0\n-5 5 15 -15'),
        // Distance 2e9 overflows a 32-bit int.
        edge('1 1\n-1000000000\n1000000000'),
        edge('2 3\n-1000000000 1000000000\n0 999999999 -999999999'),
        randomCase(8, 8, 50),
        randomCase(30, 30, 1e9),
        randomCase(60, 60, 1000),
        randomCase(20000, 20000, 1e9, 'large'),
        randomCase(20000, 20000, 1000, 'large'),
      ];
    },
  },

  // ---------------------------------------------------------------- E. Beacon Sync
  {
    reference: `from math import gcd
n = int(input())
a = list(map(int, input().split()))
l = 1
for x in a:
    l = l // gcd(l, x) * x
print(l)
`,
    brute: `n = int(input())
a = list(map(int, input().split()))
t = 1
while any(t % x for x in a):
    t += 1
print(t)
`,
    inputs() {
      const r = rng(5);
      const small = () => {
        const n = r.int(1, 4);
        return edge(`${n}\n${list(r, n, 1, 12).join(' ')}`);
      };
      const wide = () => edge(`10\n${list(r, 10, 1, 20).join(' ')}`, false);
      return [
        edge('1\n1'),
        edge('1\n20'),
        edge('2\n4 6'),
        edge('3\n6 10 15'),
        edge('5\n1 1 1 1 1'),
        small(),
        small(),
        // lcm(11..20) = 232792560 — needs 64-bit arithmetic in C++.
        edge('10\n11 12 13 14 15 16 17 18 19 20', false),
        edge('10\n20 19 18 17 16 13 11 9 7 5', false),
        wide(),
      ];
    },
  },

  // ---------------------------------------------------------------- F. Storm Path
  {
    reference: `import sys
from collections import deque
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1])
g = d[2:2 + n]
if g[n - 1][m - 1] == '#':
    print(-1)
    sys.exit()
dist = [[-1] * m for _ in range(n)]
dist[0][0] = 0
q = deque([(0, 0)])
while q:
    r, c = q.popleft()
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == '.' and dist[nr][nc] == -1:
            dist[nr][nc] = dist[r][c] + 1
            q.append((nr, nc))
print(dist[n - 1][m - 1])
`,
    // Repeated relaxation until nothing changes (no queue) — only for small grids.
    brute: `import sys
d = sys.stdin.read().split()
n, m = int(d[0]), int(d[1])
g = d[2:2 + n]
INF = float('inf')
dist = [[INF] * m for _ in range(n)]
dist[0][0] = 0
changed = True
while changed:
    changed = False
    for r in range(n):
        for c in range(m):
            if g[r][c] != '.' or dist[r][c] == INF:
                continue
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < m and g[nr][nc] == '.' and dist[r][c] + 1 < dist[nr][nc]:
                    dist[nr][nc] = dist[r][c] + 1
                    changed = True
res = dist[n - 1][m - 1]
print(-1 if res == INF else res)
`,
    inputs() {
      const r = rng(6);
      const grid = (n, m, rockPct) => {
        const rows = Array.from({ length: n }, (_, i) =>
          Array.from({ length: m }, (_, j) => (i === 0 && j === 0) || r.int(1, 100) > rockPct ? '.' : '#').join(''),
        );
        return `${n} ${m}\n${rows.join('\n')}`;
      };
      // Serpentine maze: walls on every odd row with a gap alternating sides.
      const serpentine = (n, m) => {
        const rows = Array.from({ length: n }, (_, i) => {
          if (i % 2 === 0) return '.'.repeat(m);
          const gapAtEnd = (i >> 1) % 2 === 0;
          return gapAtEnd ? '#'.repeat(m - 1) + '.' : '.' + '#'.repeat(m - 1);
        });
        return `${n} ${m}\n${rows.join('\n')}`;
      };
      return [
        edge('1 1\n.'),
        edge('1 5\n.....'),
        edge('5 1\n.\n.\n.\n.\n.'),
        edge('2 2\n..\n.#'),
        edge('3 4\n....\n###.\n....'),
        edge(grid(6, 6, 30)),
        edge(grid(8, 7, 20)),
        edge(serpentine(9, 7)),
        large(grid(300, 300, 25)),
        large(serpentine(299, 300)),
      ];
    },
  },
];
