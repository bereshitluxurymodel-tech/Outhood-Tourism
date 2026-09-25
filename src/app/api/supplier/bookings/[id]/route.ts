import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupplierByUserId } from "@/server/services/supplier";
import { transitionSupplierBooking, InvalidBookingTransitionError } from "@/server/services/supplierBooking";

const bodySchema = z.object({
  to: z.enum(["CONFIRMED", "REJECTED", "CANCELLED", "COMPLETED"]),
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    await transitionSupplierBooking(params.id, supplier.id, parsed.data.to);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof InvalidBookingTransitionError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
}
