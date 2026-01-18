'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

interface PerformanceSummary {
  average: {
    api: number;
    page: number;
    database: number;
    render: number;
  };
  p95: {
    api: number;
    page: number;
    database: number;
    render: number;
  };
  p99: {
    api: number;
    page: number;
    database: number;
    render: number;
  };
  slowest: Array<{
    id: string;
    timestamp: string;
    type: string;
    name: string;
    duration: number;
    status: string;
  }>;
  errorRate: number;
  trends: Array<{
    date: string;
    averageResponseTime: number;
    requestCount: number;
  }>;
}

export default function PerformanceMonitor() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [hours, setHours] = useState(24);

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`/api/monitoring/performance?hours=${hours}`);
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();

    if (autoRefresh) {
      const interval = setInterval(fetchPerformance, 60000); // 1분마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh, hours]);

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

  if (!summary) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <p className="text-red-400">성능 메트릭을 불러올 수 없습니다.</p>
      </div>
    );
  }

  const formatMs = (ms: number) => {
    if (ms < 1) return `${Math.round(ms * 1000)}μs`;
    if (ms < 1000) return `${Math.round(ms * 10) / 10}ms`;
    return `${Math.round(ms / 100) / 10}s`;
  };

  const getPerformanceColor = (duration: number, type: string) => {
    let threshold = 1000; // 기본 1초
    if (type === 'api') threshold = 500;
    if (type === 'database') threshold = 200;
    if (type === 'render') threshold = 100;

    if (duration > threshold * 3) return 'text-red-400';
    if (duration > threshold * 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-white">성능 메트릭</h3>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value))}
            className="bg-gray-800 text-white rounded px-3 py-1 text-sm border border-gray-700"
          >
            <option value={1}>1시간</option>
            <option value={24}>24시간</option>
            <option value={168}>7일</option>
          </select>
          <button
            onClick={fetchPerformance}
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

      {/* 에러율 */}
      {summary.errorRate > 0 && (
        <div className="mb-6 p-4 rounded-lg border bg-red-900/20 border-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-semibold">
              에러율: {summary.errorRate}%
            </span>
          </div>
        </div>
      )}

      {/* 평균 응답 시간 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">API 평균</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(summary.average.api, 'api')}`}>
            {formatMs(summary.average.api)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            P95: {formatMs(summary.p95.api)} | P99: {formatMs(summary.p99.api)}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">페이지 로드</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(summary.average.page, 'page')}`}>
            {formatMs(summary.average.page)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            P95: {formatMs(summary.p95.page)} | P99: {formatMs(summary.p99.page)}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">데이터베이스</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(summary.average.database, 'database')}`}>
            {formatMs(summary.average.database)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            P95: {formatMs(summary.p95.database)} | P99: {formatMs(summary.p99.database)}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">렌더링</div>
          <div className={`text-2xl font-bold ${getPerformanceColor(summary.average.render, 'render')}`}>
            {formatMs(summary.average.render)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            P95: {formatMs(summary.p95.render)} | P99: {formatMs(summary.p99.render)}
          </div>
        </div>
      </div>

      {/* 가장 느린 요청 */}
      {summary.slowest.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            가장 느린 요청 (Top 10)
          </h4>
          <div className="space-y-2">
            {summary.slowest.map((metric) => (
              <div
                key={metric.id}
                className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">
                      {metric.type}
                    </span>
                    <span className="text-white font-medium">{metric.name}</span>
                    {metric.status === 'error' && (
                      <span className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded">
                        에러
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(metric.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className={`text-lg font-bold ${getPerformanceColor(metric.duration, metric.type)}`}>
                  {formatMs(metric.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 트렌드 차트 (간단한 표) */}
      {summary.trends.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">응답 시간 트렌드</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left p-2">시간</th>
                  <th className="text-right p-2">평균 응답</th>
                  <th className="text-right p-2">요청 수</th>
                </tr>
              </thead>
              <tbody>
                {summary.trends.slice(-10).map((trend, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="p-2 text-gray-300">{trend.date.split(' ')[1]}</td>
                    <td className={`p-2 text-right ${getPerformanceColor(trend.averageResponseTime, 'api')}`}>
                      {formatMs(trend.averageResponseTime)}
                    </td>
                    <td className="p-2 text-right text-gray-300">
                      {trend.requestCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

