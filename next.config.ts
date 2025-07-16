import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker optimization
  output: 'standalone',
  
  // Removed output: 'export' to enable dynamic routing and Supabase integration
  // basePath: process.env.NODE_ENV === 'production' ? '/ts_subscriptions_tracker' : '',
  images: {
      unoptimized: true,
  },

};

export default nextConfig;
