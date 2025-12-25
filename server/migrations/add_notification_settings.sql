-- Add notification settings columns to existing clinic_settings table
-- Run this migration in Supabase SQL Editor

ALTER TABLE public.clinic_settings
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_request_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_confirmation_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS send_cancellation_email BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES admins(id);

-- Add a comment for documentation
COMMENT ON TABLE public.clinic_settings IS 'Stores clinic information and notification preferences for the admin dashboard';

-- Insert default settings if table is empty
INSERT INTO public.clinic_settings (
    clinic_name,
    phone,
    email,
    address,
    opening_hours,
    email_notifications_enabled,
    send_request_email,
    send_confirmation_email,
    send_cancellation_email,
    created_at
)
SELECT 
    'Tyra Dentistree',
    '(555) 123-4567',
    'contact@tyradentistree.com',
    '123 Dental Avenue, Healthcare District, City, State 12345',
    'Mon-Sat: 9:00 AM - 7:00 PM',
    true,
    true,
    true,
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.clinic_settings LIMIT 1);
