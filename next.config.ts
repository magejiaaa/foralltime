import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'r.res.easebar.com',
      'scontent.ftpe4-1.fna.fbcdn.net',
      'scontent.ftpe4-2.fna.fbcdn.net',
      'scontent.ftpe7-3.fna.fbcdn.net',
      'scontent.ftpe7-4.fna.fbcdn.net',
      'scontent.ftpe7-1.fna.fbcdn.net',
      'scontent.ftpe7-2.fna.fbcdn.net',
      'huiji-thumb.huijistatic.com'
    ],
    remotePatterns: [
      new URL('https://huiji-public.huijistatic.com/**'),
      new URL('https://i0.hdslb.com/**'),
      new URL('https://wx*.sinaimg.cn/**'),
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
        hostname: 'www.hlr1023.huijiwiki.com',
      }
    ]
  }
};

export default nextConfig;
