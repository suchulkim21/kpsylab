# 이미지 수동 다운로드 가이드

## 현재 상황
- 자동 다운로드 스크립트가 Unsplash Source API 503 에러로 실패
- Pexels/Unsplash API 키가 없어 자동 다운로드 불가

## 해결 방법

### 방법 1: Pexels에서 수동 다운로드 (권장)

1. **Pexels 접속**: https://www.pexels.com/
2. **검색 키워드 사용**: `docs/blog_image_keywords_100.md` 파일 참고
3. **이미지 선택 및 다운로드**
4. **파일명 변경**: 다운로드한 이미지를 다음 형식으로 저장
   - `topic_001.jpg` ~ `topic_100.jpg`
5. **저장 위치**: 
   ```
   C:\Projects\Pj-main\apps\portal\public\images\blog\
   ```

### 방법 2: Unsplash에서 수동 다운로드

1. **Unsplash 접속**: https://unsplash.com/
2. **검색 키워드 사용**: `docs/blog_image_keywords_100.md` 파일 참고
3. **이미지 선택 및 다운로드**
4. **파일명 변경**: 다운로드한 이미지를 다음 형식으로 저장
   - `topic_001.jpg` ~ `topic_100.jpg`
5. **저장 위치**: 
   ```
   C:\Projects\Pj-main\apps\portal\public\images\blog\
   ```

### 방법 3: API 키 발급 후 자동 다운로드

#### Pexels API 키 발급
1. https://www.pexels.com/api/new/ 접속
2. 무료 계정 생성
3. API 키 복사
4. `.env.local`에 추가:
   ```env
   PEXELS_API_KEY=your_api_key_here
   ```
5. 스크립트 실행:
   ```bash
   npx tsx scripts/download-blog-images-smart.ts --start 1 --end 100
   ```

#### Unsplash API 키 발급
1. https://unsplash.com/oauth/applications/new 접속
2. 애플리케이션 생성
3. Access Key 복사
4. `.env.local`에 추가:
   ```env
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```
5. 스크립트 실행:
   ```bash
   npx tsx scripts/download-blog-images-smart.ts --start 1 --end 100
   ```

## 빠른 복사 가이드

### Windows 탐색기에서
1. `C:\Projects\Pj-main\apps\portal\public\images\blog\` 폴더 열기
2. 다운로드한 이미지 파일들을 이 폴더로 복사
3. 파일명을 `topic_001.jpg`, `topic_002.jpg`, ... 형식으로 변경

### PowerShell에서
```powershell
# 다운로드 폴더에서 이미지 복사
Copy-Item "C:\Users\YourName\Downloads\image1.jpg" "C:\Projects\Pj-main\apps\portal\public\images\blog\topic_001.jpg"
Copy-Item "C:\Users\YourName\Downloads\image2.jpg" "C:\Projects\Pj-main\apps\portal\public\images\blog\topic_002.jpg"
# ... 반복
```

## 이미지 요구사항
- **형식**: JPG 권장
- **크기**: 1200x630px 이상 (Open Graph 최적화)
- **파일명**: `topic_001.jpg` ~ `topic_100.jpg` (3자리 숫자, 0으로 패딩)
- **저작권**: 저작권 없는 이미지만 사용

## 검색 키워드 참고
`docs/blog_image_keywords_100.md` 파일에 각 포스트별 검색 키워드가 정리되어 있습니다.
