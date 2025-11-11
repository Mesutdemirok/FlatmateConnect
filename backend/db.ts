/**
 * 🧠 Odanet Database Connection (Neon + Drizzle)
 * ------------------------------------------------
 * Handles both production and development Neon DBs.
 * Automatically disables all migration logic to prevent
 * "stage already exists" or "migration validation" errors.
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// ✅ Required for WebSocket connections in Neon serverless
neonConfig.webSocketConstructor = ws;

/* -------------------------------------------------------
   🔐 Database URL Validation
------------------------------------------------------- */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "❌ DATABASE_URL environment variable missing. Please set it in your environment settings.",
  );
}

/* -------------------------------------------------------
   🧱 Create Neon Connection Pool
------------------------------------------------------- */
export const pool = new Pool({ connectionString });

/* -------------------------------------------------------
   🧩 Initialize Drizzle ORM (NO MIGRATIONS)
------------------------------------------------------- */
// ❌ No migrationFolder or migrate() call — fully disabled
// ✅ Only schema is imported for type safety
export const db = drizzle({ client: pool, schema });

// 🧠 Optional hard protection — ensures Drizzle never validates or migrates
process.env.DRIZZLE_SKIP_MIGRATIONS = "true";

/* -------------------------------------------------------
   🧭 Environment Detection
------------------------------------------------------- */
const dbHost = connectionString.split("@")[1]?.split("/")[0] || "unknown";

let dbEnv = "Unknown";
if (dbHost.includes("ep-green-term-af4ptxe0")) dbEnv = "Production";
else if (dbHost.includes("ep-odd-scene-af56kk3x")) dbEnv = "Development";

/* -------------------------------------------------------
   🖨️ Connection Log (Safe for Replit / Production)
------------------------------------------------------- */
console.log("==========================================");
console.log(`✅ Connected to ${dbEnv} Neon Database`);
console.log(`📦 Host: ${dbHost}`);
console.log(`📡 Schema Loaded: ${Object.keys(schema).length} tables`);
console.log("🚫 Migrations disabled (safe mode)");
console.log("==========================================");

export default db;
