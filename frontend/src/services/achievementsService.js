import { apiRequest } from "./api";

/**
 * Retrieves all available badges across CodeLand.
 * GET /achievements
 */
export async function fetchAllAchievements() {
  return await apiRequest("/achievements", {
    method: "GET",
  });
}

/**
 * Retrieves earned badges for the authenticated student.
 * GET /achievements/me
 */
export async function fetchMyAchievements() {
  const token = localStorage.getItem("codeland_token");
  if (!token) {
    return [];
  }

  return await apiRequest("/achievements/me", {
    method: "GET",
  });
}
