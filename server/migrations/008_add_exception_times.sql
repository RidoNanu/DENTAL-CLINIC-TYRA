-- Migration: Add custom shift times to schedule exceptions
-- Description: Allow admins to set custom hours for specific dates (e.g., "9AM-12PM on Christmas")
-- Run this in Supabase SQL Editor

-- Add time columns (nullable - NULL means "use global schedule times")
ALTER TABLE public.clinic_schedule_exceptions 
ADD COLUMN morning_start_time TIME,
ADD COLUMN morning_end_time TIME,
ADD COLUMN evening_start_time TIME,
ADD COLUMN evening_end_time TIME;

-- Add comments for documentation
COMMENT ON COLUMN public.clinic_schedule_exceptions.morning_start_time IS 'Custom morning start time for this date (NULL = use global schedule)';
COMMENT ON COLUMN public.clinic_schedule_exceptions.morning_end_time IS 'Custom morning end time for this date (NULL = use global schedule)';
COMMENT ON COLUMN public.clinic_schedule_exceptions.evening_start_time IS 'Custom evening start time for this date (NULL = use global schedule)';
COMMENT ON COLUMN public.clinic_schedule_exceptions.evening_end_time IS 'Custom evening end time for this date (NULL = use global schedule)';
