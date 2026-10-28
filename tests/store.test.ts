import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
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

async function migratedPglite() {
  const client = new PGlite({ extensions: { btree_gist } });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  return { client, db };
}

suite("PgStore on real Postgres (PGlite)", async () => {
  const { db } = await migratedPglite();
  return new PgStore(db as never);
});

describe("bookings_no_overlap constraint", () => {
  const insert = (start: number, status = "pending") =>
    `insert into bookings (service_id, service_name, date, start_minute, duration_minutes, customer_name, contact, status)
     values ('cut', 'Haircut', '2026-10-20', ${start}, 60, 'Anna', 'anna@example.com', '${status}')`;

  it("rejects an overlapping row even when the app check is bypassed", async () => {
    const { client } = await migratedPglite();
    await client.exec(insert(600));
    await expect(client.exec(insert(630))).rejects.toMatchObject({ code: "23P01" });
    // Back-to-back and cancelled rows are allowed.
    await client.exec(insert(660));
    await client.exec(insert(600, "cancelled"));
  });

  it("makes createIfFree return null instead of throwing on a violation", async () => {
    const { client, db } = await migratedPglite();
    const store = new PgStore(db as never);
    await client.exec(insert(600));
    // Simulate a racing request that already passed the NOT EXISTS check.
    const raced = Object.create(store, {
      insertQuery: {
        value: () => client.exec(insert(630)),
      },
    });
    expect(await raced.createIfFree({ ...base, date: "2026-10-20", startMinute: 630 })).toBeNull();
  });
});
