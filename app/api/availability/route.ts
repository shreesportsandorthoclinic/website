import { NextResponse } from "next/server";
import { slotsFor } from "@/lib/availability";
import { isBookable, MAX_ADVANCE_DAYS } from "@/lib/schedule";

/** GET /api/availability?day=3 — open and taken slot times for the day that
    many days from today (1 = tomorrow … 10 = the furthest bookable day). */
export async function GET(request: Request) {
  const day = Number(new URL(request.url).searchParams.get("day"));

  if (!Number.isInteger(day) || day < 1 || day > MAX_ADVANCE_DAYS) {
    return NextResponse.json({ error: "Unknown date." }, { status: 400 });
  }

  if (!isBookable(day)) {
    return NextResponse.json({ day, slots: [], closed: true });
  }

  const slots = await slotsFor(day);
  /* No slots here means the clinic is closed that day (weekly-off or a
     full-day closure) — tell the form so it can say so. */
  return NextResponse.json({ day, slots, closed: slots.length === 0 });
}
