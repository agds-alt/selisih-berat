# Database Functions

## Leaderboard Functions (OPTIONAL)

The leaderboard API already works with **fallback queries** if these functions don't exist.

### Current Status
✅ **API is working** - Uses fallback queries if RPC functions fail
⚡ **Optional optimization** - These functions provide ~50% better performance

### How to Install

1. Open **Supabase Dashboard** → SQL Editor
2. Copy contents of `functions/leaderboard_functions.sql`
3. Paste and run the SQL
4. Verify with test queries:
   ```sql
   SELECT * FROM get_daily_top_performers(10);
   SELECT * FROM get_total_top_performers(10);
   ```

### What Happens Without These Functions?

The API automatically falls back to direct queries:

**Daily Leaderboard Fallback**:
```sql
SELECT username, daily_entries, daily_earnings, total_entries
FROM user_statistics
WHERE last_entry_date >= CURRENT_DATE
ORDER BY daily_entries DESC
LIMIT 10
```

**All-time Leaderboard Fallback**:
```sql
SELECT username, total_entries, total_earnings, first_entry, last_entry
FROM user_statistics
WHERE total_entries > 0
ORDER BY total_entries DESC
LIMIT 10
```

### Performance Comparison

| Method | Query Time | Notes |
|--------|-----------|-------|
| RPC Functions | ~50-100ms | Optimized, includes avg_selisih |
| Fallback Queries | ~100-200ms | Simpler, no avg_selisih calculation |

### Troubleshooting

**Error: "function does not exist"**
- ✅ **This is normal!** API uses fallback queries
- To fix: Run the SQL in `functions/leaderboard_functions.sql`

**Error: "permission denied"**
- Run SQL as `postgres` user in Supabase
- Check grants in the SQL file

**Error: "syntax error"**
- Make sure you're using the complete SQL from the file
- Don't use the incomplete example `RETURNS TABLE (...)`

### Why Are These Optional?

1. ✅ Fallback queries already work
2. ✅ Only ~50ms performance difference
3. ✅ Fallback doesn't calculate avg_selisih (not critical)
4. ✅ Easier deployment (no database setup needed)

### When to Install These Functions?

Install if:
- You have 1000+ users (noticeable performance gain)
- You want avg_selisih in leaderboard
- You want optimized database queries

Skip if:
- Just testing or developing
- Less than 1000 users
- Happy with current performance
