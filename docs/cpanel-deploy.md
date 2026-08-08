# cPanel Node.js App — companion notes (SSH port 1012)

Primary guide: [`cpanel-git-deploy.md`](./cpanel-git-deploy.md).

## SSH

```bash
ssh -p 1012 USER@HOST
```

Authorize the deploy public key in cPanel → **SSH Access** → Manage SSH Keys → Authorize.
Store the matching private key in GitHub secret `CPANEL_SSH_PRIVATE_KEY`.

## Node.js App checklist

1. Application root = Git repo path (`CPANEL_REMOTE_PATH`)
2. Startup file: `.next/standalone/server.js`
3. Mode: Production
4. Env: `NODE_ENV`, `HOSTNAME=0.0.0.0`, all `NEXT_PUBLIC_*`, `TURNSTILE_SECRET_KEY`, `LEAD_PROXY_SECRET`

## Manual restart

```bash
touch /home/USER/apex-web/tmp/restart.txt
```

## Manual pull + deploy (if Actions is down)

```bash
ssh -p 1012 USER@HOST
cd ~/apex-web
git fetch origin && git checkout prod && git pull --ff-only origin prod
# Then Deploy HEAD in Git™ Version Control, or:
uapi VersionControlDeployment create repository_root=$HOME/apex-web
```
