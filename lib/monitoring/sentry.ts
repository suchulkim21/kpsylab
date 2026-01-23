/**
 * Sentry 에러 로깅 설정
 * 프로덕션 환경에서 에러 추적 및 모니터링
 */

let sentryInitialized = false;

export async function initSentry() {
  // Sentry는 선택적 의존성 (설치되어 있을 때만 사용)
  if (typeof window === 'undefined' || sentryInitialized) {
    return;
  }

  try {
    // 동적 import를 문자열로 처리하여 Turbopack이 빌드 시점에 분석하지 않도록 함
    const moduleName = '@sentry/nextjs';
    const Sentry = await import(/* @vite-ignore */ moduleName);
    
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
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

      sentryInitialized = true;
      console.log('[Sentry] Initialized');
    }
  } catch (error) {
    // Sentry가 설치되지 않은 경우 조용히 실패
    console.warn('[Sentry] Not available:', error);
  }
}

export async function captureException(error: Error, context?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  
  try {
    // 동적 import를 문자열로 처리하여 Turbopack이 빌드 시점에 분석하지 않도록 함
    const moduleName = '@sentry/nextjs';
    const Sentry = await import(/* @vite-ignore */ moduleName);
    Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
    });
  } catch {
    // Sentry가 없으면 무시
  }
}

export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return;
  
  try {
    const moduleName = '@sentry/nextjs';
    const Sentry = await import(/* @vite-ignore */ moduleName);
    Sentry.captureMessage(message, level);
  } catch {
    // Sentry가 없으면 무시
  }
}

export async function setUser(user: { id?: string; email?: string; username?: string }) {
  if (typeof window === 'undefined') return;
  
  try {
    const moduleName = '@sentry/nextjs';
    const Sentry = await import(/* @vite-ignore */ moduleName);
    Sentry.setUser(user);
  } catch {
    // Sentry가 없으면 무시
  }
}
