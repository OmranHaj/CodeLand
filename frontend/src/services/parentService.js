import { apiRequest } from "./api";

/**
 * Fetches all real children registered and linked under the authenticated parent account.
 * Endpoint: GET /parent/children
 */
export async function getParentChildren() {
  try {
    const data = await apiRequest("/parent/children", {
      method: "GET",
    });

    return Array.isArray(data?.children) ? data.children : [];
  } catch (error) {
    console.error("Error fetching parent children:", error);
    return [];
  }
}

/**
 * Sends an encouraging cheer message from parent to linked child.
 * Endpoint: POST /parent/cheer
 */
export async function sendParentCheer(childId, message) {
  return await apiRequest("/parent/cheer", {
    method: "POST",
    body: JSON.stringify({ childId, message }),
  });
}

/**
 * Updates weekly study goal hours for a linked child in the database.
 * Endpoint: PATCH /parent/children/:childId/goal
 */
export async function updateChildWeeklyGoal(childId, weeklyGoalHours) {
  return await apiRequest(`/parent/children/${childId}/goal`, {
    method: "PATCH",
    body: JSON.stringify({ weeklyGoalHours }),
  });
}

/**
 * Links a student account to the parent account.
 * Endpoint: POST /parent/link-child
 */
export async function linkChildAccount(studentIdentifier) {
  return await apiRequest("/parent/link-child", {
    method: "POST",
    body: JSON.stringify({ studentIdentifier }),
  });
}
