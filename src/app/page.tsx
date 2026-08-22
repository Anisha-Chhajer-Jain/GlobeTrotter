"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Globe2,
  Compass,
  Wallet,
  Share2,
  Users2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  MapPin,
  Star,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Compass,
    title: "Drag-and-Drop Itinerary Builder",
    desc: "Add cities, reorder stops, and slot in activities with keyboard-accessible drag and drop — no spreadsheets required.",
  },
  {
    icon: Wallet,
    title: "Real Budget Intelligence",
    desc: "Every expense and activity converts into your trip's currency automatically, so multi-country totals are never a guessing game.",
  },
  {
    icon: Share2,
    title: "Shareable, Copyable Trips",
    desc: "Publish a read-only link, invite collaborators with edit access, or let anyone clone your itinerary into their own account.",
  },
  {
    icon: Users2,
    title: "Community Trip Feed",
    desc: "Browse what other travelers loved about a city, like and comment, and pull inspiration straight into your own plan.",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Timeline Views",
    desc: "See every trip plotted across a real month grid, or drill into a single trip's day-by-day flow with cost per stop.",
  },
  {
    icon: Sparkles,
    title: "Real-World Discovery",
    desc: "Search worldwide cities and discover nearby points of interest with live data, then drop them straight into your plan.",
  },
];

const STEPS = [
  { n: "01", title: "Create your trip", desc: "Name it, set your dates and budget — takes under a minute." },
  { n: "02", title: "Build the itinerary", desc: "Pick cities, drag them into order, and layer in activities per stop." },
  { n: "03", title: "Track, share, go", desc: "Watch the budget update live, share the link, and travel with confidence." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-lg">
            <Globe2 className="w-6 h-6" /> GlobeTrotter
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-sm shadow-primary-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(59,130,246,0.10),transparent_45%),radial-gradient(circle_at_85%_25%,rgba(99,102,241,0.12),transparent_40%)]" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary-50 rounded-full text-primary-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Multi-city travel planning, reimagined
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-[1.05]">
              Plan trips your{" "}
              <span className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-500 bg-clip-text text-transparent">
                spreadsheet
              </span>{" "}
              never could.
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8 leading-relaxed">
              Build day-by-day itineraries across multiple cities, watch your budget update in
              real currency conversions as you go, and share the whole plan with a single link.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
              >
                Start planning free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Log in
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to start
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card
              </span>
            </div>
          </motion.div>

          {/* Stylized app preview card */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-200/40 to-accent-200/30 rounded-[2rem] blur-2xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-900">Romantic European Adventure</p>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">PLANNING</span>
                </div>
                {[
                  { city: "Paris, France", days: "Jun 1 – 4", cost: "€1,240" },
                  { city: "Rome, Italy", days: "Jun 4 – 7", cost: "€980" },
                  { city: "Barcelona, Spain", days: "Jun 7 – 10", cost: "€1,120" },
                ].map((stop, i) => (
                  <div key={stop.city} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" /> {stop.city}
                      </p>
                      <p className="text-xs text-gray-400">{stop.days}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 shrink-0">{stop.cost}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total budget</span>
                  <span className="text-sm font-bold text-primary-600">€5,000 · €3,340 planned</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything a real trip needs</h2>
          <p className="text-gray-600">Not a toy demo — a full planning workflow from first idea to the day you leave.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-primary-100 hover:shadow-lift transition-all"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Three steps to wheels-up</h2>
            <p className="text-gray-600">No onboarding maze — you&apos;re building your itinerary within minutes of signing up.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <span className="text-5xl font-bold text-primary-100">{step.n}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-indigo-600 to-primary-700 px-8 py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="relative">
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-300 text-amber-300" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your next trip starts here</h2>
            <p className="text-primary-100 max-w-xl mx-auto mb-8">
              Free to use, ready in minutes, and built for travelers who actually plan more than one city.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Create your free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Globe2 className="w-5 h-5 text-primary-600" /> GlobeTrotter
          </div>
          <p className="text-sm text-gray-400">Built with Next.js, Prisma, PostgreSQL &amp; NextAuth.</p>
        </div>
      </footer>
    </main>
  );
}
