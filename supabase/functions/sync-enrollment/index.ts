import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ENROLLMENT_STATUSES = new Set([
  "New",
  "Contacted",
  "Pending Enrollment",
  "Enrolled",
  "Not Interested",
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clean(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

async function postToGoogleAppsScript(
  sheetUrl: string,
  payload: Record<string, unknown>
) {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  const timeoutMs = 20000;

  const postRes = await fetch(sheetUrl, {
    method: "POST",
    headers,
    body,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });

  const location = postRes.headers.get("location");
  if (
    !location ||
    !(
      postRes.status === 301 ||
      postRes.status === 302 ||
      postRes.status === 303 ||
      postRes.status === 307 ||
      postRes.status === 308
    )
  ) {
    const text = await postRes.text();
    let sheetJson: { ok?: boolean; error?: string; row?: number } = {};
    try {
      sheetJson = JSON.parse(text) as typeof sheetJson;
    } catch {
      // ignore
    }
    return { res: postRes, sheetJson, text };
  }

  const res = await fetch(location, {
    method: "GET",
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });

  let sheetJson: { ok?: boolean; error?: string; row?: number; leadId?: string } =
    {};
  const text = await res.text();
  try {
    sheetJson = JSON.parse(text) as typeof sheetJson;
  } catch {
    // ignore
  }

  return { res, sheetJson, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const sheetUrl = Deno.env.get("GOOGLE_SHEET_WEB_APP_URL")?.trim() || "";
    const webhookSecret = Deno.env.get("SHEETS_WEBHOOK_SECRET")?.trim() || "";

    if (!supabaseUrl || !anonKey) {
      return json({ ok: false, error: "Server misconfigured" }, 500);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const { data: adminRow, error: adminError } = await userClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      return json({ ok: false, error: "Forbidden" }, 403);
    }

    const body = (await req.json()) as {
      leadId?: string;
      enrollmentStatus?: string;
    };

    const leadId = clean(body.leadId);
    const enrollmentStatus = clean(body.enrollmentStatus);

    if (!leadId || !ENROLLMENT_STATUSES.has(enrollmentStatus)) {
      return json({ ok: false, error: "Invalid leadId or enrollmentStatus" }, 400);
    }

    // Update Supabase as the authenticated admin (RLS enforced).
    const { data: lead, error: updateError } = await userClient
      .from("leads")
      .update({ enrollment_status: enrollmentStatus })
      .eq("id", leadId)
      .select(
        "id, full_name, email, phone, country_code, track, current_status, source, client_submitted_at, created_at, created_at_ist"
      )
      .single();

    if (updateError || !lead) {
      return json({ ok: false, error: "Failed to update lead" }, 400);
    }

    if (!sheetUrl) {
      return json({ ok: true, sheetSynced: false, reason: "Sheet URL not configured" });
    }

    if (!webhookSecret) {
      return json({
        ok: true,
        sheetSynced: false,
        reason: "SHEETS_WEBHOOK_SECRET not configured",
      });
    }

    const { res, sheetJson, text } = await postToGoogleAppsScript(sheetUrl, {
      action: "syncEnrollment",
      webhookSecret,
      leadId: lead.id,
      enrollmentStatus,
      name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      countryCode: lead.country_code || "+91",
      track: lead.track,
      status: lead.current_status,
      source: lead.source || "",
      submittedAt: lead.client_submitted_at || lead.created_at,
      createdAtIst: lead.created_at_ist || "",
    });

    if (res.ok && sheetJson.ok === true) {
      return json({ ok: true, sheetSynced: true });
    }

    return json({
      ok: true,
      sheetSynced: false,
      reason:
        sheetJson.error ||
        `Sheets sync failed (${res.status})${
          text ? `: ${text.slice(0, 120)}` : ""
        }`,
    });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Unexpected server error" }, 500);
  }
});
