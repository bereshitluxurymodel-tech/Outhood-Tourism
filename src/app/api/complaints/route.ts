import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createComplaint, ComplaintError } from "@/server/services/complaint";

const bodySchema = z.object({
  bookingId: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in the complaint form." }, { status: 400 });
  }

  try {
    await createComplaint({ customerId: (session.user as { id: string }).id, ...parsed.data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ComplaintError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
