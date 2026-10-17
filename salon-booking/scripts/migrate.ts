import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Run: npm run db:setup");
    process.exit(1);
  }

  try {
    await migrate(drizzle(neon(url)), { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } catch (e) {
    console.error("Migration failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
