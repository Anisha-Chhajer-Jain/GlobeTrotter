import Link from "next/link";
import {
  Globe2, Compass, Wallet, Share2, Users2, CalendarDays, Sparkles,
  ArrowRight, MapPin, Star, CheckCircle2, TrendingUp, Shield, Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Compass,
    title: "Drag-and-Drop Itinerary Builder",
    desc: "Add cities, reorder stops, and slot in activities with keyboard-accessible drag and drop — no spreadsheets required.",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Wallet,
    title: "Real Budget Intelligence",
    desc: "Track every expense in ₹ (INR) automatically. Multi-city budgets stay accurate with instant currency conversion.",
    color: "from-orange-400 to-red-500",
  },
  {
    icon: Share2,
    title: "Shareable, Copyable Trips",
    desc: "Publish a read-only link, invite collaborators with edit access, or let anyone clone your itinerary.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Users2,
    title: "Community Trip Feed",
    desc: "Browse what other travelers loved, like and comment, and pull inspiration straight into your own plan.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Timeline Views",
    desc: "See every trip plotted across a real month grid, or drill into a single trip's day-by-day flow with cost per stop.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Sparkles,
    title: "Real-World Discovery",
    desc: "Search worldwide cities and discover nearby points of interest with live data, then drop them straight into your plan.",
    color: "from-amber-500 to-orange-600",
  },
];

const STEPS = [
  { n: "01", title: "Create your trip",      desc: "Name it, set your dates and budget in ₹ — takes under a minute.", icon: Zap },
  { n: "02", title: "Build the itinerary",   desc: "Pick cities, drag them into order, and layer in activities per stop.", icon: MapPin },
  { n: "03", title: "Track, share, go",      desc: "Watch the budget update live, share the link, and travel with confidence.", icon: TrendingUp },
];

const DEMO_STOPS = [
  { city: "Rajasthan, India", days: "Jan 5 – 8",   cost: "₹28,500", flag: "🏰" },
  { city: "Goa, India",       days: "Jan 8 – 11",  cost: "₹19,200", flag: "🏖️" },
  { city: "Kerala, India",    days: "Jan 11 – 14", cost: "₹24,800", flag: "🌿" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ─── Sticky Nav ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b border-slate-200/60" style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg" style={{ color: "var(--blue-primary)" }}>
            <Globe2 className="w-6 h-6" />
            <span>GlobeTrotter</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="btn-pill btn-primary px-5 py-2 text-sm text-white font-semibold">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-28 md:pt-28 md:pb-36 grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-blue-100 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Multi-city travel planning, reimagined
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
              Plan trips your{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                spreadsheet
              </span>{" "}
              never could.
            </h1>
            <p className="text-lg text-blue-100/80 max-w-xl mb-8 leading-relaxed">
              Build day-by-day itineraries across multiple cities, track your budget in{" "}
              <strong className="text-white">₹ INR</strong> in real-time, and share the whole plan with one link.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Link href="/signup" className="btn-pill btn-coral inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold">
                Start planning free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="btn-pill inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white border border-white/25 hover:bg-white/10 transition-colors">
                Log in
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-blue-100/60">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free to start</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> Secure &amp; private</span>
            </div>
          </div>

          {/* Right — app preview */}
          <div className="relative animate-fade-up stagger-2">
            <div className="absolute -inset-6 bg-gradient-to-br from-white/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/5">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="mx-auto text-white/40 text-xs font-medium tracking-widest">GlobeTrotter</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-white text-base">Incredible India Tour</p>
                  <span className="pill-badge" style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", border: "1px solid rgba(96,165,250,0.3)" }}>PLANNING</span>
                </div>
                {DEMO_STOPS.map((stop, i) => (
                  <div key={stop.city} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white flex items-center gap-1.5 truncate">
                        <span>{stop.flag}</span> {stop.city}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(147,197,253,0.6)" }}>{stop.days}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-300 shrink-0">{stop.cost}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-sm font-bold text-white">Total budget</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-300">₹1,50,000</span>
                    <span className="text-xs ml-1.5" style={{ color: "rgba(147,197,253,0.5)" }}>· ₹72,500 planned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social proof ────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 py-5">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            {[0,1,2,3,4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            <strong className="text-slate-700 ml-1">4.9 / 5</strong>
          </span>
          <span className="hidden sm:block w-px h-5 bg-slate-200" />
          <span><strong className="text-slate-700">5,000+</strong> trips planned</span>
          <span className="hidden sm:block w-px h-5 bg-slate-200" />
          <span><strong className="text-slate-700">100%</strong> free to start</span>
        </div>
      </div>

      {/* ─── Features ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="section-label mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything a real trip needs</h2>
          <p className="text-slate-500 leading-relaxed">Not a toy demo — a full planning workflow from first idea to the day you leave.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`card-premium p-6 group animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Three steps to wheels-up</h2>
            <p className="text-slate-500 leading-relaxed">You&apos;re building your itinerary within minutes of signing up.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.n} className={`relative text-center animate-fade-up stagger-${i + 1}`}>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-5 text-blue-600 shadow-sm">
                  <step.icon className="w-7 h-7" />
                </div>
                <span className="text-6xl font-black text-slate-100 absolute -top-4 left-1/2 -translate-x-1/2 -z-10 select-none leading-none">{step.n}</span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl hero-gradient px-8 py-20 text-center">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative">
            <div className="flex justify-center gap-1 mb-5">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-300 text-amber-300" />)}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your next trip starts here</h2>
            <p className="text-blue-100/80 max-w-md mx-auto mb-8 leading-relaxed">
              Free to use, ready in minutes, and built for Indian travelers who plan more than one destination.
            </p>
            <Link href="/signup" className="btn-pill btn-coral inline-flex items-center gap-2 px-8 py-4 text-base font-bold shadow-lg">
              Create your free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Globe2 className="w-5 h-5 text-blue-600" /> GlobeTrotter
          </div>
          <p className="text-sm text-slate-400">Built with Next.js · Prisma · PostgreSQL · NextAuth</p>
        </div>
      </footer>

    </main>
  );
}
