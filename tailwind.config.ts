import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-heading)", "ui-serif", "Georgia"],
      },
      colors: {
        ink: {
          950: "#0b0b0c",
          900: "#141416",
          800: "#1c1d20",
          700: "#2a2b31",
          600: "#3a3b42",
          500: "#51525c",
          400: "#6b6c76",
          300: "#8f9099",
          200: "#b9bac2",
          100: "#e0e1e7",
          50: "#f5f5f7"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(16, 16, 20, 0.08)"
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};

export default config;
