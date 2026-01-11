/**
 * Money conversion utilities for Stake Engine
 * Engine uses integers with 6 decimal places: 1000000 = $1.00
 */

/** Convert engine units to display currency */
export function engineUnitsToDisplay(units: number): number {
  return units / 1000000;
}

/** Convert display currency to engine units */
export function displayToEngineUnits(amount: number): number {
  return Math.round(amount * 1000000);
}

/** Format currency for display */
export function formatCurrency(units: number): string {
  const amount = engineUnitsToDisplay(units);
  return amount.toFixed(2);
}
