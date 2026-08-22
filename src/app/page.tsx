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
  Luggage,
  Heart,
  Plane,
  FileText,
  ShieldCheck,
  Zap,
  Clock,
  Printer,
  TrendingUp,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col justify-between selection:bg-teal-200 selection:text-teal-900">
      <div>
        {/* 🌐 Executive Full-Width Top Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100 transition-all">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900 font-display">
                Globe<span className="text-teal-600">Trotter</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
              <a href="#features" className="hover:text-teal-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
                Workflow
              </a>
              <Link href="/explore/cities" className="hover:text-teal-600 transition-colors">
                Destinations
              </Link>
              <Link href="/community" className="hover:text-teal-600 transition-colors">
                Community
              </Link>
              <Link href="/wishlist" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                <span>Wishlist</span>
                <span className="text-[10px] font-extrabold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                  New
                </span>
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3.5">
              <Link
                href="/login"
                className="text-sm font-bold text-gray-700 hover:text-teal-600 transition-colors px-2 py-1"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-102"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </header>

        {/* 🌟 Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(13,148,136,0.10),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(99,102,241,0.10),transparent_45%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
            {/* Left Hero Content */}
            <motion.div
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200/60 rounded-full text-teal-800 text-xs font-extrabold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Next-Gen Multi-City Itinerary Architect</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight font-display leading-[1.08]">
                Plan journeys your{" "}
                <span className="bg-gradient-to-r from-teal-600 via-primary-600 to-indigo-600 bg-clip-text text-transparent">
                  spreadsheet
                </span>{" "}
                never could.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Build day-by-day itineraries across multiple countries, watch expenses convert
                live with real-time currency rates, visualize route maps, and export executive PDF
                briefings with a single click.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-teal-700/25 hover:scale-103"
                >
                  <span>Start Planning Free</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  href="/explore/cities"
                  className="inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all shadow-2xs hover:border-gray-300"
                >
                  <Compass className="w-4 h-4 text-teal-600" />
                  <span>Explore 100+ Cities</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to use forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-device sync
                </span>
              </div>
            </motion.div>

            {/* Right Interactive Mockup Card */}
            <motion.div
              className="lg:col-span-5 relative"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-teal-500/20 via-primary-500/20 to-indigo-500/20 rounded-[2.5rem] blur-2xl pointer-events-none" />

              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Window Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                    Grand European Journey • 10 Days
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  {[
                    {
                      city: "Paris, France",
                      dates: "Jun 1 – 4",
                      sights: "Louvre & Eiffel Sunset",
                      cost: "€1,240",
                    },
                    {
                      city: "Rome, Italy",
                      dates: "Jun 4 – 7",
                      sights: "Colosseum & Trastevere",
                      cost: "€980",
                    },
                    {
                      city: "Barcelona, Spain",
                      dates: "Jun 7 – 10",
                      sights: "Sagrada Família & Beach",
                      cost: "€1,120",
                    },
                  ].map((stop, i) => (
                    <div
                      key={stop.city}
                      className="flex items-center justify-between gap-3 bg-gray-50/80 hover:bg-teal-50/40 p-3 rounded-2xl border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-primary-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {i + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-gray-900 flex items-center gap-1">
                            <span>{stop.city}</span>
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">{stop.sights} • {stop.dates}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-gray-900 bg-white px-2.5 py-1 rounded-xl border border-gray-200/80 shadow-2xs shrink-0">
                        {stop.cost}
                      </span>
                    </div>
                  ))}

                  {/* Financial Bar */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Live Budget Tracking</p>
                      <p className="text-sm font-black text-teal-700">€3,340 Planned</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Budget Goal</p>
                      <p className="text-sm font-black text-gray-900">€5,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🎨 Clean, Balanced 3x2 Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-teal-50 border border-teal-100 text-teal-800 text-xs font-extrabold rounded-full">
              <Zap className="w-3.5 h-3.5 text-teal-600" />
              <span>Engineered For Serious Travelers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight font-display">
              A Complete Travel Operating System
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
              From your first dream inspiration to boarding the plane — explore real visual tools built for effortless multi-city travel.
            </p>
          </div>

          {/* 💎 3x2 Unified Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Route Map */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-teal-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-100">
                    Live Route Engine
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    Interactive Multi-City Route Maps
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Auto-plots all destinations with numbered pins, flight arcs, and interactive popups with dates & live weather.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/70 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Japan Golden Route</span>
                  </span>
                  <span className="text-[10px] font-extrabold bg-teal-100/70 text-teal-900 px-2 py-0.5 rounded-md">
                    513 km • Shinkansen
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white p-2 rounded-xl border border-gray-200/70">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-black inline-flex items-center justify-center mb-0.5">
                      1
                    </span>
                    <p className="text-xs font-bold text-gray-900">Tokyo</p>
                    <p className="text-[9px] text-gray-500">22°C ☀️</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-gray-200/70">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-black inline-flex items-center justify-center mb-0.5">
                      2
                    </span>
                    <p className="text-xs font-bold text-gray-900">Kyoto</p>
                    <p className="text-[9px] text-gray-500">20°C 🌸</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border border-gray-200/70">
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[9px] font-black inline-flex items-center justify-center mb-0.5">
                      3
                    </span>
                    <p className="text-xs font-bold text-gray-900">Osaka</p>
                    <p className="text-[9px] text-gray-500">23°C 🍜</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Currency Intelligence */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-indigo-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full border border-indigo-100">
                    30+ World Currencies
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    Multi-Currency Intelligence
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Auto-converts foreign expenses into your trip base currency with live rates and zero mathematical guesswork.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-white p-2 rounded-xl border border-gray-200/60">
                  <span>$2,400 USD</span>
                  <span className="text-indigo-600 font-extrabold">⇄</span>
                  <span>¥365,000 JPY</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-white p-2 rounded-xl border border-gray-200/60">
                  <span>€2,210 EUR</span>
                  <span className="text-indigo-600 font-extrabold">⇄</span>
                  <span>₹199,200 INR</span>
                </div>

                <div className="text-[10px] text-gray-400 pt-0.5 flex items-center justify-between px-1">
                  <span>Rates Updated Live</span>
                  <span className="text-emerald-600 font-bold">✓ 0% Math Error</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: PDF Export */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-cyan-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-full border border-cyan-100">
                    Day 1 ➔ End Day
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    1-Click PDF Travel Dossier
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Generate comprehensive day-by-day travel briefings with timetables, route summaries, and print optimization.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-cyan-50/30 p-3.5 rounded-2xl border border-cyan-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                  <span className="flex items-center gap-1.5 text-cyan-900">
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Itinerary Dossier</span>
                  </span>
                  <span className="text-[9px] font-bold bg-white px-2 py-0.5 rounded border border-cyan-200 text-cyan-800">
                    PDF & MD
                  </span>
                </div>

                <div className="text-[11px] text-gray-700 bg-white p-2.5 rounded-xl border border-cyan-100/80 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Day 1 • 09:00 AM</p>
                    <p className="text-gray-500 truncate text-[10px]">Fushimi Inari Sunrise Walk</p>
                  </div>
                  <span className="font-bold text-teal-700 text-xs">$45</span>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Wishlist & Bucket List */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-rose-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-50 text-rose-800 px-2.5 py-1 rounded-full border border-rose-100">
                    Bucket List Hub
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    Travel Wishlist & 1-Click Builder
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Save dream sights, stays, and culinary spots. Convert any saved wish into a full multi-city itinerary in one click.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-rose-50/30 p-3.5 rounded-2xl border border-rose-100 space-y-2">
                <div className="bg-white p-2.5 rounded-xl border border-rose-100/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-amber-500 uppercase">★★★ Top Priority</span>
                    <p className="text-xs font-bold text-gray-900">Santorini Sunset Villa</p>
                  </div>
                  <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                    $2,800
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-rose-100/80 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-extrabold text-amber-500 uppercase">★★★ Priority</span>
                    <p className="text-xs font-bold text-gray-900">Kyoto Sakura Walk</p>
                  </div>
                  <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                    $1,450
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 5: Horizon Calendar */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-amber-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-100">
                    Monthly Timeline
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    Horizon Travel Calendar
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Color-coded multi-day span bars showing all upcoming journeys, destination stops, and overlapping trips.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 px-1">
                  <span>June 2026</span>
                  <span className="text-[10px] text-teal-800 font-extrabold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    2 Trips Active
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-6 rounded-lg bg-teal-600 text-white text-[10px] font-bold px-2.5 flex items-center justify-between shadow-2xs">
                    <span>Grand European Adventure</span>
                    <span>10 Days</span>
                  </div>
                  <div className="h-6 rounded-lg bg-indigo-600 text-white text-[10px] font-bold px-2.5 flex items-center justify-between shadow-2xs">
                    <span>Japan Golden Route</span>
                    <span>7 Days</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 6: Collaborative Sharing */}
            <motion.div
              className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-soft hover:shadow-lift hover:border-purple-300 transition-all flex flex-col justify-between"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full border border-purple-100">
                    Social & Sync
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-gray-900 font-display">
                    Co-Planning & Community Feed
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    Invite travel buddies with edit access, publish public view links, or clone itineraries from community travelers.
                  </p>
                </div>
              </div>

              {/* Widget Preview */}
              <div className="mt-6 bg-purple-50/30 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div className="flex items-center -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                    JD
                  </div>
                  <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                    AL
                  </div>
                  <div className="w-7 h-7 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                    SK
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-2xs">
                    +4
                  </div>
                </div>

                <span className="text-[11px] font-bold text-purple-900 bg-white px-2.5 py-1 rounded-xl border border-purple-200">
                  Shared Live • Editor
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 🗺️ How it works */}
        <section id="how-it-works" className="bg-gray-50/70 border-y border-gray-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-display">
                Three Steps to Wheels-Up
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Zero friction, zero complicated spreadsheets — you&apos;re crafting your dream journey within 60 seconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  n: "01",
                  title: "Create your trip container",
                  desc: "Set your target dates, budget, and base currency. Takes under 30 seconds.",
                },
                {
                  n: "02",
                  title: "Map destinations & activities",
                  desc: "Pick cities, explore recommended attractions, and sequence your stops on the route map.",
                },
                {
                  n: "03",
                  title: "Track, export, and travel",
                  desc: "Monitor expenses live, export day-by-day PDF reports, and share with your travel companions.",
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className="bg-white p-7 rounded-3xl border border-gray-100 shadow-soft space-y-3 relative overflow-hidden"
                >
                  <span className="text-5xl font-black text-teal-100 font-display block">
                    {step.n}
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900 font-display">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🌟 Luxury Jaw-Dropping CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-gray-950 via-teal-950 to-indigo-950 text-white p-8 sm:p-16 shadow-2xl border border-white/10 text-center">
            {/* Ambient Background Overlay & Travel Light Mesh */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_-20%,rgba(20,184,166,0.35),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.25),transparent_50%)]" />

            {/* Content Container */}
            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              {/* Trust Badge with Gold Stars */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-white/90">
                  Loved by 10,000+ modern travelers
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-[1.1]">
                  Ready to Turn Your Dream Destinations Into Reality?
                </h2>
                <p className="text-sm sm:text-base text-teal-100/80 max-w-xl mx-auto leading-relaxed">
                  Free to start. Ready in minutes. Built specifically for travelers who explore more than one city.
                </p>
              </div>

              {/* Magnetic Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-9 py-4 bg-teal-400 hover:bg-teal-300 text-teal-950 rounded-2xl font-black text-sm transition-all shadow-xl shadow-teal-950/40 hover:scale-104"
                >
                  <span>Create Your Free Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition-all"
                >
                  <span>Log In to Dashboard</span>
                </Link>
              </div>

              {/* Floating Orbit Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs font-semibold text-white/80">
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <Compass className="w-4 h-4 text-teal-300" />
                  <span>Interactive Route Maps</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <Wallet className="w-4 h-4 text-indigo-300" />
                  <span>30+ Currencies Live</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  <FileText className="w-4 h-4 text-rose-300" />
                  <span>1-Click PDF Dossiers</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Luxury Footer */}
      <Footer />
    </main>
  );
}
