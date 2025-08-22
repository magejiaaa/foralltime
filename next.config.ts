import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://huiji-public.huijistatic.com/**'),
      new URL('https://r.res.easebar.com/**'),
      new URL('https://**.fbcdn.net/**'),
      new URL('https://www.foralltime.com.tw/**'),
      new URL('https://i0.hdslb.com/**'),
      new URL('https://huiji-thumb.huijistatic.com/**'),
      new URL('https://nie.res.netease.com/**'),
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days
  }
};

export default nextConfig;
