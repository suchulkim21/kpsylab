# 블로그 이미지 다운로드 가이드

## 📸 저작권 없는 이미지 사용

블로그 포스트에 사용할 이미지는 **저작권 없는 이미지**를 다운로드하여 로컬에 저장합니다.

## 🎯 이미지 소스

### 1. Unsplash Source API (기본, API 키 불필요)
- 무료 사용 가능
- 저작권 없음
- API 키 불필요
- `https://source.unsplash.com/` 사용

### 2. Pexels API (선택사항, 더 안정적)
- 무료 사용 가능
- 저작권 없음
- API 키 필요 (선택사항)
- 더 안정적인 이미지 제공

## 📥 이미지 다운로드 방법

### 방법 1: 자동 다운로드 (권장)
블로그 포스트 작성 시 "랜덤 생성" 버튼을 클릭하면:
1. 이미지 경로가 자동 생성됨
2. 이미지가 자동으로 다운로드됨
3. `/public/images/blog/topic_XXX.jpg`에 저장됨

### 방법 2: 스크립트로 일괄 다운로드
```bash
# 120개 이미지 일괄 다운로드
npx tsx scripts/download-blog-images.ts --count 120

# 특정 주제로 이미지 다운로드
npx tsx scripts/download-single-image.ts --topic "psychology" --index 1
```

### 방법 3: API 엔드포인트 사용
```bash
# 관리자 키와 함께 요청
curl -H "x-admin-key: YOUR_ADMIN_KEY" \
  "http://localhost:7777/api/admin/blog/download-image?index=1&topic=psychology"
```

## 🔑 Pexels API 키 설정 (선택사항)

더 안정적인 이미지를 원한다면 Pexels API 키를 설정하세요:

1. [Pexels](https://www.pexels.com/api/)에서 무료 API 키 발급
2. `.env.local`에 추가:
   ```
   PEXELS_API_KEY=your_pexels_api_key_here
   ```

## 📁 이미지 저장 위치

```
public/
  images/
    blog/
      topic_001.jpg
      topic_002.jpg
      ...
      topic_120.jpg
```

## 🎨 이미지 규격

- **크기**: 1200x630px (가로형)
- **형식**: JPG
- **용도**: 블로그 썸네일, Open Graph 이미지

## 🔍 키워드 자동 변환

한국어 주제가 자동으로 영어 키워드로 변환됩니다:

- 심리학 → psychology
- 무의식 → unconscious
- 습관 → habit
- 변화 → change
- 성장 → growth
- 관계 → relationship
- 감정 → emotion
- 등등...

## ⚠️ 주의사항

1. **이미지 다운로드 시간**: 이미지당 약 1-3초 소요
2. **Rate Limit**: Unsplash Source API는 rate limit이 있을 수 있음
3. **파일 크기**: 다운로드된 파일이 10KB 미만이면 실패로 간주
4. **중복 다운로드 방지**: 이미 존재하는 이미지는 다시 다운로드하지 않음

## 🚀 사용 예시

### 블로그 포스트 작성 시
1. 관리자 대시보드에서 "새 포스트 작성"
2. "랜덤 생성" 버튼 클릭
3. 이미지가 자동으로 다운로드되고 경로가 설정됨
4. 저장 시 이미지가 함께 저장됨

### 수동으로 이미지 다운로드
```bash
# 특정 인덱스의 이미지 다운로드
npx tsx scripts/download-single-image.ts --index 42 --topic "mindfulness"
```

## 📝 이미지 사용 라이선스

- **Unsplash**: Unsplash License (무료, 상업적 사용 가능, 저작권 표시 불필요)
- **Pexels**: Pexels License (무료, 상업적 사용 가능, 저작권 표시 불필요)

두 서비스 모두 완전히 무료이며 상업적 사용이 가능합니다.

---

**작성일**: 2025년 1월
