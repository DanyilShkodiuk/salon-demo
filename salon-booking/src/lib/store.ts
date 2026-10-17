import type { BookingRow } from "@/db/schema";

export type CreateBooking = {
  serviceId: string;
  serviceName: string;
  date: string;
  startMinute: number;
  durationMinutes: number;
  customerName: string;
  contact: string;
  note: string;
};

export type BookingStatus = BookingRow["status"];

export interface BookingStore {
  /** Active (pending or confirmed) bookings on a date. */
  activeOn(date: string): Promise<BookingRow[]>;
  /**
   * Insert only if the time range is still free.
   * Returns null when it overlaps an active booking.
   */
  createIfFree(input: CreateBooking): Promise<BookingRow | null>;
  list(): Promise<BookingRow[]>;
  setStatus(id: string, status: BookingStatus): Promise<BookingRow | null>;
}
