# Production Migration Guide - Earnings System

## 🔒 Pre-Migration Checklist

- [ ] Database backup created
- [ ] Migration tested in dev/staging (if available)
- [ ] Running during low-traffic hours
- [ ] Team notified about maintenance

## 📋 Step-by-Step Instructions

### Step 1: Create Backup (CRITICAL!)

Run this in Supabase SQL Editor:

```sql
-- Backup user_statistics (your most important table)
CREATE TABLE user_statistics_backup_20250114 AS
SELECT * FROM user_statistics;

-- Verify backup
SELECT COUNT(*) FROM user_statistics_backup_20250114;
-- Should match: SELECT COUNT(*) FROM user_statistics;
```

### Step 2: Run Migration

Copy and paste the **entire** `003_create_settings_table_SAFE.sql` file into Supabase SQL Editor and execute.

**Expected output:**
```
NOTICE: Column daily_earnings added to user_statistics
NOTICE: Column total_earnings added to user_statistics
NOTICE: Column days_with_entries added to user_statistics
NOTICE: ✅ Settings table created with 3 records
NOTICE: ✅ All new columns added successfully to user_statistics
NOTICE: ✅ MIGRATION COMPLETED SUCCESSFULLY
```

### Step 3: Calculate Initial Earnings

Run this to populate earnings for all existing users:

```sql
SELECT update_user_statistics_earnings();
```

**Expected output:**
```
NOTICE: Starting earnings calculation for all users...
NOTICE: Earnings calculation completed for X users
```

### Step 4: Verify Results

```sql
-- Check settings table
SELECT * FROM settings;

-- Check top earners
SELECT
  username,
  total_entries,
  days_with_entries,
  total_earnings
FROM user_statistics
WHERE total_earnings > 0
ORDER BY total_earnings DESC
LIMIT 10;

-- Verify calculation for one user
SELECT * FROM calculate_user_earnings('your_username_here');
```

### Step 5: Deploy Frontend

Your frontend code is already pushed to the branch. Just merge and deploy.

## ✅ Success Criteria

- [ ] Settings table has 3 records
- [ ] user_statistics has new columns (daily_earnings, total_earnings, days_with_entries)
- [ ] All users have calculated earnings
- [ ] Frontend Settings page loads without errors
- [ ] Dashboard shows earnings card
- [ ] No errors in application logs

## 🚨 Rollback (If Needed)

If anything goes wrong, run the rollback script: `ROLLBACK_003.sql`

## 📊 Expected Data

With default settings:
- Rate per entry: Rp. 500
- Daily bonus: Rp. 50.000

Example calculation:
- User with 100 entries made over 5 days:
  - Entries earnings: 100 × 500 = Rp. 50.000
  - Bonus earnings: 5 × 50.000 = Rp. 250.000
  - **Total: Rp. 300.000**

## 🆘 Troubleshooting

### Error: "relation settings already exists"
✅ Safe to ignore - migration is idempotent

### Error: "column already exists"
✅ Safe to ignore - migration checks before adding

### Earnings showing 0 for all users
❌ Run: `SELECT update_user_statistics_earnings();`

### Functions not found
❌ Re-run migration script

## 📞 Support

If you encounter any issues:
1. Check the error message
2. Run verification queries
3. Check rollback options
4. Create GitHub issue if needed

## ⏱️ Migration Time

Expected duration:
- Backup: ~10 seconds
- Migration: ~30 seconds
- Calculation: ~1-2 minutes (for 25K+ entries)
- **Total: ~3-5 minutes**
