# Shree Sports & Ortho Clinic

Next.js 16 (App Router) implementation of the "Shree Sports and Ortho" design
canvas — the public clinic website, the appointment booking journey, and the
staff practice-management screens.

```bash
npm run dev     # http://localhost:3000
npm run build
```

## Routes

**Public site** — `app/(site)/`, wrapped in the sticky header, footer and the
mobile call / directions / book bar.

| Route | Screen |
| --- | --- |
| `/` | Home |
| `/conditions`, `/conditions/[key]` | Condition directory and detail (6 conditions) |
| `/treatments`, `/treatments/[key]` | Treatment directory and detail (10 treatments) |
| `/about` | Dr. Neel |
| `/sports` | Sports medicine |
| `/work` | Work & everyday life |
| `/library` | Health library, category filter, articles open in a dialog (`?a=<key>` deep-links one) |
| `/patients` | First visit, FAQ accordion |
| `/reviews` | Verified-review placeholders |
| `/contact` | Visit the clinic |
| `/book` | Four-step booking, plus confirmed / cancelled / rescheduled / error states |

**Practice management** — `app/staff/`. `/staff/login` is a standalone screen;
everything under `app/staff/(shell)/` shares the practice top bar.

| Route | Screen |
| --- | --- |
| `/staff/login` | Staff sign in |
| `/staff` | Today's dashboard |
| `/staff/calendar` | Day / week / month views |
| `/staff/appointments/[id]` | Appointment detail |
| `/staff/availability` | Weekly hours, block time, leave |
| `/staff/notifications` | Patient message templates |

The canvas modelled these as one prototype with a `route` state variable; here
they are real routes, so links, back/forward and deep links all work. The
canvas's "Mobile screens" board (iframes of the site at 390×844) is not a page —
the same responsive breakpoints do that job at any viewport.

## Where things live

- `app/globals.css` — design tokens and the component classes (`.btn`, `.input`,
  `.table`, `.tag`, `.seg`, `.photo`, `.chip`) ported from the Broadsheet design
  system and retuned by the canvas: teal accent, Poppins / DM Sans, pill buttons,
  24px radii.
- `lib/content.ts` — all clinic copy: conditions, treatments, articles, FAQs,
  sports and workplace content.
- `lib/schedule.ts` — the booking calendar for September 2026 (2 September is
  "today"), slot generation, appointment types.
- `lib/practice.ts` — sample appointments and schedule data for the staff screens.
- `app/api/booking/route.ts` — validates a booking request, writes it to the
  database as `PENDING`, and returns a reference.

Square-bracketed text (`[ To be confirmed ]`) is deliberate: the canvas marks
every fact the clinic has not supplied in writing. Leave it in place until it is
confirmed — it renders in the secondary accent so it is obvious in review.

## Data

Appointments, health-library articles and booking verification codes live in
**Supabase Postgres**. `lib/db.ts` holds the only connection (`DATABASE_URL` —
the Supabase transaction-pooler string, port 6543); `lib/store.ts`,
`lib/library.ts` and `lib/otp.ts` are the only files that run queries. Nothing
else in the app touches storage.

First-time setup:

```bash
# 1. create the tables — paste db/schema.sql into the Supabase SQL editor
# 2. load the starting health-library articles
npm run db:seed
# add sample appointments too (dev only):
npm run db:seed -- --demo

npm run db:reset     # empty all tables, then re-seed with demo data
```

The layers around it:

- `lib/schedule.ts` — pure rules: opening days, slot times per weekday, date
  formatting. No storage.
- `lib/availability.ts` — slot times crossed with what the store says is booked.
- `lib/practice.ts` — the queries the staff screens need.
- `app/staff/actions.ts` — server actions for status changes and notes.

### What works end to end

Book on `/book` → the request lands in the store as `PENDING` → it appears in
**Pending requests** on `/staff` → Confirm/Decline there changes its status →
the slot disappears from (or returns to) the booking calendar. Cancelling or
marking a no-show releases the slot; double-booking is rejected with a 409, both
at the API and at the moment of writing.

Slot availability, the dashboard counts, and the week and month calendar loads
are all derived from stored appointments rather than hardcoded.

## Not yet real

These are marked in the UI as well as here:
- **Rescheduling only sets a status.** Nothing moves an appointment to a new
  slot yet: the staff button marks it `RESCHEDULED`, and the patient-side
  "Reschedule" starts a fresh pick without releasing the original booking.
- **No authentication.** `/staff/login` navigates to the dashboard. The staff
  screens are unprotected and must not be deployed with real patient data until
  auth, roles and audit logging exist.
- **No notification delivery.** Email, SMS and WhatsApp templates are designed
  (`/staff/notifications`) but nothing sends.
- **Reviews and the map** are placeholders pending the clinic's verified Google
  Business and Practo profiles.

## Photography

Photographs are served from `public/images/`. The logo (`logo.jpeg`) is in
place. The eight clinic photographs referenced by `lib/content.ts` are not:

```
public/images/waiting-1.avif      public/images/reception.avif
public/images/waiting-2.avif      public/images/imaging-room.avif
public/images/consult-desk.avif   public/images/imaging-2.avif
public/images/consult-room.avif   public/images/lounge.avif
```

They live in the design canvas under `assets/`. Until they are dropped in, each
figure renders a soft branded panel carrying its alt text rather than a broken
image, so the layout still reads correctly.
