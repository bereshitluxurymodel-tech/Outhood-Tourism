import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listComplaintsForAdmin } from "@/server/services/admin";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminComplaintsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/login");
  if (user?.role !== "ADMIN") redirect("/");

  const complaints = await listComplaintsForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Complaints</h1>
      <AdminNav />

      {complaints.length === 0 ? (
        <p className="mt-8 text-ink/60 dark:text-nightInk/60">
          No complaints yet. The complaint and service recovery data model is fully built
          (booking-linked complaints, resolution workflow, audit trail) — customers just don&apos;t
          have a submission form yet, so nothing will appear here until that&apos;s built.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
          {complaints.map((c) => (
            <div key={c.id} className="p-4">
              <p className="font-medium text-ink dark:text-nightInk">
                {c.category} · {c.booking.reference}
              </p>
              <p className="text-sm text-ink/60 dark:text-nightInk/60">
                {c.customer.name} · {c.priority} priority · {c.status}
              </p>
              <p className="mt-1 text-sm text-ink/70 dark:text-nightInk/70">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
