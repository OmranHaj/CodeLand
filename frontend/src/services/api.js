const RAW_API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  "";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

export async function apiRequest(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const token = localStorage.getItem("codeland_token");

  let response;

  try {
    response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      ...options,

      credentials: "include",

      headers: {
        ...(!isFormData && {
          "Content-Type": "application/json",
        }),

        ...(token && {
          Authorization: `Bearer ${token}`,
        }),

        ...options.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the server. Please try again.");
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    let errorMessage = "Something went wrong. Please try again.";

    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(" ");
      } else if (typeof data.message === "string") {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    } else if (typeof data === "string" && data.trim()) {
      errorMessage = data;
    }

    throw new Error(errorMessage);
  }

  return data;
}
