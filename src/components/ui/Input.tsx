import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─── Shared field style ────────────────────────────────────── */
const fieldBase =
  "w-full px-4 py-3 rounded-xl border-[1.5px] border-slate-200 bg-white text-[0.9375rem] text-slate-900 " +
  "placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 " +
  "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-150";

const fieldError = "border-red-400 focus:border-red-500 focus:ring-red-500/10";

/* ─── Field Wrapper ─────────────────────────────────────────── */
function FieldWrapper({
  label,
  error,
  htmlFor,
  children,
  hint,
}: {
  label?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path d="M6 4v3M6 8.5v.5" stroke="currentColor" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Input ─────────────────────────────────────────────────── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <input
        id={id}
        className={cn(fieldBase, error && fieldError, className)}
        {...props}
      />
    </FieldWrapper>
  );
}

/* ─── Textarea ──────────────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className={cn(fieldBase, "resize-none leading-relaxed", error && fieldError, className)}
        {...props}
      />
    </FieldWrapper>
  );
}

/* ─── Select ────────────────────────────────────────────────── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} htmlFor={id}>
      <select
        id={id}
        className={cn(fieldBase, "cursor-pointer appearance-none", error && fieldError, className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
