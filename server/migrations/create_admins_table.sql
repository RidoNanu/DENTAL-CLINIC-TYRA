-- Migration: Create admins table
-- Description: Table for admin users with email/password authentication
-- Created: 2025-12-23

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Seed initial admin account
-- Email: admin@tyradentistree.com
-- Password: admin123
-- Hash generated with bcrypt (salt rounds: 10)
INSERT INTO admins (email, password_hash)
VALUES (
    'admin@tyradentistree.com',
    '$2b$10$wxV9z83h9xCjlwKp6ObGWu.ImgJ0K6ZwByo.xVfQACshzZW.iZ9tG'
)
ON CONFLICT (email) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE admins IS 'Admin users for dashboard access';
COMMENT ON COLUMN admins.email IS 'Admin email address (unique)';
COMMENT ON COLUMN admins.password_hash IS 'bcrypt hashed password';
