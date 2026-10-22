"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Where to go after signing in. Only same-site paths are accepted
// ("/something", never "//evil.com" or a full URL) so a crafted link
// can't bounce someone to another website after login.
function getNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Carry ?next=... across to the sign-up page. Set after mount (not read
  // during render) so server and browser HTML always match.
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(getNextPath());
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Log in</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-nightInk/60">
        New here?{" "}
        <Link href={`/register${search}`} className="font-medium text-savannaDark underline dark:text-savanna">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-sandDeep bg-white px-4 py-3 text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-savanna px-4 py-3 font-medium text-white hover:bg-savannaDark disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
