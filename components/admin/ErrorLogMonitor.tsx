'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, AlertCircle, RefreshCw, CheckCircle2, Filter } from 'lucide-react';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  resolved: boolean;
}

interface ErrorSummary {
  total: number;
  byLevel: {
    error: number;
    warning: number;
    critical: number;
  };
  recent: ErrorLog[];
  trends: {
    date: string;
    count: number;
  }[];
}

export default function ErrorLogMonitor() {
  const [summary, setSummary] = useState<ErrorSummary | null>(null);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'critical' | 'unresolved'>('all');

  const fetchErrors = async () => {
    try {
      // 요약 조회
      const summaryResponse = await fetch('/api/monitoring/errors?summary=true');
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setSummary(summaryData.data);
      }

      // 필터링된 에러 조회
      let errorUrl = '/api/monitoring/errors?limit=50';
      if (filter !== 'all') {
        if (filter === 'unresolved') {
          errorUrl += '&level=error'; // 미해결 에러는 일단 error 레벨만
        } else {
          errorUrl += `&level=${filter}`;
        }
      }
      const errorsResponse = await fetch(errorUrl);
      const errorsData = await errorsResponse.json();
      if (errorsData.success) {
        let filteredErrors = errorsData.data;
        if (filter === 'unresolved') {
          filteredErrors = filteredErrors.filter((e: ErrorLog) => !e.resolved);
        }
        setErrors(filteredErrors);
      }
    } catch (error) {
      console.error('Error fetching error logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();

    if (autoRefresh) {
      const interval = setInterval(fetchErrors, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh, filter]);

  const resolveError = async (errorId: string) => {
    // 실제로는 API를 통해 해결 처리 필요
    setErrors(errors.map(e => e.id === errorId ? { ...e, resolved: true } : e));
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-900/30 border-red-700 text-red-400';
      case 'error':
        return 'bg-orange-900/30 border-orange-700 text-orange-400';
      case 'warning':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
      default:
        return 'bg-gray-900/30 border-gray-700 text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-semibold text-white">에러 로그</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-700"
            >
              <option value="all">전체</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="unresolved">미해결</option>
            </select>
          </div>
          <button
            onClick={fetchErrors}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="새로고침"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            자동 갱신
          </label>
        </div>
      </div>

      {/* 요약 통계 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">전체 에러</div>
            <div className="text-2xl font-bold text-white">{summary.total.toLocaleString()}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Critical</div>
            <div className="text-2xl font-bold text-red-400">{summary.byLevel.critical}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Error</div>
            <div className="text-2xl font-bold text-orange-400">{summary.byLevel.error}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Warning</div>
            <div className="text-2xl font-bold text-yellow-400">{summary.byLevel.warning}</div>
          </div>
        </div>
      )}

      {/* 트렌드 차트 (간단한 표) */}
      {summary && summary.trends.length > 0 && (
        <div className="mb-6 bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">7일간 에러 트렌드</h4>
          <div className="flex items-end gap-2 h-32">
            {summary.trends.map((trend, index) => {
              const maxCount = Math.max(...summary.trends.map(t => t.count), 1);
              const height = (trend.count / maxCount) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-red-500 rounded-t transition-all"
                    style={{ height: `${height}%` }}
                    title={`${trend.date}: ${trend.count}건`}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {trend.date.split('-').slice(1).join('/')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 에러 목록 */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-white mb-3">최근 에러 ({errors.length}건)</h4>
        {errors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>에러가 없습니다.</p>
          </div>
        ) : (
          errors.map((error) => (
            <div
              key={error.id}
              className={`border rounded-lg p-4 ${
                error.resolved
                  ? 'bg-gray-800/30 border-gray-700 opacity-60'
                  : getLevelColor(error.level)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getLevelIcon(error.level)}
                    <span className="font-semibold text-white uppercase">{error.level}</span>
                    {error.resolved && (
                      <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded">
                        해결됨
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(error.timestamp).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <p className="text-white mb-2">{error.message}</p>
                  {error.context && Object.keys(error.context).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                        컨텍스트 정보
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </details>
                  )}
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                        스택 트레이스
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-900/50 rounded text-xs text-gray-300 overflow-x-auto">
                        {error.stack}
                      </pre>
                    </details>
                  )}
                </div>
                {!error.resolved && (
                  <button
                    onClick={() => resolveError(error.id)}
                    className="ml-4 px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    해결
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

