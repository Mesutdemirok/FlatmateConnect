-- ============================================
-- DATABASE SAFETY VERIFICATION QUERIES
-- Run these BEFORE and AFTER deployment
-- ============================================

-- 1. Verify email_verified_at column exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'email_verified_at';
-- Expected: email_verified_at | timestamp without time zone | YES | NULL

-- 2. Count users with verified emails
SELECT 
    email_verified_at IS NOT NULL AS verified,
    COUNT(*) AS user_count
FROM users
GROUP BY verified
ORDER BY verified;
-- Before deploy: verified=false, count=19

-- 3. Check total user count (should not decrease)
SELECT 
    COUNT(*) AS total_users,
    COUNT(DISTINCT email) AS unique_emails
FROM users;
-- Expected: total_users >= 19

-- 4. Verify users table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
-- Should include: id, email, password, email_verified_at, firstName, lastName, etc.

-- 5. Check for any NULL emails (data integrity)
SELECT COUNT(*) AS null_emails
FROM users
WHERE email IS NULL;
-- Expected: 0

-- 6. Sample user data (verify no data loss)
SELECT 
    id,
    email,
    email_verified_at,
    first_name,
    last_name,
    created_at
FROM users
LIMIT 5;
-- Should show existing users intact

-- ============================================
-- POST-DEPLOYMENT VALIDATION
-- ============================================

-- 7. Test Google OAuth user creation
-- (Run this manually after a test Google sign-in)
SELECT 
    email,
    email_verified_at,
    profile_image_url,
    created_at
FROM users
WHERE email_verified_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
-- Should show new Google users with verified timestamps

-- 8. Check for any missing required columns
SELECT 
    COUNT(*) AS users_without_email
FROM users
WHERE email IS NULL OR email = '';
-- Expected: 0

-- 9. Verify OAuth flow data
SELECT 
    COUNT(*) AS google_users,
    COUNT(CASE WHEN email_verified_at IS NOT NULL THEN 1 END) AS verified_users,
    COUNT(CASE WHEN profile_image_url IS NOT NULL THEN 1 END) AS users_with_avatar
FROM users;
-- All Google users should have verified=true

-- ============================================
-- ROLLBACK VERIFICATION (if needed)
-- ============================================

-- 10. If rollback needed, verify column still exists
SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'email_verified_at'
) AS email_verified_at_exists;
-- Expected: true

-- ============================================
-- SAFETY CHECKS
-- ============================================

-- 11. No duplicate emails
SELECT 
    email,
    COUNT(*) AS count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
-- Expected: 0 rows (no duplicates)

-- 12. All users have valid IDs
SELECT COUNT(*) AS users_without_id
FROM users
WHERE id IS NULL OR id = '';
-- Expected: 0
