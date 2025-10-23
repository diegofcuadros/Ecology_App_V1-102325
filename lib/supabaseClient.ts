import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These variables should be set in your environment variables.
// For local development, you can create a .env.local file.
// In a production environment (like Vercel, Netlify, etc.), set them in the project settings.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Export a boolean flag to check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Conditionally create the client. It will be null if keys are missing.
export const supabase = 
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;