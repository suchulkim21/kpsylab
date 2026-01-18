/**
 * 에러 추적 및 알림 시스템
 */

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  resolved: boolean;
}

export interface ErrorSummary {
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

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private readonly maxLogs = 1000; // 최대 보관 로그 수

  /**
   * 에러 기록
   */
  logError(
    error: Error | string,
    level: 'error' | 'warning' | 'critical' = 'error',
    context?: Record<string, any>
  ): string {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      resolved: false,
    };

    this.errors.push(errorLog);

    // 최대 로그 수 초과 시 오래된 로그 제거
    if (this.errors.length > this.maxLogs) {
      this.errors = this.errors.slice(-this.maxLogs);
    }

    // 크리티컬 에러는 즉시 알림 (실제로는 알림 시스템 연동)
    if (level === 'critical') {
      this.notifyCriticalError(errorLog);
    }

    return errorLog.id;
  }

  /**
   * 에러 해결 표시
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * 에러 조회
   */
  getErrors(
    level?: 'error' | 'warning' | 'critical',
    limit: number = 50
  ): ErrorLog[] {
    let filtered = this.errors;

    if (level) {
      filtered = filtered.filter(e => e.level === level);
    }

    // 최신순으로 정렬
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return filtered.slice(0, limit);
  }

  /**
   * 에러 요약
   */
  getSummary(): ErrorSummary {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const trends = last7Days.map(date => {
      const count = this.errors.filter(e => 
        e.timestamp.startsWith(date)
      ).length;
      return { date, count };
    });

    return {
      total: this.errors.length,
      byLevel: {
        error: this.errors.filter(e => e.level === 'error').length,
        warning: this.errors.filter(e => e.level === 'warning').length,
        critical: this.errors.filter(e => e.level === 'critical').length,
      },
      recent: this.getErrors(undefined, 10),
      trends,
    };
  }

  /**
   * 미해결 에러 조회
   */
  getUnresolvedErrors(): ErrorLog[] {
    return this.errors.filter(e => !e.resolved);
  }

  /**
   * 크리티컬 에러 알림
   */
  private notifyCriticalError(error: ErrorLog) {
    // 실제 구현에서는 이메일, Slack, SMS 등 알림 시스템 연동
    console.error('[CRITICAL ERROR]', error);
    
    // 여기에 실제 알림 로직 추가
    // 예: emailService.sendAlert(error)
    // 예: slackService.sendMessage(error)
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 로그 정리 (오래된 해결된 에러 제거)
   */
  cleanup(maxAge: number = 7 * 24 * 60 * 60 * 1000) { // 기본 7일
    const cutoff = Date.now() - maxAge;
    this.errors = this.errors.filter(e => {
      const age = new Date(e.timestamp).getTime();
      // 해결되지 않았거나 최근 에러는 유지
      return !e.resolved || age > cutoff;
    });
  }
}

// 싱글톤 인스턴스
export const errorTracker = new ErrorTracker();

