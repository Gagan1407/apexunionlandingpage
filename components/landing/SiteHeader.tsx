import { APEX_BRAND_NAME, APEX_MARK_ALT, APEX_MARK_SRC } from "@/lib/brand";

export default function SiteHeader() {
  return (
    <>
      <header className="site-header">
        <div className="site-header-inner wrap">
          <a className="site-logo" href="#top">
            <img
              className="site-logo-mark"
              src={APEX_MARK_SRC}
              alt=""
              width={64}
              height={64}
              decoding="async"
              aria-hidden="true"
            />
            <span className="site-logo-text">{APEX_BRAND_NAME}</span>
            <span className="sr-only">{APEX_MARK_ALT}</span>
          </a>
          <div className="site-header-actions">
            <nav className="site-nav" aria-label="Primary">
              <a className="site-nav-link" href="#about-apex">
                About
              </a>
              <a className="site-nav-link" href="#programme-structure">
                Program
              </a>
              <a className="site-nav-link" href="#mentors">
                Mentors
              </a>
              <a className="site-nav-link" href="#mba-comparison">
                Why Apex
              </a>
              <a className="site-nav-link" href="#faq">
                FAQ
              </a>
            </nav>
            <a
              className="btn btn-primary btn-header-cta"
              href="#apply"
              data-lead-source="header-cta"
            >
              Apply Now
            </a>
          </div>
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label="Open navigation menu"
            aria-controls="mobile-sidebar"
            aria-expanded="false"
            data-open-mobile-nav
          >
            ☰
          </button>
        </div>
      </header>
      <div className="mobile-sidebar" id="mobile-sidebar" hidden>
        <button
          className="mobile-sidebar-backdrop"
          type="button"
          aria-label="Close menu"
          data-close-mobile-nav
        ></button>
        <aside className="mobile-sidebar-panel" aria-label="Mobile navigation">
          <button
            className="mobile-sidebar-close"
            type="button"
            data-close-mobile-nav
          >
            &times;
          </button>
          <nav className="mobile-sidebar-nav">
            <a href="#about-apex" data-close-mobile-nav>
              About
            </a>
            <a href="#programme-structure" data-close-mobile-nav>
              Program
            </a>
            <a href="#mentors" data-close-mobile-nav>
              Mentors
            </a>
            <a href="#mba-comparison" data-close-mobile-nav>
              Why Apex
            </a>
            <a href="#faq" data-close-mobile-nav>
              FAQ
            </a>
            <a
              className="btn btn-primary mobile-sidebar-cta"
              href="#apply"
              data-lead-source="mobile-nav-cta"
              data-close-mobile-nav
            >
              Apply Now
            </a>
          </nav>
        </aside>
      </div>
    </>
  );
}
