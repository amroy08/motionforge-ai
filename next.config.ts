import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Enable React strict mode for development warnings
   */
  reactStrictMode: true,

  /**
   * Allow images from Supabase storage and fal.ai CDN
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      {
        protocol: "https",
        hostname: "fal.media",
      },
      {
        protocol: "https",
        hostname: "*.fal.media",
      },
    ],
  },
};

export default nextConfig;
