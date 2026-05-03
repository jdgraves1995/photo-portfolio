import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-35a6d82ac89043c79fb49abd82a553d0.r2.dev",
      },
    ],
  },
};

export default nextConfig;
