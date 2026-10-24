# Luna Hair Studio: booking demo

Online booking for a small salon. Customers pick a service, a day and a free time. The owner confirms or cancels bookings in a password-protected admin page.

**Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS 4, Drizzle ORM, Neon Postgres, Zod, Vitest.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in ADMIN_PASSWORD and ADMIN_SECRET
npm run dev
```

Without `DATABASE_URL`, development uses an in-memory store (data resets on restart). Production refuses to start without a database.

## Connect Neon

1. In the Neon dashboard open your project and click **Connect**. Copy the connection string.
2. Save it without showing it on screen: `npm run db:setup`, paste (nothing appears), press Enter. This writes `DATABASE_URL` to `.env.local`, which is never committed.
3. Create the table: `npm run db:migrate`
4. Check the connection: `npm run db:check` (prints whether the table exists and how many bookings it holds)
5. Start the app: `npm run dev`. Bookings now persist across restarts.

## Email notifications

Each new booking emails the owner (with the customer's details and a reply-to set to the customer, when they left an email). If the customer left an email, they also get a short "we received your booking" note. Emails go through [Resend](https://resend.com) and are sent after the response, so a slow or failing mail provider never blocks or breaks a booking.

1. Create a Resend account and an API key.
2. Add to `.env.local` (and to the Vercel project settings): `RESEND_API_KEY`, `NOTIFY_FROM`, `NOTIFY_OWNER_EMAIL`.
3. For a quick test, `NOTIFY_FROM="Luna Hair Studio <onboarding@resend.dev>"` works, but Resend then only delivers to your own account's email. To email customers, verify the salon's domain in Resend and send from it.

With any of the three variables empty, emails are skipped and bookings work as before.

## Checks

```bash
npm test          # slot logic, validation, auth, emails, and SQL on a real Postgres engine (PGlite)
npm run typecheck
npm run build
```

## How double booking is prevented

The API re-checks the chosen time on submit, then inserts with a single SQL statement that only succeeds if no active booking overlaps. If two people submit the same time at once, the second gets a 409 and sees fresh times. The one-statement guard is not a database-level lock; for a busy salon add a Postgres exclusion constraint.

## Not included yet

The client project brief form with AI planning, and the Cloudflare deployment config are the next stages.

## Design notes

Style: oversized-type minimalism with a bento layout. Palette: plum `#38205a`, lilac `#cbb8f0`, mist `#f1eff6`, with marigold `#f4b63a` reserved for calls to action and the selected time. Font: Bricolage Grotesque (variable, self-hosted via `@fontsource-variable`). It covers Latin and Latin Extended (Polish letters work) but not Cyrillic; add a second font before localising to Ukrainian.

Colour tokens live in `src/app/globals.css`. Replace the sample shades in `src/components/ShadeCard.tsx` and add real photos when the salon has them.
