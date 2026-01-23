'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

/**
 * Web Vitals 추적 컴포넌트
 * Core Web Vitals (LCP, FID, CLS) 및 기타 메트릭 추적
 */
export default function WebVitalsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Web Vitals 라이브러리 동적 로드 (선택적)
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      const sendToAnalytics = (metric: WebVitalsMetric) => {
        // 로컬 스토리지에 저장 (선택적)
        const vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
        vitals.push({
          ...metric,
          path: pathname,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('web-vitals', JSON.stringify(vitals.slice(-50))); // 최근 50개만

        // API로 전송
        fetch('/api/analytics/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...metric,
            path: pathname,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);

        // 개발 모드에서 콘솔 출력
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            path: pathname,
          });
        }
      };

      // Core Web Vitals
      onCLS(sendToAnalytics);
      onFID(sendToAnalytics);
      onLCP(sendToAnalytics);

      // 추가 메트릭
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    }).catch(() => {
      // web-vitals 패키지가 없으면 무시 (선택적 의존성)
      if (process.env.NODE_ENV === 'development') {
        console.log('[WebVitalsTracker] web-vitals 패키지가 설치되지 않았습니다.');
      }
    });
  }, [pathname]);

  return null;
}
