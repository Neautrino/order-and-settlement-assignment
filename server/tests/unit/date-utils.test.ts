import { describe, expect, test } from "bun:test";
import { isDueDateExpiredUTC, getUTCTodayMidnight } from "../../src/utils/date-utils";

describe("Date Utils Unit Tests", () => {
  test("Test 7 — Due today (dueDate = today) -> not overdue", () => {
    const today = getUTCTodayMidnight();
    expect(isDueDateExpiredUTC(today)).toBe(false);
  });

  test("Test 8 — Due yesterday (dueDate = yesterday) -> overdue", () => {
    const today = getUTCTodayMidnight();
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    expect(isDueDateExpiredUTC(yesterday)).toBe(true);
  });

  test("Test 9 — Due tomorrow (dueDate = tomorrow) -> not overdue", () => {
    const today = getUTCTodayMidnight();
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    expect(isDueDateExpiredUTC(tomorrow)).toBe(false);
  });
});
