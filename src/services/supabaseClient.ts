import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    debug: true
  },
  global: {
    headers: {
      'x-client-info': 'crm-admin'
    }
  }
});

// Verify client initialization
if (!supabase.auth) {
  throw new Error('Supabase client auth not initialized properly');
}

// Log successful initialization
console.log('Supabase client initialized successfully');

export default supabase;