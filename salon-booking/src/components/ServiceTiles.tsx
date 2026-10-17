"use client";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };

// Tile positions on the bento grid (large screens). Order matches SERVICES.
const LAYOUT = [
  "lg:col-span-7 bg-plum text-mist on-dark",
  "lg:col-span-5 bg-lilac text-ink",
  "lg:col-span-5 bg-panel text-ink border border-rule",
  "lg:col-span-7 bg-marigold text-ink",
];

export default function ServiceTiles({ services }: { services: Service[] }) {
  function choose(id: string) {
    window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-12 lg:auto-rows-fr">
      {services.map((s, i) => (
        <li key={s.id} className={`${LAYOUT[i] ?? ""} rounded-[2rem] lg:min-h-[19rem]`}>
          <button
            type="button"
            onClick={() => choose(s.id)}
            className="flex h-full min-h-[15rem] w-full flex-col justify-between gap-8 rounded-[2rem] p-6 text-left sm:p-8"
          >
            <span>
              <span
                className={`heading block ${i === 0 ? "text-5xl sm:text-7xl" : "text-3xl sm:text-4xl"}`}
              >
                {s.name}
              </span>
              <span className={`mt-3 block max-w-[30ch] ${i === 0 ? "text-lg" : "text-base"}`}>
                {s.description}
              </span>
            </span>
            <span className="flex items-end justify-between gap-4">
              <span className="heading text-3xl">${s.priceUsd}</span>
              <span className="whitespace-nowrap text-sm font-medium underline underline-offset-4">
                Book · {s.minutes} min
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
