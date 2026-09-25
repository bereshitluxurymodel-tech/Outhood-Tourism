import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Outhood palette v2: sunset coral + deep teal — a bolder, more
        // current travel-brand duotone, replacing the earlier muted
        // khaki/ochre look. Variable names kept the same on purpose so
        // every existing component picks up the new colors automatically.
        ink: "#161A2B",          // deep navy-charcoal, warmer than plain black
        savanna: "#FF6B4A",      // vibrant sunset coral — primary accent/CTAs
        savannaDark: "#E5502F",  // hover state
        acacia: "#0D7377",       // deep teal — secondary accent
        sand: "#FFF8F0",         // warm cream background
        sandDeep: "#FFE3D1",     // soft peach border/card tone
        sky: "#14B8A6",          // bright teal for links/info
        // Dark theme surfaces — deep navy family, not a generic gray.
        night: "#12121C",
        nightCard: "#1C1C2B",
        nightBorder: "#33334A",
        nightInk: "#F5F0E8",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};
export default config;
