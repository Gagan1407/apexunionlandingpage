export default function AdmissionSection() {
  return (
    <section
            className="admission-section"
            id="admission-process"
            aria-labelledby="admission-heading"
          >
            <div className="wrap">
              <h2 id="admission-heading" className="admission-heading">
                How to Apply for the <span className="admission-heading-accent">Programme</span>
              </h2>
              <p className="section-lead section-lead--dark">
                Three steps from webinar to offer.
              </p>
              <p className="programme-key-facts">
                Batch 1 · Indore (in-person) · Programme fee ₹8 lakh ·
                Merit scholarships up to 50% (selected candidates)
              </p>
              <div className="admission-timeline stagger-children" aria-label="Application steps">
                <article className="admission-card admission-card--step-1">
                  <span className="admission-card-watermark" aria-hidden="true">01</span>
                  <div className="admission-card-body">
                    <span className="admission-step">Step 01</span>
                    <h3 className="admission-card-title">Attend Webinar for Clarity</h3>
                    <p className="admission-card-intro">
                      Learn what the programme covers and what we expect from candidates.
                    </p>
                  </div>
                </article>

                <article className="admission-card admission-card--step-2">
                  <span className="admission-card-watermark" aria-hidden="true">02</span>
                  <div className="admission-card-body">
                    <span className="admission-step">Step 02</span>
                    <h3 className="admission-card-title">3 Rounds of Interviews with Founders</h3>
                    <p className="admission-card-intro">
                      Three founder-led rounds to assess fit and readiness.
                    </p>
                  </div>
                </article>

                <article className="admission-card admission-card--step-3">
                  <span className="admission-card-watermark" aria-hidden="true">03</span>
                  <div className="admission-card-body">
                    <span className="admission-step">Step 03</span>
                    <h3 className="admission-card-title">Offer &amp; possible merit scholarship</h3>
                    <p className="admission-card-intro">
                      Selected candidates may receive an offer; merit scholarships up to 50% are not automatic.
                    </p>
                  </div>
                </article>
              </div>
              <div className="admission-actions">
                <a className="btn btn-primary" href="#apply" data-lead-source="admission-cta">Apply Now</a>
              </div>
            </div>
          </section>
  );
}
