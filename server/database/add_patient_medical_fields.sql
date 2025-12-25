-- Add patient medical information columns to patients table
-- Run this in Supabase SQL Editor

-- Add date_of_birth column
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Add gender/sex column
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));

-- Note: Age is calculated from date_of_birth, not stored
-- You can calculate age in queries like this:
-- SELECT 
--   name, 
--   date_of_birth,
--   EXTRACT(YEAR FROM AGE(date_of_birth)) AS age
-- FROM patients;

-- Or create a view with age calculated automatically:
CREATE OR REPLACE VIEW patients_with_age AS
SELECT 
    id,
    name,
    phone,
    email,
    notes,
    date_of_birth,
    gender,
    CASE 
        WHEN date_of_birth IS NOT NULL 
        THEN EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER 
        ELSE NULL 
    END AS age,
    created_at
FROM public.patients;

-- Grant permissions on the view
GRANT SELECT ON patients_with_age TO authenticated;
GRANT SELECT ON patients_with_age TO anon;

COMMENT ON COLUMN public.patients.date_of_birth IS 'Patient date of birth';
COMMENT ON COLUMN public.patients.gender IS 'Patient gender: male, female, other, prefer_not_to_say';
