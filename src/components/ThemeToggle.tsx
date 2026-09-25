"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  // Starts null so we render nothing until mounted — avoids a
  // server/client mismatch, since the real theme is only known once
  // themeInitScript has run in the browser.
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("outhood-theme", next ? "dark" : "light");
    setIsDark(next);
  }

  if (isDark === null) {
    return <div className="h-8 w-14" aria-hidden />; // reserve space, avoid layout shift
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="flex h-8 w-14 items-center rounded-full border border-sandDeep bg-sand px-1 transition-colors dark:border-nightBorder dark:bg-nightCard"
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow transition-transform dark:bg-night ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
