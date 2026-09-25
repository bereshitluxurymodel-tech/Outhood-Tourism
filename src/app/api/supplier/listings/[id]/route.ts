import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId, updateSupplierListing, SupplierServiceError } from "@/server/services/supplier";

const bodySchema = z.object({
  destinationId: z.string().min(1).optional(),
  type: z.enum(["ACCOMMODATION", "EXPERIENCE", "TOUR_PACKAGE"]).optional(),
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  basePriceCents: z.number().int().positive().optional(),
  cancellationPolicy: z.string().min(3).optional(),
  instantConfirm: z.boolean().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    // updateSupplierListing itself re-checks that this listing belongs to
    // THIS supplier before writing anything — the session/role check above
    // is not treated as sufficient on its own.
    await updateSupplierListing(params.id, supplier.id, parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SupplierServiceError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong updating the listing." }, { status: 500 });
  }
}
