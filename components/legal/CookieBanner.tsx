"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "apex_cookie_consent";

type ConsentValue = "accepted" | "rejected";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function save(value: ConsentValue) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore storage failures
    }
    setVisible(false);
  }

  if (!visible) return null;

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
