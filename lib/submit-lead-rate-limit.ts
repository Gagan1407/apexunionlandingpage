/**
 * Lightweight in-process rate limit for /api/submit-lead.
 * Defense in depth alongside Edge limits (not shared across serverless instances).
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;

const hitsByKey = new Map<string, number[]>();

export function allowSubmitLeadRequest(key: string): boolean {
  const id = key.trim() || "unknown";
  const now = Date.now();
  const recent = (hitsByKey.get(id) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hitsByKey.set(id, recent);
    return false;
  }
  recent.push(now);
  hitsByKey.set(id, recent);
  return true;
}
