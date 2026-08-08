#!/usr/bin/env bash
# Create/configure Cloudflare zone for apexunion.in (SSL Full + Always HTTPS).
# Requires: CLOUDFLARE_API_TOKEN with Zone.Zone Edit, Zone.DNS Edit, Zone.SSL Edit
# Optional: CLOUDFLARE_ACCOUNT_ID
set -euo pipefail

DOMAIN="${CF_DOMAIN:-apexunion.in}"
ORIGIN_IP="${CF_ORIGIN_IP:-156.67.111.41}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-}}"

if [ -z "$API_TOKEN" ]; then
  echo "Missing CLOUDFLARE_API_TOKEN (or CF_API_TOKEN)."
  echo "Create a token at https://dash.cloudflare.com/profile/api-tokens"
  echo "Permissions: Zone:Read/Edit, DNS:Edit, Zone Settings:Edit, SSL and Certificates:Edit"
  exit 1
fi

auth_hdr=(-H "Authorization: Bearer ${API_TOKEN}" -H "Content-Type: application/json")

echo "=== Verify token ==="
curl -fsS "${auth_hdr[@]}" https://api.cloudflare.com/client/v4/user/tokens/verify | tee /tmp/cf-verify.json
python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-verify.json"))
assert d.get("success"), d
print("token ok:", d["result"]["status"])
PY

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
if [ -z "$ACCOUNT_ID" ]; then
  curl -fsS "${auth_hdr[@]}" "https://api.cloudflare.com/client/v4/accounts?per_page=50" > /tmp/cf-accounts.json
  ACCOUNT_ID=$(python3 - <<'PY'
import json, sys
d=json.load(open("/tmp/cf-accounts.json"))
assert d.get("success"), d
accts=d["result"]
if not accts:
    raise SystemExit("No Cloudflare accounts visible to this token")
print("Using account:", accts[0].get("name"), file=sys.stderr)
print(accts[0]["id"])
PY
)
fi

echo "=== Find or create zone ${DOMAIN} ==="
curl -fsS "${auth_hdr[@]}" \
  "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" > /tmp/cf-zones.json
ZONE_ID=$(python3 - <<PY
import json, urllib.request, os
d=json.load(open("/tmp/cf-zones.json"))
assert d.get("success"), d
zones=d["result"]
if zones:
    print(zones[0]["id"])
else:
    print("")
PY
)

if [ -z "$ZONE_ID" ]; then
  echo "Creating zone..."
  curl -fsS "${auth_hdr[@]}" -X POST "https://api.cloudflare.com/client/v4/zones" \
    --data "{\"name\":\"${DOMAIN}\",\"account\":{\"id\":\"${ACCOUNT_ID}\"},\"type\":\"full\"}" \
    > /tmp/cf-zone-create.json
  ZONE_ID=$(python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-zone-create.json"))
assert d.get("success"), d
print(d["result"]["id"])
PY
)
fi
echo "ZONE_ID=${ZONE_ID}"

curl -fsS "${auth_hdr[@]}" "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}" > /tmp/cf-zone.json
python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-zone.json"))
assert d.get("success"), d
r=d["result"]
print("status:", r["status"])
print("nameservers:")
for ns in r.get("name_servers") or r.get("original_name_servers") or []:
    print(" ", ns)
open("/tmp/cf-nameservers.txt","w").write("\n".join(r.get("name_servers") or [])+"\n")
PY

upsert_a() {
  local name="$1"
  local fqdn="$2"
  curl -fsS "${auth_hdr[@]}" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${fqdn}" \
    > /tmp/cf-dns-lookup.json
  local rid
  rid=$(python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-dns-lookup.json"))
assert d.get("success"), d
print(d["result"][0]["id"] if d["result"] else "")
PY
)
  local payload
  payload=$(printf '{"type":"A","name":"%s","content":"%s","ttl":1,"proxied":true}' "$name" "$ORIGIN_IP")
  if [ -n "$rid" ]; then
    echo "Updating A ${fqdn} -> ${ORIGIN_IP} (proxied)"
    curl -fsS "${auth_hdr[@]}" -X PUT \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${rid}" \
      --data "$payload" > /tmp/cf-dns-put.json
  else
    echo "Creating A ${fqdn} -> ${ORIGIN_IP} (proxied)"
    curl -fsS "${auth_hdr[@]}" -X POST \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
      --data "$payload" > /tmp/cf-dns-put.json
  fi
  python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-dns-put.json"))
assert d.get("success"), d
print(" ok:", d["result"]["name"], d["result"]["content"], "proxied=", d["result"]["proxied"])
PY
}

echo "=== DNS A records (proxied) ==="
upsert_a "@" "$DOMAIN"
upsert_a "www" "www.${DOMAIN}"

echo "=== SSL mode Full ==="
curl -fsS "${auth_hdr[@]}" -X PATCH \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ssl" \
  --data '{"value":"full"}' > /tmp/cf-ssl.json
python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-ssl.json"))
assert d.get("success"), d
print("ssl:", d["result"]["value"])
PY

echo "=== Always Use HTTPS on ==="
curl -fsS "${auth_hdr[@]}" -X PATCH \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/always_use_https" \
  --data '{"value":"on"}' > /tmp/cf-https.json
python3 - <<'PY'
import json
d=json.load(open("/tmp/cf-https.json"))
assert d.get("success"), d
print("always_use_https:", d["result"]["value"])
PY

echo ""
echo "=== NEXT STEP (required at GoDaddy) ==="
echo "Replace nameservers for ${DOMAIN} with:"
cat /tmp/cf-nameservers.txt
echo ""
echo "GoDaddy → Domains → ${DOMAIN} → Nameservers → Change → Custom"
echo "After Cloudflare shows status Active, https://${DOMAIN} should show a trusted padlock."
