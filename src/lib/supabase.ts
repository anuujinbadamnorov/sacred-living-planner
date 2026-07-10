import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('Supabase URL or key missing — returning placeholder client');
    return {} as any;
  }
  return createBrowserClient<Database>(url, key) as any;
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('Supabase service key missing — returning placeholder client');
    return {} as any;
  }
  return createSupabaseClient<Database>(url, key) as any;
}
