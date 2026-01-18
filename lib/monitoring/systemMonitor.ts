/**
 * 시스템 모니터링 유틸리티
 * 실시간 시스템 상태 추적
 */

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  requests: {
    total: number;
    errors: number;
    successRate: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  metrics: SystemMetrics;
}

class SystemMonitor {
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();

  /**
   * 시스템 메트릭 수집
   */
  async collectMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date().toISOString();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    // CPU 정보 (Node.js 환경에서는 제한적)
    const cpuUsage = process.cpuUsage();
    const cpuUsagePercent = this.calculateCpuUsage(cpuUsage);

    // 메모리 정보
    const memoryUsage = process.memoryUsage();
    const memoryUsed = memoryUsage.heapUsed;
    const memoryTotal = memoryUsage.heapTotal;
    const memoryFree = memoryTotal - memoryUsed;
    const memoryPercentage = (memoryUsed / memoryTotal) * 100;

    // 디스크 정보 (간단한 추정, 실제로는 시스템 호출 필요)
    const diskMetrics = await this.getDiskMetrics();

    // 요청 통계
    const totalRequests = this.requestCount;
    const errors = this.errorCount;
    const successRate = totalRequests > 0 
      ? ((totalRequests - errors) / totalRequests) * 100 
      : 100;

    return {
      timestamp,
      cpu: {
        usage: cpuUsagePercent,
        loadAverage: [], // Node.js에서는 시스템 호출 필요
      },
      memory: {
        used: memoryUsed,
        free: memoryFree,
        total: memoryTotal,
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      disk: diskMetrics,
      uptime,
      requests: {
        total: totalRequests,
        errors,
        successRate: Math.round(successRate * 100) / 100,
      },
    };
  }

  /**
   * 시스템 건강 상태 평가
   */
  async getHealthStatus(): Promise<SystemHealth> {
    const metrics = await this.collectMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // 메모리 체크
    if (metrics.memory.percentage > 90) {
      issues.push(`메모리 사용량이 높습니다: ${metrics.memory.percentage.toFixed(2)}%`);
      status = 'critical';
    } else if (metrics.memory.percentage > 75) {
      issues.push(`메모리 사용량이 증가했습니다: ${metrics.memory.percentage.toFixed(2)}%`);
      if (status === 'healthy') status = 'warning';
    }

    // 디스크 체크
    if (metrics.disk.percentage > 90) {
      issues.push(`디스크 공간이 부족합니다: ${metrics.disk.percentage.toFixed(2)}%`);
      status = 'critical';
    } else if (metrics.disk.percentage > 80) {
      issues.push(`디스크 공간이 부족해지고 있습니다: ${metrics.disk.percentage.toFixed(2)}%`);
      if (status === 'healthy') status = 'warning';
    }

    // 성공률 체크
    if (metrics.requests.successRate < 90 && metrics.requests.total > 100) {
      issues.push(`요청 성공률이 낮습니다: ${metrics.requests.successRate.toFixed(2)}%`);
      if (status === 'healthy') status = 'warning';
    }

    // CPU 체크
    if (metrics.cpu.usage > 90) {
      issues.push(`CPU 사용량이 높습니다: ${metrics.cpu.usage.toFixed(2)}%`);
      if (status === 'critical') {
        // Already critical
      } else if (status === 'healthy') {
        status = 'warning';
      }
    }

    return {
      status,
      issues,
      metrics,
    };
  }

  /**
   * 요청 기록
   */
  recordRequest(isError: boolean = false) {
    this.requestCount++;
    if (isError) {
      this.errorCount++;
    }
  }

  /**
   * CPU 사용량 계산 (근사치)
   */
  private calculateCpuUsage(usage: NodeJS.CpuUsage): number {
    // 실제 CPU 사용률 계산은 더 복잡한 로직 필요
    // 여기서는 간단한 추정
    const totalMicroseconds = usage.user + usage.system;
    return Math.min(100, totalMicroseconds / 10000); // 근사치
  }

  /**
   * 디스크 메트릭 가져오기 (간단한 추정)
   */
  private async getDiskMetrics(): Promise<{
    used: number;
    free: number;
    total: number;
    percentage: number;
  }> {
    // 실제 구현에서는 시스템 호출 필요 (예: fs.statfs)
    // 여기서는 플레이스홀더 값 반환
    return {
      used: 0,
      free: 0,
      total: 0,
      percentage: 0,
    };
  }

  /**
   * 리셋 통계
   */
  resetStats() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.startTime = Date.now();
  }
}

// 싱글톤 인스턴스
export const systemMonitor = new SystemMonitor();

