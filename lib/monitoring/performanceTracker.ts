/**
 * 성능 메트릭 추적 시스템
 * API 응답 시간, 페이지 로드 시간 등 추적
 */

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'api' | 'page' | 'database' | 'render';
  name: string;
  duration: number; // milliseconds
  status: 'success' | 'error' | 'timeout';
  metadata?: Record<string, any>;
}

export interface PerformanceSummary {
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
  slowest: PerformanceMetric[];
  errorRate: number;
  trends: {
    date: string;
    averageResponseTime: number;
    requestCount: number;
  }[];
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000; // 최대 보관 메트릭 수

  /**
   * 성능 메트릭 기록
   */
  recordMetric(
    type: 'api' | 'page' | 'database' | 'render',
    name: string,
    duration: number,
    status: 'success' | 'error' | 'timeout' = 'success',
    metadata?: Record<string, any>
  ): string {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type,
      name,
      duration,
      status,
      metadata,
    };

    this.metrics.push(metric);

    // 최대 메트릭 수 초과 시 오래된 메트릭 제거
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    return metric.id;
  }

  /**
   * API 응답 시간 측정 헬퍼
   */
  async measureApi<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric('api', name, duration, 'success');
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric('api', name, duration, 'error', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 데이터베이스 쿼리 시간 측정 헬퍼
   */
  async measureDatabase<T>(
    queryName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.recordMetric('database', queryName, duration, 'success');
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric('database', queryName, duration, 'error', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * 성능 요약 생성
   */
  getSummary(hours: number = 24): PerformanceSummary {
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoffTime
    );

    const byType = {
      api: recentMetrics.filter(m => m.type === 'api'),
      page: recentMetrics.filter(m => m.type === 'page'),
      database: recentMetrics.filter(m => m.type === 'database'),
      render: recentMetrics.filter(m => m.type === 'render'),
    };

    // 평균 계산
    const calculateAverage = (metrics: PerformanceMetric[]) => {
      if (metrics.length === 0) return 0;
      const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
      return sum / metrics.length;
    };

    // 백분위수 계산
    const calculatePercentile = (
      metrics: PerformanceMetric[],
      percentile: number
    ) => {
      if (metrics.length === 0) return 0;
      const sorted = [...metrics].sort((a, b) => a.duration - b.duration);
      const index = Math.ceil((sorted.length * percentile) / 100) - 1;
      return sorted[Math.max(0, index)].duration;
    };

    // 에러율 계산
    const totalRequests = recentMetrics.length;
    const errors = recentMetrics.filter(m => m.status === 'error').length;
    const errorRate = totalRequests > 0 ? (errors / totalRequests) * 100 : 0;

    // 트렌드 데이터 생성 (24시간, 시간별)
    const trends = this.generateTrends(recentMetrics, hours);

    // 가장 느린 메트릭 (상위 10개)
    const slowest = [...recentMetrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      average: {
        api: calculateAverage(byType.api),
        page: calculateAverage(byType.page),
        database: calculateAverage(byType.database),
        render: calculateAverage(byType.render),
      },
      p95: {
        api: calculatePercentile(byType.api, 95),
        page: calculatePercentile(byType.page, 95),
        database: calculatePercentile(byType.database, 95),
        render: calculatePercentile(byType.render, 95),
      },
      p99: {
        api: calculatePercentile(byType.api, 99),
        page: calculatePercentile(byType.page, 99),
        database: calculatePercentile(byType.database, 99),
        render: calculatePercentile(byType.render, 99),
      },
      slowest,
      errorRate: Math.round(errorRate * 100) / 100,
      trends,
    };
  }

  /**
   * 트렌드 데이터 생성
   */
  private generateTrends(
    metrics: PerformanceMetric[],
    hours: number
  ): { date: string; averageResponseTime: number; requestCount: number }[] {
    const trends: Map<string, { total: number; count: number }> = new Map();

    metrics.forEach(metric => {
      const date = new Date(metric.timestamp);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;

      const existing = trends.get(hourKey) || { total: 0, count: 0 };
      existing.total += metric.duration;
      existing.count += 1;
      trends.set(hourKey, existing);
    });

    return Array.from(trends.entries())
      .map(([date, data]) => ({
        date,
        averageResponseTime: Math.round((data.total / data.count) * 100) / 100,
        requestCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 특정 엔드포인트의 메트릭 조회
   */
  getMetricsFor(
    type: 'api' | 'page' | 'database' | 'render',
    name: string,
    limit: number = 100
  ): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.type === type && m.name === name)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 오래된 메트릭 정리
   */
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 기본 7일
    const cutoff = Date.now() - maxAge;
    this.metrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );
  }
}

// 싱글톤 인스턴스
export const performanceTracker = new PerformanceTracker();

