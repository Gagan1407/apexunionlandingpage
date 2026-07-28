import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | Apex Union",
  description:
    "Terms governing use of the Apex Union website and applications to our Sales & Marketing programme.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms & Conditions" updated="22 July 2026">
      <p>
        These Terms &amp; Conditions (“Terms”) govern your use of the Apex
        Union website and related application forms. By accessing the site or
        submitting an enquiry, you agree to these Terms.
      </p>

      <h2>1. About Apex Union</h2>
      <p>
        Apex Union School of Business &amp; Entrepreneurship provides an
        industry-led Sales &amp; Marketing career programme with placement
        assistance. Contact:{" "}
        <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a>.
      </p>

      <h2>2. Website use</h2>
      <ul>
        <li>
          Content on this site is for general information about our programme
          and is not a guarantee of admission, placement, or salary outcomes.
        </li>
        <li>
          You agree not to misuse the site (including scraping, attacking, or
          submitting false information).
        </li>
        <li>
          We may update, suspend, or discontinue any part of the site without
          notice.
        </li>
      </ul>

      <h2>3. Applications and admissions</h2>
      <ul>
        <li>
          Submitting a form expresses interest; it does not create an
          enrolment contract.
        </li>
        <li>
          Admission decisions (including interviews and scholarships) remain at
          Apex Union’s discretion.
        </li>
        <li>
          Programme fees, schedules, mentors, partners, and outcomes described
          on the site may change; final terms will be confirmed in offer /
          enrolment documents.
        </li>
        <li>
          Placement assistance and salary ranges are targets based on programme
          design and market conditions — not warranties of a specific job or
          package.
        </li>
      </ul>

      <h2>4. Intellectual property</h2>
      <p>
        Logos, text, graphics, and other materials on this site belong to Apex
        Union or its licensors. You may not copy, modify, or redistribute them
        without prior written permission, except for personal, non-commercial
        viewing.
      </p>

      <h2>5. Third-party links</h2>
      <p>
        The site may link to LinkedIn, Instagram, WhatsApp, or other third-party
        services. We are not responsible for their content or practices. Your
        use of those services is governed by their own terms.
      </p>

      <h2>6. Privacy</h2>
      <p>
        Personal data is handled as described in our{" "}
        <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>7. Disclaimer</h2>
      <p>
        The site is provided “as is”. To the fullest extent permitted by law, we
        disclaim warranties of uninterrupted availability, error-free content,
        or fitness for a particular purpose.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Apex Union is not liable for
        indirect, incidental, or consequential damages arising from use of the
        site or reliance on its content. Nothing in these Terms limits liability
        that cannot be limited under applicable law.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These Terms are governed by the laws of India. Courts in Indore, Madhya
        Pradesh shall have exclusive jurisdiction, subject to mandatory
        consumer protections that may apply.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may revise these Terms periodically. The “Last updated” date will
        reflect changes. Continued use of the site after updates constitutes
        acceptance of the revised Terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a>.
      </p>
    </LegalPageShell>
  );
}
