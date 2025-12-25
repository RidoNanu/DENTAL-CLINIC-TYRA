-- ==============================
-- FIX: Drop and Recreate Services Table
-- ==============================
-- Run this to fix the missing 'duration' column issue

-- Drop existing table (this will remove any existing data)
DROP TABLE IF EXISTS public.services CASCADE;

-- Create services table with correct schema
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    duration INTEGER, -- duration in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_services_name ON public.services(name);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow public read access
CREATE POLICY "Allow public read access to services"
    ON public.services
    FOR SELECT
    USING (true);

-- RLS Policy: Only authenticated users can insert
CREATE POLICY "Allow authenticated users to insert services"
    ON public.services
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated users to update services"
    ON public.services
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Only authenticated users can delete
CREATE POLICY "Allow authenticated users to delete services"
    ON public.services
    FOR DELETE
    TO authenticated
    USING (true);

-- Insert sample dental services (prices in Indian Rupees ₹)
INSERT INTO public.services (name, description, price, duration) VALUES
('General Checkup', 'Comprehensive dental examination including cleaning and cavity check', 799.00, 45),
('Teeth Whitening', 'Professional teeth whitening treatment for a brighter smile', 2499.00, 60),
('Dental Filling', 'Tooth cavity filling with composite resin material', 1200.00, 30),
('Root Canal Treatment', 'Complete root canal therapy to save infected tooth', 5500.00, 90),
('Teeth Cleaning', 'Professional dental cleaning and plaque removal', 599.00, 30),
('Dental Crown', 'Custom-made dental crown for damaged or weakened tooth', 7500.00, 120),
('Tooth Extraction', 'Safe and painless tooth extraction procedure', 1500.00, 45),
('Orthodontics Consultation', 'Initial consultation for braces or aligners', 399.00, 30);

-- Create auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
