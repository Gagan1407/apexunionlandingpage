"use client";

import TurnstileField from "@/components/lead/TurnstileField";

export default function EnrollSection() {
  return (
    <section
      className="enroll-section"
      id="apply"
      aria-labelledby="enroll-heading"
    >
      <div className="wrap">
        <h2 id="enroll-heading" className="enroll-heading">
          Your Career in <span className="career-kalam">Sales</span> &amp;{" "}
          <span className="career-kalam">Marketing</span> Starts Here
        </h2>
        <p className="section-lead section-lead--dark enroll-intro">
          Take the next step. Apply now and join the next Apex Union cohort.
        </p>
        <p className="programme-key-facts programme-key-facts--enroll">
          Batch 1 · Indore, Madhya Pradesh · ₹8 lakh for 12 months · Merit
          scholarships available
        </p>

        <div className="enroll-form-card">
          <form className="enroll-form" id="inline-lead-form" noValidate>
            <div className="enroll-field">
              <label className="enroll-label" htmlFor="inline-name">
                Full Name
              </label>
              <input
                className="enroll-input"
                id="inline-name"
                name="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="enroll-field">
              <label className="enroll-label" htmlFor="inline-email">
                Email
              </label>
              <input
                className="enroll-input"
                id="inline-email"
                name="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="enroll-field enroll-field--full">
              <label className="enroll-label" htmlFor="inline-phone">
                Phone (WhatsApp)
              </label>
              <div className="phone-input-group">
                <div className="phone-code-field" title="Country code">
                  <span className="phone-code-display" aria-hidden="true">
                    +91
                  </span>
                  <select
                    className="enroll-input phone-country-code"
                    id="inline-country-code"
                    name="countryCode"
                    data-country-code-select
                    required
                    aria-label="Country code"
                  ></select>
                </div>
                <input
                  className="enroll-input phone-number"
                  id="inline-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="10-digit WhatsApp number"
                  required
                />
              </div>
            </div>

            <div className="enroll-field">
              <label className="enroll-label" htmlFor="inline-track">
                Track Interest
              </label>
              <select
                className="enroll-input enroll-select"
                id="inline-track"
                name="track"
                required
              >
                <option value="">Select a track</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Not Sure">Not Sure</option>
              </select>
            </div>

            <div className="enroll-field">
              <label className="enroll-label" htmlFor="inline-status">
                Current Status
              </label>
              <select
                className="enroll-input enroll-select"
                id="inline-status"
                name="status"
                required
              >
                <option value="">Select your status</option>
                <option value="Student">Student</option>
                <option value="Fresh Grad">Fresh Grad</option>
                <option value="Working">Working</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <TurnstileField
              containerId="inline-turnstile"
              formId="inline-lead-form"
              theme="light"
            />

            <div className="enroll-form-actions">
              <button className="btn btn-primary enroll-submit" type="submit">
                Apply Now
              </button>
              <p
                className="enroll-message"
                id="inline-lead-message"
                aria-live="polite"
              ></p>
            </div>
          </form>
        </div>

        <div className="enroll-whatsapp-cta">
          <p className="enroll-whatsapp-text">Join our WhatsApp community</p>
          <a
            className="btn btn-primary enroll-whatsapp-btn"
            href="https://chat.whatsapp.com/Gt4kSG9dp2VFBYb5IvvxUK"
            target="_blank"
            rel="noopener noreferrer"
            data-lead-source="whatsapp-community"
          >
            Join Now
          </a>
        </div>

        <p className="enroll-note">
          No spam. No random calls. Just your cohort details and a call with our
          team.
        </p>
        <p className="enroll-meta">Now accepting Batch 1 applications</p>
      </div>
    </section>
  );
}
