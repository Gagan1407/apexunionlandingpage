export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <div className="hero-inner wrap">
        <div className="hero-copy">
          <h1 id="hero-heading" className="hero-title">
            <span className="hero-title-line">Industry-Led</span>
            <span className="hero-title-line">
              <span className="career-kalam">Sales &amp; Marketing</span>
              {" "}Course
            </span>
            <span className="hero-title-line">with Placement Assistance</span>
          </h1>
          <p className="hero-subheading">
            Learn from people actually doing the work. Build a real portfolio, get
            warm intros, and aim for roles paying ₹8–25 LPA.
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-primary"
              href="#apply"
              data-lead-source="hero-cta"
            >
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
