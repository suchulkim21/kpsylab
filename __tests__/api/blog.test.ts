import { describe, it, expect } from 'vitest';

/**
 * 블로그 API 통합 테스트
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:7777';

describe('Blog API Integration Tests', () => {
  describe('GET /api/blog/posts', () => {
    it('should return list of blog posts', async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.posts)).toBe(true);
    });

    it('should return posts with all required fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts`);
      const data = await response.json();
      
      if (data.posts.length > 0) {
        const post = data.posts[0];
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('date');
      }
    });

    it('should support search query parameter', async () => {
      const searchTerm = '심리';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts?q=${encodeURIComponent(searchTerm)}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(Array.isArray(data.posts)).toBe(true);
      
      // 검색 결과가 있을 경우, 제목이나 내용에 검색어가 포함되어야 함
      if (data.posts.length > 0) {
        const firstPost = data.posts[0];
        const hasSearchTerm = 
          firstPost.title.includes(searchTerm) || 
          firstPost.content.includes(searchTerm);
        expect(hasSearchTerm).toBe(true);
      }
    });

    it('should support limit parameter', async () => {
      const limit = 5;
      const response = await fetch(`${API_BASE_URL}/api/blog/posts?limit=${limit}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.posts.length).toBeLessThanOrEqual(limit);
    });

    it('should handle invalid limit parameter gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts?limit=abc`);
      
      // 잘못된 파라미터는 무시하거나 기본값 사용
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/blog/posts/[id]', () => {
    it('should return a specific blog post by id', async () => {
      // 먼저 포스트 목록을 가져와서 ID 확인
      const listResponse = await fetch(`${API_BASE_URL}/api/blog/posts?limit=1`);
      const listData = await listResponse.json();
      
      if (listData.posts.length > 0) {
        const postId = listData.posts[0].id;
        
        const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}`);
        
        expect(response.status).toBe(200);
        const data = await response.json();
        
        expect(data.success).toBe(true);
        expect(data.post).toBeDefined();
        expect(data.post.id).toBe(postId);
      }
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = 99999;
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid post id', async () => {
      const invalidId = 'invalid';
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${invalidId}`);
      
      // 400 또는 404 반환 예상
      expect([400, 404]).toContain(response.status);
    });
  });
});

