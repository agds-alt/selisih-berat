-- =====================================================
-- SEED DEFAULT SETTINGS
-- =====================================================
-- Run this in Supabase SQL Editor after 001-performance-indexes.sql
-- Populates the settings table with default values
-- =====================================================

-- 1. CREATE UNIQUE CONSTRAINT ON KEY (if not exists)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'settings_key_unique'
  ) THEN
    ALTER TABLE settings ADD CONSTRAINT settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- 2. INSERT DEFAULT SETTINGS
-- =====================================================

-- Earnings settings
INSERT INTO settings (key, value, description, type)
VALUES
  ('rate_per_entry', '500', 'Rate per entry in Rupiah', 'earnings'),
  ('daily_bonus', '50000', 'Daily bonus per user in Rupiah (if user has entries that day)', 'earnings')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  updated_at = NOW();

-- System settings
INSERT INTO settings (key, value, description, type)
VALUES
  ('app_name', 'Weight Entry App', 'Application name', 'system'),
  ('max_photos_per_entry', '2', 'Maximum photos per entry', 'system'),
  ('company_name', 'J&T Express', 'Company name', 'system')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Upload settings
INSERT INTO settings (key, value, description, type)
VALUES
  ('max_file_size_mb', '10', 'Maximum file size for uploads in MB', 'upload'),
  ('allowed_image_formats', 'jpg,jpeg,png,webp,heic', 'Allowed image formats (comma-separated)', 'upload'),
  ('image_compression_quality', '0.8', 'Image compression quality (0.1 to 1.0)', 'upload')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  updated_at = NOW();

-- Feature flags
INSERT INTO settings (key, value, description, type)
VALUES
  ('enable_leaderboard', 'true', 'Enable/disable leaderboard feature', 'features'),
  ('enable_analytics', 'true', 'Enable/disable analytics dashboard (admin only)', 'features'),
  ('enable_audit_logs', 'true', 'Enable/disable audit logging', 'features')
ON CONFLICT (key) DO UPDATE SET
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify settings were inserted:
-- SELECT * FROM settings ORDER BY type, key;

-- Count by type:
-- SELECT type, COUNT(*) as count FROM settings GROUP BY type ORDER BY type;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================

/*
-- To remove seeded settings:
DELETE FROM settings WHERE key IN (
  'rate_per_entry',
  'daily_bonus',
  'app_name',
  'max_photos_per_entry',
  'company_name',
  'max_file_size_mb',
  'allowed_image_formats',
  'image_compression_quality',
  'enable_leaderboard',
  'enable_analytics',
  'enable_audit_logs'
);
*/
