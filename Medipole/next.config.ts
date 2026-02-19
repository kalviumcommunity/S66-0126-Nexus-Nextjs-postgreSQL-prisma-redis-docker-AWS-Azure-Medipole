import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",

  // Security Headers Configuration
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS - HTTP Strict Transport Security
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://apis.google.com https://www.google-analytics.com",
              "frame-src 'self' https://www.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // X-Frame-Options
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // X-Content-Type-Options
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer-Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions-Policy
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "payment=()",
              "usb=()",
              "accelerometer=()",
              "gyroscope=()",
              "magnetometer=()",
              "fullscreen=self",
              "display-capture=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
