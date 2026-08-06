export default function ProgrammeStructureSection() {
  return (
    <section
      className="programme-structure-section"
      id="programme-structure"
      aria-labelledby="programme-structure-heading"
    >
      <div className="wrap">
        <h2
          id="programme-structure-heading"
          className="programme-structure-heading"
        >
          Programme Journey
        </h2>
        <p className="programme-structure-subheading">
          From Student to Job-Ready Professional in 12 Months
        </p>
        <p className="section-lead section-lead--dark">
          Here&apos;s how we take you from classroom to career-ready — with
          placement assistance along the way.
        </p>

        <div
          className="programme-structure-rows stagger-children"
          aria-label="Programme timeline"
        >
          <div className="programme-structure-row">
            <article className="programme-structure-card">
              <span className="programme-structure-step" aria-hidden="true">
                01
              </span>
              <div className="programme-structure-card-body">
                <div className="programme-structure-card-head">
                  <p className="programme-structure-phase">Foundation</p>
                </div>
                <p className="programme-structure-copy">
                  Business thinking, sales &amp; marketing fundamentals, tool
                  mastery. All students together before track selection.
                </p>
              </div>
            </article>
          </div>

          <div className="programme-structure-row">
            <article className="programme-structure-card">
              <span className="programme-structure-step" aria-hidden="true">
                02
              </span>
              <div className="programme-structure-card-body">
                <div className="programme-structure-card-head">
                  <p className="programme-structure-phase">Track A: Sales</p>
                </div>
                <p className="programme-structure-copy">
                  Outbound engine {"->"} Discovery &amp; Demo {"->"} Closing{" "}
                  {"->"} Account Mgmt &amp; CS {"->"} AI Sales + GTM
                </p>
              </div>
            </article>
          </div>

          <p className="programme-structure-or" aria-hidden="true">
            or
          </p>
          <span className="sr-only">or</span>

          <div className="programme-structure-row">
            <article className="programme-structure-card">
              <span className="programme-structure-step" aria-hidden="true">
                02
              </span>
              <div className="programme-structure-card-body">
                <div className="programme-structure-card-head">
                  <p className="programme-structure-phase">Track B: Marketing</p>
                </div>
                <p className="programme-structure-copy">
                  Positioning {"->"} Demand Gen {"->"} Product Marketing &amp;
                  ABM {"->"} Growth &amp; Performance {"->"} Analytics + AI
                </p>
              </div>
            </article>
          </div>

          <div className="programme-structure-row">
            <article className="programme-structure-card">
              <span className="programme-structure-step" aria-hidden="true">
                03
              </span>
              <div className="programme-structure-card-body">
                <div className="programme-structure-card-head">
                  <p className="programme-structure-phase">Internship</p>
                </div>
                <p className="programme-structure-copy">
                  Structured internship with a partner company. Defined role,
                  deliverable, and performance review.
                </p>
              </div>
            </article>
          </div>

          <div className="programme-structure-row">
            <article className="programme-structure-card programme-structure-card--final">
              <span className="programme-structure-step" aria-hidden="true">
                04
              </span>
              <div className="programme-structure-card-body">
                <div className="programme-structure-card-head">
                  <p className="programme-structure-phase">
                    Placement Support
                  </p>
                </div>
                <p className="programme-structure-copy">
                  Assisted introductions across our hiring partner network —
                  not a placement guarantee.
                </p>
              </div>
            </article>
          </div>
        </div>

        <div className="programme-daily-schedule" aria-label="Daily schedule">
          <p className="programme-daily-heading">Daily Schedule</p>
          <p className="programme-daily-copy">Daily Live Classes (Mon-Fri)</p>
        </div>
      </div>
    </section>
  );
}
