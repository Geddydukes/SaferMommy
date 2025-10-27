import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let cachedClient: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  cachedClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else {
  console.warn(
    'Supabase credentials are not configured. API calls will throw until EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    throw new Error('Supabase client requested before environment variables were configured.');
  }

  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return cachedClient !== null;
}