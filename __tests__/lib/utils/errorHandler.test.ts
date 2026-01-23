import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleApiResponse,
  getErrorMessage,
  handleNetworkError,
  safeApiCall,
  AppError,
} from '@/lib/utils/errorHandler';

describe('errorHandler', () => {
  describe('getErrorMessage', () => {
    it('should return appropriate message for known status codes', () => {
      expect(getErrorMessage(404)).toBe('요청한 리소스를 찾을 수 없습니다.');
      expect(getErrorMessage(403)).toBe('접근 권한이 없습니다.');
      expect(getErrorMessage(500)).toBe('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    });

    it('should return default message for unknown status codes', () => {
      expect(getErrorMessage(999)).toBe('알 수 없는 오류가 발생했습니다.');
    });
  });

  describe('handleApiResponse', () => {
    it('should return data for successful response', async () => {
      const mockResponse = new Response(
        JSON.stringify({ success: true, data: 'test' }),
        { status: 200 }
      );

      const result = await handleApiResponse(mockResponse);
      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should throw AppError for error response', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Test error', status: 400 }),
        { status: 400 }
      );

      await expect(handleApiResponse(mockResponse)).rejects.toThrow(AppError);
    });
  });

  describe('handleNetworkError', () => {
    it('should handle network fetch errors', () => {
      const error = new TypeError('Failed to fetch');
      const result = handleNetworkError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toContain('네트워크 연결');
    });

    it('should handle AppError instances', () => {
      const error = new AppError('Test error', 'TEST_CODE', 400);
      const result = handleNetworkError(error);

      expect(result).toBe(error);
    });

    it('should handle generic errors', () => {
      const error = new Error('Generic error');
      const result = handleNetworkError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Generic error');
    });
  });

  describe('safeApiCall', () => {
    it('should return data on successful call', async () => {
      const mockResponse = new Response(
        JSON.stringify({ success: true, data: 'test' }),
        { status: 200 }
      );
      const mockFetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await safeApiCall(() => mockFetch());

      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should call onError callback on failure', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Error' }),
        { status: 400 }
      );
      const mockFetch = vi.fn().mockResolvedValue(mockResponse);
      const onError = vi.fn();

      await safeApiCall(() => mockFetch(), { onError });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(AppError);
    });

    it('should return default data on failure', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Error' }),
        { status: 400 }
      );
      const mockFetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await safeApiCall(() => mockFetch(), {
        defaultData: { fallback: true },
      });

      expect(result).toEqual({ fallback: true });
    });
  });
});
