export type MnpsTrait = 'machiavellianism' | 'narcissism' | 'psychopathy' | 'sadism';

export type MnpsQuestion = {
  id: string;
  trait: MnpsTrait;
  text: string;
};

export const MNPS_OPTIONS = [
  { label: '전혀 아니다', value: 1 },
  { label: '아니다', value: 2 },
  { label: '보통이다', value: 3 },
  { label: '그렇다', value: 4 },
  { label: '매우 그렇다', value: 5 },
];

export const MNPS_QUESTIONS: MnpsQuestion[] = [
  // Machiavellianism
  {
    id: 'm1',
    trait: 'machiavellianism',
    text: '목적을 달성하기 위해서라면, 도덕적으로 의심스러운 수단도 정당화될 수 있다고 생각한다.',
  },
  {
    id: 'm2',
    trait: 'machiavellianism',
    text: '사람에게 중요한 정보를 숨기는 것이 효과적일 때가 많다고 느낀다.',
  },
  {
    id: 'm3',
    trait: 'machiavellianism',
    text: '세상은 결국 강한 사람이 이기는 구조라고 믿는다.',
  },
  {
    id: 'm4',
    trait: 'machiavellianism',
    text: '상황에 따라 태도를 바꾸는 것이 생존에 유리하다고 생각한다.',
  },
  // Narcissism
  {
    id: 'n1',
    trait: 'narcissism',
    text: '나는 대부분의 사람보다 더 특별한 존재라고 느낀다.',
  },
  {
    id: 'n2',
    trait: 'narcissism',
    text: '사람들의 관심과 칭찬을 꾸준히 받고 싶다.',
  },
  {
    id: 'n3',
    trait: 'narcissism',
    text: '평범한 삶은 나에게 맞지 않는다고 느낀다.',
  },
  {
    id: 'n4',
    trait: 'narcissism',
    text: '내 요구가 빨리 받아들여지지 않으면 불쾌하다.',
  },
  // Psychopathy
  {
    id: 'p1',
    trait: 'psychopathy',
    text: '나는 즉흥적으로 행동하는 편이다.',
  },
  {
    id: 'p2',
    trait: 'psychopathy',
    text: '타인의 고통에 크게 공감하지 않는 편이다.',
  },
  {
    id: 'p3',
    trait: 'psychopathy',
    text: '위험하거나 스릴 있는 일을 즐기는 편이다.',
  },
  {
    id: 'p4',
    trait: 'psychopathy',
    text: '내 행동에 대해 변명하거나 남 탓을 하는 경우가 있다.',
  },
  // Sadism
  {
    id: 's1',
    trait: 'sadism',
    text: '타인이 공개적으로 난처해지는 모습을 보면 통쾌함을 느낀다.',
  },
  {
    id: 's2',
    trait: 'sadism',
    text: '상대의 약점을 파고들어 상처 주는 말을 하는 편이다.',
  },
  {
    id: 's3',
    trait: 'sadism',
    text: '온라인에서 갈등을 유발하거나 반응을 끌어내는 것이 재미있다.',
  },
  {
    id: 's4',
    trait: 'sadism',
    text: '갈등 상황을 직접 보거나 관찰하는 것이 흥미롭다.',
  },
];
