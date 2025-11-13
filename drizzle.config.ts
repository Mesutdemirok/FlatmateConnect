import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // 🔥 FIX: Disable strict mode so Replit stops deleting columns
  strict: false,

  // Optional: keep logs
  verbose: true,
});
