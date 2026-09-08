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

`lib/store.ts` (appointments), `lib/library.ts` (articles), `lib/otp.ts`
(verification codes) and `lib/schedule-store.ts` (hours + closures) all talk to
**Supabase Postgres**. The only file that knows the connection is `lib/db.ts`,
which exports `getSql()` — a `cache()`-wrapped `postgres` client reading
`DATABASE_URL` (the Supabase **transaction pooler** string, port 6543).

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
3. `npm run db:reset` empties every table and re-seeds articles, the seven
   `schedule_hours` weekday rows and demo appointments.

Article hero images are still stored inline as data URLs in the `image` jsonb
column. If they get large, move them to Supabase Storage — only `lib/library.ts`
would change.

`DATABASE_URL` must also be set in the Cloudflare project's environment
variables for production.

## Environment variables

All in `.env` locally (gitignored); set them as Cloudflare Worker environment
variables / secrets for production. `STAFF_*` and `DATABASE_URL` are required
for the app to work.

| Variable | Required | Purpose |
| --- | --- | --- |
| `STAFF_EMAIL`, `STAFF_PASSWORD` | yes | The single shared staff login. |
| `STAFF_SESSION_SECRET` | yes | Signs the staff session cookie **and** the booking verification tokens. Must be a long random string in production — changing it invalidates all sessions and in-flight OTP tokens. |
| `DATABASE_URL` | yes | Supabase transaction-pooler string (port 6543). Read by `lib/db.ts`. |
| `SITE_URL` | no | The site's own public URL, for links inside notifications. Defaults to nothing (links are omitted). |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | no | New-booking alerts to the clinic on Telegram. `TELEGRAM_CHAT_ID` may be comma-separated. `npm run telegram:chat-id` helps find the id after the doctor messages the bot. Without these the alert is logged and skipped — a booking never fails over it. |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | no | Real email delivery for booking OTPs. Without them the code is shown on screen and logged to the console — fine for dev, **no protection in production**. |

## Scheduling — hours, slots and closures

**Never cache "today" at module scope** — a Worker isolate outlives the day it
booted on, so `const TODAY = todayIso()` at the top of a module silently serves
yesterday's date until the isolate recycles. Call `todayIso()` per request.

**`lib/schedule.ts`** is pure date/time math (no DB): IST "today", the rolling
booking window (`MIN_ADVANCE_DAYS` 1 → `MAX_ADVANCE_DAYS` 10), slot-label
helpers, `DEFAULT_WINDOWS` (08:00–14:00 & 19:00–21:00), `SLOT_MINUTES` (15).
Safe to import from client components.

**`lib/schedule-store.ts`** is the live schedule, backed by two tables:

- `schedule_hours` — one row per weekday (0=Sun…6=Sat): `is_open` + `windows`
  (`[[startMin,endMin],…]`). Missing rows fall back to `DEFAULT_WINDOWS`, and a
  missing table (error `42P01`) is caught so bookings still work before
  `db/schema.sql` is run.
- `schedule_closures` — full-day closures (`from_min`/`to_min` null) or a
  blocked time range on one date.

`slotTimesForDate(iso)`, `isDateBookable(iso)` and `getBookingWindow()` derive
everything from those. `getWeeklyHours()` and the closures read are
`cache()`-wrapped — call them freely in loops, they hit the DB once per
request. **Do the reads sequentially, not `Promise.all` — the Supabase
transaction pooler stalls on pipelined queries** (this caused the staff
calendar to hang; see `lib/practice.ts` and `app/staff/(shell)/calendar/page.tsx`).

Staff edit all of this on **`/staff/availability`** (weekly hours per weekday,
plus close-a-day / block-time), and can block a single slot from the day view
on **`/staff/calendar`**. The server actions are in `app/staff/actions.ts`
(`saveWeekdayHoursAction`, `addClosureAction`, `removeClosureAction`,
`blockSlotAction`), each guarded by `requireStaffSession()`.

`/book` is now a server component that fetches `getBookingWindow()` and passes
it to the client `BookFlow`, so closed days are struck through in the chooser.

**`clinic.hours` in `lib/content.ts`** (header / home / contact marketing copy)
is still the static `DEFAULT_WINDOWS` label — it is deliberately not wired to
`schedule_hours`, since that is operational, not marketing. If the clinic
changes its standard hours for good, update `DEFAULT_WINDOWS`.

## Booking flow (`/book`)

Four steps: appointment type → doctor → date & time → details. `BookFlow` holds
all client state in one component; availability is fetched from
`/api/availability` (a **day offset** 1–10, never a calendar date) so the grid
reflects live hours, closures and what is already booked.

- **Email and phone are both mandatory**, and the email must be verified by
  one-time code before a booking is accepted. `lib/otp.ts` issues an
  HMAC-signed token bound to that exact email+phone; `/api/booking` rejects
  anything without a valid one. Also a honeypot field (`company`), a 30s
  resend cooldown, 10-minute expiry and 5-attempt limit.

## Testing bookings without an inbox

`docs/postman/` holds a Postman collection that walks the whole public flow —
free slots → OTP request → verify → booking — chaining the ids and tokens
automatically. It works today because `/api/otp/request` returns the code as
`devCode` while `RESEND_API_KEY` is unset; once real email is on, the code has
to come from the inbox. There is deliberately **no** bypass of the
verification token in `/api/booking`. See `docs/postman/README.md`.

## Staff area (`/staff`)

One shared credential, no roles or audit log. `proxy.ts` redirects
unauthenticated page requests to `/staff/login` and 401s the APIs; the
`(shell)` layout re-checks, and each `/api/staff/*` route checks again.

Working staff screens:

- **`/staff`** — dashboard: today's list, pending requests (Confirm / Reschedule
  / Decline), upcoming, cancelled. Status changes are server actions
  (`updateStatusAction`).
- **`/staff/appointments/[id]`** — status buttons + a notes field
  (`saveNotesAction`). "Reschedule" only marks the status; there is no
  new-slot picker yet.
- **`/staff/calendar`** — read-only day/week/month views with ‹ › day
  navigation; the day view's "Block" button on an open slot creates a 15-minute
  closure via `blockSlotAction`.
- **`/staff/availability`** — edits `schedule_hours` and `schedule_closures`
  (see the Scheduling section).
- **`/staff/library`** — full CRUD for articles: title, category, read time,
  date, author, excerpt, hero image and a block editor (heading / paragraph /
  note). Images are downscaled and JPEG-re-encoded **in the browser**
  (`compressImage` in `ArticleAdmin.tsx`) before being stored as a data URL, so
  rows stay small — do not remove that. Public library pages are
  `force-dynamic`, so edits go live immediately.
- **`/staff/notifications`** — reference content only, no controls.

If per-user logins are ever needed, replace `lib/auth.ts` with a real provider
(Clerk is available on the Vercel Marketplace); everything else checks through
those helpers.

## Third-party content rules

- **Reviews are never authored by the clinic.** India's NMC conduct
  regulations restrict doctors from soliciting testimonials, so `/reviews` and
  the home page show only an unedited pull straight from the Google Business
  profile — via an Elfsight "Google Reviews" widget (`components/GoogleReviews.tsx`,
  loaded from `elfsightcdn.com`). Never add invented reviewer names, quotes,
  star ratings or superlatives ("best", "No. 1"), and never hand-key review
  text into the repo. The widget renders its own stars — don't add a separate
  rating number next to it.
- **Two third-party embeds load with the page:** the Google map on `/contact`
  and the Elfsight reviews widget on `/` and `/reviews`. Both may set cookies;
  `/cookies` discloses both. If you add, remove or gate one, update that page
  in the same change.

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
