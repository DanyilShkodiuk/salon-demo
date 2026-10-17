import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { MemoryStore } from "./memory-store";
import { PgStore } from "./pg-store";
import type { BookingStore } from "./store";

const globalForStore = globalThis as unknown as { __store?: BookingStore };

/**
 * Returns the booking store. Uses Neon Postgres when DATABASE_URL is set.
 * Without it, development falls back to memory; production refuses to start without a database.
 */
export function getStore(): BookingStore {
  if (globalForStore.__store) return globalForStore.__store;

  const url = process.env.DATABASE_URL;
  let store: BookingStore;
  if (url) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store = new PgStore(drizzle(neon(url)) as any);
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is not set");
  } else {
    store = new MemoryStore();
  }
  globalForStore.__store = store;
  return store;
}
