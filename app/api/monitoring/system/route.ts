import { NextResponse } from 'next/server';
import { systemMonitor } from '@/lib/monitoring/systemMonitor';

/**
 * GET /api/monitoring/system
 * 시스템 메트릭 조회
 */
export async function GET() {
  try {
    const health = await systemMonitor.getHealthStatus();
    
    return NextResponse.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system metrics',
      },
      { status: 500 }
    );
  }
}

