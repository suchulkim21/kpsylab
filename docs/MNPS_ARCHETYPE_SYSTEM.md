# MNPS 아키타입 시스템 (Dynamic Profile Matrix)

## 개요

MNPS 테스트는 **19종 세분화 아키타입 시스템**을 사용합니다. 단순한 특성 조합이 아닌, **지배(Dominant) 성향**, **보조(Auxiliary) 성향**, **점수 격차(Gap)**, **전체 강도(Intensity)**를 기반으로 동적으로 분류합니다.

---

## 아키타입 결정 로직

### 1. 우선순위 규칙

```typescript
function determineArchetype(scores: DarkTraitScores, dTotal: number): MnpsArchetypeId {
  // 1. DARK_APEX: 모든 특성 >= 75
  if (allScores >= 75) return 'DARK_APEX';
  
  // 2. ALL_LOW: 최고점 < 50
  if (maxScore < 50) return 'ALL_LOW';
  
  // 3. Pure Type: gap >= 15 AND 최고점 >= 60
  if (gap >= 15 && primaryScore >= 60) return `${PRIMARY}_PURE`;
  
  // 4. HYBRID_MID: 최고점 < 60
  if (primaryScore < 60) return 'HYBRID_MID';
  
  // 5. Hybrid Type: 지배 + 보조 조합
  return `${PRIMARY}_${SECONDARY}`;
}
```

### 2. 핵심 상수

| 상수 | 값 | 의미 |
|------|-----|------|
| `DARK_APEX_MIN` | 75 | 모든 특성이 이 값 이상이면 어둠의 정점 |
| `ALL_LOW_MAX` | 50 | 최고점이 이 값 미만이면 투명한 거울 |
| `PURE_MIN_SCORE` | 60 | Pure Type 최소 점수 |
| `PURE_GAP_PRECISE` | 15 | Pure Type 최소 격차 |
| `HYBRID_MID_MAX` | 60 | 최고점이 이 값 미만이면 하이브리드 카멜레온 |

---

## 아키타입 목록 (19종)

### Group A: Pure Types (순수형, 4종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `MACH_PURE` | The Cold Architect<br/>(차가운 설계자) | Mach ≥ 60, gap ≥ 15 | • 위기 상황에서 가장 빛나는 "인간 AI"<br/>• 감정 소모 없이 목표를 향해 직진<br/>• 비즈니스 협상·장기 전략에서 대체 불가능<br/>• 인간관계를 거래로 파악하는 치명적 결함 |
| `NARC_PURE` | The Glass Emperor<br/>(유리 황제) | Narc ≥ 60, gap ≥ 15 | • 어디서나 빛나는 압도적 존재감<br/>• 높은 자기 확신으로 불가능을 현실로<br/>• 자신감 자체가 강력한 브랜드<br/>• 비판에 취약한 "유리" 같은 자아 |
| `PSYCH_PURE` | The Impulse Engine<br/>(충동 엔진) | Psych ≥ 60, gap ≥ 15 | • 사회의 억압에서 완전히 자유로운 영혼<br/>• 어떤 상황에서도 주눅 들지 않는 강철 멘탈<br/>• 복잡한 고민 없이 즉각 행동하는 추진력<br/>• 계획·책임감·공감 능력 부족 위험 |
| `SAD_PURE` | The Iron Hand<br/>(강철 손) | Sad ≥ 60, gap ≥ 15 | • 흐트러진 기강을 바로잡는 탁월한 규율가<br/>• 타협 없는 원칙주의와 강력한 카리스마<br/>• 난세에 필요한 강력한 리더십<br/>• 공포로 지배하는 잔혹한 독재자 가능성 |

### Group B: Machiavellian Hybrids (마키아벨리즘 주도, 3종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `MACH_NARC` | The Stage Director<br/>(무대 연출가) | Mach > Narc | • 전략적 사고 + 카리스마의 완벽한 조합<br/>• 사람들을 자연스럽게 움직이는 연출 능력<br/>• 조직 내 권력 구조를 꿰뚫는 정치력<br/>• 타인을 도구로만 보는 냉혹함 |
| `MACH_PSYCH` | The Tactical Gambler<br/>(전술적 승부사) | Mach > Psych | • 전략적 계산 + 대담한 실행력<br/>• 위기를 기회로 전환하는 타이밍 감각<br/>• 스타트업·투자·협상에서 빛나는 능력<br/>• 과도한 리스크로 파국을 맞을 위험 |
| `MACH_SAD` | The Smiling Trap<br/>(웃는 덫) | Mach > Sad | • 친절한 외면 뒤 숨겨진 철저한 계산<br/>• 상대의 약점을 파악하고 활용하는 능력<br/>• 복수와 응징을 완벽하게 설계함<br/>• 신뢰를 무기로 타인을 파괴하는 위험성 |

### Group C: Narcissistic Hybrids (나르시시즘 주도, 3종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `NARC_MACH` | The Cult Leader<br/>(교주) | Narc > Mach | • 압도적 카리스마 + 전략적 메시지 설계<br/>• 사람들을 열광시키는 비전 제시 능력<br/>• 브랜드·종교·정치 리더로서의 잠재력<br/>• 맹신을 유도하는 위험한 선동가 가능성 |
| `NARC_PSYCH` | The Golden Storm<br/>(황금 폭풍) | Narc > Psych | • 어디서나 주목받는 압도적 존재감<br/>• 규칙에 얽매이지 않는 자유로운 영혼<br/>• 예술·엔터테인먼트 분야에서 빛나는 재능<br/>• 충동적 행동으로 모든 것을 파괴할 위험 |
| `NARC_SAD` | The Toxic Diva<br/>(독성 디바) | Narc > Sad | • 강렬한 존재감과 지배적 카리스마<br/>• 경쟁자를 제압하는 공격적 화술<br/>• 무대 위에서 빛나는 퍼포먼스 능력<br/>• 타인을 짓밟아 자존감을 채우는 독성 |

### Group D: Psychopathic Hybrids (사이코패시 주도, 3종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `PSYCH_MACH` | The Crisis Profiteer<br/>(위기 사냥꾼) | Psych > Mach | • 위기 상황에서 기회를 포착하는 감각<br/>• 두려움 없이 대담하게 행동하는 추진력<br/>• 혼돈 속에서 냉정함을 유지하는 능력<br/>• 타인의 불행을 이용하는 비윤리성 |
| `PSYCH_NARC` | The Chaos Performer<br/>(혼돈의 공연자) | Psych > Narc | • 독창적이고 파격적인 아이디어 생산<br/>• 어떤 상황에서도 주목받는 매력<br/>• 기존 질서를 파괴하는 혁신가 기질<br/>• 예측 불가능한 행동으로 신뢰 상실 위험 |
| `PSYCH_SAD` | The Wild Beast<br/>(야수) | Psych > Sad | • 원초적 본능에 충실한 순수한 힘<br/>• 두려움 없이 돌진하는 전투력<br/>• 극한 상황에서 발휘되는 생존 능력<br/>• 충동적 폭력성으로 범죄 위험 최고 수준 |

### Group E: Sadistic Hybrids (사디즘 주도, 3종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `SAD_MACH` | The Silent Predator<br/>(침묵의 포식자) | Sad > Mach | • 전략적 사고 + 냉혹한 실행력<br/>• 감정 없이 목표를 달성하는 효율성<br/>• 적을 완벽하게 제압하는 응징 능력<br/>• 타인의 고통을 즐기는 사디스트 성향 |
| `SAD_NARC` | The Cruel Judge<br/>(잔혹한 심판관) | Sad > Narc | • 강력한 도덕적 확신과 카리스마<br/>• 흐트러진 질서를 바로잡는 규율가<br/>• 타협 없는 원칙주의와 리더십<br/>• 자신의 기준으로 타인을 잔혹하게 심판 |
| `SAD_PSYCH` | The Blood Hunter<br/>(피의 사냥꾼) | Sad > Psych | • 극한 상황에서 발휘되는 원초적 힘<br/>• 두려움 없이 위험에 뛰어드는 용기<br/>• 생존 본능이 극대화된 전투 능력<br/>• 충동적 폭력으로 사회적 위험 최고 수준 |

### Group F: Special Types (특수형, 3종)

| ID | 이름 | 조건 | 핵심 특징 |
|----|------|------|----------|
| `DARK_APEX` | The Dark Apex<br/>(어둠의 정점) | 모든 특성 ≥ 75 | • 4가지 다크 특성 모두 극도로 높음<br/>• 감정에 휘둘리지 않고 목표를 향해 질주<br/>• 세상을 바꿀 힘을 가진 "초인" 타입<br/>• 인간성 결여로 주변을 황폐화할 위험 |
| `ALL_LOW` | The Clear Mirror<br/>(투명한 거울) | 최고점 < 50 | • 도덕적이고 이타적인 성향<br/>• 타인의 고통에 깊이 공감하는 능력<br/>• 신뢰할 수 있는 좋은 친구이자 동료<br/>• 자기 방어 무기가 없어 이용당할 위험 |
| `HYBRID_MID` | The Hybrid Chameleon<br/>(하이브리드 카멜레온) | 최고점 < 60 | • 어떤 성향도 극단적이지 않은 균형<br/>• 상황에 맞춰 유연하게 대응하는 적응력<br/>• 적을 만들지 않는 최고의 처세술<br/>• 뚜렷한 주관이 없어 신뢰 부족 위험 |

---

## 아키타입 콘텐츠 구조

각 아키타입은 다음 요소를 포함합니다:

```typescript
interface ArchetypeContent {
  name: string;              // 아키타입 이름 (예: "The Cold Architect (차가운 설계자)")
  headline: string;          // 한 줄 요약 (예: "감정이 제거된 완벽한 이성, 오직 효율만이 당신의 언어입니다.")
  highlights?: string[];     // 핵심 특징 3~5개 (불릿 포인트)
  goodReport: {
    title: string;           // Good Report 소제목
    content: string;         // Elite View 내용 (마크다운 지원)
  };
  badReport: {
    title: string;           // Bad Report 소제목
    content: string;         // Dark Nature 내용 (마크다운 지원)
  };
  advice: string;            // 전략적 조언
}
```

---

## 구현 파일

| 파일 | 역할 |
|------|------|
| `lib/mnps/dynamicProfileMatrix.ts` | 아키타입 결정 로직, 타입 정의, 디스플레이 매핑 |
| `lib/mnps/archetypeContent.ts` | 19종 아키타입별 상세 콘텐츠 (headline, highlights, reports, advice) |
| `lib/mnps/darkNatureScoring.ts` | 채점 엔진, `assembleReport`에서 아키타입 콘텐츠 통합 |
| `app/mnps/result/MnpsResultClient.tsx` | 결과 페이지 UI (headline, highlights 렌더링) |

---

## UI 표시

결과 페이지에서 아키타입 정보는 다음과 같이 표시됩니다:

1. **아키타입 이름**: 상단 요약 섹션
2. **Headline**: 이탤릭체 한 줄 요약
3. **핵심 특징 카드**: 회색 배경 카드에 불릿 리스트로 highlights 표시
4. **Elite View**: 에메랄드 그라데이션 + Trophy 아이콘 + Good Report (마크다운 파싱)
5. **Dark Nature**: 레드 그라데이션 + Skull 아이콘 + Bad Report (유료/베타 무료)

---

## 참고 문서

- `MNPS_TEST_OVERVIEW.md`: 전체 테스트 시스템 개요
- `MNPS_QUESTIONS_DATA.md`: 42문항 데이터 구조
- `MNPS_D_SCORE_CONFIG.md`: D-Total 계산 설정

---

*최종 업데이트: 2026-01-24*
