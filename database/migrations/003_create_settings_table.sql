-- Create settings table for admin-configurable values
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100)
);

-- Insert default earnings settings
INSERT INTO settings (key, value, description, type) VALUES
('earnings_rate_per_entry', '500', 'Rate per entry in Rupiah (Rp.)', 'number'),
('earnings_daily_bonus', '50000', 'Daily bonus per user in Rupiah (Rp.)', 'number'),
('earnings_enabled', 'true', 'Enable/disable earnings system', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Add trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Update user_statistics table to add earnings fields (if not exists)
DO $$
BEGIN
  -- Add daily_earnings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_statistics' AND column_name = 'daily_earnings'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN daily_earnings DECIMAL(12, 2) DEFAULT 0;
  END IF;

  -- Add total_earnings column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_statistics' AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN total_earnings DECIMAL(12, 2) DEFAULT 0;
  END IF;

  -- Add days_with_entries column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_statistics' AND column_name = 'days_with_entries'
  ) THEN
    ALTER TABLE user_statistics ADD COLUMN days_with_entries INTEGER DEFAULT 0;
  END IF;
END
$$;

-- Create a function to calculate earnings for a user
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

  SELECT CAST(value AS DECIMAL) INTO v_bonus
  FROM settings WHERE key = 'earnings_daily_bonus';

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

-- Create a function to update user_statistics earnings
CREATE OR REPLACE FUNCTION update_user_statistics_earnings()
RETURNS void AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT created_by FROM entries WHERE created_by IS NOT NULL
  LOOP
    UPDATE user_statistics us
    SET
      total_earnings = calc.total_earnings,
      days_with_entries = calc.days_with_entries
    FROM calculate_user_earnings(r.created_by) calc
    WHERE us.username = r.created_by;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE settings IS 'Admin-configurable application settings';
COMMENT ON FUNCTION calculate_user_earnings IS 'Calculate earnings for a specific user based on current rates';
COMMENT ON FUNCTION update_user_statistics_earnings IS 'Batch update all user statistics with current earnings';
