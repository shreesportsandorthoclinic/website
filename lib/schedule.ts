/* Pure scheduling rules: which dates the clinic opens, which slot times exist
   on a given day, and how dates are written. Whether a slot is actually free
   is a question for the store — see lib/availability.ts. */

export const MONTH_LABEL = "September 2026";
export const YEAR = 2026;
export const MONTH = 9;
export const DAYS_IN_MONTH = 30;

/** The prototype treats 2 September 2026 as today. */
export const TODAY_DAY = 2;
export const TODAY_ISO = "2026-09-02";

/** Full-day closures. Mirrors the leave shown on /staff/availability. */
export const CLOSED_DAYS = [8, 15, 23];

export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** September 2026 opens on a Tuesday, so day 1 is weekday index 2. */
export function weekdayOf(day: number) {
  return (day + 1) % 7;
}

export function isoFor(day: number) {
  return `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function dayOf(iso: string) {
  return Number(iso.slice(-2));
}

export function dateLabel(day: number) {
  return `${WEEKDAY_NAMES[weekdayOf(day)]} ${day} September 2026`;
}

/** Short form used on the practice screens, e.g. "2 Sep 2026". */
export function shortDate(iso: string) {
  return `${dayOf(iso)} Sep 2026`;
}

/** Appointments are booked in 15-minute slots. */
export const SLOT_MINUTES = 15;

function timeLabel(minutesFromMidnight: number) {
  let hour = Math.floor(minutesFromMidnight / 60);
  const minute = minutesFromMidnight % 60;
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

/** Build slot labels for one or more [startMinutes, endMinutes] windows,
    stepping by SLOT_MINUTES and including the end time. */
function buildSlots(windows: Array<[number, number]>): string[] {
  const out: string[] = [];
  for (const [start, end] of windows) {
    for (let m = start; m <= end; m += SLOT_MINUTES) out.push(timeLabel(m));
  }
  return out;
}

const H = (h: number, m = 0) => h * 60 + m;

/* ─────────────────────────────────────────────────────────────────────────
   Clinic opening hours — the single source of truth.

   Same windows every day of the week. Everything else derives from here:
   the bookable slot grid below, the labels on `clinic.hours` in
   lib/content.ts (header, home page, contact, condition pages) and the
   weekly table on /staff/availability. Change the windows here and every
   one of those follows. Do not hardcode a time string anywhere else.
   ───────────────────────────────────────────────────────────────────────── */
export const CLINIC_WINDOWS: Array<[number, number]> = [
  [H(8), H(14)],
  [H(19), H(21)],
];

/** "08:00", "14:00" — the 24-hour form used in all patient-facing copy. */
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

/** The clinic keeps the same hours every day; only leave days differ. */
export function slotTimesFor(day: number): string[] {
  if (CLOSED_DAYS.includes(day)) return [];
  return [...DAILY_SLOTS];
}

export function isBookable(day: number) {
  return day >= TODAY_DAY && day <= DAYS_IN_MONTH && !CLOSED_DAYS.includes(day);
}

export type CalendarCell =
  | { blank: true; key: string }
  | { blank: false; key: string; day: number; disabled: boolean; note: string };

export function calendarCells(): CalendarCell[] {
  const cells: CalendarCell[] = [{ blank: true, key: "b0" }];
  for (let day = 1; day <= DAYS_IN_MONTH; day++) {
    const past = day < TODAY_DAY;
    const closed = CLOSED_DAYS.includes(day);
    cells.push({
      blank: false,
      key: `d${day}`,
      day,
      disabled: past || closed,
      note: past ? "" : closed ? "Full" : "",
    });
  }
  return cells;
}

export const appointmentTypes = [
  { key: "new", name: "New consultation", note: "First visit for a new problem" },
  { key: "follow", name: "Follow-up", note: "Review of an existing treatment plan" },
  { key: "sports", name: "Sports injury consultation", note: "Injury from gym, running or sport" },
  { key: "physio", name: "Physiotherapy", note: "Availability to be confirmed by the clinic" },
  { key: "other", name: "Other", note: "Tell us more in the reason for visit" },
];

export const bookingSteps = ["Appointment type", "Doctor", "Date & time", "Your details"];

export type Slot = { time: string; taken: boolean };
