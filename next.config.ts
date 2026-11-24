import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance & VPS production optimizations */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
