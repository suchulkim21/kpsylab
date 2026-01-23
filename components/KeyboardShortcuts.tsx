'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from './ErrorToast';

/**
 * 키보드 단축키 지원 컴포넌트
 */
export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: 검색 (향후 구현)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // 검색 기능이 구현되면 여기에 추가
        showToast('검색 기능은 곧 제공될 예정입니다.', 'info');
      }

      // Ctrl/Cmd + /: 도움말
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        showToast('키보드 단축키: Ctrl+K (검색), Ctrl+/ (도움말), / (홈)', 'info', 3000);
      }

      // / 키: 홈으로 이동 (GitHub 스타일)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        // input, textarea, select가 포커스되어 있지 않을 때만
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          target.tagName !== 'SELECT' &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          router.push('/');
        }
      }

      // Escape: 모달 닫기 (전역)
      if (e.key === 'Escape') {
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        modals.forEach((modal) => {
          const closeButton = modal.querySelector('button[aria-label*="닫기"], button[aria-label*="Close"]');
          if (closeButton) {
            (closeButton as HTMLButtonElement).click();
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return null;
}
