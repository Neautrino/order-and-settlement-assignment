/**
 * Converts integer cents (e.g. 1250000) to formatted currency string (e.g. "$12,500.00")
 */
export function formatCurrency(cents: number): string {
  const safeCents = isNaN(cents) ? 0 : cents;
  return `$${(safeCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Converts integer cents to decimal dollars (e.g. 1250 -> 12.5)
 */
export function centsToDollars(cents: number): number {
  if (isNaN(cents)) return 0;
  return cents / 100;
}

/**
 * Converts dollar inputs to integer cents (e.g. 12.50 -> 1250)
 */
export function dollarsToCents(dollars: number): number {
  if (isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}
