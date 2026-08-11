import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { buildTestApp, cleanDatabase } from "./helper";
import type { FastifyInstance } from "fastify";
import { prisma } from "../../src/lib/prisma";

describe("Payments Integration Tests (Invariants & Concurrency)", () => {
  let app: FastifyInstance;
  let userToken: string;

  beforeAll(async () => {
    app = await buildTestApp();
    await cleanDatabase();

    const res = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email: "paymentuser@example.com", password: "password123" },
    });
    userToken = JSON.parse(res.payload).data.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  test("Test 22 — Partial & exact payment flow", async () => {
    // 1. Create order for $100 (10,000 cents)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        customerName: "Payment Flow Customer",
        dueDate: "2026-08-30",
        items: [{ itemName: "Item 1", quantity: 1, unitPrice: 10000 }],
      },
    });
    const orderId = JSON.parse(createRes.payload).data.id;

    // 2. Pay $40 (4,000 cents) -> PARTIALLY_PAID
    const pay1 = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 4000, note: "Partial pay" },
    });
    expect(pay1.statusCode).toBe(201);
    expect(JSON.parse(pay1.payload).data.orderStatus).toBe("PARTIALLY_PAID");

    // 3. Pay remaining $60 (6,000 cents) -> PAID
    const pay2 = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 6000, note: "Final pay" },
    });
    expect(pay2.statusCode).toBe(201);
    expect(JSON.parse(pay2.payload).data.orderStatus).toBe("PAID");
  });

  test("Test 23 — Multiple payments accumulation", async () => {
    // Create order for $100 (10,000 cents)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        customerName: "Multi Payment Customer",
        dueDate: "2026-08-30",
        items: [{ itemName: "Item 1", quantity: 1, unitPrice: 10000 }],
      },
    });
    const orderId = JSON.parse(createRes.payload).data.id;

    await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 3000 },
    });
    await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 2000 },
    });
    await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 5000 },
    });

    const getRes = await app.inject({
      method: "GET",
      url: `/api/orders/${orderId}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    const body = JSON.parse(getRes.payload).data;
    expect(body.totalPaid).toBe(10000);
    expect(body.payments.length).toBe(3);
    expect(body.status).toBe("PAID");
  });

  test("Test 24 — Overpayment rejection & DB state preservation", async () => {
    // Create order for $100 (10,000 cents)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        customerName: "Overpay Customer",
        dueDate: "2026-08-30",
        items: [{ itemName: "Item 1", quantity: 1, unitPrice: 10000 }],
      },
    });
    const orderId = JSON.parse(createRes.payload).data.id;

    // Pay $70
    await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 7000 },
    });

    // Attempt to pay $31 (3,100 cents) -> Exceeds remaining $30 (3,000 cents)
    const overpayRes = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId, amount: 3100 },
    });

    expect(overpayRes.statusCode).toBe(400);
    expect(JSON.parse(overpayRes.payload).error.code).toBe("PAYMENT_EXCEEDS_BALANCE");

    // Verify DB state did not change
    const getRes = await app.inject({
      method: "GET",
      url: `/api/orders/${orderId}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    const body = JSON.parse(getRes.payload).data;
    expect(body.totalPaid).toBe(7000);
    expect(body.payments.length).toBe(1);
  });

  test("Test 25 — Overdue partial payment status (retains OVERDUE)", async () => {
    const pastDate = new Date();
    pastDate.setUTCDate(pastDate.getUTCDate() - 5);

    const user = await prisma.user.findFirst({ where: { email: "paymentuser@example.com" } });
    const order = await prisma.order.create({
      data: {
        userId: user!.id,
        customerName: "Overdue Partial Customer",
        dueDate: pastDate,
        totalAmount: 10000n,
        status: "OVERDUE",
        items: {
          create: [{ itemName: "Item 1", quantity: 1, unitPrice: 10000n }],
        },
      },
    });

    // Pay $40 on overdue order
    const payRes = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId: order.id, amount: 4000 },
    });

    expect(payRes.statusCode).toBe(201);
    expect(JSON.parse(payRes.payload).data.orderStatus).toBe("OVERDUE");
  });

  test("Test 26 — Overdue final payment status (changes to PAID)", async () => {
    const pastDate = new Date();
    pastDate.setUTCDate(pastDate.getUTCDate() - 5);

    const user = await prisma.user.findFirst({ where: { email: "paymentuser@example.com" } });
    const order = await prisma.order.create({
      data: {
        userId: user!.id,
        customerName: "Overdue Final Customer",
        dueDate: pastDate,
        totalAmount: 10000n,
        status: "OVERDUE",
        items: {
          create: [{ itemName: "Item 1", quantity: 1, unitPrice: 10000n }],
        },
      },
    });

    // Pay full amount on overdue order
    const payRes = await app.inject({
      method: "POST",
      url: "/api/payments",
      headers: { authorization: `Bearer ${userToken}` },
      payload: { orderId: order.id, amount: 10000 },
    });

    expect(payRes.statusCode).toBe(201);
    expect(JSON.parse(payRes.payload).data.orderStatus).toBe("PAID");
  });

  test("Test 27 — 🔥 Concurrent conflicting payments (Overpayment Protection via Row Locking)", async () => {
    // Create order for $1,000 (100,000 cents)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        customerName: "Concurrent Race Customer",
        dueDate: "2026-08-30",
        items: [{ itemName: "High Value Item", quantity: 1, unitPrice: 100000 }],
      },
    });
    const orderId = JSON.parse(createRes.payload).data.id;

    // Fire Request A ($700 / 70,000 cents) and Request B ($500 / 50,000 cents) simultaneously
    const [resA, resB] = await Promise.all([
      app.inject({
        method: "POST",
        url: "/api/payments",
        headers: { authorization: `Bearer ${userToken}` },
        payload: { orderId, amount: 70000, note: "Request A" },
      }),
      app.inject({
        method: "POST",
        url: "/api/payments",
        headers: { authorization: `Bearer ${userToken}` },
        payload: { orderId, amount: 50000, note: "Request B" },
      }),
    ]);

    const statusCodes = [resA.statusCode, resB.statusCode];

    // Expect exactly ONE 201 (Success) and ONE 400 (Bad Request - Exceeds balance)
    expect(statusCodes).toContain(201);
    expect(statusCodes).toContain(400);

    // Verify DB invariant: Total paid MUST NOT exceed 100,000 cents
    const dbPayments = await prisma.payment.findMany({ where: { orderId } });
    const totalPaid = dbPayments.reduce((sum, p) => sum + p.amount, 0n);

    expect(dbPayments.length).toBe(1);
    expect(totalPaid <= 100000n).toBe(true);
    expect(totalPaid === 70000n || totalPaid === 50000n).toBe(true);
  });

  test("Test 28 — Concurrent valid payments (Both succeed)", async () => {
    // Create order for $1,000 (100,000 cents)
    const createRes = await app.inject({
      method: "POST",
      url: "/api/orders",
      headers: { authorization: `Bearer ${userToken}` },
      payload: {
        customerName: "Concurrent Valid Customer",
        dueDate: "2026-08-30",
        items: [{ itemName: "High Value Item", quantity: 1, unitPrice: 100000 }],
      },
    });
    const orderId = JSON.parse(createRes.payload).data.id;

    // Fire Request A ($600 / 60,000 cents) and Request B ($400 / 40,000 cents) simultaneously
    const [resA, resB] = await Promise.all([
      app.inject({
        method: "POST",
        url: "/api/payments",
        headers: { authorization: `Bearer ${userToken}` },
        payload: { orderId, amount: 60000 },
      }),
      app.inject({
        method: "POST",
        url: "/api/payments",
        headers: { authorization: `Bearer ${userToken}` },
        payload: { orderId, amount: 40000 },
      }),
    ]);

    expect(resA.statusCode).toBe(201);
    expect(resB.statusCode).toBe(201);

    const getRes = await app.inject({
      method: "GET",
      url: `/api/orders/${orderId}`,
      headers: { authorization: `Bearer ${userToken}` },
    });
    const body = JSON.parse(getRes.payload).data;
    expect(body.totalPaid).toBe(100000);
    expect(body.status).toBe("PAID");
  });
});
