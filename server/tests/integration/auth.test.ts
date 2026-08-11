import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { buildTestApp, cleanDatabase } from "./helper";
import type { FastifyInstance } from "fastify";

describe("Auth Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildTestApp();
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  test("Test 10 — Register success", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "test10@example.com",
        password: "password123",
        name: "Test User 10",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("test10@example.com");
    expect(body.data.token).toBeDefined();
  });

  test("Test 11 — Duplicate email error", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: "test10@example.com",
        password: "password123",
        name: "Test User Duplicate",
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("USER_ALREADY_EXISTS");
  });

  test("Test 12 — Login success", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test10@example.com",
        password: "password123",
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.token).toBeDefined();
  });

  test("Test 13 — Invalid password", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: {
        email: "test10@example.com",
        password: "wrongpassword",
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("Test 14 — Protected endpoint without JWT", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/orders",
    });

    expect(res.statusCode).toBe(401);
  });
});
