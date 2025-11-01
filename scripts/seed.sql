-- Odanet Seed Dataset
-- Creates test users, listings, seeker profiles, and messages for development and testing
-- Run with: psql "$DATABASE_URL" -f scripts/seed.sql

-- Note: This script is idempotent - safe to run multiple times
-- Uses ON CONFLICT DO NOTHING to avoid duplicate errors

BEGIN;

-- ===== USERS =====
-- Create three test users: admin, lister (room provider), and seeker (looking for a room)

-- Admin user
INSERT INTO users (email, email_verified_at, first_name, last_name, profile_image_url, verification_status, created_at, updated_at)
VALUES (
  'admin@odanet.com.tr',
  NOW(),
  'Admin',
  'User',
  '/seed/admin-avatar.jpg',
  'verified',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  email_verified_at = EXCLUDED.email_verified_at,
  profile_image_url = EXCLUDED.profile_image_url;

-- Lister user (posts room listings)
INSERT INTO users (email, email_verified_at, first_name, last_name, profile_image_url, gender, occupation, phone, verification_status, created_at, updated_at)
VALUES (
  'lister@odanet.com.tr',
  NOW(),
  'Ayşe',
  'Yılmaz',
  '/seed/lister-avatar.jpg',
  'Kadın',
  'Öğretmen',
  '+90 555 123 4567',
  'verified',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  email_verified_at = EXCLUDED.email_verified_at,
  profile_image_url = EXCLUDED.profile_image_url;

-- Seeker user (looking for a room)
INSERT INTO users (email, email_verified_at, first_name, last_name, profile_image_url, gender, occupation, phone, verification_status, created_at, updated_at)
VALUES (
  'seeker@odanet.com.tr',
  NOW(),
  'Mehmet',
  'Demir',
  '/seed/seeker-avatar.jpg',
  'Erkek',
  'Öğrenci',
  '+90 555 987 6543',
  'verified',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  email_verified_at = EXCLUDED.email_verified_at,
  profile_image_url = EXCLUDED.profile_image_url;

-- ===== ROOM LISTINGS =====
-- Create a sample room listing in Kadıköy by the lister user

INSERT INTO listings (
  user_id,
  slug,
  address,
  title,
  rent_amount,
  bills_included,
  excluded_bills,
  property_type,
  internet_included,
  total_rooms,
  bathroom_type,
  furnishing_status,
  amenities,
  total_occupants,
  roommate_preference,
  smoking_policy,
  status,
  created_at,
  updated_at
)
SELECT
  u.id,
  'genis-oda-kadikoy-merkez',
  'Kadıköy, Osmanağa Mahallesi, İstanbul',
  'Geniş Oda – Kadıköy Merkez',
  18000.00,
  true,
  ARRAY[]::text[],
  'Apartman',
  true,
  3,
  'Ortak',
  'Eşyalı',
  ARRAY['Yatak', 'Dolap', 'Masa', 'Sandalye', 'Klima']::text[],
  2,
  'Farketmez',
  'Balkon Dahil İçilemez',
  'active',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'lister@odanet.com.tr'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  rent_amount = EXCLUDED.rent_amount,
  updated_at = NOW();

-- Add images for the Kadıköy listing
INSERT INTO listing_images (listing_id, image_path, is_primary, created_at)
SELECT
  l.id,
  '/seed/kadikoy1.jpg',
  true,
  NOW()
FROM listings l WHERE l.slug = 'genis-oda-kadikoy-merkez'
ON CONFLICT DO NOTHING;

INSERT INTO listing_images (listing_id, image_path, is_primary, created_at)
SELECT
  l.id,
  '/seed/kadikoy2.jpg',
  false,
  NOW()
FROM listings l WHERE l.slug = 'genis-oda-kadikoy-merkez'
ON CONFLICT DO NOTHING;

-- ===== SEEKER PROFILES =====
-- Create a seeker profile for the seeker user

INSERT INTO seeker_profiles (
  user_id,
  slug,
  profile_photo_url,
  full_name,
  age,
  gender,
  occupation,
  budget_monthly,
  about,
  preferred_location,
  smoking_preference,
  pet_preference,
  cleanliness_level,
  is_active,
  is_published,
  created_at,
  updated_at
)
SELECT
  u.id,
  'mehmet-demir-oda-ariyor',
  '/seed/seeker-avatar.jpg',
  'Mehmet Demir',
  24,
  'Erkek',
  'Öğrenci',
  '15000',
  'Boğaziçi Üniversitesi''nde bilgisayar mühendisliği okuyorum. Temiz ve sessiz bir ev arıyorum. Sigara kullanmıyorum.',
  'İstanbul Anadolu Yakası (Kadıköy, Moda, Üsküdar)',
  'non-smoker',
  'no-pets',
  'very-clean',
  true,
  true,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'seeker@odanet.com.tr'
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  about = EXCLUDED.about,
  updated_at = NOW();

-- ===== MESSAGES =====
-- Create a conversation between lister and seeker about the Kadıköy listing

-- Message 1: Seeker contacts lister
INSERT INTO messages (sender_id, receiver_id, listing_id, message, is_read, created_at)
SELECT
  seeker.id,
  lister.id,
  l.id,
  'Merhaba, ilanınızla ilgileniyorum. Müsaitse görüşebilir miyiz?',
  true,
  NOW() - INTERVAL '2 days'
FROM 
  users seeker,
  users lister,
  listings l
WHERE 
  seeker.email = 'seeker@odanet.com.tr'
  AND lister.email = 'lister@odanet.com.tr'
  AND l.slug = 'genis-oda-kadikoy-merkez'
ON CONFLICT DO NOTHING;

-- Message 2: Lister responds
INSERT INTO messages (sender_id, receiver_id, listing_id, message, is_read, created_at)
SELECT
  lister.id,
  seeker.id,
  l.id,
  'Merhaba! Pazartesi 18:00 uygun. Detayları mesajdan paylaşırım. Oda şu anda boş ve hemen taşınabilirsiniz.',
  true,
  NOW() - INTERVAL '1 day'
FROM 
  users seeker,
  users lister,
  listings l
WHERE 
  seeker.email = 'seeker@odanet.com.tr'
  AND lister.email = 'lister@odanet.com.tr'
  AND l.slug = 'genis-oda-kadikoy-merkez'
ON CONFLICT DO NOTHING;

-- Message 3: Seeker follows up
INSERT INTO messages (sender_id, receiver_id, listing_id, message, is_read, created_at)
SELECT
  seeker.id,
  lister.id,
  l.id,
  'Harika! Pazartesi 18:00 uygun. Adres bilgisini paylaşabilir misiniz?',
  false,
  NOW() - INTERVAL '12 hours'
FROM 
  users seeker,
  users lister,
  listings l
WHERE 
  seeker.email = 'seeker@odanet.com.tr'
  AND lister.email = 'lister@odanet.com.tr'
  AND l.slug = 'genis-oda-kadikoy-merkez'
ON CONFLICT DO NOTHING;

COMMIT;

-- Display summary
DO $$
DECLARE
  user_count INT;
  listing_count INT;
  seeker_count INT;
  message_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users WHERE email LIKE '%@odanet.com.tr';
  SELECT COUNT(*) INTO listing_count FROM listings WHERE slug = 'genis-oda-kadikoy-merkez';
  SELECT COUNT(*) INTO seeker_count FROM seeker_profiles WHERE slug = 'mehmet-demir-oda-ariyor';
  SELECT COUNT(*) INTO message_count FROM messages m
    JOIN users seeker ON m.sender_id = seeker.id OR m.receiver_id = seeker.id
    WHERE seeker.email = 'seeker@odanet.com.tr';
  
  RAISE NOTICE '✓ Seed completed successfully!';
  RAISE NOTICE '  - Users: %', user_count;
  RAISE NOTICE '  - Listings: %', listing_count;
  RAISE NOTICE '  - Seeker Profiles: %', seeker_count;
  RAISE NOTICE '  - Messages: %', message_count;
END $$;
