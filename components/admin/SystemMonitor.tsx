'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SystemMetrics {
  timestamp: string;
  cpu: { usage: number };
  memory: { used: number; total: number; percentage: number };
  disk: { used: number; total: number; percentage: number };
  uptime: number;
  requests: { total: number; errors: number; successRate: number };
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  metrics: SystemMetrics;
}

export default function SystemMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/monitoring/system');
      const data = await response.json();
      if (data.success) {
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();

    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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

  if (!health) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <p className="text-red-400">시스템 상태를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}일 ${hours}시간 ${minutes}분`;
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">시스템 상태</h3>
          {getStatusIcon()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
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

      {/* 상태 표시 */}
      <div className={`mb-6 p-4 rounded-lg border ${health.status === 'healthy' ? 'bg-green-900/20 border-green-700' : health.status === 'warning' ? 'bg-yellow-900/20 border-yellow-700' : 'bg-red-900/20 border-red-700'}`}>
        <div className="flex items-center justify-between">
          <span className={`font-bold ${getStatusColor()}`}>
            상태: {health.status === 'healthy' ? '정상' : health.status === 'warning' ? '주의' : '위험'}
          </span>
          <span className="text-gray-400 text-sm">
            업타임: {formatUptime(health.metrics.uptime)}
          </span>
        </div>
        {health.issues.length > 0 && (
          <div className="mt-3 space-y-1">
            {health.issues.map((issue, index) => (
              <p key={index} className="text-sm text-gray-300">• {issue}</p>
            ))}
          </div>
        )}
      </div>

      {/* 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">CPU 사용률</div>
          <div className="text-2xl font-bold text-white mb-2">
            {health.metrics.cpu.usage.toFixed(1)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${health.metrics.cpu.usage > 80 ? 'bg-red-500' : health.metrics.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(100, health.metrics.cpu.usage)}%` }}
            ></div>
          </div>
        </div>

        {/* 메모리 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">메모리</div>
          <div className="text-2xl font-bold text-white mb-2">
            {health.metrics.memory.percentage.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            {formatBytes(health.metrics.memory.used)} / {formatBytes(health.metrics.memory.total)}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${health.metrics.memory.percentage > 80 ? 'bg-red-500' : health.metrics.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${health.metrics.memory.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* 요청 성공률 */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">요청 성공률</div>
          <div className="text-2xl font-bold text-white mb-2">
            {health.metrics.requests.successRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">
            총 {health.metrics.requests.total.toLocaleString()}건
            {health.metrics.requests.errors > 0 && (
              <span className="text-red-400"> ({health.metrics.requests.errors} 오류)</span>
            )}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full ${health.metrics.requests.successRate < 95 ? 'bg-red-500' : health.metrics.requests.successRate < 99 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${health.metrics.requests.successRate}%` }}
            ></div>
          </div>
        </div>

        {/* 디스크 (데이터가 있는 경우) */}
        {health.metrics.disk.total > 0 && (
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">디스크</div>
            <div className="text-2xl font-bold text-white mb-2">
              {health.metrics.disk.percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">
              {formatBytes(health.metrics.disk.used)} / {formatBytes(health.metrics.disk.total)}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${health.metrics.disk.percentage > 80 ? 'bg-red-500' : health.metrics.disk.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${health.metrics.disk.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* 마지막 업데이트 */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        마지막 업데이트: {new Date(health.metrics.timestamp).toLocaleString('ko-KR')}
      </div>
    </div>
  );
}

