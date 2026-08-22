import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <span>🌍</span>
            <span>GlobeTrotter - Odoo Hackathon 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            Plan Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Perfect Adventure</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Multi-city travel planning with smart itineraries, real-time budget tracking,
            and collaborative trip sharing.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Get Started →
            </Link>
            <Link
              href="/api/health"
              className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Check API Health
            </Link>
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: "🧭", title: "Smart Itinerary Builder", desc: "Drag & drop cities and activities. Auto-manage dates and reordering." },
            { icon: "💰", title: "Budget Breakdown", desc: "Track expenses by category, city, and day with visual charts and alerts." },
            { icon: "🔗", title: "Shared & Public Trips", desc: "Generate public links, invite collaborators, or clone a trip template." },
          ].map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔌 Backend API Endpoints</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            {[
              { group: "Auth", endpoints: ["POST /api/auth/signup", "POST /api/auth/login", "GET /api/auth/me", "POST /api/auth/logout"] },
              { group: "User", endpoints: ["GET /api/users/me", "PUT /api/users/me", "DELETE /api/users/me", "PUT /api/users/me/password"] },
              { group: "Trips", endpoints: ["GET /api/trips", "POST /api/trips", "GET /api/trips/:id", "PUT /api/trips/:id", "DELETE /api/trips/:id", "POST /api/trips/:id/copy"] },
              { group: "Stops", endpoints: ["GET /api/trips/:id/stops", "POST /api/trips/:id/stops", "PUT /api/trips/:id/stops/:stopId", "DELETE /api/trips/:id/stops/:stopId", "PUT /api/trips/:id/stops/reorder"] },
              { group: "Activities", endpoints: ["GET /api/activities", "GET /api/activities/:id", "POST /trips/:id/stops/:stopId/activities", "PUT /api/trip-activities/:id", "DELETE /api/trip-activities/:id"] },
              { group: "Budget", endpoints: ["GET /api/trips/:id/budget", "GET /api/trips/:id/expenses", "POST /api/trips/:id/expenses", "PUT /api/expenses/:id", "DELETE /api/expenses/:id"] },
              { group: "Sharing", endpoints: ["GET /api/trips/:id/share", "POST /api/trips/:id/share", "PATCH /api/trips/:id/share/:shareId", "DELETE /api/trips/:id/share/:shareId", "POST /api/trips/:id/share/toggle-public", "GET /api/public/trips/:slug", "POST /api/public/trips/:slug/copy"] },
              { group: "Search + Dashboard", endpoints: ["GET /api/cities", "GET /api/cities/:id", "GET /api/dashboard", "GET /api/health"] },
            ].map((g) => (
              <div key={g.group} className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-3">{g.group}</h4>
                <ul className="space-y-1 font-mono text-xs text-gray-700">
                  {g.endpoints.map((e) => (
                    <li key={e} className="truncate">→ {e}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-gray-500 text-sm">
          <p>Built with Next.js 15 • Prisma • PostgreSQL • NextAuth • TypeScript</p>
        </footer>
      </div>
    </main>
  );
}
