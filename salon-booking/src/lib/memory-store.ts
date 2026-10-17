import type { BookingRow } from "@/db/schema";
import { overlaps } from "./slots";
import type { BookingStatus, BookingStore, CreateBooking } from "./store";

/** In-memory store for local development and tests when no database is configured. */
export class MemoryStore implements BookingStore {
  private rows: BookingRow[] = [];

  async activeOn(date: string) {
    return this.rows.filter((r) => r.date === date && r.status !== "cancelled");
  }

  async createIfFree(input: CreateBooking) {
    const clash = this.rows.some(
      (r) =>
        r.date === input.date &&
        r.status !== "cancelled" &&
        overlaps(input.startMinute, input.durationMinutes, r.startMinute, r.durationMinutes),
    );
    if (clash) return null;
    const row: BookingRow = {
      id: crypto.randomUUID(),
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      date: input.date,
      startMinute: input.startMinute,
      durationMinutes: input.durationMinutes,
      customerName: input.customerName,
      contact: input.contact,
      note: input.note,
      status: "pending",
      createdAt: new Date(),
    };
    this.rows.push(row);
    return row;
  }

  async list() {
    return [...this.rows].sort(
      (a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute,
    );
  }

  async setStatus(id: string, status: BookingStatus) {
    const row = this.rows.find((r) => r.id === id);
    if (!row) return null;
    row.status = status;
    return row;
  }
}
