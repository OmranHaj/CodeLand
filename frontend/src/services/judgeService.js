import { apiRequest } from "./api";

/**
 * 1. POST /judge/run-custom
 * Free console execution with custom stdin input
 * @param {{ code: string, language?: string, customInput?: string }} param0
 */
export async function runCustomCode({ code, language = "cpp", customInput = "" }) {
  return await apiRequest("/judge/run-custom", {
    method: "POST",
    body: JSON.stringify({
      code: String(code || ""),
      language: String(language || "cpp"),
      customInput: String(customInput || ""),
    }),
  });
}

/**
 * 2. POST /judge/run-tests/:challengeId
 * Run code against public sample test cases
 * @param {string} challengeId
 * @param {{ code: string, language?: string }} param1
 */
export async function runChallengeTests(challengeId, { code, language = "cpp" }) {
  return await apiRequest(`/judge/run-tests/${challengeId}`, {
    method: "POST",
    body: JSON.stringify({
      code: String(code || ""),
      language: String(language || "cpp"),
    }),
  });
}

/**
 * 3. POST /judge/submit/:challengeId
 * Submit code against all test cases, grade, record in DB, award XP
 * @param {string} challengeId
 * @param {{ code: string, language?: string }} param1
 */
export async function submitChallengeCode(challengeId, { code, language = "cpp" }) {
  return await apiRequest(`/judge/submit/${challengeId}`, {
    method: "POST",
    body: JSON.stringify({
      code: String(code || ""),
      language: String(language || "cpp"),
    }),
  });
}

/**
 * GET /judge/challenge/:challengeId
 * Fetch challenge configuration and sample test cases
 * @param {string} challengeId
 */
export async function fetchChallengeJudgeData(challengeId) {
  return await apiRequest(`/judge/challenge/${challengeId}`, {
    method: "GET",
  });
}

/**
 * GET /judge/submissions/:challengeId
 * Retrieve user's submission history for a challenge
 * @param {string} challengeId
 */
export async function fetchChallengeSubmissions(challengeId) {
  return await apiRequest(`/judge/submissions/${challengeId}`, {
    method: "GET",
  });
}

/**
 * Helper to detect if C++ source code requires standard input (cin, getline, scanf)
 * @param {string} code
 * @returns {boolean}
 */
export function detectCodeNeedsInput(code = "") {
  if (!code || typeof code !== "string") return false;
  return /\b(std::)?cin\s*>>|\b(std::)?cin\.|\bgetline\s*\(|\bscanf\s*\(|\b(std::)?cin\b/.test(code);
}

/**
 * Validates C++ execution against mission validation criteria
 * @param {string} code
 * @param {string} stdout
 * @param {any[]} validation
 */
export function checkCppValidation(code = "", stdout = "", validation = []) {
  if (!Array.isArray(validation) || validation.length === 0) {
    return { passed: true, reason: "" };
  }

  const cleanStdout = (stdout || "").trim();
  const cleanCode = code || "";

  for (const rule of validation) {
    if (!rule || typeof rule !== "object") continue;
    const type = rule.type;

    if (type === "cppOutputContains") {
      const needle = String(rule.value || rule.content || "");
      if (!cleanStdout.toLowerCase().includes(needle.toLowerCase())) {
        return {
          passed: false,
          reason: `Output must contain: "${needle}"`,
        };
      }
    } else if (type === "cppOutputEquals") {
      const expected = String(rule.value || rule.expected || "").trim();
      if (cleanStdout !== expected) {
        return {
          passed: false,
          reason: `Output must equal: "${expected}" (Got: "${cleanStdout}")`,
        };
      }
    } else if (type === "cppVariableEquals") {
      const varName = rule.variable;
      const expectedVal = rule.value;
      const varRegex = new RegExp(`\\b${varName}\\s*=\\s*['"]?${expectedVal}['"]?`, "i");
      const inOutput = cleanStdout.includes(String(expectedVal));
      const inCode = varRegex.test(cleanCode);
      if (!inCode && !inOutput) {
        return {
          passed: false,
          reason: `Variable "${varName}" should be assigned value ${expectedVal}`,
        };
      }
    } else if (type === "cppHasMainFunction") {
      if (!/int\s+main\s*\(/.test(cleanCode) && !cleanCode.includes("main(")) {
        return { passed: false, reason: "Program must define an int main() function." };
      }
    } else if (type === "cppHasIostreamInclude") {
      if (!cleanCode.includes("<iostream>")) {
        return { passed: false, reason: "Program must include <iostream>." };
      }
    } else if (type === "cppHasComment") {
      if (!cleanCode.includes("//") && !cleanCode.includes("/*")) {
        return { passed: false, reason: "Code should include a comment." };
      }
    } else if (type === "cppStatementTerminators") {
      if (!cleanCode.includes(";")) {
        return { passed: false, reason: "Missing semicolons (;) on statements." };
      }
    } else if (type === "cppUsesPushBack") {
      if (!cleanCode.includes(".push_back(")) {
        return { passed: false, reason: "Code should use .push_back() method." };
      }
    } else if (type === "cppUsesSize") {
      if (!cleanCode.includes(".size()")) {
        return { passed: false, reason: "Code should use .size() method." };
      }
    } else if (type === "cppVectorExists" || type === "cppHasVector") {
      if (!cleanCode.includes("vector<")) {
        return { passed: false, reason: "Code should use std::vector." };
      }
    } else if (type === "cppMapExists" || type === "cppHasMap") {
      if (!cleanCode.includes("map<")) {
        return { passed: false, reason: "Code should use std::map." };
      }
    } else if (type === "cppQueueExists" || type === "cppHasQueue") {
      if (!cleanCode.includes("queue<")) {
        return { passed: false, reason: "Code should use std::queue." };
      }
    } else if (type === "cppClassExists") {
      if (!cleanCode.includes("class ")) {
        return { passed: false, reason: "Code should define a class." };
      }
    } else if (rule.expectedOutput) {
      if (!cleanStdout.includes(String(rule.expectedOutput))) {
        return {
          passed: false,
          reason: `Output must contain: "${rule.expectedOutput}"`,
        };
      }
    }
  }

  return { passed: true, reason: "" };
}

/**
 * Pure C++ execution runner (Run mode - no validation, no mission check)
 * @param {{ code: string, customInput?: string }} param0
 */
export async function runCppExecution({ code, customInput = "" }) {
  try {
    const result = await runCustomCode({ code, language: "cpp", customInput });
    const isSuccess = result.status === "SUCCESS";
    const outputLines = result.stdout ? result.stdout.trim().split("\n") : [];

    return {
      connected: true,
      success: isSuccess,
      status: result.status,
      output: outputLines,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compileError: result.compileError || null,
      executionTime: result.executionTime || null,
      error:
        result.compileError ||
        (result.status !== "SUCCESS" ? result.stderr : null),
      message: isSuccess
        ? (result.executionTime ? `Execution finished in ${result.executionTime}` : "Execution finished successfully")
        : result.status === "COMPILATION_ERROR"
          ? (result.compileError || "Compilation error.")
          : result.status === "TIME_LIMIT_EXCEEDED"
            ? "Time limit exceeded (2.0s)."
            : (result.stderr || "Runtime error occurred."),
    };
  } catch (err) {
    return {
      connected: false,
      success: false,
      status: "OFFLINE",
      output: [],
      error: err?.message || "Compiler unreachable",
      message: err?.message || "Unable to reach the compiler service.",
    };
  }
}

/**
 * Backward compatibility alias for runCppExecution
 */
export async function runCppCodeShared({ code, customInput = "" }) {
  return await runCppExecution({ code, customInput });
}



