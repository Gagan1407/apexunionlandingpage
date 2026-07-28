export default function TruthSection() {
  return (
    <section className="truth-section" id="truth" aria-labelledby="truth-heading">
      <div className="wrap">
        <h2 id="truth-heading" className="truth-heading">
          Why Graduates Struggle to Get{" "}
          <span className="truth-heading-ananda">Sales &amp; Marketing</span> Jobs
        </h2>
        <p className="section-lead section-lead--dark">
          If any of this sounds like your story, you&apos;re not alone — and
          there&apos;s a better path.
        </p>

        <div className="truth-barriers" aria-label="Graduate job barriers">
          <div className="truth-barriers-grid stagger-children">
            <article className="truth-barrier-card">
              <aside className="truth-barrier-rail">
                <span className="truth-barrier-step">01</span>
                <span className="truth-barrier-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path
                      d="M8 20L24 12L40 20L24 28L8 20Z"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 23.5V31c0 2.8 4.5 5 10 5s10-2.2 10-5v-7.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 20v10.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="truth-barrier-impact">
                  <span className="truth-barrier-percent">78%</span>
                  <span className="truth-barrier-impact-label">Impact</span>
                </div>
              </aside>
              <div className="truth-barrier-body">
                <header className="truth-barrier-header">
                  <h3 className="truth-barrier-title">The Degree Trap</h3>
                  <p className="truth-barrier-hook">
                    Your degree doesn&apos;t prove you can sell
                  </p>
                </header>
                <div className="truth-barrier-card-copy">
                  <p>
                    You spent 3-4 years on a degree.{" "}
                    <strong>Companies still ask:</strong> &quot;But can you
                    sell?&quot;
                  </p>
                  <p>
                    <strong>MBA-style content, zero job outcomes.</strong> You
                    learn slides and frameworks but can&apos;t prove execution in
                    interviews.
                  </p>
                </div>
              </div>
            </article>

            <article className="truth-barrier-card">
              <aside className="truth-barrier-rail">
                <span className="truth-barrier-step">02</span>
                <span className="truth-barrier-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <path
                      d="M18 18a7 7 0 0 0-9.9 9.9l4.2 4.2"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M30 30a7 7 0 0 0 9.9-9.9l-4.2-4.2"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M20 28l8-8"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17 31l-2.5 2.5M33 15l2.5-2.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="truth-barrier-impact">
                  <span className="truth-barrier-percent">88%</span>
                  <span className="truth-barrier-impact-label">Impact</span>
                </div>
              </aside>
              <div className="truth-barrier-body">
                <header className="truth-barrier-header">
                  <h3 className="truth-barrier-title">The Skills Gap</h3>
                  <p className="truth-barrier-hook">
                    Frameworks in class. No pipeline in practice.
                  </p>
                </header>
                <div className="truth-barrier-card-copy">
                  <p>
                    College taught frameworks — not how to write a cold email,
                    run a discovery call, or build a pipeline.
                  </p>
                  <p>
                    <strong>Cold applications go nowhere.</strong> Without
                    proof-of-work and referrals, resumes get ignored by
                    recruiters.
                  </p>
                </div>
              </div>
            </article>

            <article className="truth-barrier-card">
              <aside className="truth-barrier-rail">
                <span className="truth-barrier-step">03</span>
                <span className="truth-barrier-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none">
                    <rect
                      x="14"
                      y="18"
                      width="20"
                      height="22"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    />
                    <path
                      d="M20 18v-3a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="29" r="2.2" fill="currentColor" />
                    <path
                      d="M24 31.2V34"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="truth-barrier-impact">
                  <span className="truth-barrier-percent">72%</span>
                  <span className="truth-barrier-impact-label">Impact</span>
                </div>
              </aside>
              <div className="truth-barrier-body">
                <header className="truth-barrier-header">
                  <h3 className="truth-barrier-title">The Network Gap</h3>
                  <p className="truth-barrier-hook">
                    No warm intros. No insider access.
                  </p>
                </header>
                <div className="truth-barrier-card-copy">
                  <p>
                    You don&apos;t know anyone at the companies you want to work
                    at. No warm intros. No insider access.
                  </p>
                  <p>
                    <strong>You need a network, not just notes.</strong> Career
                    growth is peer-driven and mentor-led, not solo YouTube
                    learning.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

        <h3 className="truth-subheading">
          Apex Union exists because we&apos;ve been there.{" "}
          <span className="truth-subheading-highlight">
            We built something better.
          </span>
        </h3>
      </div>
    </section>
  );
}
