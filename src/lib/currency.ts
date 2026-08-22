/**
 * Static, approximate exchange rates (units per 1 USD), used only so that
 * budget totals are directionally correct when a trip mixes currencies
 * (e.g. a USD-budget trip with a JPY-priced activity in Tokyo).
 *
 * These are fixed snapshot values, not live rates — good enough for a
 * hackathon-scale budget estimate, not for financial accuracy. Swap
 * `convertCurrency` for a real FX API (e.g. exchangerate.host) before
 * relying on this for anything real.
 */
const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149,
  AUD: 1.52,
  CAD: 1.36,
  INR: 83.5,
  IDR: 15600,
  THB: 35.5,
  AED: 3.67,
  MAD: 9.9,
};

function rateToUsd(currency: string): number {
  return USD_RATES[currency?.toUpperCase()] ?? 1;
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (!amount) return 0;
  if (!from || !to || from.toUpperCase() === to.toUpperCase()) return amount;
  const amountInUsd = amount / rateToUsd(from);
  return amountInUsd * rateToUsd(to);
}
