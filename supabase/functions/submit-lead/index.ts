import { createClient } from "npm:@supabase/supabase-js@2.49.1";

function allowedOrigins() {
  return (Deno.env.get("ALLOWED_ORIGINS") || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
}

/** Reflect allowlisted Origin only. No Origin (Next server proxy) → no ACAO. Never "*". */
function resolveCorsOrigin(req: Request) {
  const allowed = allowedOrigins();
  const origin = req.headers.get("Origin") || "";
  if (!origin) return "";
  if (allowed.includes(origin)) return origin;
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
  if (!origin) return false; // server-to-server / Next proxy
  const allowed = allowedOrigins();
  // Empty allowlist → do not block (legacy). Set ALLOWED_ORIGINS in production.
  if (allowed.length === 0) return false;
  return !allowed.includes(origin);
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
  turnstileToken?: string;
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

function secretsEqual(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getLeadProxyExpectedSecret() {
  return (
    Deno.env.get("LEAD_PROXY_SECRET")?.trim() ||
    Deno.env.get("TURNSTILE_SECRET_KEY")?.trim() ||
    ""
  );
}

/** Next /api/submit-lead already verified Turnstile (single-use token). */
function isTrustedNextProxy(req: Request) {
  const expected = getLeadProxyExpectedSecret();
  if (!expected) return false;
  const header = req.headers.get("x-apex-lead-proxy")?.trim() || "";
  return secretsEqual(header, expected);
}

/**
 * Trusted Next proxy → accept the single IP Next forwarded.
 * Direct callers → ignore client-spoofable first-XFF / x-real-ip;
 * prefer cf-connecting-ip, else rightmost XFF hop (platform-appended).
 */
function resolveClientIp(req: Request, trustForwardedHeaders: boolean) {
  const cf = req.headers.get("cf-connecting-ip")?.trim() || "";
  const realIp = req.headers.get("x-real-ip")?.trim() || "";
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const parts = forwarded
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  if (trustForwardedHeaders) {
    return cf || realIp || parts[0] || "";
  }

  if (cf) return cf;
  if (parts.length > 0) return parts[parts.length - 1];
  return "";
}

async function verifyTurnstileToken(token: string, ip: string) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY")?.trim() || "";
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY missing on Edge Function");
    return {
      ok: false as const,
      error: "Security check unavailable. Please try again later.",
    };
  }
  if (!token) {
    return { ok: false as const, error: "Please complete the security check." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: AbortSignal.timeout(8000),
      }
    );

    const result = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!result.success) {
      console.error("Turnstile failed", result["error-codes"]);
      return {
        ok: false as const,
        error: "Security check failed. Please try again.",
      };
    }

    return { ok: true as const };
  } catch (err) {
    console.error("Turnstile verify error", err);
    return {
      ok: false as const,
      error: "Security check timed out. Please try again.",
    };
  }
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
    let sheetJson: {
      ok?: boolean;
      error?: string;
      row?: number;
      leadId?: string;
      service?: string;
    } = {};
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

  let sheetJson: {
    ok?: boolean;
    error?: string;
    row?: number;
    leadId?: string;
    service?: string;
  } = {};
  const text = await res.text();
  try {
    sheetJson = JSON.parse(text) as typeof sheetJson;
  } catch {
    // ignore non-JSON
  }

  return { res, sheetJson, text };
}

function runInBackground(task: () => Promise<unknown>) {
  const promise = task().catch((err) => {
    console.error("background task failed", err);
  });
  try {
    // Keeps the isolate alive after the HTTP response (does not delay the client).
    EdgeRuntime.waitUntil(promise);
  } catch {
    // Local CLI without waitUntil — still fire-and-forget so the response stays fast.
    void promise;
  }
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

  runInBackground(async () => {
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
      } else if (res.ok && sheetJson.ok === true && sheetJson.service) {
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
  });
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

    const trustedProxy = isTrustedNextProxy(req);
    const ip = resolveClientIp(req, trustedProxy);
    const turnstileToken = clean(body.turnstileToken);
    const turnstileSecret =
      Deno.env.get("TURNSTILE_SECRET_KEY")?.trim() || "";

    // Trusted Next proxy already verified Turnstile.
    // Legacy browser → Edge clients (no token yet): allow with Origin + rate limits
    // until the Next /api/submit-lead proxy is deployed.
    // When a token is present, always verify it.
    if (!trustedProxy && turnstileSecret && turnstileToken) {
      const turnstile = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstile.ok) {
        return json({ ok: false, error: turnstile.error }, 403, req);
      }
    } else if (
      !trustedProxy &&
      turnstileSecret &&
      !turnstileToken &&
      Deno.env.get("REQUIRE_TURNSTILE")?.trim() === "true"
    ) {
      return json(
        { ok: false, error: "Please complete the security check." },
        403,
        req
      );
    }

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
    const ipHash = await hashIp(ip);

    // Trusted Next proxy already rate-limits — skip DB count round-trips on that path.
    // Direct Edge callers still get IP + email limits (in parallel).
    if (!trustedProxy) {
      const sinceIso = new Date(
        now.getTime() - RATE_LIMIT_WINDOW_MS
      ).toISOString();

      const [ipResult, emailResult] = await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("created_at", sinceIso),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("email", email)
          .gte("created_at", sinceIso),
      ]);

      if (ipResult.error || emailResult.error) {
        console.error(ipResult.error || emailResult.error);
        return json(
          { ok: false, error: "Temporarily unavailable. Please try again." },
          503,
          req
        );
      }

      if ((ipResult.count ?? 0) >= RATE_LIMIT_MAX_PER_IP) {
        return json(
          { ok: false, error: "Too many submissions. Please try again later." },
          429,
          req
        );
      }

      if ((emailResult.count ?? 0) >= RATE_LIMIT_MAX_PER_EMAIL) {
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
    } else {
      const sheetSyncError = !sheetUrl
        ? "GOOGLE_SHEET_WEB_APP_URL not set in Edge Function secrets"
        : "SHEETS_WEBHOOK_SECRET not set in Edge Function secrets (must match Apps Script setWebhookSecret)";
      runInBackground(async () => {
        await supabase
          .from("leads")
          .update({ sheet_sync_error: sheetSyncError })
          .eq("id", lead.id);
      });
    }

    // Do not return lead UUID to anonymous clients.
    return json({ ok: true }, 200, req);
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: "Unexpected server error" }, 500, req);
  }
});
