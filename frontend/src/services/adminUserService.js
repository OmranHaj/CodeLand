import { apiRequest } from "./api.js";

/**
 * Fetches real aggregate statistics for the Admin User Management dashboard.
 */
export async function getAdminUserStats() {
  return apiRequest("/admin/users/stats");
}

/**
 * Fetches paginated, filtered, and searchable user list from the backend.
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.search]
 * @param {string} [params.role]
 * @param {string} [params.status]
 * @param {string} [params.sortBy]
 * @param {string} [params.sortOrder]
 */
export async function getAdminUsers(params = {}) {
  const query = new URLSearchParams();

  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.search && params.search.trim()) query.append("search", params.search.trim());
  if (params.role && params.role !== "ALL") query.append("role", params.role);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortOrder) query.append("sortOrder", params.sortOrder);

  const queryString = query.toString();
  return apiRequest(`/admin/users${queryString ? `?${queryString}` : ""}`);
}

/**
 * Fetches detailed profile, learning progress, family links, and activity for a specific user.
 * @param {string} id
 */
export async function getAdminUserById(id) {
  return apiRequest(`/admin/users/${id}`);
}

/**
 * Suspends or reactivates a user account.
 * @param {string} id
 * @param {Object} payload
 * @param {'ACTIVE'|'SUSPENDED'} payload.status
 * @param {string} [payload.reason]
 */
export async function updateAdminUserStatus(id, payload) {
  return apiRequest(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Changes a user's role (promotes, demotes, or switches between STUDENT/PARENT/SUPER_ADMIN).
 * @param {string} id
 * @param {Object} payload
 * @param {string} payload.role
 */
export async function updateAdminUserRole(id, payload) {
  return apiRequest(`/admin/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves recent administrative audit logs.
 * @param {number} [limit=30]
 */
export async function getAdminAuditLogs(limit = 30) {
  return apiRequest(`/admin/users/audit-logs?limit=${limit}`);
}
