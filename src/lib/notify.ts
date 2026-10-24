import type { BookingRow } from "@/db/schema";
import { SALON } from "./config";
import { formatMinute } from "./time";

const RESEND_URL = "https://api.resend.com/emails";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type NotifyConfig = { apiKey: string; from: string; ownerTo: string };

type Email = { to: string; subject: string; text: string; html: string; replyTo?: string };

/** Email settings, or null when any is missing (then notifications are skipped). */
export function notifyConfig(env = process.env): NotifyConfig | null {
  const apiKey = env.RESEND_API_KEY;
  const from = env.NOTIFY_FROM;
  const ownerTo = env.NOTIFY_OWNER_EMAIL;
  if (!apiKey || !from || !ownerTo) return null;
  return { apiKey, from, ownerTo };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function details(b: BookingRow): [string, string][] {
  const end = formatMinute(b.startMinute + b.durationMinutes);
  return [
    ["Service", b.serviceName],
    ["Date", b.date],
    ["Time", `${formatMinute(b.startMinute)}–${end}`],
    ["Name", b.customerName],
    ["Contact", b.contact],
    ...(b.note ? ([["Note", b.note]] as [string, string][]) : []),
  ];
}

function render(intro: string, rows: [string, string][], outro: string) {
  const text = [intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", outro].join("\n");
  const html =
    `<p>${escapeHtml(intro)}</p><table cellpadding="4">` +
    rows.map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escapeHtml(v)}</td></tr>`).join("") +
    `</table><p>${escapeHtml(outro)}</p>`;
  return { text, html };
}

/** The emails a new booking triggers: one to the owner, one to the customer if they gave an email. */
export function bookingEmails(b: BookingRow, ownerTo: string): Email[] {
  const when = `${b.date} ${formatMinute(b.startMinute)}`;
  const customerEmail = EMAIL_RE.test(b.contact) ? b.contact : undefined;
  const emails: Email[] = [
    {
      to: ownerTo,
      subject: `New booking: ${b.serviceName}, ${when}`,
      replyTo: customerEmail,
      ...render(
        `${b.customerName} booked a time. It is waiting for your confirmation.`,
        details(b),
        "Confirm or cancel it on the admin page.",
      ),
    },
  ];
  if (customerEmail) {
    emails.push({
      to: customerEmail,
      subject: `${SALON.name}: we got your booking for ${when}`,
      ...render(
        `Thank you, ${b.customerName}. We received your booking request.`,
        details(b).filter(([k]) => k !== "Contact"),
        "We will confirm it shortly. If you need to change the time, just reply to this email.",
      ),
    });
  }
  return emails;
}

/**
 * Send booking emails through Resend. Never throws: a failed email must not
 * fail a booking that is already saved, so problems are only logged.
 */
export async function notifyNewBooking(
  b: BookingRow,
  config = notifyConfig(),
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  if (!config) return;
  for (const email of bookingEmails(b, config.ownerTo)) {
    // The customer replies to the owner; the owner replies to the customer.
    const replyTo = email.replyTo ?? config.ownerTo;
    try {
      const res = await fetchFn(RESEND_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: config.from,
          to: [email.to],
          reply_to: replyTo,
          subject: email.subject,
          text: email.text,
          html: email.html,
        }),
      });
      if (!res.ok) console.error(`Booking email failed: ${res.status} ${await res.text()}`);
    } catch (err) {
      console.error("Booking email failed:", err);
    }
  }
}
