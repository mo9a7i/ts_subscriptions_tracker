import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  basePath: process.env.NODE_ENV === 'production' ? '/ts_subscriptions_tracker' : '',
  images: {
      unoptimized: true,
  },

};

export default nextConfig;
