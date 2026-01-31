# 블로그 이미지 다운로드 상태

## 📊 현재 상태

- **이미지 폴더**: `public/images/blog/` ✅ 존재
- **이미지 파일**: 0개 ❌
- **데이터베이스 경로**: 올바르게 저장됨 ✅
- **스크립트**: 준비 완료 ✅

## 🔧 사용 가능한 스크립트

### 1. `download-blog-images-smart.ts` (추천)
포스트 제목을 분석하여 주제에 맞는 키워드로 이미지를 검색합니다.

**우선순위**:
1. Pexels API (API 키 필요)
2. Unsplash 공식 API (API 키 필요)
3. Unsplash Source API (API 키 불필요, 불안정)

**사용법**:
```bash
# 전체 다운로드
npx tsx scripts/download-blog-images-smart.ts --start 1 --end 100

# 일부만 다운로드
npx tsx scripts/download-blog-images-smart.ts --start 1 --end 10
```

### 2. `download-blog-images.ts`
기본 키워드 목록을 순환하며 이미지를 다운로드합니다.

**사용법**:
```bash
npx tsx scripts/download-blog-images.ts --count 100
```

### 3. `download-single-image.ts`
단일 이미지를 다운로드합니다.

**사용법**:
```bash
npx tsx scripts/download-single-image.ts --topic "psychology" --index 1
```

## 🔑 API 키 설정 (선택 사항)

더 안정적이고 고품질의 이미지를 얻으려면 API 키를 설정하세요.

### Pexels API 키 발급
1. https://www.pexels.com/api/new/ 접속
2. 무료 계정 생성
3. API 키 복사
4. `.env.local`에 추가:
   ```env
   PEXELS_API_KEY=your_api_key_here
   ```

### Unsplash API 키 발급
1. https://unsplash.com/oauth/applications/new 접속
2. 애플리케이션 생성
3. Access Key 복사
4. `.env.local`에 추가:
   ```env
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

## ⚠️ 문제 해결

### Unsplash Source API 503 에러
- **원인**: 서비스 일시 중단 또는 rate limit
- **해결**: Pexels API 또는 Unsplash 공식 API 사용 권장

### 이미지 다운로드 실패
- **원인**: 네트워크 문제 또는 API rate limit
- **해결**: 
  1. 잠시 후 재시도
  2. API 키 설정 후 재시도
  3. 수동 다운로드 고려

## 📝 다음 단계

1. **API 키 설정** (선택): 더 안정적인 다운로드를 위해
2. **이미지 다운로드 실행**: 위 스크립트 중 하나 선택
3. **이미지 확인**: `public/images/blog/` 폴더에 파일이 생성되었는지 확인
4. **웹사이트 확인**: 이미지가 올바르게 표시되는지 확인
