"use client";

import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";

const CONSENT_KEY = "apex_cookie_consent";

type ConsentValue = "accepted" | "rejected";

function subscribeConsent(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getConsentSnapshot() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function getServerConsentSnapshot() {
  return "ssr";
}

export default function CookieBanner() {
  const stored = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerConsentSnapshot
  );
  const [localChoice, setLocalChoice] = useState<ConsentValue | null>(null);

  const save = useCallback((value: ConsentValue) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore storage failures
    }
    setLocalChoice(value);
  }, []);

  const resolved = localChoice ?? stored;
  if (resolved === "ssr" || resolved === "accepted" || resolved === "rejected") {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <div className="cookie-banner-inner wrap">
        <p className="cookie-banner-text">
          We use cookies to run this site and, with your permission, to improve
          it. See our <Link href="/cookies">Cookie Policy</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="btn btn-outline cookie-banner-reject"
            onClick={() => save("rejected")}
          >
            Reject non-essential
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => save("accepted")}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
