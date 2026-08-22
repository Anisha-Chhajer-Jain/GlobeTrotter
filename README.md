# GlobeTrotter

Multi-city travel planning app — build itineraries, discover cities and activities, track budgets, and share trips publicly or with collaborators.

## Tech Stack

- **Framework:** Next.js 15 (App Router, Route Handlers)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM (UUID ids)
- **Auth:** NextAuth.js (credentials provider, JWT sessions) + REST-friendly `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` for non-browser clients
- **Validation:** Zod
- **UI:** Tailwind CSS, Recharts (budget charts), @dnd-kit (drag-and-drop reordering, keyboard-accessible), lucide-react (icons)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in real values — at minimum, `DATABASE_URL` and a freshly generated `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
3. Start a local Postgres (or point `DATABASE_URL` at your own):
   ```bash
   docker compose up -d
   ```
4. Run migrations and seed demo data:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Log in with the seeded account: `john@globetrotter.dev` / `password123` (also the default admin — see below).

## Project Structure

```
src/
  app/
    (auth)/          login, signup, forgot-password, reset-password
    (app)/           authenticated app shell — dashboard, trips, explore, community,
                      account calendar, profile, admin
    public/trips/    read-only public share view
    api/             REST route handlers (see below)
  components/        shared UI + itinerary builder + community post pieces
  lib/                api-client, auth, validations, budget calc, currency conversion,
                       rate limiting, env validation, admin gate, email stub
prisma/
  schema.prisma      data model (UUID ids, cascading deletes)
  seed.ts            demo user, cities, activities, sample trip
```

## API Overview

All responses use the envelope `{ success: boolean, data?, error? }` (validation failures also include a non-spec `fieldErrors[]` for form UX).

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password` |
| Users | `GET/PUT/DELETE /api/users/me` (delete requires password confirmation), `PUT /api/users/me/password` |
| Trips | `GET/POST /api/trips`, `GET/PUT/DELETE /api/trips/:id`, `POST /api/trips/:id/copy` |
| Stops | `GET/POST /api/trips/:id/stops`, `PUT/DELETE /api/trips/:id/stops/:stopId`, `PUT /api/trips/:id/stops/reorder` |
| Activities | `GET /api/activities`, `POST /api/trips/:id/stops/:stopId/activities`, `PUT/DELETE /api/trip-activities/:id` |
| Budget | `GET /api/trips/:id/budget`, `GET/POST /api/trips/:id/expenses`, `PUT/DELETE /api/expenses/:id` |
| Sharing | `GET/POST /api/trips/:id/share`, `.../share/toggle-public`, `.../share/:shareId`, `GET /api/public/trips/:slug`, `POST /api/public/trips/:slug/copy` |
| Dashboard | `GET /api/dashboard` (own data) |
| Community | `GET/POST /api/community/posts`, `GET/DELETE /api/community/posts/:id`, `POST .../comments`, `POST .../like` |
| Admin | `GET /api/admin/stats` — platform-wide, gated by `requireAdmin()` (server-enforced via `ADMIN_EMAILS`); `GET /api/admin/users/:userId` — per-user trip drill-down |

Rate limiting (in-memory, single-instance) is applied per-IP in `src/middleware.ts`: 10 req/min on auth-sensitive routes, 120 req/min general API traffic.

Budget totals convert every expense/activity cost into the trip's currency before summing (`src/lib/currency.ts`), using a static snapshot exchange-rate table — good enough for an estimate, not for financial accuracy. Swap in a live FX API before relying on it for anything real.

## Known Limitations

- Rate limiter is in-memory — resets on restart, not distributed-safe across multiple instances.
- Exchange rates are a static snapshot table, not live.
- Password reset / account emails are logged to the server console (`src/lib/email.ts`) — no email provider is wired up yet.
- No automated tests.
