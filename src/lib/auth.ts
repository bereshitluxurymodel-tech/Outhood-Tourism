import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Credentials-based auth for the MVP. bcrypt hashing only — never store plaintext.
// No database adapter is used deliberately: adapters exist to persist
// OAuth accounts/sessions, neither of which applies here — login is
// entirely our own Credentials logic below, and sessions are JWTs, not
// database rows. Role lives on the User row and is embedded in the
// JWT/session so server code can check it without an extra DB round trip,
// but every sensitive mutation STILL re-checks resource ownership against
// the DB — the session role is not treated as sufficient authorization on
// its own for anything but coarse routing.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error -- role added by our authorize() return shape
        token.role = user.role;
        token.roleCheckedAt = Date.now();
        return token;
      }

      // Re-read the role from the database periodically (not on every
      // single request) so a role change — e.g. applying to become a
      // supplier — takes effect without needing to log out and back in,
      // without adding a DB round-trip to every page load. A 60-second
      // staleness window is an acceptable trade-off for an MVP of this
      // size; a production app might push role changes instead.
      const lastChecked = (token.roleCheckedAt as number | undefined) ?? 0;
      const isStale = Date.now() - lastChecked > 60_000;

      if (isStale && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (freshUser) token.role = freshUser.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};
