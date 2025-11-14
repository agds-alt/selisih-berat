-- =====================================================
-- STEP BY STEP INDEX CREATION
-- =====================================================
-- Copy dan run ONE BY ONE di Supabase SQL Editor
-- Jangan run sekaligus, tapi satu per satu biar tau mana yang error
-- =====================================================

-- STEP 1: Entries - created_by index
CREATE INDEX IF NOT EXISTS idx_entries_created_by ON entries(created_by);

-- STEP 2: Entries - created_at index
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- STEP 3: Entries - no_resi index
CREATE INDEX IF NOT EXISTS idx_entries_no_resi ON entries(no_resi);

-- STEP 4: Entries - composite index (created_by + created_at)
CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries(created_by, created_at DESC);

-- STEP 5: Entries - status index
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);

-- STEP 6: Users - username index
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- STEP 7: Users - role index
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- STEP 8: User statistics - username index
CREATE INDEX IF NOT EXISTS idx_user_statistics_username ON user_statistics(username);

-- STEP 9: User statistics - last_entry_date index
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_entry ON user_statistics(last_entry_date DESC);

-- STEP 10: Create stats view
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
-- VERIFY (run this AFTER all steps above)
-- =====================================================

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
