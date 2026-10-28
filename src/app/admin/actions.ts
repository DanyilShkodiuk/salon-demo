"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  adminConfigured,
  checkPassword,
  createSession,
  verifySession,
} from "@/lib/auth";
import { getStore } from "@/lib/db";
import { isDemo } from "@/lib/demo";

export async function login(_prev: { error: string } | undefined, formData: FormData) {
  if (!adminConfigured()) {
    return { error: "Admin login is not configured. Set ADMIN_PASSWORD and ADMIN_SECRET." };
  }
  const password = String(formData.get("password") ?? "");
  if (!(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Wrong password." };
  }
  await startSession();
}

/** One-click sign-in for the public demo. Does nothing unless DEMO_MODE is on. */
export async function demoLogin(_prev: { error: string } | undefined) {
  if (!isDemo()) return { error: "Demo login is turned off." };
  if (!adminConfigured()) {
    return {
      error:
        "Demo login is not configured here. Set ADMIN_PASSWORD and ADMIN_SECRET (16+ characters) for this environment and redeploy.",
    };
  }
  await startSession();
}

async function startSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin");
}

export async function setStatus(formData: FormData) {
  const jar = await cookies();
  if (!(await verifySession(jar.get(ADMIN_COOKIE)?.value))) redirect("/admin");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["pending", "confirmed", "cancelled"].includes(status)) return;
  await getStore().setStatus(id, status as "pending" | "confirmed" | "cancelled");
  revalidatePath("/admin");
}
