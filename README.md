# Apex Union Landing Page

Next.js 16 + TypeScript + Tailwind marketing site for Apex Union, with Supabase lead capture and an `/admin` dashboard.

## Deploy on Netlify

1. Site settings → **Environment variables** → add (Production):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_SUBMIT_LEAD_URL` | `https://YOUR_PROJECT.supabase.co/functions/v1/submit-lead` (optional if URL above is set) |

2. **Redeploy** after saving vars (`NEXT_PUBLIC_*` are baked in at **build** time).
3. Build settings: use Next.js (this repo includes `netlify.toml`). Do **not** set Publish directory to `out` or `dist`.
4. Open `/admin` on the live site and sign in with your Supabase Auth admin user.

## Local development

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_* values
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Design styles live in `app/apex-legacy.css`. Tailwind is used for the admin UI and utilities only (preflight disabled so the landing look stays the same).

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / Netlify | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / Netlify | Public anon key (RLS protects data) |
| `NEXT_PUBLIC_SUBMIT_LEAD_URL` | `.env.local` / Netlify | Edge Function URL for lead capture |
| `GOOGLE_SHEET_WEB_APP_URL` | **Supabase secret only** | Apps Script webhook URL — never `NEXT_PUBLIC_*` |
| `SHEETS_WEBHOOK_SECRET` | **Supabase secret + Apps Script** | Shared secret required on every Sheet write |
| `ALLOWED_ORIGINS` | **Supabase secret (optional)** | Comma-separated site origins for `submit-lead` CORS |

Health check: `GET /api/health` (uptime monitors).

See `SECURITY.md` for webhook secret rotation.

## Supabase setup (once)

1. Create a Supabase project.
2. Apply migrations under `supabase/migrations/`.
3. Auth → create an email/password user for admin.
4. Insert allowlist row:

```sql
insert into public.admin_users (user_id, email)
values ('YOUR_AUTH_USER_UUID', 'you@example.com');
```

5. Generate a long random webhook secret (32+ chars), then set secrets and deploy:

```bash
# Generate: openssl rand -hex 32
# In Google Apps Script: run setWebhookSecret("YOUR_NEW_SECRET") once, then redeploy the web app.

supabase secrets set \
  GOOGLE_SHEET_WEB_APP_URL=https://script.google.com/macros/s/…/exec \
  SHEETS_WEBHOOK_SECRET=YOUR_NEW_SECRET \
  --project-ref YOUR_PROJECT_REF

supabase functions deploy submit-lead
supabase functions deploy sync-enrollment
```

Rotate immediately if any previous secret was committed to git.
6. Set `NEXT_PUBLIC_SUBMIT_LEAD_URL` to the deployed `submit-lead` URL and restart the app.

## Google Sheets

Apps Script source is local-only (`google-sheets/Code.gs` is gitignored). Keep your copy outside git or in Apps Script.

1. Paste your `Code.gs` into Apps Script (or open the existing project).
2. Run `setupApexUnionLeadsSheet()` and `installLeadEditTrigger()`.
3. Generate a **new** secret (`openssl rand -hex 32`). Do **not** reuse any secret that was ever committed to git.
4. Run `setWebhookSecret("YOUR_NEW_SECRET")` in Apps Script.
5. Deploy as Web App (Execute as: Me, Who has access: Anyone) — access is gated by the webhook secret.
6. Set the same secret as `SHEETS_WEBHOOK_SECRET` in Supabase, then redeploy `submit-lead` and `sync-enrollment`.
7. Optionally for Sheet → Supabase enrollment edits:
   - Restrict Sheet editors to trusted admins only
   - Run `setSupabaseSyncConfig(url, serviceRoleKey)`
   - Run `enableSheetToSupabaseSync()` (opt-in; disabled by default)

If an old secret was ever in the repo, treat it as compromised: rotate immediately and redeploy the web app (New version).

## Lead flow

Landing forms → `submit-lead` (validation + rate limits) → Supabase `leads` → authenticated Apps Script sync with `SHEETS_WEBHOOK_SECRET`.

Admin enrollment changes → `sync-enrollment` (admin JWT + `admin_users` check) → Supabase + Sheet.
