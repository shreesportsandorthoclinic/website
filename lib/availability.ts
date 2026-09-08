import "server-only";

import { isoFor, slotTimesFor, type Slot } from "./schedule";
import { takenTimes } from "./store";

/** The clinic's slot times for a day, marked against what is already booked. */
export async function slotsFor(day: number): Promise<Slot[]> {
  const times = slotTimesFor(day);
  if (times.length === 0) return [];

  const taken = await takenTimes(isoFor(day));
  return times.map((time) => ({ time, taken: taken.has(time) }));
}

export async function isSlotFree(day: number, time: string) {
  const slots = await slotsFor(day);
  return slots.some((slot) => slot.time === time && !slot.taken);
}
