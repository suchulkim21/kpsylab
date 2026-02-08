/**
 * 마인드 아키텍터: 질의 개수 = 분석에 필요한 만큼만
 *
 * 모듈별 기능
 * - 모듈1: 무의식 방해 요인. 인지 패턴·병목 식별.
 * - 모듈2: 대인 관계 및 행동. 시나리오 선택 기반.
 * - 모듈3: 이상향 파악 + 잠재력 격차. 이상향에 맞춘 조언만.
 *
 * 문항 수: 각 모듈 분석 로직이 요구하는 최소 수준만 사용.
 */

/** M1: 벡터(A/B/C/D) 산출에 필요한 최소 문항. CAT 조기종료 10회 유지, 풀은 12문항만 사용 */
export const MODULE1_QUESTION_COUNT = 12;

/** M2: proactivity/adaptability/socialDistance 산출 + 3구간 일관성 검사. 15문항(구간당 5) */
export const MODULE2_SCENARIO_TOTAL = 15;
export const MODULE2_SCENARIO_PER_PHASE = 5;

/** M3: ideal 8 + 잠재력 파악 강화 잠재 10 = 18문항 */
export const MODULE3_IDEAL_QUESTION_COUNT = 8;
export const MODULE3_POTENTIAL_QUESTION_COUNT = 10;
export const MODULE3_QUESTION_TOTAL =
  MODULE3_IDEAL_QUESTION_COUNT + MODULE3_POTENTIAL_QUESTION_COUNT;
