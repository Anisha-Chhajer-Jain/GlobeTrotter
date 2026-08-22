"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import {
  Globe2, LayoutDashboard, Map, Compass, User, LogOut,
  ChevronDown, Plus, ShieldCheck, Users2, CalendarDays, Bell,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/dashboard",      label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips",          label: "My Trips",  icon: Map },
  { href: "/explore/cities", label: "Explore",   icon: Compass },
  { href: "/community",      label: "Community", icon: Users2 },
  { href: "/calendar",       label: "Calendar",  icon: CalendarDays },
];

const BOTTOM_NAV = [
  { href: "/dashboard",      label: "Home",     icon: LayoutDashboard },
  { href: "/trips",          label: "Trips",    icon: Map },
  { href: "/trips/new",      label: "Plan",     icon: Plus, highlight: true },
  { href: "/explore/cities", label: "Explore",  icon: Compass },
  { href: "/community",      label: "Community",icon: Users2 },
];

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = !!session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());
  const navLinks = isAdmin ? [...NAV_LINKS, { href: "/admin", label: "Admin", icon: ShieldCheck }] : NAV_LINKS;

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ─── Top Nav ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/60" style={{ boxShadow: "var(--shadow-nav)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg shrink-0" style={{ color: "var(--blue-primary)" }}>
            <Globe2 className="w-6 h-6" /> GlobeTrotter
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link key={link.href} href={link.href} className={cn("nav-link", active && "active")}>
                  <link.icon className="w-4 h-4" /> {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/trips/new"
              className="hidden sm:flex btn-pill btn-primary items-center gap-1.5 px-4 py-2 text-sm text-white font-semibold"
            >
              <Plus className="w-4 h-4" /> New Trip
            </Link>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="User menu"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {initials}
                  </div>
                )}
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-fade-in z-50">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{session?.user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-slate-400" /> Profile &amp; Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mt-1 border-t border-slate-50"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Page content ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 animate-fade-up">
        {children}
      </main>

      {/* ─── Mobile Bottom Nav ────────────────────────────── */}
      <nav className="bottom-nav md:hidden" aria-label="Mobile navigation">
        {BOTTOM_NAV.map((link) => {
          const active = pathname === link.href || (link.href !== "/trips/new" && pathname.startsWith(link.href + "/"));
          if (link.highlight) {
            return (
              <Link key={link.href} href={link.href} className="bottom-nav-item">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md -mt-4">
                  <link.icon className="w-5 h-5 text-white" />
                </div>
              </Link>
            );
          }
          return (
            <Link key={link.href} href={link.href} className={cn("bottom-nav-item", active && "active")}>
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
