import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add output configuration for Netlify
  output: 'export',
  images: {
    domains: ['images.qloo.com'],
    unoptimized: true,
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
