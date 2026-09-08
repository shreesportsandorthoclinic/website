import { NextResponse } from "next/server";
import { slotsFor } from "@/lib/availability";
import { DAYS_IN_MONTH, isBookable } from "@/lib/schedule";

/** GET /api/availability?day=9 — open and taken slot times for that date. */
export async function GET(request: Request) {
  const day = Number(new URL(request.url).searchParams.get("day"));

  if (!Number.isInteger(day) || day < 1 || day > DAYS_IN_MONTH) {
    return NextResponse.json({ error: "Unknown date." }, { status: 400 });
  }

  if (!isBookable(day)) {
    return NextResponse.json({ day, slots: [], closed: true });
  }

  return NextResponse.json({ day, slots: await slotsFor(day), closed: false });
}
