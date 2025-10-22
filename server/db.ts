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

// 🔍 Detect which database is connected
const dbHost = connectionString.split("@")[1]?.split("/")[0] || "unknown";
const isProductionDB = dbHost.includes("ep-green-term-af4ptxe0");
const isDevelopmentDB = dbHost.includes("ep-odd-scene-af56kk3x");

if (isProductionDB) {
  console.log("✅ Connected to Production Neon DB");
  console.log(`📍 Database: ${dbHost}`);
} else if (isDevelopmentDB) {
  console.log("✅ Connected to Development Neon DB");
  console.log(`📍 Database: ${dbHost}`);
} else {
  console.log("✅ Connected to database:", dbHost);
}
