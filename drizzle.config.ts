import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// Sanitize DATABASE_URL - remove duplicate prefix if present
let connectionString = process.env.DATABASE_URL;
if (connectionString?.startsWith('DATABASE_URL=')) {
  connectionString = connectionString.replace(/^DATABASE_URL=/, '');
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
