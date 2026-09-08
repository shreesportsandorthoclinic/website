import "server-only";

import {
  CLINIC_WINDOW_LABELS,
  CLOSED_DATES,
  longLabelForOffset,
  monthGrid,
  shortDate,
  slotTimesForDate,
  todayIso,
} from "./schedule";
import { compareTimes, listAppointments } from "./store";
import { occupiesSlot, type Appointment, type Status } from "./types";

export { statusInk } from "./status";

const TODAY = todayIso();
export { TODAY };
export const TODAY_LABEL = longLabelForOffset(0);

/** Everything the dashboard needs, from one pass over the store. */
export async function dashboard() {
  const all = await listAppointments();
  const today = all.filter((a) => a.date === TODAY);
  const upcoming = all.filter((a) => a.date > TODAY);

  return {
    today,
    upcoming,
    pending: all.filter((a) => a.status === "PENDING"),
    cancelled: all.filter((a) => a.status === "CANCELLED" || a.status === "NO-SHOW"),
    counts: {
      today: today.length,
      upcoming: upcoming.length,
      pending: all.filter((a) => a.status === "PENDING").length,
      cancelled: all.filter((a) => a.status === "CANCELLED").length,
      free: await openSlotsOn(TODAY),
    },
  };
}

async function openSlotsOn(iso: string) {
  const capacity = slotTimesForDate(iso).length;
  const all = await listAppointments();
  const booked = all.filter((a) => a.date === iso && occupiesSlot(a.status)).length;
  return Math.max(capacity - booked, 0);
}

/** The day view: every slot the clinic offers today, filled or open. */
export async function dayRows() {
  const all = await listAppointments();
  const byTime = new Map(
    all.filter((a) => a.date === TODAY && occupiesSlot(a.status)).map((a) => [a.time, a]),
  );

  return slotTimesForDate(TODAY)
    .sort(compareTimes)
    .map((time) => ({ time, appointment: byTime.get(time) ?? null }));
}

/** The seven days of the current week (Monday–Sunday) that contains today. */
function currentWeekIsos() {
  const [y, m, d] = TODAY.split("-").map(Number);
  const midday = Date.UTC(y, m - 1, d);
  const weekday = new Date(midday).getUTCDay(); // 0 = Sunday
  const mondayOffset = (weekday + 6) % 7;
  const isos: string[] = [];
  for (let i = 0; i < 7; i++) {
    isos.push(new Date(midday + (i - mondayOffset) * 86_400_000).toISOString().slice(0, 10));
  }
  return isos;
}

export async function weekColumns() {
  const all = await listAppointments();

  return currentWeekIsos().map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const capacity = slotTimesForDate(iso).length;
    const booked = all.filter((a) => a.date === iso && occupiesSlot(a.status)).length;
    return {
      name: `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday]} ${d}`,
      capacity,
      booked,
      open: Math.max(capacity - booked, 0),
      today: iso === TODAY,
    };
  });
}

export type MonthCell =
  | { blank: true }
  | { blank: false; day: number; count: number; closed: boolean; today: boolean };

export async function monthCells(): Promise<MonthCell[]> {
  const all = await listAppointments();
  const grid = monthGrid();
  const cells: MonthCell[] = [];

  for (let i = 0; i < grid.leadingBlanks; i++) cells.push({ blank: true });

  for (let day = 1; day <= grid.daysInMonth; day++) {
    const iso = grid.isoForDay(day);
    cells.push({
      blank: false,
      day,
      count: all.filter((a) => a.date === iso && occupiesSlot(a.status)).length,
      closed: CLOSED_DATES.has(iso),
      today: iso === TODAY,
    });
  }

  return cells;
}

/* Same hours every day of the week — the windows come from
   CLINIC_WINDOW_LABELS so this table and the bookable slot grid always
   agree. See CLINIC_WINDOWS in lib/schedule.ts. */
export const availabilityRows = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
  (day) => ({
    day,
    morning: CLINIC_WINDOW_LABELS[0],
    evening: CLINIC_WINDOW_LABELS[1],
    note: "Standard",
  }),
);

export const currentBlocks: Array<{ date: string; detail: string }> = [...CLOSED_DATES].map((iso) => ({
  date: shortDate(iso),
  detail: "Full day · Closed",
}));

export const notifications = [
  {
    when: "Immediately after booking",
    channels: "Telegram (clinic)",
    title: "New appointment request",
    body: "R. Prakash · New consultation · Tue 9 Sep at 11:00 AM · 📞 90000 00001. Open in staff area to confirm.",
  },
  {
    when: "On confirm / decline / reschedule",
    channels: "Email (patient)",
    title: "Appointment confirmed",
    body: "Your appointment with Dr. Neel is confirmed for Tuesday 9 September at 11:00 AM, Shree Sports & Ortho Clinic, Electronic City Phase-1. Bring any previous reports and imaging. Ref SSO-260909-4417.",
  },
  {
    when: "Booking verification",
    channels: "Email (patient)",
    title: "Your booking code",
    body: "Your verification code is 481920. Enter it on the booking page to confirm your appointment request. It expires in 10 minutes.",
  },
];

export const plannedFeatures = [
  "Patient portal",
  "Secure document upload",
  "Prescriptions & reports",
  "Treatment plans",
  "Online payments",
  "Digital intake forms",
  "Symptom navigation — “this is not a diagnosis”",
  "Rehabilitation tracking",
];

export type { Appointment, Status };
