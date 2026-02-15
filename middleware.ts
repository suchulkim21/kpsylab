import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보안 미들웨어
 * - 보안 헤더 설정
 * - Rate Limiting (간단한 구현)
 * - CSRF 보호 강화
 */

// 간단한 Rate Limiting 저장소 (프로덕션에서는 Redis 등 사용 권장)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate Limiting 설정
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15분
  maxRequests: 100, // 최대 100회 요청
  apiMaxRequests: 50, // API는 최대 50회 요청
};

function getRateLimitKey(request: NextRequest): string {
  // Next.js에서는 IP를 헤더에서 가져와야 함
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string, isApi: boolean): boolean {
  const now = Date.now();
  for (const [entryKey, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(entryKey);
    }
  }
  const limit = isApi ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests;
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // 새 윈도우 시작
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false; // Rate limit 초과
  }

  entry.count++;
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api');

  // Rate Limiting 체크
  const rateLimitKey = getRateLimitKey(request);
  if (!checkRateLimit(rateLimitKey, isApiRoute)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // 정적 게임 파일은 미들웨어 건너뛰기 (iframe 허용)
  if (pathname.startsWith('/game/')) {
    return NextResponse.next();
  }

  // 응답 생성
  const response = NextResponse.next();

  // 게임 페이지는 자체 iframe 허용
  const isGamePage = pathname === '/game';

  // 보안 헤더 설정
  const securityHeaders: Record<string, string> = {
    // XSS 보호
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': isGamePage ? 'SAMEORIGIN' : 'DENY',
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    
    // Content Security Policy (CSP)
    'Content-Security-Policy': process.env.NODE_ENV === 'production'
      ? [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // Next.js 필요
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https: images.unsplash.com www.kpsylab.com kpsylab.com",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https:",
          isGamePage ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
          "frame-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ')
      : [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 개발 모드용
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https: http://localhost:* ws://localhost:*",
          isGamePage ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
          "frame-src 'self'",
        ].join('; '),
  };

  // HSTS 헤더 (HTTPS 환경에서만)
  if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:') {
    securityHeaders['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  // Rate Limiting 헤더 추가
  const entry = rateLimitMap.get(rateLimitKey);
  if (entry) {
    const remaining = (isApiRoute ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests) - entry.count;
    const resetTime = Math.ceil((entry.resetTime - Date.now()) / 1000);
    
    response.headers.set('X-RateLimit-Limit', (isApiRoute ? RATE_LIMIT.apiMaxRequests : RATE_LIMIT.maxRequests).toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, remaining).toString());
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
  }

  // 모든 보안 헤더 적용
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // API 라우트에 대한 추가 보안 검사
  if (isApiRoute && (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')) {
    // Origin 검증 (CSRF 보호)
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kpsylab.com',
      'http://localhost:7777',
      'http://127.0.0.1:7777',
    ];

    // 개발 환경에서는 완화
    if (process.env.NODE_ENV === 'production') {
      const isValidOrigin = origin && allowedOrigins.some(allowed => origin.startsWith(allowed));
      const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));

      if (!isValidOrigin && !isValidReferer) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        );
      }
    }

    // Content-Type 검증
    const contentType = request.headers.get('content-type');
    if (request.method === 'POST' || request.method === 'PUT') {
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
      }
    }
  }

  return response;
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 매치:
     * - api (내부 Next.js API)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (favicon 파일)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

