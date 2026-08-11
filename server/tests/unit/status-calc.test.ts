import { describe, expect, test } from "bun:test";
import { resolveOrderStatus } from "../../src/utils/status-calc";

describe("Status Calculation Unit Tests", () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 10);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  test("Test 1 — New order (total = 100, paid = 0, due in future) -> PENDING", () => {
    const status = resolveOrderStatus({
      status: "PENDING",
      totalAmount: 10000n,
      totalPaid: 0n,
      dueDate: futureDate,
    });
    expect(status).toBe("PENDING");
  });

  test("Test 2 — Partial payment (total = 100, paid = 40, due in future) -> PARTIALLY_PAID", () => {
    const status = resolveOrderStatus({
      status: "PENDING",
      totalAmount: 10000n,
      totalPaid: 4000n,
      dueDate: futureDate,
    });
    expect(status).toBe("PARTIALLY_PAID");
  });

  test("Test 3 — Fully paid (total = 100, paid = 100, due in future) -> PAID", () => {
    const status = resolveOrderStatus({
      status: "PARTIALLY_PAID",
      totalAmount: 10000n,
      totalPaid: 10000n,
      dueDate: futureDate,
    });
    expect(status).toBe("PAID");
  });

  test("Test 4 — Unpaid overdue (total = 100, paid = 0, due yesterday) -> OVERDUE", () => {
    const status = resolveOrderStatus({
      status: "PENDING",
      totalAmount: 10000n,
      totalPaid: 0n,
      dueDate: pastDate,
    });
    expect(status).toBe("OVERDUE");
  });

  test("Test 5 — Partially paid overdue (total = 100, paid = 40, due yesterday) -> OVERDUE", () => {
    const status = resolveOrderStatus({
      status: "PARTIALLY_PAID",
      totalAmount: 10000n,
      totalPaid: 4000n,
      dueDate: pastDate,
    });
    expect(status).toBe("OVERDUE");
  });

  test("Test 6 — Fully paid overdue (total = 100, paid = 100, due yesterday) -> PAID", () => {
    const status = resolveOrderStatus({
      status: "OVERDUE",
      totalAmount: 10000n,
      totalPaid: 10000n,
      dueDate: pastDate,
    });
    expect(status).toBe("PAID");
  });
});
