import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listSuppliersForAdmin } from "@/server/services/admin";
import { AdminNav } from "@/components/AdminNav";
import { AdminSupplierActions } from "@/components/AdminSupplierActions";

export default async function AdminSuppliersPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;
  if (!session?.user) redirect("/login");
  if (user?.role !== "ADMIN") redirect("/");

  const suppliers = await listSuppliersForAdmin();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Suppliers</h1>
      <AdminNav />

      <div className="mt-6 divide-y divide-sandDeep rounded-card border border-sandDeep dark:divide-nightBorder dark:border-nightBorder">
        {suppliers.map((s) => (
          <div key={s.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-ink dark:text-nightInk">{s.businessName}</p>
                <p className="text-sm text-ink/60 dark:text-nightInk/60">
                  {s.category} · {s.location} · {s.user.email}
                </p>
                <p className="text-sm text-ink/50 dark:text-nightInk/50">{s._count.listings} listing(s)</p>
              </div>
              <span className="rounded bg-sandDeep px-2 py-1 text-xs text-ink/70 dark:bg-nightBorder dark:text-nightInk/70">
                {s.verificationStatus}
              </span>
            </div>
            <AdminSupplierActions supplierId={s.id} status={s.verificationStatus} />
          </div>
        ))}
        {suppliers.length === 0 && (
          <p className="p-4 text-ink/60 dark:text-nightInk/60">No suppliers yet.</p>
        )}
      </div>
    </main>
  );
}
