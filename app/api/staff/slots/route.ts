import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth";
import { slotsForDate } from "@/lib/availability";

/** GET /api/staff/slots?date=2026-09-12&excludeId=ap_xyz — slot times on a
    calendar date for the reschedule picker on /staff/appointments/[id].
    Unlike the public /api/availability, this takes a real date (staff can
    reschedule outside the 10-day patient booking window) and can exclude one
    appointment's own current slot from "taken". */
export async function GET(request: Request) {
  try {
    await requireStaffSession();
  } catch {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const excludeId = url.searchParams.get("excludeId") ?? undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Enter a valid date." }, { status: 400 });
  }

  const slots = await slotsForDate(date, excludeId);
  return NextResponse.json({ date, slots, closed: slots.length === 0 });
}
