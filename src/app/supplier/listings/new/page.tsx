import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/ListingForm";
import { redirect } from "next/navigation";

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) redirect("/supplier/apply");

  const destinations = await prisma.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">New listing</h1>
      <ListingForm destinations={destinations} />
    </main>
  );
}
