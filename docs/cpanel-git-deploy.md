# Deploy Apex Union via cPanel Git™ Version Control (SSH port 1012)

Single path: commit on **`dev`** → GitHub Actions tests → promote to **`prod`** + **`main`** → SSH into cPanel (port **1012**) → `git pull` **`prod`** → run `.cpanel.yml` deploy.

## One-time cPanel setup

### 1) Create Node.js App
cPanel → **Setup Node.js App** → Create:

| Field | Value |
|--------|--------|
| Application root | e.g. `apex-web` (`/home/USER/apex-web`) |
| Application URL | your domain |
| Application startup file | `.next/standalone/server.js` |
| Node version | **22** (or newest available) |
| Mode | Production |

**Environment variables** (Node app UI or server `.env` — never commit):

```env
NODE_ENV=production
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUBMIT_LEAD_URL=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain
TURNSTILE_SECRET_KEY=...
LEAD_PROXY_SECRET=...
```

### 2) Point `.cpanel.yml` at your Node bin dir
After creating the app, note the virtualenv path (e.g. `/home/USER/nodevenv/apex-web/22/bin`), set `NODE_BIN_DIR` in `.cpanel.yml`, commit on `dev`.

### 3) Clone with Git™ Version Control
cPanel → **Git™ Version Control** → **Create**:

| Field | Value |
|--------|--------|
| Clone URL | `https://github.com/Gagan1407/apexunionlandingpage.git` (or SSH clone if private) |
| Repository Path | **same as Application root** |
| Repository Name | e.g. `apex-web` |

Then checkout / track branch **`prod`**.

### 4) Enable SSH (port 1012)
1. cPanel → **SSH Access** → generate or import key; authorize the public key.
2. Confirm you can connect: `ssh -p 1012 USER@HOST`
3. Add the **private** key as GitHub secret `CPANEL_SSH_PRIVATE_KEY`.

### 5) GitHub Actions secrets
Settings → Secrets and variables → Actions:

| Secret | Example |
|--------|---------|
| `CPANEL_SSH_HOST` | server hostname or IP |
| `CPANEL_SSH_USER` | cPanel username |
| `CPANEL_SSH_PRIVATE_KEY` | full private key PEM |
| `CPANEL_REMOTE_PATH` | `/home/USER/apex-web` |
| `CPANEL_SSH_PORT` | `1012` (optional; pipeline defaults to 1012) |
| `PROMOTE_TOKEN` | PAT with `repo` if `prod`/`main` are protected |

Optional: `CPANEL_DEPLOY_CMD` to override the remote deploy command.

Create a GitHub **Environment** named `production` if prompted by the deploy job.

### 6) SSL + smoke test
Enable AutoSSL. Check:

- `https://your-domain/`
- `https://your-domain/api/health`

## Everyday updates

```text
git push origin dev
        ↓
CI: lint → typecheck → build
        ↓ (on success)
promote: push same SHA → prod + main
        ↓
SSH :1012 → git pull prod → .cpanel.yml / uapi deploy → restart
```

Do **not** push directly to `prod` or `main` for releases — let the pipeline promote from `dev`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| SSH connection refused | Confirm port **1012**, firewall, and authorized key |
| `npm: command not found` | Fix `NODE_BIN_DIR` in `.cpanel.yml` |
| Build missing env | Set vars in Node app UI or server `.env` |
| Site blank / 503 | Startup file = `.next/standalone/server.js`, then Restart |
| Promote push denied | Add `PROMOTE_TOKEN` (PAT) or loosen branch protection for Actions |
| Git pull auth errors | Prefer HTTPS public clone, or register a deploy key on GitHub |
