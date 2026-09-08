import "server-only";

import { cache } from "react";
import { longLabelForOffset, monthGrid, shortDate, todayIso } from "./schedule";
import {
  daySlots,
  getClosures,
  getWeeklyHours,
  slotTimesForDate,
  weekdayName,
} from "./schedule-store";
import { compareTimes, listAppointments } from "./store";
import { occupiesSlot, type Appointment, type Status } from "./types";

export { statusInk } from "./status";

const TODAY = todayIso();
export { TODAY };
export const TODAY_LABEL = longLabelForOffset(0);

/* The staff pages read the appointment list several times per render (day,
   week and month views, plus the dashboard tiles). cache() makes that one
   query. Also keeps concurrent reads off the Supabase transaction pooler,
   which stalls on pipelined queries. */
const allAppointments = cache(listAppointments);

/** Everything the dashboard needs, from one pass over the store. */
export async function dashboard() {
  const all = await allAppointments();
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
  const capacity = (await slotTimesForDate(iso)).length;
  const all = await allAppointments();
  const booked = all.filter((a) => a.date === iso && occupiesSlot(a.status)).length;
  return Math.max(capacity - booked, 0);
}

/** The day view: every slot the clinic's hours put on `iso` (default today) —
    booked, open, or blocked. Blocked slots stay in the list so staff see the
    day as it really looks; the view labels them "Busy". */
export async function dayRows(iso: string = TODAY) {
  const all = await allAppointments();
  const byTime = new Map(
    all.filter((a) => a.date === iso && occupiesSlot(a.status)).map((a) => [a.time, a]),
  );

  const slots = await daySlots(iso);
  return slots
    .slice()
    .sort((a, b) => compareTimes(a.time, b.time))
    .map((slot) => ({
      time: slot.time,
      appointment: byTime.get(slot.time) ?? null,
      blocked: slot.blocked,
      closureId: slot.closureId,
    }));
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
  const all = await allAppointments();

  const columns = [];
  for (const iso of currentWeekIsos()) {
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const capacity = (await slotTimesForDate(iso)).length;
    const booked = all.filter((a) => a.date === iso && occupiesSlot(a.status)).length;
    columns.push({
      name: `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday]} ${d}`,
      capacity,
      booked,
      open: Math.max(capacity - booked, 0),
      today: iso === TODAY,
    });
  }
  return columns;
}

export type MonthCell =
  | { blank: true }
  | { blank: false; day: number; count: number; closed: boolean; today: boolean };

export async function monthCells(): Promise<MonthCell[]> {
  const all = await allAppointments();
  const week = await getWeeklyHours();
  const closures = await getClosures();
  const fullDayClosed = new Set(closures.filter((c) => c.fromMin == null).map((c) => c.date));
  const grid = monthGrid();
  const cells: MonthCell[] = [];

  for (let i = 0; i < grid.leadingBlanks; i++) cells.push({ blank: true });

  for (let day = 1; day <= grid.daysInMonth; day++) {
    const iso = grid.isoForDay(day);
    const [y, m, d] = iso.split("-").map(Number);
    const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    cells.push({
      blank: false,
      day,
      count: all.filter((a) => a.date === iso && occupiesSlot(a.status)).length,
      closed: fullDayClosed.has(iso) || !week[weekday]?.isOpen,
      today: iso === TODAY,
    });
  }

  return cells;
}

/* Weekly hours as shown (and edited) on /staff/availability. Monday first,
   read live from schedule_hours. */
export type AvailabilityRow = {
  weekday: number;
  day: string;
  isOpen: boolean;
  windows: Array<[number, number]>;
  labels: string[];
};

export async function getAvailabilityRows(): Promise<AvailabilityRow[]> {
  const week = await getWeeklyHours();
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon–Sun
  return order.map((weekday) => {
    const row = week[weekday];
    return {
      weekday,
      day: weekdayName(weekday),
      isOpen: row.isOpen,
      windows: row.windows,
      labels: row.labels,
    };
  });
}

export async function getCurrentBlocks() {
  const closures = await getClosures(TODAY);
  return closures.map((c) => ({
    id: c.id,
    date: shortDate(c.date),
    iso: c.date,
    detail: c.fromMin == null ? "Full day · Closed" : `${c.summary} · Blocked`,
    reason: c.reason,
  }));
}

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
