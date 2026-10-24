import { apiRequest } from "./api";

/**
 * Student: current organization and latest join request.
 * Endpoint: GET /organization/membership
 */
export async function fetchMyOrganization() {
  return apiRequest("/organization/membership", { method: "GET" });
}

/**
 * Student: ask to join the organization that owns `code`.
 * Endpoint: POST /organization/join-requests
 */
export async function requestToJoinOrganization(code) {
  return apiRequest("/organization/join-requests", {
    method: "POST",
    body: JSON.stringify({ code: String(code || "").trim() }),
  });
}

/**
 * Organization: pending join requests from students.
 * Endpoint: GET /organization/join-requests
 */
export async function fetchJoinRequests() {
  return apiRequest("/organization/join-requests", { method: "GET" });
}

/**
 * Organization: accept or reject a join request.
 * Endpoint: POST /organization/join-requests/:id/accept | reject
 */
export async function decideJoinRequest(requestId, accept) {
  return apiRequest(`/organization/join-requests/${requestId}/${accept ? "accept" : "reject"}`, {
    method: "POST",
  });
}
