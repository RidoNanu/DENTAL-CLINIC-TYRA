-- Migration: Create appointment_action_tokens table
-- Description: Stores secure, single-use tokens for email-based appointment actions
-- Created: 2025-12-23

-- Create appointment_action_tokens table
CREATE TABLE appointment_action_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL CHECK (action_type IN ('cancel', 'reschedule')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_action_tokens_token ON appointment_action_tokens(token);
CREATE INDEX idx_action_tokens_expires ON appointment_action_tokens(expires_at);
CREATE INDEX idx_action_tokens_appointment ON appointment_action_tokens(appointment_id);

-- Add comment for documentation
COMMENT ON TABLE appointment_action_tokens IS 'Secure tokens for email-based appointment management (cancel/reschedule)';
COMMENT ON COLUMN appointment_action_tokens.token IS 'Unique UUID token - single use only';
COMMENT ON COLUMN appointment_action_tokens.expires_at IS 'Token expires 24 hours after creation';
COMMENT ON COLUMN appointment_action_tokens.used_at IS 'Timestamp when token was used (prevents reuse)';
