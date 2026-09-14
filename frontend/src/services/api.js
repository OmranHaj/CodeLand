const RAW_API_URL = import.meta.env.VITE_API_URL || "";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

export async function apiRequest(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const isFormData = options.body instanceof FormData;

  let response;

  try {
    response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      ...options,

      credentials: "include",

      headers: {
        ...(!isFormData && {
          "Content-Type": "application/json",
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
    const message =
      typeof data === "object" && data !== null
        ? data.message || data.error
        : data;

    throw new Error(message || "Something went wrong. Please try again.");
  }

  return data;
}
