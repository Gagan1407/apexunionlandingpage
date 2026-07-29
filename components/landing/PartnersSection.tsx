import { CLD_LOGO, withCloudinaryTransform } from "@/lib/cloudinary";

const PARTNER_LOGOS = [
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241674/swiggy-logo_izfc1k_wnn7bs.svg",
    alt: "Swiggy",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241674/Zomato_Logo_mv9r22_ut9qqm.svg",
    alt: "Zomato",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241673/razorpay_o9trdu_ck1s42.svg",
    alt: "Razorpay",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241672/google-1-1-logo-svgrepo-com_bsy7ia_eb8yz8.svg",
    alt: "Google",
    size: "xl",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/e_trim,f_png/v1785241672/adobe-44195_mzgic4_zncugv.svg",
    alt: "Adobe",
    size: "adobe",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241673/pngegg_n8cr3d_jkn07y.png",
    alt: "Cvent",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241673/Payoneer-logo_aktpn6_imjhg2.png",
    alt: "Payoneer",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241672/moengage_logo_rkacdu_ucqwgj.png",
    alt: "MoEngage",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241672/Blinkit-yellow-app-icon.svg_bsjrvx_dpugmx.png",
    alt: "Blinkit",
    size: "lg",
  },
] as const;

function PartnerLogoGroup({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={
        duplicate
          ? "logo-marquee-group logo-marquee-group--duplicate"
          : "logo-marquee-group"
      }
      aria-hidden={duplicate ? true : undefined}
    >
      {PARTNER_LOGOS.map((logo) => {
        const sizeClass =
          "size" in logo && logo.size === "adobe"
            ? " logo-marquee-item--adobe"
            : "size" in logo && logo.size === "xl"
              ? " logo-marquee-item--xl"
              : "size" in logo && logo.size === "lg"
                ? " logo-marquee-item--lg"
                : "";

        return (
          <div
            className={`logo-marquee-item${sizeClass}`}
            key={`${duplicate ? "dup-" : ""}${logo.alt}`}
          >
            <img
              src={
                logo.src.includes(".svg")
                  ? logo.src
                  : withCloudinaryTransform(logo.src, CLD_LOGO)
              }
              alt={duplicate ? "" : logo.alt}
              width="140"
              height="46"
              loading="lazy"
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
}

export default function PartnersSection() {
  return (
    <section className="partners" id="partners" aria-labelledby="partners-heading">
      <div className="wrap partners-intro">
        <p className="sr-only">
          Logos of hiring partner and mentor organizations include Swiggy,
          Zomato, Razorpay, Google, Adobe, Cvent, Payoneer, MoEngage, and
          Blinkit.
        </p>
        <h2 id="partners-heading" className="partners-heading">
          Our Hiring Partners
        </h2>
        <p className="section-lead section-lead--dark">
          The same companies where our mentors work — and where you&apos;ll get
          warm introductions, not cold applications.
        </p>
      </div>
      <div className="logo-marquee" aria-hidden="true">
        <div className="logo-marquee-view">
          <div className="logo-marquee-track">
            <PartnerLogoGroup />
            <PartnerLogoGroup duplicate />
          </div>
        </div>
      </div>
    </section>
  );
}
