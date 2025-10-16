import { db } from "../db";
import { listingImages, seekerPhotos } from "@shared/schema";
import { uploadToR2 } from "../r2-utils";
import fs from "fs";
import path from "path";

/**
 * Migration script to upload all existing local images to Cloudflare R2
 */
async function migrateImagesToR2() {
  console.log("🚀 Starting image migration to Cloudflare R2...\n");

  // Migrate listing images
  console.log("📸 Migrating listing images...");
  const listingImagesData = await db.select().from(listingImages);
  
  let listingSuccess = 0;
  let listingSkipped = 0;
  let listingFailed = 0;

  for (const image of listingImagesData) {
    const localPath = path.join(process.cwd(), image.imagePath.replace(/^\/+/, ""));
    
    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  Local file not found: ${image.imagePath}`);
      listingSkipped++;
      continue;
    }

    try {
      // Upload to R2 using the same path structure
      const r2Key = image.imagePath.replace(/^\/+/, "");
      await uploadToR2(localPath, r2Key);
      console.log(`  ✅ Uploaded: ${r2Key}`);
      listingSuccess++;
    } catch (error) {
      console.error(`  ❌ Failed to upload ${image.imagePath}:`, error);
      listingFailed++;
    }
  }

  console.log(`\n📊 Listing Images Summary:`);
  console.log(`  ✅ Success: ${listingSuccess}`);
  console.log(`  ⚠️  Skipped: ${listingSkipped}`);
  console.log(`  ❌ Failed: ${listingFailed}`);

  // Migrate seeker photos
  console.log("\n👤 Migrating seeker photos...");
  const seekerPhotosData = await db.select().from(seekerPhotos);
  
  let seekerSuccess = 0;
  let seekerSkipped = 0;
  let seekerFailed = 0;

  for (const photo of seekerPhotosData) {
    // Skip if photoPath is null or undefined
    if (!photo.photoPath) {
      console.log(`  ⚠️  Photo path is null or undefined for photo ID: ${photo.id}`);
      seekerSkipped++;
      continue;
    }

    const localPath = path.join(process.cwd(), photo.photoPath.replace(/^\/+/, ""));
    
    if (!fs.existsSync(localPath)) {
      console.log(`  ⚠️  Local file not found: ${photo.photoPath}`);
      seekerSkipped++;
      continue;
    }

    try {
      // Upload to R2 using the same path structure
      const r2Key = photo.photoPath.replace(/^\/+/, "");
      await uploadToR2(localPath, r2Key);
      console.log(`  ✅ Uploaded: ${r2Key}`);
      seekerSuccess++;
    } catch (error) {
      console.error(`  ❌ Failed to upload ${photo.photoPath}:`, error);
      seekerFailed++;
    }
  }

  console.log(`\n📊 Seeker Photos Summary:`);
  console.log(`  ✅ Success: ${seekerSuccess}`);
  console.log(`  ⚠️  Skipped: ${seekerSkipped}`);
  console.log(`  ❌ Failed: ${seekerFailed}`);

  console.log(`\n✨ Migration complete!`);
  console.log(`\n📝 Total uploaded: ${listingSuccess + seekerSuccess} files`);
  
  process.exit(0);
}

// Run migration
migrateImagesToR2().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
