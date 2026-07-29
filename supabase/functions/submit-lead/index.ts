import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function resolveCorsOrigin(req: Request) {
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = req.headers.get("Origin") || "";
  if (allowed.length === 0) return "*";
  if (origin && allowed.includes(origin)) return origin;
  return allowed[0];
}

function corsHeadersFor(req: Request) {
  return {
    "Access-Control-Allow-Origin": resolveCorsOrigin(req),
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  track?: string;
  status?: string;
  source?: string;
  submittedAt?: string;
};

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 32;
const MAX_TRACK = 80;
const MAX_STATUS = 80;
const MAX_SOURCE = 120;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_PER_IP = 8;
const RATE_LIMIT_MAX_PER_EMAIL = 5;

function json(data: unknown, status = 200, req?: Request) {
  const cors = req ? corsHeadersFor(req) : {
    "Access-Control-Allow-Origin": "*",
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

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatIst(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

async function hashIp(ip: string) {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

async function postToGoogleAppsScript(
  sheetUrl: string,
  payload: Record<string, unknown>
) {
  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  const timeoutMs = 20000;

  // Google Apps Script web apps respond with 302.
  // Re-POSTing the Location returns 405. The correct flow is:
  // POST /exec (manual redirect) -> GET Location -> doPost JSON result.
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
    // ignore non-JSON
  }

  return { res, sheetJson, text };
}

function syncLeadToSheetInBackground(options: {
  supabase: ReturnType<typeof createClient>;
  leadId: string;
  sheetUrl: string;
  webhookSecret: string;
  payload: {
    leadId: string;
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    track: string;
    status: string;
    enrollmentStatus: string;
    source: string;
    followUp: string;
    notes: string;
    submittedAt: string;
    createdAtIst: string;
  };
}) {
  const { supabase, leadId, sheetUrl, webhookSecret, payload } = options;

  const syncPromise = (async () => {
    let sheetSyncedAt: string | null = null;
    let sheetSyncError: string | null = null;

    try {
      const { res, sheetJson, text } = await postToGoogleAppsScript(sheetUrl, {
        ...payload,
        webhookSecret,
      });

      if (res.ok && sheetJson.ok === true && (sheetJson.row || sheetJson.leadId)) {
        sheetSyncedAt = new Date().toISOString();
      } else if (res.ok && sheetJson.ok === true && sheetJson.error) {
        sheetSyncError = String(sheetJson.error);
      } else if (
        res.ok &&
        sheetJson.ok === true &&
        (sheetJson as { service?: string }).service
      ) {
        sheetSyncError =
          "Sheets returned health check instead of write result — redeploy Apps Script web app";
      } else if (res.ok && sheetJson.ok === true) {
        sheetSyncError = "Sheets sync returned OK without write confirmation";
      } else {
        const errText = sheetJson.error || "";
        if (/unauthorized/i.test(errText)) {
          sheetSyncError =
            "Unauthorized — SHEETS_WEBHOOK_SECRET must match Apps Script setWebhookSecret()";
        } else {
          sheetSyncError =
            errText ||
            `Sheets sync failed (${res.status})${
              text && !sheetJson.ok ? `: ${text.slice(0, 180)}` : ""
            }`;
        }
      }
    } catch (err) {
      sheetSyncError = String(err);
    }

    await supabase
      .from("leads")
      .update({
        sheet_synced_at: sheetSyncedAt,
        sheet_sync_error: sheetSyncError,
      })
      .eq("id", leadId);
  })().catch((err) => {
    console.error("background sheet sync failed", err);
  });

  try {
    EdgeRuntime.waitUntil(syncPromise);
  } catch {
    void syncPromise;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeadersFor(req) });
  }

  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, req);
  }

  try {
    const body = (await req.json()) as LeadBody;
    const name = clean(body.name).slice(0, MAX_NAME);
    const email = clean(body.email).slice(0, MAX_EMAIL).toLowerCase();
    const phone = clean(body.phone).slice(0, MAX_PHONE);
    const countryCode = clean(body.countryCode).slice(0, 8) || "+91";
    const track = clean(body.track).slice(0, MAX_TRACK);
    const status = clean(body.status).slice(0, MAX_STATUS);
    const source = (clean(body.source) || "unknown").slice(0, MAX_SOURCE);
    const submittedAt = clean(body.submittedAt).slice(0, 64);

    if (!name || !email || !phone || !track || !status) {
      return json(
        {
          ok: false,
          error: "Missing required fields: name, email, phone, track, status",
        },
        400,
        req
      );
    }

    if (!isValidEmail(email)) {
      return json({ ok: false, error: "Invalid email address" }, 400, req);
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      return json({ ok: false, error: "Invalid phone number" }, 400, req);
    }

    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip =
      req.headers.get("cf-connecting-ip")?.trim() ||
      req.headers.get("x-real-ip")?.trim() ||
      forwarded.split(",")[0]?.trim() ||
      "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const sheetUrl = Deno.env.get("GOOGLE_SHEET_WEB_APP_URL")?.trim() || "";
    const webhookSecret = Deno.env.get("SHEETS_WEBHOOK_SECRET")?.trim() || "";

    if (!supabaseUrl || !serviceRole) {
      return json({ ok: false, error: "Server misconfigured" }, 500, req);
    }

    if (sheetUrl && !webhookSecret) {
      console.error("SHEETS_WEBHOOK_SECRET missing while sheet URL is set");
    }

    if (!ip) {
      return json(
        {
          ok: false,
          error: "Unable to verify request. Please try again.",
        },
        403,
        req
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const now = new Date();
    const sinceIso = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString();
    const ipHash = await hashIp(ip);

    {
      const { count: ipCount, error: ipCountError } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", sinceIso);

      if (ipCountError) {
        console.error(ipCountError);
        return json(
          { ok: false, error: "Temporarily unavailable. Please try again." },
          503,
          req
        );
      }

      if ((ipCount ?? 0) >= RATE_LIMIT_MAX_PER_IP) {
        return json(
          { ok: false, error: "Too many submissions. Please try again later." },
          429,
          req
        );
      }
    }

    {
      const { count: emailCount, error: emailCountError } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .gte("created_at", sinceIso);

      if (emailCountError) {
        console.error(emailCountError);
        return json(
          { ok: false, error: "Temporarily unavailable. Please try again." },
          503,
          req
        );
      }

      if ((emailCount ?? 0) >= RATE_LIMIT_MAX_PER_EMAIL) {
        return json(
          { ok: false, error: "Too many submissions. Please try again later." },
          429,
          req
        );
      }
    }

    const clientSubmittedAt = submittedAt ? new Date(submittedAt) : now;
    const createdAtIst = formatIst(now);
    const userAgent = req.headers.get("user-agent") || "";

    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        full_name: name,
        email,
        phone,
        country_code: countryCode,
        track,
        current_status: status,
        enrollment_status: "New",
        source,
        client_submitted_at: Number.isNaN(clientSubmittedAt.getTime())
          ? now.toISOString()
          : clientSubmittedAt.toISOString(),
        created_at_ist: createdAtIst,
        user_agent: userAgent.slice(0, 500),
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError || !lead) {
      console.error(insertError);
      return json({ ok: false, error: "Failed to save lead" }, 500, req);
    }

    if (sheetUrl && webhookSecret) {
      syncLeadToSheetInBackground({
        supabase,
        leadId: lead.id,
        sheetUrl,
        webhookSecret,
        payload: {
          leadId: lead.id,
          name,
          email,
          phone,
          countryCode,
          track,
          status,
          enrollmentStatus: "New",
          source,
          followUp: "",
          notes: "",
          submittedAt: submittedAt || now.toISOString(),
          createdAtIst,
        },
      });
    } else if (!sheetUrl) {
      await supabase
        .from("leads")
        .update({
          sheet_sync_error:
            "GOOGLE_SHEET_WEB_APP_URL not set in Edge Function secrets",
        })
        .eq("id", lead.id);
    } else {
      await supabase
        .from("leads")
        .update({
          sheet_sync_error:
            "SHEETS_WEBHOOK_SECRET not set in Edge Function secrets (must match Apps Script setWebhookSecret)",
        })
        .eq("id", lead.id);
    }

    // Do not return lead UUID to anonymous clients.
    return json({ ok: true }, 200, req);
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Unexpected server error" }, 500, req);
  }
});
