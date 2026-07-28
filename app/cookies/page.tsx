import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";

export const metadata: Metadata = {
  title: "Cookie Policy | Apex Union",
  description:
    "How Apex Union uses cookies and similar technologies on our website.",
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPageShell title="Cookie Policy" updated="22 July 2026">
      <p>
        This Cookie Policy explains how Apex Union (“we”, “us”) uses cookies and
        similar technologies on our website. For how we handle personal data
        more broadly, see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device when you visit a
        website. They help the site function, remember preferences, and
        understand how visitors use the pages. Similar technologies include
        local storage and pixels.
      </p>

      <h2>2. How we use cookies</h2>
      <p>We use cookies and similar tools for:</p>
      <ul>
        <li>
          <strong>Essential / functional</strong> — load the site securely,
          remember cookie consent choices, and support core features such as
          forms and admin sign-in sessions where applicable.
        </li>
        <li>
          <strong>Preferences</strong> — remember settings you choose (for
          example, consent status).
        </li>
        <li>
          <strong>Analytics (if enabled)</strong> — understand traffic and
          improve content. These run only if you accept non-essential cookies
          via the banner (or as allowed by your browser settings).
        </li>
      </ul>

      <h2>3. Cookie categories</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Purpose</th>
              <th scope="col">Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>Required for basic site operation and security</td>
              <td>
                Session cookies, consent storage (
                <code>apex_cookie_consent</code>)
              </td>
            </tr>
            <tr>
              <td>Preferences</td>
              <td>Remember choices you make on the site</td>
              <td>Consent preference flag</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Measure usage to improve the experience (optional)</td>
              <td>Third-party analytics cookies, if configured</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Managing cookies</h2>
      <ul>
        <li>
          Use our on-site cookie banner to accept or reject non-essential
          cookies.
        </li>
        <li>
          You can clear or block cookies in your browser settings. Blocking
          essential cookies may affect site functionality.
        </li>
        <li>
          To change a previous choice, clear site data for this domain or
          contact us and we can guide you.
        </li>
      </ul>

      <h2>5. Third parties</h2>
      <p>
        Embedded or linked services (for example social platforms, hosting, or
        analytics providers) may set their own cookies under their policies. We
        encourage you to review those policies separately.
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy when our practices or tools change.
        Check the “Last updated” date above.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions:{" "}
        <a href="mailto:apexunion11@gmail.com">apexunion11@gmail.com</a>.
      </p>
    </LegalPageShell>
  );
}
