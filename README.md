# GlobeTrotter

Multi-city travel planning app — build itineraries, discover cities and activities, track budgets, and share trips publicly or with collaborators.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Route Handlers)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (credentials provider, JWT sessions) + a REST-friendly `/api/auth/login` alias for non-browser clients
- **Validation:** Zod
- **UI:** Tailwind CSS, Recharts (budget charts), @dnd-kit (drag-and-drop reordering), lucide-react (icons)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env` and set `DATABASE_URL` to a running PostgreSQL instance (and rotate `NEXTAUTH_SECRET` for anything beyond local dev).
3. Run migrations and seed demo data:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Log in with the seeded account: `john@globetrotter.dev` / `password123`.

## Project Structure

```
src/
  app/
    (auth)/          login, signup
    (app)/           authenticated app shell — dashboard, trips, explore, profile, admin
    public/trips/    read-only public share view
    api/             REST route handlers (see below)
  components/        shared UI + itinerary builder pieces
  lib/                api-client, auth, validations, budget calc, rate limiting
prisma/
  schema.prisma      data model (UUID ids, cascading deletes)
  seed.ts            demo user, cities, activities, sample trip
```

## API Overview

All responses use the envelope `{ success: boolean, data?, error? }` (validation failures also include a non-spec `fieldErrors[]` for form UX).

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Users | `GET/PUT/DELETE /api/users/me`, `PUT /api/users/me/password` |
| Trips | `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/:id`, `POST /api/trips/:id/copy` |
| Stops | `GET/POST /api/trips/:id/stops`, `PUT/DELETE /api/trips/:id/stops/:stopId`, `PUT /api/trips/:id/stops/reorder` |
| Activities | `GET /api/activities`, `POST /api/trips/:id/stops/:stopId/activities`, `PUT/DELETE /api/trip-activities/:id` |
| Budget | `GET /api/trips/:id/budget`, `GET/POST /api/trips/:id/expenses`, `PUT/DELETE /api/expenses/:id` |
| Sharing | `GET/POST /api/trips/:id/share`, `.../share/toggle-public`, `.../share/:shareId`, `GET /api/public/trips/:slug`, `POST /api/public/trips/:slug/copy` |
| Dashboard | `GET /api/dashboard` |

Rate limiting (in-memory, single-instance) is applied per-IP in `src/middleware.ts`: 10 req/min on auth-sensitive routes, 120 req/min general API traffic.

## Known Limitations

- Rate limiter is in-memory — resets on restart, not distributed-safe across multiple instances.
- Admin dashboard (`/admin`) is gated client-side via `NEXT_PUBLIC_ADMIN_EMAILS`, not a real backend authorization boundary.
- No "forgot password" flow yet.
