import Link from "next/link";
import SiteFooter from "@/components/landing/SiteFooter";

type LegalPageShellProps = {
  title: string;
  updated: string;
  children: React.ReactNode;
};

export default function LegalPageShell({
  title,
  updated,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <header className="legal-topbar">
        <div className="wrap legal-topbar-inner">
          <Link className="legal-brand" href="/">
            APEX UNION
          </Link>
          <Link className="legal-back" href="/">
            ← Back to home
          </Link>
        </div>
      </header>
      <main className="legal-page" id="main">
        <div className="wrap legal-page-inner">
          <p className="legal-kicker">Legal</p>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-updated">Last updated: {updated}</p>
          <div className="legal-body">{children}</div>
          <nav className="legal-nav" aria-label="Other legal documents">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms &amp; Conditions</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
