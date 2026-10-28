"use client";

import { useState } from "react";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };

const GOALS = [
  { id: "cut", label: "A new shape", hint: "Change the cut, or freshen up the one you have" },
  { id: "color", label: "A new colour", hint: "Cover greys, go lighter, or try a new tone" },
  { id: "style", label: "A big day", hint: "A wedding, an event or a photo shoot" },
  { id: "trim", label: "Just tidy up", hint: "Neat ends between bigger visits" },
] as const;

const LENGTHS = ["Short", "Medium", "Long"] as const;
type Length = (typeof LENGTHS)[number];

/** A short tip for each answer pair, so the result reads like advice rather than a lookup. */
function tip(goal: string, length: Length): string {
  if (goal === "color") {
    return length === "Long"
      ? "Long hair takes more colour and time. We will check the ends first and may suggest a gloss to finish."
      : "Shorter hair colours quickly, so this is a great moment to try a bolder tone.";
  }
  if (goal === "style") {
    return length === "Short"
      ? "Short hair styles beautifully with texture. Bring a photo of your outfit and we will match the look."
      : "For longer hair we recommend a trial a week before the event. Mention it in the booking notes.";
  }
  if (goal === "trim") return "A trim every 6 to 8 weeks keeps the shape of your last cut without a full appointment.";
  return length === "Long"
    ? "Going shorter? Book a Haircut, not a trim, so there is time to talk through the new shape."
    : "Shorter cuts look their best when refreshed every 5 to 6 weeks.";
}

/** Two quick questions that recommend a service and pick it in the booking form. */
export default function ServiceFinder({ services }: { services: Service[] }) {
  const [goal, setGoal] = useState<string | null>(null);
  const [length, setLength] = useState<Length | null>(null);
  const result = goal && length ? services.find((s) => s.id === goal) : undefined;
  const step = !goal ? 1 : !length ? 2 : 3;

  function book(id: string) {
    window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="rounded-[2rem] border border-rule bg-panel p-6 sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-gold">Step {step} of 3</p>
        {goal && (
          <button
            type="button"
            onClick={() => {
              setGoal(null);
              setLength(null);
            }}
            className="text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            Start again
          </button>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-sand" aria-hidden="true">
        <div
          className="h-full rounded-full bg-sage transition-[width] duration-700 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div aria-live="polite">
        {step === 1 && (
          <fieldset key="goal" className="fade-in mt-8">
            <legend className="heading text-3xl">What would you like today?</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className="rounded-2xl border border-rule bg-field p-4 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-sage"
                >
                  <span className="block font-semibold">{g.label}</span>
                  <span className="mt-1 block text-sm text-muted">{g.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset key="length" className="fade-in mt-8">
            <legend className="heading text-3xl">How long is your hair now?</legend>
            <div className="mt-5 flex flex-wrap gap-3">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  className="min-w-28 rounded-full border border-rule bg-field px-6 py-3 font-semibold transition-colors hover:border-sage"
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 3 && result && goal && length && (
          <div key="result" className="fade-in mt-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="text-muted">We recommend</p>
              <p className="heading mt-1 text-5xl">{result.name}</p>
              <p className="mt-2 text-muted">
                {result.description} {result.minutes} min · ${result.priceUsd}
              </p>
              <p className="mt-5 max-w-[52ch] rounded-2xl bg-sage-soft px-4 py-3 text-sm">{tip(goal, length)}</p>
            </div>
            <button
              type="button"
              onClick={() => book(result.id)}
              className="justify-self-start rounded-full bg-sage px-7 py-3.5 font-semibold text-on-sage transition-colors hover:bg-sage-deep"
            >
              Book {result.name.toLowerCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
