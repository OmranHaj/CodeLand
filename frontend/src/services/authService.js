import { apiRequest } from "./api";

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API === "true";

export async function loginUser(credentials) {
  if (USE_MOCK_API) {
    return mockLogin(credentials);
  }

  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

async function mockLogin({ email, password }) {
  await new Promise((resolve) => {
    setTimeout(resolve, 800);
  });

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  return {
    user: {
      id: 1,
      name: "CodeLand Student",
      email,
    },
  };
}