import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const outPath = join(root, "config.local.js");

function parseEnvFile(contents) {
  const values = {};

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

if (!existsSync(envPath)) {
  console.error("Missing .env.local — copy .env.example and add your Web App URL.");
  process.exit(1);
}

const env = parseEnvFile(readFileSync(envPath, "utf8"));
const url = env.GOOGLE_SHEET_WEB_APP_URL || "";

const output = `/** Generated from .env.local — do not edit by hand */
window.APEX_CONFIG = Object.assign(window.APEX_CONFIG || {}, {
  GOOGLE_SHEET_WEB_APP_URL: ${JSON.stringify(url)},
});
`;

writeFileSync(outPath, output, "utf8");
console.log(`Wrote config.local.js${url ? "" : " (GOOGLE_SHEET_WEB_APP_URL is empty)"}`);
