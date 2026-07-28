export default function ComparisonSection() {
  return (
    <section
            className="comparison-section"
            id="mba-comparison"
            aria-labelledby="comparison-heading"
          >
            <div className="wrap">
              <h2 id="comparison-heading" className="comparison-heading">
                Why choose <span className="comparison-heading-accent">Apex Union</span>
              </h2>
              <p className="comparison-kicker">MBA vs Apex</p>
              <p className="section-lead section-lead--light">
                Still weighing your options? Here's an honest side-by-side — no brochure fluff.
              </p>

              <div className="comparison-table-wrap table-scroll-wrap" role="region" aria-label="MBA vs Apex Union comparison">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th scope="col">Factor</th>
                      <th scope="col">Traditional MBA</th>
                      <th scope="col">Apex Union</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Primary Focus</th>
                      <td>Academic Business Education</td>
                      <td>Career Acceleration</td>
                    </tr>
                    <tr>
                      <th scope="row">Learning Style</th>
                      <td>Case Studies &amp; Theory</td>
                      <td>Real Projects &amp; Execution</td>
                    </tr>
                    <tr>
                      <th scope="row">Faculty</th>
                      <td>Professors &amp; Academics</td>
                      <td>Industry Practitioners</td>
                    </tr>
                    <tr>
                      <th scope="row">Industry Access</th>
                      <td>Limited Networking Events</td>
                      <td>Direct Mentor Relationships</td>
                    </tr>
                    <tr>
                      <th scope="row">Portfolio Building</th>
                      <td>Minimal</td>
                      <td>Built Throughout Program</td>
                    </tr>
                    <tr>
                      <th scope="row">Feedback</th>
                      <td>Exams &amp; Assignments</td>
                      <td>Industry Reviews &amp; Presentations</td>
                    </tr>
                    <tr>
                      <th scope="row">Placement Preparation</th>
                      <td>End of Program</td>
                      <td>Integrated Throughout</td>
                    </tr>
                    <tr>
                      <th scope="row">Hiring Access</th>
                      <td>Campus Process</td>
                      <td>Referrals &amp; Hiring Partner Network</td>
                    </tr>
                    <tr>
                      <th scope="row">Outcome</th>
                      <td>Degree</td>
                      <td>Skills + Portfolio + Industry Access</td>
                    </tr>
                    <tr>
                      <th scope="row">Relevance To Modern Roles</th>
                      <td>Varies</td>
                      <td>Designed Specifically For Sales &amp; Marketing Careers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="table-scroll-hint table-scroll-hint--dark">Scroll horizontally to view all columns</p>
              <div className="comparison-actions">
                <a
                  className="btn btn-primary"
                  href="#apply"
                  data-lead-source="comparison-cta"
                  >Book a Career Consultation</a
                >
              </div>
            </div>
          </section>
  );
}
