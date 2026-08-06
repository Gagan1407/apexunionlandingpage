import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function allowedOrigins() {
  return (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveCorsOrigin(req: Request) {
  const origin = req.headers.get("Origin") || "";
  if (!origin) return "";
  if (allowedOrigins().includes(origin)) return origin;
  return "";
}

function corsHeadersFor(req: Request) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const origin = resolveCorsOrigin(req);
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function isBrowserOriginBlocked(req: Request) {
  const origin = req.headers.get("Origin") || "";
  if (!origin) return false;
  const allowed = allowedOrigins();
  // Empty allowlist → do not block. Set ALLOWED_ORIGINS for production admin CORS.
  if (allowed.length === 0) return false;
  return !allowed.includes(origin);
}

const ENROLLMENT_STATUSES = new Set([
  "New",
  "Contacted",
  "Pending Enrollment",
  "Enrolled",
  "Not Interested",
]);

function json(data: unknown, status = 200, req?: Request) {
  const cors = req
    ? corsHeadersFor(req)
    : {
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      };
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
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
    if (isBrowserOriginBlocked(req)) {
      return new Response("Forbidden", { status: 403 });
    }
    return new Response("ok", { headers: corsHeadersFor(req) });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, req);
  }

  if (isBrowserOriginBlocked(req)) {
    return json({ ok: false, error: "Origin not allowed" }, 403, req);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const sheetUrl = Deno.env.get("GOOGLE_SHEET_WEB_APP_URL")?.trim() || "";
    const webhookSecret = Deno.env.get("SHEETS_WEBHOOK_SECRET")?.trim() || "";

    if (!supabaseUrl || !anonKey) {
      return json({ ok: false, error: "Server misconfigured" }, 500, req);
    }

    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401, req);
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
      return json({ ok: false, error: "Unauthorized" }, 401, req);
    }

    const { data: adminRow, error: adminError } = await userClient
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminRow) {
      return json({ ok: false, error: "Forbidden" }, 403, req);
    }

    const body = (await req.json()) as {
      leadId?: string;
      enrollmentStatus?: string;
    };

    const leadId = clean(body.leadId);
    const enrollmentStatus = clean(body.enrollmentStatus);

    if (!leadId || !ENROLLMENT_STATUSES.has(enrollmentStatus)) {
      return json(
        { ok: false, error: "Invalid leadId or enrollmentStatus" },
        400,
        req
      );
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
      return json({ ok: false, error: "Failed to update lead" }, 400, req);
    }

    if (!sheetUrl) {
      return json(
        { ok: true, sheetSynced: false, reason: "Sheet URL not configured" },
        200,
        req
      );
    }

    if (!webhookSecret) {
      return json(
        {
          ok: true,
          sheetSynced: false,
          reason: "SHEETS_WEBHOOK_SECRET not configured",
        },
        200,
        req
      );
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
      return json({ ok: true, sheetSynced: true }, 200, req);
    }

    return json(
      {
        ok: true,
        sheetSynced: false,
        reason:
          sheetJson.error ||
          `Sheets sync failed (${res.status})${
            text ? `: ${text.slice(0, 120)}` : ""
          }`,
      },
      200,
      req
    );
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Unexpected server error" }, 500, req);
  }
});
