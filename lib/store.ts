import "server-only";

import { sql } from "./db";
import { occupiesSlot, type Appointment, type NewAppointment, type Status } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Appointments store — Supabase Postgres (`appointments` table, created by
   db/schema.sql).

   Every read and write in the app goes through the functions below. Column
   names are snake_case in the database and mapped to the camelCase
   Appointment shape here, so nothing else in the app has to know.
   ───────────────────────────────────────────────────────────────────────── */

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  type: string;
  date: string;
  time: string;
  status: Status;
  reason: string;
  history: string;
  reference: string;
  notes: string | null;
  created_at: Date;
};

function toAppointment(row: Row): Appointment {
  const appointment: Appointment = {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    age: row.age,
    type: row.type,
    date: row.date,
    time: row.time,
    status: row.status,
    reason: row.reason,
    history: row.history,
    reference: row.reference,
    createdAt: row.created_at.toISOString(),
  };
  if (row.notes != null) appointment.notes = row.notes;
  return appointment;
}

/* ── queries ──────────────────────────────────────────────────────────── */

export async function listAppointments(): Promise<Appointment[]> {
  const rows = await sql<Row[]>`select * from appointments`;
  return rows
    .map(toAppointment)
    .sort((a, b) => a.date.localeCompare(b.date) || compareTimes(a.time, b.time));
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const [row] = await sql<Row[]>`select * from appointments where id = ${id}`;
  return row ? toAppointment(row) : null;
}

export async function appointmentsOn(date: string): Promise<Appointment[]> {
  const rows = await sql<Row[]>`select * from appointments where date = ${date}`;
  return rows.map(toAppointment).sort((a, b) => compareTimes(a.time, b.time));
}

/** Slot labels already spoken for on a given date. */
export async function takenTimes(date: string): Promise<Set<string>> {
  const rows = await sql<{ time: string; status: Status }[]>`
    select time, status from appointments where date = ${date}
  `;
  return new Set(rows.filter((row) => occupiesSlot(row.status)).map((row) => row.time));
}

/* ── mutations ────────────────────────────────────────────────────────── */

export class SlotTakenError extends Error {
  constructor() {
    super("That slot is no longer available.");
    this.name = "SlotTakenError";
  }
}

export async function createAppointment(input: NewAppointment): Promise<Appointment> {
  const status: Status = input.status ?? "PENDING";
  const id = newId();
  const bookingReference = reference(input.date);

  /* Insert only if the slot is still free, evaluated inside the same
     statement, so two bookings racing for one slot cannot both win. */
  const rows = await sql<Row[]>`
    insert into appointments
      (id, name, phone, email, age, type, date, time, status, reason, history, reference)
    select
      ${id}, ${input.name}, ${input.phone}, ${input.email}, ${input.age},
      ${input.type}, ${input.date}, ${input.time}, ${status}, ${input.reason},
      ${input.history}, ${bookingReference}
    where not exists (
      select 1 from appointments
      where date = ${input.date}
        and time = ${input.time}
        and status not in ('CANCELLED', 'NO-SHOW')
    )
    returning *
  `;

  if (rows.length === 0) throw new SlotTakenError();
  return toAppointment(rows[0]);
}

export async function setStatus(id: string, status: Status): Promise<Appointment | null> {
  const [row] = await sql<Row[]>`
    update appointments set status = ${status} where id = ${id} returning *
  `;
  return row ? toAppointment(row) : null;
}

export async function saveNotes(id: string, notes: string): Promise<Appointment | null> {
  const [row] = await sql<Row[]>`
    update appointments set notes = ${notes} where id = ${id} returning *
  `;
  return row ? toAppointment(row) : null;
}

/* ── helpers ──────────────────────────────────────────────────────────── */

function newId() {
  return `ap_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function reference(date: string) {
  const compact = date.replaceAll("-", "").slice(2);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `SSO-${compact}-${suffix}`;
}

/** Sorts "10:30 AM" before "5:00 PM" — clock order, not string order. */
export function compareTimes(a: string, b: string) {
  return minutesOf(a) - minutesOf(b);
}

function minutesOf(label: string) {
  const [clock, meridiem] = label.split(" ");
  const [rawHour, minute] = clock.split(":").map(Number);
  const hour = (rawHour % 12) + (meridiem === "PM" ? 12 : 0);
  return hour * 60 + minute;
}
