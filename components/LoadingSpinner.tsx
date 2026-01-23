'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={text || '로딩 중'}
    >
      <Loader2
        className={`${sizeClasses[size]} text-indigo-500 animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-400" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="page flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
}
