import { getCurrencySymbol } from "./currency";

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = "USD"
): string {
  const value =
    typeof amount === "string" ? parseFloat(amount) : Number(amount ?? 0);
  if (isNaN(value)) return "$0";

  const code = (currency || "USD").trim().toUpperCase();

  // Currencies that don't use decimals in standard display
  const zeroDecimalCurrencies = ["JPY", "KRW", "VND", "IDR", "CLP", "PYG"];
  const isZeroDecimal = zeroDecimalCurrencies.includes(code);

  const maxFraction = isZeroDecimal ? 0 : 2;
  const minFraction = isZeroDecimal ? 0 : value % 1 === 0 ? 0 : 2;

  // Clean symbol lookup for concise, clean UI cards
  const symbol = getCurrencySymbol(code);

  const formattedNum = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: minFraction,
    maximumFractionDigits: maxFraction,
  });

  const sign = value < 0 ? "-" : "";

  // For standard symbols like $, €, £, ¥, ₹, S$, A$, C$, etc.
  if (["USD", "CAD", "INR", "EUR", "GBP", "JPY", "AUD", "SGD", "NZD", "HKD", "CNY", "THB", "KRW", "BRL"].includes(code)) {
    return `${sign}${symbol}${formattedNum}`;
  }

  // For code prefixes like AED, CHF, SAR, IDR, etc.
  return `${sign}${symbol} ${formattedNum}`;
}

export function formatDateRange(
  start?: string | Date | null,
  end?: string | Date | null
): string {
  if (!start && !end) return "Dates not set";
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  const s = start ? new Date(start).toLocaleDateString("en-US", opts) : "?";
  const e = end ? new Date(end).toLocaleDateString("en-US", opts) : "?";
  if (start && end) return `${s} - ${e}`;
  return s !== "?" ? s : e;
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDayLabel(date?: string | Date | null): string {
  if (!date) return "Unscheduled";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unscheduled";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function dateInputValue(date?: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function tripDurationDays(
  start?: string | Date | null,
  end?: string | Date | null
): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e)) return 0;
  const ms = e - s;
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}
