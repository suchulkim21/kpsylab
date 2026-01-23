/**
 * Sentry 클라이언트 설정
 * 이 파일은 @sentry/nextjs가 설치되어 있을 때만 사용됩니다.
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // 민감한 정보 제거
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
      delete event.request.headers?.['x-admin-secret'];
    }
    return event;
  },
});
