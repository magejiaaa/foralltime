import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'huiji-public.huijistatic.com',
      },
      {
        protocol: 'https',
        hostname: 'r.res.easebar.com',
      },
      {
        protocol: 'https',
        hostname: 'www.foralltime.com.tw',
      },
      {
        protocol: 'https',
        hostname: 'i0.hdslb.com',
      },
      {
        protocol: 'https',
        hostname: 'huiji-thumb.huijistatic.com',
      },
      {
        protocol: 'https',
        hostname: 'nie.res.netease.com',
      },
      {
        protocol: 'https',
        hostname: 'f5qssdvtkcxlbsr2.public.blob.vercel-storage.com',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days
  },
  env: {
    BLOB_BASE_URL: process.env.NODE_ENV === 'development'
      ? '/'
      : 'https://f5qssdvtkcxlbsr2.public.blob.vercel-storage.com/',
  }
};

export default nextConfig;
