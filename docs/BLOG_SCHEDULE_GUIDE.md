# 📅 블로그 콘텐츠 일정 관리 가이드

블로그 포스트 발행 일정을 체계적으로 관리하는 방법을 안내합니다.

## 🎯 기능 개요

- **일정 생성**: 주제, 카테고리, 발행일 설정
- **상태 관리**: 초안 → 예약됨 → 진행 중 → 발행됨
- **우선순위 설정**: 높음, 중간, 낮음
- **필터링**: 상태, 카테고리, 날짜별 필터
- **일정 수정/삭제**: 유연한 일정 관리

## 📊 데이터베이스 설정

먼저 Supabase에서 일정 관리 테이블을 생성해야 합니다.

### SQL 실행

Supabase SQL Editor에서 다음 파일의 내용을 실행하세요:

```
lib/db/blog-content-schedule.sql
```

또는 직접 실행:

```sql
-- 콘텐츠 일정 테이블
CREATE TABLE IF NOT EXISTS blog_content_schedule (
  id BIGSERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'published', 'cancelled')),
  scheduled_date DATE,
  publish_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_post_id BIGINT REFERENCES blog_posts(id) ON DELETE SET NULL
);

-- 인덱스 및 RLS 정책은 SQL 파일 참조
```

## 🖥️ 사용 방법

### 관리자 대시보드에서 접근

1. `/admin/dashboard` 접속
2. 관리자 키 입력
3. "콘텐츠 일정 관리" 섹션 확인

### 일정 추가

1. "새 일정 추가" 버튼 클릭
2. 다음 정보 입력:
   - **주제** (필수): 블로그 포스트 주제
   - **카테고리**: 주제 카테고리
   - **상태**: 초안, 예약됨, 진행 중, 발행됨, 취소됨
   - **예약일**: 발행 예정일
   - **우선순위**: 높음, 중간, 낮음
   - **담당자**: 담당자 이름
   - **메모**: 추가 메모
3. "생성" 버튼 클릭

### 일정 수정

1. 일정 목록에서 수정할 항목의 "수정" 아이콘 클릭
2. 정보 수정
3. "수정" 버튼 클릭

### 일정 삭제

1. 일정 목록에서 삭제할 항목의 "삭제" 아이콘 클릭
2. 확인 대화상자에서 확인

### 필터링

- **상태별**: 초안, 예약됨, 진행 중, 발행됨, 취소됨
- **카테고리별**: 카테고리명으로 필터
- **날짜 범위**: 시작일 ~ 종료일

## 📡 API 엔드포인트

### GET `/api/admin/blog/schedule`

일정 목록 조회

**쿼리 파라미터:**
- `status`: 상태 필터
- `category`: 카테고리 필터
- `startDate`: 시작일
- `endDate`: 종료일

**예시:**
```bash
curl -X GET "https://www.kpsylab.com/api/admin/blog/schedule?status=scheduled" \
  -H "x-admin-key: YOUR_ADMIN_SECRET"
```

### POST `/api/admin/blog/schedule`

새 일정 생성

**요청 본문:**
```json
{
  "topic": "주제",
  "category": "카테고리",
  "status": "draft",
  "scheduled_date": "2025-01-20",
  "priority": "medium",
  "notes": "메모",
  "assigned_to": "담당자"
}
```

### GET `/api/admin/blog/schedule/[id]`

단일 일정 조회

### PUT `/api/admin/blog/schedule/[id]`

일정 수정

### DELETE `/api/admin/blog/schedule/[id]`

일정 삭제

## 🔄 상태 워크플로우

```
초안 (draft)
  ↓
예약됨 (scheduled)
  ↓
진행 중 (in_progress)
  ↓
발행됨 (published)
```

또는

```
초안/예약됨/진행 중
  ↓
취소됨 (cancelled)
```

## 💡 활용 팁

1. **주제 리스트 활용**: `lib/db/blog_topics.md`의 120개 주제를 일정으로 등록
2. **주 2-3회 발행**: 화요일, 목요일, 토요일 등 정기 발행일 설정
3. **우선순위 관리**: 중요한 주제는 높은 우선순위로 설정
4. **카테고리 균형**: 각 카테고리별로 균등하게 배분
5. **발행 후 연결**: `published_post_id`에 실제 포스트 ID 연결

## 🔗 연동

### AI 콘텐츠 생성과 연동

일정의 주제를 기반으로 AI 콘텐츠를 자동 생성할 수 있습니다:

```typescript
// 일정의 주제로 콘텐츠 생성
const schedule = await getSchedule(id);
const post = await generateBlogContent({
  topic: schedule.topic,
  category: schedule.category,
});
```

### 발행 자동화

예약된 일정을 자동으로 발행하는 스크립트를 만들 수 있습니다:

```typescript
// 매일 실행되는 크론 작업
const scheduledPosts = await getScheduledPosts(today);
for (const schedule of scheduledPosts) {
  await publishPost(schedule);
  await updateScheduleStatus(schedule.id, 'published');
}
```

## 📝 참고 자료

- [블로그 콘텐츠 생성 가이드](./BLOG_CONTENT_GENERATION_GUIDE.md)
- [블로그 포스트 작성 가이드](../lib/db/BLOG_POST_FORMAT_GUIDE.md)
- [블로그 주제 리스트](../lib/db/blog_topics.md)
