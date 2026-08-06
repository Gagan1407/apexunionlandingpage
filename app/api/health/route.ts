import { NextResponse } from "next/server";
import { getSubmitLeadUrl, getSupabaseUrl } from "@/lib/public-env";

export const dynamic = "force-dynamic";

/** Lightweight uptime / smoke probe for host or external monitors. */
export async function GET() {
  const supabaseUrl = getSupabaseUrl();
  const submitLeadUrl = getSubmitLeadUrl();

  return NextResponse.json(
    {
      ok: true,
      service: "apex-landing",
      ts: new Date().toISOString(),
      checks: {
        supabaseUrlConfigured: Boolean(supabaseUrl),
        submitLeadUrlConfigured: Boolean(submitLeadUrl),
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
