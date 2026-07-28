/** Public env helpers — safe for the browser / NEXT_PUBLIC_* only. */

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") || "";
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
}

/** Prefer explicit URL; otherwise derive from Supabase project URL. */
export function getSubmitLeadUrl() {
  const explicit = process.env.NEXT_PUBLIC_SUBMIT_LEAD_URL?.trim() || "";
  if (explicit) return explicit;

  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return "";

  return `${supabaseUrl}/functions/v1/submit-lead`;
}

export function getSyncEnrollmentUrl() {
  const supabaseUrl = getSupabaseUrl();
  if (!supabaseUrl) return "";
  return `${supabaseUrl}/functions/v1/sync-enrollment`;
}
