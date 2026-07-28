export default function AboutApexSection() {
  return (
    <section className="about-apex-section" id="about-apex" aria-labelledby="about-apex-heading">
            <div className="wrap">
              <h2 id="about-apex-heading" className="about-apex-heading">
                Why Apex Union Exists
              </h2>
              <p className="about-apex-lead">
                Most programs give you slides, quizzes, and a piece of paper.
                Apex Union gives you a career.
              </p>
              <p className="about-apex-body">
                We don't do boring lectures. Every single class ends with a tangible,
                professional asset you can instantly show to employers.
              </p>

              <div className="about-assets-block">
                <h3 className="about-assets-heading">What You Will Build:</h3>
                <div className="about-assets-wheel" data-assets-wheel>
                  <div className="about-assets-wheel-layout">
                    <figure className="about-assets-chart-wrap">
                      <svg
                        className="about-assets-chart"
                        viewBox="0 0 240 240"
                        role="img"
                        aria-label="Interactive chart of five career assets you will build"
                      >
                        <defs data-assets-gradients>
                          <filter id="about-segment-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(81,15,17,0.4)" />
                          </filter>
                        </defs>
                        <g className="about-assets-segments" data-assets-segments></g>
                      </svg>
                      <figcaption className="about-assets-chart-center">
                        <span className="about-assets-chart-step" data-assets-step>01</span>
                        <span className="about-assets-chart-hint">Hover a segment</span>
                      </figcaption>
                    </figure>

                    <div className="about-assets-legend" data-assets-legend aria-label="Portfolio asset categories">
                      <span className="about-assets-legend-item is-active" data-asset-index="0" tabIndex={0}>Live Campaigns</span>
                      <span className="about-assets-legend-item" data-asset-index="1" tabIndex={0}>Sales Exercises</span>
                      <span className="about-assets-legend-item" data-asset-index="2" tabIndex={0}>Presentations</span>
                      <span className="about-assets-legend-item" data-asset-index="3" tabIndex={0}>Portfolio Assets</span>
                      <span className="about-assets-legend-item" data-asset-index="4" tabIndex={0}>Pro-Critiqued</span>
                    </div>

                    <div
                      className="about-assets-detail is-active"
                      data-assets-detail
                      role="region"
                      aria-live="polite"
                      aria-labelledby="about-asset-detail-title"
                    >
                      <p className="about-assets-detail-kicker">Portfolio Asset</p>
                      <h4 className="about-assets-detail-title" id="about-asset-detail-title" data-assets-title>
                        Live Campaigns
                      </h4>
                      <p className="about-assets-detail-text" data-assets-text>
                        Launch real strategies that drive actual growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="about-graduation-block">
                <h3 className="about-graduation-heading">🎓 The Apex Standard</h3>
                <p className="about-graduation-text">
                  By graduation, you won't leave with a binder of notes. You will exit with a
                  bulletproof portfolio and undeniable proof of work. Don't just tell companies
                  what you can do—show them.
                </p>
              </div>
            </div>
          </section>
  );
}
