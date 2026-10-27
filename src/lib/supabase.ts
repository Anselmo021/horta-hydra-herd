import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Existing external project supplied by the user. The publishable key is safe in the browser.
const SUPABASE_URL = "https://kqgpkgjxtxhvwddbssvc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_t9g0Djrc2dRrnWawq9QLkA_6C5lwShW";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
