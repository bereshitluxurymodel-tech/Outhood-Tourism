import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { resolveMockPayment } from "@/server/services/payment";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ outcome: z.enum(["PAID", "FAILED"]) });

export async function POST(request: Request, { params }: { params: { paymentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  // Ownership check: a customer may only resolve a payment on their OWN
  // booking — this is exactly the kind of per-resource check that a role
  // check alone would miss.
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { booking: true },
  });
  if (!payment || payment.booking.customerId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updated = await resolveMockPayment(params.paymentId, parsed.data.outcome);
  return NextResponse.json({ status: updated.status });
}
