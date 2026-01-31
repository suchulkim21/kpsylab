# 📝 블로그 콘텐츠 생성 가이드

AI를 사용하여 블로그 포스트를 자동으로 생성하는 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일에 AI API 키를 추가하세요:

```bash
# OpenAI 사용 시
OPENAI_API_KEY=sk-...

# 또는 Anthropic Claude 사용 시
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. 스크립트로 생성

#### 단일 주제 생성
```bash
npx tsx scripts/generate-blog-content.ts --topic "왜 우리는 같은 실수를 반복하는가"
```

#### 카테고리 지정
```bash
npx tsx scripts/generate-blog-content.ts --topic "나르시시즘의 두 얼굴" --category "자아 인식과 무의식"
```

#### 파일에서 여러 주제 생성
```bash
npx tsx scripts/generate-blog-content.ts --file lib/db/blog_topics.md --count 5
```

### 3. API로 생성 (관리자)

#### 콘텐츠 생성 (미리보기)
```bash
curl -X POST https://www.kpsylab.com/api/admin/blog/generate \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_SECRET" \
  -d '{
    "topic": "왜 우리는 같은 실수를 반복하는가",
    "category": "자아 인식과 무의식",
    "targetLength": 3000,
    "style": "professional"
  }'
```

#### 저장
```bash
curl -X POST https://www.kpsylab.com/api/admin/blog/save \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_SECRET" \
  -d '{
    "title": "포스트 제목",
    "content": "<h3>...</h3><p>...</p>",
    "author": "KPSY LAB",
    "date": "2025-01-17",
    "tags": "태그1,태그2,태그3"
  }'
```

## 📋 API 엔드포인트

### POST `/api/admin/blog/generate`

AI를 사용하여 블로그 포스트를 생성합니다 (저장하지 않음).

**요청 헤더:**
- `x-admin-key`: 관리자 시크릿 키

**요청 본문:**
```json
{
  "topic": "주제",
  "category": "카테고리 (선택)",
  "targetLength": 3000,
  "style": "professional" | "casual",
  "includeExamples": true
}
```

**응답:**
```json
{
  "success": true,
  "post": {
    "title": "포스트 제목",
    "content": "<h3>...</h3><p>...</p>",
    "author": "KPSY LAB",
    "date": "2025-01-17",
    "tags": "태그1,태그2"
  },
  "quality": {
    "wordCount": 3500,
    "htmlValid": true,
    "hasRequiredTags": true,
    "minLengthMet": true,
    "similarity": 15.2,
    "issues": []
  }
}
```

### POST `/api/admin/blog/save`

생성된 블로그 포스트를 Supabase에 저장합니다.

**요청 헤더:**
- `x-admin-key`: 관리자 시크릿 키

**요청 본문:**
```json
{
  "title": "포스트 제목",
  "content": "<h3>...</h3><p>...</p>",
  "author": "KPSY LAB",
  "date": "2025-01-17",
  "tags": "태그1,태그2",
  "image": "/images/blog/topic_001.jpg",
  "force": false
}
```

**응답:**
```json
{
  "success": true,
  "message": "Post saved successfully",
  "quality": {
    "wordCount": 3500,
    "htmlValid": true,
    "hasRequiredTags": true,
    "minLengthMet": true,
    "issues": []
  }
}
```

## 🔍 품질 검증

생성된 콘텐츠는 자동으로 다음 항목을 검증합니다:

1. **길이**: 최소 3000자 이상
2. **HTML 유효성**: 허용된 태그만 사용 (h3, p, ul, ol, li, strong, blockquote 등)
3. **필수 태그**: h3, p 태그 최소 1개씩 포함
4. **유사도**: 기존 포스트와 20% 미만 유사도 권장

## 🛠️ 유틸리티 함수

### `generatePrompt(config)`

AI 프롬프트를 생성합니다.

```typescript
import { generatePrompt } from '@/lib/utils/blogContentGenerator';

const prompt = generatePrompt({
  topic: '주제',
  category: '카테고리',
  targetLength: 3000,
  style: 'professional',
  includeExamples: true,
});
```

### `validateContentQuality(post)`

콘텐츠 품질을 검증합니다.

```typescript
import { validateContentQuality } from '@/lib/utils/blogContentGenerator';

const quality = validateContentQuality({
  title: '제목',
  content: '<h3>...</h3><p>...</p>',
  author: '작성자',
  date: '2025-01-17',
  tags: '태그1,태그2',
});

if (quality.issues.length > 0) {
  console.warn('품질 문제:', quality.issues);
}
```

### `checkSimilarity(content, existingContents)`

기존 콘텐츠와의 유사도를 계산합니다.

```typescript
import { checkSimilarity } from '@/lib/utils/blogContentGenerator';

const similarity = checkSimilarity(
  newContent,
  existingContents
);

if (similarity > 20) {
  console.warn(`유사도가 높습니다: ${similarity}%`);
}
```

## 📝 주의사항

1. **API 비용**: AI API 호출 시 비용이 발생할 수 있습니다.
2. **Rate Limit**: API 호출 간 1초 이상 대기 권장
3. **품질 검증**: 생성된 콘텐츠는 반드시 검토 후 저장하세요
4. **중복 제거**: 제목 중복은 자동으로 제거되지만, 내용 유사도는 수동 확인 필요

## 🔧 문제 해결

### API 키 오류
```
❌ AI API 키가 설정되지 않았습니다.
```
→ `.env.local`에 `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` 설정

### 품질 검증 실패
```
⚠️ 품질 검증 경고:
   - 콘텐츠 길이가 너무 짧습니다 (2500자 / 최소 3000자)
```
→ `targetLength`를 늘리거나 `force: true`로 저장

### 유사도 경고
```
⚠️ 유사도가 높습니다: 25.3% (권장: 20% 미만)
```
→ 콘텐츠를 수정하거나 다른 주제로 재생성

## 📚 참고 자료

- [블로그 포스트 작성 가이드](../lib/db/BLOG_POST_FORMAT_GUIDE.md)
- [블로그 주제 리스트](../lib/db/blog_topics.md)
- [블로그 콘텐츠 개발 연구](./BLOG_CONTENT_DEVELOPMENT_RESEARCH.md)
