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
  { id: 'n2', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '사람들이 나를 주목하고 칭찬해 주지 않으면 견디기 힘들다.', order: 2 },
  { id: 'n3', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '내가 특별한 대우를 요구하는 것은 내 능력에 비추어 볼 때 당연하다.', order: 3 },
  { id: 'n4', category: 'darkTetrad', trait: 'narcissism', subFactor: 'entitlement', text: '남들과 똑같이 평범하게 사는 것은 나에게 어울리지 않는다.', order: 4 },
  { id: 'e1', category: 'dFactor', subFactor: 'egoism', text: '상황이 급하면 내 이익을 위해 타인의 사정은 무시할 수 있다.', order: 5 },
  { id: 'e2', category: 'dFactor', subFactor: 'egoism', text: '솔직히 타인의 고민보다는 내 작은 문제가 더 중요하게 느껴진다.', order: 6 },
  { id: 'e3', category: 'dFactor', subFactor: 'egoism', text: '나는 어떤 결정 상황에서도 나를 최우선으로 고려한다.', order: 7 },
  { id: 'en1', category: 'dFactor', subFactor: 'entitlement', text: '나는 규칙이나 줄 서기 같은 것들이 나에게는 유동적으로 적용될 수 있다고 본다.', order: 8 },
  { id: 'en2', category: 'dFactor', subFactor: 'entitlement', text: '내가 원하는 것을 얻지 못하면 세상이 불공정하다고 느낀다.', order: 9 },
  { id: 'en3', category: 'dFactor', subFactor: 'entitlement', text: '사람들은 내 기대나 요구에 맞춰 행동해야 한다고 생각한다.', order: 10 },
  { id: 'm1', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '큰 목표를 달성하기 위해서라면 도덕적 규칙은 잠시 접어둘 수 있다.', order: 11 },
  { id: 'm2', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '사람들을 내 의도대로 조종하여 원하는 결과를 얻는 것은 능력이다.', order: 12 },
  { id: 'm3', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '경쟁자의 약점을 파악해 이용하는 것은 비열한 게 아니라 현명한 전략이다.', order: 13 },
  { id: 'm4', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: "나는 사람을 만날 때 '이 사람이 나에게 얼마나 유용한가'를 먼저 계산한다.", order: 14 },
  { id: 'p1', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'egoism', text: '(매핑수정) 나는 뒷일은 생각하지 않고 기분 내키는 대로 행동하곤 한다.', order: 15 },
  { id: 'p2', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'spitefulness', text: '(매핑수정) 누군가 울거나 괴로워해도 별다른 감정 동요가 느껴지지 않는다.', order: 16 },
  { id: 'p3', category: 'darkTetrad', trait: 'psychopathy', text: '법이나 규칙을 어기더라도 스릴과 흥분이 느껴지는 일을 선호한다.', order: 17 },
  { id: 'p4', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '내 잘못으로 문제가 생겨도, 상황이나 남 탓을 하며 빠져나갈 구멍을 찾는다.', order: 18 },
  { id: 'sc1', category: 'scenario', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '[상황] 승진 경쟁 중 경쟁자의 치명적 실수를 발견했다. 나는 이를 모른 척하거나 은밀히 퍼뜨려 그를 탈락시킬 것이다.', order: 19 },
  { id: 'sc2', category: 'scenario', trait: 'narcissism', subFactor: 'spitefulness', text: '[상황] 나에게 망신을 준 친구가 있다. 나는 기회가 온다면 공개적인 자리에서 그를 깎아내려 앙갚음할 것이다.', order: 20 },
  { id: 'sc3', category: 'scenario', trait: 'narcissism', subFactor: 'entitlement', text: '[상황] 팀 프로젝트에서 내 공로가 충분히 인정받지 못했다. 나는 프로젝트 전체가 망가지더라도 불만을 표출하거나 협조를 거부할 것이다.', order: 21 },
  { id: 'sc4', category: 'scenario', trait: 'psychopathy', subFactor: 'egoism', text: '[상황] 타인에게 큰 감정적 상처를 줘야만 내가 큰 이득을 보는 상황이다. 나는 주저 없이 내 이득을 선택할 것이다.', order: 22 },
  { id: 'md1', category: 'dFactor', subFactor: 'moralDisengagement', text: '결과가 훌륭하다면, 그 과정에서 있었던 약간의 속임수는 용서받을 수 있다.', order: 23 },
  { id: 'md2', category: 'dFactor', subFactor: 'moralDisengagement', text: '세상은 원래 이용하고 이용당하는 곳이므로, 먼저 선수 치는 것이 낫다.', order: 24 },
  { id: 'md3', category: 'dFactor', subFactor: 'moralDisengagement', text: '도덕이나 양심은 약자들이나 지키는 것이라고 생각할 때가 있다.', order: 25 },
  { id: 's1', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '논쟁 중 상대가 말문이 막혀 당황하거나 수치스러워하는 모습을 보면 묘한 쾌감이 든다.', order: 26 },
  { id: 's2', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '영화나 게임에서 잔혹한 장면이 나와도 눈을 돌리기보다 흥미롭게 지켜보는 편이다.', order: 27 },
  { id: 's3', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '나는 농담을 가장해 상대방의 아픈 곳을 찌르고, 그 반응을 즐기는 편이다.', order: 28 },
  { id: 's4', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '잘난 척하는 사람을 짓밟아 기를 꺾어놓을 때 짜릿한 희열을 느낀다.', order: 29 },
  { id: 'sp1', category: 'dFactor', subFactor: 'spitefulness', text: '가끔 심심하면 온라인이나 오프라인에서 고의로 시비를 걸거나 남을 화나게 해본다.', order: 30 },
  { id: 'sp2', category: 'dFactor', subFactor: 'spitefulness', text: '타인이 불행한 일을 겪으면 겉으로는 위로하지만 속으로는 "쌤통이다"라고 느낀다.', order: 31 },
  { id: 'sp3', category: 'dFactor', subFactor: 'spitefulness', text: '내가 손해를 좀 보더라도, 싫어하는 사람이 망하는 꼴을 볼 수 있다면 감수할 수 있다.', order: 32 },
  { id: 'v1', category: 'validation', text: '(검증) 나는 이 테스트의 모든 문항에 거짓 없이 솔직하게 답하고 있다.', order: 33 },
  { id: 'm5', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'egoism', text: '(신규) 나는 비밀을 지키는 것보다, 그 정보를 누설해서 얻을 이익이 크다면 누설할 수 있다.', order: 34 },
  { id: 'v3', category: 'validation', text: '(검증) 나는 나를 실제보다 더 착한 사람처럼 보이게 하려고 답변을 고른 적이 있다.', order: 35, isReverse: true },
  { id: 'p5', category: 'darkTetrad', trait: 'psychopathy', subFactor: 'moralDisengagement', text: '(신규) 나는 내가 한 거짓말이 들통나도, 당황하기보다 태연하게 대처할 자신이 있다.', order: 36 },
  { id: 's5', category: 'darkTetrad', trait: 'sadism', subFactor: 'spitefulness', text: '(신규) 나는 연인이나 친구를 내 뜻대로 통제하기 위해 일부러 질투심을 유발하거나 불안하게 만든 적이 있다.', order: 37 },
  { id: 'sp4', category: 'dFactor', subFactor: 'spitefulness', text: '(신규) 누군가 나를 무시하면, 반드시 기억해뒀다가 어떤 방식으로든 대가를 치르게 해야 직성이 풀린다.', order: 38 },
  { id: 'v7', category: 'validation', text: '(검증) 솔직히, 사회적으로 비난받을 만한 생각은 숨기고 답변했다.', order: 39, isReverse: true },
  { id: 'v4', category: 'validation', text: '(검증) 지금 체크하고 있는 답변들은 나의 실제 성격과 일치한다.', order: 40 },
  { id: 'n1b', category: 'darkTetrad', trait: 'narcissism', subFactor: 'egoism', text: '(일관성쌍) 나는 내가 평균적인 사람들보다는 훨씬 뛰어난 존재라고 생각한다.', order: 41 },
  { id: 'm1b', category: 'darkTetrad', trait: 'machiavellianism', subFactor: 'moralDisengagement', text: '(일관성쌍) 목표 달성이 중요하다면, 도덕적 기준은 상황에 맞춰 융통성 있게 바꿔도 된다.', order: 42 },
];

/** order 순 정렬된 42문항 (테스트 UI·API 사용). 검증 4문항(v1,v3,v7,v4), isReverse=v3,v7만 */
export const MNPS_QUESTIONS: Question[] = [...DARK_NATURE_QUESTIONS].sort((a, b) => a.order - b.order);
