# 핵심 타입·스키마 참조

**문서 성격**: Portal 앱에서 **핵심 타입·인터페이스·스키마**를 코드 밖에서 요약한 참조.  
**참조**: [PROJECT_PHILOSOPHY.md](./PROJECT_PHILOSOPHY.md)(맥락 우선주의), MNPS_TEST_OVERVIEW, `types/report.ts`, `lib/adapters/report-adapter.ts`

---

## 1. 통합 리포트 (UnifiedReportData)

**위치**: `types/report.ts`

MNPS, 마인드 아키텍터 M1/M2/M3 등 **모든 분석 결과가 최종적으로 변환되는 공통 형태**이다.  
“맥락적 존재”의 **연결성** 원칙에 따라, 서로 다른 모듈 결과를 **같은 블록 구조**로 표현해 관계·질서를 드러낸다.

| 필드 | 타입 | 설명 |
|------|------|------|
| theme | `"cyan" \| "purple"` | cyan=MNPS, purple=마인드 아키텍터 |
| moduleTitle | string | 예: "시스템 병목 분석 (마인드 아키텍터 M1)" |
| coreTypeTitle | string | 예: "완벽주의적 통제형" |
| summary | string | 한 줄 요약 |
| detailText | string | 상세 설명 |
| totalScore | number | 0~100 종합 점수 |
| chartData | ChartData[] | 차트용 { label, value } 배열 |
| advice | AdviceItem? | 제안·솔루션 (title, todos) |
| rarityBadge | string? | 예: "상위 3% 전략가 유형" |
| conflictInsight | string? | 모듈 간 충돌 시 심리적 역동 인사이트 |
| scriptureLog | string? | 나만의 심리 지도 문장형 로그 |
| journeySummary | string? | 여정 서사 |
| syncPercentage | number? | 마스터 벡터 동기화율 (0–100) |

---

## 2. 리포트 어댑터 (report-adapter)

**위치**: `lib/adapters/report-adapter.ts`

각 모듈의 **원시 결과**를 `UnifiedReportData`로 변환한다.  
**Context-Aware**: `masterVector`, M2 데이터, 일관성 점수 등 **맥락**을 받아 동적 뉘앙스를 적용한다.

| 함수 | 입력 | 출력 | 용도 |
|------|------|------|------|
| adaptModule1 | M1 원시 데이터 + AdaptModule1Context | UnifiedReportData | 마인드 아키텍터 M1 → 통합 리포트 |
| adaptModule2 | M2 원시 데이터 + context | UnifiedReportData | M2 아키타입·점수 → 통합 리포트 |
| adaptMnps | MNPS 결과 스냅샷 + context | UnifiedReportData | MNPS 아키타입·D점수·리포트 → 통합 리포트 |

**AdaptModule1Context**: masterVector, m2Data, consistencyScore, anomaly, dynamicsNarrative, m1/m2/m3 타임스탬프, moduleHistory 등.  
“왜 이 구조인가”: 여러 모듈을 **같은 도면(UnifiedReportData)**으로 맞추어, 최종 통합 리포트에서 **관계·순서**를 일관되게 보여 주기 위함.

---

## 3. MNPS 결과 스키마 (클라이언트·API)

**결과 페이지 타입** (MnpsResultClient 등): `MnpsResultData`

| 필드 | 타입 | 설명 |
|------|------|------|
| archetype | string? | 아키타입 라벨 |
| dTotal | number? | D-Total (0~100 표시용) |
| rawDTotal | number? | 비선형 매핑 전 원점수 |
| isExtremeTop | boolean? | 상위 극단 구간 플래그 |
| traitScores | { machiavellianism?, narcissism?, psychopathy?, sadism? } | 4특성 0~100 |
| analysisAccuracy | number? | 50~99 분석 정확도 |
| responseTimePenalty | boolean? | 응답 시간 페널티 적용 여부 |
| insincereResponsePattern | boolean? | 불성실 응답 의심 |
| percentileAtCreation | number? | 생성 시 백분위 |
| goodReport / badReport | string \| null? | Good/Bad 리포트 마크다운 |
| badTeaser | string \| null? | Bad 미리보기 |
| radarChartData | { label?, value? }[] \| null? | 레이더 차트용 |

**DB·API**: `results_metadata.result_snapshot`(JSONB)에 위와 유사한 구조가 저장된다.  
OG 이미지 API는 `result_snapshot`에서 archetype, traitScores, percentile_at_creation을 읽어 동적 이미지를 만든다.

---

## 4. 심리 지도·심리맵 (psychologicalMap)

**위치**: `lib/services/psychologicalMap.ts` (report-adapter에서 import)

**역할**: “나만의 심리 지도”용 **문장형 로그(scriptureLog)** 생성.  
모듈 이력·타입·궤적을 입력받아, **연결성** 원칙에 맞는 서사형 문장을 만든다.  
report-adapter의 `UnifiedReportData.scriptureLog`에 주입된다.

---

## 5. 관련 문서

| 문서 | 용도 |
|------|------|
| [MNPS_TEST_OVERVIEW.md](./MNPS_TEST_OVERVIEW.md) | MNPS 문항·채점·리포트·DB 스키마 상세 |
| [PHILOSOPHY_UI_MAPPING.md](./PHILOSOPHY_UI_MAPPING.md) | UI·결과 표현과 “맥락적 존재” 매핑 |
| `types/report.ts` | UnifiedReportData, ChartData, AdviceItem 정의 |

---

*타입·스키마 변경 시 본 참조를 갱신하는 것을 권장합니다.*
