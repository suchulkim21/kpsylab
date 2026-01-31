/**
 * Dark Nature Test - Dual Report Utility
 * 점수 기반 Good / Bad 버전 텍스트 생성 (엘리트 하이 퍼포먼스 톤)
 *
 * scores 예시:
 * { total: 80, traits: { machiavellianism: 85, narcissism: 72, ... } }
 */

export type BasicScores = {
  total: number;
  traits?: {
    machiavellianism?: number;
    narcissism?: number;
    psychopathy?: number;
    sadism?: number;
  };
  [key: string]: any;
};

export const generateReport = (scores: BasicScores) => {
  const total = Math.round(scores.total ?? 0);
  const traits = scores.traits || {};

  const high = (v?: number) => (v ?? 0) >= 70;

  const goodTraits: string[] = [];

  // Machiavellianism → Advanced Political Intelligence & Long-term Game Theory Planning
  if (high(traits.machiavellianism)) {
    goodTraits.push(
      '복잡한 권력 구조와 이해관계 속에서도 의도와 힘의 방향을 읽어내는 **Advanced Political Intelligence**를 보유하고 있습니다.',
    );
    goodTraits.push(
      '단기 승리보다 장기 판세를 우선하는 **Long-term Game Theory Planning** 관점으로 움직입니다.',
    );
  }

  // Narcissism → Unrivaled Visionary Presence & High-Impact Personal Branding
  if (high(traits.narcissism)) {
    goodTraits.push(
      '조직 내 서사를 주도하고 시선을 집중시키는 **Unrivaled Visionary Presence**를 구축할 수 있습니다.',
    );
    goodTraits.push(
      '위기 상황에서도 이미지와 인지도를 관리하는 **High-Impact Personal Branding** 역량이 두드러집니다.',
    );
  }

  // Psychopathy → Superior Emotional Resilience & Objective Decision-making under Extreme Pressure
  if (high(traits.psychopathy)) {
    goodTraits.push(
      '극단적 압박 상황에서도 감정 신호를 최소화하고 기능을 유지하는 **Superior Emotional Resilience**를 보여줍니다.',
    );
    goodTraits.push(
      '손실 공포보다 기대 수익을 우선시하는 **Objective Decision-making under Extreme Pressure**를 실행할 수 있습니다.',
    );
  }

  // Sadism → Dominant Market Assertiveness & Psychological Edge in Negotiations
  if (high(traits.sadism)) {
    goodTraits.push(
      '경쟁 구도에서 주도권을 양보하지 않는 **Dominant Market Assertiveness**를 발휘합니다.',
    );
    goodTraits.push(
      '상대의 미세한 반응 변화를 읽어내는 **Psychological Edge in Negotiations**를 전략적으로 사용할 수 있습니다.',
    );
  }

  // 어떤 특성도 높지 않을 때 기본 설명
  if (!goodTraits.length) {
    goodTraits.push(
      '현재 점수는 극단적 Dark 성향이라기보다는, 필요 시에만 선택적으로 가동되는 **전략적 방어 시스템**에 가까운 수준입니다.',
    );
  }

  // 헤드라인
  const headline =
    total >= 80
      ? 'High-Level Strategic Predator Profile'
      : total >= 60
      ? 'Strategic Operator Profile'
      : 'Controlled Risk Management Profile';

  // 요약 카피
  const summary =
    total >= 80
      ? '당신의 프로파일은 고위험 감수 성향과 계산된 조종 능력이 결합된, 드문 유형의 하이 레벨 전략 플레이어입니다. 당신은 단순히 게임에 참여하는 것이 아니라, 게임의 규칙 자체를 재설계하려는 포지션을 선호합니다.'
      : total >= 60
      ? '당신의 Dark Nature는 고위험·고수익 환경에서 활용 가능한 정교한 도구로 작동합니다. 감정 소음을 최소화하고, 필요한 순간에만 정밀하게 개입하는 **전략적 오퍼레이터**에 가깝습니다.'
      : '당신은 대부분의 상황에서 안정성과 협력을 우선하지만, 임계점이 넘어가면 감정보다 계산을 우선하는 “제한적 전략 모드”를 가동할 수 있는 프로파일입니다.';

  return {
    good: {
      title: headline,
      description: summary,
      traits: [
        '상황과 관계를 호불호가 아닌 자원 흐름 관점에서 재구성하는 **Resource Optimization Mindset**',
        '개인 감정을 의사결정에서 분리하려는 **Zero-base Objective Execution** 지향성',
        '조직 내 비공식 네트워크와 권력 역학을 읽어내는 **High-Stakes Political Acumen**',
        ...goodTraits,
      ],
    },
    bad: {
      title: 'Raw, Unfiltered Malice – Dark Nature Backstage Report',
      description:
        '이 섹션은 당신의 Dark Nature가 감정·윤리·관계를 어떻게 재배치하는지에 대한 **Raw, Unfiltered Malice** 분석입니다.',
      details:
        '표면적으로는 합리적이고 협력적인 리더처럼 보이지만, 이해관계가 얽힌 순간 당신의 내면 알고리즘은 “누가 옳은가”가 아니라 “누가 제거되어야 하는가”를 먼저 계산하기 시작합니다. 이때 사람은 역할 단위로 축소되고, 신뢰는 소모 가능한 리소스로 분류될 수 있습니다.',
      warning:
        '고위험·고권력 환경에서는 이러한 성향이 단기 성과를 만들 수 있지만, 한 번 경계를 넘으면 **법적·사회적 복구가 어려운 손상**으로 이어질 가능성이 높습니다. 이 리포트의 나머지 내용은 결제 후에만 공개됩니다.',
    },
  };
};
