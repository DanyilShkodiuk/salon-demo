import { NextResponse } from "next/server";
import { getService } from "@/lib/config";
import { getStore } from "@/lib/db";
import { dateProblem, isSlotFree } from "@/lib/slots";
import { formatMinute, localNow } from "@/lib/time";
import { bookingInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const parsed = bookingInput.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[String(issue.path[0] ?? "form")] ??= issue.message;
    }
    return NextResponse.json({ error: "Check the highlighted fields.", fields }, { status: 400 });
  }
  const input = parsed.data;

  // Honeypot filled: pretend success so bots learn nothing.
  if (input.website) return NextResponse.json({ ok: true }, { status: 201 });

  const service = getService(input.serviceId);
  if (!service) return NextResponse.json({ error: "Choose a service." }, { status: 400 });

  const now = localNow();
  if (dateProblem(input.date, now)) {
    return NextResponse.json({ error: "Choose a date the salon is open." }, { status: 400 });
  }

  const store = getStore();
  const busy = await store.activeOn(input.date);
  if (!isSlotFree(input.date, input.startMinute, service.minutes, busy, now)) {
    return NextResponse.json(
      { error: "That time was just taken. Pick another.", code: "slot_taken" },
      { status: 409 },
    );
  }

  const created = await store.createIfFree({
    serviceId: service.id,
    serviceName: service.name,
    date: input.date,
    startMinute: input.startMinute,
    durationMinutes: service.minutes,
    customerName: input.name,
    contact: input.contact,
    note: input.note,
  });
  if (!created) {
    return NextResponse.json(
      { error: "That time was just taken. Pick another.", code: "slot_taken" },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      booking: {
        id: created.id,
        service: created.serviceName,
        date: created.date,
        time: formatMinute(created.startMinute),
        status: created.status,
      },
    },
    { status: 201 },
  );
}
