import "server-only";

import {
  CLOSED_DAYS,
  DAYS_IN_MONTH,
  CLINIC_WINDOW_LABELS,
  isoFor,
  slotTimesFor,
  TODAY_ISO,
  weekdayOf,
} from "./schedule";
import { compareTimes, listAppointments } from "./store";
import { occupiesSlot, type Appointment, type Status } from "./types";

export { statusInk } from "./status";

export { TODAY_ISO as TODAY };
export const TODAY_LABEL = "Wednesday, 2 September 2026";

/** Everything the dashboard needs, from one pass over the store. */
export async function dashboard() {
  const all = await listAppointments();
  const today = all.filter((a) => a.date === TODAY_ISO);
  const upcoming = all.filter((a) => a.date > TODAY_ISO);

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
      free: await openSlotsOn(TODAY_ISO),
    },
  };
}

async function openSlotsOn(iso: string) {
  const day = Number(iso.slice(-2));
  const capacity = slotTimesFor(day).length;
  const all = await listAppointments();
  const booked = all.filter((a) => a.date === iso && occupiesSlot(a.status)).length;
  return Math.max(capacity - booked, 0);
}

/** The day view: every slot the clinic offers today, filled or open. */
export async function dayRows() {
  const all = await listAppointments();
  const byTime = new Map(
    all.filter((a) => a.date === TODAY_ISO && occupiesSlot(a.status)).map((a) => [a.time, a]),
  );

  return slotTimesFor(Number(TODAY_ISO.slice(-2)))
    .sort(compareTimes)
    .map((time) => ({ time, appointment: byTime.get(time) ?? null }));
}

const WEEK = [
  { name: "Mon 31", iso: "2026-08-31", capacity: 12 },
  { name: "Tue 1", iso: "2026-09-01", capacity: 12 },
  { name: "Wed 2", iso: "2026-09-02", capacity: 12 },
  { name: "Thu 3", iso: "2026-09-03", capacity: 12 },
  { name: "Fri 4", iso: "2026-09-04", capacity: 12 },
  { name: "Sat 5", iso: "2026-09-05", capacity: 12 },
  { name: "Sun 6", iso: "2026-09-06", capacity: 16 },
];

export async function weekColumns() {
  const all = await listAppointments();

  return WEEK.map((column) => {
    const booked = all.filter(
      (a) => a.date === column.iso && occupiesSlot(a.status),
    ).length;
    return {
      name: column.name,
      capacity: column.capacity,
      booked,
      open: Math.max(column.capacity - booked, 0),
      today: column.iso === TODAY_ISO,
    };
  });
}

export type MonthCell =
  | { blank: true }
  | { blank: false; day: number; count: number; closed: boolean; today: boolean };

export async function monthCells(): Promise<MonthCell[]> {
  const all = await listAppointments();
  const cells: MonthCell[] = [{ blank: true }];

  for (let day = 1; day <= DAYS_IN_MONTH; day++) {
    const iso = isoFor(day);
    cells.push({
      blank: false,
      day,
      count: all.filter((a) => a.date === iso && occupiesSlot(a.status)).length,
      closed: CLOSED_DAYS.includes(day),
      today: iso === TODAY_ISO,
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

export const currentBlocks = [
  { date: "8 September", detail: "Full day · Surgery list" },
  { date: "15 September", detail: "Full day · Leave" },
  { date: "23 September", detail: "Evening only · Conference" },
];

export const notifications = [
  {
    when: "Immediately after booking",
    channels: "Email · SMS · WhatsApp",
    title: "Appointment confirmed",
    body: "Your appointment with Dr. Neel is confirmed for Wednesday 9 September at 11:00 AM, Shree Sports & Ortho Clinic, Electronic City Phase-1. Bring any previous reports and imaging. Ref SSO-260909-4417.",
  },
  {
    when: "24 hours before",
    channels: "SMS · WhatsApp",
    title: "Reminder — tomorrow",
    body: "Reminder: your appointment with Dr. Neel is tomorrow at 11:00 AM. Reply to this message or call the clinic if you need to change it.",
  },
  {
    when: "2 hours before",
    channels: "SMS · WhatsApp",
    title: "Reminder — today",
    body: "Your appointment is at 11:00 AM today. The clinic is at Neeladri Layout, Doddathoguru, Electronic City Phase-1.",
  },
  {
    when: "On cancellation",
    channels: "Email · SMS",
    title: "Appointment cancelled",
    body: "Your 9 September 11:00 AM appointment has been cancelled and the slot released. You can book again at any time.",
  },
  {
    when: "On reschedule",
    channels: "Email · SMS · WhatsApp",
    title: "Appointment moved",
    body: "Your appointment has been moved to Friday 11 September at 6:00 PM with Dr. Neel. The earlier slot has been released.",
  },
  {
    when: "24 hours after the visit",
    channels: "WhatsApp",
    title: "After your appointment",
    body: "Thank you for visiting. If anything in your plan is unclear, or symptoms change, contact the clinic. A follow-up can be booked from the website.",
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
export { weekdayOf };
