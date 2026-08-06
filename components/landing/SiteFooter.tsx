import Link from "next/link";
import Image from "next/image";
import { APEX_BRAND_NAME, APEX_MARK_ALT, APEX_MARK_SRC } from "@/lib/brand";

export default function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="wrap footer-layout">
          <div className="footer-brand">
            <a className="footer-logo-link" href="#top">
              <Image
                className="footer-logo-mark"
                src={APEX_MARK_SRC}
                alt=""
                width={64}
                height={64}
                loading="lazy"
                aria-hidden="true"
              />
              <span className="footer-logo-text">{APEX_BRAND_NAME}</span>
              <span className="sr-only">{APEX_MARK_ALT}</span>
            </a>
            <p className="footer-tagline">Where ambition meets industry.</p>
          </div>

          <div className="footer-columns">
            <div className="footer-col">
              <h3 className="footer-col-title">Address</h3>
              <p className="footer-text">
                Indore, Madhya Pradesh, India
              </p>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Contact</h3>
              <p className="footer-text">
                <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a>
              </p>
              <h3 className="footer-col-title footer-col-title--spaced">Social</h3>
              <ul className="footer-list">
                <li>
                  <a
                    href="https://www.linkedin.com/company/apex-union"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/apexxunion?igsh=MWVyZmQ4OTUydTFleA=="
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Quick Links</h3>
              <ul className="footer-list">
                <li>
                  <Link href="/#about-apex">About</Link>
                </li>
                <li>
                  <Link href="/#programme-structure">Program</Link>
                </li>
                <li>
                  <Link href="/#mba-comparison">Why Apex</Link>
                </li>
                <li>
                  <Link href="/#faq">FAQ</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Legal</h3>
              <ul className="footer-list">
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms &amp; Conditions</Link>
                </li>
                <li>
                  <Link href="/cookies">Cookies</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="wrap">
          <p className="footer-copyright">© 2026 Apex Union. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
