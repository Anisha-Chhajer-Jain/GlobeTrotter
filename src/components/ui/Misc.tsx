"use client";

import { Loader2, type LucideIcon } from "lucide-react";
import React, { type ReactNode } from "react";
import Link from "next/link";

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <Loader2 className="w-8 h-8 animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-100 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?:
    | ReactNode
    | {
        label: string;
        onClick?: () => void;
        href?: string;
      };
}) {
  let actionElement: ReactNode = null;

  if (action) {
    if (React.isValidElement(action) || typeof action === "string" || typeof action === "number") {
      actionElement = action;
    } else if (typeof action === "object" && "label" in action) {
      const act = action as { label: string; onClick?: () => void; href?: string };
      if (act.href) {
        actionElement = (
          <Link
            href={act.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            {act.label}
          </Link>
        );
      } else {
        actionElement = (
          <button
            type="button"
            onClick={act.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {act.label}
          </button>
        );
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-1">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-sm">{description}</p>}
      {actionElement}
    </div>
  );
}

export function StatTile({
  icon: Icon,
  label,
  value,
  tone = "blue",
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  tone?: "blue" | "green" | "amber" | "red" | "indigo";
}) {
  const toneClasses: Record<string, string> = {
    blue: "bg-primary-50 text-primary-700",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    indigo: "bg-accent-50 text-accent-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "blue" | "amber" | "red" | "indigo" }) {
  const toneClasses: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-primary-100 text-primary-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    indigo: "bg-accent-100 text-accent-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
