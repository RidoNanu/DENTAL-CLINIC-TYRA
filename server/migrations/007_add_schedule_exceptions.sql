-- Create table for date-specific schedule exceptions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.clinic_schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    is_morning_open BOOLEAN DEFAULT true,
    is_evening_open BOOLEAN DEFAULT true,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.clinic_schedule_exceptions IS 'Overrides global schedule settings for specific dates';

-- Enable RLS
ALTER TABLE public.clinic_schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public can read exceptions (to know if a slot is disabled)
CREATE POLICY "Public can read schedule exceptions" 
ON public.clinic_schedule_exceptions FOR SELECT 
USING (true);

-- 2. Admins can manage exceptions
-- 2. Admins can manage exceptions (Backend uses Service Role Key, so this is optional or can be simplified)
-- Keeping it empty or basic for now to avoid migration errors
-- The backend uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clinic_schedule_exceptions_updated_at ON public.clinic_schedule_exceptions;

CREATE TRIGGER update_clinic_schedule_exceptions_updated_at
    BEFORE UPDATE ON public.clinic_schedule_exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
