import { NextResponse } from 'next/server';
import { errorTracker } from '@/lib/monitoring/errorTracker';

/**
 * GET /api/monitoring/errors
 * 에러 로그 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') as 'error' | 'warning' | 'critical' | null;
    const limit = parseInt(searchParams.get('limit') || '50');

    if (searchParams.get('summary') === 'true') {
      const summary = errorTracker.getSummary();
      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    const errors = errorTracker.getErrors(level || undefined, limit);

    return NextResponse.json({
      success: true,
      data: errors,
      count: errors.length,
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch error logs',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/monitoring/errors
 * 에러 로그 기록
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, level = 'error', context } = body;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required',
        },
        { status: 400 }
      );
    }

    const error = new Error(message);
    const errorId = errorTracker.logError(error, level, context);

    return NextResponse.json({
      success: true,
      errorId,
    });
  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log error',
      },
      { status: 500 }
    );
  }
}

