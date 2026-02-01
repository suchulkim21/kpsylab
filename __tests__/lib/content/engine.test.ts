import { describe, it, expect } from 'vitest';
import { assembleParagraphs, formatClinicalTone, TextBlock } from '@/app/growth-roadmap/lib/content/engine';

describe('Content Engine Utilities', () => {
  describe('assembleParagraphs', () => {
    it('should join blocks with double newline', () => {
      const blocks: TextBlock[] = [
        { id: 'p1', content: 'First paragraph', condition: true },
        { id: 'p2', content: 'Second paragraph', condition: true },
      ];

      const result = assembleParagraphs(blocks);
      expect(result).toBe('First paragraph\n\nSecond paragraph');
    });

    it('should filter out blocks with condition false', () => {
      const blocks: TextBlock[] = [
        { id: 'a', content: 'Included', condition: true },
        { id: 'b', content: 'Excluded', condition: false },
        { id: 'c', content: 'Also included', condition: true },
      ];

      const result = assembleParagraphs(blocks);
      expect(result).toBe('Included\n\nAlso included');
      expect(result).not.toContain('Excluded');
    });

    it('should include blocks without condition', () => {
      const blocks: TextBlock[] = [
        { id: 'nc', content: 'No condition' },
        { id: 'hc', content: 'Has condition', condition: true },
      ];

      const result = assembleParagraphs(blocks);
      expect(result).toContain('No condition');
      expect(result).toContain('Has condition');
    });

    it('should handle empty array', () => {
      expect(assembleParagraphs([])).toBe('');
    });

    it('should handle single block', () => {
      const blocks: TextBlock[] = [
        { id: 'only', content: 'Only one' },
      ];

      expect(assembleParagraphs(blocks)).toBe('Only one');
    });
  });

  describe('formatClinicalTone', () => {
    it('should convert 요 to 다', () => {
      const text = '테스트입니다요.';
      expect(formatClinicalTone(text)).toBe('테스트입니다다.');
    });

    it('should convert 에요 to 다', () => {
      const text = '테스트에요';
      expect(formatClinicalTone(text)).toBe('테스트다');
    });

    it('should handle multiple replacements', () => {
      const text = '첫 번째요. 두 번째에요';
      const result = formatClinicalTone(text);
      expect(result).toBe('첫 번째다. 두 번째다');
    });

    it('should not modify text without 요 or 에요', () => {
      const text = '테스트입니다.';
      expect(formatClinicalTone(text)).toBe('테스트입니다.');
    });

    it('should handle empty string', () => {
      expect(formatClinicalTone('')).toBe('');
    });
  });
});

