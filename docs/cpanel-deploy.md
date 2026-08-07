# cPanel Node.js App — one-time server setup
# ------------------------------------------
# 1) cPanel → Setup Node.js App
#    - Node version: 22 (or newest available >= 18)
#    - Application root: same path as CPANEL_REMOTE_PATH (e.g. /home/USER/apex-web)
#    - Application URL: your domain / subdomain
#    - Application startup file: server.js
#    - Mode: Production
#
# 2) In the app’s Environment Variables (cPanel UI), set:
#    NODE_ENV=production
#    PORT=          (cPanel usually injects this — don’t hardcode unless required)
#    HOSTNAME=0.0.0.0
#    TURNSTILE_SECRET_KEY=...
#    LEAD_PROXY_SECRET=...
#    (NEXT_PUBLIC_* are already baked into the GitHub-built bundle)
#
# 3) Create .env on the server ONLY if your host doesn’t support the UI env editor:
#    nano /home/USER/apex-web/.env
#
# 4) Add the GitHub deploy key’s PUBLIC key to:
#    ~/.ssh/authorized_keys   (cPanel → SSH Access → Manage SSH Keys)
#
# 5) After the first GitHub Actions deploy, open the site and check:
#    https://your-domain/api/health
#
# Restart (Passenger):
#    touch /home/USER/apex-web/tmp/restart.txt
