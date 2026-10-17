import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/memory-store";
import { PgStore } from "@/lib/pg-store";
import type { BookingStore, CreateBooking } from "@/lib/store";

const base: CreateBooking = {
  serviceId: "cut",
  serviceName: "Haircut",
  date: "2026-10-19",
  startMinute: 600,
  durationMinutes: 60,
  customerName: "Anna",
  contact: "anna@example.com",
  note: "",
};

function suite(name: string, make: () => Promise<BookingStore>) {
  describe(name, () => {
    let store: BookingStore;
    beforeAll(async () => {
      store = await make();
    });

    it("creates a pending booking", async () => {
      const row = await store.createIfFree(base);
      expect(row?.status).toBe("pending");
      expect((await store.activeOn("2026-10-19")).length).toBe(1);
    });

    it("refuses an overlapping booking and allows back-to-back", async () => {
      expect(await store.createIfFree({ ...base, startMinute: 630 })).toBeNull();
      expect(await store.createIfFree({ ...base, startMinute: 570 })).toBeNull(); // 09:30-10:30 overlaps 10:00
      // 09:00-10:00 ends exactly when the 10:00 booking starts, so it is allowed
      expect(await store.createIfFree({ ...base, startMinute: 540 })).not.toBeNull();
    });

    it("allows the next slot after the first ends", async () => {
      const row = await store.createIfFree({ ...base, startMinute: 660 });
      expect(row).not.toBeNull();
    });

    it("frees the time when a booking is cancelled", async () => {
      const [first] = await store.activeOn("2026-10-19");
      await store.setStatus(first.id, "cancelled");
      const again = await store.createIfFree({ ...base, startMinute: first.startMinute });
      expect(again).not.toBeNull();
    });

    it("lists bookings sorted and updates status", async () => {
      const all = await store.list();
      const sorted = [...all].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute,
      );
      expect(all.map((r) => r.id)).toEqual(sorted.map((r) => r.id));
      const updated = await store.setStatus(all[0].id, "confirmed");
      expect(updated?.status).toBe("confirmed");
      expect(await store.setStatus("00000000-0000-0000-0000-000000000000", "confirmed")).toBeNull();
    });
  });
}

suite("MemoryStore", async () => new MemoryStore());

suite("PgStore on real Postgres (PGlite)", async () => {
  const client = new PGlite();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  return new PgStore(db as never);
});
