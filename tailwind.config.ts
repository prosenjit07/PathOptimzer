import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          "50": "#eefaff",
          "100": "#d8f3ff",
          "200": "#b9e8ff",
          "300": "#88d8ff",
          "400": "#52bfff",
          "500": "#2a9eff",
          "600": "#1480f5",
          "700": "#1367df",
          "800": "#1755b4",
          "900": "#19498d",
          "950": "#102d57",
        },
        ink: {
          950: "#050507",
          900: "#0a0a0f",
          800: "#101018",
          700: "#16161f",
          600: "#1d1d28",
          500: "#262633",
        },
        acid: "#c6ff3d",
        flame: "#ff5b2e",
        violet: "#7c5cff",
        mint: "#34f0c6",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "border-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "blob": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.08)" },
          "66%": { transform: "translate(-30px,25px) scale(0.96)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 38s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "border-spin": "border-spin 6s linear infinite",
        blob: "blob 18s ease-in-out infinite",
      },
      fontFamily: {
        inter: "var(--font-inter)",
        instrument: "var(--font-instrument)",
        mono: "var(--font-mono)",
        body: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        serif: ["var(--font-instrument)", "ui-serif", "Georgia", "serif"],
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
        "radial-spot":
          "radial-gradient(circle at 50% 0%, rgba(124,92,255,0.18), transparent 60%)",
        "sky-bleed":
          "radial-gradient(80%_60%_at_50%_0%,rgba(186,230,253,0.6),transparent_60%),radial-gradient(50%_40%_at_85%_30%,rgba(196,181,253,0.45),transparent_60%),radial-gradient(50%_50%_at_15%_60%,rgba(165,243,252,0.45),transparent_60%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
