"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputClass =
  "rounded-md border border-sandDeep bg-white px-4 py-3 text-base text-ink outline-none focus:border-savanna dark:border-nightBorder dark:bg-nightCard dark:text-nightInk";

// Where to go after signing in. Only same-site paths are accepted
// ("/something", never "//evil.com" or a full URL) so a crafted link
// can't bounce someone to another website after login.
function getNextPath(): string {
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Something went wrong.");
      return;
    }

    // Account created — sign them straight in rather than making them
    // re-enter the same credentials on the login page.
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      router.push("/login");
      return;
    }
    router.push(getNextPath());
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-16 sm:py-20">
      <h1 className="font-display text-2xl text-ink dark:text-nightInk">Create your account</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-nightInk/60">
        Already have one?{" "}
        <Link href={`/login${search}`} className="font-medium text-savannaDark underline dark:text-savanna">
          Log in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <input type="text" required autoComplete="name" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <input type="password" required minLength={8} autoComplete="new-password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="rounded-md bg-savanna px-4 py-3 font-medium text-white hover:bg-savannaDark disabled:opacity-60">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </main>
  );
}
