import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  compress: true, // Enable gzip compression
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.jeans-industry.fr",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jeans-industry.fr",
        pathname: "/**",
      },
    ],
  },
  // Optimize redirects - disable trailing slash redirects
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: "/search",
        destination: "/",
        permanent: true,
      },
      {
        source: "/search/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/products/:slug*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/thank-you",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
