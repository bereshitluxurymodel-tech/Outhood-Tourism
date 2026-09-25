import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { SupplierApplyForm } from "@/components/SupplierApplyForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SupplierApplyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink dark:text-nightInk">
          Log in to apply as a supplier
        </h1>
        <p className="mt-3 text-ink/60 dark:text-nightInk/60">
          You&apos;ll need an Outhood account first — it&apos;s the same login travellers use.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark"
        >
          Log in
        </Link>
      </main>
    );
  }

  const existingSupplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (existingSupplier) {
    redirect("/supplier/dashboard");
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">List your travel business</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-nightInk/60">
        Tell us about your lodge, camp, tour company, or activity business.
      </p>
      <SupplierApplyForm />
    </main>
  );
}
