'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // 에러를 모니터링 시스템에 전송
    if (typeof window !== 'undefined') {
      // Sentry에 전송
      import('@/lib/monitoring/sentry').then(({ captureException }) => {
        captureException(error, {
          componentStack: errorInfo.componentStack,
        });
      }).catch(() => {
        // Sentry가 없으면 기존 API로 전송
        fetch('/api/monitoring/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="page flex items-center justify-center min-h-screen">
          <div className="card p-12 max-w-2xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-16 h-16 text-red-400" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              문제가 발생했습니다
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              예상치 못한 오류가 발생했습니다.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                  에러 상세 정보 (개발 모드)
                </summary>
                <pre className="mt-2 p-4 bg-zinc-900 rounded-lg text-xs text-red-400 overflow-auto max-h-64">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                aria-label="다시 시도"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                다시 시도
              </button>
              <Link
                href="/"
                className="btn btn-secondary"
                aria-label="홈으로 이동"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                홈으로
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
