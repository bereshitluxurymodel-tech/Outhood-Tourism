// Runs before paint via a blocking <script> tag in layout.tsx — intentionally
// not a React effect, which would run after first paint and cause a flash.
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("outhood-theme");
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
