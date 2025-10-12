import { db } from '../db';
import { users, listings, listingImages, seekerProfiles, seekerPhotos, favorites, conversations, messages } from '../../shared/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const WHITELIST_DOMAINS = ['@odanet.com.tr'];
const WHITELIST_EMAILS = ['admin@odanet.com.tr'];

async function executeCleanup() {
  console.log('\n=== EXECUTING CLEANUP ===\n');
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  // Determine which users to delete content from
  const deleteUserIds = new Set<string>();
  
  allUsers.forEach(user => {
    const isWhitelisted = WHITELIST_EMAILS.includes(user.email) || 
                          WHITELIST_DOMAINS.some(domain => user.email.endsWith(domain));
    
    if (!isWhitelisted) {
      deleteUserIds.add(user.id);
      console.log(`🗑️  Deleting content from: ${user.email}`);
    }
  });
  
  if (deleteUserIds.size === 0) {
    console.log('✅ No content to delete. All users are whitelisted.');
    process.exit(0);
  }
  
  const deleteUserIdsArray = Array.from(deleteUserIds);
  
  // Get items to delete
  const listingsToDelete = await db.select().from(listings)
    .where(inArray(listings.userId, deleteUserIdsArray));
    
  const seekersToDelete = await db.select().from(seekerProfiles)
    .where(inArray(seekerProfiles.userId, deleteUserIdsArray));
  
  const listingIds = listingsToDelete.map(l => l.id);
  const seekerIds = seekersToDelete.map(s => s.id);
  
  console.log(`\nFound ${listingsToDelete.length} listings to delete`);
  console.log(`Found ${seekersToDelete.length} seeker profiles to delete\n`);
  
  const deletedFiles: string[] = [];
  const stats = {
    favorites: 0,
    messages: 0,
    listingImages: 0,
    seekerPhotos: 0,
    listings: 0,
    seekers: 0,
    files: 0
  };
  
  // 1. Delete favorites referencing these listings
  if (listingIds.length > 0) {
    const result = await db.delete(favorites)
      .where(inArray(favorites.listingId, listingIds));
    stats.favorites = result.rowCount || 0;
    console.log(`✅ Deleted ${stats.favorites} favorites`);
  }
  
  // 2. Delete messages/conversations (if applicable)
  // Note: Assuming conversations might reference users or listings
  // Add message deletion logic if needed
  
  // 3. Delete listing images and their files
  if (listingIds.length > 0) {
    const images = await db.select().from(listingImages)
      .where(inArray(listingImages.listingId, listingIds));
    
    for (const img of images) {
      // imagePath might start with '/uploads/' or 'uploads/', normalize it
      const normalizedPath = img.imagePath.startsWith('/') ? img.imagePath.slice(1) : img.imagePath;
      const filePath = path.join(process.cwd(), normalizedPath);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(img.imagePath);
          stats.files++;
          console.log(`   🗑️  Deleted: ${img.imagePath}`);
        } else {
          console.log(`   ⚠️  File not found: ${filePath}`);
        }
      } catch (err) {
        console.warn(`   ❌ Could not delete file: ${filePath} - ${err}`);
      }
    }
    
    const result = await db.delete(listingImages)
      .where(inArray(listingImages.listingId, listingIds));
    stats.listingImages = result.rowCount || 0;
    console.log(`✅ Deleted ${stats.listingImages} listing images`);
  }
  
  // 4. Delete seeker photos and their files
  if (seekerIds.length > 0) {
    const photos = await db.select().from(seekerPhotos)
      .where(inArray(seekerPhotos.seekerId, seekerIds));
    
    for (const photo of photos) {
      // Construct proper path - photo.imagePath might be relative or absolute
      const normalizedPath = photo.imagePath.startsWith('/') ? photo.imagePath.slice(1) : photo.imagePath;
      const filePath = path.join(process.cwd(), normalizedPath);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedFiles.push(photo.imagePath);
          stats.files++;
          console.log(`   🗑️  Deleted: ${photo.imagePath}`);
        } else {
          console.log(`   ⚠️  File not found: ${filePath}`);
        }
      } catch (err) {
        console.warn(`   ❌ Could not delete file: ${filePath} - ${err}`);
      }
    }
    
    const result = await db.delete(seekerPhotos)
      .where(inArray(seekerPhotos.seekerId, seekerIds));
    stats.seekerPhotos = result.rowCount || 0;
    console.log(`✅ Deleted ${stats.seekerPhotos} seeker photos`);
  }
  
  // 5. Delete listings
  if (listingIds.length > 0) {
    const result = await db.delete(listings)
      .where(inArray(listings.id, listingIds));
    stats.listings = result.rowCount || 0;
    console.log(`✅ Deleted ${stats.listings} listings`);
  }
  
  // 6. Delete seeker profiles
  if (seekerIds.length > 0) {
    const result = await db.delete(seekerProfiles)
      .where(inArray(seekerProfiles.id, seekerIds));
    stats.seekers = result.rowCount || 0;
    console.log(`✅ Deleted ${stats.seekers} seeker profiles`);
  }
  
  // Summary
  console.log('\n=== CLEANUP SUMMARY ===');
  console.log(`Favorites removed: ${stats.favorites}`);
  console.log(`Listing images removed: ${stats.listingImages}`);
  console.log(`Seeker photos removed: ${stats.seekerPhotos}`);
  console.log(`Listings removed: ${stats.listings}`);
  console.log(`Seeker profiles removed: ${stats.seekers}`);
  console.log(`Files deleted from /uploads: ${stats.files}`);
  
  if (deletedFiles.length > 0) {
    console.log('\nDeleted files:');
    deletedFiles.forEach(f => console.log(`  - ${f}`));
  }
  
  console.log('\n✅ Cleanup complete!\n');
  console.log('💾 Backup location: server/backups/backup-*.sql\n');
  
  process.exit(0);
}

executeCleanup().catch(console.error);
