import { apiRequest } from "./api";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true";

const MOCK_USERS_KEY = "codeland_mock_users";

/* ====================================================== */
/* LOGIN */
/* ====================================================== */

export async function loginUser(credentials) {
  if (USE_MOCK_API) {
    return mockLogin(credentials);
  }

  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

/* ====================================================== */
/* REGISTER PARENT */
/* ====================================================== */

export async function registerParent(parentData) {
  if (USE_MOCK_API) {
    return mockRegisterParent(parentData);
  }

  return apiRequest("/auth/register/parent", {
    method: "POST",
    body: JSON.stringify(parentData),
  });
}

/* ====================================================== */
/* VERIFY PARENT CODE */
/* ====================================================== */

export async function verifyParentCode(code) {
  if (USE_MOCK_API) {
    return mockVerifyParentCode(code);
  }

  return apiRequest("/auth/verify-parent-code", {
    method: "POST",

    body: JSON.stringify({
      code,
    }),
  });
}

/* ====================================================== */
/* REGISTER STUDENT */
/* ====================================================== */

export async function registerStudent(studentData) {
  if (USE_MOCK_API) {
    return mockRegisterStudent(studentData);
  }

  return apiRequest("/auth/register/student", {
    method: "POST",
    body: JSON.stringify(studentData),
  });
}

/* ====================================================== */
/* MOCK DELAY */
/* ====================================================== */

function delay(ms = 700) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* ====================================================== */
/* MOCK STORAGE */
/* ====================================================== */

function getMockUsers() {
  try {
    const storedUsers = localStorage.getItem(MOCK_USERS_KEY);

    if (!storedUsers) {
      return [];
    }

    const users = JSON.parse(storedUsers);

    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

/* ====================================================== */
/* HELPERS */
/* ====================================================== */

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeCode(code) {
  return code.trim().toUpperCase();
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateParentCode() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i += 1) {
    const randomIndex = Math.floor(Math.random() * characters.length);

    code += characters[randomIndex];
  }

  return `CL-${code}`;
}

/* ====================================================== */
/* PUBLIC USER */
/* ====================================================== */

function sanitizeUser(user) {
  if (!user) return null;

  const { password, ...safeUser } = user;

  return safeUser;
}

/* ====================================================== */
/* MOCK LOGIN */
/* ====================================================== */

async function mockLogin({ email, password }) {
  await delay(700);

  if (!email?.trim() || !password) {
    throw new Error("Email and password are required.");
  }

  const normalizedEmail = normalizeEmail(email);

  const users = getMockUsers();

  const user = users.find(
    (item) => normalizeEmail(item.email) === normalizedEmail,
  );

  if (!user) {
    throw new Error("Account not found. Please create an account first.");
  }

  if (user.password !== password) {
    throw new Error("Incorrect email or password.");
  }

  return {
    message: "Logged in successfully.",

    user: sanitizeUser(user),
  };
}

/* ====================================================== */
/* MOCK REGISTER PARENT */
/* ====================================================== */

async function mockRegisterParent({ fullName, email, password }) {
  await delay();

  if (!fullName?.trim() || !email?.trim() || !password) {
    throw new Error("All fields are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const normalizedEmail = normalizeEmail(email);

  const users = getMockUsers();

  const emailExists = users.some(
    (user) => normalizeEmail(user.email) === normalizedEmail,
  );

  if (emailExists) {
    throw new Error("An account with this email already exists.");
  }

  let inviteCode = generateParentCode();

  /*
    Make sure the generated code
    is not already being used.
  */

  while (users.some((user) => user.inviteCode === inviteCode)) {
    inviteCode = generateParentCode();
  }

  const user = {
    id: generateId(),

    fullName: fullName.trim(),

    email: normalizedEmail,

    password,

    role: "parent",

    inviteCode,

    createdAt: new Date().toISOString(),
  };

  users.push(user);

  saveMockUsers(users);

  return {
    message: "Parent account created successfully.",

    user: sanitizeUser(user),

    inviteCode,
  };
}

/* ====================================================== */
/* MOCK VERIFY PARENT CODE */
/* ====================================================== */

async function mockVerifyParentCode(code) {
  await delay();

  if (!code?.trim()) {
    throw new Error("Please enter your parent code.");
  }

  const normalizedCode = normalizeCode(code);

  const users = getMockUsers();

  const parent = users.find(
    (user) => user.role === "parent" && user.inviteCode === normalizedCode,
  );

  /*
    Temporary fallback code.

    This keeps CL-1234 available
    while developing the frontend.

    Later, when the backend is ready,
    this disappears automatically
    because the real API will be used.
  */

  if (!parent && normalizedCode !== "CL-1234") {
    throw new Error(
      "Invalid parent code. Please check the code and try again.",
    );
  }

  return {
    valid: true,

    code: normalizedCode,

    parent: parent
      ? {
          id: parent.id,
          fullName: parent.fullName,
          email: parent.email,
        }
      : {
          id: "mock-parent-1",
          fullName: "CodeLand Parent",
        },
  };
}

/* ====================================================== */
/* MOCK REGISTER STUDENT */
/* ====================================================== */

async function mockRegisterStudent({ parentCode, email, password }) {
  await delay();

  if (!parentCode?.trim() || !email?.trim() || !password) {
    throw new Error("All fields are required.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const normalizedEmail = normalizeEmail(email);

  const normalizedParentCode = normalizeCode(parentCode);

  const users = getMockUsers();

  /* ==================================================== */
  /* CHECK EMAIL */
  /* ==================================================== */

  const emailExists = users.some(
    (user) => normalizeEmail(user.email) === normalizedEmail,
  );

  if (emailExists) {
    throw new Error("An account with this email already exists.");
  }

  /* ==================================================== */
  /* FIND PARENT */
  /* ==================================================== */

  const parent = users.find(
    (user) =>
      user.role === "parent" && user.inviteCode === normalizedParentCode,
  );

  const isTemporaryCode = normalizedParentCode === "CL-1234";

  if (!parent && !isTemporaryCode) {
    throw new Error("Invalid parent code.");
  }

  /* ==================================================== */
  /* CREATE STUDENT */
  /* ==================================================== */

  const user = {
    id: generateId(),

    email: normalizedEmail,

    password,

    role: "student",

    parentId: parent?.id || "mock-parent-1",

    parentCode: normalizedParentCode,

    createdAt: new Date().toISOString(),
  };

  users.push(user);

  saveMockUsers(users);

  return {
    message: "Student account created successfully.",

    user: sanitizeUser(user),
  };
}
