"use client";

import { useEffect, useState } from "react";

/** Section links for phones, where the header is too narrow for the inline nav: a button that drops a panel under the header. */
export default function MobileMenu({ links }: { links: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.matchMedia("(min-width: 48rem)").matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition-colors hover:border-sage hover:text-sage"
      >
        <span aria-hidden="true" className="relative block h-3 w-4">
          <span
            className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${
              open ? "top-1.5 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${
              open ? "top-1.5 -rotate-45" : "top-3"
            }`}
          />
        </span>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="fade-in absolute inset-x-0 top-full border-b border-rule/70 bg-cream shadow-[0_30px_40px_-30px_rgba(43,37,33,0.35)]"
        >
          <ul className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
            {links.map(([label, href]) => (
              <li key={href} className="border-b border-rule/60 last:border-0">
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="heading flex items-center justify-between py-3.5 text-2xl"
                >
                  {label}
                  <span aria-hidden="true" className="text-base text-gold">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
