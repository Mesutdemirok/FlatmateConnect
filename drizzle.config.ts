import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// ✅ Required for WebSocket-based Neon connections in serverless environments
neonConfig.webSocketConstructor = ws;

// ✅ Load and sanitize connection string
const rawUrl = process.env.DATABASE_URL?.trim();

if (!rawUrl) {
  throw new Error(
    "❌ DATABASE_URL is missing. Please set it in Replit Secrets.",
  );
}

// ✅ Always enforce SSL and clean query params
const connectionString = rawUrl.includes("sslmode=")
  ? rawUrl
  : `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}sslmode=require`;

// ✅ Create connection pool
export const pool = new Pool({
  connectionString,
  max: 5, // small pool size fits Neon’s connection limits
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// ✅ Initialize Drizzle ORM with schema
export const db = drizzle({
  client: pool,
  schema,
});

// ✅ Optional connection test (runs only once)
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to Neon (production) successfully");
    client.release();
  } catch (err: any) {
    console.error("❌ Database connection failed:", err.message);
  }
})();
