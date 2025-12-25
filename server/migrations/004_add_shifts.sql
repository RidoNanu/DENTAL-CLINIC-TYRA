-- Migration to add support for Shift + Token system
-- Run this in Supabase SQL editor

-- 1. Add shift column (morning/evening)
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS shift VARCHAR(20) CHECK (shift IN ('morning', 'evening'));

-- 2. Add token_number column (nullable, assigned on confirmation)
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS token_number INTEGER;

-- 3. Create index for efficient token lookups (date + shift)
CREATE INDEX IF NOT EXISTS idx_appointments_date_shift_token 
ON public.appointments(appointment_at, shift, token_number);

-- Comments for documentation
COMMENT ON COLUMN public.appointments.shift IS 'Morning or Evening shift preference';
COMMENT ON COLUMN public.appointments.token_number IS 'Sequential token number assigned upon confirmation';
