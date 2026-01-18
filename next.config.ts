import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 프로덕션 도메인 설정
  env: {
    SITE_URL: process.env.SITE_URL || 'https://www.kpsylab.com',
  },
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.kpsylab.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kpsylab.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
