"use client";

import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* ─── Skeleton ──────────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card-premium p-5 space-y-3">
      <div className="skeleton h-36 rounded-xl" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex gap-2 mt-2">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-premium p-4 flex items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
          </div>
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin" style={{ borderWidth: 3 }} />
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  );
}

/* ─── Empty State ───────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center animate-fade-up">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-blue-500 shadow-sm">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500 max-w-xs leading-relaxed">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ─── Stat Tile ─────────────────────────────────────────────── */
export function StatTile({
  icon: Icon,
  label,
  value,
  tone = "blue",
  sub,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "indigo" | "coral";
  sub?: string;
}) {
  const toneClasses: Record<string, string> = {
    blue:   "from-blue-500 to-blue-600 text-white",
    green:  "from-emerald-500 to-teal-500 text-white",
    amber:  "from-amber-400 to-orange-500 text-white",
    red:    "from-red-500 to-rose-500 text-white",
    indigo: "from-indigo-500 to-purple-600 text-white",
    coral:  "from-orange-400 to-red-500 text-white",
  };
  return (
    <div className="card-premium p-5 flex items-center gap-4 group">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${toneClasses[tone]} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900 truncate leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Badge ─────────────────────────────────────────────────── */
export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "green" | "blue" | "amber" | "red" | "indigo" | "coral";
}) {
  const toneClasses: Record<string, string> = {
    gray:   "bg-slate-100 text-slate-600",
    green:  "bg-emerald-100 text-emerald-700",
    blue:   "bg-blue-100 text-blue-700",
    amber:  "bg-amber-100 text-amber-700",
    red:    "bg-red-100 text-red-700",
    indigo: "bg-indigo-100 text-indigo-700",
    coral:  "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`pill-badge ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
