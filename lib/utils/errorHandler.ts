/**
 * 에러 핸들링 유틸리티
 * API 에러, 네트워크 에러 등을 일관되게 처리
 */

// showToast를 ErrorToast에서 re-export
export { showToast } from '@/components/ErrorToast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export class AppError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(message: string, code?: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * API 응답을 파싱하고 에러를 처리
 */
export async function handleApiResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let errorData: ApiError;
    
    try {
      errorData = await response.json();
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
      errorData = {
        message: getErrorMessage(response.status),
        status: response.status,
      };
    }

    throw new AppError(
      errorData.message || getErrorMessage(response.status),
      errorData.code,
      errorData.status || response.status,
      errorData.details
    );
  }

  const data = await response.json();
  return data;
}

/**
 * HTTP 상태 코드에 따른 사용자 친화적 에러 메시지
 */
export function getErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '잘못된 요청입니다.',
    401: '인증이 필요합니다.',
    403: '접근 권한이 없습니다.',
    404: '요청한 리소스를 찾을 수 없습니다.',
    409: '이미 존재하는 데이터입니다.',
    429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    502: '서버가 일시적으로 사용할 수 없습니다.',
    503: '서비스를 일시적으로 사용할 수 없습니다.',
  };

  return messages[status] || '알 수 없는 오류가 발생했습니다.';
}

/**
 * 네트워크 에러 처리
 */
export function handleNetworkError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
      'NETWORK_ERROR',
      0
    );
  }

  if (error instanceof Error) {
    return new AppError(
      error.message || '알 수 없는 오류가 발생했습니다.',
      'UNKNOWN_ERROR'
    );
  }

  return new AppError('알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR');
}

/**
 * 안전한 API 호출 래퍼
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<Response>,
  options?: {
    onError?: (error: AppError) => void;
    defaultData?: T;
  }
): Promise<T | null> {
  try {
    const response = await apiCall();
    return await handleApiResponse<T>(response);
  } catch (error) {
    const appError = handleNetworkError(error);
    
    // Sentry에 에러 전송 (프로덕션 환경, 클라이언트 사이드에서만)
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // 동적 import를 문자열로 처리하여 Turbopack이 빌드 시점에 분석하지 않도록 함
      const sentryModule = '@/lib/monitoring/sentry';
      import(/* @vite-ignore */ sentryModule).then(({ captureException }) => {
        captureException(appError, {
          apiCall: apiCall.toString(),
        });
      }).catch(() => {
        // Sentry가 없으면 무시
      });
    }
    
    if (options?.onError) {
      options.onError(appError);
    } else {
      console.error('API call failed:', appError);
    }

    return options?.defaultData ?? null;
  }
}
