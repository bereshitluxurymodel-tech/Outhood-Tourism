import { NextResponse } from "next/server";
import { z } from "zod";
import { registerCustomer, RegistrationError } from "@/server/services/registration";

const bodySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all fields correctly." }, { status: 400 });
  }

  try {
    await registerCustomer(parsed.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof RegistrationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong creating your account." }, { status: 500 });
  }
}
