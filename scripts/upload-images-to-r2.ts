import { uploadToR2 } from "../server/r2-utils";
import fs from "fs";
import path from "path";

/**
 * Upload all local images to Cloudflare R2
 * This script scans the uploads directory and uploads all images to R2
 */
async function uploadAllImages() {
  const uploadsDir = "uploads";
  
  if (!fs.existsSync(uploadsDir)) {
    console.log("❌ No uploads directory found");
    return;
  }

  console.log("🔍 Scanning for images...\n");
  
  const imagesToUpload: string[] = [];
  
  // Recursively find all image files
  function scanDirectory(dir: string) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (/\.(jpg|jpeg|png|webp|avif)$/i.test(item)) {
        imagesToUpload.push(fullPath);
      }
    }
  }
  
  scanDirectory(uploadsDir);
  
  console.log(`📸 Found ${imagesToUpload.length} images to upload\n`);
  
  if (imagesToUpload.length === 0) {
    console.log("✅ No images to upload");
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const imagePath of imagesToUpload) {
    try {
      const r2Url = await uploadToR2(imagePath);
      console.log(`✅ Uploaded: ${imagePath} → ${r2Url}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${imagePath}`, error);
      failCount++;
    }
  }
  
  console.log(`\n📊 Upload Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📦 Total: ${imagesToUpload.length}`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Images are now available on R2!`);
    console.log(`   Base URL: ${process.env.R2_PUBLIC_URL}`);
  }
}

uploadAllImages().catch(console.error);
