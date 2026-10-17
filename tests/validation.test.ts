import { describe, expect, it } from "vitest";
import { bookingInput } from "@/lib/validation";

const ok = {
  serviceId: "cut",
  date: "2026-10-19",
  startMinute: 600,
  name: "Anna Kowalska",
  contact: "anna@example.com",
};

describe("bookingInput", () => {
  it("accepts a valid booking and defaults optional fields", () => {
    const r = bookingInput.parse(ok);
    expect(r.note).toBe("");
    expect(r.website).toBe("");
  });
  it("accepts phone numbers", () => {
    expect(bookingInput.safeParse({ ...ok, contact: "+48 791 843 254" }).success).toBe(true);
  });
  it("rejects bad contact, short name and bad date", () => {
    expect(bookingInput.safeParse({ ...ok, contact: "hello" }).success).toBe(false);
    expect(bookingInput.safeParse({ ...ok, name: "A" }).success).toBe(false);
    expect(bookingInput.safeParse({ ...ok, date: "19/10/2026" }).success).toBe(false);
    expect(bookingInput.safeParse({ ...ok, startMinute: 1.5 }).success).toBe(false);
  });
  it("strips control characters from text", () => {
    const r = bookingInput.parse({ ...ok, name: "Anna\u0000\nK" });
    expect(r.name).toBe("Anna  K");
  });
  it("passes a filled honeypot through so the route can ignore it quietly", () => {
    expect(bookingInput.parse({ ...ok, website: "spam.example" }).website).toBe("spam.example");
  });
});
