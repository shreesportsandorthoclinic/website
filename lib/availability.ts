import "server-only";

import { isoForOffset, slotTimesForDate, type Slot } from "./schedule";
import { takenTimes } from "./store";

/** The clinic's slot times for a day (given as an offset from today),
    marked against what is already booked. */
export async function slotsFor(offset: number): Promise<Slot[]> {
  const iso = isoForOffset(offset);
  const times = slotTimesForDate(iso);
  if (times.length === 0) return [];

  const taken = await takenTimes(iso);
  return times.map((time) => ({ time, taken: taken.has(time) }));
}

export async function isSlotFree(offset: number, time: string) {
  const slots = await slotsFor(offset);
  return slots.some((slot) => slot.time === time && !slot.taken);
}
