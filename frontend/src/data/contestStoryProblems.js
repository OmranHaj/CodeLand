/**
 * CodeLand Sunday Championship Story Arena
 * 6 Immersive Sci-Fi Chapters with Algorithmic Puzzles, Test Cases & Multi-Language Starters
 */

export const CONTEST_STORY_PROLOGUE = {
  title: "Operation Citadel: The Quantum Core Awakening",
  subtitle: "CodeLand Annual Championship Edition #42",
  lore: `Deep beneath CodeLand Academy, the ancient Quantum Mainframe has begun to destabilize. An unknown cryptographic surge has locked the 6 security containment sectors. As an elite CodeLand gladiator, you have been summoned to infiltrate the system, solve the algorithmic locks within each sector, and prevent total core meltdown before the timer expires. Speed and precision are critical—every failed submission costs precious energy!`,
};

export const CONTEST_CHAPTERS = [
  {
    id: "chapter-1",
    chapterNumber: 1,
    title: "The Perimeter Firewall",
    arabicTitle: "جدار الحماية المحيطي",
    difficulty: "Easy",
    difficultyColor: "#34d399",
    basePoints: 150,
    promoVideo: "/videos/chapter-1-promo.mp4",
    timeTargetSeconds: 180, // 3 minutes for max speed bonus
    lore: `You arrive at the outer perimeter of Sector Alpha. The gateway firewall is flooded with noisy network packets. To bypass the sentinel, you must filter out the corrupt packets and return only the valid harmonic packet IDs that are divisible by 3 or 7, but not both.`,
    taskDescription: `Given an array of integer packet IDs, return a new array containing only the IDs that are divisible by 3 or 7, but NOT divisible by both (exclusive OR). The returned array should maintain the original relative order.`,
    constraints: [
      "1 <= packetIds.length <= 1000",
      "-10^5 <= packetIds[i] <= 10^5",
    ],
    sampleTests: [
      {
        input: [3, 7, 21, 9, 14, 28, 42, 5],
        expected: [3, 7, 9, 14, 28],
        explanation: "21 and 42 are divisible by BOTH 3 and 7, so they are excluded. 5 is divisible by neither.",
      },
      {
        input: [1, 2, 4, 8],
        expected: [],
        explanation: "None are divisible by 3 or 7.",
      },
      {
        input: [6, 35, 14, 63],
        expected: [6, 35, 14],
        explanation: "63 is divisible by both (3 * 21 = 63, 7 * 9 = 63), so it is excluded.",
      },
    ],
    hiddenTests: [
      { input: [12, 14, 21, 27, 49, 84], expected: [12, 14, 27, 49] },
      { input: [7, 14, 21, 28, 35], expected: [7, 14, 28, 35] },
      { input: [-3, -7, -21, 0, 15], expected: [-3, -7, 15] },
    ],
    starterCode: {
      javascript: `// Chapter 1: The Perimeter Firewall
// Return an array of numbers divisible by 3 OR 7, but NOT both.
function filterPackets(packetIds) {
  // Your code here
  return packetIds.filter(id => {
    const div3 = id % 3 === 0;
    const div7 = id % 7 === 0;
    return (div3 || div7) && !(div3 && div7);
  });
}`,
      python: `# Chapter 1: The Perimeter Firewall
def filter_packets(packet_ids):
    # Your code here
    result = []
    for x in packet_ids:
        div3 = x % 3 == 0
        div7 = x % 7 == 0
        if (div3 or div7) and not (div3 and div7):
            result.append(x)
    return result`,
      cpp: `// Chapter 1: The Perimeter Firewall
#include <vector>

std::vector<int> filterPackets(const std::vector<int>& packetIds) {
    std::vector<int> result;
    for (int id : packetIds) {
        bool div3 = (id % 3 == 0);
        bool div7 = (id % 7 == 0);
        if ((div3 || div7) && !(div3 && div7)) {
            result.push_back(id);
        }
    }
    return result;
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        { in: [3, 7, 21, 9, 14, 28, 42, 5], out: [3, 7, 9, 14, 28] },
        { in: [1, 2, 4, 8], out: [] },
        { in: [6, 35, 14, 63], out: [6, 35, 14] },
        { in: [12, 14, 21, 27, 49, 84], out: [12, 14, 27, 49] },
      ];
      for (const t of tests) {
        const res = fn([...t.in]);
        if (JSON.stringify(res) !== JSON.stringify(t.out)) {
          return { pass: false, error: `Failed for input [${t.in}]. Expected [${t.out}], got [${res}]` };
        }
      }
      return { pass: true };
    },
  },

  {
    id: "chapter-2",
    chapterNumber: 2,
    title: "The Cryptographic Beacon",
    arabicTitle: "منارة التشفير النبضية",
    difficulty: "Easy-Medium",
    difficultyColor: "#38bdf8",
    basePoints: 200,
    timeTargetSeconds: 240, // 4 minutes
    lore: `The perimeter breached, you enter the Communications Array. The beacon is sending scrambled alphanumeric distress signals compressed with Run-Length Encoding. You must decompress the stream and determine if the resulting sequence is a valid symmetrical palindrome key.`,
    taskDescription: `You are given a compressed string of characters and counts (e.g. "a3b2a3" expands to "aaabbaaa"). 
1. Decompress the string where each letter is followed by its repeat count.
2. Return true if the decompressed string is a palindrome (reads the same forwards and backwards), otherwise return false.`,
    constraints: [
      "Compressed string format: alternating [letter][single or multi-digit integer]",
      "Total decompressed length <= 10^5",
      "Only lowercase English letters",
    ],
    sampleTests: [
      {
        input: "a3b2a3",
        expected: true,
        explanation: '"a3b2a3" decompresses to "aaabbaaa", which is a palindrome.',
      },
      {
        input: "c2a1b1a1c2",
        expected: true,
        explanation: '"c2a1b1a1c2" decompresses to "ccaabacc" -> palindrome.',
      },
      {
        input: "a2b3",
        expected: false,
        explanation: '"a2b3" decompresses to "aabbb", which is not a palindrome.',
      },
    ],
    starterCode: {
      javascript: `// Chapter 2: The Cryptographic Beacon
// Decompress run-length string (e.g. "a3b2a3") and check if it is a palindrome.
function isBeaconSymmetric(compressed) {
  // Your code here
  let decompressed = "";
  const regex = /([a-z])(\\d+)/g;
  let match;
  while ((match = regex.exec(compressed)) !== null) {
    decompressed += match[1].repeat(Number(match[2]));
  }
  const rev = decompressed.split("").reverse().join("");
  return decompressed === rev;
}`,
      python: `# Chapter 2: The Cryptographic Beacon
import re

def is_beacon_symmetric(compressed: str) -> bool:
    # Your code here
    decompressed = ""
    for char, count in re.findall(r'([a-z])(\\d+)', compressed):
        decompressed += char * int(count)
    return decompressed == decompressed[::-1]`,
      cpp: `// Chapter 2: The Cryptographic Beacon
#include <string>
#include <algorithm>

bool isBeaconSymmetric(const std::string& compressed) {
    std::string decompressed = "";
    int i = 0;
    while (i < compressed.length()) {
        char ch = compressed[i++];
        int count = 0;
        while (i < compressed.length() && isdigit(compressed[i])) {
            count = count * 10 + (compressed[i++] - '0');
        }
        decompressed.append(count, ch);
    }
    std::string rev = decompressed;
    std::reverse(rev.begin(), rev.end());
    return decompressed == rev;
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        { in: "a3b2a3", out: true },
        { in: "c2a1b1a1c2", out: true },
        { in: "a2b3", out: false },
        { in: "x5", out: true },
        { in: "a1b2c3", out: false },
      ];
      for (const t of tests) {
        const res = fn(t.in);
        if (res !== t.out) {
          return { pass: false, error: `Failed for input "${t.in}". Expected ${t.out}, got ${res}` };
        }
      }
      return { pass: true };
    },
  },

  {
    id: "chapter-3",
    chapterNumber: 3,
    title: "Energy Conduit Surge",
    arabicTitle: "موازنة تدفق الطاقة",
    difficulty: "Medium",
    difficultyColor: "#fbbf24",
    basePoints: 250,
    timeTargetSeconds: 300, // 5 minutes
    lore: `Sector Gamma houses the cooling and power conduits. Plasma relays are experiencing violent fluctuations with positive and negative energy deltas. To prevent catastrophic rupture, you must find the contiguous sub-segment of energy nodes that yields the maximum stable net power.`,
    taskDescription: `Given an array of integer energy readings (positive and negative), find the contiguous subarray (containing at least one number) which has the largest sum and return its sum (Kadane's maximum subarray problem).`,
    constraints: [
      "1 <= readings.length <= 10^5",
      "-10^4 <= readings[i] <= 10^4",
    ],
    sampleTests: [
      {
        input: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
        expected: 6,
        explanation: "Subarray [4, -1, 2, 1] has the largest sum = 6.",
      },
      {
        input: [1],
        expected: 1,
        explanation: "Single element array has max sum = 1.",
      },
      {
        input: [5, 4, -1, 7, 8],
        expected: 23,
        explanation: "The entire array has the max sum = 23.",
      },
    ],
    starterCode: {
      javascript: `// Chapter 3: Energy Conduit Surge
// Find maximum contiguous subarray sum
function maxEnergySurge(readings) {
  // Your code here
  let currentMax = readings[0];
  let globalMax = readings[0];
  for (let i = 1; i < readings.length; i++) {
    currentMax = Math.max(readings[i], currentMax + readings[i]);
    globalMax = Math.max(globalMax, currentMax);
  }
  return globalMax;
}`,
      python: `# Chapter 3: Energy Conduit Surge
def max_energy_surge(readings):
    # Your code here
    cur_max = readings[0]
    global_max = readings[0]
    for x in readings[1:]:
        cur_max = max(x, cur_max + x)
        global_max = max(global_max, cur_max)
    return global_max`,
      cpp: `// Chapter 3: Energy Conduit Surge
#include <vector>
#include <algorithm>

long long maxEnergySurge(const std::vector<int>& readings) {
    long long curMax = readings[0];
    long long globalMax = readings[0];
    for (size_t i = 1; i < readings.size(); ++i) {
        curMax = std::max((long long)readings[i], curMax + readings[i]);
        globalMax = std::max(globalMax, curMax);
    }
    return globalMax;
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        { in: [-2, 1, -3, 4, -1, 2, 1, -5, 4], out: 6 },
        { in: [1], out: 1 },
        { in: [5, 4, -1, 7, 8], out: 23 },
        { in: [-5, -2, -9, -1], out: -1 },
      ];
      for (const t of tests) {
        const res = fn([...t.in]);
        if (res !== t.out) {
          return { pass: false, error: `Failed for input [${t.in}]. Expected ${t.out}, got ${res}` };
        }
      }
      return { pass: true };
    },
  },

  {
    id: "chapter-4",
    chapterNumber: 4,
    title: "The Cyber Labyrinth Traversal",
    arabicTitle: "متاهة المسارات الكمومية",
    difficulty: "Medium-Hard",
    difficultyColor: "#f97316",
    basePoints: 300,
    timeTargetSeconds: 360, // 6 minutes
    lore: `In Sector Delta, you encounter a corrupted grid matrix. Hostile defense bots have locked down security sectors (marked as 1). You start at the top-left coordinate (0, 0) and must determine the minimum number of steps to reach the bottom-right terminal (N-1, M-1) moving only Up, Down, Left, or Right.`,
    taskDescription: `Given an N x M binary grid where 0 represents open space and 1 represents an impassable firewall, return the minimum number of steps from (0, 0) to (N-1, M-1). If no path exists, return -1. You can move up, down, left, right.`,
    constraints: [
      "1 <= N, M <= 100",
      "grid[0][0] == 0, grid[N-1][M-1] == 0",
    ],
    sampleTests: [
      {
        input: [
          [0, 0, 0],
          [1, 1, 0],
          [0, 0, 0],
        ],
        expected: 4,
        explanation: "Path: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2) takes 4 steps.",
      },
      {
        input: [
          [0, 1],
          [1, 0],
        ],
        expected: -1,
        explanation: "All paths are blocked by 1s.",
      },
    ],
    starterCode: {
      javascript: `// Chapter 4: The Cyber Labyrinth Traversal
// Find shortest path in 2D binary grid (BFS)
function shortestGridPath(grid) {
  const n = grid.length;
  const m = grid[0].length;
  if (grid[0][0] === 1 || grid[n - 1][m - 1] === 1) return -1;
  if (n === 1 && m === 1) return 0;

  const queue = [[0, 0, 0]]; // row, col, dist
  const visited = Array.from({ length: n }, () => Array(m).fill(false));
  visited[0][0] = true;

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.length > 0) {
    const [r, c, d] = queue.shift();
    if (r === n - 1 && c === m - 1) return d;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc] && grid[nr][nc] === 0) {
        visited[nr][nc] = true;
        queue.push([nr, nc, d + 1]);
      }
    }
  }

  return -1;
}`,
      python: `# Chapter 4: The Cyber Labyrinth Traversal
from collections import deque

def shortest_grid_path(grid):
    n, m = len(grid), len(grid[0])
    if grid[0][0] == 1 or grid[n-1][m-1] == 1:
        return -1
    if n == 1 and m == 1:
        return 0
    
    queue = deque([(0, 0, 0)])
    visited = {(0, 0)}
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    
    while queue:
        r, c, d = queue.popleft()
        if r == n - 1 and c == m - 1:
            return d
        for dr, dc in dirs:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < m and (nr, nc) not in visited and grid[nr][nc] == 0:
                visited.add((nr, nc))
                queue.append((nr, nc, d + 1))
    return -1`,
      cpp: `// Chapter 4: The Cyber Labyrinth Traversal
#include <vector>
#include <queue>
#include <tuple>

int shortestGridPath(const std::vector<std::vector<int>>& grid) {
    int n = grid.size();
    int m = grid[0].size();
    if (grid[0][0] == 1 || grid[n-1][m-1] == 1) return -1;
    if (n == 1 && m == 1) return 0;
    
    std::queue<std::tuple<int, int, int>> q;
    q.push({0, 0, 0});
    std::vector<std::vector<bool>> vis(n, std::vector<bool>(m, false));
    vis[0][0] = true;
    
    int dr[] = {0, 1, 0, -1};
    int dc[] = {1, 0, -1, 0};
    
    while (!q.empty()) {
        auto [r, c, d] = q.front();
        q.pop();
        if (r == n - 1 && c == m - 1) return d;
        for (int i = 0; i < 4; ++i) {
            int nr = r + dr[i];
            int nc = c + dc[i];
            if (nr >= 0 && nr < n && nc >= 0 && nc < m && !vis[nr][nc] && grid[nr][nc] == 0) {
                vis[nr][nc] = true;
                q.push({nr, nc, d + 1});
            }
        }
    }
    return -1;
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        {
          in: [
            [0, 0, 0],
            [1, 1, 0],
            [0, 0, 0],
          ],
          out: 4,
        },
        {
          in: [
            [0, 1],
            [1, 0],
          ],
          out: -1,
        },
        {
          in: [
            [0, 0, 1, 0],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
          ],
          out: 6,
        },
      ];
      for (const t of tests) {
        const res = fn(t.in);
        if (res !== t.out) {
          return { pass: false, error: `Labyrinth traversal failed. Expected ${t.out}, got ${res}` };
        }
      }
      return { pass: true };
    },
  },

  {
    id: "chapter-5",
    chapterNumber: 5,
    title: "Quantum Fuel Resonance",
    arabicTitle: "توزيع وقود المفاعل الديناميكي",
    difficulty: "Hard",
    difficultyColor: "#c084fc",
    basePoints: 350,
    timeTargetSeconds: 420, // 7 minutes
    lore: `Sector Epsilon powers the central containment field. The coolant injectors require exact target capacitance to prevent meltdown. You have an inventory of distinct quantum power cells with varying infinite supply. Determine the minimum number of cells required to formulate the exact target resonance.`,
    taskDescription: `Given an array of integers representing cell values and an integer target, return the fewest number of cells needed to make up that target amount. If that target cannot be made up by any combination of the cells, return -1. (Coin Change Dynamic Programming problem).`,
    constraints: [
      "1 <= cells.length <= 15",
      "1 <= cells[i] <= 10^4",
      "0 <= target <= 10^4",
    ],
    sampleTests: [
      {
        input: { cells: [1, 2, 5], target: 11 },
        expected: 3,
        explanation: "11 = 5 + 5 + 1 (3 cells).",
      },
      {
        input: { cells: [2], target: 3 },
        expected: -1,
        explanation: "Cannot make target 3 using only 2s.",
      },
      {
        input: { cells: [1], target: 0 },
        expected: 0,
        explanation: "Target 0 requires 0 cells.",
      },
    ],
    starterCode: {
      javascript: `// Chapter 5: Quantum Fuel Resonance
// Find minimum number of cells to reach target
function minQuantumCells(cells, target) {
  const dp = Array(target + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= target; i++) {
    for (const cell of cells) {
      if (i - cell >= 0) {
        dp[i] = Math.min(dp[i], dp[i - cell] + 1);
      }
    }
  }

  return dp[target] === Infinity ? -1 : dp[target];
}`,
      python: `# Chapter 5: Quantum Fuel Resonance
def min_quantum_cells(cells, target):
    dp = [float('inf')] * (target + 1)
    dp[0] = 0
    for i in range(1, target + 1):
        for c in cells:
            if i - c >= 0:
                dp[i] = min(dp[i], dp[i - c] + 1)
    return dp[target] if dp[target] != float('inf') else -1`,
      cpp: `// Chapter 5: Quantum Fuel Resonance
#include <vector>
#include <algorithm>

int minQuantumCells(const std::vector<int>& cells, int target) {
    std::vector<int> dp(target + 1, 1e9);
    dp[0] = 0;
    for (int i = 1; i <= target; ++i) {
        for (int c : cells) {
            if (i - c >= 0) {
                dp[i] = std::min(dp[i], dp[i - c] + 1);
            }
        }
    }
    return dp[target] >= 1e9 ? -1 : dp[target];
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        { in: { cells: [1, 2, 5], target: 11 }, out: 3 },
        { in: { cells: [2], target: 3 }, out: -1 },
        { in: { cells: [1], target: 0 }, out: 0 },
        { in: { cells: [2, 5, 10, 1], target: 27 }, out: 4 }, // 10 + 10 + 5 + 2
      ];
      for (const t of tests) {
        const res = fn(t.in.cells, t.in.target);
        if (res !== t.out) {
          return { pass: false, error: `Failed for cells ${JSON.stringify(t.in.cells)}, target ${t.in.target}. Expected ${t.out}, got ${res}` };
        }
      }
      return { pass: true };
    },
  },

  {
    id: "chapter-6",
    chapterNumber: 6,
    title: "The Overdrive Synchronization",
    arabicTitle: "المعركة النهائية: مزامنة النواة",
    difficulty: "Master / Boss",
    difficultyColor: "#f43f5e",
    basePoints: 450,
    timeTargetSeconds: 480, // 8 minutes
    lore: `THE FINAL BATTLE! You have reached the core chamber of the Citadel. The rogue AI sentinel is bombarding the buffer with alternating quantum brackets '(' and ')'. To initiate the core reboot sequence and secure victory, you must calculate the length of the LONGEST valid (well-formed) balanced bracket wave substring!`,
    taskDescription: `Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring. (Longest Valid Parentheses problem).`,
    constraints: [
      "0 <= s.length <= 3 * 10^4",
      "s[i] is '(' or ')'",
    ],
    sampleTests: [
      {
        input: "(()",
        expected: 2,
        explanation: 'The longest valid parentheses substring is "()", which has length = 2.',
      },
      {
        input: ")()())",
        expected: 4,
        explanation: 'The longest valid parentheses substring is "()()", which has length = 4.',
      },
      {
        input: "",
        expected: 0,
        explanation: "Empty string has length 0.",
      },
    ],
    starterCode: {
      javascript: `// Chapter 6: The Overdrive Synchronization
// Find the length of the longest valid parentheses substring
function longestValidParentheses(s) {
  let maxLen = 0;
  const stack = [-1];

  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }

  return maxLen;
}`,
      python: `# Chapter 6: The Overdrive Synchronization
def longest_valid_parentheses(s: str) -> int:
    max_len = 0
    stack = [-1]
    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                max_len = max(max_len, i - stack[-1])
    return max_len`,
      cpp: `// Chapter 6: The Overdrive Synchronization
#include <string>
#include <stack>
#include <algorithm>

int longestValidParentheses(const std::string& s) {
    int maxLen = 0;
    std::stack<int> st;
    st.push(-1);
    for (int i = 0; i < s.length(); ++i) {
        if (s[i] == '(') {
            st.push(i);
        } else {
            st.pop();
            if (st.empty()) {
                st.push(i);
            } else {
                maxLen = std::max(maxLen, i - st.top());
            }
        }
    }
    return maxLen;
}`,
    },
    validatorFn: (fn) => {
      const tests = [
        { in: "(()", out: 2 },
        { in: ")()())", out: 4 },
        { in: "", out: 0 },
        { in: "()(()))))", out: 4 },
        { in: "()(())", out: 6 },
      ];
      for (const t of tests) {
        const res = fn(t.in);
        if (res !== t.out) {
          return { pass: false, error: `Boss challenge failed for "${t.in}". Expected ${t.out}, got ${res}` };
        }
      }
      return { pass: true };
    },
  },
];
