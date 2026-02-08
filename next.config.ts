import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 프로덕션 도메인 설정
  env: {
    SITE_URL: process.env.SITE_URL || 'https://www.kpsylab.com',
  },
  // 이미지 최적화 설정
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // 실험적 기능
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  // 외부 패키지 처리 (선택적 의존성)
  serverExternalPackages: ['@sentry/nextjs'],
  async redirects() {
    return [
      {
        source: '/second-genesis/:path*',
        destination: '/growth-roadmap/:path*',
        permanent: true,
      },
      {
        source: '/mnps',
        destination: '/mnps/test',
        permanent: false,
      },
    ];
  },
  // 헤더 최적화
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

// Sentry는 선택적 의존성 (설치되어 있을 때만 사용)
let finalConfig = nextConfig;

try {
  // require를 사용하여 런타임에만 평가 (정적 import와 달리 패키지가 없어도 에러 없음)
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- 선택적 의존성
  const sentryModule = require('@sentry/nextjs');
  
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && sentryModule.withSentryConfig) {
    finalConfig = sentryModule.withSentryConfig(nextConfig, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Next.js Config] Sentry enabled');
    }
  }
} catch (error) {
  // @sentry/nextjs가 설치되지 않았거나 로드 실패
  // 기본 설정 사용 (정상 동작)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Next.js Config] Sentry not available, using default config');
  }
}

export default finalConfig;
