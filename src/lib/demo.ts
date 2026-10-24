import { SALON, getService } from "./config";
import type { BookingStore } from "./store";
import { addDays, localNow, weekdayOf } from "./time";

/**
 * Public demo mode (DEMO_MODE=true). Anyone can open the admin page with one click,
 * so customer contacts and surnames are masked there and sample bookings are added
 * whenever no upcoming bookings exist.
 */
export function isDemo(env = process.env): boolean {
  return env.DEMO_MODE === "true" || env.DEMO_MODE === "1";
}

/** "anna@example.com" -> "a***@example.com", "+48 791 843 254" -> "+48 *** *** 254" */
export function maskContact(contact: string): string {
  const at = contact.indexOf("@");
  if (at > 0) return `${contact[0]}***${contact.slice(at)}`;
  const digits = contact.replace(/\D/g, "");
  if (digits.length >= 6) return `${contact.trim().startsWith("+") ? "+" : ""}${digits.slice(0, 2)} *** *** ${digits.slice(-3)}`;
  return "***";
}

/** "Anna Kowalska" -> "Anna K." */
export function maskName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
}

const SAMPLES = [
  { day: 0, start: 10 * 60, service: "cut", name: "Anna Kowalska", contact: "anna.k@example.com", note: "", status: "confirmed" },
  { day: 0, start: 13 * 60, service: "color", name: "Marta Wiśniewska", contact: "+48 600 100 200", note: "Copper, like last time.", status: "pending" },
  { day: 1, start: 9 * 60 + 30, service: "trim", name: "Olena Bondar", contact: "olena@example.com", note: "", status: "pending" },
  { day: 1, start: 15 * 60, service: "style", name: "Kasia Nowak", contact: "+48 512 333 444", note: "Wedding on Saturday.", status: "confirmed" },
  { day: 2, start: 11 * 60, service: "cut", name: "Piotr Zieliński", contact: "piotr.z@example.com", note: "", status: "cancelled" },
  { day: 2, start: 16 * 60, service: "color", name: "Iryna Koval", contact: "+48 733 555 010", note: "", status: "pending" },
] as const;

/** The next `count` open days after today. */
function nextOpenDays(today: string, count: number): string[] {
  const out: string[] = [];
  for (let d = 1; out.length < count && d <= 14; d++) {
    const date = addDays(today, d);
    if (SALON.hours[weekdayOf(date)]) out.push(date);
  }
  return out;
}

/** Adds sample bookings when the demo has nothing upcoming. Safe to call on every request. */
export async function ensureDemoData(store: BookingStore, now: Date = new Date()): Promise<void> {
  const today = localNow(now).date;
  const all = await store.list();
  if (all.some((b) => b.date >= today)) return;

  const days = nextOpenDays(today, 3);
  for (const s of SAMPLES) {
    const date = days[s.day];
    const hours = date && SALON.hours[weekdayOf(date)];
    const service = getService(s.service);
    if (!hours || !service || s.start + service.minutes > hours.close) continue;
    const row = await store.createIfFree({
      serviceId: service.id,
      serviceName: service.name,
      date,
      startMinute: s.start,
      durationMinutes: service.minutes,
      customerName: s.name,
      contact: s.contact,
      note: s.note,
    });
    if (row && s.status !== "pending") await store.setStatus(row.id, s.status);
  }
}
