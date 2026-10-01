import { WEB_WORLD_LEVELS_BASE, buildWebWorldLevels, loadWebWorldProgress } from "../data/webWorldLevels.js";
import { CPP_WORLD_LEVELS_BASE, buildCppWorldLevels, loadCppWorldProgress } from "../data/cppWorldLevels.js";

export function readStored(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function writeStored(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("codeland:update"));
}
export function getUser() { return readStored("codeland_current_user"); }
export function getHomeRoute(user = getUser()) {
  if (!user || user.isDemo) {
    return "/";
  }
  const role = (user.role || "").toLowerCase();
  if (role === "admin" || role === "superadmin" || role === "super_admin") {
    return "/admin";
  }
  if (role === "parent") {
    return "/parent/dashboard";
  }
  if (role === "student" || role === "child") {
    return "/student/dashboard";
  }
  return "/";
}
export function userKey(user = getUser()) { return user?.id || user?.email || "guest"; }
export function getProfile(user = getUser()) {
  const stored = readStored(`codeland_profile_${userKey(user)}`, {});
  const fallbackName = user?.fullName || user?.email?.split("@")[0] || "Explorer";
  return { name: typeof stored.name === "string" && stored.name.trim() ? stored.name.trim() : fallbackName, goal: [1, 3, 6].includes(stored.goal) ? stored.goal : 3, reducedMotion: stored.reducedMotion === true };
}
export function startPreview(role = "student") {
  writeStored("codeland_current_user", { id: `preview-${role}`, fullName: role === "parent" ? "Alex Morgan" : "Alex", role, isDemo: true, ...(role === "parent" ? { inviteCode: "DEMO-ONLY" } : {}) });
}
export function getSummary(user = getUser()) {
  const id = userKey(user);
  const web = buildWebWorldLevels(loadWebWorldProgress(id));
  const cpp = buildCppWorldLevels(loadCppWorldProgress(id));
  let lessons = 0, challenges = 0, xp = 0;
  for (const level of [...WEB_WORLD_LEVELS_BASE, ...CPP_WORLD_LEVELS_BASE]) {
    const data = readStored(`codeland_learning_progress_${id}_${level.id}`, {});
    lessons += Array.isArray(data.completedLessonIds) ? new Set(data.completedLessonIds).size : 0;
    challenges += Array.isArray(data.completedChallengeIds) ? new Set(data.completedChallengeIds).size : 0;
    xp += Number.isFinite(Number(data.xp)) ? Math.max(0, Number(data.xp)) : 0;
  }
  const python = readStored(`codeland_python_${id}`, []);
  const pythonIds = Array.isArray(python) ? [...new Set(python)].filter(n => Number.isInteger(n) && n >= 0 && n < 5) : [];
  const practice = readStored(`codeland_practice_${id}`, []);
  const practiceIds = Array.isArray(practice) ? [...new Set(practice)].filter(n => Number.isInteger(n) && n >= 1 && n <= 6) : [];
  lessons += pythonIds.length;
  challenges += practiceIds.length;
  xp += pythonIds.length * 50 + practiceIds.length * 25;
  const average = levels => Math.round(levels.reduce((sum, level) => sum + level.progress, 0) / levels.length);
  return { web, cpp, lessons, challenges, xp, pythonIds, practiceIds, webPercent: average(web), cppPercent: average(cpp), pythonPercent: pythonIds.length * 20, completed: [...web, ...cpp].filter(level => level.status === "completed").length + (pythonIds.length === 5 ? 1 : 0) };
}
export const pathRoute = id => id === "cpp-developer" ? "/student/cpp-world" : id === "python-explorer" ? "/student/python-world" : "/student/world";

export function getParentInviteCode(user = getUser()) {
  if (!user) return null;
  const role = (user.role || "").toLowerCase();
  if (role !== "parent") return null;

  // Real parent code from backend takes absolute priority
  if (user.parentCode && user.parentCode !== "DEMO-ONLY") {
    return user.parentCode;
  }
  if (user.inviteCode && user.inviteCode !== "DEMO-ONLY" && user.inviteCode !== "CL-2026") {
    return user.inviteCode;
  }

  /*
  // Only check mock users if in mock mode
  const isMockMode = import.meta.env.VITE_USE_MOCK_API === "true";
  if (isMockMode) {
    const mockUsers = readStored("codeland_mock_users", []);
    const parentInStore = Array.isArray(mockUsers)
      ? mockUsers.find(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email?.toLowerCase()))
      : null;

    if (parentInStore?.inviteCode) {
      return parentInStore.inviteCode;
    }
  }
  */

  // If demo mode
  if (user.isDemo) {
    return "CL-2026";
  }

  return user.parentCode || user.inviteCode || null;
}

