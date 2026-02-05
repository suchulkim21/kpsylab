'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { BLOG_ENABLED, MIND_ARCHITECT_ENABLED, MNPS_ENABLED } from '@/lib/constants/featureFlags';

export default function Navigation() {
  return (
    <header
      className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-50"
      role="banner"
    >
      <Link
        href="/"
        className="text-xl font-bold tracking-tighter text-white hover:text-gray-200 transition-colors"
        aria-label="www.kpsylab.com 홈으로 이동"
      >
        www.kpsylab.com
      </Link>
      
      <nav
        className="flex items-center gap-4 flex-wrap"
        role="navigation"
        aria-label="주요 메뉴"
      >
        <Link
          href="/services"
          className="text-white hover:text-gray-200 transition-colors text-sm"
        >
          서비스 소개
        </Link>
        {MNPS_ENABLED && (
          <Link
            href="/mnps/test"
            className="text-cyan-300 hover:text-cyan-200 transition-colors text-sm"
          >
            MNPS
          </Link>
        )}
        {MIND_ARCHITECT_ENABLED && (
          <Link
            href="/growth-roadmap"
            className="text-purple-300 hover:text-purple-200 transition-colors text-sm"
          >
            마인드 아키텍터
          </Link>
        )}
        {BLOG_ENABLED && (
          <Link
            href="/blog"
            className="text-white hover:text-gray-200 transition-colors text-sm"
          >
            블로그
          </Link>
        )}
        <Link
          href="/board"
          className="text-white hover:text-gray-200 transition-colors text-sm"
        >
          게시판
        </Link>
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1 px-3 py-2 text-sm text-yellow-300 hover:text-yellow-200 hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="관리자 대시보드"
        >
          <Shield className="w-4 h-4" aria-hidden="true" />
          관리자
        </Link>
      </nav>
    </header>
  );
}

