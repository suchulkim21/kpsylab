import { describe, it, expect } from 'vitest';
import { checkAnswerConsistency } from '@/app/growth-roadmap/lib/module2/consistencyCheck';
import { ScenarioOption } from '@growth-roadmap/types/module2';

describe('checkAnswerConsistency', () => {
  const createOption = (
    id: string,
    proactivity: number = 0,
    adaptability: number = 0,
    socialDistance: number = 0
  ): ScenarioOption => ({
    id,
    text: `Option ${id}`,
    type: 'thinking',
    weight: { proactivity, adaptability, socialDistance },
  });

  it('should return high reliability for consistent answers', () => {
    const selections: ScenarioOption[] = [
      createOption('1', 10, 0, 0),
      createOption('2', 10, 0, 0),
      createOption('3', 8, 0, 0),
      createOption('4', 12, 0, 0),
    ];

    const phaseSelections = {
      phase1: selections.slice(0, 2),
      phase2: selections.slice(2, 3),
      phase3: selections.slice(3, 4),
    };

    const result = checkAnswerConsistency(selections, phaseSelections);

    expect(result.reliabilityScore).toBeGreaterThanOrEqual(75);
    expect(result.consistencyLevel).toBe('high');
    expect(result.issues.length).toBe(0);
  });

  it('should detect random clicking pattern', () => {
    const selections: ScenarioOption[] = [
      createOption('1', 10, 10, 10),
      createOption('2', 8, 8, 8),
      createOption('3', 12, 12, 12),
      createOption('4', 10, 10, 10),
    ];

    const phaseSelections = {
      phase1: selections.slice(0, 2),
      phase2: selections.slice(2, 3),
      phase3: selections.slice(3, 4),
    };

    const result = checkAnswerConsistency(selections, phaseSelections);

    expect(result.reliabilityScore).toBeLessThan(75);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should detect repetitive pattern (same position)', () => {
    // 첫 번째 옵션만 반복적으로 선택하는 패턴
    const selections: ScenarioOption[] = Array(10).fill(null).map((_, i) => 
      createOption(`${i}_1`, 10, 0, 0)
    );

    const phaseSelections = {
      phase1: selections.slice(0, 4),
      phase2: selections.slice(4, 7),
      phase3: selections.slice(7, 10),
    };

    const result = checkAnswerConsistency(selections, phaseSelections);

    expect(result.issues.some(issue => 
      issue.includes('반복') || issue.includes('위치')
    )).toBe(true);
  });

  it('should handle empty selections', () => {
    const selections: ScenarioOption[] = [];
    const phaseSelections = {
      phase1: [],
      phase2: [],
      phase3: [],
    };

    const result = checkAnswerConsistency(selections, phaseSelections);

    expect(result.reliabilityScore).toBeLessThan(100);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('should provide appropriate recommendation based on reliability score', () => {
    const highReliabilitySelections: ScenarioOption[] = [
      createOption('1', 15, 0, 0),
      createOption('2', 12, 0, 0),
      createOption('3', 10, 0, 0),
    ];

    const lowReliabilitySelections: ScenarioOption[] = [
      createOption('1', 10, 10, 10),
      createOption('2', 8, 8, 8),
      createOption('3', 12, 12, 12),
    ];

    const phaseSelections = {
      phase1: highReliabilitySelections.slice(0, 1),
      phase2: highReliabilitySelections.slice(1, 2),
      phase3: highReliabilitySelections.slice(2, 3),
    };

    const highResult = checkAnswerConsistency(highReliabilitySelections, phaseSelections);
    const lowResult = checkAnswerConsistency(lowReliabilitySelections, phaseSelections);

    expect(highResult.recommendation).toContain('일관적');
    expect(lowResult.recommendation).toContain('추가 질문');
  });
});

