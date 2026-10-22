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
          Create an account to list your business
        </h1>
        <p className="mt-3 text-ink/60 dark:text-nightInk/60">
          Suppliers use the same account as travellers. Sign up (or log in if you already have
          one), then you&apos;ll come straight back here to tell us about your business.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register?next=/supplier/apply"
            className="rounded-md bg-savanna px-6 py-3 font-medium text-white hover:bg-savannaDark"
          >
            Create an account
          </Link>
          <Link
            href="/login?next=/supplier/apply"
            className="rounded-md border border-sandDeep px-6 py-3 font-medium text-ink hover:bg-sandDeep dark:border-nightBorder dark:text-nightInk dark:hover:bg-nightBorder"
          >
            Log in
          </Link>
        </div>
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
