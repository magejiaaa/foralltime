import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://huiji-public.huijistatic.com/**'),
      new URL('https://i0.hdslb.com/**'),
      new URL('https://*.fbcdn.net/**'),
      {
        protocol: 'https',
        hostname: 'r.res.easebar.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'www.foralltime.com.tw',
      },
      {
        protocol: 'https',
        hostname: 'huiji-thumb.huijistatic.com',
      }
    ]
  }
};

export default nextConfig;
