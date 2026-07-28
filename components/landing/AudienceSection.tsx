export default function AudienceSection() {
  return (
    <section
            className="audience-section"
            id="who-is-this-for"
            aria-labelledby="who-is-this-for-heading"
          >
            <div className="wrap audience-wrap">
              <h2 id="who-is-this-for-heading" className="audience-heading">
                Who Is This Program <span className="audience-heading-accent">For?</span>
              </h2>
              <div className="audience-intro">
                <p className="audience-lead">Perfect for</p>
                <p className="audience-lead-sub">Five paths. One programme built for all of them.</p>
              </div>
              <ul className="audience-list stagger-children">
                <li className="audience-item">
                  <span className="audience-item-icon" aria-hidden="true">
                    <svg className="audience-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                      <path d="M6 10v4.5c0 1.8 2.7 3.5 6 3.5s6-1.7 6-3.5V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M22 8v5.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="audience-item-content">
                    <span className="audience-item-title">Final-year students</span>
                    <span className="audience-item-desc">Launch your sales career before graduation day</span>
                  </div>
                </li>
                <li className="audience-item">
                  <span className="audience-item-icon" aria-hidden="true">
                    <svg className="audience-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M12 11C12 7.5 8.5 5.5 5.5 7.5 8.5 9.5 9 12.5 12 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 11c0-3.5 3.5-5.5 6.5-3.5-3 2-3.5 5-6.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 22h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="audience-item-content">
                    <span className="audience-item-title">Fresh graduates</span>
                    <span className="audience-item-desc">Zero experience, but ready to learn and perform</span>
                  </div>
                </li>
                <li className="audience-item">
                  <span className="audience-item-icon" aria-hidden="true">
                    <svg className="audience-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 4h3v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 20H4v-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 4l-6.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M4 20l6.5-6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M14 4H9a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M10 20h5a4 4 0 0 0 4-4v-1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="audience-item-content">
                    <span className="audience-item-title">Career switchers</span>
                    <span className="audience-item-desc">Pivot into sales &amp; marketing with guided training</span>
                  </div>
                </li>
                <li className="audience-item">
                  <span className="audience-item-icon" aria-hidden="true">
                    <svg className="audience-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20V11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M10 20V6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M16 20v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M3 20h19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                      <path d="M7 11l3-3 3 2 4-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div className="audience-item-content">
                    <span className="audience-item-title">MBA aspirants</span>
                    <span className="audience-item-desc">Gain practical exposure beyond classroom theory</span>
                  </div>
                </li>
                <li className="audience-item audience-item--highlight">
                  <span className="audience-item-badge">Strongest fit</span>
                  <span className="audience-item-icon" aria-hidden="true">
                    <svg className="audience-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17l6-6 4 4 8-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 6h7v7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div className="audience-item-content">
                    <span className="audience-item-title">Early professionals</span>
                    <span className="audience-item-desc">Currently earning below ₹5 LPA and ready to level up</span>
                  </div>
                </li>
              </ul>
              <div className="audience-actions">
                <a
                  className="btn btn-primary"
                  href="#apply"
                  data-lead-source="audience-cta"
                  >Apply for Batch 1</a
                >
              </div>
            </div>
          </section>
  );
}
