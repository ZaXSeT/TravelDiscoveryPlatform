import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

// Tokens are defined as CSS variables in src/app/globals.css and referenced here so
// components use semantic names only (ProjectDocs/Phase0/11_DESIGN_TOKENS.md).
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "1.5rem", lg: "3rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        surface: {
          DEFAULT: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          gold: "var(--accent-gold)",
          goldText: "var(--accent-gold-text)",
          blue: "var(--accent-blue)",
          green: "var(--accent-green)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        dark: {
          0: "var(--surface-dark-0)",
          1: "var(--surface-dark-1)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      transitionTimingFunction: {
        entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "9999px",
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(17,17,17,0.12)",
        card: "0 12px 40px -16px rgba(17,17,17,0.18)",
      },
      maxWidth: {
        container: "1280px",
        prose: "68ch",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease both",
        "rise-in": "rise-in 0.7s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
