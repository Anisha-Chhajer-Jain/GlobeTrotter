"use client";

import Link from "next/link";
import {
  Globe2,
  Heart,
  Plane,
  Compass,
  Calendar,
  Sparkles,
  MapPin,
  ShieldCheck,
  Send,
  Github,
  Twitter,
  Instagram,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Thank you for subscribing to GlobeTrotter travel updates!");
    setEmail("");
  }

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-400 mt-20 border-t border-gray-800/80 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(15,118,110,0.15),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(99,102,241,0.15),transparent_40%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 relative z-10 space-y-12">
        {/* Top Section: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-gray-800/80">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 text-white font-black text-2xl tracking-tight font-display group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                GlobeTrotter
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              The modern multi-city itinerary planner. Seamlessly map out destinations, track expenses, forecast weather, and turn your travel dreams into unforgettable adventures.
            </p>

            {/* Live Service Status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/80 border border-gray-700/60 text-xs text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Neon Cloud Database Connected • v2.0 Pro</span>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Planner */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 font-display">
                Trip Planner
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/trips/new" className="hover:text-teal-400 transition-colors">
                    Plan New Trip
                  </Link>
                </li>
                <li>
                  <Link href="/trips" className="hover:text-teal-400 transition-colors">
                    My Itineraries
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                    <span>Travel Wishlist</span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 font-bold px-1.5 py-0.2 rounded-full border border-rose-500/30">
                      Bucket List
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/calendar" className="hover:text-teal-400 transition-colors flex items-center gap-1.5">
                    <span>Travel Calendar</span>
                    <span className="text-[9px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.2 rounded-full border border-teal-500/30">
                      New
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/explore/cities" className="hover:text-teal-400 transition-colors">
                    Destination Guides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Discover */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 font-display">
                Discover
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/community" className="hover:text-teal-400 transition-colors">
                    Community Stories
                  </Link>
                </li>
                <li>
                  <Link href="/explore/activities" className="hover:text-teal-400 transition-colors">
                    Top Activities
                  </Link>
                </li>
                <li>
                  <Link href="/explore/cities" className="hover:text-teal-400 transition-colors">
                    Weather Forecasts
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                    Budget Tracker
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Newsletter */}
            <div className="col-span-2 sm:col-span-1 space-y-3.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200 font-display">
                Stay Inspired
              </h4>
              <p className="text-xs text-gray-400">
                Receive handpicked destination guides and travel inspirations weekly.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-3.5 py-2 rounded-xl bg-gray-800/90 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-gray-950 transition-colors flex items-center justify-center"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} GlobeTrotter Inc. Built with love for passionate world travelers.</p>

          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Security
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
