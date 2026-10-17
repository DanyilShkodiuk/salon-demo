import Link from "next/link";
import BookingFlow from "@/components/BookingFlow";
import Crescent from "@/components/Crescent";
import ServiceTiles from "@/components/ServiceTiles";
import ShadeCard from "@/components/ShadeCard";
import { SALON, SERVICES } from "@/lib/config";
import { formatMinute } from "@/lib/time";

const DAYS = [
  ["Mon", 1],
  ["Tue", 2],
  ["Wed", 3],
  ["Thu", 4],
  ["Fri", 5],
  ["Sat", 6],
  ["Sun", 0],
] as const;

export default function Home() {
  const services = SERVICES.map((s) => ({ ...s }));

  return (
    <>
      <header className="on-dark relative overflow-hidden bg-plum text-mist">
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-6 sm:px-8">
          <nav className="flex items-center justify-between gap-3" aria-label="Main">
            <span className="heading min-w-0 text-xl">
              <span aria-hidden="true" className="min-[375px]:hidden">
                Luna
              </span>
              <span className="hidden min-[375px]:inline">Luna Hair Studio</span>
            </span>
            <div className="flex shrink-0 items-center gap-5">
              <Link href="/admin" className="hidden text-sm underline-offset-4 hover:underline sm:inline">
                Staff login
              </Link>
              <a
                href="#book"
                className="rounded-full bg-marigold px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist sm:px-5"
              >
                Book a time
              </a>
            </div>
          </nav>

          <div className="relative mt-14 sm:mt-20">
            <Crescent className="pointer-events-none absolute right-0 top-[6%] h-[clamp(5rem,22vw,20rem)] w-[clamp(5rem,22vw,20rem)] text-marigold" />
            <h1 className="display rise text-[clamp(8rem,34vw,30rem)]">
              Luna
              <span className="sr-only"> Hair Studio</span>
            </h1>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <p className="max-w-[22ch] text-balance text-2xl font-medium leading-snug sm:text-3xl">
              Cuts and colour, with a chair held for you.
            </p>
            <ul className="grid divide-y divide-mist/25 overflow-hidden rounded-2xl border border-mist/25 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:w-[34rem]">
              {[
                ["Open", "Monday to Saturday"],
                ["Book ahead", `Up to ${SALON.maxDaysAhead} days`],
                ["Payment", "At the salon"],
              ].map(([k, v]) => (
                <li key={k} className="px-4 py-3">
                  <span className="block text-mist/70">{k}</span>
                  <span className="font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" aria-labelledby="services">
          <h2 id="services" className="heading mb-8 text-5xl sm:text-6xl">
            Services
          </h2>
          <ServiceTiles services={services} />
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8" aria-label="Colour and hours">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="rounded-[2rem] border border-rule bg-panel p-6 sm:p-8 lg:col-span-7">
              <ShadeCard />
            </div>

            <div className="on-dark rounded-[2rem] bg-plum p-6 text-mist sm:p-8 lg:col-span-5">
              <h3 className="heading text-3xl sm:text-4xl">Opening hours</h3>
              <dl className="mt-6 divide-y divide-mist/20">
                {DAYS.map(([label, idx]) => {
                  const h = SALON.hours[idx];
                  return (
                    <div key={label} className="flex justify-between py-2.5">
                      <dt className="font-medium">{label}</dt>
                      <dd className={h ? "" : "text-mist/60"}>
                        {h ? `${formatMinute(h.open)} – ${formatMinute(h.close)}` : "Closed"}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-4 text-sm text-mist/70">Times are in {SALON.timezone} time.</p>
            </div>
          </div>
        </section>

        <section id="book" className="bg-lilac-soft py-20" aria-labelledby="book-title">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <h2 id="book-title" className="heading text-5xl sm:text-6xl">
                Book your time
              </h2>
              <p className="mt-5 max-w-[34ch] text-lg text-muted">
                You only see times that are really free. We confirm every request personally.
              </p>
              <ol className="mt-10 space-y-5">
                {[
                  ["Choose a service", "Prices and durations are on each tile."],
                  ["Pick a day and time", "Closed days and taken times are hidden."],
                  ["Leave your details", "An email or a phone number is enough."],
                ].map(([title, text], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="heading grid h-10 w-10 shrink-0 place-items-center rounded-full bg-plum text-lg text-mist">
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

      <footer className="on-dark bg-plum text-mist">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-8">
          <span>Demo project by Danyil Shkodiuk. Names, prices and shades are sample data.</span>
          <Link href="/admin" className="underline underline-offset-4">
            Staff login
          </Link>
        </div>
      </footer>
    </>
  );
}
