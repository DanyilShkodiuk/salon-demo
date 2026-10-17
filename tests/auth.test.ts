import { describe, expect, it } from "vitest";
import { adminConfigured, checkPassword, createSession, verifySession } from "@/lib/auth";

const env = {
  ADMIN_PASSWORD: "correct horse battery",
  ADMIN_SECRET: "x".repeat(32),
} as unknown as NodeJS.ProcessEnv;

describe("admin auth", () => {
  it("requires both values and a long secret", () => {
    expect(adminConfigured(env)).toBe(true);
    expect(adminConfigured({ ADMIN_PASSWORD: "a", ADMIN_SECRET: "short" } as never)).toBe(false);
    expect(adminConfigured({} as never)).toBe(false);
  });
  it("checks the password", async () => {
    expect(await checkPassword("correct horse battery", env)).toBe(true);
    expect(await checkPassword("wrong", env)).toBe(false);
    expect(await checkPassword("", env)).toBe(false);
  });
  it("accepts a fresh session and rejects tampered or expired ones", async () => {
    const t = await createSession(1_000_000, env);
    expect(await verifySession(t, 1_000_001, env)).toBe(true);
    const [exp, sig] = t.split(".");
    expect(await verifySession(`${Number(exp) + 1}.${sig}`, 1_000_001, env)).toBe(false);
    expect(await verifySession(`${exp}.${"0".repeat(sig.length)}`, 1_000_001, env)).toBe(false);
    expect(await verifySession(t, Number(exp) + 1, env)).toBe(false);
    expect(await verifySession(undefined, 1, env)).toBe(false);
  });
  it("rejects every session when auth is not configured", async () => {
    const t = await createSession(1, env);
    expect(await verifySession(t, 2, {} as never)).toBe(false);
  });
});
