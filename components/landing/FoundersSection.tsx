import Image from "next/image";
import { CLD_PHOTO, withCloudinaryTransform } from "@/lib/cloudinary";

const FOUNDERS = [
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785175867/Prabal_Monga_ww7rcq.jpg",
    alt: "Portrait of Prabal Monga",
    name: "Prabal Monga",
    role: "Head of Placement and Program",
    experience: "4+ years of experience in Education",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785241673/Prabal_Monga_Apex_lku0jb.jpg",
    alt: "Portrait of Piyush Chhabra",
    name: "Piyush Chhabra",
    role: "CEO and Head Of Admissions",
    experience: "13 years of Sales and Leadership experience",
  },
  {
    src: "https://res.cloudinary.com/dz1681irz/image/upload/v1785242497/yash_chhabra_co_founder.jpg",
    alt: "Portrait of Yash Chhabra",
    name: "Yash Chhabra",
    role: "Head of Operations",
    experience: null as string | null,
  },
] as const;

export default function FoundersSection() {
  return (
    <section
      className="founders-section"
      id="founders"
      aria-labelledby="founders-heading"
    >
      <div className="wrap">
        <h2 id="founders-heading" className="founders-heading">
          Meet our Founders and Co Founders
        </h2>
        <div className="founders-grid">
          {FOUNDERS.map((founder) => (
            <article className="founder-card" key={founder.name}>
              <Image
                className="founder-photo"
                src={withCloudinaryTransform(founder.src, CLD_PHOTO)}
                alt={founder.alt}
                width={320}
                height={400}
                sizes="(max-width: 767px) 70vw, 220px"
              />
              <h3 className="founder-name">{founder.name}</h3>
              <p className="founder-role">{founder.role}</p>
              {founder.experience ? (
                <p className="founder-experience">{founder.experience}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
