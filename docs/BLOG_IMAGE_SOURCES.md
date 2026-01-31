# 블로그 포스트 이미지 소스 가이드

## 📸 저작권 없는 이미지 소스

### 1. Pexels (추천)
- **URL**: https://www.pexels.com/
- **API**: https://www.pexels.com/api/
- **특징**: 
  - 무료, 고품질 이미지
  - API 키 필요 (무료)
  - 심리학, 성장, 웰니스 관련 이미지 풍부
- **API 키 발급**: https://www.pexels.com/api/new/

### 2. Unsplash
- **URL**: https://unsplash.com/
- **API**: https://unsplash.com/developers
- **특징**:
  - 무료, 고품질 이미지
  - API 키 필요 (무료)
  - Source API는 불안정할 수 있음 (503 에러 가능)
- **API 키 발급**: https://unsplash.com/oauth/applications/new

### 3. Pixabay
- **URL**: https://pixabay.com/
- **API**: https://pixabay.com/api/docs/
- **특징**:
  - 무료, 고품질 이미지
  - API 키 필요 (무료)
  - 다양한 카테고리

## 🔑 API 키 설정

`.env.local` 파일에 추가:

```env
PEXELS_API_KEY=your_pexels_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

## 📝 포스트 주제별 추천 키워드

### 자아 인식, 무의식
- `mind consciousness psychology`
- `self-reflection meditation`
- `brain thinking`

### 자존감, 완벽주의
- `self-esteem confidence`
- `personal growth`
- `self-acceptance`

### 습관, 생산성
- `habits productivity`
- `routine organization`
- `time management`

### 관계, 소통
- `relationship connection`
- `communication teamwork`
- `people together`

### 감정 관리
- `emotion regulation`
- `mental health wellness`
- `calm peace mindfulness`

### 직장 심리
- `workplace office`
- `leadership business`
- `work-life balance`

### 성장, 잠재력
- `growth development`
- `success achievement`
- `motivation inspiration`

## 🖼️ 이미지 다운로드 방법

### 방법 1: Pexels API 사용 (권장)

1. Pexels에서 API 키 발급
2. `.env.local`에 `PEXELS_API_KEY` 추가
3. 스크립트 실행:

```bash
npx tsx scripts/download-blog-images-smart.ts --start 1 --end 100
```

### 방법 2: 수동 다운로드

1. 위 추천 키워드로 각 이미지 사이트에서 검색
2. 적합한 이미지 선택 및 다운로드
3. `public/images/blog/` 폴더에 `topic_001.jpg` ~ `topic_100.jpg` 형식으로 저장

### 방법 3: Unsplash 공식 API 사용

1. Unsplash에서 API 키 발급
2. `.env.local`에 `UNSPLASH_ACCESS_KEY` 추가
3. 스크립트 수정하여 Unsplash API 사용

## ⚠️ 주의사항

1. **저작권**: 모든 이미지는 저작권 프리이지만, 일부는 출처 표기 필요
2. **이미지 크기**: 권장 크기 1200x630px (Open Graph 최적화)
3. **파일 형식**: JPG 권장 (용량 최적화)
4. **파일명**: `topic_001.jpg` ~ `topic_100.jpg` 형식 유지

## 📊 현재 상태

- **이미지 폴더**: `public/images/blog/` ✅
- **이미지 파일**: 0개 ❌
- **데이터베이스 경로**: 올바르게 저장됨 ✅
