"use client";

import { THEME_KEY } from "@/lib/theme";

/** Switches between the light and dark theme and remembers the choice on this device. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be blocked (private mode); the theme still switches for this visit.
    }
  }

  // Both icons are rendered and CSS shows the right one, so the server markup matches
  // whatever theme the visitor ends up with.
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Light / dark theme"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-sage hover:text-sage ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] dark:hidden">
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="hidden h-[18px] w-[18px] dark:block">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
