export function formatMoney(amount: number | string, currency: string = "USD"): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value || 0);
  } catch {
    return `${currency} ${(value || 0).toFixed(2)}`;
  }
}

export function formatDateRange(start?: string | Date | null, end?: string | Date | null): string {
  if (!start && !end) return "Dates not set";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const s = start ? new Date(start).toLocaleDateString("en-US", opts) : "?";
  const e = end ? new Date(end).toLocaleDateString("en-US", opts) : "?";
  if (start && end) return `${s} - ${e}`;
  return s !== "?" ? s : e;
}

export function formatDate(date?: string | Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDayLabel(date?: string | Date | null): string {
  if (!date) return "Unscheduled";
  return new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function dateInputValue(date?: string | Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function tripDurationDays(start?: string | Date | null, end?: string | Date | null): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}
