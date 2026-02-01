"use client";

/**
 * 공통 페이지 레이아웃
 * - 본문 최대 너비(page-container: 80rem) 통일
 * - 좌우 패딩 통일
 * - 페이지 배경색(글로벌 --app-bg) 사용
 * mnps, board 등에서 동일한 래퍼 사용 권장
 */
export default function PageLayout({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="page min-h-screen">
      <div className={`page-container ${className}`.trim()}>{children}</div>
    </div>
  );
}
