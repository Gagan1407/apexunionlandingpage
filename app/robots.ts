import type { MetadataRoute } from "next";

function siteBase() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://www.apexunion.com"
  );
}

export default function robots(): MetadataRoute.Robots {
  const base = siteBase();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
