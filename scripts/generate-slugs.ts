import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { makeSlug } from "../shared/slug";

// Required for WebSocket connections in Neon serverless
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ Missing DATABASE_URL environment variable");
}

const pool = new Pool({ connectionString });

async function generateSlugsForListings() {
  console.log("\n🔧 Generating slugs for listings...");
  
  const client = await pool.connect();
  
  try {
    // Get all listings without slugs
    const result = await client.query(
      "SELECT id, title, address FROM listings WHERE slug IS NULL"
    );
    
    console.log(`📊 Found ${result.rows.length} listings without slugs`);
    
    for (const listing of result.rows) {
      const slug = makeSlug([listing.title, listing.address]);
      
      await client.query(
        "UPDATE listings SET slug = $1 WHERE id = $2",
        [slug, listing.id]
      );
      
      console.log(`✅ ${listing.title} → ${slug}`);
    }
    
    console.log(`\n✨ Updated ${result.rows.length} listings with slugs`);
  } finally {
    client.release();
  }
}

async function generateSlugsForSeekers() {
  console.log("\n🔧 Generating slugs for seeker profiles...");
  
  const client = await pool.connect();
  
  try {
    // Get all seeker profiles without slugs
    const result = await client.query(
      "SELECT id, full_name, preferred_location FROM seeker_profiles WHERE slug IS NULL"
    );
    
    console.log(`📊 Found ${result.rows.length} seeker profiles without slugs`);
    
    for (const seeker of result.rows) {
      const slug = makeSlug([seeker.full_name, seeker.preferred_location || "istanbul"]);
      
      await client.query(
        "UPDATE seeker_profiles SET slug = $1 WHERE id = $2",
        [slug, seeker.id]
      );
      
      console.log(`✅ ${seeker.full_name} → ${slug}`);
    }
    
    console.log(`\n✨ Updated ${result.rows.length} seeker profiles with slugs`);
  } finally {
    client.release();
  }
}

async function main() {
  console.log("🚀 Starting slug generation for Production database...");
  console.log(`📍 Database: ${connectionString.split("@")[1]?.split("/")[0]}\n`);
  
  try {
    await generateSlugsForListings();
    await generateSlugsForSeekers();
    
    console.log("\n🎉 All slugs generated successfully!");
  } catch (error) {
    console.error("❌ Error generating slugs:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
