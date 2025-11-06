import { db } from '../db';
import { users, listings, listingImages, seekerProfiles, seekerPhotos, favorites, messages } from '../../shared/schema';
import { eq, sql, inArray } from 'drizzle-orm';

const WHITELIST_DOMAINS = ['@odanet.com.tr'];
const WHITELIST_EMAILS = ['admin@odanet.com.tr'];

async function dryRun() {
  console.log('\n=== DRY RUN: Identifying data to delete ===\n');
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  // Determine which users to keep
  const keepUserIds = new Set<string>();
  const deleteUserIds = new Set<string>();
  
  allUsers.forEach(user => {
    const isWhitelisted = WHITELIST_EMAILS.includes(user.email) || 
                          WHITELIST_DOMAINS.some(domain => user.email.endsWith(domain));
    
    if (isWhitelisted) {
      keepUserIds.add(user.id);
      console.log(`✅ KEEP: ${user.email} (whitelisted)`);
    } else {
      deleteUserIds.add(user.id);
    }
  });
  
  console.log(`\nUsers to KEEP: ${keepUserIds.size}`);
  console.log(`Users to DELETE content from: ${deleteUserIds.size}\n`);
  
  if (deleteUserIds.size === 0) {
    console.log('No content to delete. All users are whitelisted.');
    process.exit(0);
  }
  
  // Get listings to delete
  const listingsToDelete = await db.select().from(listings)
    .where(inArray(listings.userId, Array.from(deleteUserIds)));
    
  const seekersToDelete = await db.select().from(seekerProfiles)
    .where(inArray(seekerProfiles.userId, Array.from(deleteUserIds)));
  
  console.log('\n=== LISTINGS TO DELETE ===');
  console.log(`Total: ${listingsToDelete.length}\n`);
  
  for (const listing of listingsToDelete) {
    const owner = allUsers.find(u => u.id === listing.userId);
    const images = await db.select().from(listingImages)
      .where(eq(listingImages.listingId, listing.id));
    
    console.log(`- ID: ${listing.id}`);
    console.log(`  Title: ${listing.title}`);
    console.log(`  Owner: ${owner?.email}`);
    console.log(`  Created: ${listing.createdAt}`);
    console.log(`  Images: ${images.length} files`);
    images.forEach(img => console.log(`    → ${img.imagePath}`));
    console.log('');
  }
  
  console.log('\n=== SEEKER PROFILES TO DELETE ===');
  console.log(`Total: ${seekersToDelete.length}\n`);
  
  for (const seeker of seekersToDelete) {
    const owner = allUsers.find(u => u.id === seeker.userId);
    const photos = await db.select().from(seekerPhotos)
      .where(eq(seekerPhotos.seekerId, seeker.id));
    
    console.log(`- ID: ${seeker.id}`);
    console.log(`  Name: ${seeker.fullName}`);
    console.log(`  Owner: ${owner?.email}`);
    console.log(`  Created: ${seeker.createdAt}`);
    console.log(`  Photos: ${photos.length} files`);
    if (seeker.profilePhotoUrl) console.log(`    → ${seeker.profilePhotoUrl}`);
    photos.forEach(p => console.log(`    → ${p.imagePath}`));
    console.log('');
  }
  
  // Count related data
  const listingIds = listingsToDelete.map(l => l.id);
  const seekerIds = seekersToDelete.map(s => s.id);
  
  let favoritesCount = 0;
  if (listingIds.length > 0) {
    const favs = await db.select().from(favorites)
      .where(inArray(favorites.listingId, listingIds));
    favoritesCount = favs.length;
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Listings to delete: ${listingsToDelete.length}`);
  console.log(`Seeker profiles to delete: ${seekersToDelete.length}`);
  console.log(`Favorites to delete: ${favoritesCount}`);
  console.log(`Users with content kept: ${keepUserIds.size}`);
  console.log(`Users with content deleted: ${deleteUserIds.size}\n`);
  
  console.log('Run `npm run cleanup:run` to execute the cleanup.\n');
  
  process.exit(0);
}

dryRun().catch(console.error);
