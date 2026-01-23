# 접근성 (a11y) 가이드

## 구현된 접근성 기능

### 1. 스킵 링크
- **위치**: 페이지 상단 (키보드 포커스 시에만 표시)
- **기능**: Tab 키를 눌러 본문 콘텐츠로 바로 이동
- **사용법**: Tab 키 → "본문으로 건너뛰기" 링크 → Enter

### 2. 키보드 단축키
- **`/`**: 홈으로 이동 (GitHub 스타일)
- **`Ctrl/Cmd + K`**: 검색 (향후 구현 예정)
- **`Ctrl/Cmd + /`**: 도움말 표시
- **`Escape`**: 열린 모달 닫기

### 3. ARIA 레이블
- 모든 네비게이션에 `role="navigation"` 및 `aria-label`
- 에러 메시지에 `role="alert"` 및 `aria-live`
- 버튼에 `aria-label` 추가

### 4. 폼 접근성
- 모든 `input`과 `label` 연결 (`htmlFor`/`id`)
- 필수 필드에 `aria-required="true"`
- 에러 메시지에 `role="alert"`

### 5. 포커스 관리
- 모든 인터랙티브 요소에 포커스 스타일
- `:focus-visible` 사용 (마우스 클릭 시 포커스 링 제외)

### 6. 스크린 리더 지원
- 의미 있는 alt 텍스트
- 적절한 heading 계층 구조
- 스크린 리더 전용 텍스트 (`.sr-only`)

## 테스트

### 자동 테스트
```bash
npm run test:e2e -- e2e/accessibility.spec.ts
```

### 수동 테스트
1. **키보드만으로 네비게이션**: Tab, Shift+Tab, Enter, Space
2. **스크린 리더**: NVDA (Windows), VoiceOver (Mac), JAWS
3. **브라우저 확장 프로그램**: axe DevTools, WAVE

## WCAG 준수

이 프로젝트는 WCAG 2.1 Level AA를 목표로 합니다:
- ✅ 키보드 접근성
- ✅ 스크린 리더 지원
- ✅ 색상 대비 (다크 테마)
- ✅ 포커스 표시
- ✅ 에러 메시지 접근성

## 개선 사항

향후 추가 예정:
- [ ] 고대비 모드 지원
- [ ] 폰트 크기 조절 기능
- [ ] 다국어 지원 (i18n)
