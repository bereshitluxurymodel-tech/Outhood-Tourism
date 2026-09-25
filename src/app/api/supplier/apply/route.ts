import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { applyAsSupplier, SupplierServiceError } from "@/server/services/supplier";

const bodySchema = z.object({
  businessName: z.string().min(2),
  contactPerson: z.string().min(2),
  category: z.string().min(2),
  location: z.string().min(2),
  description: z.string().min(10),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to apply." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  try {
    await applyAsSupplier({
      userId: (session.user as { id: string }).id,
      ...parsed.data,
      websiteUrl: parsed.data.websiteUrl || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SupplierServiceError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong submitting your application." }, { status: 500 });
  }
}
