import Image from "next/image";
import { CLD_PHOTO, withCloudinaryTransform } from "@/lib/cloudinary";

export default function MentorsSection() {
  return (
    <section className="mentors-section" id="mentors" aria-labelledby="mentors-heading">
            <div className="wrap">
              <h2 id="mentors-heading" className="mentors-heading">
                Learn from <span className="optima-gradient-text">Industry Experts</span>
              </h2>
              <p className="mentors-subheading">
                Learn from people who are doing it right now. Every mentor at Apex
                Union holds a role that our students are targeting. No academics. No
                retired professionals. Just practitioners who are building pipelines
                and brands today.
              </p>

              <div className="mentor-grid stagger-children" aria-label="Mentor profiles">
                <article className="mentor-profile-card mentor-profile-card--left" data-track="Sales">
                  <div className="mentor-profile-media">
                    <Image
                      className="mentor-photo"
                      src={withCloudinaryTransform(
                        "https://res.cloudinary.com/dz1681irz/image/upload/v1785175867/Saurabh_Sengupta_zk5ra4.jpg",
                        CLD_PHOTO
                      )}
                      alt="Portrait of Saurabh SenGupta"
                      width={400}
                      height={500}
                      sizes="(max-width: 767px) 90vw, 360px"
                    />
                    <span className="mentor-track-badge">Track: Sales</span>
                  </div>
                  <div className="mentor-profile-body">
                    <header className="mentor-profile-header">
                      <h3 className="mentor-name">Saurabh SenGupta</h3>
                      <p className="mentor-role-line">
                        <span className="mentor-role">Ex VP</span>
                        <span className="mentor-role-separator" aria-hidden="true">·</span>
                        <span className="mentor-company">Zomato</span>
                      </p>
                    </header>
                    <p className="mentor-one-liner">
                      Ex VP at Zomato and one of the early architects of its sales engine.
                    </p>
                    <div className="mentor-profile-details">
                      <div className="mentor-expertise">
                        <p className="mentor-expertise-label">Expertise</p>
                        <p className="mentor-expertise-text">
                          Enterprise sales, GTM strategy, scaling revenue teams, B2B &amp; B2C
                          growth.
                        </p>
                        <a
                          className="mentor-linkedin"
                          href="https://www.linkedin.com/in/saurabhsengupta/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Saurabh SenGupta on LinkedIn"
                        >
                          <span className="mentor-linkedin-icon" aria-hidden="true">in</span>
                          <span>View on LinkedIn</span>
                        </a>
                      </div>
                      <p className="mentor-bio">
                        Saurabh was the 12th employee at Zomato and rose to become Vice President.
                        He has seen what it takes to build revenue from nothing to scale across every
                        growth stage. At Apex Union he teaches how deals actually get done at
                        high-growth companies and what separates a great salesperson from a great
                        revenue leader.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="mentor-profile-card mentor-profile-card--right" data-track="Sales">
                  <div className="mentor-profile-body">
                    <header className="mentor-profile-header">
                      <h3 className="mentor-name">Adhish Rane</h3>
                      <p className="mentor-role-line">
                        <span className="mentor-role">Global Enablement Head</span>
                        <span className="mentor-role-separator" aria-hidden="true">·</span>
                        <span className="mentor-company">Google</span>
                      </p>
                    </header>
                    <p className="mentor-one-liner">
                      Leads global sales enablement at Google across teams worldwide.
                    </p>
                    <div className="mentor-profile-details">
                      <div className="mentor-expertise">
                        <p className="mentor-expertise-label">Expertise</p>
                        <p className="mentor-expertise-text">
                          Sales enablement, GTM execution, global team readiness, training at scale.
                        </p>
                        <a
                          className="mentor-linkedin"
                          href="https://www.linkedin.com/in/adhishrane/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Adhish Rane on LinkedIn"
                        >
                          <span className="mentor-linkedin-icon" aria-hidden="true">in</span>
                          <span>View on LinkedIn</span>
                        </a>
                      </div>
                      <p className="mentor-bio">
                        Adhish is responsible for making sure thousands of salespeople are equipped to
                        sell effectively. He brings a systems-level view of how world-class companies
                        train, enable, and scale sales teams. His sessions on building a sales playbook
                        and structuring how you learn sales are unlike anything students find elsewhere.
                      </p>
                    </div>
                  </div>
                  <div className="mentor-profile-media">
                    <Image
                      className="mentor-photo"
                      src={withCloudinaryTransform(
                        "https://res.cloudinary.com/dz1681irz/image/upload/v1785241672/Adhish_Rane_zpsb7n_jfogoc.png",
                        CLD_PHOTO
                      )}
                      alt="Portrait of Adhish Rane"
                      width={400}
                      height={500}
                      sizes="(max-width: 767px) 90vw, 360px"
                    />
                    <span className="mentor-track-badge">Track: Sales</span>
                  </div>
                </article>

                <article className="mentor-profile-card mentor-profile-card--left" data-track="Marketing">
                  <div className="mentor-profile-media">
                    <Image
                      className="mentor-photo"
                      src={withCloudinaryTransform(
                        "https://res.cloudinary.com/dz1681irz/image/upload/v1785175867/Vipul_Maini_s7mthh.jpg",
                        CLD_PHOTO
                      )}
                      alt="Portrait of Vipul Maini"
                      width={400}
                      height={500}
                      sizes="(max-width: 767px) 90vw, 360px"
                    />
                    <span className="mentor-track-badge">Track: Marketing</span>
                  </div>
                  <div className="mentor-profile-body">
                    <header className="mentor-profile-header">
                      <h3 className="mentor-name">Vipul Maini</h3>
                      <p className="mentor-role-line">
                        <span className="mentor-role">Director, Demand Generation</span>
                        <span className="mentor-role-separator" aria-hidden="true">·</span>
                        <span className="mentor-company">Cvent</span>
                      </p>
                    </header>
                    <p className="mentor-one-liner">
                      Builds and scales demand generation systems at Cvent.
                    </p>
                    <div className="mentor-profile-details">
                      <div className="mentor-expertise">
                        <p className="mentor-expertise-label">Expertise</p>
                        <p className="mentor-expertise-text">
                          B2B demand generation, marketing automation, Marketo, Salesforce, ABM,
                          campaign strategy.
                        </p>
                        <a
                          className="mentor-linkedin"
                          href="https://www.linkedin.com/in/vipul-maini/"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Vipul Maini on LinkedIn"
                        >
                          <span className="mentor-linkedin-icon" aria-hidden="true">in</span>
                          <span>View on LinkedIn</span>
                        </a>
                      </div>
                      <p className="mentor-bio">
                        Vipul has spent 10+ years building and scaling demand generation at Cvent. He
                        owns the full funnel from top-of-funnel awareness to MQL generation,
                        attribution, and pipeline reporting. Students learn the systems, tools, and
                        metrics that matter when demand gen works at scale.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="mentor-profile-card mentor-profile-card--right" data-track="Sales">
                  <div className="mentor-profile-body">
                    <header className="mentor-profile-header">
                      <h3 className="mentor-name">Srivardhan Vanamalai</h3>
                      <p className="mentor-role-line">
                        <span className="mentor-role">Ex AE</span>
                        <span className="mentor-role-separator" aria-hidden="true">·</span>
                        <span className="mentor-company">Loop Subscriptions</span>
                      </p>
                    </header>
                    <p className="mentor-one-liner">
                      Ex Account Executive focused on practical SaaS selling.
                    </p>
                    <div className="mentor-profile-details">
                      <div className="mentor-expertise">
                        <p className="mentor-expertise-label">Expertise</p>
                        <p className="mentor-expertise-text">
                          SaaS sales, AE playbook, discovery calls, closing, Shopify ecosystem.
                        </p>
                        <a
                          className="mentor-linkedin"
                          href="#"
                          aria-label="Srivardhan Vanamalai on LinkedIn"
                        >
                          <span className="mentor-linkedin-icon" aria-hidden="true">in</span>
                          <span>View on LinkedIn</span>
                        </a>
                      </div>
                      <p className="mentor-bio">
                        Srivardhan was an Account Executive at Loop Subscriptions, one of the
                        fastest-growing Shopify SaaS companies in India. He has been in the trenches
                        running discovery calls, building proposals, handling objections, and closing
                        deals. His sessions are entirely practical and quota-tested.
                      </p>
                    </div>
                  </div>
                  <div className="mentor-profile-media">
                    <Image
                      className="mentor-photo"
                      src={withCloudinaryTransform(
                        "https://res.cloudinary.com/dz1681irz/image/upload/v1785175867/WhatsApp_Image_2026-05-11_at_17.46.23_rrdclb.jpg",
                        CLD_PHOTO
                      )}
                      alt="Portrait of Srivardhan Vanamalai"
                      width={400}
                      height={500}
                      sizes="(max-width: 767px) 90vw, 360px"
                    />
                    <span className="mentor-track-badge">Track: Sales</span>
                  </div>
                </article>
              </div>
            </div>
          </section>
  );
}
