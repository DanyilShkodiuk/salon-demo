"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };

/** How long each card stays in front before the carousel moves on. */
const AUTOPLAY_MS = 5000;

export default function ServiceTiles({ services }: { services: Service[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Bumped on every move so the progress bar on the active dot restarts.
  const [cycle, setCycle] = useState(0);

  const paused = hovered || focused || stopped || reducedMotion;

  function choose(id: string) {
    window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  const items = () => Array.from(track.current?.children ?? []) as HTMLElement[];
  // Where the track must scroll to put a card at its snap point (the track has side padding).
  const snapLeft = (el: HTMLElement) =>
    el.offsetLeft - parseFloat(getComputedStyle(track.current!).paddingLeft || "0");

  const atEnd = () => {
    const t = track.current;
    return !t || t.scrollLeft >= t.scrollWidth - t.clientWidth - 2;
  };

  const goTo = useCallback(
    (i: number) => {
      const t = track.current;
      const list = items();
      if (!t || list.length === 0) return;
      const index = (i + list.length) % list.length;
      t.scrollTo({ left: snapLeft(list[index]), behavior: reducedMotion ? "auto" : "smooth" });
      setActive(index);
      setCycle((c) => c + 1);
    },
    [reducedMotion],
  );

  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const prev = () => goTo(active === 0 ? services.length - 1 : active - 1);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") next();
      else setCycle((c) => c + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, next, cycle]);

  // Keep the dots in step when the visitor swipes or scrolls the track by hand.
  function onScroll() {
    const t = track.current;
    if (!t) return;
    const list = items();
    if (atEnd()) {
      // The last few cards can't reach the left edge, so once the track is at its end the
      // active card is whichever of them was chosen, starting with the first of them.
      const max = t.scrollWidth - t.clientWidth;
      const first = list.findIndex((el) => snapLeft(el) >= max - 2);
      setActive((a) => Math.max(a, first === -1 ? list.length - 1 : first));
      return;
    }
    let best = 0;
    list.forEach((el, i) => {
      if (Math.abs(snapLeft(el) - t.scrollLeft) < Math.abs(snapLeft(list[best]) - t.scrollLeft)) best = i;
    });
    setActive(best);
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Services"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <ul
        ref={track}
        onScroll={onScroll}
        className="no-scrollbar relative -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 py-2 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {services.map((s, i) => (
          <li
            key={s.id}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${services.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/2.6)]"
          >
            <button
              type="button"
              onClick={() => choose(s.id)}
              className={`group flex h-full min-h-[17rem] w-full flex-col justify-between gap-10 rounded-[1.75rem] border p-6 text-left transition-[background-color,border-color,transform,box-shadow] duration-500 hover:-translate-y-1 hover:border-sage hover:shadow-[0_24px_40px_-28px_rgba(43,37,33,0.45)] sm:p-8 ${
                i === active ? "border-sage/60 bg-sage-soft/50" : "border-rule bg-cream"
              }`}
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
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {services.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show ${s.name}`}
              aria-current={i === active}
              className={`relative h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ${
                i === active ? "w-12 bg-sand-deep" : "w-6 bg-rule hover:bg-sand-deep"
              }`}
            >
              {i === active && (
                <span
                  key={cycle}
                  aria-hidden="true"
                  className="carousel-progress absolute inset-y-0 left-0 rounded-full bg-sage"
                  style={{
                    animationDuration: `${AUTOPLAY_MS}ms`,
                    animationPlayState: paused ? "paused" : "running",
                    width: reducedMotion || stopped ? "100%" : undefined,
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setStopped((v) => !v)}
              aria-label={stopped ? "Start automatic scrolling" : "Stop automatic scrolling"}
              className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:text-ink"
            >
              <span aria-hidden="true" className="text-xs">
                {stopped ? "▶" : "❚❚"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous service"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 transition-colors hover:border-sage hover:bg-sage hover:text-on-sage"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next service"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 transition-colors hover:border-sage hover:bg-sage hover:text-on-sage"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
