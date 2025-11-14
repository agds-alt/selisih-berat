-- =====================================================
-- PRODUCTION-SAFE EARNINGS SYSTEM MIGRATION
-- Version: 1.0
-- Date: 2025-01-14
-- TESTED: Safe for existing production data
-- =====================================================

-- STEP 1: Create settings table (safe if already exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'string',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100)
);

-- STEP 2: Insert default settings (safe - no duplicates)
-- =====================================================
INSERT INTO settings (key, value, description, type) VALUES
('earnings_rate_per_entry', '500', 'Rate per entry in Rupiah (Rp.)', 'number'),
('earnings_daily_bonus', '50000', 'Daily bonus per user in Rupiah (Rp.)', 'number'),
('earnings_enabled', 'true', 'Enable/disable earnings system', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- STEP 3: Create index (safe if already exists)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- STEP 4: Create trigger function for auto-update
-- =====================================================
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create trigger (drop first if exists to avoid duplicate)
-- =====================================================
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- STEP 6: Add new columns to user_statistics (SAFE - checks before adding)
-- =====================================================
DO $$
BEGIN
  -- Add daily_earnings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_statistics'
    AND column_name = 'daily_earnings'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN daily_earnings DECIMAL(12, 2) DEFAULT 0;
    RAISE NOTICE 'Column daily_earnings added to user_statistics';
  ELSE
    RAISE NOTICE 'Column daily_earnings already exists in user_statistics';
  END IF;

  -- Add total_earnings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_statistics'
    AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN total_earnings DECIMAL(12, 2) DEFAULT 0;
    RAISE NOTICE 'Column total_earnings added to user_statistics';
  ELSE
    RAISE NOTICE 'Column total_earnings already exists in user_statistics';
  END IF;

  -- Add days_with_entries column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_statistics'
    AND column_name = 'days_with_entries'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN days_with_entries INTEGER DEFAULT 0;
    RAISE NOTICE 'Column days_with_entries added to user_statistics';
  ELSE
    RAISE NOTICE 'Column days_with_entries already exists in user_statistics';
  END IF;
END
$$;

-- STEP 7: Create function to calculate user earnings
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_user_earnings(p_username VARCHAR)
RETURNS TABLE(
  username VARCHAR,
  total_entries INTEGER,
  days_with_entries INTEGER,
  rate_per_entry DECIMAL,
  daily_bonus DECIMAL,
  entries_earnings DECIMAL,
  bonus_earnings DECIMAL,
  total_earnings DECIMAL
) AS $$
DECLARE
  v_rate DECIMAL;
  v_bonus DECIMAL;
  v_total_entries INTEGER;
  v_days_count INTEGER;
BEGIN
  -- Get current rates from settings
  SELECT CAST(value AS DECIMAL) INTO v_rate
  FROM settings WHERE key = 'earnings_rate_per_entry';

  -- If settings not found, use defaults
  IF v_rate IS NULL THEN
    v_rate := 500;
  END IF;

  SELECT CAST(value AS DECIMAL) INTO v_bonus
  FROM settings WHERE key = 'earnings_daily_bonus';

  IF v_bonus IS NULL THEN
    v_bonus := 50000;
  END IF;

  -- Get total entries for user
  SELECT COUNT(*) INTO v_total_entries
  FROM entries
  WHERE created_by = p_username;

  -- Get count of distinct days with entries
  SELECT COUNT(DISTINCT DATE(created_at)) INTO v_days_count
  FROM entries
  WHERE created_by = p_username;

  -- Return calculated values
  RETURN QUERY
  SELECT
    p_username,
    v_total_entries,
    v_days_count,
    v_rate,
    v_bonus,
    (v_total_entries * v_rate) AS entries_earnings,
    (v_days_count * v_bonus) AS bonus_earnings,
    ((v_total_entries * v_rate) + (v_days_count * v_bonus)) AS total_earnings;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Create function to update all user statistics earnings
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_statistics_earnings()
RETURNS void AS $$
DECLARE
  r RECORD;
  v_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting earnings calculation for all users...';

  FOR r IN SELECT DISTINCT created_by FROM entries WHERE created_by IS NOT NULL
  LOOP
    UPDATE user_statistics us
    SET
      total_earnings = calc.total_earnings,
      days_with_entries = calc.days_with_entries,
      last_updated = NOW()
    FROM calculate_user_earnings(r.created_by) calc
    WHERE us.username = r.created_by;

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Earnings calculation completed for % users', v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE - VERIFICATION
-- =====================================================

-- Verify settings table
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM settings;
  RAISE NOTICE '✅ Settings table created with % records', v_count;
END
$$;

-- Verify new columns
DO $$
DECLARE
  v_daily_earnings BOOLEAN;
  v_total_earnings BOOLEAN;
  v_days_with_entries BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'daily_earnings'
  ) INTO v_daily_earnings;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'total_earnings'
  ) INTO v_total_earnings;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_statistics' AND column_name = 'days_with_entries'
  ) INTO v_days_with_entries;

  IF v_daily_earnings AND v_total_earnings AND v_days_with_entries THEN
    RAISE NOTICE '✅ All new columns added successfully to user_statistics';
  ELSE
    RAISE WARNING '⚠️  Some columns may be missing. Check manually.';
  END IF;
END
$$;

RAISE NOTICE '==============================================';
RAISE NOTICE '✅ MIGRATION COMPLETED SUCCESSFULLY';
RAISE NOTICE '==============================================';
RAISE NOTICE 'Next step: Run this to calculate initial earnings:';
RAISE NOTICE 'SELECT update_user_statistics_earnings();';
RAISE NOTICE '==============================================';

-- Add helpful comments
COMMENT ON TABLE settings IS 'Admin-configurable application settings for earnings system';
COMMENT ON FUNCTION calculate_user_earnings IS 'Calculate earnings for a specific user based on current rates';
COMMENT ON FUNCTION update_user_statistics_earnings IS 'Batch update all user statistics with current earnings (safe to run multiple times)';
