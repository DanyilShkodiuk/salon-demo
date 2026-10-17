import { describe, expect, it } from "vitest";
import { availableSlots, dateProblem, overlaps } from "@/lib/slots";
import { addDays, formatMinute, isValidDate, localNow, weekdayOf } from "@/lib/time";

// 2026-10-19 is a Monday, 2026-10-18 a Sunday, 2026-10-24 a Saturday.
const NOW = { date: "2026-10-17", minute: 12 * 60 };

describe("time helpers", () => {
  it("validates calendar dates", () => {
    expect(isValidDate("2026-10-19")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("19-10-2026")).toBe(false);
  });
  it("finds weekday and adds days across month ends", () => {
    expect(weekdayOf("2026-10-19")).toBe(1);
    expect(weekdayOf("2026-10-18")).toBe(0);
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
  });
  it("formats minutes", () => {
    expect(formatMinute(9 * 60 + 5)).toBe("09:05");
  });
  it("computes salon-local time across timezones", () => {
    // 22:30 UTC on 17 Oct is 00:30 on 18 Oct in Warsaw (UTC+2 in October).
    const r = localNow(new Date("2026-10-17T22:30:00Z"), "Europe/Warsaw");
    expect(r).toEqual({ date: "2026-10-18", minute: 30 });
  });
});

describe("overlaps", () => {
  it("detects overlap and allows back-to-back", () => {
    expect(overlaps(540, 60, 570, 60)).toBe(true);
    expect(overlaps(540, 60, 600, 60)).toBe(false);
    expect(overlaps(600, 60, 540, 60)).toBe(false);
  });
});

describe("dateProblem", () => {
  it("flags past, closed, far and invalid dates", () => {
    expect(dateProblem("2026-10-16", NOW)).toBe("past");
    expect(dateProblem("2026-10-18", NOW)).toBe("closed");
    expect(dateProblem("2027-03-01", NOW)).toBe("too-far");
    expect(dateProblem("nope", NOW)).toBe("invalid-date");
    expect(dateProblem("2026-10-19", NOW)).toBeNull();
  });
});

describe("availableSlots", () => {
  it("lists every half hour for a 60 minute service on a Monday", () => {
    const s = availableSlots("2026-10-19", 60, [], NOW);
    expect(s[0].label).toBe("09:00");
    expect(s.at(-1)!.label).toBe("17:00"); // must finish by 18:00
    expect(s).toHaveLength(17);
  });
  it("uses Saturday short hours", () => {
    const s = availableSlots("2026-10-24", 60, [], NOW);
    expect(s[0].label).toBe("10:00");
    expect(s.at(-1)!.label).toBe("14:00");
  });
  it("removes slots that overlap an existing booking", () => {
    const busy = [{ startMinute: 10 * 60, durationMinutes: 60 }];
    const labels = availableSlots("2026-10-19", 60, busy, NOW).map((s) => s.label);
    expect(labels).not.toContain("09:30");
    expect(labels).not.toContain("10:00");
    expect(labels).not.toContain("10:30");
    expect(labels).toContain("09:00");
    expect(labels).toContain("11:00");
  });
  it("hides times that already started today", () => {
    const labels = availableSlots("2026-10-17", 30, [], { date: "2026-10-17", minute: 10 * 60 }).map(
      (s) => s.label,
    );
    expect(labels).not.toContain("10:00");
    expect(labels).toContain("10:30");
  });
  it("returns nothing on closed days", () => {
    expect(availableSlots("2026-10-18", 30, [], NOW)).toEqual([]);
  });
});
