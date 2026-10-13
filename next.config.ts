import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev is opened at 127.0.0.1; Next blocks that host unless it is listed.
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
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
