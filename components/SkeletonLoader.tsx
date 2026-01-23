'use client';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'card' | 'table' | 'image';
}

export function SkeletonLoader({
  className = '',
  lines = 3,
  variant = 'text',
}: SkeletonLoaderProps) {
  if (variant === 'card') {
    return (
      <div
        className={`card p-6 space-y-4 ${className}`}
        role="status"
        aria-label="로딩 중"
      >
        <div className="h-6 bg-zinc-800 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="card overflow-hidden" role="status" aria-label="로딩 중">
        <div className="divide-y divide-zinc-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 grid grid-cols-12 gap-4">
              <div className="col-span-1 h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="col-span-5 h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="col-span-2 h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="col-span-2 h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="col-span-2 h-4 bg-zinc-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div
        className={`bg-zinc-800 rounded-lg animate-pulse ${className}`}
        role="status"
        aria-label="이미지 로딩 중"
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="로딩 중">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-zinc-800 rounded animate-pulse ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}
