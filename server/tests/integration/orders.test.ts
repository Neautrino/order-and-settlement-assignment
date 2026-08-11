import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { buildTestApp, cleanDatabase } from "./helper";
import type { FastifyInstance } from "fastify";

describe("Order Integration Tests", () => {
  let app: FastifyInstance;
  let userAToken: string;
  let userBToken: string;
  let userAOrder: any;

  beforeAll(async () => {
    app = await buildTestApp();
    await cleanDatabase();

    // Register User A
    const resA = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "usera@example.com", password: "password123" },
    });
    userAToken = JSON.parse(resA.payload).data.token;

    // Register User B
    const resB = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "userb@example.com", password: "password123" },
    });
    userBToken = JSON.parse(resB.payload).data.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  test("Test 15 — Create order with server-side price calculation", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        customerName: "Test Customer A",
        dueDate: "2026-08-20",
        items: [
          { itemName: "Item A", quantity: 2, unitPrice: 10000 }, // 20000
          { itemName: "Item B", quantity: 1, unitPrice: 5000 },  // 5000
        ],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.totalAmount).toBe(25000);
    expect(body.data.status).toBe("PENDING");
    userAOrder = body.data;
  });

  test("Test 16 — Validation error (empty items / invalid quantity)", async () => {
    const resEmpty = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        customerName: "Test Customer",
        dueDate: "2026-08-20",
        items: [],
      },
    });
    expect(resEmpty.statusCode).toBe(400);

    const resInvalidQty = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        customerName: "Test Customer",
        dueDate: "2026-08-20",
        items: [{ itemName: "Bad Item", quantity: 0, unitPrice: 100 }],
      },
    });
    expect(resInvalidQty.statusCode).toBe(400);
  });

  test("Test 17 — User isolation (User B cannot access User A's order)", async () => {
    const resGet = await app.inject({
      method: "GET",
      url: `/api/orders/${userAOrder.id}`,
      headers: { authorization: `Bearer ${userBToken}` },
    });
    expect(resGet.statusCode).toBe(404);

    const resPatch = await app.inject({
      method: "PATCH",
      url: `/api/orders/${userAOrder.id}`,
      headers: { authorization: `Bearer ${userBToken}` },
      payload: { customerName: "Hacked Customer" },
    });
    expect(resPatch.statusCode).toBe(404);

    const resDelete = await app.inject({
      method: "DELETE",
      url: `/api/orders/${userAOrder.id}`,
      headers: { authorization: `Bearer ${userBToken}` },
    });
    expect(resDelete.statusCode).toBe(404);
  });

  test("Test 18 & 19 — Immutability after payment (Update & Delete Rejection)", async () => {
    // Record payment first
    const payRes = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        orderId: userAOrder.id,
        amount: 5000,
        note: "Initial payment",
      },
    });
    expect(payRes.statusCode).toBe(201);

    // Attempt PATCH
    const patchRes = await app.inject({
      method: "PATCH",
      url: `/api/orders/${userAOrder.id}`,
      headers: { authorization: `Bearer ${userAToken}` },
      payload: { customerName: "Updated Name" },
    });
    expect(patchRes.statusCode).toBe(400);
    expect(JSON.parse(patchRes.payload).error.code).toBe("ORDER_HAS_PAYMENTS");

    // Attempt DELETE
    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/api/orders/${userAOrder.id}`,
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(deleteRes.statusCode).toBe(400);
    expect(JSON.parse(deleteRes.payload).error.code).toBe("ORDER_HAS_PAYMENTS");
  });

  test("Test 20 & 21 — Pagination & Status filtering", async () => {
    // Create 2 more orders for User A
    await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        customerName: "Customer 2",
        dueDate: "2026-08-30",
        items: [{ itemName: "Item X", quantity: 1, unitPrice: 10000 }],
      },
    });

    await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userAToken}` },
      payload: {
        customerName: "Customer 3",
        dueDate: "2026-08-30",
        items: [{ itemName: "Item Y", quantity: 1, unitPrice: 10000 }],
      },
    });

    const resPagination = await app.inject({
      method: "GET",
      url: "/api/orders?page=1&limit=2",
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(resPagination.statusCode).toBe(200);
    const pagBody = JSON.parse(resPagination.payload);
    expect(pagBody.data.length).toBe(2);
    expect(pagBody.meta.hasMore).toBe(true);

    const resFilter = await app.inject({
      method: "GET",
      url: "/api/orders?status=PARTIALLY_PAID",
      headers: { authorization: `Bearer ${userAToken}` },
    });
    expect(resFilter.statusCode).toBe(200);
    const filterBody = JSON.parse(resFilter.payload);
    expect(filterBody.data.every((o: any) => o.status === "PARTIALLY_PAID")).toBe(true);
  });
});
