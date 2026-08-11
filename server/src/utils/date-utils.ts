
/**
 * Normalizes any Date, timestamp, or date string (e.g. "2026-08-25")
 * to UTC Midnight (00:00:00.000Z).
 */
export function toUTCMidnight(dateInput: Date | string | number): Date {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return d; // Invalid Date, return as is for validator to catch
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Returns today's current calendar date normalized to UTC Midnight (00:00:00.000Z).
 */
export function getUTCTodayMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Checks if a target due date is in the past relative to UTC today midnight.
 * Returns true if target date calendar day is strictly before today in UTC.
 */
export function isUTCPastDate(targetDateInput: Date | string | number): boolean {
  const target = toUTCMidnight(targetDateInput);
  const today = getUTCTodayMidnight();
  return target.getTime() < today.getTime();
}

/**
 * Checks if an order due date has expired under UTC calendar date rules.
 * An order due on 2026-08-25 is valid through 2026-08-25 23:59:59.999Z,
 * and becomes OVERDUE on 2026-08-26 00:00:00.000Z (when UTCTodayMidnight > dueUTCMidnight).
 */
export function isDueDateExpiredUTC(dueDateInput: Date | string | number): boolean {
  const dueMidnight = toUTCMidnight(dueDateInput);
  const todayMidnight = getUTCTodayMidnight();
  return todayMidnight.getTime() > dueMidnight.getTime();
}
