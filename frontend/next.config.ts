import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.qloo.com'],
  },
  // Add redirect from home page to discover page
  async redirects() {
    return [
      {
        source: '/',
        destination: '/discover',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
