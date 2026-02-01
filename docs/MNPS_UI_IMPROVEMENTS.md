# MNPS 테스트·결과 페이지 UI 개선 사항

## 개요

MNPS **테스트 페이지**의 3단계 분할 진행·중간 피드백과 **결과 페이지**의 가독성·한글화를 포함한 UI 개선 사항을 정리합니다.

---

## 1. 테스트 페이지: 3단계 분할 진행(Phased Assessment)

### 1.1 단계 구분

| Phase | 문항 | 설명 |
|-------|------|------|
| **Phase 1** | Q1~Q14 | 기본 성향·자기 인식·권리 의식·도덕적 이탈 측정 |
| **Phase 2** | Q15~Q28 | 갈등·경쟁·사이코패시·사디즘·상황 시나리오·악의성 측정 |
| **Phase 3** | Q29~Q42 | 검증·일관성 쌍·심화 문항으로 신뢰도 보정 |

### 1.2 중간 휴식 화면(InterstitialView)

- **파일**: `app/mnps/test/InterstitialView.tsx`
- **표시 시점**: Q14·Q28 답변 직후. 다음 문항으로 넘어가지 않고 중간 화면 노출.
- **흐름**: 약 1.8초 "데이터 분석 중..." 로딩(회전 스피너) → 제목·부제·메시지(2~3문단)·"지금까지 감지된 것" 인사이트 3개·다음 단계 버튼.
- **메시지 변형**: Phase 1 종료 후 3종, Phase 2 종료 후 3종. 랜덤 선택으로 재방문 시 다른 문구 노출 가능.
- **디자인**: 카드형 레이아웃, cyan 포인트, Framer Motion(opacity·y) 전환, 버튼 호버/탭 스케일.

### 1.3 진행 표시

- **라벨**: "Step 1/3", "Step 2/3", "Step 3/3" (기존 42문항 % 대신 단계별 성취감).
- **진행 바**: 전체 42문항 기준 비율 유지. `motion.div`로 너비 애니메이션.
- **단계별 안내**: 1단계 "기본 성향 파악", 2단계 "심층 패턴 분석", 3단계 "마지막 확인".

### 1.4 기술 스택

- React State: `viewMode`(question | interstitial), `interstitialPhase`(1 | 2), `currentPhase`(1~3).
- Framer Motion: `AnimatePresence`, `motion.div`로 문항 ↔ 휴식 화면 전환.

---

## 2. 마크다운 파싱 지원

### 구현

**파일**: `lib/utils/parseMarkdown.tsx`

```typescript
// 지원 기능
- **bold** → <strong>볼드</strong>
- *italic* → <em>이탤릭</em>
- ### 헤딩 → <h4> 스타일링된 소제목
- \n\n → 단락 분리 (<p> 태그)
```

### 사용처

- Good Report (Elite View) 콘텐츠
- Bad Report (Dark Nature) 콘텐츠
- 모든 아키타입 콘텐츠의 goodReport.content, badReport.content

---

## 3. 아키타입 정보 표시

### 3.1 Headline (한 줄 요약)

```tsx
{profile.headline && (
  <p className="text-sm text-zinc-300 italic max-w-2xl mx-auto">
    {profile.headline}
  </p>
)}
```

**예시**:
- "감정이 제거된 완벽한 이성, 오직 효율만이 당신의 언어입니다." (MACH_PURE)
- "자신을 숭배하지 않는 세상은 당신에게 존재할 가치가 없습니다." (NARC_PURE)

### 3.2 Highlights (핵심 특징)

```tsx
{profile.highlights && profile.highlights.length > 0 && (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
    <h3 className="text-cyan-400">핵심 특징</h3>
    {renderHighlights(profile.highlights)}
  </div>
)}
```

**표시 형식**:
- 회색 배경 카드
- 사이안 색상 헤더
- 불릿 리스트 (• 기호)
- 3~5개 핵심 특징 요약

**예시** (MACH_PURE):
- • 위기 상황에서 가장 빛나는 "인간 AI" 타입
- • 감정 소모 없이 목표를 향해 직진
- • 비즈니스 협상·장기 전략에서 대체 불가능한 자산
- • 인간관계를 거래로 파악하는 치명적 결함 존재

---

## 4. 섹션별 디자인 개선

### 4.1 엘리트 뷰 (Good Report)

**변경 전**:
```tsx
<section className="bg-zinc-900 p-6 rounded-2xl mb-8 border border-zinc-800">
  <h2 className="text-xl font-semibold text-blue-400 mb-4">
    ✅ 긍정 해석 (엘리트 관점)
  </h2>
  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
    {profile.goodReport}
  </p>
</section>
```

**변경 후**:
```tsx
<section className="bg-gradient-to-br from-emerald-950/40 to-zinc-900 p-6 rounded-2xl mb-8 border border-emerald-800/50 shadow-lg shadow-emerald-900/10">
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 bg-emerald-900/60 rounded-lg">
      <Trophy className="w-5 h-5 text-emerald-400" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-emerald-300">
        Elite View
      </h2>
      <p className="text-xs text-emerald-400/70">당신의 강점을 엘리트 관점으로 해석합니다</p>
    </div>
  </div>
  <div className="text-zinc-300 text-sm leading-relaxed">
    {parseMarkdown(profile.goodReport)}
  </div>
</section>
```

**개선 사항**:
- 에메랄드 그라데이션 배경
- Trophy 아이콘 추가
- 섹션 설명 추가
- 마크다운 파싱 적용

### 4.2 어두운 이면 (Bad Report)

**변경 전**:
```tsx
<section className="border-red-900/30 bg-zinc-900 p-6">
  <h2 className="text-xl font-semibold text-red-500">
    💀 어두운 이면 (가공 없는 분석)
  </h2>
  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
    {profile.badTeaser}
  </p>
</section>
```

**변경 후**:
```tsx
<section className="border-red-800/60 bg-gradient-to-br from-red-950/50 to-zinc-950 shadow-lg shadow-red-900/30 p-6">
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 bg-red-900/60 rounded-lg">
      <Skull className="w-5 h-5 text-red-400" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-red-400">
        어두운 이면
      </h2>
      <p className="text-xs text-red-400/70">가공 없는 어두운 이면</p>
    </div>
  </div>
  <div className="p-4 bg-red-950/30 rounded-xl border border-red-900/20">
    <div className="text-zinc-300 text-sm leading-relaxed">
      {parseMarkdown(profile.badTeaser)}
    </div>
  </div>
</section>
```

**개선 사항**:
- 레드 그라데이션 배경
- Skull 아이콘 추가
- Bad Teaser를 별도 카드로 분리
- 마크다운 파싱 적용
- CTA 오버레이 디자인 개선 (Skull 아이콘 추가)

---

## 5. 색상 시스템

### 색상 팔레트

| 섹션 | 주요 색상 | 배경 | 테두리 |
|------|----------|------|--------|
| **엘리트 뷰** | Emerald (에메랄드) | `from-emerald-950/40 to-zinc-900` | `border-emerald-800/50` |
| **어두운 이면** | Red (레드) | `from-red-950/50 to-zinc-950` | `border-red-800/60` |
| **Highlights** | Cyan (사이안) | `bg-zinc-900/50` | `border-zinc-800` |
| **아키타입 이름** | Zinc-100 (밝은 회색) | - | - |
| **Headline** | Zinc-300 (중간 회색, 이탤릭) | - | - |

---

## 6. 아이콘 사용

**라이브러리**: `lucide-react`

| 아이콘 | 사용처 | 색상 |
|--------|--------|------|
| `Trophy` | 엘리트 뷰 섹션 헤더 | `text-emerald-400` |
| `Skull` | 어두운 이면 섹션 헤더 & CTA 오버레이 | `text-red-400` |

---

## 7. 데이터 흐름

```
darkNatureScoring.ts (assembleReport)
  ↓
  archetypeContent.ts (ARCHETYPE_CONTENT)
    ↓
    - headline
    - highlights
    - goodReport.content
    - badReport.content
  ↓
MnpsResultClient.tsx
  ↓
  parseMarkdown.tsx
    ↓
    - parseMarkdown() → JSX (bold, italic, 헤딩, 단락)
    - renderHighlights() → <ul> 불릿 리스트
```

---

## 8. 타입 정의

### AssembledReport

```typescript
export interface AssembledReport {
  totalDScore: number;
  archetype: string;
  headline?: string;        // 추가됨
  highlights?: string[];    // 추가됨
  goodReport: string;
  badTeaser: string;
  fullBadReport?: string;
}
```

### ArchetypeContent

```typescript
export interface ArchetypeContent {
  name: string;
  headline: string;
  highlights?: string[];    // 추가됨
  goodReport: {
    title: string;
    content: string;
  };
  badReport: {
    title: string;
    content: string;
  };
  advice: string;
}
```

---

## 8. 반응형 디자인

- **최대 너비**: `max-w-4xl mx-auto` (결과 페이지 전체)
- **Highlights 카드**: `max-w-2xl mx-auto` (중앙 정렬)
- **모바일 대응**: Tailwind의 기본 반응형 클래스 사용

---

## 10. 접근성 (Accessibility)

- **색상 대비**: WCAG AA 기준 충족
- **아이콘**: 텍스트와 함께 표시 (아이콘만으로 의미 전달 X)
- **Headline**: `italic` 스타일로 시각적 구분
- **Highlights**: 불릿 리스트로 구조화

---

## 11. 향후 개선 가능 사항

### 10.1 탭 UI (선택사항)

현재는 Good/Bad가 순차적으로 표시되지만, 콘텐츠가 길어질 경우 탭 UI로 전환 가능:

```tsx
<Tabs defaultValue="elite">
  <TabsList>
    <TabsTrigger value="elite">Elite View</TabsTrigger>
    <TabsTrigger value="dark">Dark Nature</TabsTrigger>
    <TabsTrigger value="advice">Advice</TabsTrigger>
  </TabsList>
  <TabsContent value="elite">{goodReport}</TabsContent>
  <TabsContent value="dark">{badReport}</TabsContent>
  <TabsContent value="advice">{advice}</TabsContent>
</Tabs>
```

### 10.2 애니메이션

- Framer Motion을 활용한 섹션 fade-in
- Highlights 불릿 포인트 순차 등장
- CTA 버튼 hover 효과 강화

### 10.3 공유 기능

- 결과 이미지 생성 (Canvas API)
- SNS 공유 버튼 (Twitter, Facebook, KakaoTalk)
- PDF 다운로드 (jsPDF)

---

## 참고 파일

| 파일 | 역할 |
|------|------|
| `lib/utils/parseMarkdown.tsx` | 마크다운 파싱 유틸리티 |
| `lib/mnps/archetypeContent.ts` | 19종 아키타입 콘텐츠 |
| `lib/mnps/darkNatureScoring.ts` | 채점 엔진 & assembleReport |
| `app/mnps/result/MnpsResultClient.tsx` | 결과 페이지 UI 컴포넌트 |

---

*최종 업데이트: 2026-01-24*
