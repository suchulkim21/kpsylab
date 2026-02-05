import Link from 'next/link';

type LegalPageShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
};

/**
 * MNPS 법적 페이지 공통 레이아웃: 다크 테마, 상단 뒤로가기, 타이포그래피·여백 일관성
 */
export default function LegalPageShell({
  title,
  subtitle = 'MNPS 테스트',
  backHref = '/mnps',
  backLabel = 'MNPS로 돌아가기',
  children,
}: LegalPageShellProps) {
  return (
    <main className="min-h-screen text-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* 상단: 뒤로가기 / 홈 */}
        <nav className="flex items-center gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>
        </nav>

        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-zinc-500">{subtitle}</p>
          )}
        </header>

        <div className="space-y-8">{children}</div>
      </div>
    </main>
  );
}

/** 섹션 제목 (h2) - 법적 페이지 내 소제목 */
export function LegalSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
      {children}
    </h2>
  );
}

/** 섹션 래퍼 - 구분선 + 여백 */
export function LegalSection({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 pt-6 border-t border-zinc-800 first:border-t-0 first:pt-0 ${className}`}>
      {children}
    </section>
  );
}
