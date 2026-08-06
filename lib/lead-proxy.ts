/** Shared Next ↔ Edge proof that /api/submit-lead already verified Turnstile. */

import { getTurnstileSecretKey } from "@/lib/turnstile-server";

export const APEX_LEAD_PROXY_HEADER = "x-apex-lead-proxy";

/**
 * Prefer dedicated LEAD_PROXY_SECRET (Edge + Next). Falls back to
 * TURNSTILE_SECRET_KEY for backwards compatibility.
 */
export function getLeadProxySecret() {
  return (
    process.env.LEAD_PROXY_SECRET?.trim() || getTurnstileSecretKey() || ""
  );
}
