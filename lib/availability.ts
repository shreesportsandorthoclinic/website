import "server-only";

import { isBookable, isoForOffset, type Slot } from "./schedule";
import { slotTimesForDate } from "./schedule-store";
import { takenTimes } from "./store";

/** The clinic's slot times for a day (given as an offset from today),
    marked against what is already booked. */
export async function slotsFor(offset: number): Promise<Slot[]> {
  const iso = isoForOffset(offset);
  const times = await slotTimesForDate(iso);
  if (times.length === 0) return [];

  const taken = await takenTimes(iso);
  return times.map((time) => ({ time, taken: taken.has(time) }));
}

export async function isSlotFree(offset: number, time: string) {
  const slots = await slotsFor(offset);
  return slots.some((slot) => slot.time === time && !slot.taken);
}

/** Whether a patient may still book the day at this offset — inside the
    window and not fully closed by weekly hours or a closure. */
export async function isOffsetBookable(offset: number) {
  if (!isBookable(offset)) return false;
  return (await slotsFor(offset)).length > 0;
}
