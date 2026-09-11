import { NextResponse } from "next/server";
import { slotsFor } from "@/lib/availability";
import { isBookable, MAX_ADVANCE_DAYS, MIN_ADVANCE_DAYS } from "@/lib/schedule";

/** GET /api/availability?day=3 — open and taken slot times for the day that
    many days from today (0 = today … 10 = the furthest bookable day). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("day");
  const day = Number(raw);

  /* `raw` must be present and non-empty — Number(null) and Number("") are
     both 0, which would otherwise silently pass as "today" instead of being
     rejected as a missing parameter. */
  if (!raw || !Number.isInteger(day) || day < MIN_ADVANCE_DAYS || day > MAX_ADVANCE_DAYS) {
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
