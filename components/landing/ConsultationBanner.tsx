type ConsultationBannerProps = {
  source: string;
};

export default function ConsultationBanner({ source }: ConsultationBannerProps) {
  return (
    <aside className="consult-banner" aria-label="Book a free consultation">
      <div className="wrap consult-banner-inner">
        <div className="consult-banner-copy">
          <span className="promo-badge promo-badge--cream">Free Consultation</span>
          <p className="consult-banner-title">Book your free consultation today</p>
          <p className="consult-banner-text">
            Talk to the team about fit, Batch 1 seats, and your sales &amp; marketing path.
          </p>
        </div>
        <a
          className="btn btn-primary consult-banner-cta"
          href="#apply"
          data-lead-source={source}
        >
          Book Free Consultation
        </a>
      </div>
    </aside>
  );
}
