import Link from "next/link";
import BookingFlow from "@/components/BookingFlow";
import Crescent from "@/components/Crescent";
import CountUp from "@/components/CountUp";
import NextFreeBadge from "@/components/NextFreeBadge";
import ScrollReveal from "@/components/ScrollReveal";
import ServiceFinder from "@/components/ServiceFinder";
import ServiceTiles from "@/components/ServiceTiles";
import ShadeCard from "@/components/ShadeCard";
import ThemeToggle from "@/components/ThemeToggle";
import { CONTACT, FAQ, REVIEWS, STATS, STORY, TEAM, TIMELINE, VALUES } from "@/lib/brand";
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
  ["Story", "#story"],
  ["Services", "#services"],
  ["Team", "#team"],
  ["Hours", "#hours"],
  ["FAQ", "#faq"],
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
              <a key={href} href={href} className="hidden text-muted hover:text-ink lg:inline">
                {label}
              </a>
            ))}
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
        <div className="relative isolate overflow-hidden">
          <div className="aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
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
            <div className="mt-5">
              <NextFreeBadge serviceId="cut" serviceName="Haircut" />
            </div>
            <dl className="mt-8 grid max-w-xl grid-cols-3 gap-4 border-t border-rule pt-6 text-sm">
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_50px_80px_-50px_rgba(43,37,33,0.5)] bg-gradient-to-b from-sand-deep via-sand to-sage-soft">
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

        </div>

        <section
          id="story"
          className="relative isolate overflow-hidden border-t border-rule py-20 sm:py-28"
          aria-labelledby="story-title"
        >
          <div aria-hidden="true" className="orbits -right-40 -top-24 -z-10 w-[44rem]" />
          <div aria-hidden="true" className="orbits -bottom-64 -left-56 -z-10 w-[36rem] opacity-60" />
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20">
              <div className="reveal">
                <p className="eyebrow text-gold">Our story</p>
                <h2 id="story-title" className="heading mt-3 text-balance text-5xl sm:text-6xl">
                  {STORY.title}
                </h2>
                {STORY.paragraphs.map((p) => (
                  <p key={p.slice(0, 20)} className="mt-6 max-w-[58ch] text-pretty text-lg text-muted">
                    {p}
                  </p>
                ))}
                <figure className="mt-10 border-l-2 border-gold/60 pl-6">
                  <blockquote className="display text-3xl italic sm:text-4xl">“{STORY.quote}”</blockquote>
                  <figcaption className="mt-3 text-sm text-muted">{STORY.quoteBy}</figcaption>
                </figure>
              </div>

              <ol className="reveal relative space-y-8 border-l border-rule pl-8 lg:mt-24">
                {TIMELINE.map(([year, title, text]) => (
                  <li key={year} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.35rem] top-1.5 h-3 w-3 rounded-full border-2 border-gold bg-cream"
                    />
                    <p className="eyebrow text-gold">{year}</p>
                    <p className="heading mt-1 text-2xl">{title}</p>
                    <p className="mt-1 text-muted">{text}</p>
                  </li>
                ))}
              </ol>
            </div>

            <ul className="mt-20 grid gap-4 sm:grid-cols-3">
              {VALUES.map(([title, text], i) => (
                <li
                  key={title}
                  className="reveal surface rounded-[1.75rem] p-6 sm:p-8"
                  style={{ transitionDelay: `${i * 120}ms` }}
                >
                  <span className="heading text-4xl text-gold">0{i + 1}</span>
                  <p className="heading mt-4 text-2xl">{title}</p>
                  <p className="mt-2 text-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-label="Luna in numbers" className="on-dark glow-gold bg-night text-night-text">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 lg:grid-cols-4">
            {STATS.map((st) => (
              <div key={st.label} className="reveal flex flex-col-reverse text-center">
                <dt className="mt-2 text-sm text-night-text/75">{st.label}</dt>
                <dd className="display text-5xl text-gold sm:text-6xl">
                  <CountUp value={st.value} suffix={st.suffix} decimals={"decimals" in st ? st.decimals : 0} />
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          id="services"
          className="glow overflow-x-clip border-t border-rule bg-panel py-20 sm:py-24"
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
            <div className="reveal">
              <ServiceTiles services={services} />
            </div>
          </div>
        </section>

        <div className="relative isolate overflow-hidden">
          <div className="aurora" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        <section className="relative mx-auto max-w-6xl px-5 pt-20 sm:px-8 sm:pt-24" aria-labelledby="finder-title">
          <div className="reveal grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
            <div>
              <p className="eyebrow text-gold">Not sure?</p>
              <h2 id="finder-title" className="heading mt-3 text-5xl">
                Find your service
              </h2>
              <p className="mt-5 max-w-[36ch] text-lg text-muted">
                Two quick questions and we will suggest the right appointment, with a tip from our
                stylists.
              </p>
            </div>
            <ServiceFinder services={services} />
          </div>
        </section>

        <section id="team" className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pb-24 sm:pt-24" aria-labelledby="team-title">
          <div className="reveal mb-10">
            <p className="eyebrow text-gold">The team</p>
            <h2 id="team-title" className="heading mt-3 text-5xl sm:text-6xl">
              Hands you can trust
            </h2>
          </div>
          <ul className="grid gap-5 md:grid-cols-3">
            {TEAM.map((m, i) => (
              <li
                key={m.name}
                className="reveal surface group rounded-[2rem] p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[0_24px_40px_-28px_rgba(43,37,33,0.45)] sm:p-8"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div
                  aria-hidden="true"
                  className={`relative grid aspect-[5/4] place-items-center overflow-hidden rounded-t-[999px] rounded-b-[1.25rem] bg-gradient-to-b ${m.tone}`}
                >
                  <span className="display text-7xl text-ink/70 transition-transform duration-700 group-hover:scale-110">
                    {m.initials}
                  </span>
                </div>
                <p className="heading mt-6 text-3xl">{m.name}</p>
                <p className="eyebrow mt-2 text-gold">{m.role}</p>
                <p className="mt-3 text-muted">{m.bio}</p>
              </li>
            ))}
          </ul>
        </section>

        </div>

        <section
          id="hours"
          className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24"
          aria-label="Colour and hours"
        >
          <div className="reveal grid gap-5 lg:grid-cols-12">
            <div className="surface rounded-[2rem] p-6 sm:p-10 lg:col-span-7">
              <ShadeCard />
            </div>

            <div className="rounded-[2rem] bg-sand p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_24px_48px_-32px_rgba(43,37,33,0.3)] sm:p-10 lg:col-span-5">
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

        <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-24" aria-labelledby="reviews-title">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold">Kind words</p>
              <h2 id="reviews-title" className="heading mt-3 text-5xl sm:text-6xl">
                From our chairs
              </h2>
            </div>
            <p className="text-sm text-muted">Sample reviews for this demo.</p>
          </div>
          <ul className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map((r, i) => (
              <li
                key={r.name}
                className="reveal flex flex-col justify-between gap-8 rounded-[2rem] bg-sand p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_24px_48px_-32px_rgba(43,37,33,0.3)] sm:p-8"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <figure>
                  <p className="text-gold" aria-label="5 out of 5 stars">
                    ★★★★★
                  </p>
                  <blockquote className="display mt-4 text-2xl italic leading-snug">“{r.text}”</blockquote>
                  <figcaption className="mt-6 text-sm">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-muted"> · {r.detail}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </section>

        <section id="book" className="glow bg-sand py-20 sm:py-24" aria-labelledby="book-title">
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

        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24" aria-label="Questions and contact">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div id="faq" className="reveal">
              <p className="eyebrow text-gold">Good to know</p>
              <h2 className="heading mt-3 text-5xl sm:text-6xl">Questions</h2>
              <div className="mt-8 divide-y divide-rule border-y border-rule">
                {FAQ.map(([q, a]) => (
                  <details key={q} className="faq group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold">
                      {q}
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-rule text-gold transition-transform duration-300 group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-[60ch] text-muted">{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="reveal">
              <p className="eyebrow text-gold">Find us</p>
              <h2 className="heading mt-3 text-5xl sm:text-6xl">Visit Luna</h2>
              <div className="surface mt-8 overflow-hidden rounded-[2rem]">
                <StreetMap />
                <address className="grid gap-1 p-6 not-italic sm:p-8">
                  <span className="heading text-2xl">{CONTACT.street}</span>
                  <span className="text-muted">{CONTACT.city}</span>
                  <span className="mt-4">{CONTACT.phone}</span>
                  <span>{CONTACT.email}</span>
                  <span className="text-muted">{CONTACT.instagram}</span>
                </address>
              </div>
              <p className="mt-3 text-sm text-muted">Sample address and contacts for this demo.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="on-dark bg-night text-night-text">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 text-sm sm:px-8 md:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <span className="flex items-center gap-2.5">
              <Crescent className="h-6 w-6 text-gold" />
              <span className="heading text-2xl">Luna Hair Studio</span>
            </span>
            <p className="mt-4 max-w-[36ch] text-night-text/70">
              A quiet studio for cuts, colour and styling on Moon Street, Warsaw.
            </p>
          </div>
          <nav aria-label="Footer">
            <p className="eyebrow text-gold">Explore</p>
            <ul className="mt-4 space-y-2">
              {NAV.map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-night-text/80 hover:text-night-text">
                    {label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#book" className="text-night-text/80 hover:text-night-text">
                  Book online
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <p className="eyebrow text-gold">Contact</p>
            <ul className="mt-4 space-y-2 text-night-text/80">
              <li>{CONTACT.street}, Warsaw</li>
              <li>{CONTACT.phone}</li>
              <li>{CONTACT.email}</li>
              <li>
                <Link href="/admin" className="underline underline-offset-4 hover:text-night-text">
                  Staff login
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-night-text/10">
          <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-night-text/60 sm:px-8">
            Demo project by Danyil Shkodiuk. The salon, its story, team, reviews, prices and
            contacts are sample data.
          </p>
        </div>
        <ScrollReveal />
      </footer>
    </>
  );
}

/** A hand-drawn street map of the (sample) salon's corner, so no map service is needed. */
function StreetMap() {
  return (
    <svg viewBox="0 0 400 220" role="img" aria-label="Map: Luna is on Księżycowa Street, near the park" className="block h-auto w-full bg-sand">
      <rect x="250" y="20" width="130" height="80" rx="18" className="fill-sage-soft" />
      <text x="315" y="64" textAnchor="middle" className="fill-muted text-[11px]">Park</text>
      <g className="stroke-panel" strokeLinecap="round" fill="none">
        <path d="M-10 140 H410" strokeWidth="22" />
        <path d="M120 -10 V230" strokeWidth="16" />
        <path d="M-10 40 L230 180" strokeWidth="12" />
        <path d="M300 120 V230" strokeWidth="12" />
      </g>
      <text x="16" y="170" className="fill-muted text-[11px] tracking-[0.15em]">KSIĘŻYCOWA</text>
      <g transform="translate(205 122)">
        <circle r="22" className="fill-gold/25 map-pulse" />
        <path d="M0 10 C-10 -2 -12 -6 -12 -11 A12 12 0 0 1 12 -11 C12 -6 10 -2 0 10 Z" className="fill-sage" />
        <circle cy="-11" r="4.5" className="fill-panel" />
      </g>
    </svg>
  );
}
