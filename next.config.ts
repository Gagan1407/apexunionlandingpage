import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://challenges.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // React DevTools / Fast Refresh need unsafe-eval in development only.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
      "frame-src https://challenges.cloudflare.com",
      "child-src https://challenges.cloudflare.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
      // Re-enable after a trusted Let's Encrypt cert is installed:
      // "upgrade-insecure-requests",
    ].join("; "),
  },
];

// Don't send HSTS while the host still uses a self-signed cert — mobile
// browsers pin HTTPS and then block CSS/JS/images.
const productionHeaders = securityHeaders.filter(
  (h) => h.key !== "Strict-Transport-Security"
);

const nextConfig: NextConfig = {
  // Required for the production Docker image (smaller runtime).
  output: "standalone",
  images: {
    // cPanel standalone often lacks sharp; serve images directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: productionHeaders,
      },
    ];
  },
};

export default nextConfig;
