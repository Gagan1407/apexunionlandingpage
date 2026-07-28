import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, key);
}

export type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country_code: string | null;
  track: string;
  current_status: string;
  enrollment_status: string;
  source: string | null;
  client_submitted_at: string | null;
  created_at: string;
  created_at_ist: string | null;
  sheet_synced_at: string | null;
  sheet_sync_error: string | null;
  sheet_extra?: Record<string, string> | null;
};
