import { SALON } from "./config";
import { addDays, formatMinute, isValidDate, weekdayOf, type LocalNow } from "./time";

export type Busy = { startMinute: number; durationMinutes: number };

export type Slot = { startMinute: number; label: string };

export function overlaps(aStart: number, aLen: number, bStart: number, bLen: number): boolean {
  return aStart < bStart + bLen && bStart < aStart + aLen;
}

export type SlotProblem = "invalid-date" | "past" | "too-far" | "closed" | null;

export function dateProblem(date: string, now: LocalNow): SlotProblem {
  if (!isValidDate(date)) return "invalid-date";
  if (date < now.date) return "past";
  if (date > addDays(now.date, SALON.maxDaysAhead)) return "too-far";
  if (!SALON.hours[weekdayOf(date)]) return "closed";
  return null;
}

/**
 * Free start times for a service of `minutes` on `date`.
 * `busy` must contain only active (non-cancelled) bookings for that date.
 */
export function availableSlots(
  date: string,
  minutes: number,
  busy: readonly Busy[],
  now: LocalNow,
): Slot[] {
  if (dateProblem(date, now)) return [];
  const hours = SALON.hours[weekdayOf(date)]!;
  const slots: Slot[] = [];
  for (let start = hours.open; start + minutes <= hours.close; start += SALON.slotStepMinutes) {
    if (date === now.date && start <= now.minute) continue;
    if (busy.some((b) => overlaps(start, minutes, b.startMinute, b.durationMinutes))) continue;
    slots.push({ startMinute: start, label: formatMinute(start) });
  }
  return slots;
}

/** True if `startMinute` is one of the free slots, used to re-check on submit. */
export function isSlotFree(
  date: string,
  startMinute: number,
  minutes: number,
  busy: readonly Busy[],
  now: LocalNow,
): boolean {
  return availableSlots(date, minutes, busy, now).some((s) => s.startMinute === startMinute);
}
