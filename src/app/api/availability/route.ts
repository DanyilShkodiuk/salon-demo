import { NextResponse } from "next/server";
import { getService } from "@/lib/config";
import { getStore } from "@/lib/db";
import { availableSlots, dateProblem } from "@/lib/slots";
import { localNow } from "@/lib/time";

export const dynamic = "force-dynamic";

const MESSAGES = {
  "invalid-date": "Choose a valid date.",
  past: "That date has passed.",
  "too-far": "Bookings open up to 60 days ahead.",
  closed: "The salon is closed on that day.",
} as const;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const service = getService(searchParams.get("service") ?? "");
  if (!service) {
    return NextResponse.json({ error: "Choose a service." }, { status: 400 });
  }

  const now = localNow();
  const problem = dateProblem(date, now);
  if (problem) {
    return NextResponse.json({ slots: [], reason: MESSAGES[problem] });
  }

  const busy = await getStore().activeOn(date);
  const slots = availableSlots(date, service.minutes, busy, now);
  return NextResponse.json({
    slots,
    reason: slots.length === 0 ? "No free times left on this day." : null,
  });
}
