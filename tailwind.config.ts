import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      colors: {
        // === FOUNDATION ===
        background: "var(--background)", // #F8FAFC
        foreground: "var(--foreground)", // #0F172A

        card: {
          DEFAULT: "var(--card)", // #FFFFFF
          foreground: "var(--card-foreground)", // #0F172A
        },

        popover: {
          DEFAULT: "var(--popover)", // #FFFFFF
          foreground: "var(--popover-foreground)", // #0F172A
        },

        // === CORE COLORS ===
        primary: {
          DEFAULT: "var(--primary)", // #0EA5A7
          foreground: "var(--primary-foreground)", // #FFFFFF
        },

        secondary: {
          DEFAULT: "var(--secondary)", // #0F172A
          foreground: "var(--secondary-foreground)", // #F8FAFC
        },

        accent: {
          DEFAULT: "var(--accent)", // #F97316
          foreground: "var(--accent-foreground)", // #FFFFFF
        },

        muted: {
          DEFAULT: "var(--muted)", // #F1F5F9
          foreground: "var(--muted-foreground)", // #64748B
        },

        destructive: {
          DEFAULT: "var(--destructive)", // #DC2626
          foreground: "var(--destructive-foreground)", // #FFFFFF
        },

        border: "var(--border)", // #D1D5DB
        input: "var(--input)", // #FFFFFF
        ring: "var(--ring)", // #0EA5A7

        // === CHART COLORS ===
        chart: {
          "1": "var(--chart-1)", // #0EA5A7 (Turkuaz)
          "2": "var(--chart-2)", // #F59E0B (Amber)
          "3": "var(--chart-3)", // #3B82F6 (Blue)
          "4": "var(--chart-4)", // #22C55E (Green)
          "5": "var(--chart-5)", // #E11D48 (Rose)
        },

        // === SIDEBAR (OPTIONAL) ===
        sidebar: {
          DEFAULT: "var(--sidebar, #F8FAFC)",
          foreground: "var(--sidebar-foreground, #0F172A)",
          primary: "var(--sidebar-primary, #0EA5A7)",
          "primary-foreground": "var(--sidebar-primary-foreground, #FFFFFF)",
          accent: "var(--sidebar-accent, #F97316)",
          "accent-foreground": "var(--sidebar-accent-foreground, #FFFFFF)",
          border: "var(--sidebar-border, #D1D5DB)",
          ring: "var(--sidebar-ring, #0EA5A7)",
        },
      },

      // === TYPOGRAPHY ===
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
      },

      // === ANIMATIONS ===
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },

  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
