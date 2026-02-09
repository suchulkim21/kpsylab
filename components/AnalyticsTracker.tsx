'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const startTimeRef = useRef<number>(Date.now());
  const lastPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    // 페이지 변경 시 이전 페이지 체류 시간 기록
    const previousPath = lastPathnameRef.current;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    // 이전 페이지 체류 시간 전송 (최소 2초 이상일 때만)
    if (previousPath !== pathname && duration >= 2) {
      navigator.sendBeacon('/api/analytics/duration', JSON.stringify({
        pagePath: previousPath,
        duration: duration,
      }));
    }

    // 새 페이지 시작 시간 기록
    startTimeRef.current = Date.now();
    lastPathnameRef.current = pathname;

    // 페이지 접속 추적
    const trackVisit = async () => {
      try {
        const deviceType = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
        const referrer = document.referrer || 'direct';

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pagePath: pathname,
            referrer: referrer,
            userAgent: navigator.userAgent,
            deviceType: deviceType,
          }),
        });
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    };

    trackVisit();

    // 페이지 이탈 시 체류 시간 전송
    const handleUnload = () => {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (duration >= 2) {
        navigator.sendBeacon('/api/analytics/duration', JSON.stringify({
          pagePath: pathname,
          duration: duration,
        }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [pathname]);

  return null;
}
