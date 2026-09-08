import "server-only";

import { cache } from "react";
import { getSql } from "./db";
import {
  type BookingDay,
  buildSlots,
  DEFAULT_WINDOWS,
  isoForOffset,
  labelForOffset,
  MAX_ADVANCE_DAYS,
  MIN_ADVANCE_DAYS,
  minutesToClock,
  partsOfIso,
  slotLabelToMinutes,
} from "./schedule";

/* ─────────────────────────────────────────────────────────────────────────
   The clinic's operating schedule — weekly hours and one-off closures.

   Tables: schedule_hours (one row per weekday) and schedule_closures
   (db/schema.sql). If the tables do not exist yet, or a weekday has no row,
   we fall back to DEFAULT_WINDOWS so the booking flow keeps working; the
   mutations below throw a clear error telling the operator to run the schema.

   The booking slot grid (lib/availability.ts, /api/*), the staff calendar
   (lib/practice.ts) and the staff availability screen all read through here.
   ───────────────────────────────────────────────────────────────────────── */

export type Window = [number, number];

export type WeekdayHours = {
  weekday: number; // 0 = Sunday … 6 = Saturday
  isOpen: boolean;
  windows: Window[];
  /** "08:00 – 14:00" style labels, one per window, for display. */
  labels: string[];
};

export type Closure = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  reason: string;
  fromMin: number | null; // null/null = whole day
  toMin: number | null;
  /** Human summary, e.g. "Full day" or "13:00 – 15:00". */
  summary: string;
};

const WD_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function missingTable(error: unknown) {
  return (
    typeof error === "object" && error !== null && "code" in error && error.code === "42P01"
  );
}

function normaliseWindows(raw: unknown): Window[] {
  if (!Array.isArray(raw)) return [...DEFAULT_WINDOWS];
  const out: Window[] = [];
  for (const pair of raw) {
    if (
      Array.isArray(pair) &&
      pair.length === 2 &&
      typeof pair[0] === "number" &&
      typeof pair[1] === "number" &&
      pair[0] >= 0 &&
      pair[1] > pair[0] &&
      pair[1] <= 24 * 60
    ) {
      out.push([pair[0], pair[1]]);
    }
  }
  return out.sort((a, b) => a[0] - b[0]);
}

function windowLabels(windows: Window[]) {
  return windows.map(([s, e]) => `${minutesToClock(s)} – ${minutesToClock(e)}`);
}

/* ── weekly hours ─────────────────────────────────────────────────────── */

function defaultWeek(): WeekdayHours[] {
  return Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    isOpen: true,
    windows: [...DEFAULT_WINDOWS] as Window[],
    labels: windowLabels(DEFAULT_WINDOWS as Window[]),
  }));
}

/* Both of these are read many times while rendering one page (every slot-grid
   calculation needs them). cache() collapses that to a single query each per
   request. */
export const getWeeklyHours = cache(async (): Promise<WeekdayHours[]> => {
  const week = defaultWeek();
  try {
    const sql = getSql();
    const rows = await sql<{ weekday: number; is_open: boolean; windows: unknown }[]>`
      select weekday, is_open, windows from schedule_hours
    `;
    for (const row of rows) {
      if (row.weekday < 0 || row.weekday > 6) continue;
      const windows = normaliseWindows(row.windows);
      week[row.weekday] = {
        weekday: row.weekday,
        isOpen: row.is_open,
        windows,
        labels: windowLabels(windows),
      };
    }
  } catch (error) {
    if (!missingTable(error)) throw error;
  }
  return week;
});

export async function setWeekdayHours(weekday: number, isOpen: boolean, windows: Window[]) {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new Error("Invalid weekday.");
  }
  const clean = normaliseWindows(windows);
  if (isOpen && clean.length === 0) {
    throw new Error("An open day needs at least one time window.");
  }
  try {
    const sql = getSql();
    await sql`
      insert into schedule_hours (weekday, is_open, windows)
      values (${weekday}, ${isOpen}, ${sql.json(clean)})
      on conflict (weekday) do update set is_open = ${isOpen}, windows = ${sql.json(clean)}
    `;
  } catch (error) {
    if (missingTable(error)) {
      throw new Error("The schedule tables are missing — run db/schema.sql against the database.");
    }
    throw error;
  }
}

/* ── closures ────────────────────────────────────────────────────────── */

function closureSummary(fromMin: number | null, toMin: number | null) {
  if (fromMin == null || toMin == null) return "Full day";
  return `${minutesToClock(fromMin)} – ${minutesToClock(toMin)}`;
}

const getAllClosures = cache(async (): Promise<Closure[]> => {
  try {
    const sql = getSql();
    const rows = await sql<
      { id: string; date: string; reason: string; from_min: number | null; to_min: number | null }[]
    >`select * from schedule_closures order by date, from_min nulls first`;
    return rows.map((r) => ({
      id: r.id,
      date: r.date,
      reason: r.reason,
      fromMin: r.from_min,
      toMin: r.to_min,
      summary: closureSummary(r.from_min, r.to_min),
    }));
  } catch (error) {
    if (missingTable(error)) return [];
    throw error;
  }
});

export async function getClosures(fromIso?: string): Promise<Closure[]> {
  const all = await getAllClosures();
  return fromIso ? all.filter((c) => c.date >= fromIso) : all;
}

export async function addClosure(
  date: string,
  reason: string,
  fromMin: number | null = null,
  toMin: number | null = null,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Enter a valid date.");
  if ((fromMin == null) !== (toMin == null)) {
    throw new Error("A time block needs both a start and an end.");
  }
  if (fromMin != null && toMin != null && toMin <= fromMin) {
    throw new Error("The end time must be after the start time.");
  }
  const id = `cl_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  try {
    const sql = getSql();
    await sql`
      insert into schedule_closures (id, date, reason, from_min, to_min)
      values (${id}, ${date}, ${reason.trim()}, ${fromMin}, ${toMin})
    `;
  } catch (error) {
    if (missingTable(error)) {
      throw new Error("The schedule tables are missing — run db/schema.sql against the database.");
    }
    throw error;
  }
  return id;
}

export async function removeClosure(id: string) {
  try {
    const sql = getSql();
    await sql`delete from schedule_closures where id = ${id}`;
  } catch (error) {
    if (!missingTable(error)) throw error;
  }
}

/* ── the derived schedule the rest of the app consumes ────────────────── */

/** Slot labels the clinic offers on a date, after weekly hours and closures.
    Empty means nothing is bookable that day. */
export async function slotTimesForDate(iso: string): Promise<string[]> {
  const { weekday } = partsOfIso(iso);
  /* Both reads are cache()'d, so calling this in a loop costs one query each
     the first time and nothing after. Sequential, not Promise.all — the
     Supabase transaction pooler does not like pipelined queries. */
  const week = await getWeeklyHours();
  const closures = await getClosures(iso);
  const day = week[weekday];
  if (!day || !day.isOpen) return [];

  const onDate = closures.filter((c) => c.date === iso);
  if (onDate.some((c) => c.fromMin == null)) return []; // full-day closure

  const blocked = onDate
    .filter((c) => c.fromMin != null && c.toMin != null)
    .map((c) => [c.fromMin as number, c.toMin as number] as Window);

  return buildSlots(day.windows).filter((label) => {
    const m = slotLabelToMinutes(label);
    return !blocked.some(([s, e]) => m >= s && m < e);
  });
}

export async function isDateBookable(iso: string): Promise<boolean> {
  return (await slotTimesForDate(iso)).length > 0;
}

/** The patient-facing chooser: MIN…MAX days out, each flagged if it is fully
    closed (weekly-off or a full-day closure). */
export async function getBookingWindow(): Promise<BookingDay[]> {
  const week = await getWeeklyHours();
  const closures = await getClosures(isoForOffset(MIN_ADVANCE_DAYS));
  const fullDay = new Set(closures.filter((c) => c.fromMin == null).map((c) => c.date));

  const days: BookingDay[] = [];
  for (let offset = MIN_ADVANCE_DAYS; offset <= MAX_ADVANCE_DAYS; offset++) {
    const iso = isoForOffset(offset);
    const { weekday } = partsOfIso(iso);
    const closed = fullDay.has(iso) || !week[weekday]?.isOpen;
    days.push({ offset, iso, label: labelForOffset(offset), closed });
  }
  return days;
}

export function weekdayName(weekday: number) {
  return WD_LONG[weekday] ?? String(weekday);
}
