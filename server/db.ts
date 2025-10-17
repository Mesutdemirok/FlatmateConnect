import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Construct DATABASE_URL from individual PG* env vars if needed
let connectionString = process.env.DATABASE_URL;

// Sanitize DATABASE_URL - remove duplicate prefix if present
if (connectionString?.startsWith('DATABASE_URL=')) {
  connectionString = connectionString.replace(/^DATABASE_URL=/, '');
}

// Check if DATABASE_URL has placeholder text
if (!connectionString || connectionString.includes('PGUSER') || connectionString.includes('PGHOST')) {
  const { PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE } = process.env;
  if (!PGUSER || !PGPASSWORD || !PGHOST || !PGPORT || !PGDATABASE) {
    throw new Error("Database connection not configured. Missing PG* environment variables.");
  }
  connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
}

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
