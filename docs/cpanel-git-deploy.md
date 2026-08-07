# Deploy Apex Union to cPanel with Git™ Version Control (no GitHub SSH)

This path is for hosts where outbound SSH to the server is blocked.
The **server pulls** from GitHub; a `.cpanel.yml` hook builds Next.js on the server.

## One-time setup

### 1) Create Node.js App
cPanel → **Setup Node.js App** → Create:

| Field | Value |
|--------|--------|
| Application root | e.g. `apex-web` (cPanel will use `/home/apexunion/apex-web`) |
| Application URL | `apexunion.in` |
| Application startup file | `.next/standalone/server.js` |
| Node version | **22** (or newest available) |
| Mode | Production |

**Environment variables** (in the Node app UI):

```env
NODE_ENV=production
HOSTNAME=0.0.0.0
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUBMIT_LEAD_URL=...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
NEXT_PUBLIC_SITE_URL=https://apexunion.in
TURNSTILE_SECRET_KEY=...
LEAD_PROXY_SECRET=...
```

`NEXT_PUBLIC_*` must exist **before** the first build (hook reads them from the app env / `.env`).

Optional: create `/home/apexunion/apex-web/.env` with the same vars (never commit this file).

### 2) Point `.cpanel.yml` at your Node bin dir
After creating the Node app, open **Setup Node.js App** → your app → note the
virtual environment path (often shown near “npm” / “Detected” tools), e.g.:

`/home/apexunion/nodevenv/apex-web/22/bin`

Edit `.cpanel.yml` and set `NODE_BIN_DIR` to that path. Commit and push to `prod`.

### 3) Clone the repo with Git™ Version Control
cPanel → **Git™ Version Control** → **Create**:

| Field | Value |
|--------|--------|
| Clone URL | `https://github.com/Gagan1407/apexunionlandingpage.git` |
| Repository Path | **same as Application root** (`apex-web`) |
| Repository Name | `apex-web` |

Then:

1. Open the repo in Git Version Control  
2. Change branch to **`prod`** (checkout / pull `prod`)  
3. Click **Update from Remote** / **Pull or Deploy**

The first deploy runs `.cpanel.yml` → `npm ci` → `npm run build` → copies standalone assets → `tmp/restart.txt`.

### 4) SSL + DNS
DNS already points here. Enable **AutoSSL** for `apexunion.in` + `www`.

### 5) Smoke test
- https://apexunion.in  
- https://apexunion.in/api/health  

## Everyday updates

```text
push to prod (via PR from dev)
        ↓
in cPanel Git UI → Pull or Deploy   (or enable auto-deploy if available)
        ↓
.cpanel.yml builds + restarts Node app
```

This is **semi-automatic**: GitHub CI still tests on push; **going live on cPanel** is a Pull/Deploy click unless your host supports deploy-on-push webhooks.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm: command not found` in deploy | Fix `NODE_BIN_DIR` in `.cpanel.yml` |
| Build missing env | Set vars in Node app UI or `.env` on server |
| Site blank / 503 | Confirm startup file is `.next/standalone/server.js`, then **Restart** in Node.js App |
| Git pull auth errors | Repo is public — use HTTPS clone URL above |

## vs GitHub Actions SSH
| | Git Version Control | Actions SSH |
|--|---------------------|-------------|
| Needs open SSH port | No | Yes |
| Build location | cPanel server | GitHub runner |
| Deploy trigger | Pull/Deploy in cPanel | Automatic on `prod` push |
