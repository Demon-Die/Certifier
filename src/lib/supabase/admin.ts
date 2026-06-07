import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Creates a Supabase admin client using the service role key.
 * Bypasses RLS — only use in trusted server-side contexts
 * (webhooks, auth callbacks, admin operations).
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
