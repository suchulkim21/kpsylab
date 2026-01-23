'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지 변경 시 접속 추적
    const trackVisit = async () => {
      try {
        await fetch('/api/identity', { method: 'GET' });

        // 디바이스 타입 감지
        const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
        
        // 리퍼러 정보
        const referrer = document.referrer || 'direct';

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: pathname,
            referrer: referrer,
            userAgent: navigator.userAgent,
            deviceType: deviceType,
          }),
        });
      } catch (error) {
        // 에러가 발생해도 사용자 경험에 영향을 주지 않도록 조용히 실패
        console.error('Analytics tracking error:', error);
      }
    };

    trackVisit();
  }, [pathname]);

  return null; // UI 렌더링 없음
}

