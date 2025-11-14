-- =====================================================
-- PERFORMANCE OPTIMIZATION: DATABASE INDEXES
-- =====================================================
-- Run this in Supabase SQL Editor
-- Expected improvement: 60-80% faster queries on large datasets
-- =====================================================

-- 1. ENTRIES TABLE INDEXES

CREATE INDEX IF NOT EXISTS idx_entries_created_by ON entries(created_by);

CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_entries_no_resi ON entries(no_resi);

CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries(created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);

-- 2. USERS TABLE INDEXES

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. USER_STATISTICS TABLE INDEXES

CREATE INDEX IF NOT EXISTS idx_user_statistics_username ON user_statistics(username);

CREATE INDEX IF NOT EXISTS idx_user_statistics_last_entry ON user_statistics(last_entry_date DESC);

-- 4. PERFORMANCE STATISTICS VIEW

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
-- VERIFICATION QUERIES (run separately after above)
-- =====================================================

-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- =====================================================
-- ROLLBACK (if needed, run separately)
-- =====================================================

-- DROP INDEX IF EXISTS idx_entries_created_by;
-- DROP INDEX IF EXISTS idx_entries_created_at;
-- DROP INDEX IF EXISTS idx_entries_no_resi;
-- DROP INDEX IF EXISTS idx_entries_user_created;
-- DROP INDEX IF EXISTS idx_entries_status;
-- DROP INDEX IF EXISTS idx_users_username;
-- DROP INDEX IF EXISTS idx_users_role;
-- DROP INDEX IF EXISTS idx_user_statistics_username;
-- DROP INDEX IF EXISTS idx_user_statistics_last_entry;
-- DROP VIEW IF EXISTS stats_summary;
