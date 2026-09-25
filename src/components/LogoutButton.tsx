"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover:text-ink dark:hover:text-nightInk"
    >
      Log out
    </button>
  );
}
