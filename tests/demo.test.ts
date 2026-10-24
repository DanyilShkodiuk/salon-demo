import { describe, expect, it } from "vitest";
import { ensureDemoData, isDemo, maskContact, maskName } from "@/lib/demo";
import { MemoryStore } from "@/lib/memory-store";

describe("demo mode", () => {
  it("is off unless DEMO_MODE is true or 1", () => {
    expect(isDemo({} as never)).toBe(false);
    expect(isDemo({ DEMO_MODE: "false" } as never)).toBe(false);
    expect(isDemo({ DEMO_MODE: "true" } as never)).toBe(true);
    expect(isDemo({ DEMO_MODE: "1" } as never)).toBe(true);
  });

  it("masks contacts and surnames", () => {
    expect(maskContact("anna@example.com")).toBe("a***@example.com");
    expect(maskContact("+48 791 843 254")).toBe("+48 *** *** 254");
    expect(maskContact("12")).toBe("***");
    expect(maskName("Anna Kowalska")).toBe("Anna K.");
    expect(maskName("Anna")).toBe("Anna");
  });

  it("adds sample bookings once, only when nothing is upcoming", async () => {
    const store = new MemoryStore();
    const now = new Date("2026-10-24T10:00:00Z"); // Saturday in Warsaw
    await ensureDemoData(store, now);
    const first = await store.list();
    expect(first.length).toBeGreaterThanOrEqual(5);
    expect(first.every((b) => b.date > "2026-10-24")).toBe(true);
    expect(first.some((b) => b.date === "2026-10-25")).toBe(false); // Sunday is closed
    expect(new Set(first.map((b) => b.status))).toEqual(new Set(["pending", "confirmed", "cancelled"]));

    await ensureDemoData(store, now);
    expect((await store.list()).length).toBe(first.length);
  });
});
