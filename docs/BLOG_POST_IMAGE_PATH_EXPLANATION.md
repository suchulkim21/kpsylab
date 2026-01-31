# 블로그 포스트 이미지 경로 설명

## 이미지 경로 형식

현재 사용 중인 이미지 경로 형식: `/images/blog/topic_XXX.jpg`

### 이것은 웹 서비스 내부 경로입니다

**중요**: `/images/blog/topic_001.jpg` 형식은 **웹 서비스 내부 경로**를 의미합니다.

### 경로 해석

1. **Next.js의 `public` 폴더 기준**
   - Next.js는 `public` 폴더의 내용을 웹 루트(`/`)로 제공합니다
   - `/images/blog/topic_001.jpg`는 실제로 `public/images/blog/topic_001.jpg` 파일을 가리킵니다

2. **코드에서의 처리**
   - `app/blog/[id]/page.tsx`의 41-46번 줄:
     ```typescript
     if (!image.startsWith('/images/blog/')) {
       // 자동으로 /images/blog/topic_XXX.jpg 형식으로 변환
     }
     ```
   - 72-74번 줄:
     ```typescript
     const imageUrl = post.image.startsWith('http') 
       ? post.image  // 외부 링크 (http/https로 시작)
       : `${process.env.NEXT_PUBLIC_SITE_URL}${post.image}`; // 내부 경로
     ```

3. **현재 상태**
   - `public/images/blog/` 폴더가 비어있음
   - 이미지 파일을 다운로드해야 함

### 외부 링크 vs 내부 경로

- **외부 링크**: `https://example.com/image.jpg` (http/https로 시작)
- **내부 경로**: `/images/blog/topic_001.jpg` (슬래시로 시작, public 폴더 기준)

### 이미지 다운로드 필요

현재 100개의 블로그 포스트가 있지만, 실제 이미지 파일은 없습니다. 다음 중 하나를 실행해야 합니다:

1. **일괄 다운로드**:
   ```bash
   npx tsx scripts/download-blog-images.ts --count 100
   ```

2. **개별 다운로드**:
   ```bash
   npx tsx scripts/download-single-image.ts --index 1 --topic "psychology"
   ```

3. **관리자 대시보드에서**:
   - "새 포스트 작성" → "랜덤 생성" 버튼 클릭 시 자동 다운로드

### 이미지 저장 위치

```
public/
  images/
    blog/
      topic_001.jpg
      topic_002.jpg
      ...
      topic_100.jpg
```

### 요약

- ✅ **현재 형식**: `/images/blog/topic_XXX.jpg` = 웹 서비스 내부 경로
- ✅ **실제 위치**: `public/images/blog/topic_XXX.jpg`
- ⚠️ **현재 상태**: 이미지 파일이 없음 (다운로드 필요)
- ✅ **지원 형식**: 외부 링크(http/https)도 가능하지만, 현재는 내부 경로 사용
