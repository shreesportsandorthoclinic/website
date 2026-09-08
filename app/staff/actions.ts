"use server";

import { revalidatePath } from "next/cache";
import { saveNotes, setStatus } from "@/lib/store";
import { STATUSES, type Status } from "@/lib/types";

/* No authentication yet — see the README. When auth lands, every action here
   needs a session check and an audit entry before it touches the store. */

function refresh(id: string) {
  revalidatePath("/staff");
  revalidatePath("/staff/calendar");
  revalidatePath(`/staff/appointments/${id}`);
}

export async function updateStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !STATUSES.includes(status as Status)) return;

  await setStatus(id, status as Status);
  refresh(id);
}

export async function saveNotesAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!id) return;

  await saveNotes(id, notes);
  refresh(id);
}
