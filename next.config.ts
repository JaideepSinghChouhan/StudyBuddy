import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse has dependencies that shouldn't be bundled
  serverExternalPackages: ["pdf-parse"],

  // Increase the body size limit for PDF uploads (20MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
