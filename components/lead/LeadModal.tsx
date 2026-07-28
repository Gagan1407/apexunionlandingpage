export default function LeadModal() {
  return (
    <div
      className="lead-modal"
      id="lead-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-modal-title"
      hidden
    >
      <div className="lead-modal-backdrop" data-close-lead-modal></div>
      <div className="lead-modal-panel">
        <button
          className="lead-modal-close"
          type="button"
          aria-label="Close"
          data-close-lead-modal
        >
          &times;
        </button>
        <h2 id="lead-modal-title" className="lead-modal-title">
          Your Career in <span className="career-kalam">Sales</span> &amp;{" "}
          <span className="career-kalam">Marketing</span> Starts Here
        </h2>
        <p className="lead-modal-subtitle">
          Share your details and our team will connect with you.
        </p>
        <form className="lead-form" id="lead-form" noValidate>
          <input type="hidden" id="lead-source" name="source" value="unknown" />
          <label className="lead-label" htmlFor="lead-name">
            Full Name
          </label>
          <input
            className="lead-input"
            id="lead-name"
            name="name"
            type="text"
            required
          />

          <label className="lead-label" htmlFor="lead-email">
            Email
          </label>
          <input
            className="lead-input"
            id="lead-email"
            name="email"
            type="email"
            required
          />

          <label className="lead-label" htmlFor="lead-phone">
            Phone (WhatsApp)
          </label>
          <div className="phone-input-group">
            <div className="phone-code-field" title="Country code">
              <span className="phone-code-display" aria-hidden="true">
                +91
              </span>
              <select
                className="lead-input phone-country-code"
                id="lead-country-code"
                name="countryCode"
                data-country-code-select
                required
                aria-label="Country code"
              ></select>
            </div>
            <input
              className="lead-input phone-number"
              id="lead-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="10-digit WhatsApp number"
              required
            />
          </div>

          <label className="lead-label" htmlFor="lead-track">
            Track Interest
          </label>
          <select className="lead-input" id="lead-track" name="track" required>
            <option value="">Select a track</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Not Sure">Not Sure</option>
          </select>

          <label className="lead-label" htmlFor="lead-status">
            Current Status
          </label>
          <select className="lead-input" id="lead-status" name="status" required>
            <option value="">Select your status</option>
            <option value="Student">Student</option>
            <option value="Fresh Grad">Fresh Grad</option>
            <option value="Working">Working</option>
            <option value="Other">Other</option>
          </select>

          <button className="btn btn-primary lead-submit" type="submit">
            Submit Application
          </button>
          <p
            className="lead-form-message"
            id="lead-form-message"
            aria-live="polite"
          ></p>
        </form>
      </div>
    </div>
  );
}
