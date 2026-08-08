# Cloudflare SSL for apexunion.in

Visitor HTTPS comes from Cloudflare. Origin stays Contabo (`156.67.111.41`) with Apache → PM2.

## 1) Create API token (for the setup script)

1. Open [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. **Create Token** → use template **Edit zone DNS** (or custom):
   - Zone → Zone → Edit
   - Zone → DNS → Edit
   - Zone → Zone Settings → Edit
   - SSL and Certificates → Edit (if listed)
3. Zone Resources: **All zones** (or include `apexunion.in` after it exists)
4. Copy the token (shown once)

## 2) Add the site + configure SSL (automated)

From this repo on your Mac:

```bash
export CLOUDFLARE_API_TOKEN='paste-token-here'
chmod +x scripts/setup-cloudflare-zone.sh
./scripts/setup-cloudflare-zone.sh
```

The script will:
- Create/find zone `apexunion.in`
- Set proxied `A` records for `@` and `www` → `156.67.111.41`
- Set SSL mode **Full**
- Enable **Always Use HTTPS**
- Print Cloudflare **nameservers**

## 3) Point GoDaddy nameservers at Cloudflare (required)

Registrar is **GoDaddy** (current NS: `ind1.cyberelite.org` / `ind2.cyberelite.org`).

1. GoDaddy → **Domains** → **apexunion.in** → **Nameservers**
2. Choose **I'll use my own nameservers** / Custom
3. Replace with the two nameservers printed by the script (like `ada.ns.cloudflare.com` / `bob.ns.cloudflare.com`)
4. Save and wait until Cloudflare dashboard shows the zone **Active** (often minutes, sometimes up to a few hours)

## 4) Verify

```bash
dig +short NS apexunion.in @1.1.1.1   # should show *.ns.cloudflare.com
curl -sI https://apexunion.in/ | head  # should succeed without -k
echo | openssl s_client -servername apexunion.in -connect apexunion.in:443 2>/dev/null \
  | openssl x509 -noout -issuer
# issuer should NOT be CN=apexunion.in (self-signed)
```

Browser: padlock on `https://apexunion.in`.

## 5) App follow-up (after Active)

- Restore HSTS + `upgrade-insecure-requests` in `next.config.ts` and rebuild PM2
- Supabase `ALLOWED_ORIGINS` includes `https://apexunion.in`

## Notes

- SSL mode **Full** works with the current self-signed origin cert.
- Do not use **Flexible** if the origin redirects HTTP→HTTPS (redirect loops).
- Keep `.htaccess` proxy to `127.0.0.1:3010`.
