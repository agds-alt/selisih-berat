# Database Migrations

This directory contains SQL migrations for database optimization and schema updates.

## How to Apply Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file (e.g., `001-performance-indexes.sql`)
5. Paste into the SQL editor
6. Click **Run** to execute

### Migration Files

| File | Description | Impact |
|------|-------------|--------|
| `001-performance-indexes.sql` | Adds performance indexes on entries, users, and earnings tables | 60-80% faster queries on large datasets |

## Verification

After applying migrations, verify they were successful:

```sql
-- Check created indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Test query performance
EXPLAIN ANALYZE
SELECT * FROM entries
WHERE user_id = 'some-uuid'
ORDER BY created_at DESC
LIMIT 20;
```

## Rollback

Each migration file includes rollback instructions at the bottom if you need to revert changes.

## Best Practices

- **Test in development first**: Always test migrations in a development environment before production
- **Backup before major changes**: Create a backup before running large migrations
- **Monitor performance**: Use `EXPLAIN ANALYZE` to verify query improvements
- **Run during low traffic**: Schedule migrations during off-peak hours
- **Vacuum analyze**: Supabase handles this automatically, but you can trigger manually if needed

## Performance Monitoring

After applying indexes, monitor query performance:

```sql
-- Check slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify table names match your schema
3. Ensure you have proper permissions
4. Contact support if problems persist
