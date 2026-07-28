export default function FaqSection() {
  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-heading">
            <div className="wrap">
              <h2 id="faq-heading" className="faq-heading">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="section-lead section-lead--light">
                Still deciding? Here are the answers students ask before they apply.
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
                    Fresh graduates and early-career professionals (0-2 years
                    experience) who want to build a high-paying career in Sales or
                    Marketing. You don't need a sales or marketing background - you
                    need drive, curiosity, and a willingness to do real work.
                  </div>
                </article>

                <article className="faq-item">
                  <button
                    className="faq-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="faq-2"
                  >
                    2. What's the difference between Track A and Track B?
                  </button>
                  <div className="faq-panel" id="faq-2" hidden>
                    Track A (Sales &amp; BD) trains you for revenue-generating roles
                    - SDR, AE, BDR, Account Manager, Customer Success. Track B
                    (Marketing &amp; Growth) trains you for pipeline and brand roles
                    - Demand Gen, PMM, Performance, Growth. Track selection happens
                    at the end of Month 2 based on performance, aptitude, and your
                    career goals.
                  </div>
                </article>

                <article className="faq-item">
                  <button
                    className="faq-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="faq-3"
                  >
                    3. What are the target salaries after graduation?
                  </button>
                  <div className="faq-panel" id="faq-3" hidden>
                    Track A targets INR 10-25 LPA depending on company type and role
                    seniority. Track B targets INR 8-22 LPA. These are minimum
                    benchmarks - top performers from Batch 1 will be placed
                    aggressively.
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
                    No passive classroom. Every session produces a deliverable. You
                    will have 10+ real portfolio artifacts by graduation - a
                    prospecting list, a marketing plan, a GTM strategy, a CS audit,
                    and more. Mentors are practitioners, not lecturers. And we track
                    placements, not seat count.
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
                    12 months of teaching with Daily Live Classes (Mon-Fri),
                    followed by an internship with a partner company.
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
                    Every mentor at Apex Union is a practitioner with direct
                    experience in the role they teach. We do not use academic faculty
                    as primary teachers. Mentors are vetted for real outcomes - quota
                    attainment, campaigns they've run, revenue they've generated.
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
                    The programme fee covers all 12 Months of teaching, all mentor
                    sessions, all challenge reviews, the Career Launchpad placement
                    preparation month, and warm introductions to our hiring partner
                    network. No hidden costs.
                  </div>
                </article>

                <article className="faq-item">
                  <button
                    className="faq-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="faq-8"
                  >
                    8. What happens after the 12 Months?
                  </button>
                  <div className="faq-panel" id="faq-8" hidden>
                    Students enter a structured internship with a partner company
                    (Months 8-9), followed by a full-time placement. Our target is
                    100% placement in Track A or Track B roles within 60 days of
                    programme completion.
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
                    Yes. We offer merit-based scholarships for Batch 1 to recognise
                    exceptional candidates. Scholarship decisions are made at the time
                    of admission based on performance in the selection process.
                  </div>
                </article>

                <article className="faq-item">
                  <button
                    className="faq-toggle"
                    type="button"
                    aria-expanded="false"
                    aria-controls="faq-10"
                  >
                    10. What city is the programme based in?
                  </button>
                  <div className="faq-panel" id="faq-10" hidden>
                    Apex Union's Batch 1 campus is in Indore, Madhya Pradesh. This is
                    an in-person, residential-style programme. Students are expected
                    to attend in person for all sessions.
                  </div>
                </article>
              </div>
            </div>
          </section>
  );
}
