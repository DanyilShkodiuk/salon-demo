"use client";

import { useEffect } from "react";

/**
 * Fades `.reveal` elements in as they scroll into view. Rendered once per page. Without
 * JavaScript, or with reduced motion, the CSS leaves everything visible.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    document.documentElement.classList.add("reveal-ready");
    return () => io.disconnect();
  }, []);
  return null;
}
