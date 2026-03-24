import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single shared client — no auth headers, RLS is disabled in dev
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// No-op shim — returns the same client, never creates a new one
export const getAuthenticatedClient = async () => supabase;
