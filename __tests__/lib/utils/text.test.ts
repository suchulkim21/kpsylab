import { describe, it, expect } from 'vitest';

// HTML 태그 제거 함수 (블로그에서 사용하는 함수 시뮬레이션)
function stripHTMLTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// 텍스트 길이 제한 함수
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 텍스트에서 HTML 제거 후 미리보기 생성
function createPreview(content: string, maxLength: number = 150): string {
  const plainText = stripHTMLTags(content);
  return truncateText(plainText, maxLength);
}

describe('Text Utility Functions', () => {
  describe('stripHTMLTags', () => {
    it('should remove all HTML tags', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      expect(stripHTMLTags(html)).toBe('Hello World');
    });

    it('should handle nested HTML tags', () => {
      const html = '<div><p>Nested <span>content</span></p></div>';
      expect(stripHTMLTags(html)).toBe('Nested content');
    });

    it('should handle empty HTML', () => {
      expect(stripHTMLTags('')).toBe('');
    });

    it('should handle HTML with attributes', () => {
      const html = '<p class="test" id="demo">Content</p>';
      expect(stripHTMLTags(html)).toBe('Content');
    });

    it('should preserve plain text', () => {
      const text = 'No HTML here';
      expect(stripHTMLTags(text)).toBe('No HTML here');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'A'.repeat(200);
      const result = truncateText(text, 100);
      expect(result.length).toBe(103); // 100 + '...'
      expect(result).toEndWith('...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncateText(text, 100)).toBe('Short text');
    });

    it('should handle exact length', () => {
      const text = 'A'.repeat(100);
      expect(truncateText(text, 100)).toBe(text);
    });
  });

  describe('createPreview', () => {
    it('should create preview from HTML content', () => {
      const html = '<p>This is a long blog post content that should be truncated when creating a preview.</p>';
      const preview = createPreview(html, 50);
      
      expect(preview).not.toContain('<');
      expect(preview.length).toBeLessThanOrEqual(53); // 50 + '...'
    });

    it('should handle empty content', () => {
      expect(createPreview('')).toBe('');
    });

    it('should handle very short content', () => {
      const html = '<p>Short</p>';
      expect(createPreview(html, 150)).toBe('Short');
    });
  });
});

