-- ============================================================================
-- MINIMAL SECURE RLS POLICIES
-- For TYRA DENTISTREE Dental Clinic Management System
-- ============================================================================

-- SECURITY MODEL:
-- - Backend uses SERVICE ROLE key (bypasses RLS)
-- - Frontend uses ANON key (enforces RLS)
-- - Frontend communicates ONLY with backend REST APIs
-- - RLS blocks direct database access from frontend

-- ============================================================================
-- TABLE: patients
-- ============================================================================

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- No policies = No access
-- All access must go through backend API with service role key

-- ============================================================================
-- TABLE: appointments
-- ============================================================================

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for availability calculation
CREATE POLICY "Public read appointments for availability"
ON appointments
FOR SELECT
TO anon
USING (true);

-- All write operations must go through backend API with service role key

-- ============================================================================
-- TABLE: clinic_settings (if exists)
-- ============================================================================

-- Enable RLS (only if table exists)
ALTER TABLE IF EXISTS clinic_settings ENABLE ROW LEVEL SECURITY;

-- No policies = No access
-- All access must go through backend API with service role key

-- ============================================================================
-- TABLE: services
-- ============================================================================

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can SELECT services (read-only)
CREATE POLICY "services_select_authenticated"
ON services
FOR SELECT
TO authenticated
USING (true);

-- No INSERT, UPDATE, DELETE policies
-- Write operations must go through backend API with service role key

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'services', 'clinic_settings')
ORDER BY tablename;

-- List all policies (should be minimal)
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

/*
IMPORTANT SECURITY CONSIDERATIONS:

1. BACKEND ACCESS (Service Role Key):
   - Bypasses all RLS policies
   - Full read/write access to all tables
   - Used by Express API server ONLY
   - NEVER expose to frontend

2. FRONTEND ACCESS (Anon Key):
   - Enforces all RLS policies
   - Can only SELECT from services table (if authenticated)
   - Cannot access patients, appointments, or clinic_settings
   - Should communicate with backend REST API instead

3. WHY MINIMAL POLICIES?
   - Frontend should NOT query database directly
   - All CRUD operations go through backend API
   - Backend provides validation, business logic, and security
   - RLS is a safety net, not the primary security layer

4. EXPECTED BEHAVIOR:
   - Frontend direct queries to patients/appointments = DENIED
   - Frontend direct writes to services = DENIED
   - Only backend (service role) can perform all operations
   - Services table allows authenticated read for public catalog

5. IF YOU NEED TO ALLOW USER-SPECIFIC ACCESS:
   - Add user_id column to tables
   - Create policies like: USING (auth.uid() = user_id)
   - Current setup assumes backend handles all user context

*/

-- ============================================================================
-- CLEANUP (use with caution - removes all policies)
-- ============================================================================

/*
-- Drop all policies
DROP POLICY IF EXISTS "services_select_authenticated" ON services;

-- Disable RLS (NOT RECOMMENDED - only for testing)
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE IF EXISTS clinic_settings DISABLE ROW LEVEL SECURITY;
*/
