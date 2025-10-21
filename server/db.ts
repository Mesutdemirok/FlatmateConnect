import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Required for WebSocket connections in Neon serverless
neonConfig.webSocketConstructor = ws;

// ✅ Always use DATABASE_URL directly
// (Avoids confusion when PG* vars are injected by Replit or during build)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "❌ Missing DATABASE_URL environment variable. Please set it in your environment settings.",
  );
}

// ✅ Create connection pool and Drizzle client
export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

// Optional (debugging)
// console.log("✅ Connected to database:", connectionString.split("@")[1]);
