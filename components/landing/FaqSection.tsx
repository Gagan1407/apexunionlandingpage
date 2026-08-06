export default function FaqSection() {
  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
      <div className="wrap">
        <h2 id="faq-heading" className="faq-heading">
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <p className="section-lead section-lead--light">
          Still deciding? Here are clear answers — outcomes depend on effort,
          fit, and the market.
        </p>

        <div className="faq-accordion" data-faq-accordion>
          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-1"
            >
              1. Who should apply to Apex Union?
            </button>
            <div className="faq-panel" id="faq-1" hidden>
              Fresh graduates and early-career professionals (0–2 years
              experience) who want to build a career in Sales or Marketing. You
              don&apos;t need a sales or marketing background — you need drive,
              curiosity, and a willingness to do real work.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-2"
            >
              2. What&apos;s the difference between Track A and Track B?
            </button>
            <div className="faq-panel" id="faq-2" hidden>
              Track A (Sales &amp; BD) prepares you for revenue-focused roles
              such as SDR, AE, BDR, Account Manager, and Customer Success. Track
              B (Marketing &amp; Growth) prepares you for pipeline and brand roles
              such as Demand Gen, PMM, Performance, and Growth. Track selection
              happens after the Foundation phase based on performance, aptitude,
              and your goals.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-3"
            >
              3. What salary outcomes can I expect?
            </button>
            <div className="faq-panel" id="faq-3" hidden>
              We coach toward competitive Track A and Track B packages based on
              role, company type, and your performance. Any figures discussed in
              counselling are guidance only — not guaranteed offers. Results vary
              with effort, fit, and market conditions.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-4"
            >
              4. What makes Apex Union different from other MBA programmes?
            </button>
            <div className="faq-panel" id="faq-4" hidden>
              Sessions are built around deliverables, not passive lectures. You
              work toward a portfolio of real artifacts (for example prospecting
              lists, marketing plans, GTM work, and CS reviews). Mentors are
              industry practitioners. We support placement readiness — we do not
              sell seat-count guarantees.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-5"
            >
              5. What is the programme duration and schedule?
            </button>
            <div className="faq-panel" id="faq-5" hidden>
              The programme runs for 12 months, with daily live classes
              (Mon–Fri), plus internship and placement support as part of the
              same journey.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-6"
            >
              6. How are mentors selected?
            </button>
            <div className="faq-panel" id="faq-6" hidden>
              Mentors are practitioners with experience in the roles they teach.
              Academic faculty are not used as primary teachers. We look for
              people with hands-on industry experience — campaigns run, deals
              closed, or revenue owned — not just theory.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-7"
            >
              7. What does the INR 8 lakh programme fee include?
            </button>
            <div className="faq-panel" id="faq-7" hidden>
              The programme fee is INR 8 lakh for the full 12-month journey. It
              includes teaching, mentor sessions, challenge reviews, Career
              Launchpad placement preparation, and introductions across our
              hiring partner network. No hidden costs. Merit scholarships (up to
              50%) may apply for selected Batch 1 candidates after the admission
              process — scholarships are not automatic.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-8"
            >
              8. How does internship and placement work?
            </button>
            <div className="faq-panel" id="faq-8" hidden>
              Within the 12-month programme, students complete a structured
              internship with a partner company, then receive assisted full-time
              placement support and introductions toward Track A or Track B roles.
              Placement is assisted — not guaranteed.
            </div>
          </article>

          <article className="faq-item">
            <button
              className="faq-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="faq-9"
            >
              9. Is there a scholarship?
            </button>
            <div className="faq-panel" id="faq-9" hidden>
              Yes. Merit-based scholarships are available for Batch 1. Awards
              depend on performance in the selection process and are decided at
              admission — not promised before you apply.
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
