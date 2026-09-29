import { apiRequest } from "./api";

/**
 * Fetches all unread cheer messages for the authenticated student.
 * Endpoint: GET /student/cheers
 */
export async function getStudentCheers() {
  const token = localStorage.getItem("codeland_token");
  if (!token) return [];
  try {
    const data = await apiRequest("/student/cheers", {
      method: "GET",
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn("[CodeLand] Failed to fetch student cheers:", err);
    return [];
  }
}

/**
 * Marks a specific cheer message as read.
 * Endpoint: PATCH /student/cheers/:id/read
 */
export async function markCheerAsRead(cheerId) {
  try {
    return await apiRequest(`/student/cheers/${cheerId}/read`, {
      method: "PATCH",
    });
  } catch (err) {
    console.warn("[CodeLand] Failed to mark cheer as read:", err);
    return null;
  }
}
