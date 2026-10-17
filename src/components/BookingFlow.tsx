"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };
type Slot = { startMinute: number; label: string };
type Done = { service: string; date: string; time: string };

const field =
  "w-full rounded-xl border border-rule bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 aria-[invalid=true]:border-alert";

function todayLocal(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function BookingFlow({ services }: { services: Service[] }) {
  const [serviceId, setServiceId] = useState<string>("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startMinute, setStartMinute] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);
  const requestId = useRef(0);

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);

  async function loadSlots(forDate: string, forService: string) {
    if (!forDate || !forService) return;
    const id = ++requestId.current;
    setLoadingSlots(true);
    setSlotsMessage("");
    try {
      const res = await fetch(
        `/api/availability?date=${encodeURIComponent(forDate)}&service=${encodeURIComponent(forService)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (id !== requestId.current) return; // a newer request replaced this one
      setSlots(data.slots ?? []);
      setSlotsMessage(data.reason ?? data.error ?? "");
    } catch {
      if (id !== requestId.current) return;
      setSlots([]);
      setSlotsMessage("Could not load times. Check your connection and try again.");
    } finally {
      if (id === requestId.current) setLoadingSlots(false);
    }
  }

  useEffect(() => {
    function onSelect(e: Event) {
      const id = (e as CustomEvent<string>).detail;
      if (services.some((x) => x.id === id)) setServiceId(id);
    }
    window.addEventListener("select-service", onSelect);
    return () => window.removeEventListener("select-service", onSelect);
  }, [services]);

  useEffect(() => {
    setStartMinute(null);
    setSlots(null);
    if (date && serviceId) loadSlots(date, serviceId);
  }, [date, serviceId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!service || startMinute === null) return;
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date, startMinute, name, contact, note, website }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone({
          service: data.booking?.service ?? service.name,
          date: data.booking?.date ?? date,
          time: data.booking?.time ?? "",
        });
        return;
      }
      setFormError(data.error ?? "Something went wrong. Try again.");
      if (data.fields) setFieldErrors(data.fields);
      if (res.status === 409) {
        setStartMinute(null);
        loadSlots(date, serviceId);
      }
    } catch {
      setFormError("Could not send your booking. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDone(null);
    setServiceId("");
    setDate("");
    setSlots(null);
    setStartMinute(null);
    setName("");
    setContact("");
    setNote("");
    setFormError("");
    setFieldErrors({});
  }

  if (done) {
    return (
      <section
        aria-live="polite"
        className="self-start rounded-[2rem] bg-panel p-8 lg:sticky lg:top-24"
      >
        <h2 className="heading text-4xl">Request received</h2>
        <p className="mt-4 text-lg leading-relaxed">
          {done.service} on {done.date} at {done.time}.
        </p>
        <p className="mt-2 leading-relaxed text-muted">
          We will confirm by {contact.includes("@") ? "email" : "phone"} shortly. Until then the
          time is held for you.
        </p>
        <button
          onClick={reset}
          className="mt-8 rounded-full bg-plum px-6 py-3 font-semibold text-mist hover:bg-plum-deep"
        >
          Book another appointment
        </button>
      </section>
    );
  }

  const canSubmit = Boolean(service && date && startMinute !== null && name && contact);

  return (
    <form
      onSubmit={submit}
      noValidate
      className="self-start rounded-[2rem] bg-panel p-6 sm:p-8 lg:sticky lg:top-24"
    >
      <fieldset>
        <legend className="heading text-3xl">Choose a service</legend>
        <div role="radiogroup" className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((s) => {
            const selected = s.id === serviceId;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                key={s.id}
                onClick={() => setServiceId(s.id)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? "border-plum bg-plum text-mist"
                    : "border-rule bg-white hover:border-plum"
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">{s.name}</span>
                  <span className={`text-sm ${selected ? "text-mist/80" : "text-muted"}`}>${s.priceUsd}</span>
                </span>
                <span className={`mt-1 block text-sm ${selected ? "text-mist/80" : "text-muted"}`}>
                  {s.description} {s.minutes} min.
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="date" className="heading block text-3xl">
          Choose a day
        </label>
        <input
          id="date"
          type="date"
          min={todayLocal()}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={!serviceId}
          className={`${field} mt-3 max-w-xs disabled:bg-mist disabled:text-muted`}
        />
        {!serviceId && <p className="mt-2 text-sm text-muted">Pick a service first.</p>}
      </div>

      {date && serviceId && (
        <div className="mt-8" aria-live="polite">
          <h3 className="heading text-3xl">Choose a time</h3>
          {loadingSlots && <p className="mt-3 text-muted">Loading free times…</p>}
          {!loadingSlots && slots && slots.length > 0 && (
            <div role="radiogroup" aria-label="Free times" className="mt-3 flex flex-wrap gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={startMinute === s.startMinute}
                  key={s.startMinute}
                  onClick={() => setStartMinute(s.startMinute)}
                  className={`min-w-[4.75rem] rounded-full border px-4 py-2.5 text-sm font-semibold ${
                    startMinute === s.startMinute
                      ? "border-ink bg-marigold text-ink"
                      : "border-rule bg-white hover:border-plum"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
          {!loadingSlots && slots && slots.length === 0 && (
            <p className="mt-3 text-muted">{slotsMessage || "No free times on this day."}</p>
          )}
        </div>
      )}

      {startMinute !== null && (
        <div className="mt-8">
          <h3 className="heading text-3xl">Your details</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "name-err" : undefined}
                className={field}
              />
              {fieldErrors.name && (
                <p id="name-err" className="mt-1 text-sm text-alert">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="contact" className="mb-1 block text-sm font-medium">
                Email or phone
              </label>
              <input
                id="contact"
                autoComplete="email"
                maxLength={120}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                aria-invalid={Boolean(fieldErrors.contact)}
                aria-describedby={fieldErrors.contact ? "contact-err" : undefined}
                className={field}
              />
              {fieldErrors.contact && (
                <p id="contact-err" className="mt-1 text-sm text-alert">
                  {fieldErrors.contact}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="note" className="mb-1 block text-sm font-medium">
              Anything we should know? (optional)
            </label>
            <textarea
              id="note"
              rows={2}
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={field}
            />
          </div>
          {/* Honeypot: hidden from people, tempting for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <p className="mt-6 text-sm text-muted">
            {service?.name}, {date}, {slots?.find((s) => s.startMinute === startMinute)?.label}.
            You pay at the salon.
          </p>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-3 rounded-full bg-plum px-7 py-3.5 font-semibold text-mist hover:bg-plum-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Sending…" : "Request this time"}
          </button>
          <p role="alert" className="mt-3 min-h-6 text-sm text-alert">
            {formError}
          </p>
        </div>
      )}
    </form>
  );
}
