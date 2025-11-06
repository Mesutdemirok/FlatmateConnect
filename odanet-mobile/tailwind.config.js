/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Odanet Brand Colors (matching web app)
        primary: {
          DEFAULT: "#0EA5A7", // Turkuaz
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F172A", // Dark Navy
          foreground: "#F8FAFC",
        },
        accent: {
          DEFAULT: "#F97316", // Orange
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC", // Light gray
        foreground: "#0F172A", // Dark text
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        border: "#D1D5DB",
      },
    },
  },
  plugins: [],
};
