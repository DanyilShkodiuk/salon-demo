import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: text("service_id").notNull(),
    serviceName: text("service_name").notNull(),
    /** Salon-local calendar date, YYYY-MM-DD */
    date: text("date").notNull(),
    /** Minutes since local midnight */
    startMinute: integer("start_minute").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    customerName: text("customer_name").notNull(),
    contact: text("contact").notNull(),
    note: text("note").notNull().default(""),
    status: text("status", { enum: ["pending", "confirmed", "cancelled"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("bookings_date_idx").on(t.date)],
);

export type BookingRow = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
