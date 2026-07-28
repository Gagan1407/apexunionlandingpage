import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Apex Union",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-[Montserrat,ui-sans-serif,system-ui,sans-serif] antialiased">
      {children}
    </div>
  );
}
