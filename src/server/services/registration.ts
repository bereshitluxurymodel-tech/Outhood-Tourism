import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export class RegistrationError extends Error {}

export async function registerCustomer(input: { name: string; email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  if (input.password.length < 8) {
    throw new RegistrationError("Password must be at least 8 characters.");
  }
  if (!input.name.trim()) {
    throw new RegistrationError("Please enter your name.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new RegistrationError("An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  // New accounts are always CUSTOMER — becoming a supplier is a separate,
  // explicit step (the /supplier/apply flow), never something registration
  // itself grants.
  return prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash, role: "CUSTOMER" },
  });
}
