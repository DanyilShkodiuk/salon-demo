import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { ensureDemoData, isDemo, maskContact, maskName } from "@/lib/demo";
import { formatMinute, localNow } from "@/lib/time";
import LoginForm from "./LoginForm";
import DemoLoginForm from "./DemoLoginForm";
import { logout, setStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookings | Luna Hair Studio", robots: { index: false } };

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-sand text-ink",
  confirmed: "bg-sage-soft text-success",
  cancelled: "bg-alert-soft text-alert line-through",
};

export default async function AdminPage() {
  const jar = await cookies();
  const authed = await verifySession(jar.get(ADMIN_COOKIE)?.value);
  const demo = isDemo();

  if (!authed) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="eyebrow text-gold">Luna Hair Studio</p>
        <h1 className="heading mt-3 text-5xl">Staff login</h1>
        <p className="mt-3 text-muted">Sign in to see and confirm bookings.</p>
        {demo && <DemoLoginForm />}
        {!demo && <LoginForm />}
        <Link href="/" className="mt-10 inline-block text-sm underline underline-offset-4">
          Back to booking page
        </Link>
      </main>
    );
  }

  const store = getStore();
  if (demo) await ensureDemoData(store);
  const all = await store.list();
  const today = localNow().date;
  const upcoming = all.filter((b) => b.date >= today);
  const past = all.filter((b) => b.date < today);

  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Luna Hair Studio</p>
          <h1 className="heading mt-3 text-5xl">Bookings</h1>
        </div>
        <form action={logout}>
          <button className="text-sm underline underline-offset-4">Sign out</button>
        </form>
      </div>
      {demo && (
        <p className="mt-4 rounded-xl border border-sand-deep bg-sand/60 px-4 py-3 text-sm text-muted">
          Demo mode: anyone can open this page, so surnames and contacts are masked. Try confirming or
          cancelling a booking.
        </p>
      )}

      <Section title="Upcoming" rows={upcoming} empty="No upcoming bookings yet." demo={demo} />
      {past.length > 0 && <Section title="Past" rows={past} empty="" demo={demo} />}
    </main>
  );
}

function Section({
  title,
  rows,
  empty,
  demo,
}: {
  title: string;
  rows: Awaited<ReturnType<ReturnType<typeof getStore>["list"]>>;
  empty: string;
  demo: boolean;
}) {
  return (
    <section className="mt-10">
      <h2 className="heading text-3xl">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-rule rounded-[1.5rem] border border-rule bg-panel">
          {rows.map((b) => (
            <li key={b.id} className="flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-medium">
                  {b.date}, {formatMinute(b.startMinute)}–
                  {formatMinute(b.startMinute + b.durationMinutes)} · {b.serviceName}
                </p>
                <p className="mt-1 text-sm">
                  {demo ? maskName(b.customerName) : b.customerName} ·{" "}
                  <span className="text-muted">{demo ? maskContact(b.contact) : b.contact}</span>
                </p>
                {b.note && <p className="mt-1 text-sm text-muted">Note: {b.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLE[b.status]}`}
                >
                  {b.status}
                </span>
                {b.status !== "confirmed" && <StatusButton id={b.id} status="confirmed" label="Confirm" />}
                {b.status !== "cancelled" && <StatusButton id={b.id} status="cancelled" label="Cancel" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-full border border-rule px-4 py-1.5 text-sm transition-colors hover:border-sage">
        {label}
      </button>
    </form>
  );
}
