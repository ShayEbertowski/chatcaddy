# Supabase Setup Notes

## Table: prompts

**Current state:**
- Row Level Security (RLS): Disabled (for development only)
- `user_id` column present, used for future ownership logic

## TODO before production:

1️⃣ Enable RLS:

```sql
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
