"use server";

import { revalidatePath } from "next/cache";
import { requireStaffSession } from "@/lib/auth";
import {
  notifyAppointmentCancelled,
  notifyAppointmentConfirmed,
  notifyAppointmentRescheduled,
} from "@/lib/notify";
import {
  addClosure,
  removeClosure,
  setWeekdayHours,
  type Window,
} from "@/lib/schedule-store";
import { clockToMinutes, slotLabelToMinutes, SLOT_MINUTES } from "@/lib/schedule";
import {
  getAppointment,
  rescheduleAppointment,
  saveNotes,
  setStatus,
  SlotTakenError,
} from "@/lib/store";
import { STATUSES, type Status } from "@/lib/types";

/* Every action re-checks the session before touching the database. */

function refreshAppointment(id: string) {
  revalidatePath("/staff");
  revalidatePath("/staff/calendar");
  revalidatePath(`/staff/appointments/${id}`);
}

function refreshSchedule() {
  revalidatePath("/staff");
  revalidatePath("/staff/calendar");
  revalidatePath("/staff/availability");
  revalidatePath("/book");
}

/* ── appointments ────────────────────────────────────────────────────── */

export async function updateStatusAction(formData: FormData) {
  await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status as Status)) return;

  const appt = await setStatus(id, status as Status);

  /* Tell the patient by email when it actually changes something they'd
     want to know about. COMPLETED and NO-SHOW are clinic bookkeeping, not
     news to the patient — RESCHEDULED goes through rescheduleAppointmentAction
     below instead, since it also needs the new date/time. */
  if (appt) {
    if (status === "CONFIRMED") await notifyAppointmentConfirmed(appt);
    if (status === "CANCELLED") await notifyAppointmentCancelled(appt);
  }

  refreshAppointment(id);
}

/** Moves an appointment to a new date/time, chosen from the picker on
    /staff/appointments/[id], and emails the patient the new slot. */
export async function rescheduleAppointmentAction(
  _prev: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  try {
    await requireStaffSession();
    const id = String(formData.get("id") ?? "");
    const date = String(formData.get("date") ?? "").trim();
    const time = String(formData.get("time") ?? "").trim();

    if (!id) return { ok: false, message: "Missing appointment." };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) {
      return { ok: false, message: "Choose a date and a time." };
    }

    const previous = await getAppointment(id);
    if (!previous) return { ok: false, message: "Appointment not found." };

    const updated = await rescheduleAppointment(id, date, time);
    await notifyAppointmentRescheduled(updated, previous.date, previous.time);
    refreshAppointment(id);
    return { ok: true, message: "Rescheduled — the patient has been emailed." };
  } catch (error) {
    if (error instanceof SlotTakenError) {
      return { ok: false, message: "That slot is already taken. Choose another time." };
    }
    return { ok: false, message: error instanceof Error ? error.message : "Could not reschedule." };
  }
}

export async function saveNotesAction(formData: FormData) {
  await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "");
  if (!id) return;

  await saveNotes(id, notes);
  refreshAppointment(id);
}

/* ── weekly hours ────────────────────────────────────────────────────── */

export type ScheduleActionState = { ok: boolean; message: string };

export async function saveWeekdayHoursAction(
  _prev: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  try {
    await requireStaffSession();
    const weekday = Number(formData.get("weekday"));
    const isOpen = formData.get("isOpen") === "on";

    const windows: Window[] = [];
    for (const label of ["morning", "evening"]) {
      const from = clockToMinutes(String(formData.get(`${label}From`) ?? ""));
      const to = clockToMinutes(String(formData.get(`${label}To`) ?? ""));
      if (from == null && to == null) continue;
      if (from == null || to == null || to <= from) {
        return { ok: false, message: `Enter a valid ${label} start and end time.` };
      }
      windows.push([from, to]);
    }

    await setWeekdayHours(weekday, isOpen, windows);
    refreshSchedule();
    return { ok: true, message: "Saved." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save." };
  }
}

/* ── closures / blocked time ─────────────────────────────────────────── */

export async function addClosureAction(
  _prev: ScheduleActionState,
  formData: FormData,
): Promise<ScheduleActionState> {
  try {
    await requireStaffSession();
    const date = String(formData.get("date") ?? "").trim();
    const reason = String(formData.get("reason") ?? "");
    const wholeDay = formData.get("wholeDay") === "on";

    let fromMin: number | null = null;
    let toMin: number | null = null;
    if (!wholeDay) {
      fromMin = clockToMinutes(String(formData.get("from") ?? ""));
      toMin = clockToMinutes(String(formData.get("to") ?? ""));
      if (fromMin == null || toMin == null) {
        return { ok: false, message: "Enter a start and end time, or tick “whole day”." };
      }
    }

    await addClosure(date, reason, fromMin, toMin);
    refreshSchedule();
    return { ok: true, message: wholeDay ? "Day closed." : "Time blocked." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not add." };
  }
}

export async function removeClosureAction(formData: FormData) {
  await requireStaffSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await removeClosure(id);
  refreshSchedule();
}

/** Block a single slot from the calendar day view. */
export async function blockSlotAction(formData: FormData) {
  await requireStaffSession();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return;

  const start = slotLabelToMinutes(time);
  await addClosure(date, "Blocked from calendar", start, start + SLOT_MINUTES);
  refreshSchedule();
}
