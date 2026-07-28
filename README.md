# Apex Union Landing Page

Next.js 16 + TypeScript + Tailwind marketing site for Apex Union, with Supabase lead capture and an `/admin` dashboard.

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
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Public anon key (RLS protects data) |
| `NEXT_PUBLIC_SUBMIT_LEAD_URL` | `.env.local` | Edge Function URL for lead capture |
| `GOOGLE_SHEET_WEB_APP_URL` | **Supabase secret only** | Apps Script webhook URL — never `NEXT_PUBLIC_*` |
| `SHEETS_WEBHOOK_SECRET` | **Supabase secret + Apps Script** | Shared secret required on every Sheet write |

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
# In Google Apps Script: run setWebhookSecret("YOUR_SECRET") once, then redeploy the web app.

supabase secrets set \
  GOOGLE_SHEET_WEB_APP_URL=https://script.google.com/macros/s/…/exec \
  SHEETS_WEBHOOK_SECRET=YOUR_SECRET \
  --project-ref YOUR_PROJECT_REF

supabase functions deploy submit-lead
supabase functions deploy sync-enrollment
```

6. Set `NEXT_PUBLIC_SUBMIT_LEAD_URL` to the deployed `submit-lead` URL and restart the app.

## Google Sheets

1. Paste `google-sheets/Code.gs` into Apps Script.
2. Run `setupApexUnionLeadsSheet()`, `installLeadEditTrigger()`, and `setWebhookSecret("…")`.
3. Deploy as Web App (Execute as: Me, Who has access: Anyone) — access is gated by the webhook secret, not by obscurity.
4. Optionally run `setSupabaseSyncConfig(url, serviceRoleKey)` for Sheet → Supabase edits.

## Lead flow

Landing forms → `submit-lead` (validation + rate limits) → Supabase `leads` → authenticated Apps Script sync with `SHEETS_WEBHOOK_SECRET`.

Admin enrollment changes → `sync-enrollment` (admin JWT + `admin_users` check) → Supabase + Sheet.
