import type { Metadata, Viewport } from "next";
import { Kalam, Montserrat, Outfit } from "next/font/google";
import CookieBanner from "@/components/legal/CookieBanner";
import { APEX_OG_IMAGE_URL } from "@/lib/cloudinary";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kalam",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Apex Union — Industry-led Sales & Marketing programme with placement assistance. Learn from practitioners, build a real portfolio, and launch your career.";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://apexunion.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "APEX UNION | Sales & Marketing Career Programme",
  description: SITE_DESCRIPTION,
  applicationName: "Apex Union",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Apex Union",
    title: "APEX UNION | Sales & Marketing Career Programme",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: APEX_OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Apex Union — Sales & Marketing career programme",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX UNION | Sales & Marketing Career Programme",
    description: SITE_DESCRIPTION,
    images: [APEX_OG_IMAGE_URL],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} ${kalam.variable}`}
    >
      <body className={montserrat.className}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
