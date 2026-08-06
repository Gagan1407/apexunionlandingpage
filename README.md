# Apex Union Landing Page

Next.js 16 + TypeScript + Tailwind marketing site for Apex Union, with Supabase lead capture and an `/admin` dashboard.

Requires **Node.js 22+** (see `.nvmrc` / `package.json` `engines`).

## Branches & CI/CD

| Branch | Role |
|--------|------|
| `dev` | Developers push here — testing / staging |
| `prod` | Live production source (set Netlify/Vercel **Production branch** = `prod`) |
| `main` | Backup / stable copy of production |

**Flow:** `dev` → (test) → `prod` → (backup) → `main`

### GitHub Actions

| Workflow | When | What |
|----------|------|------|
| **3-Branch CI/CD Pipeline** (`ci-cd.yml`) | push/PR to `dev`, `prod`, `main` | lint → typecheck → test (if present) → build |
| **Docker** | push/PR to `dev` or `prod` | Build image + health smoke; **push to GHCR on `prod` only** |
| **Prod branch guard** | PRs into `prod` | Source branch must be `dev` |

On `main`, if there is no `package.json` (static backup), the Node build is skipped.

### Daily commands

```bash
# Develop
git checkout dev
# ... changes ...
git add . && git commit -m "New feature" && git push origin dev

# Promote to production (prefer a PR: base=prod, compare=dev)
git checkout prod
git merge dev
git push origin prod

# Backup production onto main
git checkout main
git merge prod
git push origin main
```

### GitHub repository secrets (for Docker prod images)

Settings → Secrets and variables → Actions:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUBMIT_LEAD_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_SITE_URL` (optional; defaults to `https://www.apexunion.com`)

Runtime secrets on the host (not baked into CI placeholders):

- `TURNSTILE_SECRET_KEY`
- `LEAD_PROXY_SECRET`

### Docker (local or VPS)

```bash
cp .env.example .env.docker
# fill NEXT_PUBLIC_* + TURNSTILE_SECRET_KEY + LEAD_PROXY_SECRET

npm run docker:build
npm run docker:up
# health: curl http://localhost:3000/api/health
```

Pull the published prod image on a server:

```bash
docker pull ghcr.io/<owner>/<repo>:prod
docker run -d --name apex-web -p 3000:3000 \
  -e TURNSTILE_SECRET_KEY=… \
  -e LEAD_PROXY_SECRET=… \
  ghcr.io/<owner>/<repo>:prod
```

## Deploy (any Next.js host)

```bash
npm ci
npm run build
npm run start
```

Set these **production** environment variables on your host (then rebuild — `NEXT_PUBLIC_*` are baked in at build time):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
| `NEXT_PUBLIC_SUBMIT_LEAD_URL` | `https://YOUR_PROJECT.supabase.co/functions/v1/submit-lead` (optional if URL above is set) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.yourdomain.com` (canonical URL for OG / robots / sitemap) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **site** key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret** key (server-only on the Next host) |

Point your custom domain DNS (A/CNAME) at the host, enable HTTPS, then open `/admin` and sign in with your Supabase Auth admin user.

## Local development

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_* + TURNSTILE_SECRET_KEY
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

Design styles live in `app/apex-legacy.css`. Tailwind is used for the admin UI and utilities only (preflight disabled so the landing look stays the same).

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` / host env | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` / host env | Public anon key (RLS protects data) |
| `NEXT_PUBLIC_SUBMIT_LEAD_URL` | `.env.local` / host env | Edge Function URL for lead capture |
| `NEXT_PUBLIC_SITE_URL` | `.env.local` / host env | Canonical site URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `.env.local` / host env | Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Next host **and** Supabase secrets | Verifies captcha (Next + Edge; fail-closed) |
| `ALLOWED_ORIGINS` | **Supabase secret (required for browser CORS)** | Comma-separated origins for Edge CORS |
| `GOOGLE_SHEET_WEB_APP_URL` | **Supabase secret only** | Apps Script webhook URL — never `NEXT_PUBLIC_*` |
| `SHEETS_WEBHOOK_SECRET` | **Supabase secret + Apps Script** | Shared secret on every Sheet write |

Health check: `GET /api/health`. Robots: `/robots.txt`. Sitemap: `/sitemap.xml`.

See `SECURITY.md` for Turnstile + webhook secret rotation.

## Supabase setup (once)

1. Create a Supabase project.
2. Apply the schema migration:
   - **New project:** apply `supabase/migrations/20260805000000_apex_schema.sql`.
   - **Already migrated from older split files:** do **not** re-run this as a fresh create if tables already exist — treat the squash as documentation / new environments only, or use `supabase migration repair` carefully.
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
  TURNSTILE_SECRET_KEY=your_turnstile_secret \
  ALLOWED_ORIGINS=https://www.yourdomain.com,https://yourdomain.com,http://localhost:3000 \
  GOOGLE_SHEET_WEB_APP_URL=https://script.google.com/macros/s/…/exec \
  SHEETS_WEBHOOK_SECRET=YOUR_NEW_SECRET \
  --project-ref YOUR_PROJECT_REF

supabase functions deploy submit-lead
supabase functions deploy sync-enrollment
```

Rotate immediately if any previous Sheets secret was committed to git.
6. Set `NEXT_PUBLIC_SUBMIT_LEAD_URL` + Turnstile keys on the Next host and restart/rebuild the app.

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

Landing forms → `POST /api/submit-lead` (Turnstile verify) → Edge `submit-lead`
(trusted Next proxy header **or** Turnstile + rate limits) → Supabase `leads` →
Apps Script sync with `SHEETS_WEBHOOK_SECRET`.

Admin enrollment changes → `sync-enrollment` (admin JWT + `admin_users` +
`ALLOWED_ORIGINS`) → Supabase + Sheet.
