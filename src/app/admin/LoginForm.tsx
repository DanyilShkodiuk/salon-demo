"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 max-w-sm">
      <label htmlFor="password" className="mb-1 block text-sm font-medium">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="w-full rounded-xl border border-rule bg-white px-4 py-3 focus:border-sage"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-sage px-6 py-3 font-semibold text-white transition-colors hover:bg-sage-deep disabled:opacity-50"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
      <p role="alert" className="mt-3 min-h-6 text-sm text-alert">
        {state?.error}
      </p>
    </form>
  );
}
