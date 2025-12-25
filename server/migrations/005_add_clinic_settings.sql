-- Migration to add clinic_schedule_settings table
-- Run this in Supabase SQL editor

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.clinic_schedule_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    morning_start_time TIME NOT NULL DEFAULT '09:00:00',
    morning_end_time TIME NOT NULL DEFAULT '13:00:00',
    evening_start_time TIME NOT NULL DEFAULT '16:00:00',
    evening_end_time TIME NOT NULL DEFAULT '20:00:00',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add comment
COMMENT ON TABLE public.clinic_schedule_settings IS 'Single source of truth for clinic working hours';

-- 3. Seed default row (Ensure only one row exists)
INSERT INTO public.clinic_schedule_settings (id, morning_start_time, morning_end_time, evening_start_time, evening_end_time)
SELECT '00000000-0000-0000-0000-000000000001', '09:00:00', '13:00:00', '16:00:00', '20:00:00'
WHERE NOT EXISTS (SELECT 1 FROM public.clinic_schedule_settings);

-- 4. Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clinic_schedule_settings_updated_at ON public.clinic_schedule_settings;

CREATE TRIGGER update_clinic_schedule_settings_updated_at
    BEFORE UPDATE ON public.clinic_schedule_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- 5. Add RLS policies (optional but good practice)
ALTER TABLE public.clinic_schedule_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON public.clinic_schedule_settings;
CREATE POLICY "Allow public read access" ON public.clinic_schedule_settings
    FOR SELECT USING (true);

-- Allow authenticated users (admin) to update
DROP POLICY IF EXISTS "Allow admin update" ON public.clinic_schedule_settings;
CREATE POLICY "Allow admin update" ON public.clinic_schedule_settings
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
