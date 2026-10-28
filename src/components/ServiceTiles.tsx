"use client";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };

export default function ServiceTiles({ services }: { services: Service[] }) {
  function choose(id: string) {
    window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {services.map((s, i) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => choose(s.id)}
            className="group flex h-full w-full flex-col justify-between gap-10 rounded-[1.75rem] border border-rule bg-cream p-6 text-left transition-colors hover:border-sage hover:bg-sage-soft/60 sm:p-8"
          >
            <span>
              <span className="eyebrow block text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="heading mt-3 block text-4xl">{s.name}</span>
              <span className="mt-2 block max-w-[32ch] text-muted">{s.description}</span>
            </span>
            <span className="flex items-end justify-between gap-4 border-t border-rule pt-5">
              <span>
                <span className="heading text-3xl">${s.priceUsd}</span>
                <span className="ml-2 text-sm text-muted">· {s.minutes} min</span>
              </span>
              <span className="whitespace-nowrap text-sm font-semibold text-sage group-hover:text-sage-deep">
                Book
                <span aria-hidden="true" className="ml-1.5 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
