import Link from "next/link";
import type { ReactNode } from "react";
import { Globe2, Compass, Wallet, Share2, CheckCircle2 } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Compass, text: "Drag-and-drop itinerary builder across multiple cities" },
  { icon: Wallet, text: "Budget totals that convert currencies automatically" },
  { icon: Share2, text: "Share a public link or invite collaborators to edit" },
];

export default function AuthSplitLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Branding panel */}
      <div className="hidden lg:flex relative flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-600 via-indigo-600 to-primary-700 px-12 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.10),transparent_40%)]" />
        <Link href="/" className="relative flex items-center gap-2 font-bold text-xl">
          <Globe2 className="w-7 h-7" /> GlobeTrotter
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight mb-6">
            Plan multi-city trips that actually stay organized.
          </h2>
          <div className="space-y-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <h.icon className="w-4 h-4" />
                </div>
                <p className="text-primary-50 text-sm leading-relaxed pt-1.5">{h.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative flex items-center gap-1.5 text-xs text-primary-100">
          <CheckCircle2 className="w-3.5 h-3.5" /> Free to start — no credit card required
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-primary-600 font-bold text-xl mb-8">
            <Globe2 className="w-7 h-7" /> GlobeTrotter
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 text-sm mt-1 mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
