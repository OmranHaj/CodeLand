import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  getAdminUserStats,
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
  updateAdminUserRole,
  getAdminAuditLogs,
} from "../src/services/adminUserService.js";

const storage = new Map();
const localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};
globalThis.localStorage = localStorage;

let lastFetchCall = null;
globalThis.fetch = async (url, options) => {
  lastFetchCall = { url, options };
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ success: true, url, options }),
  };
};

beforeEach(() => {
  storage.clear();
  lastFetchCall = null;
});

test("getAdminUserStats calls correct endpoint", async () => {
  await getAdminUserStats();
  assert.match(lastFetchCall.url, /\/admin\/users\/stats$/);
});

test("getAdminUsers formats query parameters correctly", async () => {
  await getAdminUsers({
    page: 2,
    limit: 10,
    search: "alex",
    role: "STUDENT",
    status: "ACTIVE",
    sortBy: "totalXp",
    sortOrder: "desc",
  });

  assert.match(lastFetchCall.url, /page=2/);
  assert.match(lastFetchCall.url, /limit=10/);
  assert.match(lastFetchCall.url, /search=alex/);
  assert.match(lastFetchCall.url, /role=STUDENT/);
  assert.match(lastFetchCall.url, /status=ACTIVE/);
  assert.match(lastFetchCall.url, /sortBy=totalXp/);
  assert.match(lastFetchCall.url, /sortOrder=desc/);
});

test("updateAdminUserStatus makes PATCH request with payload", async () => {
  await updateAdminUserStatus("user-123", {
    status: "SUSPENDED",
    reason: "Policy violation",
  });

  assert.match(lastFetchCall.url, /\/admin\/users\/user-123\/status$/);
  assert.equal(lastFetchCall.options.method, "PATCH");
  const body = JSON.parse(lastFetchCall.options.body);
  assert.equal(body.status, "SUSPENDED");
  assert.equal(body.reason, "Policy violation");
});

test("updateAdminUserRole makes PATCH request with role payload", async () => {
  await updateAdminUserRole("user-456", { role: "SUPER_ADMIN" });

  assert.match(lastFetchCall.url, /\/admin\/users\/user-456\/role$/);
  assert.equal(lastFetchCall.options.method, "PATCH");
  const body = JSON.parse(lastFetchCall.options.body);
  assert.equal(body.role, "SUPER_ADMIN");
});
