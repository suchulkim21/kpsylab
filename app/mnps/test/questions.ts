/**
 * Dark Nature Test - 42문항 구조 (보정본 v2)
 *
 * 카테고리별 구성:
 * - Dark Tetrad (핵심): 나르시시즘·마키아벨리즘·사이코패시·사디즘 + 동의어 쌍(n1b, m1b) + 심화(m5, p5, s5)
 * - D-Factor (확장): 이기주의, 권리 의식, 도덕적 이탈, 악의성 + 심화(sp4)
 * - Validation (검증): 4문항(v1, v3, v7, v4) — v2, v5, v6, v8 제거
 * - Scenario (심화): 4문항
 *
 * 일관성 쌍: n1/n1b(나르시시즘), m1/m1b(마키아벨리즘)
 * 역문(isReverse): v3, v7만 true (채점 시 6−점수 역코딩)
 */

export type DarkTrait = 'machiavellianism' | 'narcissism' | 'psychopathy' | 'sadism';
export type DarkSubFactor = 'egoism' | 'entitlement' | 'moralDisengagement' | 'spitefulness';
export type QuestionCategory = 'darkTetrad' | 'dFactor' | 'scenario' | 'validation';

/** 문항 타입. isReverse는 검증 문항 v3, v7에만 true */
export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  trait?: DarkTrait;
  subFactor?: DarkSubFactor;
  order: number;
  isReverse?: boolean;
}

export type DarkNatureQuestion = Question;

export const MNPS_OPTIONS = [
  { label: '전혀 아니다', value: 1 },
  { label: '아니다', value: 2 },
  { label: '보통이다', value: 3 },
  { label: '그렇다', value: 4 },
  { label: '매우 그렇다', value: 5 },
];

/** 검증 문항 ID (8개→4개). v2,v5,v6,v8 제거. v3,v7은 역코딩 */
export const VALIDATION_QUESTION_IDS: readonly string[] = ['v1', 'v3', 'v7', 'v4'];

/** 일관성 쌍 (쌍별 답 차이로 분석 정확도 반영) */
export const CONSISTENCY_PAIR_IDS: [string, string][] = [
  ['n1', 'n1b'],
  ['m1', 'm1b'],
];

/** 보정된 42문항 (원본 배열). isReverse: v3, v7만 true */
export const DARK_NATURE_QUESTIONS: Question[] = [
  { id: 'n1', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '솔직히 나는 내가 평범한 사람들보다 우월하다고 느낀다.', order: 1 },
  { id: 'n2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '사람들이 나를 주목하거나 칭찬해 주지 않으면 견디기 힘들다.', order: 2 },
  { id: 'n3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '내가 특별한 대우를 요구하는 것은 내 능력에 비추어 볼 때 당연하다.', order: 3 },
  { id: 'n4', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '남들과 똑같이 평범하게 사는 것은 나에게 어울리지 않는다.', order: 4 },
  { id: 'e1', category: 'dFactor', subFactor: 'egoism', text: '상황이 급하면 내 이익을 위해 타인의 사정은 무시할 수 있다.', order: 5 },
  { id: 'e2', category: 'dFactor', subFactor: 'egoism', text: '솔직히 타인의 고민보다는 내 작은 문제가 더 중요하게 느껴진다.', order: 6 },
  { id: 'e3', category: 'dFactor', subFactor: 'egoism', text: '나는 어떤 결정 상황에서도 나를 최우선으로 고려한다.', order: 7 },
  { id: 'en1', category: 'dFactor', subFactor: 'entitlement', text: '나는 규칙이나 순서가 나에게는 유연하게 적용되어도 된다고 본다.', order: 8 },
  { id: 'en2', category: 'dFactor', subFactor: 'entitlement', text: '내가 원하는 것을 얻지 못하면 세상이 불공정하다고 느낀다.', order: 9 },
  { id: 'en3', category: 'dFactor', subFactor: 'entitlement', text: '사람들은 내 기대나 요구에 맞춰 행동해야 한다고 생각한다.', order: 10 },
  { id: 'm1', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '큰 목표를 달성하기 위해서라면 도덕적 규칙은 잠시 접어둘 수 있다.', order: 11 },
  { id: 'm2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '사람들을 내 의도대로 조종하여 원하는 결과를 얻는 것은 능력이다.', order: 12 },
  { id: 'm3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '경쟁자의 약점을 파악해 이용하는 것은 현명한 전략이라고 생각한다.', order: 13 },
  { id: 'm4', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: "나는 사람을 만날 때 '이 사람이 나에게 얼마나 유용한가'를 먼저 계산한다.", order: 14 },
  { id: 'p1', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'egoism', text: '나는 장기적 결과를 생각하지 않고 당장 하고 싶은 대로 행동하곤 한다.', order: 15 },
  { id: 'p2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'spitefulness', text: '누군가 울거나 괴로워해도 별다른 감정 동요가 느껴지지 않는다.', order: 16 },
  { id: 'p3', category: 'darkTetrad', trait: 'psychopathy', text: '법이나 규칙을 어기더라도 스릴과 흥분이 느껴지는 일을 선호한다.', order: 17 },
  { id: 'p4', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '내 잘못으로 문제가 생겨도, 상황이나 남 탓을 하며 빠져나갈 구멍을 찾는다.', order: 18 },
  { id: 'sc1', category: 'scenario', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '[상황] 승진 경쟁 중 경쟁자의 치명적 실수를 발견했다. 나는 이를 모른 척하거나 은밀히 퍼뜨려 그를 탈락시킬 것이다.', order: 19 },
  { id: 'sc2', category: 'scenario', trait: 'narcissism', subFactor: 'spitefulness', text: '[상황] 나에게 망신을 준 친구가 있다. 나는 기회가 온다면 공개적인 자리에서 그를 깎아내려 앙갚음할 것이다.', order: 20 },
  { id: 'sc3', category: 'scenario', trait: 'narcissism', subFactor: 'entitlement', text: '[상황] 팀 프로젝트에서 내 공로가 충분히 인정받지 못했다. 나는 프로젝트 전체가 망가지더라도 불만을 표출하거나 협조를 거부할 것이다.', order: 21 },
  { id: 'sc4', category: 'scenario', trait: 'psychopathy', subFactor: 'egoism', text: '[상황] 타인에게 큰 감정적 상처를 줘야만 내가 큰 이득을 보는 상황이다. 나는 주저 없이 내 이득을 선택할 것이다.', order: 22 },
  { id: 'md1', category: 'dFactor', subFactor: 'moralDisengagement', text: '결과가 훌륭하다면, 그 과정에서 있었던 약간의 속임수는 용서받을 수 있다.', order: 23 },
  { id: 'md2', category: 'dFactor', subFactor: 'moralDisengagement', text: '세상은 원래 이용하고 이용당하는 곳이므로, 먼저 선수 치는 것이 낫다.', order: 24 },
  { id: 'md3', category: 'dFactor', subFactor: 'moralDisengagement', text: '도덕이나 양심은 약자만이 지키는 것이라고 생각할 때가 있다.', order: 25 },
  { id: 's1', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '논쟁 중 상대가 말문이 막혀 당황하거나 수치스러워하는 모습을 보면 묘한 쾌감이 든다.', order: 26 },
  { id: 's2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '영화나 게임에서 잔혹한 장면이 나와도 눈을 돌리기보다 흥미롭게 지켜보는 편이다.', order: 27 },
  { id: 's3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '나는 농담을 가장해 상대방의 아픈 곳을 찌르고, 그 반응을 즐기는 편이다.', order: 28 },
  { id: 's4', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '잘난 체하는 사람을 짓밟아 기를 꺾어놓을 때 짜릿한 희열을 느낀다.', order: 29 },
  { id: 'sp1', category: 'dFactor', subFactor: 'spitefulness', text: '가끔 심심하면 온라인이나 오프라인에서 고의로 시비를 걸거나 남을 화나게 해본다.', order: 30 },
  { id: 'sp2', category: 'dFactor', subFactor: 'spitefulness', text: '타인이 불행한 일을 겪으면 겉으로는 위로하지만 속으로는 "쌤통이다"라고 느낀다.', order: 31 },
  { id: 'sp3', category: 'dFactor', subFactor: 'spitefulness', text: '내가 손해를 좀 보더라도, 싫어하는 사람이 망하는 꼴을 볼 수 있다면 감수할 수 있다.', order: 32 },
  { id: 'v1', category: 'validation', text: '나는 이 테스트의 모든 문항에 거짓 없이 솔직하게 답하고 있다.', order: 33 },
  { id: 'm5', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'egoism', text: '나는 비밀을 지키는 것보다, 그 정보를 누설해서 얻을 이익이 크다면 누설할 수 있다.', order: 34 },
  { id: 'v3', category: 'validation', text: '나는 나를 실제보다 더 착한 사람처럼 보이게 하려고 답변을 고른 적이 있다.', order: 35, isReverse: true },
  { id: 'p5', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '나는 내가 한 거짓말이 들통나도, 당황하기보다 태연하게 대처할 자신이 있다.', order: 36 },
  { id: 's5', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '나는 연인이나 친구를 내 뜻대로 통제하기 위해 일부러 질투심을 유발하거나 불안하게 만든 적이 있다.', order: 37 },
  { id: 'sp4', category: 'dFactor', subFactor: 'spitefulness', text: '누군가 나를 무시하면, 반드시 기억했다가 어떤 방식으로든 대가를 치르게 해야 직성이 풀린다.', order: 38 },
  { id: 'v7', category: 'validation', text: '솔직히, 사회적으로 비난받을 만한 생각은 숨기고 답변한 적이 있다.', order: 39, isReverse: true },
  { id: 'v4', category: 'validation', text: '지금 선택한 답변들은 나의 실제 성격과 일치한다.', order: 40 },
  { id: 'n1b', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '나는 내가 평균적인 사람들보다 훨씬 뛰어난 존재라고 생각한다.', order: 41 },
  { id: 'm1b', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '목표 달성이 중요하다면, 도덕적 기준은 상황에 맞춰 융통성 있게 바꿔도 된다.', order: 42 },
];

/** order 순 정렬된 42문항 (테스트 UI·API 사용). 검증 4문항(v1,v3,v7,v4), isReverse=v3,v7만 */
export const MNPS_QUESTIONS: Question[] = [...DARK_NATURE_QUESTIONS].sort((a, b) => a.order - b.order);

// --- 문제 은행 (126문항 = 42슬롯 × 3변형). 재검사 시 문항 조합 다양화 ---

/** 슬롯별 변형 2 (v2). 원본과 동일 trait/subFactor/category, 다른 문장 */
const DARK_NATURE_QUESTIONS_V2: Question[] = [
  { id: 'n1_v2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '나는 대부분의 사람들보다 능력이 뛰어나다고 스스로 믿는 편이다.', order: 1 },
  { id: 'n2_v2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '주변의 인정이나 칭찬이 없으면 불만스럽고 허전함을 느낀다.', order: 2 },
  { id: 'n3_v2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '내 수준에 걸맞은 특별 대우를 받는 것은 당연한 권리라고 생각한다.', order: 3 },
  { id: 'n4_v2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '평범한 삶을 사는 것은 내 정체성과 맞지 않는다.', order: 4 },
  { id: 'e1_v2', category: 'dFactor', subFactor: 'egoism', text: '긴급한 상황에서는 내 이익을 위해 다른 사람의 상황을 뒤로 미룰 수 있다.', order: 5 },
  { id: 'e2_v2', category: 'dFactor', subFactor: 'egoism', text: '다른 사람의 문제보다 내 일이 더 시급하고 중요하다고 느낀다.', order: 6 },
  { id: 'e3_v2', category: 'dFactor', subFactor: 'egoism', text: '결정을 내릴 때 나의 이익을 가장 먼저 고려한다.', order: 7 },
  { id: 'en1_v2', category: 'dFactor', subFactor: 'entitlement', text: '규칙은 상황에 따라 나에게는 유연하게 적용되어도 된다고 본다.', order: 8 },
  { id: 'en2_v2', category: 'dFactor', subFactor: 'entitlement', text: '원하는 것을 얻지 못하면 불공정하다고 느낀다.', order: 9 },
  { id: 'en3_v2', category: 'dFactor', subFactor: 'entitlement', text: '주변 사람들은 내 요구나 기대에 부응해야 한다고 생각한다.', order: 10 },
  { id: 'm1_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '중요한 목표를 위해서는 도덕적 원칙을 일시적으로 유보할 수 있다.', order: 11 },
  { id: 'm2_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '원하는 결과를 얻기 위해 사람을 설득·영향시키는 것은 실력이다.', order: 12 },
  { id: 'm3_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '경쟁 상대의 약점을 활용하는 것은 비도덕적이기보다 전략적이다.', order: 13 },
  { id: 'm4_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '새로운 사람을 만날 때 그 사람이 나에게 도움이 될지 먼저 판단한다.', order: 14 },
  { id: 'p1_v2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'egoism', text: '결과를 생각하기보다 당장 하고 싶은 대로 행동하는 편이다.', order: 15 },
  { id: 'p2_v2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'spitefulness', text: '다른 사람이 울거나 괴로워해도 크게 공감이 되지 않는다.', order: 16 },
  { id: 'p3_v2', category: 'darkTetrad', trait: 'psychopathy', text: '규칙을 어겨가며 하는 일에서 스릴을 느낀다.', order: 17 },
  { id: 'p4_v2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '문제가 생기면 내 책임이라도 상황이나 타인 탓으로 돌리며 빠져나가려 한다.', order: 18 },
  { id: 'sc1_v2', category: 'scenario', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '[상황] 승진 경쟁에서 경쟁자의 치명적 실수를 알게 되었다. 나는 그 정보를 활용해 그를 제거하는 쪽을 택할 수 있다.', order: 19 },
  { id: 'sc2_v2', category: 'scenario', trait: 'narcissism', subFactor: 'spitefulness', text: '[상황] 나를 공개적으로 무시한 사람이 있다. 기회가 되면 그 사람을 같은 방식으로 굴욕시키겠다.', order: 20 },
  { id: 'sc3_v2', category: 'scenario', trait: 'narcissism', subFactor: 'entitlement', text: '[상황] 팀 성과에서 내 기여가 제대로 인정받지 못했다. 필요하다면 협력을 거부하거나 불만을 드러내겠다.', order: 21 },
  { id: 'sc4_v2', category: 'scenario', trait: 'psychopathy', subFactor: 'egoism', text: '[상황] 내가 큰 이득을 보려면 상대방에게 감정적 피해를 줘야 한다. 나는 그 선택을 할 수 있다.', order: 22 },
  { id: 'md1_v2', category: 'dFactor', subFactor: 'moralDisengagement', text: '최종 결과가 좋다면 과정의 작은 부정은 정당화될 수 있다고 본다.', order: 23 },
  { id: 'md2_v2', category: 'dFactor', subFactor: 'moralDisengagement', text: '세상은 서로 이용하는 구조이므로 먼저 움직이는 쪽이 유리하다.', order: 24 },
  { id: 'md3_v2', category: 'dFactor', subFactor: 'moralDisengagement', text: '도덕과 양심은 여유 없는 사람들이나 고수하는 것 같다.', order: 25 },
  { id: 's1_v2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '말다툼에서 상대가 당황하거나 굴욕당하는 모습을 보면 쾌감이 든다.', order: 26 },
  { id: 's2_v2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '폭력적이거나 잔인한 장면이 나와도 불쾌하기보다 흥미롭게 본다.', order: 27 },
  { id: 's3_v2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '농담을 빌미로 상대의 약점을 건드리고 반응을 보는 것을 즐긴다.', order: 28 },
  { id: 's4_v2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '잘난 체하는 사람을 무너뜨릴 때 성취감과 희열을 느낀다.', order: 29 },
  { id: 'sp1_v2', category: 'dFactor', subFactor: 'spitefulness', text: '가끔 심심할 때 고의로 논쟁을 걸거나 상대를 자극해 본다.', order: 30 },
  { id: 'sp2_v2', category: 'dFactor', subFactor: 'spitefulness', text: '남이 불행해도 겉으로만 위로하고 속으로는 통쾌할 때가 있다.', order: 31 },
  { id: 'sp3_v2', category: 'dFactor', subFactor: 'spitefulness', text: '내가 조금 손해를 보더라도 싫은 사람이 실패하는 걸 보는 데 만족한다.', order: 32 },
  { id: 'v1_v2', category: 'validation', text: '이 검사에 거짓 없이 솔직하게 응답하고 있다.', order: 33 },
  { id: 'm5_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'egoism', text: '이득이 크다면 비밀을 지킬 의무보다 정보를 활용하는 쪽을 택할 수 있다.', order: 34 },
  { id: 'v3_v2', category: 'validation', text: '나를 더 좋은 사람처럼 보이게 하려고 답을 바꾼 적이 있다.', order: 35, isReverse: true },
  { id: 'p5_v2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '거짓말이 탄로나도 당황하지 않고 침착하게 넘어갈 수 있다.', order: 36 },
  { id: 's5_v2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '가까운 사람을 통제하기 위해 의도적으로 불안이나 질투를 유발한 적이 있다.', order: 37 },
  { id: 'sp4_v2', category: 'dFactor', subFactor: 'spitefulness', text: '나를 무시한 사람은 반드시 기억했다가 대가를 치르게 하고 싶다.', order: 38 },
  { id: 'v7_v2', category: 'validation', text: '사회적으로 비난받을 만한 생각은 숨기고 답한 적이 있다.', order: 39, isReverse: true },
  { id: 'v4_v2', category: 'validation', text: '지금 선택한 답은 내 실제 생각과 일치한다.', order: 40 },
  { id: 'n1b_v2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '나는 일반인보다 훨씬 우수한 편에 속한다고 생각한다.', order: 41 },
  { id: 'm1b_v2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '목표가 중요할수록 도덕적 기준은 상황에 맞게 조정해도 된다.', order: 42 },
];

/** 슬롯별 변형 3 (v3). 원본과 동일 trait/subFactor/category, 다른 문장 */
const DARK_NATURE_QUESTIONS_V3: Question[] = [
  { id: 'n1_v3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '평균적인 사람들과 비교했을 때 나는 더 뛰어나다고 느낀다.', order: 1 },
  { id: 'n2_v3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '인정받지 못하는 환경에서는 불안하고 초조해진다.', order: 2 },
  { id: 'n3_v3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '내 능력이라면 특별한 대우를 요구해도 마땅하다고 생각한다.', order: 3 },
  { id: 'n4_v3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '남들과 동일한 수준의 삶을 사는 것은 나에게 맞지 않는다.', order: 4 },
  { id: 'e1_v3', category: 'dFactor', subFactor: 'egoism', text: '위기 상황에서는 내 이익을 위해 타인의 이익을 희생할 수 있다.', order: 5 },
  { id: 'e2_v3', category: 'dFactor', subFactor: 'egoism', text: '솔직히 말해 타인의 고민보다 내 문제가 더 신경 쓰인다.', order: 6 },
  { id: 'e3_v3', category: 'dFactor', subFactor: 'egoism', text: '어떤 선택이든 나를 최우선에 두고 판단한다.', order: 7 },
  { id: 'en1_v3', category: 'dFactor', subFactor: 'entitlement', text: '규칙이나 순서는 나에게는 예외가 허용될 수 있다고 본다.', order: 8 },
  { id: 'en2_v3', category: 'dFactor', subFactor: 'entitlement', text: '원하는 것을 얻지 못하면 세상이 나에게 불공정하다고 느껴진다.', order: 9 },
  { id: 'en3_v3', category: 'dFactor', subFactor: 'entitlement', text: '주변은 내 기대에 맞춰 움직여 주는 것이 당연하다고 느낀다.', order: 10 },
  { id: 'm1_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '큰 성과를 위해서라면 도덕적 원칙을 잠시 내려놓을 수 있다.', order: 11 },
  { id: 'm2_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '사람을 내 계획대로 움직여 결과를 얻는 것은 능력의 하나다.', order: 12 },
  { id: 'm3_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '경쟁자의 약점을 활용하는 것은 비열함이 아니라 전략이다.', order: 13 },
  { id: 'm4_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '사람을 만날 때 "이 사람이 나에게 어떤 가치가 있는가"를 먼저 생각한다.', order: 14 },
  { id: 'p1_v3', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'egoism', text: '장기적 결과보다 당장의 욕구를 따라 행동하는 편이다.', order: 15 },
  { id: 'p2_v3', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'spitefulness', text: '타인이 감정적으로 힘들어해도 공감이 잘 되지 않는다.', order: 16 },
  { id: 'p3_v3', category: 'darkTetrad', trait: 'psychopathy', text: '규칙을 깨는 일에서 오는 스릴을 선호한다.', order: 17 },
  { id: 'p4_v3', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '내 실수로 문제가 생겨도 책임을 돌리거나 변명하며 빠져나가려 한다.', order: 18 },
  { id: 'sc1_v3', category: 'scenario', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '[상황] 승진 경쟁에서 경쟁자의 치명적 약점을 알게 됐다. 나는 그를 탈락시키는 데 활용할 수 있다.', order: 19 },
  { id: 'sc2_v3', category: 'scenario', trait: 'narcissism', subFactor: 'spitefulness', text: '[상황] 나를 망신시킨 사람이 있다. 기회가 오면 그 사람을 공개적으로 깎아내리겠다.', order: 20 },
  { id: 'sc3_v3', category: 'scenario', trait: 'narcissism', subFactor: 'entitlement', text: '[상황] 내 기여가 제대로 인정되지 않은 프로젝트라면, 불만을 표출하거나 협조를 줄일 수 있다.', order: 21 },
  { id: 'sc4_v3', category: 'scenario', trait: 'psychopathy', subFactor: 'egoism', text: '[상황] 큰 이득을 위해 상대에게 감정적 상처를 줘야 한다면, 나는 그 선택을 할 수 있다.', order: 22 },
  { id: 'md1_v3', category: 'dFactor', subFactor: 'moralDisengagement', text: '결과가 좋다면 과정의 작은 부정은 넘어갈 수 있다고 본다.', order: 23 },
  { id: 'md2_v3', category: 'dFactor', subFactor: 'moralDisengagement', text: '이용당하지 않으려면 먼저 이용하는 쪽이 유리하다.', order: 24 },
  { id: 'md3_v3', category: 'dFactor', subFactor: 'moralDisengagement', text: '양심과 도덕은 여유 있는 사람들의 여유일 뿐이라고 느낄 때가 있다.', order: 25 },
  { id: 's1_v3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '상대가 말문이 막혀 당황하는 모습을 보면 묘한 만족감이 든다.', order: 26 },
  { id: 's2_v3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '잔혹하거나 폭력적인 콘텐츠를 볼 때 거부감보다 흥미가 더 크다.', order: 27 },
  { id: 's3_v3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '상대의 아픈 곳을 건드리는 말을 하고 그 반응을 보는 것을 즐긴다.', order: 28 },
  { id: 's4_v3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '잘난 체하는 사람을 무너뜨리는 데서 쾌감을 느낀다.', order: 29 },
  { id: 'sp1_v3', category: 'dFactor', subFactor: 'spitefulness', text: '심심할 때 고의로 말다툼을 하거나 상대를 화나게 해 본 적이 있다.', order: 30 },
  { id: 'sp2_v3', category: 'dFactor', subFactor: 'spitefulness', text: '남이 불행할 때 겉으로는 동정하지만 속으로는 쌤통이라고 느낀다.', order: 31 },
  { id: 'sp3_v3', category: 'dFactor', subFactor: 'spitefulness', text: '손해를 감수하더라도 싫은 사람이 실패하는 모습을 보고 싶다.', order: 32 },
  { id: 'v1_v3', category: 'validation', text: '모든 문항에 거짓 없이 솔직하게 답하고 있다.', order: 33 },
  { id: 'm5_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'egoism', text: '이익이 충분하면 비밀 유지보다 정보를 활용하는 것을 선택할 수 있다.', order: 34 },
  { id: 'v3_v3', category: 'validation', text: '실제보다 더 착하게 보이려고 답을 고른 적이 있다.', order: 35, isReverse: true },
  { id: 'p5_v3', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '거짓말이 들통나도 당황하지 않고 담담히 대할 수 있다.', order: 36 },
  { id: 's5_v3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '친밀한 관계에서 통제권을 갖기 위해 질투나 불안을 유발한 적이 있다.', order: 37 },
  { id: 'sp4_v3', category: 'dFactor', subFactor: 'spitefulness', text: '나를 무시한 사람은 반드시 어떤 형태로든 대가를 치르게 해야 직성이 풀린다.', order: 38 },
  { id: 'v7_v3', category: 'validation', text: '비난받을 만한 생각은 숨기고 답변한 적이 있다.', order: 39, isReverse: true },
  { id: 'v4_v3', category: 'validation', text: '선택한 답은 나의 실제 성격과 맞다.', order: 40 },
  { id: 'n1b_v3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '나는 평균보다 훨씬 뛰어난 사람이라고 생각한다.', order: 41 },
  { id: 'm1b_v3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '목표가 중요하다면 도덕적 기준은 상황에 따라 바꿔도 된다.', order: 42 },
];

/** 42개 슬롯별 문항 ID (order 1~42). 각 슬롯에서 1개만 선택해 42문항 구성 */
const SLOT_IDS: readonly (readonly string[])[] = [
  ['n1', 'n1_v2', 'n1_v3'], ['n2', 'n2_v2', 'n2_v3'], ['n3', 'n3_v2', 'n3_v3'], ['n4', 'n4_v2', 'n4_v3'],
  ['e1', 'e1_v2', 'e1_v3'], ['e2', 'e2_v2', 'e2_v3'], ['e3', 'e3_v2', 'e3_v3'],
  ['en1', 'en1_v2', 'en1_v3'], ['en2', 'en2_v2', 'en2_v3'], ['en3', 'en3_v2', 'en3_v3'],
  ['m1', 'm1_v2', 'm1_v3'], ['m2', 'm2_v2', 'm2_v3'], ['m3', 'm3_v2', 'm3_v3'], ['m4', 'm4_v2', 'm4_v3'],
  ['p1', 'p1_v2', 'p1_v3'], ['p2', 'p2_v2', 'p2_v3'], ['p3', 'p3_v2', 'p3_v3'], ['p4', 'p4_v2', 'p4_v3'],
  ['sc1', 'sc1_v2', 'sc1_v3'], ['sc2', 'sc2_v2', 'sc2_v3'], ['sc3', 'sc3_v2', 'sc3_v3'], ['sc4', 'sc4_v2', 'sc4_v3'],
  ['md1', 'md1_v2', 'md1_v3'], ['md2', 'md2_v2', 'md2_v3'], ['md3', 'md3_v2', 'md3_v3'],
  ['s1', 's1_v2', 's1_v3'], ['s2', 's2_v2', 's2_v3'], ['s3', 's3_v2', 's3_v3'], ['s4', 's4_v2', 's4_v3'],
  ['sp1', 'sp1_v2', 'sp1_v3'], ['sp2', 'sp2_v2', 'sp2_v3'], ['sp3', 'sp3_v2', 'sp3_v3'],
  ['v1', 'v1_v2', 'v1_v3'], ['m5', 'm5_v2', 'm5_v3'], ['v3', 'v3_v2', 'v3_v3'], ['p5', 'p5_v2', 'p5_v3'],
  ['s5', 's5_v2', 's5_v3'], ['sp4', 'sp4_v2', 'sp4_v3'], ['v7', 'v7_v2', 'v7_v3'], ['v4', 'v4_v2', 'v4_v3'],
  ['n1b', 'n1b_v2', 'n1b_v3'], ['m1b', 'm1b_v2', 'm1b_v3'],
];

/** 전체 문제 은행 (126문항). id → Question 맵 */
const QUESTION_BANK_MAP = new Map<string, Question>(
  [...DARK_NATURE_QUESTIONS, ...DARK_NATURE_QUESTIONS_V2, ...DARK_NATURE_QUESTIONS_V3]
    .map((q) => [q.id, q] as const)
);

/** 슬롯당 1문항 랜덤 선택 후 order 순 정렬. 재검사 시 다른 문항 조합으로 42문항 출제 */
export function getRandomQuestionSet(): Question[] {
  const chosen: Question[] = [];
  for (const slot of SLOT_IDS) {
    const idx = Math.floor(Math.random() * slot.length);
    const id = slot[idx];
    const q = QUESTION_BANK_MAP.get(id);
    if (q) chosen.push(q);
  }
  return chosen.sort((a, b) => a.order - b.order);
}

/** 문항 id로 문제 은행에서 조회 (클라이언트/API에서 trait·subFactor 조회용) */
export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK_MAP.get(id);
}

/** 일관성 쌍 매칭용: id → base id (n1_v2 → n1, n1b_v3 → n1b) */
export function getConsistencyBaseId(questionId: string): string {
  const m = questionId.match(/^(.+?)(_v\d+)?$/);
  return m ? m[1] : questionId;
}

/** 문제 은행 전체 문항 수 */
export const QUESTION_BANK_SIZE = 126;
