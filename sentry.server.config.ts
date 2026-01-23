/**
 * Sentry 서버 설정
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
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
