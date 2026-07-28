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
          <article className="founder-card">
            <img
              className="founder-photo"
              src="https://res.cloudinary.com/dz1681irz/image/upload/v1785175867/Prabal_Monga_ww7rcq.jpg"
              alt="Portrait of Prabal Monga"
              loading="lazy"
              decoding="async"
            />
            <h3 className="founder-name">Prabal Monga</h3>
            <p className="founder-role">Head of Placement and Program</p>
            <p className="founder-experience">4+ years of experience in Education</p>
          </article>

          <article className="founder-card">
            <img
              className="founder-photo"
              src="https://res.cloudinary.com/dz1681irz/image/upload/v1785241673/Prabal_Monga_Apex_lku0jb.jpg"
              alt="Portrait of Piyush Chhabra"
              loading="lazy"
              decoding="async"
            />
            <h3 className="founder-name">Piyush Chhabra</h3>
            <p className="founder-role">CEO and Head Of Admissions</p>
            <p className="founder-experience">
              13 years of Sales and Leadership experience
            </p>
          </article>

          <article className="founder-card">
            <img
              className="founder-photo"
              src="https://res.cloudinary.com/dz1681irz/image/upload/v1785242497/yash_chhabra_co_founder.jpg"
              alt="Portrait of Yash Chhabra"
              loading="lazy"
              decoding="async"
            />
            <h3 className="founder-name">Yash Chhabra</h3>
            <p className="founder-role">Head of Operations</p>
          </article>
        </div>
      </div>
    </section>
  );
}
