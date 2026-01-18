import { describe, it, expect } from 'vitest';
import { calculateAnalysis } from '@/app/second-genesis/lib/module2/analysis';
import { ScenarioOption } from '@second-genesis/types/module2';

describe('calculateAnalysis', () => {
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

  it('should calculate correct scores from options', () => {
    const options: ScenarioOption[] = [
      createOption('1', 10, 5, 0),
      createOption('2', 8, 3, 2),
      createOption('3', 0, 0, 15),
    ];

    const result = calculateAnalysis(options);

    expect(result.proactivity).toBe(18); // 10 + 8
    expect(result.adaptability).toBe(8); // 5 + 3
    expect(result.socialDistance).toBe(17); // 2 + 15
  });

  it('should return zero scores for empty array', () => {
    const result = calculateAnalysis([]);

    expect(result.proactivity).toBe(0);
    expect(result.adaptability).toBe(0);
    expect(result.socialDistance).toBe(0);
  });

  it('should handle negative weights', () => {
    const options: ScenarioOption[] = [
      createOption('1', -5, 10, 0),
      createOption('2', 10, -3, 5),
    ];

    const result = calculateAnalysis(options);

    expect(result.proactivity).toBe(5); // -5 + 10
    expect(result.adaptability).toBe(7); // 10 + (-3)
    expect(result.socialDistance).toBe(5);
  });

  it('should handle options with missing weight properties', () => {
    const options: ScenarioOption[] = [
      {
        id: '1',
        text: 'Option 1',
        type: 'thinking',
        weight: { proactivity: 10 }, // adaptability, socialDistance 없음
      },
      createOption('2', 0, 5, 0),
    ];

    const result = calculateAnalysis(options);

    expect(result.proactivity).toBe(10);
    expect(result.adaptability).toBe(5);
    expect(result.socialDistance).toBe(0);
  });

  it('should sum multiple options correctly', () => {
    const options: ScenarioOption[] = Array(5).fill(null).map((_, i) =>
      createOption(`${i}`, 2, 3, 1)
    );

    const result = calculateAnalysis(options);

    expect(result.proactivity).toBe(10); // 2 * 5
    expect(result.adaptability).toBe(15); // 3 * 5
    expect(result.socialDistance).toBe(5); // 1 * 5
  });
});

