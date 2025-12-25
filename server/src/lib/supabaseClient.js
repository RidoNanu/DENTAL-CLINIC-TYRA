/**
 * Supabase Client Configuration
 * 
 * This module creates and exports a Supabase client for backend use.
 * Uses the Service Role Key for full database access.
 * 
 * IMPORTANT: This client should ONLY be used server-side.
 * Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */

const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Create Supabase client with service role key
// Service role key bypasses Row Level Security (RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

module.exports = supabase;
