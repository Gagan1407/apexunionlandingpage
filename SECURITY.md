# Security runbook

## Admin access

Admin access is email/password plus the `admin_users` allowlist. Lead RLS uses `is_admin()`.
MFA is not enabled; protect the admin account with a strong unique password.

Authenticated clients may only **update** `enrollment_status` and sheet-sync metadata
columns on `leads` (enforced by trigger `leads_restrict_client_update`).

## Cloudflare Turnstile (required)

Lead forms → `POST /api/submit-lead` (Turnstile + Next rate limit) → Supabase
`submit-lead`. Edge accepts trusted `x-apex-lead-proxy` (uses `LEAD_PROXY_SECRET`,
falling back to `TURNSTILE_SECRET_KEY`) **or** a fresh Turnstile token for direct
callers. Edge **fails closed** if `TURNSTILE_SECRET_KEY` is missing.

Direct Edge callers cannot spoof rate-limit identity via first `X-Forwarded-For`;
only Cloudflare/`cf-connecting-ip` or the rightmost XFF hop is trusted unless the
request presents a valid Next proxy proof.

### Next host (`.env.local` / host env)

Rebuild after changing `NEXT_PUBLIC_*`:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET_KEY=your_secret_key
# Optional but recommended — dedicated Next↔Edge proxy proof (same value on Edge):
# LEAD_PROXY_SECRET=openssl_rand_hex_32
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

### Supabase Edge secrets (required)

```bash
# Generate a dedicated proxy secret (recommended):
#   openssl rand -hex 32

supabase secrets set \
  TURNSTILE_SECRET_KEY=your_secret_key \
  LEAD_PROXY_SECRET=your_proxy_secret \
  ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com,http://localhost:3000 \
  --project-ref YOUR_REF

supabase functions deploy submit-lead
supabase functions deploy sync-enrollment
```

Also set `LEAD_PROXY_SECRET` to the **same** value on the Next host.

- Site Key → public (`NEXT_PUBLIC_…`)
- Secrets → **server / Edge only** (no `NEXT_PUBLIC_`)
- `ALLOWED_ORIGINS` → required for browser CORS (admin enrollment sync)
- Never put `GOOGLE_SHEET_WEB_APP_URL` or `SHEETS_WEBHOOK_SECRET` in the frontend

## Google Sheets / Apps Script

- Webhook secret + web app URL live **only** in Supabase Edge secrets + Script Properties.
- `setSupabaseSyncConfig` stores `SUPABASE_SERVICE_ROLE_KEY` in Script Properties — that
  key bypasses RLS. Keep Sheet→Supabase sync **off** unless Sheet editors are trusted
  admins only. Prefer leaving `enableSheetToSupabaseSync()` disabled.

## Rotate Sheets webhook secret (required if ever committed)

The old secret that appeared in git history must be treated as **compromised forever**.

1. Generate a new secret (32+ bytes hex):

```bash
openssl rand -hex 32
```

2. In Google Apps Script (local `google-sheets/Code.gs`, not in git):

```javascript
setWebhookSecret("YOUR_NEW_SECRET")
```

3. Redeploy the Apps Script web app as a **new version**.

4. In Supabase → Edge Functions → Secrets:

```bash
supabase secrets set SHEETS_WEBHOOK_SECRET=YOUR_NEW_SECRET --project-ref YOUR_REF
supabase functions deploy submit-lead
supabase functions deploy sync-enrollment
```

5. Smoke-test: submit a lead → row in Supabase → row in Sheet.

## History scrub

`google-sheets/Code.gs` is gitignored and removed from the `prod` history. After a history rewrite, collaborators must re-clone or hard-reset to the new tip.

## Never commit

- `SUPABASE_SERVICE_ROLE_KEY`
- `SHEETS_WEBHOOK_SECRET` / Apps Script secrets
- `TURNSTILE_SECRET_KEY` / `LEAD_PROXY_SECRET`
- `GOOGLE_SHEET_WEB_APP_URL` as `NEXT_PUBLIC_*`
- Real `.env.local` files
