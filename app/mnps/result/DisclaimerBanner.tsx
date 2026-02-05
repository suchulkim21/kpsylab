"use client";

import Link from 'next/link';

/**
 * MNPS 결과 페이지 하단 필수 고지
 * - 면책 조항(의학/임상 진단 아님, 오락·자기 성찰 목적)
 * - 이용약관·개인정보처리방침 링크 (404 방지)
 */

export default function DisclaimerBanner() {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-zinc-800">
      <div className="space-y-4 text-center">
        {/* 필수 면책 문구 */}
        <p className="text-xs text-zinc-500 leading-relaxed max-w-2xl mx-auto">
          <strong className="text-zinc-400">면책 조항</strong>
          <br />
          본 테스트 결과는 <strong>의학적·임상적 진단이 아니며</strong>, 전문 상담을 대체할 수 없습니다.
          오락 및 자기 성찰 목적으로만 이용해 주시기 바랍니다.
        </p>
        {/* 추가 법적 안내 */}
        <p className="text-[11px] text-zinc-600 leading-relaxed max-w-2xl mx-auto">
          수집된 응답·결과는 익명화되어 통계 및 규준 연구에 활용될 수 있습니다.
          유료 콘텐츠는 잠금 해제(열람) 후에는 청약 철회(환불)가 불가능합니다.
        </p>
        <p className="text-[11px] text-zinc-600">
          <Link href="/mnps/terms" className="text-zinc-500 hover:text-zinc-400 underline">
            이용약관
          </Link>
          {' · '}
          <Link href="/mnps/privacy" className="text-zinc-500 hover:text-zinc-400 underline">
            개인정보 처리방침
          </Link>
          에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </footer>
  );
}
