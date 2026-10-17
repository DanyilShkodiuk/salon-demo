import { and, asc, eq, ne, sql } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { bookings, type BookingRow } from "@/db/schema";
import type { BookingStatus, BookingStore, CreateBooking } from "./store";

// Works with any drizzle Postgres driver (neon-http in production, pglite in tests).
type Db = PgDatabase<PgQueryResultHKT, Record<string, never>>;

export class PgStore implements BookingStore {
  constructor(private db: Db) {}

  async activeOn(date: string) {
    return this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.date, date), ne(bookings.status, "cancelled")));
  }

  async createIfFree(input: CreateBooking): Promise<BookingRow | null> {
    // One statement: the insert only happens if no active booking overlaps the range.
    const end = input.startMinute + input.durationMinutes;
    const inserted = await this.db
      .insert(bookings)
      .select(
        this.db
          .select({
            id: sql<string>`gen_random_uuid()`.as("id"),
            serviceId: sql<string>`${input.serviceId}`.as("service_id"),
            serviceName: sql<string>`${input.serviceName}`.as("service_name"),
            date: sql<string>`${input.date}`.as("date"),
            startMinute: sql<number>`${input.startMinute}::int`.as("start_minute"),
            durationMinutes: sql<number>`${input.durationMinutes}::int`.as("duration_minutes"),
            customerName: sql<string>`${input.customerName}`.as("customer_name"),
            contact: sql<string>`${input.contact}`.as("contact"),
            note: sql<string>`${input.note}`.as("note"),
            status: sql<"pending">`'pending'`.as("status"),
            createdAt: sql<Date>`now()`.as("created_at"),
          })
          .from(sql`(select 1) as _one`)
          .where(
            sql`not exists (
              select 1 from ${bookings}
              where ${bookings.date} = ${input.date}
                and ${bookings.status} <> 'cancelled'
                and ${bookings.startMinute} < ${end}::int
                and ${input.startMinute}::int < ${bookings.startMinute} + ${bookings.durationMinutes}
            )`,
          ),
      )
      .returning();
    return inserted[0] ?? null;
  }

  async list() {
    return this.db.select().from(bookings).orderBy(asc(bookings.date), asc(bookings.startMinute));
  }

  async setStatus(id: string, status: BookingStatus) {
    const rows = await this.db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return rows[0] ?? null;
  }
}
