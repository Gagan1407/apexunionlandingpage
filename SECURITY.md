# Security runbook

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

5. Optional: set `ALLOWED_ORIGINS` to your production site origin(s), comma-separated, to lock CORS on `submit-lead`.

6. Smoke-test: submit a lead → row in Supabase → row in Sheet.

## History scrub

`google-sheets/Code.gs` is gitignored and removed from the `prod` history. After a history rewrite, collaborators must re-clone or hard-reset to the new tip.

## Never commit

- `SUPABASE_SERVICE_ROLE_KEY`
- `SHEETS_WEBHOOK_SECRET` / Apps Script secrets
- `GOOGLE_SHEET_WEB_APP_URL` as `NEXT_PUBLIC_*`
- Real `.env.local` files
