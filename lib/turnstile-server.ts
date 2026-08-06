/** Server-only Turnstile helpers. Never import from client components. */

export function getTurnstileSecretKey() {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || "";
}

export async function verifyTurnstileToken(token: string, ip?: string) {
  const secret = getTurnstileSecretKey();
  if (!secret) {
    return {
      ok: false as const,
      error:
        "Turnstile is not configured on the server. Set TURNSTILE_SECRET_KEY in .env.local.",
    };
  }
  if (!token.trim()) {
    return {
      ok: false as const,
      error: "Please complete the security check before submitting.",
    };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token.trim());
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
      console.error("Turnstile verify failed", result["error-codes"]);
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

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    forwarded.split(",")[0]?.trim() ||
    ""
  );
}
