import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedAppointments } from "./seed";
import { occupiesSlot, type Appointment, type NewAppointment, type Status } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Temporary local store.

   Appointments live in a JSON file under .data/. This is a stand-in for a
   real database: it is single-process, it holds the whole table in memory on
   every write, and on a serverless host the filesystem is ephemeral, so
   anything written in production disappears. Fine for development and for
   demonstrating the flow; replace before the clinic depends on it.

   Every read and write in the app goes through the functions below, so
   swapping in Postgres (or anything else) means reimplementing this file
   only — no page or route needs to change.
   ───────────────────────────────────────────────────────────────────────── */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

/* Writes are serialised through this chain so two concurrent requests cannot
   read-modify-write over each other. */
let queue: Promise<unknown> = Promise.resolve();

function serialise<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work);
  queue = next.catch(() => {});
  return next;
}

async function readAll(): Promise<Appointment[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Appointment[];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
  await writeAll(seedAppointments);
  return [...seedAppointments];
}

async function writeAll(rows: Appointment[]) {
  await mkdir(DATA_DIR, { recursive: true });
  /* Write to a sibling file and rename, so an interrupted write cannot leave
     a half-written JSON file behind. */
  const temporary = `${DATA_FILE}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(rows, null, 2), "utf8");
  await rename(temporary, DATA_FILE);
}

/* ── queries ──────────────────────────────────────────────────────────── */

export async function listAppointments(): Promise<Appointment[]> {
  const rows = await readAll();
  return rows.sort((a, b) => a.date.localeCompare(b.date) || compareTimes(a.time, b.time));
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const rows = await readAll();
  return rows.find((row) => row.id === id) ?? null;
}

export async function appointmentsOn(date: string): Promise<Appointment[]> {
  const rows = await listAppointments();
  return rows.filter((row) => row.date === date);
}

/** Slot labels already spoken for on a given date. */
export async function takenTimes(date: string): Promise<Set<string>> {
  const rows = await appointmentsOn(date);
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
  return serialise(async () => {
    const rows = await readAll();

    const clash = rows.some(
      (row) => row.date === input.date && row.time === input.time && occupiesSlot(row.status),
    );
    if (clash) throw new SlotTakenError();

    const appointment: Appointment = {
      ...input,
      status: input.status ?? "PENDING",
      id: newId(),
      reference: reference(input.date),
      createdAt: new Date().toISOString(),
    };

    await writeAll([...rows, appointment]);
    return appointment;
  });
}

export async function setStatus(id: string, status: Status): Promise<Appointment | null> {
  return serialise(async () => {
    const rows = await readAll();
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) return null;

    const updated = { ...rows[index], status };
    const next = [...rows];
    next[index] = updated;
    await writeAll(next);
    return updated;
  });
}

export async function saveNotes(id: string, notes: string): Promise<Appointment | null> {
  return serialise(async () => {
    const rows = await readAll();
    const index = rows.findIndex((row) => row.id === id);
    if (index === -1) return null;

    const updated: Appointment = { ...rows[index], notes };
    const next = [...rows];
    next[index] = updated;
    await writeAll(next);
    return updated;
  });
}

/** Wipes the store back to the seed records. Used by `npm run db:reset`. */
export async function resetStore() {
  return serialise(async () => {
    await writeAll(seedAppointments);
    return seedAppointments.length;
  });
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
