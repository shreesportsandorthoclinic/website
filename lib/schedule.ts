/* Pure scheduling rules: which dates a patient may book, which slot times
   exist on a day, and how dates are written. Whether a slot is actually free
   is a question for the store — see lib/availability.ts.

   Dates are real. "Today" is computed in the clinic's timezone (IST, no DST),
   not the server's, so a booking window that opens at 00:00 does so at
   midnight in Bengaluru. */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WD_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function clinicTodayParts() {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return { y: ist.getUTCFullYear(), m: ist.getUTCMonth(), d: ist.getUTCDate() };
}

function isoOf(y: number, mZeroBased: number, d: number) {
  const dt = new Date(Date.UTC(y, mZeroBased, d));
  return dt.toISOString().slice(0, 10);
}

function partsOf(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { y, m, d, weekday };
}

/** { y, m (1-based), d, weekday (0=Sun) } for an ISO date. */
export const partsOfIso = partsOf;

/** Today's date in the clinic's timezone, as an ISO string. */
export function todayIso() {
  const { y, m, d } = clinicTodayParts();
  return isoOf(y, m, d);
}

/** ISO date `offset` days from today (offset 0 = today). */
export function isoForOffset(offset: number) {
  const { y, m, d } = clinicTodayParts();
  return isoOf(y, m, d + offset);
}

/** "Tue 9 Sep" */
export function labelForOffset(offset: number) {
  const { d, m, weekday } = partsOf(isoForOffset(offset));
  return `${WD_SHORT[weekday]} ${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

/** "Tuesday 9 September 2026" */
export function longLabelForOffset(offset: number) {
  const { y, d, m, weekday } = partsOf(isoForOffset(offset));
  return `${WD_LONG[weekday]} ${d} ${MONTHS[m - 1]} ${y}`;
}

/** Short form used on the practice screens, e.g. "9 Sep 2026". */
export function shortDate(iso: string) {
  const { y, d, m } = partsOf(iso);
  return `${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`;
}

/* ─────────────────────────────────────────────────────────────────────────
   Booking window.

   A patient can book from MIN_ADVANCE_DAYS to MAX_ADVANCE_DAYS ahead — no
   same-day bookings, nothing further out than ten days. The booking form
   and /api/booking both pass a day as this offset from today, never a
   calendar date, so the window slides forward on its own every night.
   ───────────────────────────────────────────────────────────────────────── */
export const MIN_ADVANCE_DAYS = 1;
export const MAX_ADVANCE_DAYS = 10;

/* Ad-hoc full-day closures (public holidays, leave), as ISO date strings.
   This is where the staff availability screen would write once it is real.
   Empty means the clinic is open every day in the window. */
export const CLOSED_DATES: ReadonlySet<string> = new Set<string>([]);

export type BookingDay = {
  /** Offset from today; what the form and the API pass around. */
  offset: number;
  iso: string;
  /** "Tue 9 Sep" */
  label: string;
  closed: boolean;
};

export function bookingWindow(): BookingDay[] {
  const days: BookingDay[] = [];
  for (let offset = MIN_ADVANCE_DAYS; offset <= MAX_ADVANCE_DAYS; offset++) {
    const iso = isoForOffset(offset);
    days.push({ offset, iso, label: labelForOffset(offset), closed: CLOSED_DATES.has(iso) });
  }
  return days;
}

export function isBookable(offset: number) {
  if (!Number.isInteger(offset) || offset < MIN_ADVANCE_DAYS || offset > MAX_ADVANCE_DAYS) {
    return false;
  }
  return !CLOSED_DATES.has(isoForOffset(offset));
}

/* ─────────────────────────────────────────────────────────────────────────
   Clinic opening hours — the single source of truth.

   Same windows every day of the week. Everything else derives from here:
   the bookable slot grid below, the labels on `clinic.hours` in
   lib/content.ts (header, home page, contact, condition pages) and the
   weekly table on /staff/availability. Change the windows here and every
   one of those follows. Do not hardcode a time string anywhere else.
   ───────────────────────────────────────────────────────────────────────── */
export const SLOT_MINUTES = 15;

function timeLabel(minutesFromMidnight: number) {
  let hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

export function buildSlots(windows: Array<[number, number]>): string[] {
  const out: string[] = [];
  for (const [start, end] of windows) {
    for (let m = start; m <= end; m += SLOT_MINUTES) out.push(timeLabel(m));
  }
  return out;
}

/** Minutes-from-midnight for a slot label like "10:30 AM" or "5:00 PM". */
export function slotLabelToMinutes(label: string): number {
  const [clock, meridiem] = label.trim().split(" ");
  const [rawHour, minute] = clock.split(":").map(Number);
  const hour = (rawHour % 12) + (meridiem?.toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + (minute || 0);
}

/** "08:00" (24h) → 480. Returns null on anything unparseable. */
export function clockToMinutes(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** 480 → "08:00" (24h). */
export function minutesToClock(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const H = (h: number, m = 0) => h * 60 + m;

/** Fallback clinic hours, used when the schedule_hours table has no row for a
    day (or does not exist yet). The staff availability screen overrides this
    per weekday. */
export const DEFAULT_WINDOWS: Array<[number, number]> = [
  [H(8), H(14)],
  [H(19), H(21)],
];

/** @deprecated use DEFAULT_WINDOWS — kept for existing imports. */
export const CLINIC_WINDOWS = DEFAULT_WINDOWS;

function clockLabel(minutesFromMidnight: number) {
  const hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export const CLINIC_DAYS_LABEL = "All days";

/** e.g. "08:00–14:00 · 19:00–21:00" */
export const CLINIC_HOURS_LABEL = CLINIC_WINDOWS.map(
  ([start, end]) => `${clockLabel(start)}–${clockLabel(end)}`,
).join(" · ");

/** Per-window labels, for screens that show morning and evening separately. */
export const CLINIC_WINDOW_LABELS = CLINIC_WINDOWS.map(
  ([start, end]) => `${clockLabel(start)} – ${clockLabel(end)}`,
);

const DAILY_SLOTS = buildSlots(CLINIC_WINDOWS);

/** Slot times the clinic offers on a given date; empty on a closed day. */
export function slotTimesForDate(iso: string): string[] {
  if (CLOSED_DATES.has(iso)) return [];
  return [...DAILY_SLOTS];
}

/* ── current-month helpers, for the staff calendar's month view ────────── */

export function monthGrid() {
  const { y, m } = clinicTodayParts();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(y, m, 1)).getUTCDay(); // 0 = Sunday
  return {
    year: y,
    monthZeroBased: m,
    label: `${MONTHS[m]} ${y}`,
    daysInMonth,
    /** Blank cells before day 1 when the grid starts on Monday. */
    leadingBlanks: (firstWeekday + 6) % 7,
    isoForDay: (day: number) => isoOf(y, m, day),
  };
}

/* ── appointment types & steps ────────────────────────────────────────── */

export const appointmentTypes = [
  { key: "new", name: "New consultation", note: "First visit for a new problem" },
  { key: "follow", name: "Follow-up", note: "Review of an existing treatment plan" },
  { key: "sports", name: "Sports injury consultation", note: "Injury from gym, running or sport" },
  { key: "physio", name: "Physiotherapy", note: "Availability to be confirmed by the clinic" },
  { key: "other", name: "Other", note: "Tell us more in the reason for visit" },
];

export const bookingSteps = ["Appointment type", "Doctor", "Date & time", "Your details"];

export type Slot = { time: string; taken: boolean };
