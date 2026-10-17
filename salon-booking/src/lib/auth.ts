const COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_MAX_AGE = MAX_AGE_SECONDS;

const enc = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function adminConfigured(env = process.env): boolean {
  return Boolean(env.ADMIN_PASSWORD && env.ADMIN_SECRET && env.ADMIN_SECRET.length >= 16);
}

export async function checkPassword(input: string, env = process.env): Promise<boolean> {
  if (!adminConfigured(env)) return false;
  // Compare digests so the comparison time does not depend on where strings differ.
  const [a, b] = await Promise.all([
    hmac(env.ADMIN_SECRET!, input),
    hmac(env.ADMIN_SECRET!, env.ADMIN_PASSWORD!),
  ]);
  return safeEqual(a, b);
}

export async function createSession(nowMs = Date.now(), env = process.env): Promise<string> {
  const expires = nowMs + MAX_AGE_SECONDS * 1000;
  const sig = await hmac(env.ADMIN_SECRET!, `admin.${expires}`);
  return `${expires}.${sig}`;
}

export async function verifySession(
  token: string | undefined,
  nowMs = Date.now(),
  env = process.env,
): Promise<boolean> {
  if (!token || !adminConfigured(env)) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < nowMs) return false;
  const expected = await hmac(env.ADMIN_SECRET!, `admin.${expires}`);
  return safeEqual(sig, expected);
}
