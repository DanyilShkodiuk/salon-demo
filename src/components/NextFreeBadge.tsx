"use client";

import { useEffect, useState } from "react";

type Slot = { startMinute: number; label: string };

const DAYS_TO_CHECK = 7;

function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayLabel(offset: number, d: Date): string {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/**
 * Asks the availability API for the next free time for a service and shows it as a live
 * badge. Clicking it picks that service in the booking form.
 */
export default function NextFreeBadge({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let offset = 0; offset < DAYS_TO_CHECK; offset++) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        try {
          const res = await fetch(`/api/availability?date=${isoDate(d)}&service=${serviceId}`, {
            cache: "no-store",
          });
          const data: { slots?: Slot[] } = await res.json();
          if (cancelled) return;
          const first = data.slots?.[0];
          if (first) {
            setText(`${dayLabel(offset, d)} at ${first.label}`);
            return;
          }
        } catch {
          return; // offline or API down: just don't show the badge
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (!text) return <span className="block h-10" aria-hidden="true" />;

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("select-service", { detail: serviceId }));
        document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
      }}
      className="fade-in inline-flex h-10 items-center gap-2.5 surface rounded-full px-4 text-sm transition-colors hover:border-sage"
    >
      <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sage" />
      </span>
      <span>
        Next free {serviceName.toLowerCase()}: <span className="font-semibold">{text}</span>
      </span>
    </button>
  );
}
