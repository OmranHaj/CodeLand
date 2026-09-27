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
