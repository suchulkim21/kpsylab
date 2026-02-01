# 종합 진단 보고서 이슈 분석 및 수정 제안

## 개요

사용자 제출 종합 진단 보고서를 분석하여 발견된 문제점과 수정 방안을 정리합니다.

---

## 1. 긴급 수정 (Critical)

### 1.1 오타: "옥꣈습니다" → "옥죕니다"

**위치**: `lib/content/module2.ts` (HLA 유형, 방어 기제)

**현상**: "불안할수록 더 강하게 주변을 **옥꣈**습니다."  
→ 문자 `꣈`는 잘못된/깨진 문자로, `죕`(옥죄다: 옭죄다, 옭아매다)이어야 함.

**수정**: `옥꣈니다` → `옥죕니다`

---

### 1.2 3단계 플레이스홀더: "추가 재구성 분석 결과 8~16"

**위치**: `lib/module3/analysisEngine.ts`, `lib/content/module3.ts`

**현상**: 
- Module 3 엔진이 **16개** `ResultItem`을 강제 생성
- `generateModule3Content()`는 실제로 **3개** 블록만 반환
- `sections[3]` ~ `sections[15]`가 `undefined` → "추가 재구성 분석 결과 8" ~ "추가 재구성 분석 결과 16" 플레이스홀더가 표시됨

**원인**: 
```typescript
// module3/analysisEngine.ts
for (let i = 0; i < 16; i++) {
  const content = sections[i] ?? `추가 재구성 분석 결과 ${i + 1}`;
  // sections[3]~[15] = undefined → placeholder 사용
}
```

**수정 방안**:
1. **권장**: Module3Engine이 실제 콘텐츠 블록 수만큼만 ResultItem 생성
2. 또는: `generateModule3Content()`가 16개에 맞는 세분화된 블록을 반환하도록 확장

---

## 2. 구조적 개선 (Medium)

### 2.1 Module 3 콘텐츠 블록 구조

**현상**: `generateModule3Content()`가 `assembleParagraphs`로 3개 블록을 `\n\n`으로 합친 문자열을 반환하고, Module3Engine이 이를 다시 `\n\n`으로 split하여 사용. 블록 경계가 모호할 수 있음.

**제안**: 
- `generateModule3Content()`가 `ResultItem[]` 형태로 반환하도록 변경
- 또는 Module3Engine이 `generateModule3Content()` 반환값을 그대로 사용하고, 16개 고정 루프 제거

### 2.2 "재구성 분석 결과 3", "재구성 분석 결과 6", "재구성 분석 결과 7" 제목만 표시

**현상**:
- "재구성 분석 결과 3": `벡터 불일치 분석` (헤더만)
- "재구성 분석 결과 6": `전술적 행동 지침` (헤더만)
- 실제 내용은 다른 블록에 포함되어 있으나, split 로직상 별도 블록으로 분리됨

**원인**: `generateModule3Content()`의 블록 구조가 `**벡터 불일치 분석**\n\n본문...` 형태로, `\n\n` split 시 헤더와 본문이 분리될 수 있음.

**제안**: 콘텐츠 생성 시 헤더와 본문을 하나의 블록으로 유지하도록 구조 조정.

---

## 3. 검토 권장 (Low)

### 3.1 1단계 vs 2단계 데이터 일관성

**현상**:
- 1단계(심층 분석): **내면 결핍형(Type B)** — 의존적, 외로움, 타인의 인정 갈구
- 2단계(시나리오 분석): **통제형(HLA)** — 환경 통제, 독재자적 그림자, 주도권 중시

**판단**: 심리적으로 "내면의 결핍을 외부 통제로 보상"하는 패턴은 가능.  
다만 사용자에게 "왜 이 두 유형이 함께 나왔는지" 간단한 설명이 있으면 신뢰도 향상.

**제안**: CompositeAnalysisEngine 또는 최종 리포트에 "1·2단계 연계 해석" 문단 추가 검토.

### 3.2 "장애물 질문" 답변 부재

**현상**: "[내·외적 방해 요인] 장애물 질문"에 질문만 나열되고 사용자 답변이 없음.

**판단**: 현재 시스템이 해당 질문에 대한 답변을 수집하지 않는 구조라면,  
- 답변 수집 플로우 추가, 또는  
- "직접 기록해보세요" 등 안내 문구로 전환

---

## 4. 수정 체크리스트

| # | 항목 | 파일 | 우선순위 | 상태 |
|---|------|------|----------|------|
| 1 | `옥꣈니다` → `옥죕니다` 오타 수정 | `lib/content/module2.ts` | P0 | ✅ 완료 |
| 2 | Module3Engine 16개 강제 → 실제 블록 3개만 반환 | `lib/module3/analysisEngine.ts`, `lib/content/module3.ts` | P0 | ✅ 완료 |
| 3 | Module 3 콘텐츠 블록 분리 로직 정리 | `lib/content/module3.ts` | P1 | ✅ 완료 (generateModule3Items 추가) |
| 4 | 1·2단계 연계 해석 문단 추가 (선택) | `CompositeAnalysisEngine.ts` 등 | P2 | 미적용 |
| 5 | 장애물 질문 답변 수집 또는 안내 문구 (선택) | `lib/content/module1.ts` | P2 | 미적용 |

---

## 5. 참고: 현재 보고서 생성 흐름

```
CompositeAnalysisEngine
  ├─ Module1Engine (lib/module1/analysisEngine.ts)
  │    └─ generateSynthesizedItems() → lib/content/module1.ts (6개 블록)
  ├─ Module2Engine (lib/module2/analysisEngine.ts)
  │    └─ getModule2Content(typeCode) → lib/content/module2.ts (30개 항목)
  └─ Module3Engine (lib/module3/analysisEngine.ts)
       └─ generateModule3Content() → lib/content/module3.ts (3개 블록)
       └─ 16개 ResultItem 강제 생성 → 13개 placeholder 발생
```
