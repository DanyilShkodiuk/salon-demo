import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Run: npm run db:setup");
    process.exit(1);
  }

  const sql = neon(url);
  try {
    await sql`select 1`;
    const t = await sql`select to_regclass('public.bookings') as t`;
    if (!t[0].t) {
      console.log("Connected to Neon. The bookings table does not exist yet. Run: npm run db:migrate");
    } else {
      const c = await sql`select count(*)::int as n from bookings`;
      console.log(`Connected to Neon. bookings table exists, rows: ${c[0].n}`);
    }
  } catch (e) {
    console.error("Could not reach the database:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
