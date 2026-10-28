"use client";

import { useActionState } from "react";
import { demoLogin } from "./actions";

export default function DemoLoginForm() {
  const [state, action, pending] = useActionState(demoLogin, undefined);
  return (
    <form action={action} className="mt-6 max-w-sm rounded-[1.5rem] bg-lilac-soft p-5">
      <p className="font-semibold">Just looking around?</p>
      <p className="mt-1 text-sm">
        This is a public demo. Open the admin panel without a password. Contacts are hidden.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full bg-marigold px-6 py-3 font-medium text-plum hover:brightness-95 disabled:opacity-50"
      >
        {pending ? "Opening…" : "Enter demo admin"}
      </button>
      <p role="alert" className="mt-3 text-sm text-alert empty:hidden">
        {state?.error}
      </p>
    </form>
  );
}
