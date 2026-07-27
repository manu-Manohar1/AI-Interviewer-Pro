/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          400: "#38bdf8",
          500: "#06b6d4", // Cyan accent
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        surface: {
          50: "#1e293b",
          100: "#0f172a",
          200: "#0b0f19", // Deep obsidian dark background
          300: "#070a12",
        },
        border: "rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      backdropBlur: {
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        glow: "0 0 25px -5px rgba(6, 182, 212, 0.25)",
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { "background-size": "200% 200%", "background-position": "left center" },
          "50%": { "background-size": "200% 200%", "background-position": "right center" },
        },
      },
    },
  },
  plugins: [],
};