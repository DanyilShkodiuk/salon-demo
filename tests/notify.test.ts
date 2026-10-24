import { describe, expect, it, vi } from "vitest";
import type { BookingRow } from "@/db/schema";
import { bookingEmails, notifyConfig, notifyNewBooking } from "@/lib/notify";

const booking: BookingRow = {
  id: "11111111-1111-1111-1111-111111111111",
  serviceId: "cut",
  serviceName: "Haircut",
  date: "2026-10-19",
  startMinute: 600,
  durationMinutes: 60,
  customerName: "Anna <b>",
  contact: "anna@example.com",
  note: "",
  status: "pending",
  createdAt: new Date(),
};

const config = { apiKey: "re_test", from: "Salon <hi@salon.test>", ownerTo: "owner@salon.test" };

describe("notifyConfig", () => {
  it("is null unless key, sender and owner address are all set", () => {
    expect(notifyConfig({} as never)).toBeNull();
    expect(notifyConfig({ RESEND_API_KEY: "k", NOTIFY_FROM: "f" } as never)).toBeNull();
    expect(
      notifyConfig({ RESEND_API_KEY: "k", NOTIFY_FROM: "f", NOTIFY_OWNER_EMAIL: "o@x.io" } as never),
    ).toEqual({ apiKey: "k", from: "f", ownerTo: "o@x.io" });
  });
});

describe("bookingEmails", () => {
  it("emails the owner and the customer when the contact is an email", () => {
    const [owner, customer] = bookingEmails(booking, config.ownerTo);
    expect(owner.to).toBe("owner@salon.test");
    expect(owner.replyTo).toBe("anna@example.com");
    expect(owner.subject).toContain("2026-10-19 10:00");
    expect(owner.text).toContain("Time: 10:00–11:00");
    expect(customer.to).toBe("anna@example.com");
    expect(customer.text).not.toContain("Contact:");
  });

  it("emails only the owner when the contact is a phone number", () => {
    const emails = bookingEmails({ ...booking, contact: "+48 600 100 200" }, config.ownerTo);
    expect(emails.map((e) => e.to)).toEqual(["owner@salon.test"]);
    expect(emails[0].replyTo).toBeUndefined();
  });

  it("escapes customer text in HTML", () => {
    const [owner] = bookingEmails({ ...booking, note: "<script>x</script>" }, config.ownerTo);
    expect(owner.html).not.toContain("<script>");
    expect(owner.html).not.toContain("Anna <b>");
    expect(owner.html).toContain("Anna &#60;b&#62;");
  });
});

describe("notifyNewBooking", () => {
  it("does nothing without config", async () => {
    const fetchFn = vi.fn();
    await notifyNewBooking(booking, null, fetchFn);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("posts each email to Resend with the API key", async () => {
    const fetchFn = vi.fn(async () => new Response("{}", { status: 200 }));
    await notifyNewBooking(booking, config, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(2);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({ from: config.from, to: ["owner@salon.test"], reply_to: "anna@example.com" });
    const customerBody = JSON.parse((fetchFn.mock.calls[1] as unknown as [string, RequestInit])[1].body as string);
    expect(customerBody.reply_to).toBe("owner@salon.test");
  });

  it("never throws when the provider fails", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = vi.fn(async () => new Response("bad key", { status: 401 }));
    await expect(notifyNewBooking(booking, config, failing)).resolves.toBeUndefined();
    const throwing = vi.fn(async () => {
      throw new Error("network down");
    });
    await expect(notifyNewBooking(booking, config, throwing)).resolves.toBeUndefined();
    expect(errors).toHaveBeenCalled();
    errors.mockRestore();
  });
});
