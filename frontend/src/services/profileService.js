import { apiRequest } from "./api";

/**
 * Fetches the current authenticated user's profile and preferences.
 * Endpoint: GET /profile
 */
export async function getProfile() {
  return await apiRequest("/profile", {
    method: "GET",
  });
}

/**
 * Updates the user's profile and preferences.
 * Endpoint: PUT /profile
 */
export async function updateProfile(data) {
  return await apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
