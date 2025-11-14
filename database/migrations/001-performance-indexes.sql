-- =====================================================
-- PERFORMANCE OPTIMIZATION: DATABASE INDEXES
-- =====================================================
-- Run this in Supabase SQL Editor
-- Expected improvement: 60-80% faster queries on large datasets
-- =====================================================

-- 1. ENTRIES TABLE INDEXES
-- =====================================================

-- Index for created_by (for filtering entries by user)
CREATE INDEX IF NOT EXISTS idx_entries_created_by
ON entries(created_by);

-- Index for created_at (for date range queries and sorting)
CREATE INDEX IF NOT EXISTS idx_entries_created_at
ON entries(created_at DESC);

-- Index for no_resi (for quick lookup by tracking number)
CREATE INDEX IF NOT EXISTS idx_entries_no_resi
ON entries(no_resi);

-- Composite index for user + date queries (common pattern)
CREATE INDEX IF NOT EXISTS idx_entries_user_created
ON entries(created_by, created_at DESC);

-- Index for status filtering (pending, approved, rejected)
CREATE INDEX IF NOT EXISTS idx_entries_status
ON entries(status);

-- 2. USERS TABLE INDEXES
-- =====================================================

-- Index for username (for login queries)
CREATE INDEX IF NOT EXISTS idx_users_username
ON users(username);

-- Index for role (for role-based filtering)
CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

-- 3. USER_STATISTICS TABLE INDEXES
-- =====================================================

-- Index for username lookup
CREATE INDEX IF NOT EXISTS idx_user_statistics_username
ON user_statistics(username);

-- Index for last_entry_date (for recent activity queries)
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_entry
ON user_statistics(last_entry_date DESC);

-- 4. PERFORMANCE STATISTICS
-- =====================================================

-- Create a view for quick stats lookup
CREATE OR REPLACE VIEW stats_summary AS
SELECT
  COUNT(*) as total_entries,
  COUNT(DISTINCT created_by) as total_users,
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
-- EXPLAIN ANALYZE SELECT * FROM entries WHERE created_by = 'username' ORDER BY created_at DESC LIMIT 20;

-- =====================================================
-- MAINTENANCE
-- =====================================================

-- Run VACUUM ANALYZE periodically to update statistics
-- (Supabase does this automatically, but you can trigger manually if needed)
-- VACUUM ANALYZE entries;
-- VACUUM ANALYZE users;
-- VACUUM ANALYZE user_statistics;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

/*
-- To remove indexes if needed:
DROP INDEX IF EXISTS idx_entries_created_by;
DROP INDEX IF EXISTS idx_entries_created_at;
DROP INDEX IF EXISTS idx_entries_no_resi;
DROP INDEX IF EXISTS idx_entries_user_created;
DROP INDEX IF EXISTS idx_entries_status;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_user_statistics_username;
DROP INDEX IF EXISTS idx_user_statistics_last_entry;
DROP VIEW IF EXISTS stats_summary;
*/
