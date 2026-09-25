import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId, createSupplierListing, SupplierServiceError } from "@/server/services/supplier";

const bodySchema = z.object({
  destinationId: z.string().min(1),
  type: z.enum(["ACCOMMODATION", "EXPERIENCE", "TOUR_PACKAGE"]),
  title: z.string().min(3),
  description: z.string().min(10),
  basePriceCents: z.number().int().positive(),
  cancellationPolicy: z.string().min(3),
  instantConfirm: z.boolean(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const supplier = await getSupplierByUserId((session.user as { id: string }).id);
  if (!supplier) {
    return NextResponse.json({ error: "No supplier account found for this user." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  try {
    const listing = await createSupplierListing({ supplierId: supplier.id, ...parsed.data });
    return NextResponse.json({ id: listing.id });
  } catch (err) {
    if (err instanceof SupplierServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong creating the listing." }, { status: 500 });
  }
}
