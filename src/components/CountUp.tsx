"use client";

import { useEffect, useRef, useState } from "react";

/** A number that counts up from zero the first time it scrolls into view. */
export default function CountUp({
  value,
  decimals = 0,
  suffix = "",
  durationMs = 1600,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs);
          setShown(value * (1 - Math.pow(1 - t, 3))); // ease-out cubic
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  const text = shown.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className="tabular-nums">
      {text}
      {suffix}
    </span>
  );
}
