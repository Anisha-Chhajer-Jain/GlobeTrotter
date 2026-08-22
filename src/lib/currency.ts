/**
 * Comprehensive exchange rates (units per 1 USD)
 * Used for instant, reliable multi-currency conversions across itineraries, budgets, and expenses.
 */
export const USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  CAD: 1.36,
  AUD: 1.52,
  JPY: 154.5,
  SGD: 1.34,
  AED: 3.67,
  CHF: 0.89,
  CNY: 7.23,
  THB: 36.5,
  IDR: 15900,
  NZD: 1.64,
  HKD: 7.82,
  SEK: 10.6,
  NOK: 10.7,
  MXN: 17.1,
  BRL: 5.15,
  ZAR: 18.5,
  TRY: 32.5,
  SAR: 3.75,
  QAR: 3.64,
  EGP: 47.5,
  MAD: 10.1,
  KRW: 1375,
  VND: 25400,
  MYR: 4.75,
  PHP: 57.5,
};

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR" },
];

export function rateToUsd(currency?: string | null): number {
  if (!currency) return 1;
  const code = currency.trim().toUpperCase();
  return USD_RATES[code] ?? 1;
}

export function convertCurrency(
  amount: number | string | null | undefined,
  from?: string | null,
  to?: string | null
): number {
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount ?? 0);
  if (isNaN(num) || num === 0) return 0;

  const src = (from || "USD").trim().toUpperCase();
  const dest = (to || "USD").trim().toUpperCase();

  if (src === dest) return num;

  const fromRate = rateToUsd(src);
  const toRate = rateToUsd(dest);

  // amount in USD = amount / fromRate
  const amountInUsd = num / fromRate;
  const result = amountInUsd * toRate;

  return Math.round(result * 100) / 100;
}

export function getCurrencySymbol(currency?: string | null): string {
  if (!currency) return "$";
  const code = currency.trim().toUpperCase();
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  if (found) return found.symbol;

  try {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).format(0);
    return formatted.replace(/[0-9.,\s]/g, "") || code;
  } catch {
    return code;
  }
}
