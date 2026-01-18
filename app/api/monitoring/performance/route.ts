import { NextResponse } from 'next/server';
import { performanceTracker } from '@/lib/monitoring/performanceTracker';

/**
 * GET /api/monitoring/performance
 * 성능 메트릭 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const type = searchParams.get('type') as 'api' | 'page' | 'database' | 'render' | null;
    const name = searchParams.get('name');

    if (type && name) {
      // 특정 타입과 이름의 메트릭 조회
      const limit = parseInt(searchParams.get('limit') || '100');
      const metrics = performanceTracker.getMetricsFor(type, name, limit);
      
      return NextResponse.json({
        success: true,
        data: metrics,
        count: metrics.length,
      });
    }

    // 전체 성능 요약
    const summary = performanceTracker.getSummary(hours);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch performance metrics',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/performance
 * 성능 메트릭 기록
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, duration, status = 'success', metadata } = body;

    if (!type || !name || duration === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'type, name, and duration are required',
        },
        { status: 400 }
      );
    }

    const metricId = performanceTracker.recordMetric(
      type,
      name,
      duration,
      status,
      metadata
    );

    return NextResponse.json({
      success: true,
      metricId,
    });
  } catch (error) {
    console.error('Error recording performance metric:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record performance metric',
      },
      { status: 500 }
    );
  }
}

