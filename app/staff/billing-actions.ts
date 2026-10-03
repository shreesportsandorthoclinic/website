"use server";

import { revalidatePath } from "next/cache";
import { requireStaffSession } from "@/lib/auth";
import {
  addCharge,
  addPriceItem,
  createVisit,
  markPaid,
  removeCharge,
  removePriceItem,
  updatePriceItem,
  voidVisit,
} from "@/lib/billing";
import { CATEGORIES, PAYMENT_METHODS, type Category, type PaymentMethod } from "@/lib/billing-shared";
import { todayIso } from "@/lib/schedule";
import { getAppointment, setStatus } from "@/lib/store";

/* Consult → billing actions. Every one re-checks the session first. */

export type BillingActionState = { ok: boolean; message: string };

function refreshBilling() {
  revalidatePath("/staff/consult");
  revalidatePath("/staff/billing");
}

function failed(error: unknown, fallback: string): BillingActionState {
  return { ok: false, message: error instanceof Error ? error.message : fallback };
}

/* ── doctor ──────────────────────────────────────────────────────────── */

/** The doctor's "Send to reception". Form fields:
      appointmentId?, name, phone, age, note,
      consultation   (a price-item id, or empty for none)
      pick           (repeated; radiology / procedure price-item ids)
      qty_<id>       (quantity for each pick, default 1) */
export async function sendVisitAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await requireStaffSession();
    const appointmentId = String(formData.get("appointmentId") ?? "") || null;

    const picks: { id: string; qty: number }[] = [];
    const consultation = String(formData.get("consultation") ?? "");
    if (consultation) picks.push({ id: consultation, qty: 1 });
    for (const value of formData.getAll("pick")) {
      const id = String(value);
      picks.push({ id, qty: Number(formData.get(`qty_${id}`) ?? 1) });
    }

    await createVisit({
      date: todayIso(),
      patientName: String(formData.get("name") ?? ""),
      patientPhone: String(formData.get("phone") ?? ""),
      patientAge: String(formData.get("age") ?? ""),
      appointmentId,
      picks,
      doctorNote: String(formData.get("note") ?? ""),
    });

    /* A booked patient who has been seen is done — mark the appointment so
       the dashboard and calendar agree. */
    if (appointmentId) {
      const appt = await getAppointment(appointmentId);
      if (appt && appt.status !== "COMPLETED") {
        await setStatus(appointmentId, "COMPLETED");
        revalidatePath("/staff");
        revalidatePath("/staff/calendar");
        revalidatePath(`/staff/appointments/${appointmentId}`);
      }
    }

    refreshBilling();
    return { ok: true, message: "Sent to reception." };
  } catch (error) {
    return failed(error, "Could not send.");
  }
}

export async function voidVisitAction(formData: FormData) {
  await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await voidVisit(id);
  refreshBilling();
}

/* ── reception ───────────────────────────────────────────────────────── */

export async function addChargeAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await requireStaffSession();
    await addCharge(
      String(formData.get("id") ?? ""),
      String(formData.get("name") ?? ""),
      Number(formData.get("price") || NaN),
    );
    refreshBilling();
    return { ok: true, message: "" };
  } catch (error) {
    return failed(error, "Could not add the charge.");
  }
}

export async function removeChargeAction(formData: FormData) {
  await requireStaffSession();
  await removeCharge(String(formData.get("id") ?? ""), Number(formData.get("index")));
  refreshBilling();
}

export async function markPaidAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await requireStaffSession();
    const id = String(formData.get("id") ?? "");
    const method = String(formData.get("method") ?? "") as PaymentMethod;
    if (!PAYMENT_METHODS.includes(method)) return { ok: false, message: "Choose how the patient paid." };
    const discountRaw = String(formData.get("discount") ?? "").trim();
    await markPaid(id, method, discountRaw ? Number(discountRaw) : 0);
    refreshBilling();
    revalidatePath(`/staff/billing/${id}`);
    return { ok: true, message: "Paid." };
  } catch (error) {
    return failed(error, "Could not record the payment.");
  }
}

/* ── price list ──────────────────────────────────────────────────────── */

function refreshPrices() {
  revalidatePath("/staff/prices");
  revalidatePath("/staff/consult");
}

export async function addPriceItemAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await requireStaffSession();
    const category = String(formData.get("category") ?? "") as Category;
    if (!CATEGORIES.includes(category)) return { ok: false, message: "Unknown category." };
    await addPriceItem(
      category,
      String(formData.get("name") ?? ""),
      Number(formData.get("price") || NaN),
    );
    refreshPrices();
    return { ok: true, message: "Added." };
  } catch (error) {
    return failed(error, "Could not add.");
  }
}

export async function updatePriceItemAction(
  _prev: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  try {
    await requireStaffSession();
    await updatePriceItem(
      String(formData.get("id") ?? ""),
      String(formData.get("name") ?? ""),
      Number(formData.get("price") || NaN),
    );
    refreshPrices();
    return { ok: true, message: "Saved." };
  } catch (error) {
    return failed(error, "Could not save.");
  }
}

export async function removePriceItemAction(formData: FormData) {
  await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await removePriceItem(id);
  refreshPrices();
}
