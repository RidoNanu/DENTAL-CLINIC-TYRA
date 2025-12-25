-- Migration to add shift enable/disable toggles
-- Run this in Supabase SQL Editor

ALTER TABLE public.clinic_schedule_settings
ADD COLUMN IF NOT EXISTS morning_shift_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS evening_shift_enabled BOOLEAN DEFAULT true;

-- Update the comment
COMMENT ON TABLE public.clinic_schedule_settings IS 'Single source of truth for clinic working hours and active shifts';
