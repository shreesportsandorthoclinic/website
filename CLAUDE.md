@AGENTS.md

# Shree Sports & Ortho Clinic

Marketing site + booking flow + staff practice area for a single-doctor
orthopaedic clinic in Electronic City Phase-1, Bengaluru. Next.js 16 (App
Router, Turbopack), React 19, TypeScript. No CSS framework — design tokens in
`app/globals.css`, everything else inline styles.

**Deploys to Cloudflare Workers** via `@opennextjs/cloudflare` (`wrangler.jsonc`,
`open-next.config.ts`). `npm run preview` runs the built worker locally;
`npm run deploy` ships it. Cloudflare's build settings: build command
`npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare
deploy`. Required env vars on the Worker: `DATABASE_URL`, `STAFF_EMAIL`,
`STAFF_PASSWORD`, `STAFF_SESSION_SECRET` (and `RESEND_*` / `GOOGLE_*` when
ready). The `nodejs_compat` flag is set — needed for `postgres` and `Buffer`.

## Layout

- `app/(site)/` — public site. `/`, `/conditions`, `/treatments`, `/about`,
  `/sports`, `/work`, `/library`, `/patients`, `/contact`, `/book`, `/reviews`,
  and the policy pages (`/privacy`, `/terms`, `/cookies`, `/refund-policy`).
- `app/staff/` — practice area. `login` is public; everything under `(shell)`
  requires a staff session.
- `app/api/` — `booking`, `availability`, `otp/*` (public); `staff/*` (gated).
- `lib/` — all data access and business rules. `components/` — shared UI.
- `proxy.ts` — Next 16's renamed middleware. Gates `/staff/*` and
  `/api/staff/*`.

Most copy lives in `lib/content.ts`. Prefer editing that over hardcoding
strings in pages.

## Data stores

`lib/store.ts` (appointments), `lib/library.ts` (health-library articles) and
`lib/otp.ts` (verification codes) all talk to **Supabase Postgres**. The only
file that knows the connection is `lib/db.ts`, which exports `getSql()` — a
`cache()`-wrapped `postgres` client reading `DATABASE_URL` (the Supabase
**transaction pooler** string, port 6543).

**`getSql()` returns a client scoped to the current request, not a shared
one.** Cloudflare Workers close sockets at the end of each request, so a
module-scope client hangs the next request. Every data-access function starts
with `const sql = getSql();`. Keep that pattern; never hoist `sql` to module
scope. `prepare: false` + `fetch_types: false` are also required for the
Workers runtime.

Every read and write goes through those three modules, so no page or route
changes if the database moves again.

Setup:

1. Create the tables: paste `db/schema.sql` into the Supabase SQL editor and
   run it (idempotent).
2. `npm run db:seed` loads the starting health-library articles. Add `-- --demo`
   to also insert the sample appointments from `lib/seed.ts` (dev only — do not
   run `--demo` against the real clinic database).
3. `npm run db:reset` empties all three tables and re-seeds with demo data.

Article hero images are still stored inline as data URLs in the `image` jsonb
column. If they get large, move them to Supabase Storage — only `lib/library.ts`
would change.

`DATABASE_URL` must also be set in the Cloudflare project's environment
variables for production.

## Environment variables

All in `.env` locally (gitignored); set them in the Vercel project for
production. Only `STAFF_*` are required for the app to work.

| Variable | Required | Purpose |
| --- | --- | --- |
| `STAFF_EMAIL`, `STAFF_PASSWORD` | yes | The single shared staff login. |
| `STAFF_SESSION_SECRET` | yes | Signs the staff session cookie **and** the booking verification tokens. Must be a long random string in production — changing it invalidates all sessions and in-flight OTP tokens. |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | no | Real email delivery for booking OTPs. Without them the code is shown on screen and logged to the console — fine for dev, **no protection in production**. |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | no | Live Google reviews. Without them the site shows "read our reviews on Google" links instead. |

## Booking flow (`/book`)

Four steps: appointment type → doctor → date & time → details. All client
state in one component; availability is fetched from `/api/availability` so
the grid reflects what is actually booked.

- Slots are **15 minutes** (`SLOT_MINUTES` in `lib/schedule.ts`).
- **Opening hours have one source of truth: `CLINIC_WINDOWS` in
  `lib/schedule.ts`** — 08:00–14:00 and 19:00–21:00, every day of the week.
  The slot grid, `clinic.hours` in `lib/content.ts` (header, home, contact,
  condition pages) and the `/staff/availability` table all derive from it.
  Never hardcode a time string anywhere else.
- The calendar is **hardcoded to September 2026** (`MONTH_LABEL`, `TODAY_DAY`,
  `CLOSED_DAYS`). This is prototype scaffolding — it needs replacing with real
  dates driven by the staff availability screen before launch.
- **Email and phone are both mandatory**, and the email must be verified by
  one-time code before a booking is accepted. `lib/otp.ts` issues an
  HMAC-signed token bound to that exact email+phone; `/api/booking` rejects
  anything without a valid one. Also a honeypot field (`company`), a 30s
  resend cooldown, 10-minute expiry and 5-attempt limit.

## Staff area (`/staff`)

One shared credential, no roles or audit log. `proxy.ts` redirects
unauthenticated page requests to `/staff/login` and 401s the APIs; the
`(shell)` layout re-checks, and each `/api/staff/*` route checks again.

`/staff/library` is a full CRUD editor for health-library articles — title,
category, read time, date, author, excerpt, hero image upload and a
block editor (heading / paragraph / note). Public library pages read from the
store and are `force-dynamic`, so edits go live immediately.

If per-user logins are ever needed, replace `lib/auth.ts` with a real provider
(Clerk is available on the Vercel Marketplace); everything else checks through
those helpers.

## Third-party content rules

- **Reviews are never authored by the clinic.** India's NMC conduct
  regulations restrict doctors from soliciting testimonials, so `/reviews` and
  the home page show only an unedited, attributed pull from Google's Places
  API. Never add invented reviewer names, quotes, star ratings or superlatives
  ("best", "No. 1"). If the API is unconfigured or failing, fall back to
  linking out — not to placeholder quotes.
- Google's Places API returns **at most 5 reviews**; that is a hard limit with
  no paid tier around it. `/reviews` shows every one it gets, in full, and says
  so when the profile has more. Cached for an hour (`revalidate: 3600`).
- **The Contact page map loads with the page.** Google's embed may set cookies,
  so `/cookies` discloses it as the site's one third-party embed and the map
  carries a label saying so. If you ever put it back behind a click, update
  that policy page in the same change.

## Conventions

- Policy pages render through `components/LegalPage.tsx`. Text still in
  `[ brackets ]` anywhere is an unanswered question for the clinic — don't
  invent a value.
- `components/Photo.tsx` falls back to a branded panel when a src is empty or
  fails, so a missing photo reads as pending rather than broken.
- Fonts are `next/font` (Poppins + DM Sans), self-hosted at build time. If the
  build machine can't reach Google Fonts you'll see loud warnings and fallback
  fonts — harmless locally, but check them on a real build.
- Run `npx tsc --noEmit` before finishing. There is no test suite.
