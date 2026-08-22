"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "coral" | "secondary" | "outline" | "ghost" | "danger";
type Size = "xs" | "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "btn-pill btn-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
  coral:
    "btn-pill btn-coral text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
  secondary:
    "btn-pill bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold disabled:opacity-50",
  outline:
    "btn-pill bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-semibold disabled:opacity-50",
  ghost:
    "btn-pill bg-transparent text-slate-600 hover:bg-slate-100 font-semibold disabled:opacity-50",
  danger:
    "btn-pill bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 font-semibold disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}
