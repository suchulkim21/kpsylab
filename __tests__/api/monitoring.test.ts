import { describe, it, expect } from 'vitest';

/**
 * 모니터링 API 통합 테스트
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7777';

describe('Monitoring API Integration Tests', () => {
  describe('GET /api/monitoring/system', () => {
    it('should return system health status', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/system`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('metrics');
      expect(['healthy', 'warning', 'critical']).toContain(data.data.status);
    });

    it('should return metrics with required fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/system`);
      const data = await response.json();
      
      const metrics = data.data.metrics;
      expect(metrics).toHaveProperty('timestamp');
      expect(metrics).toHaveProperty('cpu');
      expect(metrics).toHaveProperty('memory');
      expect(metrics).toHaveProperty('uptime');
      expect(metrics).toHaveProperty('requests');
    });
  });

  describe('GET /api/monitoring/errors', () => {
    it('should return error summary when summary=true', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?summary=true`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('total');
      expect(data.data).toHaveProperty('byLevel');
      expect(data.data).toHaveProperty('recent');
      expect(data.data).toHaveProperty('trends');
    });

    it('should return error list when summary=false', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?limit=10`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.count).toBeDefined();
    });

    it('should filter errors by level', async () => {
      const levels = ['error', 'warning', 'critical'] as const;
      
      for (const level of levels) {
        const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?level=${level}&limit=10`);
        
        expect(response.status).toBe(200);
        const data = await response.json();
        
        if (data.data.length > 0) {
          data.data.forEach((error: any) => {
            expect(error.level).toBe(level);
          });
        }
      }
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const response = await fetch(`${API_BASE_URL}/api/monitoring/errors?limit=${limit}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.data.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('POST /api/monitoring/errors', () => {
    it('should log an error successfully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test error message',
          level: 'error',
          context: {
            test: true,
            timestamp: new Date().toISOString(),
          },
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.errorId).toBeDefined();
    });

    it('should require message field', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: 'error',
          // message 누락
        }),
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should accept different error levels', async () => {
      const levels = ['error', 'warning', 'critical'] as const;
      
      for (const level of levels) {
        const response = await fetch(`${API_BASE_URL}/api/monitoring/errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Test ${level} message`,
            level,
          }),
        });
        
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
      }
    });
  });

  describe('GET /api/monitoring/performance', () => {
    it('should return performance summary', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/performance`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data).toHaveProperty('average');
      expect(data.data).toHaveProperty('p95');
      expect(data.data).toHaveProperty('p99');
      expect(data.data).toHaveProperty('slowest');
      expect(data.data).toHaveProperty('errorRate');
      expect(data.data).toHaveProperty('trends');
    });

    it('should accept hours parameter', async () => {
      const hours = 12;
      const response = await fetch(`${API_BASE_URL}/api/monitoring/performance?hours=${hours}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/monitoring/performance', () => {
    it('should record performance metric', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'api',
          name: '/api/test',
          duration: 123.45,
          status: 'success',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.metricId).toBeDefined();
    });

    it('should require type, name, and duration', async () => {
      const response = await fetch(`${API_BASE_URL}/api/monitoring/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'api',
          // name과 duration 누락
        }),
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });
});

