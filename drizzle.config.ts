import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// ✅ Required for WebSocket connections with Neon serverless
neonConfig.webSocketConstructor = ws;

// ✅ Always use DATABASE_URL directly
const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "❌ Missing DATABASE_URL. Please set it in Replit Environment → Secrets.",
  );
}

// ✅ Ensure Neon connection uses SSL (important for production)
const pool = new Pool({
  connectionString: connectionString.includes("?sslmode=")
    ? connectionString
    : `${connectionString}${connectionString.includes("?") ? "&" : "?"}sslmode=require`,
});

// ✅ Initialize Drizzle ORM with schema
export const db = drizzle({ client: pool, schema });

// ✅ (Optional) Log connection confirmation
pool
  .connect()
  .then(() => console.log("✅ Connected successfully to Neon database"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  });

export { pool };
