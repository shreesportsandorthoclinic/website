import "server-only";

import { getSql } from "./db";
import {
  CATEGORIES,
  PAYMENT_METHODS,
  type BillLine,
  type Category,
  type PaymentMethod,
  type PriceItem,
  type Visit,
  type VisitStatus,
} from "./billing-shared";

/* ─────────────────────────────────────────────────────────────────────────
   Price list and doctor → reception bills.

   Tables: price_items and visits (db/schema.sql). The doctor picks items on
   /staff/consult, which sends a visit to the desk; reception bills it on
   /staff/billing. A visit stores its own copy of each item's name and price,
   so editing the price list never rewrites a bill already raised.

   As elsewhere: getSql() per function, never at module scope.
   ───────────────────────────────────────────────────────────────────────── */

function missingTable(error: unknown) {
  return (
    typeof error === "object" && error !== null && "code" in error && error.code === "42P01"
  );
}

/** Re-throws a missing-table error as one that tells the operator what to do. */
function explain(error: unknown): never {
  if (missingTable(error)) {
    throw new Error("The billing tables are missing — run db/schema.sql against the database.");
  }
  throw error;
}

function newId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/* ── price list ──────────────────────────────────────────────────────── */

type PriceRow = { id: string; category: Category; name: string; price: number; sort: number };

/** Active items, grouped by category. Empty lists if the table is missing. */
export async function getPriceList(): Promise<Record<Category, PriceItem[]>> {
  const list: Record<Category, PriceItem[]> = { consultation: [], radiology: [], procedure: [] };
  try {
    const sql = getSql();
    const rows = await sql<PriceRow[]>`
      select id, category, name, price, sort from price_items
      where active order by sort, created_at
    `;
    for (const row of rows) list[row.category]?.push({ ...row });
  } catch (error) {
    if (!missingTable(error)) throw error;
  }
  return list;
}

function cleanPrice(value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 10_000_000) {
    throw new Error("Enter a price in whole rupees.");
  }
  return Math.round(value);
}

export async function addPriceItem(category: Category, name: string, price: number) {
  if (!CATEGORIES.includes(category)) throw new Error("Unknown category.");
  const clean = name.trim();
  if (!clean) throw new Error("Give the item a name.");
  try {
    const sql = getSql();
    await sql`
      insert into price_items (id, category, name, price, sort)
      select ${newId("pi")}, ${category}, ${clean}, ${cleanPrice(price)},
             coalesce(max(sort), 0) + 1
      from price_items where category = ${category}
    `;
  } catch (error) {
    explain(error);
  }
}

export async function updatePriceItem(id: string, name: string, price: number) {
  const clean = name.trim();
  if (!clean) throw new Error("Give the item a name.");
  try {
    const sql = getSql();
    await sql`
      update price_items set name = ${clean}, price = ${cleanPrice(price)} where id = ${id}
    `;
  } catch (error) {
    explain(error);
  }
}

export async function removePriceItem(id: string) {
  try {
    const sql = getSql();
    await sql`update price_items set active = false where id = ${id}`;
  } catch (error) {
    explain(error);
  }
}

/* ── visits ──────────────────────────────────────────────────────────── */

type VisitRow = {
  id: string;
  date: string;
  patient_name: string;
  patient_phone: string;
  patient_age: string;
  appointment_id: string | null;
  items: BillLine[];
  doctor_note: string;
  status: VisitStatus;
  discount: number;
  payment_method: PaymentMethod | null;
  bill_no: number | null;
  created_at: Date;
  paid_at: Date | null;
};

function toVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    date: row.date,
    patientName: row.patient_name,
    patientPhone: row.patient_phone,
    patientAge: row.patient_age,
    appointmentId: row.appointment_id,
    items: Array.isArray(row.items) ? row.items : [],
    doctorNote: row.doctor_note,
    status: row.status,
    discount: row.discount,
    paymentMethod: row.payment_method,
    billNo: row.bill_no,
    createdAt: row.created_at.toISOString(),
    paidAt: row.paid_at ? row.paid_at.toISOString() : null,
  };
}

/** Every visit on one date, oldest first. Empty if the table is missing. */
export async function visitsOn(date: string): Promise<Visit[]> {
  try {
    const sql = getSql();
    const rows = await sql<VisitRow[]>`
      select * from visits where date = ${date} order by created_at
    `;
    return rows.map(toVisit);
  } catch (error) {
    if (missingTable(error)) return [];
    throw error;
  }
}

/** Bills still waiting at the desk, from any day — a bill left open last
    night should not vanish at midnight. */
export async function openVisits(): Promise<Visit[]> {
  try {
    const sql = getSql();
    const rows = await sql<VisitRow[]>`
      select * from visits where status = 'AT_RECEPTION' order by created_at
    `;
    return rows.map(toVisit);
  } catch (error) {
    if (missingTable(error)) return [];
    throw error;
  }
}

export async function getVisit(id: string): Promise<Visit | null> {
  try {
    const sql = getSql();
    const [row] = await sql<VisitRow[]>`select * from visits where id = ${id}`;
    return row ? toVisit(row) : null;
  } catch (error) {
    if (missingTable(error)) return null;
    throw error;
  }
}

export type NewVisit = {
  date: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  appointmentId: string | null;
  /** Price-item ids with a quantity each. Prices are read from the database
      here, never trusted from the form. */
  picks: { id: string; qty: number }[];
  doctorNote: string;
};

export async function createVisit(input: NewVisit) {
  const name = input.patientName.trim();
  if (!name) throw new Error("Enter the patient's name.");
  if (input.picks.length === 0) throw new Error("Choose at least one item to bill.");

  try {
    const sql = getSql();
    const ids = input.picks.map((p) => p.id);
    const rows = await sql<PriceRow[]>`
      select id, category, name, price, sort from price_items
      where active and id in ${sql(ids)}
    `;
    const byId = new Map(rows.map((r) => [r.id, r]));

    const items: BillLine[] = [];
    for (const pick of input.picks) {
      const row = byId.get(pick.id);
      if (!row) throw new Error("An item was removed from the price list — reload and try again.");
      const qty = Math.min(Math.max(Math.round(pick.qty) || 1, 1), 99);
      items.push({ category: row.category, name: row.name, price: row.price, qty });
    }

    const id = newId("vi");
    await sql`
      insert into visits
        (id, date, patient_name, patient_phone, patient_age, appointment_id, items, doctor_note)
      values (
        ${id}, ${input.date}, ${name}, ${input.patientPhone.trim()}, ${input.patientAge.trim()},
        ${input.appointmentId}, ${sql.json(items)}, ${input.doctorNote.trim()}
      )
    `;
    return id;
  } catch (error) {
    explain(error);
  }
}

/** Withdraw a bill the desk has not taken payment on yet. */
export async function voidVisit(id: string) {
  try {
    const sql = getSql();
    await sql`update visits set status = 'VOID' where id = ${id} and status = 'AT_RECEPTION'`;
  } catch (error) {
    explain(error);
  }
}

/** Reception adds a charge the doctor's list didn't cover. */
export async function addCharge(id: string, name: string, price: number) {
  const clean = name.trim();
  if (!clean) throw new Error("Describe the charge.");
  const line: BillLine = { category: "other", name: clean, price: cleanPrice(price), qty: 1, byReception: true };
  try {
    const sql = getSql();
    const rows = await sql`
      update visits set items = items || ${sql.json([line])}
      where id = ${id} and status = 'AT_RECEPTION'
      returning id
    `;
    if (rows.length === 0) throw new Error("This bill is already closed.");
  } catch (error) {
    explain(error);
  }
}

/** Removes a reception-added line. The doctor's own lines stay put. */
export async function removeCharge(id: string, index: number) {
  const visit = await getVisit(id);
  if (!visit || visit.status !== "AT_RECEPTION") throw new Error("This bill is already closed.");
  const line = visit.items[index];
  if (!line?.byReception) throw new Error("Only charges added at the desk can be removed.");
  const items = visit.items.filter((_, i) => i !== index);
  const sql = getSql();
  await sql`update visits set items = ${sql.json(items)} where id = ${id}`;
}

export async function markPaid(id: string, method: PaymentMethod, discount: number) {
  if (!PAYMENT_METHODS.includes(method)) throw new Error("Choose how the patient paid.");
  const off = cleanPrice(discount);
  const visit = await getVisit(id);
  if (!visit || visit.status !== "AT_RECEPTION") throw new Error("This bill is already closed.");
  const gross = visit.items.reduce((sum, l) => sum + l.price * l.qty, 0);
  if (off > gross) throw new Error("The discount is more than the bill.");

  const sql = getSql();
  const rows = await sql`
    update visits
    set status = 'PAID', payment_method = ${method}, discount = ${off},
        bill_no = nextval('bill_no_seq'), paid_at = now()
    where id = ${id} and status = 'AT_RECEPTION'
    returning id
  `;
  if (rows.length === 0) throw new Error("This bill is already closed.");
}
