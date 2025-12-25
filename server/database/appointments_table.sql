-- ==============================
-- Appointments Table Schema (CORRECTED)
-- Matches backend code expectations
-- ==============================

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS public.appointments CASCADE;

-- Create appointments table with CORRECT column names
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    appointment_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_service ON public.appointments(service_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can read all appointments
CREATE POLICY "Allow authenticated users to read appointments"
    ON public.appointments
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Authenticated users can insert appointments
CREATE POLICY "Allow authenticated users to insert appointments"
    ON public.appointments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS Policy: Authenticated users can update appointments
CREATE POLICY "Allow authenticated users to update appointments"
    ON public.appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Authenticated users can delete appointments
CREATE POLICY "Allow authenticated users to delete appointments"
    ON public.appointments
    FOR DELETE
    TO authenticated
    USING (true);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
