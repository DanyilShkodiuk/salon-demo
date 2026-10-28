import Link from "next/link";
import BookingFlow from "@/components/BookingFlow";
import Crescent from "@/components/Crescent";
import ServiceTiles from "@/components/ServiceTiles";
import ShadeCard from "@/components/ShadeCard";
import ThemeToggle from "@/components/ThemeToggle";
import { SALON, SERVICES } from "@/lib/config";
import { formatMinute } from "@/lib/time";

const DAYS = [
  ["Monday", 1],
  ["Tuesday", 2],
  ["Wednesday", 3],
  ["Thursday", 4],
  ["Friday", 5],
  ["Saturday", 6],
  ["Sunday", 0],
] as const;

const NAV = [
  ["Services", "#services"],
  ["Hours", "#hours"],
] as const;

export default function Home() {
  const services = SERVICES.map((s) => ({ ...s }));
  const fromPrice = Math.min(...services.map((s) => s.priceUsd));

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-rule/70 bg-cream/90 backdrop-blur">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
          aria-label="Main"
        >
          <a href="#top" className="flex min-w-0 items-center gap-2.5">
            <Crescent className="h-6 w-6 shrink-0 text-gold" />
            <span className="heading text-2xl leading-none">Luna</span>
            <span className="eyebrow hidden pt-1 text-muted min-[400px]:inline">Hair Studio</span>
          </a>
          <div className="flex shrink-0 items-center gap-3 text-sm md:gap-6">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="hidden text-muted hover:text-ink md:inline">
                {label}
              </a>
            ))}
            <Link href="/admin" className="hidden text-muted hover:text-ink md:inline">
              Staff login
            </Link>
            <ThemeToggle />
            <a
              href="#book"
              className="rounded-full bg-sage px-5 py-2.5 font-semibold text-on-sage transition-colors hover:bg-sage-deep"
            >
              Book a time
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="rise">
            <p className="eyebrow text-gold">Luna Hair Studio</p>
            <h1 className="display mt-5 text-balance text-[clamp(2.9rem,7.5vw,5.5rem)]">
              Cuts and colour, with a chair held for you.
            </h1>
            <p className="mt-6 max-w-[42ch] text-pretty text-lg text-muted">
              A quiet studio for cuts, colour and styling. Choose a service, see the times that are
              really free, and book in under a minute.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#book"
                className="rounded-full bg-sage px-7 py-3.5 font-semibold text-on-sage transition-colors hover:bg-sage-deep"
              >
                Book an appointment
              </a>
              <a
                href="#services"
                className="rounded-full border border-ink/20 px-7 py-3.5 font-semibold transition-colors hover:border-ink"
              >
                View services
              </a>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-rule pt-6 text-sm">
              {[
                ["Open", "Mon – Sat"],
                ["Book ahead", `Up to ${SALON.maxDaysAhead} days`],
                ["Payment", "At the salon"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted">{k}</dt>
                  <dd className="mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-gradient-to-b from-sand-deep via-sand to-sage-soft">
              <div className="absolute inset-5 rounded-t-[999px] rounded-b-[1.5rem] border border-panel/80" />
              <Crescent className="absolute left-1/2 top-[22%] h-[38%] w-[38%] -translate-x-1/2 text-panel/90 dark:text-gold/70" />
              <p className="display absolute inset-x-0 bottom-[14%] px-8 text-center text-3xl italic text-ink/80 sm:text-4xl">
                Every visit starts with a conversation.
              </p>
            </div>
            <div className="absolute -bottom-6 left-1/2 w-max -translate-x-1/2 rounded-full border border-rule bg-panel px-5 py-2.5 text-sm shadow-[0_10px_30px_-12px_rgba(43,37,33,0.25)]">
              Services from <span className="font-semibold">${fromPrice}</span>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="overflow-x-clip border-t border-rule bg-panel py-20 sm:py-24"
          aria-labelledby="services-title"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-gold">Menu</p>
                <h2 id="services-title" className="heading mt-3 text-5xl sm:text-6xl">
                  Services
                </h2>
              </div>
              <p className="max-w-[36ch] text-muted">
                Clear prices and durations. Tap a service to start booking.
              </p>
            </div>
            <ServiceTiles services={services} />
          </div>
        </section>

        <section
          id="hours"
          className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
          aria-label="Colour and hours"
        >
          <div className="grid gap-5 lg:grid-cols-12">
            <div className="rounded-[2rem] border border-rule bg-panel p-6 sm:p-10 lg:col-span-7">
              <ShadeCard />
            </div>

            <div className="rounded-[2rem] bg-sand p-6 sm:p-10 lg:col-span-5">
              <p className="eyebrow text-gold">Visit us</p>
              <h3 className="heading mt-3 text-4xl">Opening hours</h3>
              <dl className="mt-6 divide-y divide-sand-deep">
                {DAYS.map(([label, idx]) => {
                  const h = SALON.hours[idx];
                  return (
                    <div key={label} className="flex justify-between py-3">
                      <dt>{label}</dt>
                      <dd className={h ? "font-medium tabular-nums" : "text-muted"}>
                        {h ? `${formatMinute(h.open)} – ${formatMinute(h.close)}` : "Closed"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-5 text-sm text-muted">Times are in {SALON.timezone} time.</p>
            </div>
          </div>
        </section>

        <section id="book" className="bg-sand py-20 sm:py-24" aria-labelledby="book-title">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <p className="eyebrow text-gold">Online booking</p>
              <h2 id="book-title" className="heading mt-3 text-5xl sm:text-6xl">
                Book your time
              </h2>
              <p className="mt-5 max-w-[34ch] text-lg text-muted">
                You only see times that are really free. We confirm every request personally.
              </p>
              <ol className="mt-10 space-y-6">
                {[
                  ["Choose a service", "Prices and durations are on each option."],
                  ["Pick a day and time", "Closed days and taken times are hidden."],
                  ["Leave your details", "An email or a phone number is enough."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="heading grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 text-xl text-gold">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold">{title}</span>
                      <span className="text-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <BookingFlow services={services} />
          </div>
        </section>
      </main>

      <footer className="on-dark bg-night text-night-text">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm sm:px-8">
          <span className="flex items-center gap-2.5">
            <Crescent className="h-5 w-5 text-gold" />
            <span className="heading text-xl">Luna Hair Studio</span>
          </span>
          <span className="text-night-text/70">
            Demo project by Danyil Shkodiuk. Names, prices and shades are sample data.
          </span>
          <Link href="/admin" className="underline underline-offset-4">
            Staff login
          </Link>
        </div>
      </footer>
    </>
  );
}
