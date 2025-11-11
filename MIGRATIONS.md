# Safe Migration Policy

## Overview
This document establishes the safe migration policy for Odanet to prevent destructive schema changes that could break production data.

## Core Principles

### 1. **NO Destructive Migrations Without Approval**
❌ **FORBIDDEN** without explicit review:
- `DROP COLUMN`
- `DROP TABLE`
- `ALTER COLUMN ... DROP DEFAULT`
- `ALTER COLUMN ... TYPE` (changing data types)
- `TRUNCATE`

### 2. **Preview-First Deployment**
All schema changes must:
1. Be tested in a preview/staging environment first
2. Pass automated migration checks in CI
3. Be reviewed by a team member before merging

### 3. **Two-Step Deprecation**
To remove a column or table:

**Step 1: Deprecate (Release N)**
- Mark column as deprecated in code comments
- Add new column/table with desired schema
- Deploy code that writes to BOTH old and new locations
- Monitor usage to confirm zero active reads from old column

**Step 2: Cleanup (Release N+1)**
- After 1-2 weeks of monitoring confirms no usage
- Remove application code using old column
- Create migration to drop old column
- Deploy with formal review

## Migration Workflow

### Current Setup
- **ORM**: Drizzle ORM
- **Schema**: `shared/schema.ts`
- **Config**: `drizzle.config.ts`

### ✅ Safe Workflow

```bash
# 1. Make schema changes in shared/schema.ts
# 2. Generate migration (NOT push directly)
npm run db:generate

# 3. Review the generated SQL in migrations/
# Check for any DROP, ALTER, or destructive statements

# 4. Test in preview environment
# (Replit automatically provisions preview DB)

# 5. If safe, push to production
npm run db:push
```

### ❌ Unsafe Practices
```bash
# DON'T use --force without review
npm run db:push --force

# DON'T manually edit production database
psql $DATABASE_URL -c "ALTER TABLE ..."

# DON'T use drizzle-kit push in production
drizzle-kit push
```

## Required Columns

### Listings Table
**Mandatory fields for all new listings:**
- `title` (varchar, not null)
- `address` (text, not null)
- `rentAmount` (decimal, not null)
- `userId` (varchar, not null, FK to users)

**Strongly recommended (should not be nullable):**
- `description` (text) - User should provide listing details
- `deposit` (decimal) - Security deposit amount
- `moveInDate` (date) - When room is available
- `minStayMonths` (integer) - Minimum commitment
- `city`, `district`, `neighborhood` - For search/filtering
- `latitude`, `longitude` - For map display

### Seeker Profiles Table
**Mandatory fields:**
- `userId` (varchar, not null, FK to users)
- `moveInDate` (date, not null)
- `budget` (decimal, not null)
- `location` (varchar, not null)

## CI/CD Integration

### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
npm run migrations:check
```

### Migration Check Script
Create `scripts/check-migrations.js`:
```javascript
// Scan migration files for destructive SQL
// Fail if DROP/ALTER DROP found without --allow-destructive flag
```

### GitHub Actions / CI
```yaml
- name: Check Migrations
  run: |
    npm run db:generate
    npm run migrations:check
    # Fail if destructive changes detected
```

## Recovery Plan

If a destructive migration is accidentally deployed:

### 1. **Immediate Rollback**
```bash
# Stop deployments
# Restore from latest backup
pg_restore -d $DATABASE_URL backup.sql
```

### 2. **Use Replit Checkpoint Rollback**
- Replit maintains automatic checkpoints
- Can restore code + database to previous state
- Use when migration happened <24 hours ago

### 3. **Manual Recovery**
```sql
-- Re-add dropped column with default values
ALTER TABLE listings ADD COLUMN description TEXT;

-- Restore data from backup if available
```

## Examples

### ✅ Safe: Adding a New Column
```typescript
// shared/schema.ts
export const listings = pgTable("listings", {
  // ... existing columns ...
  tags: text("tags").array(), // New optional column
});
```

```bash
npm run db:generate  # Creates additive migration
npm run db:push      # Safe to deploy
```

### ❌ Unsafe: Removing a Column (Wrong Way)
```typescript
// DON'T just delete from schema!
export const listings = pgTable("listings", {
  // images: text("images").array(), // ❌ Removed - will DROP COLUMN!
});
```

### ✅ Safe: Removing a Column (Right Way)

**Step 1 (Week 1):**
```typescript
// shared/schema.ts - Add @deprecated comment
export const listings = pgTable("listings", {
  /** @deprecated Use listingImages relation instead. Remove in v2.0 */
  images: text("images").array(),
  // ... rest of schema
});

// Update all code to use listingImages instead
// Deploy and monitor for 1-2 weeks
```

**Step 2 (Week 3):**
```typescript
// After confirming zero usage:
// 1. Remove from schema
// 2. Generate migration
// 3. Review DROP COLUMN SQL
// 4. Get team approval
// 5. Deploy with monitoring
```

## Monitoring

### Post-Deployment Checks
After any schema change:
1. Verify application starts successfully
2. Check logs for database errors
3. Test create/read operations
4. Monitor error rates for 24 hours

### Rollback Triggers
Immediately rollback if:
- Application fails to start
- Database connection errors
- Data loss detected
- Error rate spike >5%

## References
- [Drizzle ORM Migrations](https://orm.drizzle.team/docs/migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Zero-Downtime Migrations](https://www.braintreepayments.com/blog/safe-operations-for-high-volume-postgresql/)

---

**Last Updated**: November 11, 2025  
**Policy Owner**: Engineering Team  
**Review Frequency**: Quarterly
