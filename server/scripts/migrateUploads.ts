import fs from 'fs';
import path from 'path';

export async function run(): Promise<number> {
  let copiedCount = 0;
  
  // Ensure destination directories exist
  const destinations = [
    'shared/uploads/listings',
    'shared/uploads/seekers'
  ];
  
  for (const dir of destinations) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Source paths to check for files
  const sourcePaths = [
    { src: 'uploads/listings', dest: 'shared/uploads/listings' },
    { src: 'uploads/seekers', dest: 'shared/uploads/seekers' },
    { src: 'attached_assets/seed/listings', dest: 'shared/uploads/listings' },
    { src: 'attached_assets/seed/seekers', dest: 'shared/uploads/seekers' }
  ];
  
  for (const { src, dest } of sourcePaths) {
    if (!fs.existsSync(src)) {
      console.log(`Skipping ${src} (does not exist)`);
      continue;
    }
    
    const files = fs.readdirSync(src);
    
    for (const file of files) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      
      // Skip if it's a directory
      if (fs.statSync(srcPath).isDirectory()) {
        continue;
      }
      
      // Skip if destination file already exists
      if (fs.existsSync(destPath)) {
        console.log(`Skipping ${file} (already exists in ${dest})`);
        continue;
      }
      
      // Copy the file
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file} from ${src} to ${dest}`);
      copiedCount++;
    }
  }
  
  console.log(`Migration complete. Copied ${copiedCount} files.`);
  return copiedCount;
}

// Allow script to be run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  run().then(
    (count) => {
      console.log(`\n✅ Successfully migrated ${count} files`);
      process.exit(0);
    },
    (err) => {
      console.error(`\n❌ Migration failed:`, err);
      process.exit(1);
    }
  );
}
