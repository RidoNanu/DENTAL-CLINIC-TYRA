# Row Level Security (RLS) Policies Guide

## Overview
Row Level Security (RLS) provides database-level security for Supabase tables. These policies enforce access control at the PostgreSQL level, regardless of how the database is accessed.

---

## Why RLS?

**Security Benefits:**
- ✅ Database-level security (defense in depth)
- ✅ Works even if backend is compromised
- ✅ Enforces access control for direct client queries
- ✅ Complements backend middleware

**Current Setup:**
- Backend uses **service role key** (bypasses RLS)
- Frontend should use **anon key** (enforces RLS)
- Policies act as safety net

---

## Policy Structure

### Services Table

**Access Rules:**
- ✅ **Public READ** - Anyone can view services
- ✅ **Admin WRITE** - Only admins can create/update/delete

```sql
-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "services_select_public"
ON services FOR SELECT TO public USING (true);

-- Only admins can write
CREATE POLICY "services_insert_admin"
ON services FOR INSERT TO authenticated
WITH CHECK (is_admin());
```

**Why:**
- Services are catalog data (publicly viewable)
- Prevents unauthorized service modifications
- Safe for frontend to query directly

---

### Patients Table

**Access Rules:**
- ✅ **Admin FULL ACCESS** - Admin can do everything
- ❌ **No public access** - Patients data is sensitive

```sql
-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "patients_select_admin"
ON patients FOR SELECT TO authenticated
USING (is_admin());

-- Only admins can insert/update/delete
CREATE POLICY "patients_insert_admin"
ON patients FOR INSERT TO authenticated
WITH CHECK (is_admin());
```

**Why:**
- HIPAA compliance (Protected Health Information)
- Prevents data leaks
- Requires authentication + admin role

---

### Appointments Table

**Access Rules:**
- ✅ **Admin FULL ACCESS** - Admin can do everything
- ❌ **No public access** - Appointments contain patient data

```sql
-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Only admins can access
CREATE POLICY "appointments_select_admin"
ON appointments FOR SELECT TO authenticated
USING (is_admin());
```

**Why:**
- Contains patient identifiable information
- Business-sensitive data
- Requires authentication + admin role

---

## Helper Function: is_admin()

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**What it does:**
- Extracts JWT token from Supabase Auth
- Reads `user_metadata.role` field
- Returns `true` if role is 'admin'

**Usage:**
```sql
USING (is_admin())  -- For SELECT, UPDATE, DELETE
WITH CHECK (is_admin())  -- For INSERT, UPDATE
```

---

## Policy Types

### SELECT Policies (Read)

```sql
CREATE POLICY "policy_name"
ON table_name
FOR SELECT
TO role_name
USING (condition);
```

- `TO public` - Anyone (including unauthenticated)
- `TO authenticated` - Logged-in users only
- `USING (condition)` - Row-level filter

### INSERT Policies (Create)

```sql
CREATE POLICY "policy_name"
ON table_name
FOR INSERT
TO authenticated
WITH CHECK (condition);
```

- `WITH CHECK` - Validates new row data
- Runs before INSERT

### UPDATE Policies (Modify)

```sql
CREATE POLICY "policy_name"
ON table_name
FOR UPDATE
TO authenticated
USING (can_select_condition)
WITH CHECK (can_update_condition);
```

- `USING` - Which rows can be selected for update
- `WITH CHECK` - Validates updated data

### DELETE Policies (Remove)

```sql
CREATE POLICY "policy_name"
ON table_name
FOR DELETE
TO authenticated
USING (condition);
```

- `USING` - Which rows can be deleted

---

## How to Apply Policies

### 1. Via Supabase Dashboard

1. Go to **Database** → **SQL Editor**
2. Create new query
3. Paste SQL from `rls_policies.sql`
4. Click **Run**

### 2. Via Supabase CLI

```bash
supabase db push
```

Or run SQL file:
```bash
psql $DATABASE_URL -f database/rls_policies.sql
```

---

## Verification

### Check if RLS is Enabled

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'services', 'appointments');
```

**Expected:**
```
 schemaname |  tablename   | rowsecurity
------------+--------------+-------------
 public     | patients     | t
 public     | services     | t
 public     | appointments | t
```

### List All Policies

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('patients', 'services', 'appointments')
ORDER BY tablename, policyname;
```

**Expected:**
```
  tablename   |      policyname        | permissive |    roles     | cmd
--------------+------------------------+------------+--------------+------
 appointments | appointments_select_admin | PERMISSIVE | authenticated | SELECT
 appointments | appointments_insert_admin | PERMISSIVE | authenticated | INSERT
 patients     | patients_select_admin     | PERMISSIVE | authenticated | SELECT
 services     | services_select_public    | PERMISSIVE | public        | SELECT
 services     | services_insert_admin     | PERMISSIVE | authenticated | INSERT
```

---

## Testing Policies

### Test as Unauthenticated User

```javascript
// Using anon key
const supabase = createClient(url, ANON_KEY);

// Should work (public read)
const { data } = await supabase.from('services').select('*');

// Should fail (no auth)
const { error } = await supabase.from('patients').select('*');
// Error: new row violates row-level security policy
```

### Test as Regular User

```javascript
// Login as regular user
await supabase.auth.signInWithPassword({...});

// Should work (public read)
const { data: services } = await supabase.from('services').select('*');

// Should fail (not admin)
const { error } = await supabase.from('patients').select('*');
// Returns empty array or access denied
```

### Test as Admin

```javascript
// Login as admin
await supabase.auth.signInWithPassword({
  email: 'admin@tyradentistree.com',
  password: 'admin123'
});

// Should work
const { data: patients } = await supabase.from('patients').select('*');
const { data: appointments } = await supabase.from('appointments').select('*');
```

---

## Current Backend Behavior

**Important:** Backend uses **service role key**, which **bypasses RLS**.

```javascript
// server/src/lib/supabaseClient.js
const supabase = createClient(
  supabaseUrl,
  SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS
);
```

**Why:**
- Backend enforces access control via middleware
- Service role needed for admin operations
- Policies act as safety net for direct client access

---

## Optional: User-Owned Appointments

To allow users to see their own appointments:

### 1. Add user_id Column

```sql
ALTER TABLE appointments ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

### 2. Add Policy

```sql
CREATE POLICY "appointments_select_own"
ON appointments
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_admin()
);
```

**Effect:**
- Users can read their own appointments
- Admins can read all appointments

---

## Security Best Practices

### ✅ DO

- Enable RLS on all sensitive tables
- Use `authenticated` role for user data
- Test policies with different user roles
- Use `is_admin()` function for consistency
- Apply policies before going to production

### ❌ DON'T

- Disable RLS in production
- Use `TO public` for sensitive data
- Forget to test policies
- Rely only on backend security
- Expose service role key to frontend

---

## Troubleshooting

### Policy Not Working?

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE tablename = 'your_table';
   ```

2. **Check policy exists:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. **Check user metadata:**
   ```sql
   SELECT auth.jwt() -> 'user_metadata';
   ```

### Getting Empty Results?

- Policies are working (blocking access)
- Check user role in Supabase dashboard
- Verify JWT token contains role

### Policy Denied Error?

- Policy is blocking the operation
- Check if user is authenticated
- Verify user has correct role

---

## Migration from No RLS

If you're adding RLS to existing tables:

```sql
-- 1. Enable RLS (data becomes inaccessible)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 2. Add policies immediately
CREATE POLICY "temp_allow_all" ON patients USING (true);

-- 3. Replace with proper policies
DROP POLICY "temp_allow_all" ON patients;
CREATE POLICY "patients_select_admin" ON patients 
FOR SELECT TO authenticated USING (is_admin());
```

---

## Policy Summary

| Table | Public Read | Public Write | Auth Read | Auth Write | Admin Full |
|-------|-------------|--------------|-----------|------------|------------|
| services | ✅ | ❌ | ✅ | ❌ | ✅ |
| patients | ❌ | ❌ | ❌ | ❌ | ✅ |
| appointments | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Next Steps

1. Apply RLS policies in Supabase
2. Test with different user roles
3. Update frontend to use anon key for public data
4. Keep backend using service role key
5. Monitor policy violations in logs
