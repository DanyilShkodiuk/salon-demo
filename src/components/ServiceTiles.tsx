"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Service = { id: string; name: string; description: string; priceUsd: number; minutes: number };

/** How long each card stays in front before the carousel turns. */
const AUTOPLAY_MS = 5000;
/** Cards on the ring. With few services the list repeats, so neighbours sit at a gentle angle. */
const MIN_SLOTS = 8;

/** Angle in degrees folded into -180..180. */
const fold = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

/** Fades and softens cards as they turn away from the front of the ring. */
function depthStyle(angle: number): React.CSSProperties {
  const a = Math.abs(fold(angle));
  const opacity = a < 1 ? 1 : a <= 50 ? 0.7 : a <= 95 ? 0.25 : 0;
  return {
    opacity,
    filter: a < 1 ? "none" : `saturate(0.7) blur(${a <= 50 ? 0.5 : 1.5}px)`,
    pointerEvents: a <= 50 ? "auto" : "none",
  };
}

export default function ServiceTiles({ services }: { services: Service[] }) {
  const n = services.length;
  const slots = n * Math.max(1, Math.ceil(MIN_SLOTS / n));
  const step = 360 / slots;

  // Unbounded position, so the ring always turns the short way and never jumps on wrap-around.
  const [pos, setPos] = useState(0);
  const active = ((pos % n) + n) % n;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragX = useRef<number | null>(null);
  // Set when a pointer press turned into a swipe, so the click that follows doesn't book.
  const swiped = useRef(false);

  const paused = hovered || focused || stopped || reducedMotion;

  function choose(id: string) {
    window.dispatchEvent(new CustomEvent("select-service", { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }

  const next = useCallback(() => setPos((p) => p + 1), []);
  const prev = useCallback(() => setPos((p) => p - 1), []);

  /** Turns the ring the short way until service i is in front. */
  function goTo(i: number) {
    let delta = (((i - active) % n) + n) % n;
    if (delta > n / 2) delta -= n;
    setPos((p) => p + delta);
  }

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [paused, next, pos]);

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
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      }}
    >
      {/* The stage: a ring of cards, seen from just in front of it. Swipe or drag to turn. */}
      <div
        className="ring-stage relative h-[22rem] touch-pan-y select-none [perspective:1600px]"
        onPointerDown={(e) => (dragX.current = e.clientX)}
        onPointerUp={(e) => {
          if (dragX.current === null) return;
          const dx = e.clientX - dragX.current;
          dragX.current = null;
          swiped.current = Math.abs(dx) > 40;
          if (dx < -40) next();
          if (dx > 40) prev();
        }}
        onClickCapture={(e) => {
          if (!swiped.current) return;
          swiped.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        onPointerCancel={() => (dragX.current = null)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-[20%] bottom-0 h-10 rounded-[50%] bg-ink/10 blur-2xl"
        />
        <ul className="absolute inset-0 [transform-style:preserve-3d] [transform:translateZ(calc(var(--ring-r)*-1))]">
          {Array.from({ length: slots }, (_, k) => {
            const s = services[k % n];
            const angle = (k - pos) * step;
            const a = fold(angle);
            const front = Math.abs(a) < 1;
            const side = !front && Math.abs(a) <= 50;
            return (
              <li
                key={k}
                aria-hidden={!front}
                aria-roledescription={front ? "slide" : undefined}
                aria-label={front ? `${(k % n) + 1} of ${n}` : undefined}
                className="absolute left-1/2 top-1 w-[var(--ring-w)] transition-[transform,opacity,filter] duration-[900ms] ease-[cubic-bezier(0.22,0.8,0.25,1)] [backface-visibility:hidden]"
                style={{
                  transform: `translateX(-50%) rotateY(${angle}deg) translateZ(var(--ring-r))`,
                  ...depthStyle(angle),
                }}
              >
                <button
                  type="button"
                  tabIndex={front ? 0 : -1}
                  onClick={() => {
                    if (front) choose(s.id);
                    else if (side) (a > 0 ? next : prev)();
                  }}
                  className={`group flex h-[20rem] w-full flex-col justify-between gap-8 rounded-[1.75rem] border p-6 text-left transition-[background-color,border-color,box-shadow] duration-700 sm:p-8 ${
                    front
                      ? "border-sage/50 bg-panel shadow-[0_40px_60px_-30px_rgba(43,37,33,0.5)] hover:border-sage"
                      : "border-rule bg-sand"
                  }`}
                >
                  <span>
                    <span className="eyebrow block text-gold">{String((k % n) + 1).padStart(2, "0")}</span>
                    <span className="heading mt-3 block text-4xl">{s.name}</span>
                    <span className="mt-2 block max-w-[32ch] text-muted">{s.description}</span>
                  </span>
                  <span className="flex items-end justify-between gap-4 border-t border-rule pt-5">
                    <span>
                      <span className="heading text-3xl">${s.priceUsd}</span>
                      <span className="ml-2 text-sm text-muted">· {s.minutes} min</span>
                    </span>
                    <span className="whitespace-nowrap rounded-full bg-sage px-4 py-2 text-sm font-semibold text-on-sage transition-colors group-hover:bg-sage-deep">
                      Book
                      <span aria-hidden="true" className="ml-1.5 inline-block">
                        →
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
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
                  key={pos}
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
              aria-label={stopped ? "Start automatic turning" : "Stop automatic turning"}
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
