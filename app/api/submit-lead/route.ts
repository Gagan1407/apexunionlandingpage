import { NextResponse } from "next/server";
import {
  APEX_LEAD_PROXY_HEADER,
  getLeadProxySecret,
} from "@/lib/lead-proxy";
import { getSubmitLeadUrl, getSupabaseAnonKey } from "@/lib/public-env";
import { allowSubmitLeadRequest } from "@/lib/submit-lead-rate-limit";
import {
  getClientIp,
  getTurnstileSecretKey,
  verifyTurnstileToken,
} from "@/lib/turnstile-server";

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!allowSubmitLeadRequest(clientIp || "unknown")) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Please wait a few minutes and try again.",
      },
      { status: 429 }
    );
  }

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const turnstileToken = String(body.turnstileToken || "").trim();
  const secretKey = getTurnstileSecretKey();
  const proxySecret = getLeadProxySecret();

  if (!secretKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server missing TURNSTILE_SECRET_KEY. Add it to .env.local (not NEXT_PUBLIC).",
      },
      { status: 500 }
    );
  }

  if (!proxySecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Server missing LEAD_PROXY_SECRET (or TURNSTILE_SECRET_KEY fallback).",
      },
      { status: 500 }
    );
  }

  const verified = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: 403 }
    );
  }

  const submitUrl = getSubmitLeadUrl();
  const anon = getSupabaseAnonKey();
  if (!submitUrl || !anon) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Lead backend is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      },
      { status: 500 }
    );
  }

  // Token already consumed by siteverify — strip before Edge; prove via proxy header.
  const { turnstileToken: _token, ...leadFields } = body;
  void _token;

  const forwardHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    [APEX_LEAD_PROXY_HEADER]: proxySecret,
  };
  if (clientIp) {
    // Single hop set by Next — Edge trusts these only with valid proxy proof.
    forwardHeaders["x-forwarded-for"] = clientIp;
    forwardHeaders["x-real-ip"] = clientIp;
  }
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) forwardHeaders["cf-connecting-ip"] = cfIp;

  try {
    const upstream = await fetch(submitUrl, {
      method: "POST",
      headers: forwardHeaders,
      body: JSON.stringify(leadFields),
      // Lead insert should be fast; don't let a hung Edge isolate stall the form.
      signal: AbortSignal.timeout(15000),
    });

    let result: { ok?: boolean; error?: string } = { ok: upstream.ok };
    try {
      result = await upstream.json();
    } catch {
      // ignore
    }

    if (!upstream.ok || result.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || "Something went wrong. Please try again.",
        },
        { status: upstream.status || 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit-lead proxy failed", err);
    return NextResponse.json(
      { ok: false, error: "Could not reach lead service. Please try again." },
      { status: 502 }
    );
  }
}
