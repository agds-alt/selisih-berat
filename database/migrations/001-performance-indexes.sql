-- =====================================================
-- PERFORMANCE OPTIMIZATION: DATABASE INDEXES
-- =====================================================
-- Run this in Supabase SQL Editor
-- Expected improvement: 60-80% faster queries on large datasets
-- =====================================================

-- 1. ENTRIES TABLE INDEXES
-- =====================================================

-- Index for user_id (for filtering entries by user)
CREATE INDEX IF NOT EXISTS idx_entries_user_id
ON entries(user_id);

-- Index for created_at (for date range queries and sorting)
CREATE INDEX IF NOT EXISTS idx_entries_created_at
ON entries(created_at DESC);

-- Index for no_resi (for quick lookup by tracking number)
CREATE INDEX IF NOT EXISTS idx_entries_no_resi
ON entries(no_resi);

-- Composite index for user + date queries (common pattern)
CREATE INDEX IF NOT EXISTS idx_entries_user_created
ON entries(user_id, created_at DESC);

-- Index for location-based queries (if doing geographic filtering)
CREATE INDEX IF NOT EXISTS idx_entries_location
ON entries(latitude, longitude);

-- 2. USERS TABLE INDEXES
-- =====================================================

-- Index for username (for login queries)
CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

-- Index for role (for role-based filtering)
CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

-- 3. EARNINGS TABLE INDEXES (if exists)
-- =====================================================

-- Index for user_id (for calculating user earnings)
CREATE INDEX IF NOT EXISTS idx_earnings_user_id
ON earnings(user_id);

-- Index for entry_id (for joining with entries)
CREATE INDEX IF NOT EXISTS idx_earnings_entry_id
ON earnings(entry_id);

-- Index for created_at (for date-based earnings reports)
CREATE INDEX IF NOT EXISTS idx_earnings_created_at
ON earnings(created_at DESC);

-- Composite index for user + date earnings queries
CREATE INDEX IF NOT EXISTS idx_earnings_user_created
ON earnings(user_id, created_at DESC);

-- 4. PERFORMANCE STATISTICS
-- =====================================================

-- Create a view for quick stats lookup
CREATE OR REPLACE VIEW stats_summary AS
SELECT
  COUNT(*) as total_entries,
  COUNT(DISTINCT user_id) as total_users,
  MAX(created_at) as latest_entry,
  MIN(created_at) as first_entry,
  AVG(berat_aktual) as avg_weight,
  SUM(selisih) as total_difference
FROM entries;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify indexes were created:
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Check query performance with EXPLAIN ANALYZE:
-- EXPLAIN ANALYZE SELECT * FROM entries WHERE user_id = 'some-uuid' ORDER BY created_at DESC LIMIT 20;

-- =====================================================
-- MAINTENANCE
-- =====================================================

-- Run VACUUM ANALYZE periodically to update statistics
-- (Supabase does this automatically, but you can trigger manually if needed)
-- VACUUM ANALYZE entries;
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE earnings;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

/*
-- To remove indexes if needed:
DROP INDEX IF EXISTS idx_entries_user_id;
DROP INDEX IF EXISTS idx_entries_created_at;
DROP INDEX IF EXISTS idx_entries_no_resi;
DROP INDEX IF EXISTS idx_entries_user_created;
DROP INDEX IF EXISTS idx_entries_location;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_earnings_user_id;
DROP INDEX IF EXISTS idx_earnings_entry_id;
DROP INDEX IF EXISTS idx_earnings_created_at;
DROP INDEX IF EXISTS idx_earnings_user_created;
DROP VIEW IF EXISTS stats_summary;
*/
