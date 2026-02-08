/**
 * 성장 로드맵 결과 페이지 전략·실행 권고 콘텐츠
 * 전략(Alignment/Expansion/Correction/Pivot) 및 차원(안정/성장/관계/자율)별 고도화 문구
 * - 결과(ideal, potential, strategy, dimensions) 기반 변형 인덱스로 문구 변동 → 동일 전략이라도 응답마다 다른 톤/초점 제공
 */

import type { StrategyType } from '../analysis';
import type { GapAnalysisResult } from '../analysis';

const DIM_KO: Record<string, string> = {
  stability: '안정',
  growth: '성장',
  relation: '관계',
  autonomy: '자율',
};

/** 결과에서 결정론적 변형 인덱스 (0 또는 1). ideal·potential·strategy·dimensions 조합마다 다르게 나오도록 */
export function getResultVariantIndex(result: GapAnalysisResult): number {
  const h =
    result.ideal.stability * 7 +
    result.ideal.growth * 11 +
    result.ideal.relation * 13 +
    result.ideal.autonomy * 17 +
    result.potential.stability * 19 +
    result.potential.growth * 23 +
    result.potential.relation * 29 +
    result.potential.autonomy * 31 +
    (result.dimensions.dominantGap === 'stability' ? 2 : result.dimensions.dominantGap === 'growth' ? 4 : result.dimensions.dominantGap === 'relation' ? 8 : 16) +
    (result.dimensions.strongestPotential === 'stability' ? 3 : result.dimensions.strongestPotential === 'growth' ? 5 : result.dimensions.strongestPotential === 'relation' ? 9 : 17);
  return Math.abs(h) % 2;
}

/** 전략별 상세 설명 – 변형 2종 (전략 요약 패널용) */
const STRATEGY_DETAIL_VARIANTS: Record<StrategyType, [string, string]> = {
  Alignment: [
    '이상향과 현재 잠재력이 **높은 수준으로 일치**하고 있습니다. 당신이 원하는 방향과 지금 할 수 있는 것이 크게 어긋나지 않으므로, **현재 궤도를 유지·가속화**하는 것이 핵심입니다.\n\n(1) 이미 잘하고 있는 영역(루틴, 관계, 학습, 자기결정)을 정기적으로 점검하여 유지하고, (2) 소규모 실험(새 프로젝트, 짧은 도전)으로 성장을 지속하며, (3) 피드백 루프(주간 회고, 지표 확인)를 짧게 유지해 방향 이탈을 막으십시오. "더 많이"보다 "일관되게"가 이 단계에서는 더 중요합니다.\n\n**이 구간에서 유의할 점**: 정합도가 높을 때는 만족감으로 인해 도전을 멈추기 쉽습니다. "지금 궤도"를 유지하되, 한 달에 하나씩 **의도적인 작은 도전**(예: 새로운 협업 한 건, 짧은 학습 목표 하나)을 넣어 주면 정체를 막고 다음 단계로 이어갈 수 있습니다.',
    '목표와 현재 역량이 잘 맞는 상태입니다. 이 **정합성**을 유지하면서 다음 단계만 더하면 됩니다.\n\n(1) 지금 잘 되고 있는 습관·관계·결정 방식을 주기적으로 점검하고, (2) 작은 실험(짧은 도전, 새 프로젝트)으로 성장을 이어가며, (3) 주간 회고나 간단한 지표로 "방향 이탈"만 막으십시오. 이 구간에서는 무리한 확장보다 **궤도 유지**가 더 효과적입니다.\n\n**가속화를 위한 한 가지**: 궤도 유지만으로는 6개월 뒤에도 비슷한 수준에 머무를 수 있습니다. 현재 잘 맞는 상태를 활용해, **한 차원만** "한 단계 위" 목표(예: 관계라면 새로운 멘토 1명, 성장이라면 도전 과제 1개)를 정해 2~3개월 동안만 시도해 보십시오. 실패해도 기반이 흔들리지 않는 범위에서만 도전하는 것이 Alignment 구간의 가속화 요령입니다.',
  ],
  Expansion: [
    '잠재력은 충분한데 **이상향이 상대적으로 보수적**이거나, 한두 차원에서만 목표가 높게 설정된 상태입니다. **확장** 전략은 "지금 할 수 있는 것"을 인정한 뒤, 목표의 폭과 높이를 단계적으로 올리는 것입니다. (1) 가장 자신 있는 차원(강점 영역)에서 먼저 **조금 더 높은 목표**를 설정하고, (2) 그 성공 경험을 다른 차원으로 옮겨가는 방식으로 확장하며, (3) 실패해도 되도록 "실험" 프레임을 유지하십시오. 리소스(시간, 에너지, 관계)를 과도하게 쓰지 않고 **점진적 확장**이 핵심입니다.',
    '할 수 있는 것보다 원하는 것이 조금 덜 도전적으로 설정된 편입니다. **확장**은 한 번에 모든 것을 바꾸는 게 아니라, (1) 강점 영역에서만 "한 단계 높은 목표"를 먼저 세우고, (2) 그 경험을 다른 영역으로 옮긴 뒤, (3) 실패를 허용하는 "실험"으로 프레임하십시오. 과한 리소스 투입 없이 **점진적으로** 올리는 것이 중요합니다.',
  ],
  Correction: [
    '이상향과 잠재력의 **방향이나 균형이 어긋나** 있습니다. 한쪽만 높게 잡혀 있거나, 하고 싶은 것과 할 수 있는 것 사이에 반복적인 갈등이 있을 수 있습니다. **보정** 전략은 (1) **가장 괴리가 큰 차원**을 먼저 짚고, 그곳에서 "현실적인 목표"와 "한 달 안에 할 수 있는 행동"을 재정의한 뒤, (2) 나머지 차원은 유지하거나 소폭 조정하며, (3) 주기적으로 "지금 이 방향이 여전히 나에게 맞는가?"를 점검하는 것입니다. 큰 전환보다는 **방향 미세 조정**과 **우선순위 재배치**에 초점을 두십시오.',
    '원하는 것과 할 수 있는 것의 **방향이 어긋난** 상태입니다. **보정**은 (1) 괴리가 가장 큰 한 차원만 골라, 그곳의 "현실적 목표"와 "한 달 안 행동"을 다시 정한 뒤, (2) 나머지는 유지·소폭 조정하고, (3) "이 궤도가 아직 맞는가?"를 주기적으로 점검하는 것입니다. 전면 전환보다 **미세 조정**과 **우선순위 재배치**가 먼저입니다.',
  ],
  Pivot: [
    '이상향과 잠재력 사이에 **심한 불일치**가 있습니다. "원하는 삶"과 "현재 기반"이 크게 어긋나 있어, 지금 궤도 그대로 가속하면 지침만 커질 수 있습니다. **전환** 전략은 (1) **한 가지 차원**을 골라 그곳을 먼저 안정시키는 것(예: 안정성이라면 루틴·재정·건강, 관계성이라면 핵심 인맥 2~3명)에서 시작하고, (2) "모든 것을 바꾸겠다"는 압박을 내려놓은 뒤, (3) 3개월 단위로 "한 걸음만" 전진하는 계획을 세우는 것입니다. 전면 재설계보다 **한 발짝씩 방향을 돌리는 것**이 지속 가능한 전환을 만듭니다.',
    '목표와 현재 기반이 **크게 어긋나** 있어, 그대로 가속하면 지침만 커질 수 있습니다. **전환**은 (1) 한 차원만 골라 그곳을 먼저 안정시키고(루틴·재정·핵심 관계 등), (2) "전부 바꾼다"는 부담을 내려놓은 뒤, (3) 3개월 단위로 "한 걸음"만 정해 전진하는 것입니다. 한 번에 전부 바꾸기보다 **한 발짝씩 방향을 돌리는** 쪽이 지속 가능합니다.',
  ],
};

/** 전략별 실행 권고 – 변형 2세트 (실행 권고 패널용) */
const STRATEGY_ACTIONS_VARIANTS: Record<StrategyType, [string[], string[]]> = {
  Alignment: [
    [
      '타협하지 않는 원칙(가치)을 한 번 더 정의하고, 일상 결정이 그 원칙과 맞는지 주간 점검하십시오.',
      '현재 궤도를 유지하면서 "한 단계 위" 실험을 하나만 정해 2주간 실행한 뒤, 결과를 기록하십시오.',
      '강점 영역에서 작은 성과를 인정하고, 그 경험을 다른 영역으로 옮기는 방법을 구체적으로 적어 보십시오.',
      '정합도가 높은 만큼 도전이 줄어들 수 있습니다. 한 달에 하나, 실패해도 괜찮은 작은 도전(새 협업·짧은 학습 목표 등)을 의도적으로 넣으십시오.',
    ],
    [
      '지금 잘 맞는 원칙을 한두 개 정하고, 매주 "이번 결정이 그 원칙에 맞는가?"를 5분만 점검하십시오.',
      '궤도 유지를 전제로, 2주간 "한 단계 위" 실험 하나만 시도한 뒤 결과를 한 줄로 기록하십시오.',
      '강점에서 나온 작은 성과를 인정하고, 그 패턴을 다른 영역에 어떻게 옮길지 한 가지만 적어 보십시오.',
      '만족감만으로 도전을 멈추지 않도록, 이번 달에 "한 단계 위" 목표 하나만 정해 2~3개월 동안 시도해 보십시오.',
    ],
  ],
  Expansion: [
    [
      '강점 차원에서 "조금 더 도전적인" 목표 하나를 설정하고, 실패해도 괜찮다는 전제로 4주간 시도하십시오.',
      '다른 차원으로 확장할 때 필요한 자원(시간, 정보, 사람)을 리스트로 정리하고, 우선 하나만 확보하십시오.',
      '지금 하고 있는 것 중 "유지할 것"과 "늘릴 것"을 구분한 뒤, 늘릴 것에만 작은 할당을 추가하십시오.',
    ],
    [
      '자신 있는 영역에서만 "한 단계 높은" 목표 하나를 정하고, 4주간 실패를 허용하며 시도하십시오.',
      '확장에 필요한 자원(시간·정보·사람)을 적어 본 뒤, 그중 하나만 먼저 확보하십시오.',
      '"유지"와 "늘리기"를 구분하고, 늘릴 것 한 가지에만 소량의 시간·에너지를 추가하십시오.',
    ],
  ],
  Correction: [
    [
      '가장 괴리가 큰 영역의 "현실적 목표"를 한 달 단위로 재정의하고, 매주 한 가지 행동만 실행하십시오.',
      '방향 이탈을 막기 위해 주 1회 10분 "지금 이 궤도가 맞는가?" 점검 시간을 갖고 기록하십시오.',
      '우선순위를 한 번만 재배치하십시오: 반드치 유지할 것 1개, 조정할 것 1개, 내려놓을 것 1개.',
    ],
    [
      '괴리가 큰 한 영역만 골라 "한 달치 현실적 목표"와 "매주 한 행동"을 정한 뒤 실행하십시오.',
      '주 1회 10분, "이 궤도가 아직 맞는가?"를 점검하고 한 줄이라도 기록하십시오.',
      '유지 1개·조정 1개·내려놓기 1개만 정해 우선순위를 한 번 재배치하십시오.',
    ],
  ],
  Pivot: [
    [
      '한 가지 차원(안정/성장/관계/자율)만 골라 그곳을 3개월 동안 "기반"으로 삼고, 나머지는 유지 수준으로 두십시오.',
      '"모든 것을 바꾼다"는 압박을 내려놓고, 이번 달에 "한 걸음"만 정해 실행한 뒤 결과를 기록하십시오.',
      '지원이 될 수 있는 사람(멘토, 동료, 가족) 한 명에게 방향 전환 의도를 짧게 공유하고 피드백을 받으십시오.',
    ],
    [
      '한 차원만 3개월 "기반"으로 삼고(루틴·재정·관계 등), 나머지는 유지만 하십시오.',
      '이번 달 "한 걸음"만 정해 실행하고, "전부 바꾼다"는 생각은 내려놓으십시오.',
      '멘토·동료·가족 중 한 명에게만 방향 전환 의도를 말하고 피드백을 요청하십시오.',
    ],
  ],
};

/** 전략별 상세 설명 1개 반환 (변형 인덱스 적용) */
export function getStrategyDetail(strategy: StrategyType, variantIndex: number): string {
  const variants = STRATEGY_DETAIL_VARIANTS[strategy];
  return variants[variantIndex % variants.length] ?? variants[0]!;
}

/** 전략별 실행 권고 배열 반환 (변형 인덱스 적용) */
export function getStrategyActions(strategy: StrategyType, variantIndex: number): string[] {
  const variants = STRATEGY_ACTIONS_VARIANTS[strategy];
  return variants[variantIndex % variants.length] ?? variants[0]!;
}

/** 하위 호환: 단일 변형만 필요할 때 */
export const STRATEGY_DETAIL: Record<StrategyType, string> = Object.fromEntries(
  (Object.keys(STRATEGY_DETAIL_VARIANTS) as StrategyType[]).map((s) => [s, STRATEGY_DETAIL_VARIANTS[s]![0]!])
) as Record<StrategyType, string>;
export const STRATEGY_ACTIONS: Record<StrategyType, string[]> = Object.fromEntries(
  (Object.keys(STRATEGY_ACTIONS_VARIANTS) as StrategyType[]).map((s) => [s, STRATEGY_ACTIONS_VARIANTS[s]![0]!])
) as Record<StrategyType, string[]>;

/** 차원별 구체적 조언 (성장 방안·피해야 할 행동·강점 활용). improve/avoid/leverage는 변형 인덱스로 선택 가능 */
export const DIMENSION_TIPS: Record<
  string,
  { improve: string[]; avoid: string[]; leverage: string[] }
> = {
  stability: {
    improve: [
      '일정·루틴을 한 가지만 고정하고(예: 기상 시간, 주간 회고 요일) 2주간 유지해 보십시오.',
      '재정·건강·수면 같은 기반 요소를 주간 체크리스트로 점검하십시오.',
    ],
    avoid: [
      '목표만 세우고 실행 일정을 정하지 않는 것',
      '기반(수면, 식사, 정리)을 흔들면서까지 다른 영역에 에너지를 쏟는 것',
    ],
    leverage: [
      '안정성이 강점이라면, 루틴과 계획력을 팀이나 프로젝트에 기여하는 방식(일정 정리, 회의 운영, 문서화)으로 연결하십시오.',
      '강점인 안정성을 살려 팀의 일정·회의·문서를 정리하는 역할을 맡으면 관계·성장 차원으로도 기여할 수 있습니다.',
    ],
  },
  growth: {
    improve: [
      '한 달에 "배우기" 목표 하나(책 한 권, 강의 한 개, 도전 과제 하나)를 정하고 주간 진행을 기록하십시오.',
      '기존 영역을 조금만 확장하는 실험(예: 새로운 역할 시도, 짧은 사이드 프로젝트)을 설정하십시오.',
    ],
    avoid: [
      '목표를 막연하게만 두고 구체적인 학습·도전 계획을 세우지 않는 것',
      '한 번에 여러 영역을 바꾸려다 지침만 느끼는 것',
    ],
    leverage: [
      '성장성이 강점이라면, 새로 배운 것을 정리해 공유하거나 팀에 전파하는 역할을 맡아 다른 차원(관계, 자율)과 연결하십시오.',
      '강점인 성장성을 활용해 학습·실험 결과를 팀에 공유하거나 멘토 역할을 하면 관계·자율 차원과도 연결됩니다.',
    ],
  },
  relation: {
    improve: [
      '핵심 관계 2~3명을 정하고, 주 1회 이상 의미 있는 대화(피드백 요청, 감사 전달) 시간을 갖도록 하십시오.',
      '협업·네트워킹이 필요한 작은 프로젝트 하나에 참여해 관계성 목표와 연결하십시오.',
    ],
    avoid: [
      '관계를 숫자(연결 수, 팔로워)로만 측정하고 깊이를 놓치는 것',
      '갈등을 피하려고 의견을 숨기다 관계가 형식적으로만 유지되는 것',
    ],
    leverage: [
      '관계성이 강점이라면, 팀 내 조정·중재·네트워킹 역할을 맡아 성장성·자율성 확보에 기여하십시오.',
      '강점인 관계성을 팀의 조정·중재·연결 역할로 쓰면 성장·자율 차원 개선에도 도움이 됩니다.',
    ],
  },
  autonomy: {
    improve: [
      '한 가지 결정을 "남의 기준"이 아닌 "내 기준"으로 내리고, 그 이유를 한 줄로 기록하십시오.',
      '경계가 필요한 관계나 업무를 하나 정해 "거절·조정" 연습을 한 번 해 보십시오.',
    ],
    avoid: [
      '모든 것을 스스로 해결하려다 지침만 느끼는 것',
      '자율을 "혼자 하기"로만 해석해 관계나 지원을 배제하는 것',
    ],
    leverage: [
      '자율성이 강점이라면, 자기 주도로 진행할 수 있는 프로젝트나 역할을 요청해 성장·안정과 연결하십시오.',
      '강점인 자율성을 살려 스스로 기한·범위를 정하는 프로젝트를 맡으면 성장·안정과도 연결됩니다.',
    ],
  },
};

/** 차원별 improve/avoid/leverage 중 변형 인덱스로 하나씩 선택 */
export function getDimensionTip(
  dimensionKey: string,
  variantIndex: number,
  kind: 'improve' | 'avoid' | 'leverage'
): string {
  const tip = DIMENSION_TIPS[dimensionKey];
  if (!tip) return '';
  const arr = tip[kind];
  if (Array.isArray(arr)) return arr[variantIndex % arr.length] ?? arr[0] ?? '';
  return '';
}

/** improve 목록 전체 (GrowthAdvice에서 변형으로 하나만 쓸 때는 getDimensionTip 사용) */
export function getDimensionImproveList(dimensionKey: string, variantIndex: number): string[] {
  const tip = DIMENSION_TIPS[dimensionKey];
  if (!tip) return [];
  const arr = tip.improve;
  if (variantIndex % 2 === 0) return arr;
  return [arr[1] ?? arr[0]!, arr[0] ?? arr[1]!].filter(Boolean);
}

export function getDimName(key: string): string {
  return DIM_KO[key] ?? key;
}
