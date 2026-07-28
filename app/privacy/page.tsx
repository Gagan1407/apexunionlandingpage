import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy | Apex Union",
  description:
    "How Apex Union collects, uses, and protects personal information from applicants and website visitors.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="22 July 2026">
      <p>
        Apex Union School of Business &amp; Entrepreneurship (“Apex Union”,
        “we”, “us”, or “our”) respects your privacy. This Privacy Policy
        explains what personal information we collect through our website and
        application forms, how we use it, and the choices available to you.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Apex Union operates an industry-led Sales &amp; Marketing career
        programme based in Indore, Madhya Pradesh, India. Contact:{" "}
        <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a>.
      </p>

      <h2>2. Information we collect</h2>
      <p>We may collect:</p>
      <ul>
        <li>
          <strong>Application / lead details</strong> you submit — full name,
          email address, WhatsApp/phone number (including country code), track
          interest, current status, and how you found us.
        </li>
        <li>
          <strong>Technical data</strong> such as browser type, device
          information, approximate location derived from IP, pages visited, and
          timestamps (including for security and analytics).
        </li>
        <li>
          <strong>Communication data</strong> if you email or message us.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>Respond to applications and admission enquiries</li>
        <li>Share programme, cohort, and webinar details</li>
        <li>Operate our admin tools and lead records</li>
        <li>Improve the website and measure engagement</li>
        <li>Comply with legal obligations and prevent misuse</li>
      </ul>
      <p>
        We do not sell your personal information to third-party advertisers.
      </p>

      <h2>4. Legal bases</h2>
      <p>
        Where applicable, we process data based on your consent (for example,
        when you submit a form or accept cookies), our legitimate interests in
        running and promoting the programme, and/or steps taken at your request
        before entering a contract for admission.
      </p>

      <h2>5. Sharing</h2>
      <p>We may share data with:</p>
      <ul>
        <li>
          Service providers that help us host the site, store leads (for
          example cloud databases), send form data to internal sheets/tools, or
          analyse traffic — under contractual confidentiality obligations
        </li>
        <li>Admissions and programme staff who need it to contact you</li>
        <li>Authorities when required by law</li>
      </ul>

      <h2>6. Retention</h2>
      <p>
        We keep application and enquiry data for as long as needed for
        admissions, follow-up, programme operations, and legal/compliance
        needs, then delete or anonymise it when no longer required.
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable technical and organisational measures to protect
        personal data. No method of transmission or storage is fully secure;
        please use strong unique passwords for any account we provide (such as
        admin access).
      </p>

      <h2>8. Your rights</h2>
      <p>
        Subject to applicable law, you may request access, correction, deletion,
        or restriction of your personal data, or withdraw consent where
        processing is consent-based. Email{" "}
        <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a> with
        the subject “Privacy request”.
      </p>

      <h2>9. Children</h2>
      <p>
        Our programme and site are aimed at adults and early-career
        professionals. We do not knowingly collect personal data from children
        under 18 without appropriate guardian involvement.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use cookies and similar technologies as described in our{" "}
        <a href="/cookies">Cookie Policy</a>. You can manage preferences via
        the cookie banner and your browser settings.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update this policy from time to time. The “Last updated” date at
        the top will change when we do. Continued use of the site after updates
        means you acknowledge the revised policy.
      </p>
    </LegalPageShell>
  );
}
